/**
 * Roamly Travel Recommendation Engine
 * 
 * Generates, scores, and ranks travel options based on user preferences
 * Includes airline data, baggage costs, hotel estimates, and AI-powered explanations
 */

import {
  ConstraintMatchItem,
  ConstraintMatchSummary,
  CostLineItem,
  FlightOption,
  FlightSegment,
  TotalCostEstimate,
  TravelRecommendation,
  TravelScore,
  TripPreferences,
} from '@/types'

// ===== MOCK DATA =====

const AIRLINES = [
  { code: 'UA', name: 'United Airlines', reliability: 0.91, basePriceMultiplier: 1.0 },
  { code: 'DL', name: 'Delta', reliability: 0.93, basePriceMultiplier: 1.05 },
  { code: 'AA', name: 'American Airlines', reliability: 0.89, basePriceMultiplier: 0.95 },
  { code: 'WN', name: 'Southwest', reliability: 0.87, basePriceMultiplier: 0.85 },
  { code: 'B6', name: 'JetBlue', reliability: 0.90, basePriceMultiplier: 0.98 },
  { code: 'AS', name: 'Alaska Airlines', reliability: 0.92, basePriceMultiplier: 1.0 },
]

const HUB_AIRPORTS = ['ATL', 'DFW', 'ORD', 'DEN', 'LAX', 'SEA', 'CLT']

const BAGGAGE_COSTS = {
  carryOn: 0, // Usually free
  firstChecked: 35,
  secondChecked: 45
}
const AIRLINES_WITH_INCLUDED_CHECKED_BAG = new Set(['Southwest'])

// ===== MAIN RECOMMENDATION ENGINE =====

/**
 * Generate travel recommendations based on preferences
 * Returns a ranked list of options with scores and explanations
 */
export function generateRecommendations(preferences: TripPreferences): TravelRecommendation[] {
  // Step 1: Generate flight options
  const flightOptions = generateFlightOptions(preferences)
  return rankAndExplainRecommendations(flightOptions, preferences)
}

/**
 * Rank and explain externally provided flight options (e.g. Duffel API).
 */
export function rankAndExplainRecommendations(
  flightOptions: FlightOption[],
  preferences: TripPreferences
): TravelRecommendation[] {
  
  // Step 2: Score each option
  const recommendations: TravelRecommendation[] = flightOptions.map(flight => {
    const constraintMatch = evaluateConstraintMatch(flight, preferences)
    const score = calculateScore(flight, preferences)
    const explanation = generateExplanation(flight, score, preferences, constraintMatch)
    const tags = generateTags(flight, score, preferences, constraintMatch)
    
    return {
      flight,
      score,
      constraintMatch,
      tags,
      aiSummary: explanation,
      alternativeOptions: []
    }
  })
  
  // Step 3: Sort by match quality first, then overall score
  const sorted = recommendations.sort((a, b) => {
    const fullMatchDelta = Number(b.constraintMatch.isFullMatch) - Number(a.constraintMatch.isFullMatch)
    if (fullMatchDelta !== 0) return fullMatchDelta
    return b.score.overall - a.score.overall
  })
  
  // Step 4: Add hotel estimates if needed
  if (preferences.preferences.hotelNeeded && preferences.returnDate) {
    return sorted.map(rec => addHotelEstimate(rec, preferences))
  }
  
  return sorted
}

// ===== FLIGHT GENERATION =====

/**
 * Generate realistic flight options based on user preferences
 */
function generateFlightOptions(preferences: TripPreferences): FlightOption[] {
  const flights: FlightOption[] = []
  const origin = normalizeAirportCode(preferences.origin)
  const destination = normalizeAirportCode(preferences.destination)
  
  // Determine number of options (fewer if nonstop only)
  const numOptions = preferences.preferences.nonstopOnly ? 3 : 6
  
  for (let i = 0; i < numOptions; i++) {
    const airline = AIRLINES[i % AIRLINES.length]
    const isNonstop = i < 2 || preferences.preferences.nonstopOnly
    
    const flight = generateSingleFlight(
      origin,
      destination,
      preferences.departureDate,
      airline,
      isNonstop,
      preferences,
      i
    )
    
    flights.push(flight)
  }
  
  return flights
}

