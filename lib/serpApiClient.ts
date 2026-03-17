import { CostLineItem, FlightOption, FlightSegment, TotalCostEstimate, TripPreferences } from '@/types'

const SERPAPI_BASE_URL = 'https://serpapi.com/search.json'
const DEFAULT_OPTIONAL_UNKNOWN_ESTIMATE = 25

interface SerpApiResponse {
  best_flights?: SerpFlightOffer[]
  other_flights?: SerpFlightOffer[]
  error?: string
  search_metadata?: {
    status?: string
    google_flights_url?: string
  }
}

interface SerpFlightOffer {
  flights?: SerpFlightSegment[]
  layovers?: Array<{
    duration?: number
    name?: string
    id?: string
  }>
  total_duration?: number
  price?: number
  extensions?: string[]
  booking_request?: {
    url?: string
  }
  booking_url?: string
  link?: string
}

interface SerpFlightSegment {
  airline?: string
  flight_number?: string
  departure_airport?: {
    id?: string
    time?: string
  }
  arrival_airport?: {
    id?: string
    time?: string
  }
  duration?: number
  airplane?: string
  travel_class?: string
}

const AIRPORT_ALIASES: Record<string, string> = {
  'new york': 'JFK',
  'los angeles': 'LAX',
  'san francisco': 'SFO',
  'chicago': 'ORD',
  'miami': 'MIA',
  'phoenix': 'PHX',
  'seattle': 'SEA',
  'boston': 'BOS',
  'denver': 'DEN',
  'dallas': 'DFW',
  'atlanta': 'ATL',
  'las vegas': 'LAS',
  'orlando': 'MCO',
  'austin': 'AUS',
  'houston': 'IAH',
  'washington': 'DCA',
  'london': 'LHR',
  'paris': 'CDG',
  'tokyo': 'NRT',
  'dubai': 'DXB',
}

const SERP_METRO_FALLBACKS: Record<string, string> = {
  NYC: 'JFK',
  LON: 'LHR',
  CHI: 'ORD',
  WAS: 'IAD',
}

const AIRPORT_CANDIDATE_GROUPS: Record<string, string[]> = {
  JFK: ['JFK', 'EWR', 'LGA'],
  EWR: ['EWR', 'JFK', 'LGA'],
  LGA: ['LGA', 'JFK', 'EWR'],
  LHR: ['LHR', 'LGW'],
  LGW: ['LGW', 'LHR'],
  ORD: ['ORD', 'MDW'],
  IAD: ['IAD', 'DCA', 'BWI'],
  DCA: ['DCA', 'IAD', 'BWI'],
  NRT: ['NRT', 'HND'],
  HND: ['HND', 'NRT'],
  DXB: ['DXB', 'DWC'],
}

export async function searchSerpApiFlightOptions(preferences: TripPreferences): Promise<FlightOption[]> {
  const apiKey = process.env.SERPAPI_API_KEY
  if (!apiKey) {
    throw new Error('SERPAPI_API_KEY is missing. Add it to .env.local')
  }

  const departurePrimary = toIataCode(preferences.origin)
  const arrivalPrimary = toIataCode(preferences.destination)
  const queryPlans = buildQueryPlans(departurePrimary, arrivalPrimary)

  let sawNoResults = false

  for (const plan of queryPlans) {
    const payload = await requestSerpApiOffers(preferences, apiKey, plan.departureId, plan.arrivalId)

    if (payload.error) {
      if (isNoResultsError(payload.error)) {
        sawNoResults = true
        continue
      }
      throw new Error(payload.error)
    }

    const offers = [...(payload.best_flights || []), ...(payload.other_flights || [])]
    if (offers.length === 0) {
      continue
    }

    return offers
      .map((offer, index) =>
        mapOfferToFlightOption(offer, preferences, {
          idSuffix: `${plan.departureId}-${plan.arrivalId}-${index}`,
          departureId: plan.departureId,
          arrivalId: plan.arrivalId,
          fallbackBookingUrl:
            payload.search_metadata?.google_flights_url ||
            buildGoogleFlightsSearchUrl(preferences, plan.departureId, plan.arrivalId),
        })
      )
      .filter((option): option is FlightOption => Boolean(option))
  }

  if (sawNoResults) {
    return []
  }

  return []
}

