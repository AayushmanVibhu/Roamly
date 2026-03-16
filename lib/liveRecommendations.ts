import { rankAndExplainRecommendations } from '@/lib/recommendationEngine'
import { searchSerpApiFlightOptions } from '@/lib/serpApiClient'
import { TravelRecommendation, TripPreferences } from '@/types'

export async function getLiveRecommendations(
  preferences: TripPreferences
): Promise<{ source: 'serpapi'; recommendations: TravelRecommendation[] }> {
  const liveFlightOptions = await searchSerpApiFlightOptions(preferences)
  const recommendations = rankAndExplainRecommendations(liveFlightOptions, preferences)

  return {
    source: 'serpapi',
    recommendations,
  }
}
