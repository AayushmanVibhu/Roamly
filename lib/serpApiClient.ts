import { CostLineItem, FlightOption, FlightSegment, TotalCostEstimate, TripPreferences } from '@/types'

const SERPAPI_BASE_URL = 'https://serpapi.com/search.json'

interface SerpApiResponse {
  best_flights?: SerpFlightOffer[]
  other_flights?: SerpFlightOffer[]
  error?: string
  search_metadata?: {
    status?: string
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

export async function searchSerpApiFlightOptions(preferences: TripPreferences): Promise<FlightOption[]> {
  const apiKey = process.env.SERPAPI_API_KEY
  if (!apiKey) {
    throw new Error('SERPAPI_API_KEY is missing. Add it to .env.local')
  }

  const params = buildSerpApiParams(preferences, apiKey)
  const response = await fetch(`${SERPAPI_BASE_URL}?${params.toString()}`)
  const payload = (await response.json()) as SerpApiResponse

  if (!response.ok) {
    throw new Error(payload.error || `SerpApi request failed with status ${response.status}`)
  }

  if (payload.error) {
    throw new Error(payload.error)
  }

  const offers = [...(payload.best_flights || []), ...(payload.other_flights || [])]
  return offers
    .map((offer, index) => mapOfferToFlightOption(offer, preferences, index))
    .filter((option): option is FlightOption => Boolean(option))
}

function buildSerpApiParams(preferences: TripPreferences, apiKey: string): URLSearchParams {
  const params = new URLSearchParams({
    engine: 'google_flights',
    departure_id: toIataCode(preferences.origin),
    arrival_id: toIataCode(preferences.destination),
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
  index: number
): FlightOption | null {
  const flights = offer.flights || []
  if (flights.length === 0) return null

  const segments: FlightSegment[] = flights.map((segment, segmentIndex) => ({
    id: `SERP-${index}-SEG-${segmentIndex}`,
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
  const checkedBagIncluded = totalCost.lineItems.some(
    item => item.id === 'checked-bag' && item.status === 'included'
  )

  return {
    id: `SERP-OFFER-${index}`,
    segments,
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
      checked: checkedBagIncluded ? 1 : 0,
    },
    amenities: [],
    cancellationPolicy: 'strict',
  }
}

function buildTotalCostEstimateFromOffer(
  offer: SerpFlightOffer,
  preferences: TripPreferences
): TotalCostEstimate {
  const currency = preferences.currency || 'USD'
  const headlineFare = Math.max(0, offer.price || 0)
  const includesCheckedBag = (offer.extensions || []).some(item =>
    /checked bag included|includes checked bag|1 checked bag/i.test(item)
  )

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
      status: 'unknown',
      required: true,
      currency,
      description: 'Google Flights summary does not always split tax/fee lines.',
    },
  ]

  if (preferences.preferences.checkedBag) {
    lineItems.push({
      id: 'checked-bag',
      label: 'Checked bag',
      status: includesCheckedBag ? 'included' : 'unknown',
      required: true,
      amount: includesCheckedBag ? 0 : undefined,
      currency,
      description: includesCheckedBag
        ? 'Checked bag appears included for this offer.'
        : 'Checked bag pricing not explicitly returned by SerpApi.',
    })
  } else {
    lineItems.push({
      id: 'checked-bag',
      label: 'Checked bag (optional)',
      status: includesCheckedBag ? 'included' : 'unknown',
      required: false,
      amount: includesCheckedBag ? 0 : undefined,
      currency,
    })
  }

  lineItems.push({
    id: 'seat-selection',
    label: 'Seat selection (optional)',
    status: 'unknown',
    required: false,
    currency,
  })

  const confidence: TotalCostEstimate['confidence'] = 'low'

  return {
    currency,
    headlineFare,
    estimatedTotal: headlineFare,
    potentialTotal: headlineFare,
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
