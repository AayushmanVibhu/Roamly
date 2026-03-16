import { CostLineItem, FlightOption, FlightSegment, TotalCostEstimate, TripPreferences } from '@/types'

const DUFFEL_API_BASE = 'https://api.duffel.com'
const DUFFEL_VERSION = 'v2'

interface DuffelOfferRequestResponse {
  data?: {
    offers?: DuffelOffer[]
  }
  errors?: Array<{ title?: string; detail?: string }>
}

interface DuffelOffer {
  id: string
  total_amount?: string
  total_currency?: string
  base_amount?: string
  tax_amount?: string
  owner?: {
    name?: string
    iata_code?: string
  }
  slices?: DuffelSlice[]
  conditions?: {
    refund_before_departure?: { allowed?: boolean }
    change_before_departure?: { allowed?: boolean }
  }
  available_services?: DuffelService[]
}

interface DuffelSlice {
  duration?: string
  segments?: DuffelSegment[]
}

interface DuffelSegment {
  id?: string
  marketing_carrier?: {
    name?: string
    iata_code?: string
  }
  operating_carrier?: {
    name?: string
    iata_code?: string
  }
  flight_number?: string
  origin?: { iata_code?: string }
  destination?: { iata_code?: string }
  departing_at?: string
  arriving_at?: string
  duration?: string
  aircraft?: { name?: string }
  cabin_class?: string
}

interface DuffelService {
  type?: string
  total_amount?: string
  total_currency?: string
}

