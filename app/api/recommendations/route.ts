import { NextRequest, NextResponse } from 'next/server'
import { generateRecommendations } from '@/lib/recommendationEngine'
import { TripPreferences } from '@/types'

/**
 * API Route: POST /api/recommendations
 * 
 * Generates travel recommendations based on user preferences
 * 
 * Request Body: TripPreferences
 * Response: Array of TravelRecommendation
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const preferences: TripPreferences = await request.json()
    
    // Validate required fields
    if (!preferences.origin || !preferences.destination || !preferences.departureDate) {
      return NextResponse.json(
        { error: 'Missing required fields: origin, destination, departureDate' },
        { status: 400 }
      )
    }
    
    // Validate dates
    const departureDate = new Date(preferences.departureDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (departureDate < today) {
      return NextResponse.json(
        { error: 'Departure date cannot be in the past' },
        { status: 400 }
      )
    }
    
    // Generate recommendations
    const recommendations = generateRecommendations(preferences)
    
    // Return recommendations
    return NextResponse.json({
      success: true,
      count: recommendations.length,
      preferences: {
        origin: preferences.origin,
        destination: preferences.destination,
        departureDate: preferences.departureDate,
        returnDate: preferences.returnDate
      },
      recommendations
    })
    
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * API Route: GET /api/recommendations/health
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Roamly Recommendation Engine',
    timestamp: new Date().toISOString()
  })
}
