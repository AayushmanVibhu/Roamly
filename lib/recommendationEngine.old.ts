/**
 * Recommendation Engine Interface
 * Prepares form data for the AI recommendation engine
 */

import { TripPreferences } from '@/types'

/**
 * Format trip preferences for recommendation engine API
 */
export interface RecommendationRequest {
  // Core trip details
  route: {
    origin: string
    destination: string
    departureDate: string
    returnDate?: string
    tripType: 'one-way' | 'round-trip'
  }
  
  // Passenger information
  passengers: {
    adults: number
    children: number
    infants: number
    total: number
  }
  
  // Budget constraints
  budget: {
    maxPerPerson: number
    totalMax: number
    currency: string
  }
  
  // Flight preferences
  flightPreferences: {
    cabinClass: string
    nonstopOnly: boolean
    checkedBagRequired: boolean
    departureTimeWindows: string[]
    flexibleDates: boolean
    flexibilityDays?: number
  }
  
  // Additional services
  additionalServices: {
    hotelRequired: boolean
  }
  
  // Metadata
  metadata: {
    searchTimestamp: string
    userTimezone: string
  }
}

/**
 * Transform form data to recommendation engine request format
 */
export function prepareRecommendationRequest(
  preferences: TripPreferences
): RecommendationRequest {
  const totalPassengers = 
    preferences.passengers.adults + 
    preferences.passengers.children + 
    preferences.passengers.infants

  const totalBudget = preferences.maxBudget * totalPassengers

  return {
    route: {
      origin: preferences.origin.toUpperCase().trim(),
      destination: preferences.destination.toUpperCase().trim(),
      departureDate: preferences.departureDate,
      returnDate: preferences.returnDate,
      tripType: preferences.tripType
    },
    
    passengers: {
      adults: preferences.passengers.adults,
      children: preferences.passengers.children,
      infants: preferences.passengers.infants,
      total: totalPassengers
    },
    
    budget: {
      maxPerPerson: preferences.maxBudget,
      totalMax: totalBudget,
      currency: preferences.currency
    },
    
    flightPreferences: {
      cabinClass: preferences.preferences.cabinClass,
      nonstopOnly: preferences.preferences.nonstopOnly,
      checkedBagRequired: preferences.preferences.checkedBag,
      departureTimeWindows: preferences.preferences.departureTimePreferences,
      flexibleDates: preferences.flexibleDates,
      flexibilityDays: preferences.flexibleDates ? 3 : 0
    },
    
    additionalServices: {
      hotelRequired: preferences.preferences.hotelNeeded
    },
    
    metadata: {
      searchTimestamp: new Date().toISOString(),
      userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }
}

/**
 * Validate recommendation request before sending
 */
export function validateRecommendationRequest(
  request: RecommendationRequest
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate route
  if (!request.route.origin || request.route.origin.length < 3) {
    errors.push('Invalid origin airport')
  }
  if (!request.route.destination || request.route.destination.length < 3) {
    errors.push('Invalid destination airport')
  }
  if (request.route.origin === request.route.destination) {
    errors.push('Origin and destination cannot be the same')
  }

  // Validate dates
  const departureDate = new Date(request.route.departureDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (departureDate < today) {
    errors.push('Departure date cannot be in the past')
  }

  if (request.route.tripType === 'round-trip' && request.route.returnDate) {
    const returnDate = new Date(request.route.returnDate)
    if (returnDate <= departureDate) {
      errors.push('Return date must be after departure date')
    }
  }

  // Validate passengers
  if (request.passengers.total < 1 || request.passengers.total > 9) {
    errors.push('Total passengers must be between 1 and 9')
  }

  // Validate budget
  if (request.budget.maxPerPerson < 50) {
    errors.push('Budget per person must be at least $50')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Simulate API call to recommendation engine
 * In production, this would make an actual HTTP request
 */
export async function fetchRecommendations(
  preferences: TripPreferences
): Promise<any> {
  // Prepare the request
  const request = prepareRecommendationRequest(preferences)
  
  // Validate the request
  const validation = validateRecommendationRequest(request)
  if (!validation.valid) {
    throw new Error(`Invalid request: ${validation.errors.join(', ')}`)
  }

  // Log the request (for debugging)
  console.log('Recommendation Engine Request:', JSON.stringify(request, null, 2))

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  // In production, this would be:
  // const response = await fetch('/api/recommendations', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(request)
  // })
  // return response.json()

  // For now, return success
  return {
    success: true,
    requestId: `REQ-${Date.now()}`,
    message: 'Mock recommendations generated'
  }
}

/**
 * Calculate search score based on preferences
 * This helps prioritize certain criteria in the recommendation algorithm
 */
export function calculateSearchPriorities(preferences: TripPreferences): {
  priceWeight: number
  timeWeight: number
  comfortWeight: number
  convenienceWeight: number
} {
  // Default weights
  let priceWeight = 0.4
  let timeWeight = 0.2
  let comfortWeight = 0.2
  let convenienceWeight = 0.2

  // Adjust based on budget (lower budget = higher price weight)
  if (preferences.maxBudget < 300) {
    priceWeight = 0.6
    comfortWeight = 0.1
  } else if (preferences.maxBudget > 1000) {
    priceWeight = 0.2
    comfortWeight = 0.4
  }

  // Adjust based on cabin class
  if (preferences.preferences.cabinClass === 'business' || 
      preferences.preferences.cabinClass === 'first') {
    comfortWeight = 0.4
    priceWeight = 0.2
  }

  // Adjust if nonstop only
  if (preferences.preferences.nonstopOnly) {
    timeWeight = 0.3
    convenienceWeight = 0.3
    priceWeight = 0.3
  }

  // Normalize weights to sum to 1
  const total = priceWeight + timeWeight + comfortWeight + convenienceWeight
  return {
    priceWeight: priceWeight / total,
    timeWeight: timeWeight / total,
    comfortWeight: comfortWeight / total,
    convenienceWeight: convenienceWeight / total
  }
}