/**
 * Generate a single flight option with realistic data
 */
function generateSingleFlight(
  origin: string,
  destination: string,
  departureDate: string,
  airline: typeof AIRLINES[0],
  isNonstop: boolean,
  preferences: TripPreferences,
  index: number
): FlightOption {
  const segments: FlightSegment[] = []
  const includesCheckedBag = AIRLINES_WITH_INCLUDED_CHECKED_BAG.has(airline.name)
  
  // Determine departure time based on preferences or default
  const timePrefs = preferences.preferences.departureTimePreferences
  const timeCategory = timePrefs.length > 0 ? timePrefs[index % timePrefs.length] : ['morning', 'afternoon', 'evening'][index % 3]
  const departureTime = generateDepartureTime(departureDate, timeCategory as any)
  
  if (isNonstop) {
    // Generate nonstop flight
    const duration = 200 + Math.random() * 200 // 200-400 minutes
    const arrivalTime = addMinutes(departureTime, duration)
    
    segments.push({
      id: `SEG-${Date.now()}-${index}`,
      airline: airline.name,
      flightNumber: `${airline.code}${Math.floor(1000 + Math.random() * 8000)}`,
      departureAirport: origin,
      arrivalAirport: destination,
      departureTime: departureTime.toISOString(),
      arrivalTime: arrivalTime.toISOString(),
      duration: Math.round(duration),
      aircraft: ['Boeing 737', 'Airbus A320', 'Boeing 757', 'Airbus A321'][Math.floor(Math.random() * 4)],
      class: preferences.preferences.cabinClass
    })
  } else {
    // Generate flight with layover
    const hub = HUB_AIRPORTS[Math.floor(Math.random() * HUB_AIRPORTS.length)]
    const firstLegDuration = 120 + Math.random() * 120 // 120-240 min
    const layoverDuration = 70 + Math.random() * 110 // 70-180 minutes
    const secondLegDuration = 100 + Math.random() * 140 // 100-240 min
    
    const firstArrival = addMinutes(departureTime, firstLegDuration)
    const secondDeparture = addMinutes(firstArrival, layoverDuration)
    const finalArrival = addMinutes(secondDeparture, secondLegDuration)
    
    // First segment
    segments.push({
      id: `SEG-${Date.now()}-${index}-1`,
      airline: airline.name,
      flightNumber: `${airline.code}${Math.floor(1000 + Math.random() * 8000)}`,
      departureAirport: origin,
      arrivalAirport: hub,
      departureTime: departureTime.toISOString(),
      arrivalTime: firstArrival.toISOString(),
      duration: Math.round(firstLegDuration),
      aircraft: ['Boeing 737', 'Airbus A320'][Math.floor(Math.random() * 2)],
      class: preferences.preferences.cabinClass
    })
    
    // Second segment
    segments.push({
      id: `SEG-${Date.now()}-${index}-2`,
      airline: airline.name,
      flightNumber: `${airline.code}${Math.floor(1000 + Math.random() * 8000)}`,
      departureAirport: hub,
      arrivalAirport: destination,
      departureTime: secondDeparture.toISOString(),
      arrivalTime: finalArrival.toISOString(),
      duration: Math.round(secondLegDuration),
      aircraft: ['Boeing 737', 'Airbus A320'][Math.floor(Math.random() * 2)],
      class: preferences.preferences.cabinClass
    })
  }
  
  const amenities = generateAmenities(airline.name, preferences.preferences.cabinClass)

  // Calculate transparent total pricing
  const basePrice = calculateBasePrice(segments, airline, preferences, isNonstop)
  const totalCost = buildTotalCostEstimate(basePrice, preferences, airline.name, amenities, includesCheckedBag)
  const totalPrice = totalCost.estimatedTotal
  
  // Calculate total duration and layovers
  const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0)
  const layoverCount = segments.length - 1
  const layoverDurations = layoverCount > 0 
    ? [Math.round((new Date(segments[1].departureTime).getTime() - new Date(segments[0].arrivalTime).getTime()) / 60000)]
    : []
  
  return {
    id: `FL-${Date.now()}-${index}`,
    segments,
    price: {
      amount: Math.round(totalPrice),
      currency: preferences.currency
    },
    totalCost,
    totalDuration,
    layoverCount,
    layoverDurations,
    baggage: {
      carryOn: 1,
      checked: includesCheckedBag ? 1 : 0
    },
    amenities,
    cancellationPolicy: totalPrice > 500 ? 'flexible' : totalPrice > 300 ? 'moderate' : 'strict'
  }
}

