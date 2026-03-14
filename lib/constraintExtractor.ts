import { TravelConstraints } from '@/types'

/**
 * Robust travel constraint extraction from natural language
 * 
 * Test cases:
 * - "I'd like to fly from New York to Los Angeles on 12th March"
 *   → origin: New York (NYC), destination: Los Angeles (LAX), date: 2026-03-12
 * 
 * - "Fly from Phoenix to Boston on March 18 under $400"
 *   → origin: Phoenix (PHX), destination: Boston (BOS), date: 2026-03-18, budget: 400
 * 
 * - "from Chicago to Miami with one checked bag"
 *   → origin: Chicago (ORD), destination: Miami (MIA), checkedBag: true
 */

// Common airport codes and cities mapping
const AIRPORTS: Record<string, string> = {
  // Major US cities
  'new york': 'New York (NYC)',
  'nyc': 'New York (NYC)',
  'new york city': 'New York (NYC)',
  'jfk': 'New York (JFK)',
  'lga': 'New York (LGA)',
  'ewr': 'Newark (EWR)',
  'newark': 'Newark (EWR)',
  'los angeles': 'Los Angeles (LAX)',
  'la': 'Los Angeles (LAX)',
  'lax': 'Los Angeles (LAX)',
  'san francisco': 'San Francisco (SFO)',
  'sf': 'San Francisco (SFO)',
  'sfo': 'San Francisco (SFO)',
  'chicago': 'Chicago (ORD)',
  'ord': 'Chicago (ORD)',
  'mdw': 'Chicago (MDW)',
  'miami': 'Miami (MIA)',
  'mia': 'Miami (MIA)',
  'phoenix': 'Phoenix (PHX)',
  'phx': 'Phoenix (PHX)',
  'seattle': 'Seattle (SEA)',
  'sea': 'Seattle (SEA)',
  'boston': 'Boston (BOS)',
  'bos': 'Boston (BOS)',
  'denver': 'Denver (DEN)',
  'den': 'Denver (DEN)',
  'dallas': 'Dallas (DFW)',
  'dfw': 'Dallas (DFW)',
  'atlanta': 'Atlanta (ATL)',
  'atl': 'Atlanta (ATL)',
  'las vegas': 'Las Vegas (LAS)',
  'vegas': 'Las Vegas (LAS)',
  'las': 'Las Vegas (LAS)',
  'orlando': 'Orlando (MCO)',
  'mco': 'Orlando (MCO)',
  'portland': 'Portland (PDX)',
  'pdx': 'Portland (PDX)',
  'austin': 'Austin (AUS)',
  'aus': 'Austin (AUS)',
  'houston': 'Houston (IAH)',
  'iah': 'Houston (IAH)',
  'washington': 'Washington (DCA)',
  'dc': 'Washington (DCA)',
  'dca': 'Washington (DCA)',
  'iad': 'Washington Dulles (IAD)',
  'philadelphia': 'Philadelphia (PHL)',
  'philly': 'Philadelphia (PHL)',
  'phl': 'Philadelphia (PHL)',
  'san diego': 'San Diego (SAN)',
  'san': 'San Diego (SAN)',
  'tampa': 'Tampa (TPA)',
  'tpa': 'Tampa (TPA)',
  'nashville': 'Nashville (BNA)',
  'bna': 'Nashville (BNA)',
  'detroit': 'Detroit (DTW)',
  'dtw': 'Detroit (DTW)',
  'minneapolis': 'Minneapolis (MSP)',
  'msp': 'Minneapolis (MSP)',
  'salt lake city': 'Salt Lake City (SLC)',
  'slc': 'Salt Lake City (SLC)',
  
  // International
  'london': 'London (LHR)',
  'lhr': 'London (LHR)',
  'paris': 'Paris (CDG)',
  'cdg': 'Paris (CDG)',
  'tokyo': 'Tokyo (NRT)',
  'nrt': 'Tokyo (NRT)',
  'hnd': 'Tokyo (HND)',
  'dubai': 'Dubai (DXB)',
  'dxb': 'Dubai (DXB)',
  'singapore': 'Singapore (SIN)',
  'sin': 'Singapore (SIN)',
  'rome': 'Rome (FCO)',
  'fco': 'Rome (FCO)',
  'barcelona': 'Barcelona (BCN)',
  'bcn': 'Barcelona (BCN)',
  'amsterdam': 'Amsterdam (AMS)',
  'ams': 'Amsterdam (AMS)',
  'sydney': 'Sydney (SYD)',
  'syd': 'Sydney (SYD)',
  'toronto': 'Toronto (YYZ)',
  'yyz': 'Toronto (YYZ)',
  'mexico city': 'Mexico City (MEX)',
  'mex': 'Mexico City (MEX)',
  'cancun': 'Cancun (CUN)',
  'cun': 'Cancun (CUN)',
  'madrid': 'Madrid (MAD)',
  'mad': 'Madrid (MAD)',
  'frankfurt': 'Frankfurt (FRA)',
  'fra': 'Frankfurt (FRA)',
  'hong kong': 'Hong Kong (HKG)',
  'hkg': 'Hong Kong (HKG)',
  'bangkok': 'Bangkok (BKK)',
  'bkk': 'Bangkok (BKK)',
}

