/**
 * Core TypeScript types for Roamly application
 */

// Trip preferences and constraints
export interface TripPreferences {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  tripType: 'one-way' | 'round-trip'
  flexibleDates: boolean
  passengers: {
    adults: number
    children: number
    infants: number
  }
  maxBudget: number
  currency: string
  preferences: {
    cabinClass: 'economy' | 'premium-economy' | 'business' | 'first'
    checkedBag: boolean
    nonstopOnly: boolean
    departureTimePreferences: string[] // e.g., ['morning', 'afternoon']
    hotelNeeded: boolean
  }
}

// Flight segment
export interface FlightSegment {
  id: string
  airline: string
  flightNumber: string
  departureAirport: string
  arrivalAirport: string
  departureTime: string
  arrivalTime: string
  duration: number // in minutes
  aircraft: string
  class: 'economy' | 'premium-economy' | 'business' | 'first'
}

// Complete flight option
export interface FlightOption {
  id: string
  segments: FlightSegment[]
  price: {
    amount: number
    currency: string
  }
  totalDuration: number // in minutes
  layoverCount: number
  layoverDurations: number[] // in minutes
  baggage: {
    carryOn: number
    checked: number
  }
  amenities: string[]
  cancellationPolicy: 'flexible' | 'moderate' | 'strict'
}

// AI-generated scores and insights
export interface TravelScore {
  overall: number // 0-100
  breakdown: {
    price: number // 0-100
    convenience: number // 0-100
    comfort: number // 0-100
    reliability: number // 0-100
    scheduleMatch: number // 0-100
  }
  insights: string[]
  priceAnalysis: {
    isPriceGood: boolean
    comparedToAverage: number // percentage difference
    trend: 'rising' | 'falling' | 'stable'
    recommendation: string
  }
}

// Complete recommendation with flight + analysis
export interface TravelRecommendation {
  flight: FlightOption
  score: TravelScore
  tags: string[] // e.g., "Best Value", "Fastest", "Most Comfortable"
  aiSummary: string
  alternativeOptions?: string[]
}

// User saved trip
export interface SavedTrip {
  id: string
  preferences: TripPreferences
  recommendations: TravelRecommendation[]
  createdAt: string
  status: 'planning' | 'booked' | 'completed'
}

// Dashboard statistics
export interface DashboardStats {
  totalTripsPlanned: number
  totalSaved: number
  averageScore: number
  recentSearches: Array<{
    id: string
    route: string
    date: string
  }>
}
