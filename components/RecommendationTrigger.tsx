import { AlertCircle, ArrowRight, BellRing, Sparkles } from 'lucide-react'
import { TravelConstraints } from '@/types'

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

  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
      <button
        onClick={onGenerateRecommendations}
        disabled={isDisabled}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-base font-semibold transition ${
          isDisabled
            ? 'bg-white/8 text-slate-500'
            : 'bg-sky-300 text-slate-950 hover:bg-sky-200'
        }`}
      >
        <Sparkles className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
        <span>{isGenerating ? 'Generating recommendations...' : 'Generate recommendations'}</span>
        {!isGenerating && <ArrowRight className="h-5 w-5" />}
      </button>

      {!hasMinimumInfo && !isGenerating && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 text-amber-300" />
          <p className="text-xs text-amber-100">
            Add at least <strong>origin</strong> and <strong>destination</strong> before searching.
          </p>
        </div>
      )}

      {hasMinimumInfo && !isGenerating && (
        <p className="mt-3 text-center text-xs text-slate-400">
          Search now, or create a watch if the right fare is not live yet.
        </p>
      )}

      {onCreateWatch && onWatchEmailChange && (
        <div className="mt-4 rounded-xl border border-white/10 bg-[rgba(6,12,26,0.72)] p-3">
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-200">
            <BellRing className="h-4 w-4 text-amber-300" />
            <span>Create a watch from chat</span>
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              value={watchEmail || ''}
              onChange={e => onWatchEmailChange(e.target.value)}
              placeholder="Email for deal alerts"
              className="field-shell flex-1 text-sm"
            />
            <button
              onClick={onCreateWatch}
              disabled={!hasMinimumInfo || isCreatingWatch}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                !hasMinimumInfo || isCreatingWatch
                  ? 'bg-white/8 text-slate-500'
                  : 'bg-amber-300 text-slate-950 hover:bg-amber-200'
              }`}
            >
              {isCreatingWatch ? 'Saving...' : 'Create watch'}
            </button>
          </div>
          {watchStatusMessage && <p className="mt-2 text-xs text-sky-100">{watchStatusMessage}</p>}
        </div>
      )}
    </div>
  )
}