// Month names for date parsing
const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
]

/**
 * Normalize user message for consistent parsing
 * - Convert to lowercase
 * - Remove filler phrases
 * - Collapse whitespace
 */
function normalizeMessage(text: string): string {
  let normalized = text.toLowerCase()
  
  // Remove common filler phrases
  const fillers = [
    "i'd like to",
    "i would like to",
    "i want to",
    "i need to",
    "can you help me",
    "could you help me",
    "please help me",
    "help me",
    "i'm looking to",
    "looking to",
    "i am planning to",
    "planning to",
  ]
  
  for (const filler of fillers) {
    normalized = normalized.replace(new RegExp(filler, 'gi'), '')
  }
  
  // Collapse multiple spaces
  normalized = normalized.replace(/\s+/g, ' ').trim()
  
  return normalized
}

/**
 * Extract route using explicit "from X to Y" pattern
 * Returns {origin, destination} or null if pattern not found
 */
function extractRoute(text: string): { origin?: string; destination?: string } {
  const result: { origin?: string; destination?: string } = {}
  
  // Normalize the text
  const normalized = normalizeMessage(text)
  
  // Pattern: "from <origin> to <destination>"
  // This ensures we only split on "to" when it follows "from"
  const routeMatch = normalized.match(/\bfrom\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+?)(?:\s+on|\s+in|\s+under|\s+with|\s+for|\s+next|\s+this|$)/i)
  
  if (routeMatch) {
    const originText = routeMatch[1].trim()
    const destinationText = routeMatch[2].trim()
    
    // Match against airport dictionary
    result.origin = matchAirport(originText)
    result.destination = matchAirport(destinationText)
  }
  
  return result
}

/**
 * Match location text against airport dictionary
 * Supports exact matches and fuzzy matching
 */
function matchAirport(locationText: string): string | undefined {
  const location = locationText.toLowerCase().trim()
  
  // Exact match
  if (AIRPORTS[location]) {
    return AIRPORTS[location]
  }
  
  // Fuzzy match - check if location contains or is contained in any airport key
  for (const [key, value] of Object.entries(AIRPORTS)) {
    if (location.includes(key) || key.includes(location)) {
      return value
    }
  }
  
  // If no match, return title case version
  return toTitleCase(locationText)
}

/**
 * Extract date using explicit day + month parsing
 * Avoids timezone bugs by using local date construction
 * 
 * Supports formats:
 * - "12 March", "12th March" 
 * - "March 12", "March 12th"
 * - "on 12th March", "on March 12"
 */