function requestSerpApiOffers(
  preferences: TripPreferences,
  apiKey: string,
  departureId: string,
  arrivalId: string
): Promise<SerpApiResponse> {
  const params = buildSerpApiParams(preferences, apiKey, departureId, arrivalId)
  return fetch(`${SERPAPI_BASE_URL}?${params.toString()}`).then(async response => {
    const payload = (await response.json()) as SerpApiResponse
    if (!response.ok) {
      throw new Error(payload.error || `SerpApi request failed with status ${response.status}`)
    }
    return payload
  })
}

function buildSerpApiParams(
  preferences: TripPreferences,
  apiKey: string,
  departureId: string,
  arrivalId: string
): URLSearchParams {
  const params = new URLSearchParams({
    engine: 'google_flights',
    departure_id: departureId,
    arrival_id: arrivalId,
    outbound_date: preferences.departureDate,
    adults: String(Math.max(1, preferences.passengers.adults)),
    children: String(Math.max(0, preferences.passengers.children)),
    currency: preferences.currency || 'USD',
    hl: 'en',
    gl: 'us',
    api_key: apiKey,
    travel_class: mapTravelClassForSerp(preferences.preferences.cabinClass),
    type: preferences.tripType === 'round-trip' && preferences.returnDate ? '1' : '2',
  })

  if (preferences.tripType === 'round-trip' && preferences.returnDate) {
    params.set('return_date', preferences.returnDate)
  }

  if (preferences.preferences.nonstopOnly) {
    params.set('stops', '0')
  }

  return params
}

function mapOfferToFlightOption(
  offer: SerpFlightOffer,
  preferences: TripPreferences,
  context: {
    idSuffix: string
    departureId: string
    arrivalId: string
    fallbackBookingUrl: string
  }
): FlightOption | null {
  const flights = offer.flights || []
  if (flights.length === 0) return null

  const segments: FlightSegment[] = flights.map((segment, segmentIndex) => ({
    id: `SERP-${context.idSuffix}-SEG-${segmentIndex}`,
    airline: segment.airline || 'Unknown Airline',
    flightNumber: segment.flight_number || `FL-${segmentIndex + 1}`,
    departureAirport: segment.departure_airport?.id || 'N/A',
    arrivalAirport: segment.arrival_airport?.id || 'N/A',
    departureTime: toIsoDateTime(segment.departure_airport?.time),
    arrivalTime: toIsoDateTime(segment.arrival_airport?.time),
    duration: Math.max(0, segment.duration || 0),
    aircraft: segment.airplane || 'Unknown Aircraft',
    class: mapTravelClassFromSerp(segment.travel_class || preferences.preferences.cabinClass),
  }))

  const layoverDurations = (offer.layovers || [])
    .map(layover => layover.duration || 0)
    .filter(duration => duration > 0)

  const totalDuration = Math.max(
    0,
    offer.total_duration || segments.reduce((sum, segment) => sum + segment.duration, 0)
  )

  const totalCost = buildTotalCostEstimateFromOffer(offer, preferences)
  const checkedBagLine = totalCost.lineItems.find(item => item.id === 'checked-bag')
  const checkedBagAvailable = checkedBagLine ? checkedBagLine.status !== 'unknown' : false
  const amenities = extractAmenitiesFromExtensions(offer.extensions || [])
  const bookingUrl = resolveOfferBookingUrl(
    offer,
    context.fallbackBookingUrl,
    preferences,
    context.departureId,
    context.arrivalId
  )

  return {
    id: `SERP-OFFER-${context.idSuffix}`,
    segments,
    bookingUrl,
    price: {
      amount: totalCost.estimatedTotal,
      currency: totalCost.currency,
    },
    totalCost,
    totalDuration,
    layoverCount: Math.max(0, segments.length - 1),
    layoverDurations,
    baggage: {
      carryOn: 1,
      checked: checkedBagAvailable ? 1 : 0,
    },
    amenities,
    cancellationPolicy: 'strict',
  }
}

