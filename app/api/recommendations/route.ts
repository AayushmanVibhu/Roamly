import { NextRequest, NextResponse } from 'next/server'
import { rankAndExplainRecommendations } from '@/lib/recommendationEngine'
import { searchSerpApiFlightOptions } from '@/lib/serpApiClient'
import { TripPreferences } from '@/types'

export const dynamic = 'force-dynamic'

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
    
    // Fetch live offers from SerpApi (Google Flights) and rank using Roamly scoring
    const liveFlightOptions = await searchSerpApiFlightOptions(preferences)
    const recommendations = rankAndExplainRecommendations(liveFlightOptions, preferences)
    
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
      recommendations,
      source: 'serpapi',
      message:
        recommendations.length === 0
          ? 'Option is not available for the selected constraints right now.'
          : undefined,
    })
    
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
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
    provider: 'serpapi',
    timestamp: new Date().toISOString()
  })
}