function extractDate(text: string): string | undefined {
  const normalized = normalizeMessage(text)
  
  // Pattern 1: Day before month (12 March, 12th March, 12th of March)
  const dayFirstMatch = normalized.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(january|february|march|april|may|june|july|august|september|october|november|december)\b/i)
  
  if (dayFirstMatch) {
    const day = parseInt(dayFirstMatch[1])
    const monthName = dayFirstMatch[2].toLowerCase()
    return buildDate(day, monthName)
  }
  
  // Pattern 2: Month before day (March 12, March 12th)
  const monthFirstMatch = normalized.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i)
  
  if (monthFirstMatch) {
    const monthName = monthFirstMatch[1].toLowerCase()
    const day = parseInt(monthFirstMatch[2])
    return buildDate(day, monthName)
  }
  
  // Fallback to relative dates
  return extractRelativeDate(normalized)
}

/**
 * Build a date in YYYY-MM-DD format from day and month
 * Uses current year or next year if date is in the past
 * Avoids timezone bugs by using year/month/day constructor
 */
function buildDate(day: number, monthName: string): string {
  const monthIndex = MONTH_NAMES.indexOf(monthName.toLowerCase())
  
  if (monthIndex === -1 || day < 1 || day > 31) {
    return ''
  }
  
  // Get current date components
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const currentDay = now.getDate()
  
  // Create date in current year
  let year = currentYear
  
  // If date is in the past, use next year
  if (monthIndex < currentMonth || (monthIndex === currentMonth && day < currentDay)) {
    year = currentYear + 1
  }
  
  // Build date string manually to avoid timezone issues
  const monthStr = String(monthIndex + 1).padStart(2, '0')
  const dayStr = String(day).padStart(2, '0')
  
  return `${year}-${monthStr}-${dayStr}`
}

/**
 * Extract relative dates (tomorrow, next week, etc.)
 */
function extractRelativeDate(normalized: string): string | undefined {
  const today = new Date()
  
  if (/\btomorrow\b/.test(normalized)) {
    return addDays(today, 1)
  }
  
  if (/\btoday\b/.test(normalized)) {
    return formatDate(today)
  }
  
  if (/\bnext week\b/.test(normalized)) {
    return addDays(today, 7)
  }
  
  if (/\bthis weekend\b/.test(normalized)) {
    // Find upcoming Friday
    const dayOfWeek = today.getDay()
    const daysUntilFriday = dayOfWeek === 5 ? 0 : (5 - dayOfWeek + 7) % 7
    return addDays(today, daysUntilFriday)
  }
  
  if (/\bnext month\b/.test(normalized)) {
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    return formatDate(nextMonth)
  }
  
  return undefined
}

/**
 * Add days to a date and return YYYY-MM-DD string
 */
function addDays(date: Date, days: number): string {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
  return formatDate(result)
}

/**
 * Format date as YYYY-MM-DD without timezone issues
 */
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Extract budget from text
 * Only accepts amounts between $100-$50,000
 */
function extractBudget(text: string): number | undefined {
  const normalized = normalizeMessage(text)
  
  const patterns = [
    /\bunder\s+\$?(\d{3,5})\b/i,
    /\bbelow\s+\$?(\d{3,5})\b/i,
    /\bless than\s+\$?(\d{3,5})\b/i,
    /\bmax(?:imum)?\s+\$?(\d{3,5})\b/i,
    /\bbudget\s+(?:of\s+)?\$?(\d{3,5})\b/i,
    /\$(\d{3,5})\s+(?:budget|max|limit)/i,
    /\$(\d{3,5})\b/i, // Standalone dollar amount
  ]

  for (const pattern of patterns) {
    const match = normalized.match(pattern)
    if (match) {
      const amount = parseInt(match[1])
      // Validate range
      if (amount >= 100 && amount <= 50000) {
        return amount
      }
    }
  }
  
  return undefined
}

/**
 * Extract trip type (one-way or round-trip)
 */
