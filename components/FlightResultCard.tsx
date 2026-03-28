'use client'

import { useMemo, useState } from 'react'
import { Clock3, ExternalLink, Luggage, Plane, Sparkles } from 'lucide-react'
import { TravelRecommendation } from '@/types'

interface FlightResultCardProps {
  recommendation: TravelRecommendation
  badges: string[]
  onTrack: () => void
}

const badgeStyles: Record<string, string> = {
  'Best Value': 'border-sky-400/25 bg-sky-400/10 text-sky-100',
  Fastest: 'border-indigo-400/25 bg-indigo-400/10 text-indigo-100',
  Cheapest: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100',
  Smoothest: 'border-amber-400/25 bg-amber-400/10 text-amber-100',
}

function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}

export default function FlightResultCard({ recommendation, badges, onTrack }: FlightResultCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const { flight } = recommendation

  const firstSegment = flight.segments[0]
  const lastSegment = flight.segments[flight.segments.length - 1]

  const baggageLabel = useMemo(() => {
    if (flight.baggage.checked > 0) return `${flight.baggage.checked} checked + carry-on`
    if (flight.baggage.carryOn > 0) return 'Carry-on included'
    return 'No baggage included'
  }, [flight.baggage.carryOn, flight.baggage.checked])

  const stopLabel =
    flight.layoverCount === 0
      ? 'Nonstop'
      : `${flight.layoverCount} stop${flight.layoverCount > 1 ? 's' : ''}`

  return (
    <article className="glass-panel p-6 md:p-7">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {badges.map(badge => (
          <span
            key={`${flight.id}-${badge}`}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeStyles[badge] || 'border-white/10 bg-white/6 text-slate-200'}`}
          >
            {badge}
          </span>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-[1.4fr,1fr]">
        <div>
          <p className="text-sm text-slate-400">{firstSegment?.airline || 'Airline option'}</p>
          <h3 className="mt-2 font-[family:var(--font-display)] text-2xl font-semibold text-white">
            {firstSegment?.departureAirport} → {lastSegment?.arrivalAirport}
          </h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            <span className="font-medium text-sky-100">AI summary:</span>{' '}
            {recommendation.aiSummary ||
              'This is a strong balance of price and comfort with practical timing for most travelers.'}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <MetricCard icon={<Clock3 className="h-3.5 w-3.5 text-slate-400" />} label="Duration" value={formatDuration(flight.totalDuration)} />
            <MetricCard label="Stops" value={stopLabel} />
            <MetricCard icon={<Luggage className="h-3.5 w-3.5 text-slate-400" />} label="Baggage" value={baggageLabel} />
            <MetricCard icon={<Plane className="h-3.5 w-3.5 text-slate-400" />} label="Route" value={`${flight.segments.length} leg${flight.segments.length > 1 ? 's' : ''}`} />
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[rgba(6,12,26,0.78)] p-5">
          <p className="text-sm text-slate-400">Total price</p>
          <p className="mt-2 text-4xl font-semibold text-white">${flight.totalCost.estimatedTotal}</p>
          <p className="mt-1 text-xs text-slate-400">
            Pricing confidence: <span className="capitalize text-slate-200">{flight.totalCost.confidence}</span>
          </p>

          <div className="mt-5 space-y-2">
            <button
              onClick={() => setShowDetails(current => !current)}
              className="action-secondary w-full"
            >
              {showDetails ? 'Hide details' : 'View details'}
            </button>
            <button onClick={onTrack} className="w-full rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/15">
              Track this route
            </button>
            {flight.bookingUrl ? (
              <a
                href={flight.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-primary w-full"
              >
                Book now
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <button disabled className="w-full rounded-2xl bg-white/8 px-4 py-3 text-sm font-semibold text-slate-500">
                Book unavailable
              </button>
            )}
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="mt-6 rounded-[24px] border border-white/10 bg-[rgba(6,12,26,0.62)] p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4 text-sky-300" />
            Detailed leg summary
          </h4>
          <div className="space-y-2">
            {flight.segments.map(segment => (
              <div
                key={segment.id}
                className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/6 px-3 py-3 text-sm md:flex-row md:items-center"
              >
                <p className="font-medium text-slate-100">
                  {segment.departureAirport} → {segment.arrivalAirport}
                </p>
                <p className="text-slate-400">
                  {segment.airline} • {segment.flightNumber} • {formatDuration(segment.duration)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-white">
        {icon}
        {value}
      </p>
    </div>
  )
}