/**
 * Calculate base ticket price
 */
function calculateBasePrice(
  segments: FlightSegment[],
  airline: typeof AIRLINES[0],
  preferences: TripPreferences,
  isNonstop: boolean
): number {
  const baseFare = 150 + Math.random() * 100 // Base: $150-$250
  
  // Cabin class multiplier
  const cabinMultiplier = {
    'economy': 1.0,
    'premium-economy': 1.6,
    'business': 3.2,
    'first': 5.5
  }[preferences.preferences.cabinClass]
  
  // Nonstop premium (10-20% more)
  const nonstopMultiplier = isNonstop ? 1.15 : 1.0
  
  // Airline multiplier
  const airlineMultiplier = airline.basePriceMultiplier
  
  // Random variation (±15%)
  const variation = 0.85 + Math.random() * 0.3
  
  return baseFare * cabinMultiplier * nonstopMultiplier * airlineMultiplier * variation
}

/**
 * Build line-item total cost estimates and confidence levels.
 */
function buildTotalCostEstimate(
  baseFareRaw: number,
  preferences: TripPreferences,
  airlineName: string,
  amenities: string[],
  includesCheckedBag: boolean
): TotalCostEstimate {
  const currency = preferences.currency
  const baseFare = roundMoney(baseFareRaw)
  const taxesAndGovFees = roundMoney(baseFare * (0.13 + Math.random() * 0.05))
  const bookingFee = roundMoney(baseFare * 0.03)
  const seatSelection = roundMoney(18 + Math.random() * 17)

  const lineItems: CostLineItem[] = [
    {
      id: 'base-fare',
      label: 'Base fare',
      status: 'included',
      required: true,
      amount: baseFare,
      currency,
    },
    {
      id: 'taxes-fees',
      label: 'Taxes & government fees',
      status: 'included',
      required: true,
      amount: taxesAndGovFees,
      currency,
    },
    {
      id: 'service-fee',
      label: 'Booking/service fee',
      status: 'included',
      required: true,
      amount: bookingFee,
      currency,
    },
    {
      id: 'carry-on',
      label: 'Carry-on bag',
      status: 'included',
      required: false,
      amount: 0,
      currency,
      description: '1 carry-on typically included',
    },
  ]

  if (preferences.preferences.checkedBag) {
    lineItems.push({
      id: 'checked-bag-required',
      label: 'Checked bag',
      status: includesCheckedBag ? 'included' : 'extra',
      required: true,
      amount: includesCheckedBag ? 0 : BAGGAGE_COSTS.firstChecked,
      currency,
      description: includesCheckedBag
        ? `${airlineName} includes checked baggage`
        : 'Added because you requested checked baggage',
    })
  } else {
    lineItems.push({
      id: 'checked-bag-optional',
      label: 'Checked bag (optional)',
      status: 'extra',
      required: false,
      amount: BAGGAGE_COSTS.firstChecked,
      currency,
    })
  }

  lineItems.push({
    id: 'seat-selection',
    label: 'Seat selection (optional)',
    status: 'extra',
    required: false,
    amount: seatSelection,
    currency,
  })

  if (!amenities.includes('WiFi')) {
    lineItems.push({
      id: 'wifi',
      label: 'In-flight WiFi',
      status: 'unknown',
      required: false,
      currency,
      description: 'Airline-specific WiFi pricing can vary',
    })
  }

  const estimatedTotal = lineItems.reduce((sum, item) => {
    if (item.required && item.status !== 'unknown') {
      return sum + (item.amount || 0)
    }
    if (item.id === 'base-fare') {
      return sum + (item.amount || 0)
    }
    return sum
  }, 0)

  const potentialTotal = estimatedTotal + lineItems.reduce((sum, item) => {
    if (!item.required && item.status === 'extra') {
      return sum + (item.amount || 0)
    }
    return sum
  }, 0)

  const unknownRequiredCount = lineItems.filter(item => item.required && item.status === 'unknown').length
  const unknownCount = lineItems.filter(item => item.status === 'unknown').length
  const confidence: TotalCostEstimate['confidence'] =
    unknownRequiredCount > 0 ? 'low' : unknownCount > 0 ? 'medium' : 'high'

  return {
    currency,
    headlineFare: baseFare,
    estimatedTotal: roundMoney(estimatedTotal),
    potentialTotal: roundMoney(potentialTotal),
    confidence,
    lineItems,
  }
}