function extractTripType(text: string): 'one-way' | 'round-trip' | undefined {
  const normalized = normalizeMessage(text)
  
  if (/\bone.?way\b|\bsingle trip\b/i.test(normalized)) {
    return 'one-way'
  }
  if (/\bround.?trip\b|\breturn\b|\bcoming back\b/i.test(normalized)) {
    return 'round-trip'
  }
  
  return undefined
}

/**
 * Extract number of passengers
 */
function extractPassengers(text: string): number | undefined {
  const normalized = normalizeMessage(text)
  
  const patterns = [
    /\b(\d+)\s+(?:passenger|person|people|traveler|adult)s?\b/i,
  ]

  for (const pattern of patterns) {
    const match = normalized.match(pattern)
    if (match) {
      const count = parseInt(match[1])
      if (count > 0 && count <= 9) {
        return count
      }
    }
  }

  // Solo travel indicators
  if (/\b(?:solo|alone)\b/i.test(normalized)) {
    return 1
  }

  return undefined
}

/**
 * Extract cabin class preference
 */
function extractCabinClass(text: string): TravelConstraints['cabinClass'] | undefined {
  const normalized = normalizeMessage(text)
  
  if (/\bfirst.?class\b/i.test(normalized)) {
    return 'first'
  }
  if (/\bbusiness.?class\b|\bbusiness\b/i.test(normalized)) {
    return 'business'
  }
  if (/\bpremium.?economy\b/i.test(normalized)) {
    return 'premium-economy'
  }
  if (/\beconomy\b|\bcoach\b/i.test(normalized)) {
    return 'economy'
  }
  
  return undefined
}

/**
 * Extract nonstop preference
 */
function extractNonstopPreference(text: string): boolean | undefined {
  const normalized = normalizeMessage(text)
  
  if (/\bnonstop\b|\bnon.?stop\b|\bdirect\b|\bno layover\b|\bno stop/i.test(normalized)) {
    return true
  }
  if (/\bany flight\b|\blayover ok\b|\bstops? (?:are )?(?:ok|fine|acceptable)/i.test(normalized)) {
    return false
  }
  
  return undefined
}

/**
 * Extract checked bag preference
 */
function extractCheckedBag(text: string): boolean | undefined {
  const normalized = normalizeMessage(text)
  
  const patterns = [
    /\b(?:with|need|include|has)\s+(?:a |one |my )?checked bag\b/i,
    /\b(?:with|need|include|has)\s+(?:a |one |my )?(?:suitcase|luggage)\b/i,
    /\b(\d+)\s*checked bag/i,
    /\bone checked bag\b/i,
  ]

  for (const pattern of patterns) {
    if (pattern.test(normalized)) {
      return true
    }
  }

  if (/\bno (?:checked )?bag\b|\bcarry.?on only\b|\bjust carry.?on\b/i.test(normalized)) {
    return false
  }

  return undefined
}

/**
 * Extract flexible dates preference
 */
function extractFlexibleDates(text: string): boolean | undefined {
  const normalized = normalizeMessage(text)
  
  if (/\bflexible\b|\bany (?:date|day|time)\b/i.test(normalized)) {
    return true
  }
  
  return undefined
}

/**
 * Extract departure time preference
 */
function extractDepartureTime(text: string): TravelConstraints['departureTimePreference'] | undefined {
  const normalized = normalizeMessage(text)
  
  if (/\bmorning\b|\bearly\b|\bam\b|[6-9]am\b/i.test(normalized)) {
    return 'morning'
  }
  if (/\bafternoon\b|\bmidday\b|\bnoon\b|[1-3]pm\b/i.test(normalized)) {
    return 'afternoon'
  }
  if (/\bevening\b|\blate\b|[6-9]pm\b/i.test(normalized)) {
    return 'evening'
  }
  if (/\bred.?eye\b|\bovernight\b|\bmidnight\b/i.test(normalized)) {
    return 'night'
  }
  
  return undefined
}

/**
 * Extract hotel need
 */
