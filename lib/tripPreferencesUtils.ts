import { NormalizedTripConstraints, TravelConstraints, TripPreferences } from '@/types'

/**
 * Convert chatbot TravelConstraints to TripPreferences for the recommendation engine
 */
export function convertConstraintsToPreferences(
  constraints: TravelConstraints
): TripPreferences | null {
  // Validate required fields
  if (!constraints.origin || !constraints.destination) {
    return null
  }

  // Use current date if no departure date specified
  const departureDate = constraints.departureDate || new Date().toISOString().split('T')[0]
  
  // Default to round-trip if not specified
  const tripType = constraints.tripType || 'round-trip'
  
  // Calculate return date if round-trip and not specified
  let returnDate = constraints.returnDate
  if (tripType === 'round-trip' && !returnDate) {
    const departure = new Date(departureDate)
    departure.setDate(departure.getDate() + 7) // Default to 1 week trip
    returnDate = departure.toISOString().split('T')[0]
  }

  return {
    origin: constraints.origin,
    destination: constraints.destination,
    departureDate,
    returnDate,
    tripType,
    flexibleDates: constraints.flexibleDates || false,
    passengers: {
      adults: constraints.passengers || 1,
      children: 0,
      infants: 0,
    },
    maxBudget: constraints.budget || 10000,
    currency: 'USD',
    preferences: {
      cabinClass: constraints.cabinClass || 'economy',
      checkedBag: constraints.checkedBag || false,
      nonstopOnly: constraints.nonstopOnly || false,
      departureTimePreferences: constraints.departureTimePreference 
        ? [constraints.departureTimePreference] 
        : [],
      hotelNeeded: constraints.hotelNeeded || false,
    },
  }
}

/**
 * Validate that constraints have minimum required information
 */
export function validateConstraints(constraints: TravelConstraints): {
  isValid: boolean
  missingFields: string[]
} {
  const missingFields: string[] = []

  if (!constraints.origin) {
    missingFields.push('origin')
  }
  if (!constraints.destination) {
    missingFields.push('destination')
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  }
}

/**
 * Save trip preferences to session storage
 */
export function saveTripPreferences(preferences: TripPreferences): void {
  sessionStorage.setItem('tripPreferences', JSON.stringify(preferences))
}

/**
 * Load trip preferences from session storage
 */
export function loadTripPreferences(): TripPreferences | null {
  const stored = sessionStorage.getItem('tripPreferences')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }
  return null
}

/**
 * Clear trip preferences from session storage
 */
export function clearTripPreferences(): void {
  sessionStorage.removeItem('tripPreferences')
}

/**
 * Normalize TripPreferences into one canonical shape used by matching, scoring, and agents.
 */
export function normalizeTripPreferences(preferences: TripPreferences): NormalizedTripConstraints {
  const totalTravelers =
    preferences.passengers.adults +
    preferences.passengers.children +
    preferences.passengers.infants

  return {
    route: {
      origin: preferences.origin,
      destination: preferences.destination,
    },
    dates: {
      departureDate: preferences.departureDate,
      returnDate: preferences.returnDate,
      tripType: preferences.tripType,
      flexibleDates: preferences.flexibleDates,
    },
    travelers: {
      adults: preferences.passengers.adults,
      children: preferences.passengers.children,
      infants: preferences.passengers.infants,
      total: totalTravelers,
    },
    budget: {
      maxBudget: preferences.maxBudget,
      currency: preferences.currency,
    },
    preferences: {
      cabinClass: preferences.preferences.cabinClass,
      checkedBag: preferences.preferences.checkedBag,
      nonstopOnly: preferences.preferences.nonstopOnly,
      departureTimePreferences: preferences.preferences.departureTimePreferences,
      hotelNeeded: preferences.preferences.hotelNeeded,
    },
  }
}

/**
 * Normalize chat constraints by first converting to TripPreferences.
 */
export function normalizeTravelConstraints(constraints: TravelConstraints): NormalizedTripConstraints | null {
  const preferences = convertConstraintsToPreferences(constraints)
  if (!preferences) return null
  return normalizeTripPreferences(preferences)
}