// ===== SCORING ALGORITHM =====

/**
 * Calculate comprehensive score for a flight option
 */
function calculateScore(flight: FlightOption, preferences: TripPreferences): TravelScore {
  // Individual score components (0-100)
  const priceScore = calculatePriceScore(flight.totalCost.estimatedTotal, preferences.maxBudget)
  const convenienceScore = calculateConvenienceScore(flight, preferences)
  const comfortScore = calculateComfortScore(flight, preferences)
  const reliabilityScore = 85 + Math.random() * 10 // Mock: 85-95
  const scheduleMatchScore = calculateScheduleMatchScore(flight, preferences)
  
  // Weighted average for overall score
  const weights = {
    price: 0.30,        // Price is important
    convenience: 0.25,  // Travel time and layovers
    comfort: 0.20,      // Amenities and cabin class
    reliability: 0.15,  // On-time performance
    schedule: 0.10      // Departure time match
  }
  
  const overall = Math.round(
    priceScore * weights.price +
    convenienceScore * weights.convenience +
    comfortScore * weights.comfort +
    reliabilityScore * weights.reliability +
    scheduleMatchScore * weights.schedule
  )
  
  // Generate insights
  const insights = generateInsights(flight, preferences, {
    priceScore,
    convenienceScore,
    comfortScore
  })
  
  // Price analysis
  const priceAnalysis = analyzePricing(flight.totalCost.estimatedTotal, preferences.maxBudget)
  
  return {
    overall,
    breakdown: {
      price: Math.round(priceScore),
      convenience: Math.round(convenienceScore),
      comfort: Math.round(comfortScore),
      reliability: Math.round(reliabilityScore),
      scheduleMatch: Math.round(scheduleMatchScore)
    },
    insights,
    priceAnalysis
  }
}

/**
 * Calculate price score (0-100)
 * Lower price relative to budget = higher score
 */
function calculatePriceScore(price: number, maxBudget: number): number {
  if (price > maxBudget) return 0 // Over budget
  
  const utilization = price / maxBudget
  
  // Optimal utilization: 50-75% of budget
  if (utilization <= 0.5) return 100 // Great deal
  if (utilization <= 0.75) return 90 + (0.75 - utilization) * 40 // Good value
  return Math.max(50, 90 - (utilization - 0.75) * 160) // Fair to poor
}

/**
 * Calculate convenience score based on travel time and layovers
 */