function resolveOfferBookingUrl(
  offer: SerpFlightOffer,
  fallbackBookingUrl: string,
  preferences: TripPreferences,
  departureId: string,
  arrivalId: string
): string {
  const directUrl =
    offer.booking_request?.url ||
    offer.booking_url ||
    offer.link

  if (directUrl && /^https?:\/\//i.test(directUrl)) {
    return directUrl
  }

  if (fallbackBookingUrl && /^https?:\/\//i.test(fallbackBookingUrl)) {
    return fallbackBookingUrl
  }

  return buildGoogleFlightsSearchUrl(preferences, departureId, arrivalId)
}

function buildGoogleFlightsSearchUrl(
  preferences: TripPreferences,
  departureId: string,
  arrivalId: string
): string {
  const queryParts = [
    `Flights from ${departureId} to ${arrivalId}`,
    `on ${preferences.departureDate}`,
    preferences.tripType === 'round-trip' && preferences.returnDate
      ? `return ${preferences.returnDate}`
      : '',
    `${Math.max(1, preferences.passengers.adults)} adults`,
    preferences.preferences.cabinClass,
  ].filter(Boolean)

  return `https://www.google.com/travel/flights?q=${encodeURIComponent(queryParts.join(' '))}`
}

function buildTotalCostEstimateFromOffer(
  offer: SerpFlightOffer,
  preferences: TripPreferences
): TotalCostEstimate {
  const currency = preferences.currency || 'USD'
  const headlineFare = Math.max(0, offer.price || 0)
  const extensions = offer.extensions || []
  const includesCheckedBag = extensions.some(item =>
    /checked bag included|includes checked bag|1 checked bag/i.test(item)
  )
  const checkedBagCost = extractDollarAmount(extensions, /checked bag|baggage/i)
  const seatSelectionCost = extractDollarAmount(extensions, /seat/i)

  const lineItems: CostLineItem[] = [
    {
      id: 'quoted-total',
      label: 'Quoted fare (Google Flights)',
      status: 'included',
      required: true,
      amount: headlineFare,
      currency,
    },
    {
      id: 'taxes-fees',
      label: 'Taxes & fees',
      status: 'included',
      required: true,
      amount: 0,
      currency,
      description: 'Included in quoted fare from Google Flights data.',
    },
  ]

  if (preferences.preferences.checkedBag) {
    lineItems.push({
      id: 'checked-bag',
      label: 'Checked bag',
      status: includesCheckedBag ? 'included' : typeof checkedBagCost === 'number' ? 'extra' : 'unknown',
      required: true,
      amount: includesCheckedBag ? 0 : checkedBagCost,
      currency,
      description:
        includesCheckedBag
          ? 'Checked bag appears included for this offer.'
          : typeof checkedBagCost === 'number'
            ? 'Estimated from provider fare notes.'
            : 'Checked bag pricing not explicitly returned by SerpApi.',
    })
  } else {
    lineItems.push({
      id: 'checked-bag',
      label: 'Checked bag (optional)',
      status: includesCheckedBag ? 'included' : typeof checkedBagCost === 'number' ? 'extra' : 'unknown',
      required: false,
      amount: includesCheckedBag ? 0 : checkedBagCost,
      currency,
    })
  }

  lineItems.push({
    id: 'seat-selection',
    label: 'Seat selection (optional)',
    status: typeof seatSelectionCost === 'number' ? 'extra' : 'unknown',
    required: false,
    amount: seatSelectionCost,
    currency,
  })

  const requiredUnknownCount = lineItems.filter(item => item.required && item.status === 'unknown').length
  const optionalUnknownCount = lineItems.filter(item => !item.required && item.status === 'unknown').length

  const requiredKnownExtraTotal = lineItems.reduce((sum, item) => {
    if (item.required && item.status === 'extra') {
      return sum + (item.amount || 0)
    }
    return sum
  }, 0)

  const optionalKnownExtraTotal = lineItems.reduce((sum, item) => {
    if (!item.required && item.status === 'extra') {
      return sum + (item.amount || 0)
    }
    return sum
  }, 0)

  const optionalUnknownEstimate = optionalUnknownCount * DEFAULT_OPTIONAL_UNKNOWN_ESTIMATE

  const confidence: TotalCostEstimate['confidence'] =
    requiredUnknownCount > 0 ? 'low' : optionalUnknownCount > 0 ? 'medium' : 'high'

  return {
    currency,
    headlineFare,
    estimatedTotal: headlineFare + requiredKnownExtraTotal,
    potentialTotal: headlineFare + requiredKnownExtraTotal + optionalKnownExtraTotal + optionalUnknownEstimate,
    confidence,
    lineItems,
  }
}

