/**
 * Mock travel data for development and testing
 * This file contains sample flight options and recommendations
 */

import { 
  FlightOption, 
  TravelRecommendation, 
  TravelScore,
  SavedTrip,
  DashboardStats,
  TotalCostEstimate,
} from '@/types'

function createMockTotalCost(estimatedTotal: number, currency: string, checkedBagIncluded: boolean): TotalCostEstimate {
  const headlineFare = Math.round(estimatedTotal * 0.72)
  const taxesAndFees = Math.round(estimatedTotal * 0.20)
  const serviceFee = estimatedTotal - headlineFare - taxesAndFees

  return {
    currency,
    headlineFare,
    estimatedTotal,
    potentialTotal: estimatedTotal + (checkedBagIncluded ? 25 : 60),
    confidence: 'high',
    lineItems: [
      {
        id: 'base-fare',
        label: 'Base fare',
        status: 'included',
        required: true,
        amount: headlineFare,
        currency,
      },
      {
        id: 'taxes-fees',
        label: 'Taxes & government fees',
        status: 'included',
        required: true,
        amount: taxesAndFees,
        currency,
      },
      {
        id: 'service-fee',
        label: 'Booking/service fee',
        status: 'included',
        required: true,
        amount: serviceFee,
        currency,
      },
      {
        id: checkedBagIncluded ? 'checked-bag-included' : 'checked-bag-optional',
        label: 'Checked bag',
        status: checkedBagIncluded ? 'included' : 'extra',
        required: false,
        amount: checkedBagIncluded ? 0 : 35,
        currency,
      },
      {
        id: 'seat-selection',
        label: 'Seat selection (optional)',
        status: 'extra',
        required: false,
        amount: 25,
        currency,
      },
    ],
  }
}