function calculateConvenienceScore(flight: FlightOption, preferences: TripPreferences): number {
  let score = 100
  
  // Layover penalty
  if (flight.layoverCount === 0) {
    score = 100 // Perfect
  } else if (flight.layoverCount === 1) {
    score = 75
    const layoverTime = flight.layoverDurations[0]
    if (layoverTime < 60) score -= 15 // Too tight
    if (layoverTime > 180) score -= 10 // Too long
  } else {
    score = 50 // Multiple layovers
  }
  
  // Travel time penalty
  if (flight.totalDuration > 360) score -= 10 // Over 6 hours
  if (flight.totalDuration > 480) score -= 15 // Over 8 hours
  if (flight.totalDuration > 720) score -= 20 // Over 12 hours
  
  return Math.max(30, score)
}

/**
 * Calculate comfort score based on cabin class and amenities
 */
function calculateComfortScore(flight: FlightOption, preferences: TripPreferences): number {
  let score = 50 // Base score
  
  // Cabin class bonus
  const cabinBonus = {
    'economy': 0,
    'premium-economy': 20,
    'business': 35,
    'first': 45
  }[preferences.preferences.cabinClass]
  score += cabinBonus
  
  // Amenities bonus (up to 25 points)
  score += Math.min(25, flight.amenities.length * 4)
  
  // Baggage included bonus
  if (flight.baggage.checked > 0 && preferences.preferences.checkedBag) {
    score += 10
  }
  
  return Math.min(100, score)
}

/**
 * Calculate how well the flight matches preferred schedule
 */
function calculateScheduleMatchScore(flight: FlightOption, preferences: TripPreferences): number {
  if (preferences.preferences.departureTimePreferences.length === 0) {
    return 85 // No preference
  }
  
  const departureTime = new Date(flight.segments[0].departureTime)
  const hour = departureTime.getHours()
  const timeCategory = getTimeCategory(hour)
  
  // Check if matches any preference
  if (preferences.preferences.departureTimePreferences.includes(timeCategory)) {
    return 95 // Perfect match
  }
  
  return 65 // Doesn't match preference
}

/**
 * Generate AI-powered insights about the flight
 */
function generateInsights(
  flight: FlightOption,
  preferences: TripPreferences,
  scores: { priceScore: number; convenienceScore: number; comfortScore: number }
): string[] {
  const insights: string[] = []
  
  // Nonstop insight
  if (flight.layoverCount === 0) {
    const timeSaved = Math.floor(1 + Math.random() * 3)
    insights.push(`Non-stop flight saves ${timeSaved}+ hours compared to connecting flights`)
  } else {
    const hours = Math.floor(flight.totalDuration / 60)
    const mins = flight.totalDuration % 60
    insights.push(`${flight.layoverCount} layover - total travel time ${hours}h ${mins}m`)
  }
  
  // Price insight
  const savings = preferences.maxBudget - flight.totalCost.estimatedTotal
  if (savings > 100) {
    insights.push(`Great value - $${savings} under your maximum budget`)
  } else if (savings > 50) {
    insights.push(`Good price within ${Math.round((savings / preferences.maxBudget) * 100)}% of budget`)
  }
  
  // Baggage insight
  if (flight.baggage.checked > 0) {
    insights.push(`Checked bag included (saves $${BAGGAGE_COSTS.firstChecked})`)
  } else if (preferences.preferences.checkedBag) {
    insights.push(`Add $${BAGGAGE_COSTS.firstChecked} for checked bag`)
  }
  
  // Departure time insight
  const hour = new Date(flight.segments[0].departureTime).getHours()
  if (hour < 7) {
    insights.push(`Early morning departure - arrive earlier at destination`)
  } else if (hour >= 18) {
    insights.push(`Evening departure - full day before travel`)
  }
  
  // Amenities highlight
  if (flight.amenities.includes('WiFi')) {
    insights.push('Free WiFi available on board')
  }
  if (flight.amenities.includes('Extra Legroom')) {
    insights.push('Extra legroom for added comfort')
  }
  
  return insights.slice(0, 5) // Max 5 insights
}

/**
 * Analyze pricing relative to market
 */