function mapTravelClassForSerp(cabinClass: TripPreferences['preferences']['cabinClass']): string {
  const map: Record<TripPreferences['preferences']['cabinClass'], string> = {
    economy: '1',
    'premium-economy': '2',
    business: '3',
    first: '4',
  }
  return map[cabinClass]
}

function mapTravelClassFromSerp(cabinClass: string): FlightSegment['class'] {
  const text = cabinClass.toLowerCase()
  if (text.includes('first')) return 'first'
  if (text.includes('business')) return 'business'
  if (text.includes('premium')) return 'premium-economy'
  return 'economy'
}

function toIsoDateTime(value?: string): string {
  if (!value) return new Date().toISOString()
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  return new Date().toISOString()
}

function toIataCode(input: string): string {
  const text = input.trim()
  const parenMatch = text.toUpperCase().match(/\(([A-Z]{3})\)/)
  if (parenMatch) return normalizeSerpAirportId(parenMatch[1])

  const directCode = text.toUpperCase().match(/\b[A-Z]{3}\b/)
  if (directCode) return normalizeSerpAirportId(directCode[0])

  const mapped = AIRPORT_ALIASES[text.toLowerCase()]
  if (mapped) return normalizeSerpAirportId(mapped)

  const lettersOnly = text.replace(/[^a-zA-Z]/g, '').toUpperCase()
  return normalizeSerpAirportId(lettersOnly.slice(0, 3))
}

function normalizeSerpAirportId(code: string): string {
  return SERP_METRO_FALLBACKS[code] || code
}

function buildQueryPlans(departureCode: string, arrivalCode: string): Array<{ departureId: string; arrivalId: string }> {
  const departureCandidates = getAirportCandidates(departureCode)
  const arrivalCandidates = getAirportCandidates(arrivalCode)

  const plans: Array<{ departureId: string; arrivalId: string }> = []
  plans.push({ departureId: departureCandidates[0], arrivalId: arrivalCandidates[0] })

  for (const dep of departureCandidates.slice(1, 3)) {
    plans.push({ departureId: dep, arrivalId: arrivalCandidates[0] })
  }
  for (const arr of arrivalCandidates.slice(1, 3)) {
    plans.push({ departureId: departureCandidates[0], arrivalId: arr })
  }

  return plans
}

function getAirportCandidates(code: string): string[] {
  return AIRPORT_CANDIDATE_GROUPS[code] || [code]
}

function isNoResultsError(error: string): boolean {
  return /hasn'?t returned any results|no results/i.test(error)
}

function extractDollarAmount(extensions: string[], clueRegex: RegExp): number | undefined {
  for (const extension of extensions) {
    if (!clueRegex.test(extension)) continue
    const match = extension.match(/\$(\d+(?:\.\d+)?)/)
    if (match) {
      const parsed = Number(match[1])
      if (!Number.isNaN(parsed)) return Math.round(parsed)
    }
  }
  return undefined
}

function extractAmenitiesFromExtensions(extensions: string[]): string[] {
  const amenities: string[] = []
  const add = (label: string) => {
    if (!amenities.includes(label)) amenities.push(label)
  }

  for (const extension of extensions) {
    const lower = extension.toLowerCase()
    if (lower.includes('wifi') || lower.includes('wi-fi')) add('WiFi')
    if (lower.includes('legroom')) add('Extra Legroom')
    if (lower.includes('meal')) add('Meals')
    if (lower.includes('carry-on') || lower.includes('carry on')) add('Carry-on Included')
    if (lower.includes('checked bag included')) add('Checked Bag Included')
  }

  return amenities
}
