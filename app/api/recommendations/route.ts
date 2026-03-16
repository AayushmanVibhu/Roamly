import { NextRequest, NextResponse } from 'next/server'
import { rankAndExplainRecommendations } from '@/lib/recommendationEngine'
import { searchDuffelFlightOptions } from '@/lib/duffelClient'
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
    
    const provider = resolveFlightProvider()

    // Fetch live offers from selected provider and rank using Roamly scoring
    const liveFlightOptions =
      provider === 'serpapi'
        ? await searchSerpApiFlightOptions(preferences)
        : await searchDuffelFlightOptions(preferences)
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
      source: provider
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
  const provider = resolveFlightProvider()
  return NextResponse.json({
    status: 'healthy',
    service: 'Roamly Recommendation Engine',
    provider,
    timestamp: new Date().toISOString()
  })
}

function resolveFlightProvider(): 'duffel' | 'serpapi' {
  const configuredProvider = (process.env.FLIGHT_PROVIDER || 'auto').toLowerCase()

  if (configuredProvider === 'duffel') return 'duffel'
  if (configuredProvider === 'serpapi') return 'serpapi'

  if (process.env.SERPAPI_API_KEY) return 'serpapi'
  return 'duffel'
}