// Mock flight options
export const mockFlightOptions: FlightOption[] = [
  {
    id: 'FL001',
    segments: [
      {
        id: 'SEG001',
        airline: 'United Airlines',
        flightNumber: 'UA 1234',
        departureAirport: 'SFO',
        arrivalAirport: 'JFK',
        departureTime: '2026-04-15T08:00:00',
        arrivalTime: '2026-04-15T16:30:00',
        duration: 330,
        aircraft: 'Boeing 737',
        class: 'economy'
      }
    ],
    price: {
      amount: 289,
      currency: 'USD'
    },
    totalCost: createMockTotalCost(289, 'USD', false),
    totalDuration: 330,
    layoverCount: 0,
    layoverDurations: [],
    baggage: {
      carryOn: 1,
      checked: 0
    },
    amenities: ['WiFi', 'In-flight Entertainment', 'Power Outlets'],
    cancellationPolicy: 'moderate'
  },
  {
    id: 'FL002',
    segments: [
      {
        id: 'SEG002',
        airline: 'Delta',
        flightNumber: 'DL 5678',
        departureAirport: 'SFO',
        arrivalAirport: 'ATL',
        departureTime: '2026-04-15T09:30:00',
        arrivalTime: '2026-04-15T17:15:00',
        duration: 225,
        aircraft: 'Airbus A320',
        class: 'economy'
      },
      {
        id: 'SEG003',
        airline: 'Delta',
        flightNumber: 'DL 9012',
        departureAirport: 'ATL',
        arrivalAirport: 'JFK',
        departureTime: '2026-04-15T19:00:00',
        arrivalTime: '2026-04-15T21:15:00',
        duration: 135,
        aircraft: 'Boeing 757',
        class: 'economy'
      }
    ],
    price: {
      amount: 245,
      currency: 'USD'
    },
    totalCost: createMockTotalCost(245, 'USD', true),
    totalDuration: 585,
    layoverCount: 1,
    layoverDurations: [105],
    baggage: {
      carryOn: 1,
      checked: 1
    },
    amenities: ['WiFi', 'In-flight Entertainment', 'Free Snacks'],
    cancellationPolicy: 'flexible'
  },
  {
    id: 'FL003',
    segments: [
      {
        id: 'SEG004',
        airline: 'JetBlue',
        flightNumber: 'B6 2468',
        departureAirport: 'SFO',
        arrivalAirport: 'JFK',
        departureTime: '2026-04-15T14:00:00',
        arrivalTime: '2026-04-15T22:45:00',
        duration: 345,
        aircraft: 'Airbus A321',
        class: 'economy'
      }
    ],
    price: {
      amount: 312,
      currency: 'USD'
    },
    totalCost: createMockTotalCost(312, 'USD', true),
    totalDuration: 345,
    layoverCount: 0,
    layoverDurations: [],
    baggage: {
      carryOn: 1,
      checked: 1
    },
    amenities: ['WiFi', 'In-flight Entertainment', 'Free Snacks', 'Extra Legroom'],
    cancellationPolicy: 'flexible'
  },
  {
    id: 'FL004',
    segments: [
      {
        id: 'SEG005',
        airline: 'American Airlines',
        flightNumber: 'AA 3691',
        departureAirport: 'SFO',
        arrivalAirport: 'DFW',
        departureTime: '2026-04-15T06:30:00',
        arrivalTime: '2026-04-15T11:45:00',
        duration: 195,
        aircraft: 'Boeing 737',
        class: 'economy'
      },
      {
        id: 'SEG006',
        airline: 'American Airlines',
        flightNumber: 'AA 4820',
        departureAirport: 'DFW',
        arrivalAirport: 'JFK',
        departureTime: '2026-04-15T15:30:00',
        arrivalTime: '2026-04-15T19:45:00',
        duration: 195,
        aircraft: 'Airbus A319',
        class: 'economy'
      }
    ],
    price: {
      amount: 199,
      currency: 'USD'
    },
    totalCost: createMockTotalCost(199, 'USD', false),
    totalDuration: 615,
    layoverCount: 1,
    layoverDurations: [225],
    baggage: {
      carryOn: 1,
      checked: 0
    },
    amenities: ['In-flight Entertainment'],
    cancellationPolicy: 'strict'
  }
]

// Mock travel scores
export const mockTravelScores: Record<string, TravelScore> = {
  'FL001': {
    overall: 92,
    breakdown: {
      price: 85,
      convenience: 98,
      comfort: 88,
      reliability: 93,
      scheduleMatch: 96
    },
    insights: [
      'Non-stop flight saves 4+ hours',
      'Departure time is ideal for business travelers',
      'Price is 8% below average for this route',
      'United has 91% on-time performance on this route'
    ],
    priceAnalysis: {
      isPriceGood: true,
      comparedToAverage: -8,
      trend: 'rising',
      recommendation: 'Good time to book - prices expected to increase 15% in next week'
    }
  },
  'FL002': {
    overall: 88,
    breakdown: {
      price: 95,
      convenience: 75,
      comfort: 85,
      reliability: 90,
      scheduleMatch: 82
    },
    insights: [
      'Best price option - $44 cheaper than average',
      'Includes checked bag (saves $35)',
      'Short 1h 45m layover in Atlanta',
      'Flexible cancellation policy',
      'Arrives late evening - may need hotel'
    ],
    priceAnalysis: {
      isPriceGood: true,
      comparedToAverage: -15,
      trend: 'stable',
      recommendation: 'Excellent value - one of the lowest prices in 30 days'
    }
  },
  'FL003': {
    overall: 85,
    breakdown: {
      price: 78,
      convenience: 88,
      comfort: 94,
      reliability: 89,
      scheduleMatch: 76
    },
    insights: [
      'JetBlue offers extra legroom in economy',
      'Free WiFi and premium entertainment',
      'Afternoon departure - good for flexible schedules',
      'Includes checked bag',
      'Slightly higher price but better comfort'
    ],
    priceAnalysis: {
      isPriceGood: false,
      comparedToAverage: 8,
      trend: 'stable',
      recommendation: 'Fair price - worth it if you value comfort'
    }
  },
  'FL004': {
    overall: 78,
    breakdown: {
      price: 98,
      convenience: 65,
      comfort: 70,
      reliability: 85,
      scheduleMatch: 72
    },
    insights: [
      'Lowest price option - saves $90',
      'Very early departure (6:30 AM)',
      'Long 3h 45m layover in Dallas',
      'No checked bag included',
      'Strict cancellation policy'
    ],
    priceAnalysis: {
      isPriceGood: true,
      comparedToAverage: -31,
      trend: 'falling',
      recommendation: 'Budget-friendly but requires early wake-up and long layover'
    }
  }
}

