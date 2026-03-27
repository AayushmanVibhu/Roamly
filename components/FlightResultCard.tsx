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
  'Best Value': 'bg-violet-100 text-violet-700 border-violet-200',
  Fastest: 'bg-blue-100 text-blue-700 border-blue-200',
  Cheapest: 'bg-green-100 text-green-700 border-green-200',
  Smoothest: 'bg-amber-100 text-amber-700 border-amber-200',
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
    <article className="rounded-3xl border border-slate-200 bg-white shadow-[0_16px_45px_-28px_rgba(2,6,23,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_55px_-28px_rgba(30,64,175,0.35)]">
      <div className="p-6 md:p-7">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {badges.map(badge => (
            <span
              key={`${flight.id}-${badge}`}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeStyles[badge] || 'bg-slate-100 text-slate-700 border-slate-200'}`}
            >
              {badge}
            </span>
          ))}
        </div>

        <div className="grid md:grid-cols-[1.4fr,1fr] gap-6">
          <div>
            <p className="text-sm text-slate-500 mb-1">{firstSegment?.airline || 'Airline option'}</p>
            <h3 className="text-2xl font-semibold text-slate-900">
              {firstSegment?.departureAirport} → {lastSegment?.arrivalAirport}
            </h3>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              <span className="font-medium text-slate-700">AI summary:</span>{' '}
              {recommendation.aiSummary ||
                'This is a strong balance of price and comfort with practical timing for most travelers.'}
            </p>

            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-slate-500">Duration</p>
                <p className="mt-1 font-semibold text-slate-800 flex items-center gap-1">
                  <Clock3 className="w-3.5 h-3.5 text-slate-500" />
                  {formatDuration(flight.totalDuration)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-slate-500">Stops</p>
                <p className="mt-1 font-semibold text-slate-800">{stopLabel}</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-slate-500">Baggage</p>
                <p className="mt-1 font-semibold text-slate-800 flex items-center gap-1">
                  <Luggage className="w-3.5 h-3.5 text-slate-500" />
                  {baggageLabel}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-slate-500">Route</p>
                <p className="mt-1 font-semibold text-slate-800 flex items-center gap-1">
                  <Plane className="w-3.5 h-3.5 text-slate-500" />
                  {flight.segments.length} leg{flight.segments.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-5 flex flex-col justify-between">
            <div>
              <p className="text-sm text-slate-500">Total price</p>
              <p className="text-4xl font-bold text-slate-900 mt-1">
                ${flight.totalCost.estimatedTotal}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Pricing confidence: <span className="capitalize">{flight.totalCost.confidence}</span>
              </p>
            </div>

            <div className="mt-5 space-y-2">
              <button
                onClick={() => setShowDetails(current => !current)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                {showDetails ? 'Hide details' : 'View details'}
              </button>
              <button
                onClick={onTrack}
                className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition"
              >
                Track this
              </button>
              {flight.bookingUrl ? (
                <a
                  href={flight.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
                >
                  Book
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button
                  disabled
                  className="w-full rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500 cursor-not-allowed"
                >
                  Book unavailable
                </button>
              )}
            </div>
          </div>
        </div>

        {showDetails && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" />
              Detailed leg summary
            </h4>
            <div className="space-y-2">
              {flight.segments.map(segment => (
                <div
                  key={segment.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm"
                >
                  <p className="text-slate-700 font-medium">
                    {segment.departureAirport} → {segment.arrivalAirport}
                  </p>
                  <p className="text-slate-500">
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
