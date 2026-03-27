import { TravelConstraints } from '@/types'
import { Sparkles, ArrowRight, AlertCircle, BellRing } from 'lucide-react'

interface RecommendationTriggerProps {
  constraints: TravelConstraints
  onGenerateRecommendations: () => void
  isGenerating?: boolean
  watchEmail?: string
  onWatchEmailChange?: (value: string) => void
  onCreateWatch?: () => void
  isCreatingWatch?: boolean
  watchStatusMessage?: string | null
}

export default function RecommendationTrigger({
  constraints,
  onGenerateRecommendations,
  isGenerating = false,
  watchEmail,
  onWatchEmailChange,
  onCreateWatch,
  isCreatingWatch = false,
  watchStatusMessage = null,
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
    <div className="rounded-2xl border border-dark-700 bg-dark-900/80 p-3 sm:p-4">
      <button
        onClick={onGenerateRecommendations}
        disabled={isDisabled}
        className={`
          w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-base transition
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
        <div className="flex items-start gap-2 mt-3 p-2.5 bg-orange-900/20 border border-orange-700/30 rounded-lg">
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

      {onCreateWatch && onWatchEmailChange && (
        <div className="mt-4 bg-dark-800 border border-dark-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2 text-sm text-dark-200">
            <BellRing className="w-4 h-4 text-primary-400" />
            <span>Or create a watch from chat</span>
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              value={watchEmail || ''}
              onChange={(e) => onWatchEmailChange(e.target.value)}
              placeholder="Email for deal alerts"
              className="flex-1 px-3 py-2 rounded-md bg-dark-900 border border-dark-700 text-dark-100 placeholder-dark-500 text-sm"
            />
            <button
              onClick={onCreateWatch}
              disabled={!hasMinimumInfo || isCreatingWatch}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                !hasMinimumInfo || isCreatingWatch
                  ? 'bg-dark-700 text-dark-500 cursor-not-allowed'
                  : 'bg-primary-700 hover:bg-primary-800 text-white'
              }`}
            >
              {isCreatingWatch ? 'Saving...' : 'Create Watch'}
            </button>
          </div>
          {watchStatusMessage && (
            <p className="text-xs text-primary-300 mt-2">{watchStatusMessage}</p>
          )}
        </div>
      )}
    </div>
  )
}