function extractHotelNeed(text: string): boolean | undefined {
  const normalized = normalizeMessage(text)
  
  if (/\bneed.*hotel\b|\bhotel.*needed\b|\b(?:with|including) (?:a )?hotel\b|\baccommodation\b/i.test(normalized)) {
    return true
  }
  if (/\bno hotel\b/i.test(normalized)) {
    return false
  }
  
  return undefined
}

/**
 * Helper: Title case conversion
 */
function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
}

/**
 * Main extraction function - parses user message and extracts all constraints
 * Uses modular approach for maintainability
 */
export function extractConstraints(text: string): Partial<TravelConstraints> {
  const constraints: Partial<TravelConstraints> = {}

  // Extract route (origin and destination)
  const route = extractRoute(text)
  if (route.origin) constraints.origin = route.origin
  if (route.destination) constraints.destination = route.destination

  // Extract date
  const departureDate = extractDate(text)
  if (departureDate) constraints.departureDate = departureDate

  // Extract budget
  const budget = extractBudget(text)
  if (budget) constraints.budget = budget

  // Extract trip type
  const tripType = extractTripType(text)
  if (tripType) constraints.tripType = tripType

  // Extract passengers
  const passengers = extractPassengers(text)
  if (passengers) constraints.passengers = passengers

  // Extract cabin class
  const cabinClass = extractCabinClass(text)
  if (cabinClass) constraints.cabinClass = cabinClass

  // Extract nonstop preference
  const nonstopOnly = extractNonstopPreference(text)
  if (nonstopOnly !== undefined) constraints.nonstopOnly = nonstopOnly

  // Extract checked bag
  const checkedBag = extractCheckedBag(text)
  if (checkedBag !== undefined) constraints.checkedBag = checkedBag

  // Extract flexible dates
  const flexibleDates = extractFlexibleDates(text)
  if (flexibleDates !== undefined) constraints.flexibleDates = flexibleDates

  // Extract departure time
  const departureTimePreference = extractDepartureTime(text)
  if (departureTimePreference) constraints.departureTimePreference = departureTimePreference

  // Extract hotel need
  const hotelNeeded = extractHotelNeed(text)
  if (hotelNeeded !== undefined) constraints.hotelNeeded = hotelNeeded

  return constraints
}

/**
 * Generate a natural language confirmation of extracted constraints
 */
export function generateConfirmation(extracted: Partial<TravelConstraints>): string {
  const parts: string[] = []

  if (extracted.origin && extracted.destination) {
    parts.push(`Flying from ${extracted.origin} to ${extracted.destination}`)
  } else if (extracted.origin) {
    parts.push(`Departing from ${extracted.origin}`)
  } else if (extracted.destination) {
    parts.push(`Going to ${extracted.destination}`)
  }

  if (extracted.departureDate) {
    parts.push(`departing ${new Date(extracted.departureDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`)
  }

  if (extracted.returnDate) {
    parts.push(`returning ${new Date(extracted.returnDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`)
  }

  if (extracted.tripType) {
    parts.push(`(${extracted.tripType})`)
  }

  if (extracted.budget) {
    parts.push(`with a budget of $${extracted.budget}`)
  }

  if (extracted.passengers && extracted.passengers > 1) {
    parts.push(`for ${extracted.passengers} passengers`)
  } else if (extracted.passengers === 1) {
    parts.push(`for 1 passenger`)
  }

  if (extracted.cabinClass && extracted.cabinClass !== 'economy') {
    parts.push(`in ${extracted.cabinClass.replace('-', ' ')}`)
  }

  if (extracted.nonstopOnly) {
    parts.push(`(nonstop only)`)
  }

  if (extracted.checkedBag) {
    parts.push(`with checked baggage`)
  }

  if (extracted.departureTimePreference) {
    parts.push(`preferring ${extracted.departureTimePreference} departure`)
  }

  if (extracted.flexibleDates) {
    parts.push(`with flexible dates`)
  }

  if (extracted.hotelNeeded) {
    parts.push(`and hotel needed`)
  }

  return parts.join(', ') + '.'
}