const AIRPORT_ALIASES: Record<string, string> = {
  'new york': 'NYC',
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

export async function searchDuffelFlightOptions(preferences: TripPreferences): Promise<FlightOption[]> {
  const token = process.env.DUFFEL_API_KEY
  if (!token) {
    throw new Error('DUFFEL_API_KEY is missing. Add it to .env.local')
  }

  const requestBody = {
    data: buildDuffelOfferRequest(preferences),
  }

  const response = await fetch(`${DUFFEL_API_BASE}/air/offer_requests`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Duffel-Version': DUFFEL_VERSION,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  const payload = (await response.json()) as DuffelOfferRequestResponse

  if (!response.ok || payload.errors?.length) {
    const detail = payload.errors?.map(err => err.detail || err.title).join(' | ')
    throw new Error(detail || 'Duffel API request failed')
  }

  const offers = payload.data?.offers || []
  return offers
    .map((offer, index) => mapOfferToFlightOption(offer, preferences, index))
    .filter((flight): flight is FlightOption => Boolean(flight))
}

function buildDuffelOfferRequest(preferences: TripPreferences) {
  const origin = toIataCode(preferences.origin)
  const destination = toIataCode(preferences.destination)

  const outboundSlice: Record<string, unknown> = {
    origin,
    destination,
    departure_date: preferences.departureDate,
  }

  if (preferences.preferences.nonstopOnly) {
    outboundSlice.max_connections = 0
  }

  const slices: Array<Record<string, unknown>> = [outboundSlice]

  if (preferences.tripType === 'round-trip' && preferences.returnDate) {
    const returnSlice: Record<string, unknown> = {
      origin: destination,
      destination: origin,
      departure_date: preferences.returnDate,
    }
    if (preferences.preferences.nonstopOnly) {
      returnSlice.max_connections = 0
    }
    slices.push(returnSlice)
  }

  return {
    slices,
    passengers: buildPassengers(preferences),
    cabin_class: mapCabinClassForDuffel(preferences.preferences.cabinClass),
    return_offers: true,
  }
}

function buildPassengers(preferences: TripPreferences): Array<{ type: string }> {
  const passengers: Array<{ type: string }> = []

  const safeAdults = Math.max(1, preferences.passengers.adults)
  for (let i = 0; i < safeAdults; i++) {
    passengers.push({ type: 'adult' })
  }

  for (let i = 0; i < preferences.passengers.children; i++) {
    passengers.push({ type: 'child' })
  }

  for (let i = 0; i < preferences.passengers.infants; i++) {
    passengers.push({ type: 'infant_without_seat' })
  }

  return passengers
}

function mapOfferToFlightOption(
  offer: DuffelOffer,
  preferences: TripPreferences,
  index: number
): FlightOption | null {
  const firstSlice = offer.slices?.[0]
  const rawSegments = firstSlice?.segments || []
  if (rawSegments.length === 0) return null

  const segments: FlightSegment[] = rawSegments.map((segment, segmentIndex) => {
    const departureTime = segment.departing_at || new Date().toISOString()
    const arrivalTime = segment.arriving_at || departureTime
    const airlineName =
      segment.marketing_carrier?.name ||
      segment.operating_carrier?.name ||
      offer.owner?.name ||
      'Unknown Airline'
    const airlineCode = segment.marketing_carrier?.iata_code || offer.owner?.iata_code || ''

    return {
      id: segment.id || `${offer.id}-SEG-${segmentIndex}`,
      airline: airlineName,
      flightNumber: `${airlineCode}${segment.flight_number || ''}`.trim() || `FL-${segmentIndex + 1}`,
      departureAirport: segment.origin?.iata_code || 'N/A',
      arrivalAirport: segment.destination?.iata_code || 'N/A',
      departureTime,
      arrivalTime,
      duration:
        parseDurationToMinutes(segment.duration) ||
        getMinutesBetween(departureTime, arrivalTime) ||
        0,
      aircraft: segment.aircraft?.name || 'Unknown Aircraft',
      class: mapCabinClassFromDuffel(segment.cabin_class || preferences.preferences.cabinClass),
    }
  })

  const layoverDurations = getLayoverDurations(segments)
  const totalDuration =
    parseDurationToMinutes(firstSlice?.duration) ||
    segments.reduce((sum, segment) => sum + segment.duration, 0)

  const totalCost = buildTotalCostEstimateFromOffer(offer, preferences)
  const checkedBagIncluded = totalCost.lineItems.some(
    item => item.id === 'checked-bag' && item.status === 'included'
  )

  return {
    id: offer.id || `DUFFEL-${index}`,
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
    cancellationPolicy: mapCancellationPolicy(offer.conditions),
  }
}

function buildTotalCostEstimateFromOffer(
  offer: DuffelOffer,
  preferences: TripPreferences
): TotalCostEstimate {
  const currency = offer.total_currency || preferences.currency || 'USD'
  const quotedTotal = parseMoney(offer.total_amount) || 0

  const baseAmount = parseMoney(offer.base_amount)
  const taxAmount = parseMoney(offer.tax_amount)

  const lineItems: CostLineItem[] = []

  if (typeof baseAmount === 'number' && typeof taxAmount === 'number') {
    lineItems.push({
      id: 'base-fare',
      label: 'Base fare',
      status: 'included',
      required: true,
      amount: baseAmount,
      currency,
    })
    lineItems.push({
      id: 'taxes-fees',
      label: 'Taxes & government fees',
      status: 'included',
      required: true,
      amount: taxAmount,
      currency,
    })

    const diff = Math.max(0, quotedTotal - (baseAmount + taxAmount))
    if (diff > 0) {
      lineItems.push({
        id: 'provider-fees',
        label: 'Provider/booking fees',
        status: 'included',
        required: true,
        amount: diff,
        currency,
      })
    }
  } else {
    lineItems.push({
      id: 'quoted-total',
      label: 'Quoted airfare (base + taxes)',
      status: 'included',
      required: true,
      amount: quotedTotal,
      currency,
    })
  }

  const bagAmount = getLowestServiceAmount(offer.available_services, 'baggage')
  const seatAmount = getLowestServiceAmount(offer.available_services, 'seat')

  if (preferences.preferences.checkedBag) {
    if (typeof bagAmount === 'number') {
      lineItems.push({
        id: 'checked-bag',
        label: 'Checked bag',
        status: 'extra',
        required: true,
        amount: bagAmount,
        currency,
        description: 'Added because checked baggage is required',
      })
    } else {
      lineItems.push({
        id: 'checked-bag',
        label: 'Checked bag',
        status: 'unknown',
        required: true,
        currency,
        description: 'Duffel did not return baggage pricing in this offer',
      })
    }
  } else {
    lineItems.push({
      id: 'checked-bag',
      label: 'Checked bag (optional)',
      status: typeof bagAmount === 'number' ? 'extra' : 'unknown',
      required: false,
      amount: bagAmount,
      currency,
    })
  }

  lineItems.push({
    id: 'seat-selection',
    label: 'Seat selection (optional)',
    status: typeof seatAmount === 'number' ? 'extra' : 'unknown',
    required: false,
    amount: seatAmount,
    currency,
  })

  const requiredKnownTotal = lineItems.reduce((sum, item) => {
    if (item.required && item.status !== 'unknown') {
      return sum + (item.amount || 0)
    }
    return sum
  }, 0)

  const optionalKnownTotal = lineItems.reduce((sum, item) => {
    if (!item.required && item.status === 'extra') {
      return sum + (item.amount || 0)
    }
    return sum
  }, 0)

  const unknownRequired = lineItems.some(item => item.required && item.status === 'unknown')
  const unknownAny = lineItems.some(item => item.status === 'unknown')
  const confidence: TotalCostEstimate['confidence'] = unknownRequired ? 'low' : unknownAny ? 'medium' : 'high'

  return {
    currency,
    headlineFare: quotedTotal,
    estimatedTotal: roundMoney(requiredKnownTotal),
    potentialTotal: roundMoney(requiredKnownTotal + optionalKnownTotal),
    confidence,
    lineItems,
  }
}

function mapCancellationPolicy(conditions?: DuffelOffer['conditions']): FlightOption['cancellationPolicy'] {
  const refundable = conditions?.refund_before_departure?.allowed
  const changeable = conditions?.change_before_departure?.allowed
  if (refundable) return 'flexible'
  if (changeable) return 'moderate'
  return 'strict'
}

function mapCabinClassForDuffel(cabinClass: TripPreferences['preferences']['cabinClass']): string {
  if (cabinClass === 'premium-economy') return 'premium_economy'
  return cabinClass
}

function mapCabinClassFromDuffel(cabinClass: string): FlightSegment['class'] {
  if (cabinClass === 'premium_economy') return 'premium-economy'
  if (cabinClass === 'business') return 'business'
  if (cabinClass === 'first') return 'first'
  return 'economy'
}

function toIataCode(input: string): string {
  const text = input.trim()
  const parenMatch = text.toUpperCase().match(/\(([A-Z]{3})\)/)
  if (parenMatch) return parenMatch[1]

  const directCode = text.toUpperCase().match(/\b[A-Z]{3}\b/)
  if (directCode) return directCode[0]

  const mapped = AIRPORT_ALIASES[text.toLowerCase()]
  if (mapped) return mapped

  const lettersOnly = text.replace(/[^a-zA-Z]/g, '').toUpperCase()
  return lettersOnly.slice(0, 3)
}

function getLayoverDurations(segments: FlightSegment[]): number[] {
  const layovers: number[] = []
  for (let i = 1; i < segments.length; i++) {
    const previousArrival = segments[i - 1].arrivalTime
    const nextDeparture = segments[i].departureTime
    const layoverMinutes = getMinutesBetween(previousArrival, nextDeparture)
    if (typeof layoverMinutes === 'number') {
      layovers.push(Math.max(0, layoverMinutes))
    }
  }
  return layovers
}

function getMinutesBetween(startIso: string, endIso: string): number | undefined {
  const start = new Date(startIso).getTime()
  const end = new Date(endIso).getTime()
  if (Number.isNaN(start) || Number.isNaN(end)) return undefined
  return Math.max(0, Math.round((end - start) / 60000))
}

function getLowestServiceAmount(services: DuffelService[] | undefined, type: string): number | undefined {
  if (!services || services.length === 0) return undefined
  const values = services
    .filter(service => service.type === type)
    .map(service => parseMoney(service.total_amount))
    .filter((amount): amount is number => typeof amount === 'number')

  if (values.length === 0) return undefined
  return Math.min(...values)
}

function parseDurationToMinutes(duration?: string): number | undefined {
  if (!duration) return undefined
  const match = duration.match(/P(?:\d+D)?T?(?:(\d+)H)?(?:(\d+)M)?/i)
  if (!match) return undefined
  const hours = Number(match[1] || 0)
  const minutes = Number(match[2] || 0)
  return hours * 60 + minutes
}

function parseMoney(amount?: string): number | undefined {
  if (!amount) return undefined
  const parsed = Number(amount)
  if (Number.isNaN(parsed)) return undefined
  return roundMoney(parsed)
}

function roundMoney(value: number): number {
  return Math.round(value)
}
