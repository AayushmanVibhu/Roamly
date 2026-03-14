import { TravelConstraints } from '@/types'
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react'

interface RecommendationTriggerProps {
  constraints: TravelConstraints
  onGenerateRecommendations: () => void
  isGenerating?: boolean
}

export default function RecommendationTrigger({
  constraints,
  onGenerateRecommendations,
  isGenerating = false,
}: RecommendationTriggerProps) {
  const hasOrigin = !!constraints.origin
  const hasDestination = !!constraints.destination
  const hasMinimumInfo = hasOrigin && hasDestination
  const isDisabled = !hasMinimumInfo || isGenerating

  // Determine which fields are missing
  const missingFields: string[] = []
  if (!hasOrigin) missingFields.push('origin')
  if (!hasDestination) missingFields.push('destination')

  return (
    <div className="border-t border-dark-700 p-4 bg-dark-900">
      <button
        onClick={onGenerateRecommendations}
        disabled={isDisabled}
        className={`
          w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold text-lg transition
          ${
            isDisabled
              ? 'bg-dark-800 text-dark-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
          }
        `}
      >
        {isGenerating ? (
          <>
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Generating Recommendations...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Generate Recommendations</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      {!hasMinimumInfo && !isGenerating && (
        <div className="flex items-start gap-2 mt-3 p-3 bg-orange-900/20 border border-orange-700/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-orange-200">
            Please provide at least <strong>origin</strong> and <strong>destination</strong> to generate recommendations
          </p>
        </div>
      )}

      {hasMinimumInfo && !isGenerating && (
        <p className="text-xs text-center text-dark-400 mt-3">
          Ready to search! Click to find the best flights matching your preferences
        </p>
      )}
    </div>
  )
}