function analyzePricing(price: number, maxBudget: number): TravelScore['priceAnalysis'] {
  const marketAverage = maxBudget * 0.70 // Assume average is 70% of max
  const comparedToAverage = Math.round(((price - marketAverage) / marketAverage) * 100)
  
  const isPriceGood = comparedToAverage < 5
  const trends = ['rising', 'falling', 'stable'] as const
  const trend = trends[Math.floor(Math.random() * 3)]
  
  let recommendation = ''
  if (isPriceGood && trend === 'rising') {
    recommendation = `Excellent time to book - price is ${Math.abs(comparedToAverage)}% below average and trending up`
  } else if (isPriceGood) {
    recommendation = `Great value - ${Math.abs(comparedToAverage)}% below typical market prices`
  } else if (trend === 'falling') {
    recommendation = `Prices are trending down - consider waiting if flexible`
  } else {
    recommendation = `Fair price for the route, amenities, and travel time`
  }
  
  return {
    isPriceGood,
    comparedToAverage,
    trend,
    recommendation
  }
}

// ===== EXPLANATION GENERATION =====

function evaluateConstraintMatch(
  flight: FlightOption,
  preferences: TripPreferences
): ConstraintMatchSummary {
  const matchedConstraints: ConstraintMatchItem[] = []
  const missedConstraints: ConstraintMatchItem[] = []

  const addResult = (
    matched: boolean,
    item: ConstraintMatchItem
  ) => {
    if (matched) {
      matchedConstraints.push(item)
    } else {
      missedConstraints.push(item)
    }
  }

  // Budget match
  const budgetGap = preferences.maxBudget - flight.totalCost.estimatedTotal
  addResult(budgetGap >= 0, {
    key: 'budget',
    label: 'Budget',
    expectedValue: `Under $${preferences.maxBudget}`,
    actualValue: `$${flight.totalCost.estimatedTotal}`,
    reason:
      budgetGap >= 0
        ? `Within budget by $${budgetGap}`
        : `Over budget by $${Math.abs(budgetGap)}`,
  })

  // Nonstop preference
  if (preferences.preferences.nonstopOnly) {
    addResult(flight.layoverCount === 0, {
      key: 'nonstop',
      label: 'Nonstop',
      expectedValue: 'Nonstop only',
      actualValue: flight.layoverCount === 0 ? 'Nonstop' : `${flight.layoverCount} stop(s)`,
      reason:
        flight.layoverCount === 0
          ? 'Nonstop requirement satisfied'
          : 'Includes layover(s), which conflicts with nonstop preference',
    })
  }

  // Checked bag preference
  if (preferences.preferences.checkedBag) {
    const checkedBagLine = flight.totalCost.lineItems.find(item => item.id.includes('checked-bag'))
    const isKnown = checkedBagLine?.status !== 'unknown'
    const bagDetail =
      checkedBagLine?.status === 'included'
        ? 'Included'
        : checkedBagLine?.status === 'extra'
          ? `Available for +$${checkedBagLine.amount || 0}`
          : 'Unknown availability'
    addResult(Boolean(isKnown), {
      key: 'checkedBag',
      label: 'Checked bag',
      expectedValue: 'Checked bag needed',
      actualValue: bagDetail,
      reason: isKnown
        ? 'Checked baggage is available and included in cost estimate'
        : 'Checked baggage cost/availability is uncertain',
    })
  }

  // Cabin class
  const actualCabinClass = flight.segments[0]?.class || 'economy'
  addResult(actualCabinClass === preferences.preferences.cabinClass, {
    key: 'cabinClass',
    label: 'Cabin class',
    expectedValue: formatCabinClass(preferences.preferences.cabinClass),
    actualValue: formatCabinClass(actualCabinClass),
    reason:
      actualCabinClass === preferences.preferences.cabinClass
        ? 'Cabin class preference matched'
        : 'Different cabin class than requested',
  })

  // Departure time preference
  if (preferences.preferences.departureTimePreferences.length > 0) {
    const departureHour = new Date(flight.segments[0].departureTime).getHours()
    const actualTimeCategory = getTimeCategory(departureHour)
    const hasMatch = preferences.preferences.departureTimePreferences.includes(actualTimeCategory)
    addResult(hasMatch, {
      key: 'departureTime',
      label: 'Departure time',
      expectedValue: preferences.preferences.departureTimePreferences.join(' or '),
      actualValue: actualTimeCategory,
      reason: hasMatch
        ? 'Departure time aligns with your preference'
        : 'Departure time is outside your preferred window',
    })
  }

  return {
    isFullMatch: missedConstraints.length === 0,
    matchedCount: matchedConstraints.length,
    totalChecked: matchedConstraints.length + missedConstraints.length,
    matchedConstraints,
    missedConstraints,
  }
}

