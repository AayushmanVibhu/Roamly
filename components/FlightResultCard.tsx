'use client'

import { useMemo, useState } from 'react'
import { TravelRecommendation } from '@/types'
import { Clock3, ExternalLink, Luggage, Plane, Sparkles } from 'lucide-react'

interface FlightResultCardProps {
  recommendation: TravelRecommendation
  badges: string[]
  onTrack: () => void
}

const badgeStyles: Record<string, string> = {
  'Best Value': 'bg-violet-900/30 text-violet-300 border-violet-700/40',
  Fastest: 'bg-blue-900/30 text-blue-300 border-blue-700/40',
  Cheapest: 'bg-green-900/30 text-green-300 border-green-700/40',
  Smoothest: 'bg-amber-900/30 text-amber-300 border-amber-700/40',
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
    <article className="rounded-3xl border border-dark-700 bg-dark-800 shadow-[0_16px_45px_-28px_rgba(0,0,0,0.6)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_55px_-28px_rgba(56,189,248,0.2)]">
      <div className="p-6 md:p-7">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {badges.map(badge => (
            <span
              key={`${flight.id}-${badge}`}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeStyles[badge] || 'bg-dark-700 text-dark-200 border-dark-600'}`}
            >
              {badge}
            </span>
          ))}
        </div>

        <div className="grid md:grid-cols-[1.4fr,1fr] gap-6">
          <div>
            <p className="text-sm text-dark-400 mb-1">{firstSegment?.airline || 'Airline option'}</p>
            <h3 className="text-2xl font-semibold text-dark-50">
              {firstSegment?.departureAirport} → {lastSegment?.arrivalAirport}
            </h3>
            <p className="mt-3 text-sm text-dark-300 leading-relaxed">
              <span className="font-medium text-dark-200">AI summary:</span>{' '}
              {recommendation.aiSummary ||
                'This is a strong balance of price and comfort with practical timing for most travelers.'}
            </p>

            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="rounded-xl bg-dark-900 border border-dark-700 p-3">
                <p className="text-dark-400">Duration</p>
                <p className="mt-1 font-semibold text-dark-100 flex items-center gap-1">
                  <Clock3 className="w-3.5 h-3.5 text-dark-400" aria-hidden="true" />
                  {formatDuration(flight.totalDuration)}
                </p>
              </div>
              <div className="rounded-xl bg-dark-900 border border-dark-700 p-3">
                <p className="text-dark-400">Stops</p>
                <p className="mt-1 font-semibold text-dark-100">{stopLabel}</p>
              </div>
              <div className="rounded-xl bg-dark-900 border border-dark-700 p-3">
                <p className="text-dark-400">Baggage</p>
                <p className="mt-1 font-semibold text-dark-100 flex items-center gap-1">
                  <Luggage className="w-3.5 h-3.5 text-dark-400" aria-hidden="true" />
                  {baggageLabel}
                </p>
              </div>
              <div className="rounded-xl bg-dark-900 border border-dark-700 p-3">
                <p className="text-dark-400">Route</p>
                <p className="mt-1 font-semibold text-dark-100 flex items-center gap-1">
                  <Plane className="w-3.5 h-3.5 text-dark-400" aria-hidden="true" />
                  {flight.segments.length} leg{flight.segments.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-dark-700 bg-gradient-to-b from-dark-800 to-dark-900 p-5 flex flex-col justify-between">
            <div>
              <p className="text-sm text-dark-400">Total price</p>
              <p className="text-4xl font-bold text-dark-50 mt-1">
                ${flight.totalCost.estimatedTotal}
              </p>
              <p className="text-xs text-dark-400 mt-1">
                Pricing confidence: <span className="capitalize">{flight.totalCost.confidence}</span>
              </p>
            </div>

            <div className="mt-5 space-y-2">
              <button
                onClick={() => setShowDetails(current => !current)}
                className="w-full rounded-xl border border-dark-600 bg-dark-800 px-4 py-2.5 text-sm font-medium text-dark-200 hover:bg-dark-700 transition"
              >
                {showDetails ? 'Hide details' : 'View details'}
              </button>
              <button
                onClick={onTrack}
                className="w-full rounded-xl border border-primary-700/40 bg-primary-900/20 px-4 py-2.5 text-sm font-medium text-primary-300 hover:bg-primary-900/30 transition"
              >
                Track this
              </button>
              {flight.bookingUrl ? (
                <a
                  href={flight.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition"
                >
                  Book
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button
                  disabled
                  className="w-full rounded-xl bg-dark-700 px-4 py-2.5 text-sm font-semibold text-dark-500 cursor-not-allowed"
                >
                  Book unavailable
                </button>
              )}
            </div>
          </div>
        </div>

        {showDetails && (
          <div className="mt-6 rounded-2xl border border-dark-700 bg-dark-900 p-4">
            <h4 className="text-sm font-semibold text-dark-100 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" aria-hidden="true" />
              Detailed leg summary
            </h4>
            <div className="space-y-2">
              {flight.segments.map(segment => (
                <div
                  key={segment.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between rounded-lg bg-dark-800 border border-dark-700 px-3 py-2 text-sm"
                >
                  <p className="text-dark-200 font-medium">
                    {segment.departureAirport} → {segment.arrivalAirport}
                  </p>
                  <p className="text-dark-400">
                    {segment.airline} • {segment.flightNumber} • {formatDuration(segment.duration)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
