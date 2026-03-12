/**
 * Utility functions for Roamly application
 */

/**
 * Format duration from minutes to human-readable format
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

/**
 * Format ISO date string to readable date
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

/**
 * Format ISO date string to time
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

/**
 * Format price with currency symbol
 */
export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Calculate total passengers
 */
export function getTotalPassengers(passengers: {
  adults: number
  children: number
  infants: number
}): number {
  return passengers.adults + passengers.children + passengers.infants
}

/**
 * Get score color class based on score value
 */
export function getScoreColorClass(score: number): string {
  if (score >= 90) return 'text-green-600 bg-green-100 border-green-600'
  if (score >= 80) return 'text-blue-600 bg-blue-100 border-blue-600'
  if (score >= 70) return 'text-yellow-600 bg-yellow-100 border-yellow-600'
  return 'text-orange-600 bg-orange-100 border-orange-600'
}

/**
 * Get score label based on score value
 */
export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent'
  if (score >= 80) return 'Great'
  if (score >= 70) return 'Good'
  return 'Fair'
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Calculate days until departure
 */
export function getDaysUntilDeparture(departureDate: string): number {
  const departure = new Date(departureDate)
  const today = new Date()
  const diffTime = departure.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Check if booking is in advance booking window
 */
export function isAdvanceBooking(departureDate: string, minDays: number = 21): boolean {
  return getDaysUntilDeparture(departureDate) >= minDays
}

/**
 * Generate airport code from city name (simplified)
 * In production, would use a real airport database
 */
export function getAirportCode(cityOrCode: string): string {
  const airportMap: Record<string, string> = {
    'san francisco': 'SFO',
    'new york': 'JFK',
    'los angeles': 'LAX',
    'chicago': 'ORD',
    'miami': 'MIA',
    'boston': 'BOS',
    'seattle': 'SEA',
    'atlanta': 'ATL',
    'dallas': 'DFW',
    'denver': 'DEN'
  }
  
  const normalized = cityOrCode.toLowerCase().trim()
  return airportMap[normalized] || cityOrCode.toUpperCase()
}

/**
 * Slugify string for URL-safe identifiers
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}