/**
 * Generate natural language explanation for why this option is recommended
 */
function generateExplanation(
  flight: FlightOption,
  score: TravelScore,
  preferences: TripPreferences,
  constraintMatch: ConstraintMatchSummary
): string {
  const parts: string[] = []
  
  // Opening statement based on score
  if (constraintMatch.isFullMatch && score.overall >= 90) {
    parts.push('This is an excellent match for your preferences.')
  } else if (constraintMatch.isFullMatch && score.overall >= 80) {
    parts.push('This is a great option that balances value and convenience well.')
  } else if (score.overall >= 70) {
    parts.push('This option offers good value with some trade-offs against your constraints.')
  } else {
    parts.push('This budget-friendly option requires compromises.')
  }
  
  // Price commentary
  if (flight.totalCost.estimatedTotal < preferences.maxBudget * 0.65) {
    parts.push(`At an estimated total of $${flight.totalCost.estimatedTotal}, it's an excellent value well within your budget.`)
  } else if (flight.totalCost.estimatedTotal <= preferences.maxBudget) {
    parts.push(`The estimated total of $${flight.totalCost.estimatedTotal} fits comfortably in your budget.`)
  } else {
    parts.push(`The estimated total is $${flight.totalCost.estimatedTotal}, which is above your target budget.`)
  }

  const unknownCosts = flight.totalCost.lineItems.filter(item => item.status === 'unknown')
  if (unknownCosts.length > 0) {
    parts.push(`Some costs are uncertain (${unknownCosts.map(item => item.label).join(', ')}) so treat this as an estimate.`)
  }

  if (constraintMatch.missedConstraints.length > 0) {
    const topMisses = constraintMatch.missedConstraints
      .slice(0, 2)
      .map(item => `${item.label}: ${item.reason}`)
      .join(' ')
    parts.push(`Constraint trade-offs: ${topMisses}`)
  }
  
  // Travel time commentary
  if (flight.layoverCount === 0) {
    parts.push('The non-stop service eliminates layover hassles and minimizes total travel time.')
  } else if (flight.layoverDurations[0] < 90) {
    parts.push('The brief layover keeps total travel time reasonable.')
  } else {
    parts.push('The layover adds time but typically comes with a lower price.')
  }
  
  // Schedule fit
  if (preferences.preferences.departureTimePreferences.length > 0) {
    const hour = new Date(flight.segments[0].departureTime).getHours()
    const category = getTimeCategory(hour)
    if (preferences.preferences.departureTimePreferences.includes(category)) {
      parts.push(`The ${category.replace('-', ' ')} departure aligns perfectly with your preferences.`)
    }
  }
  
  // Comfort/amenities
  if (flight.amenities.length >= 3) {
    const topAmenities = flight.amenities.slice(0, 2).join(' and ')
    parts.push(`Includes ${topAmenities} for a more comfortable journey.`)
  }
  
  return parts.join(' ')
}

/**
 * Generate tags for quick identification
 */
