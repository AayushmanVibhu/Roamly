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

// Normalized constraints used across chat + form ingestion
export interface NormalizedTripConstraints {
  route: {
    origin: string
    destination: string
  }
  dates: {
    departureDate: string
    returnDate?: string
    tripType: 'one-way' | 'round-trip'
    flexibleDates: boolean
  }
  travelers: {
    adults: number
    children: number
    infants: number
    total: number
  }
  budget: {
    maxBudget: number
    currency: string
  }
  preferences: {
    cabinClass: 'economy' | 'premium-economy' | 'business' | 'first'
    checkedBag: boolean
    nonstopOnly: boolean
    departureTimePreferences: string[]
    hotelNeeded: boolean
  }
}

export type CostItemStatus = 'included' | 'extra' | 'unknown'
export type CostConfidence = 'high' | 'medium' | 'low'

export interface CostLineItem {
  id: string
  label: string
  status: CostItemStatus
  required: boolean
  amount?: number
  currency: string
  description?: string
}

export interface TotalCostEstimate {
  currency: string
  headlineFare: number
  estimatedTotal: number
  potentialTotal: number
  confidence: CostConfidence
  lineItems: CostLineItem[]
}

export type ConstraintKey =
  | 'budget'
  | 'nonstop'
  | 'checkedBag'
  | 'cabinClass'
  | 'departureTime'

export interface ConstraintMatchItem {
  key: ConstraintKey
  label: string
  expectedValue: string
  actualValue: string
  reason: string
}

export interface ConstraintMatchSummary {
  isFullMatch: boolean
  matchedCount: number
  totalChecked: number
  matchedConstraints: ConstraintMatchItem[]
  missedConstraints: ConstraintMatchItem[]
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
  totalCost: TotalCostEstimate
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
  constraintMatch: ConstraintMatchSummary
  tags: string[] // e.g., "Best Value", "Fastest", "Most Comfortable"
  aiSummary: string
  alternativeOptions?: string[]
}

export type TravelWatchStatus = 'active' | 'paused' | 'matched' | 'cancelled'

export interface WatchMatchSnapshot {
  recommendationId: string
  estimatedTotal: number
  currency: string
  matchedAt: string
  summary: string
}

export interface TravelWatch {
  id: string
  email: string
  preferences: TripPreferences
  targetPrice: number
  checkIntervalMinutes: number
  status: TravelWatchStatus
  createdAt: string
  updatedAt: string
  lastCheckedAt?: string
  lastNotifiedAt?: string
  latestMatch?: WatchMatchSnapshot
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

// AI Chat Interface Types
export interface QuickReply {
  label: string
  field: keyof TravelConstraints
  value: any
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  extractedConstraints?: Partial<TravelConstraints>
  quickReplies?: QuickReply[]
}

// Simplified travel constraints for chat extraction
export interface TravelConstraints {
  origin?: string
  destination?: string
  departureDate?: string
  returnDate?: string
  tripType?: 'one-way' | 'round-trip'
  budget?: number
  passengers?: number
  cabinClass?: 'economy' | 'premium-economy' | 'business' | 'first'
  checkedBag?: boolean
  nonstopOnly?: boolean
  departureTimePreference?: 'morning' | 'afternoon' | 'evening' | 'night'
  hotelNeeded?: boolean
  flexibleDates?: boolean
}

export interface QuickConstraint {
  id: string
  label: string
  icon: string
  field: keyof TravelConstraints
  value: any
}