// Mock recommendations
export const mockRecommendations: TravelRecommendation[] = mockFlightOptions.map(flight => ({
  flight,
  score: mockTravelScores[flight.id],
  tags: getTags(flight.id),
  aiSummary: getAISummary(flight.id),
  alternativeOptions: []
}))

function getTags(flightId: string): string[] {
  const tagMap: Record<string, string[]> = {
    'FL001': ['Best Overall', 'Non-Stop', 'Recommended'],
    'FL002': ['Best Value', 'Includes Baggage', 'Flexible Cancellation'],
    'FL003': ['Most Comfortable', 'Extra Legroom', 'Premium Amenities'],
    'FL004': ['Cheapest', 'Budget-Friendly']
  }
  return tagMap[flightId] || []
}

function getAISummary(flightId: string): string {
  const summaryMap: Record<string, string> = {
    'FL001': 'This is your best overall option. The non-stop flight on United saves significant time, has a great departure time for your schedule, and offers excellent reliability. While not the cheapest, the price is still 8% below average and expected to rise soon.',
    'FL002': 'Excellent value for budget-conscious travelers. Delta offers the lowest price while including a checked bag (normally $35 extra). The layover is reasonable, and you get flexible cancellation. The late arrival time may require an overnight stay, so factor that into your total cost.',
    'FL003': 'If comfort matters to you, this is worth the premium. JetBlue provides extra legroom, free WiFi, and superior in-flight entertainment. The afternoon departure works well if you have a flexible schedule. Price is slightly above average but justified by the amenities.',
    'FL004': 'The budget option that requires trade-offs. You\'ll save $90, but face a very early departure and long layover. No checked bag is included, and cancellation terms are strict. Best for experienced travelers comfortable with early mornings and self-packing light.'
  }
  return summaryMap[flightId] || ''
}

// Mock saved trips
export const mockSavedTrips: SavedTrip[] = [
  {
    id: 'TRIP001',
    preferences: {
      origin: 'SFO',
      destination: 'JFK',
      departureDate: '2026-04-15',
      returnDate: '2026-04-20',
      tripType: 'round-trip',
      flexibleDates: false,
      passengers: {
        adults: 1,
        children: 0,
        infants: 0
      },
      maxBudget: 500,
      currency: 'USD',
      preferences: {
        cabinClass: 'economy',
        checkedBag: false,
        nonstopOnly: false,
        departureTimePreferences: ['morning'],
        hotelNeeded: false
      }
    },
    recommendations: mockRecommendations,
    createdAt: '2026-03-10T14:30:00',
    status: 'planning'
  }
]

// Mock dashboard stats
export const mockDashboardStats: DashboardStats = {
  totalTripsPlanned: 12,
  totalSaved: 1240,
  averageScore: 87,
  recentSearches: [
    {
      id: 'SEARCH001',
      route: 'SFO → JFK',
      date: '2026-03-10'
    },
    {
      id: 'SEARCH002',
      route: 'LAX → MIA',
      date: '2026-03-08'
    },
    {
      id: 'SEARCH003',
      route: 'SEA → BOS',
      date: '2026-03-05'
    }
  ]
}