function generateTags(
  flight: FlightOption,
  score: TravelScore,
  preferences: TripPreferences,
  constraintMatch: ConstraintMatchSummary
): string[] {
  const tags: string[] = []

  if (constraintMatch.isFullMatch) {
    tags.push('Full Match')
  } else {
    tags.push('Partial Match')
  }
  
  // Score-based tags
  if (score.overall >= 90) tags.push('Best Overall')
  if (score.overall >= 85) tags.push('Recommended')
  
  // Price-based tags
  if (flight.totalCost.estimatedTotal < preferences.maxBudget * 0.55) tags.push('Best Value')
  if (score.breakdown.price >= 95) tags.push('Great Price')
  if (flight.totalCost.confidence === 'high') tags.push('Clear Pricing')
  
  // Feature-based tags
  if (flight.layoverCount === 0) tags.push('Non-Stop')
  if (flight.totalDuration < 300) tags.push('Fastest')
  if (flight.baggage.checked > 0) tags.push('Baggage Included')
  
  // Cabin class tag
  if (preferences.preferences.cabinClass !== 'economy') {
    const className = preferences.preferences.cabinClass
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    tags.push(className)
  }
  
  // Amenities tag
  if (flight.amenities.length >= 4) tags.push('Premium Amenities')
  
  return tags.slice(0, 4) // Max 4 tags
}

// ===== HOTEL ESTIMATES =====

/**
 * Add hotel cost estimate if needed
 */
function addHotelEstimate(
  recommendation: TravelRecommendation,
  preferences: TripPreferences
): TravelRecommendation {
  if (!preferences.returnDate) return recommendation
  
  const departure = new Date(preferences.departureDate)
  const returnDate = new Date(preferences.returnDate)
  const nights = Math.floor((returnDate.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24))
  
  if (nights < 1) return recommendation
  
  // Calculate hotel estimate based on budget tier
  const hotelPricePerNight = 
    preferences.maxBudget < 300 ? 100 :
    preferences.maxBudget < 600 ? 150 :
    preferences.maxBudget < 1000 ? 220 : 300
  
  const totalHotelCost = hotelPricePerNight * nights
  
  // Add hotel info to AI summary
  const hotelInfo = ` Hotel estimate: $${hotelPricePerNight}/night × ${nights} nights = $${totalHotelCost} total.`
  
  return {
    ...recommendation,
    aiSummary: recommendation.aiSummary + hotelInfo
  }
}

// ===== HELPER FUNCTIONS =====

function normalizeAirportCode(input: string): string {
  const cleaned = input.toUpperCase().trim()
  // Extract 3-letter code if present
  const match = cleaned.match(/[A-Z]{3}/)
  return match ? match[0] : cleaned.substring(0, 3)
}

function generateDepartureTime(date: string, timeCategory: string): Date {
  const d = new Date(date)
  
  const hourRanges: Record<string, [number, number]> = {
    'early-morning': [5, 8],
    'morning': [8, 12],
    'afternoon': [12, 17],
    'evening': [17, 22]
  }
  
  const [minHour, maxHour] = hourRanges[timeCategory] || [9, 12]
  const hour = minHour + Math.floor(Math.random() * (maxHour - minHour))
  const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)]
  
  d.setHours(hour, minute, 0, 0)
  return d
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000)
}

function getTimeCategory(hour: number): string {
  if (hour < 8) return 'early-morning'
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function generateAmenities(airline: string, cabinClass: string): string[] {
  const amenities = ['In-flight Entertainment']
  
  // Airline-specific amenities
  if (airline.includes('JetBlue') || airline.includes('Delta')) {
    amenities.push('WiFi', 'Free Snacks')
  } else if (airline.includes('United') || airline.includes('American')) {
    amenities.push('Power Outlets')
  }
  
  // Cabin class amenities
  if (cabinClass !== 'economy') {
    amenities.push('Extra Legroom', 'Priority Boarding')
  }
  
  if (cabinClass === 'business' || cabinClass === 'first') {
    amenities.push('Lie-flat Seats', 'Premium Meals', 'Lounge Access')
  }
  
  return amenities
}

function roundMoney(value: number): number {
  return Math.round(value)
}

function formatCabinClass(cabinClass: string): string {
  return cabinClass
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
