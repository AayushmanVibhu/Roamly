'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Sparkles } from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'
import FlightResultCard from '@/components/FlightResultCard'
import { TripPreferences, TravelRecommendation } from '@/types'

type BadgeLabel = 'Best Value' | 'Fastest' | 'Cheapest' | 'Smoothest'

export default function ResultsPage() {
  const router = useRouter()
  const [preferences, setPreferences] = useState<TripPreferences | null>(null)
  const [recommendations, setRecommendations] = useState<TravelRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<string>('unknown')

  const [trackModalOpen, setTrackModalOpen] = useState(false)
  const [selectedRecommendation, setSelectedRecommendation] = useState<TravelRecommendation | null>(null)
  const [notifyDrop, setNotifyDrop] = useState(true)
  const [notifyBetter, setNotifyBetter] = useState(true)
  const [trackEmail, setTrackEmail] = useState('')
  const [isSavingWatch, setIsSavingWatch] = useState(false)
  const [trackSuccess, setTrackSuccess] = useState(false)
  const [trackError, setTrackError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadRecommendations = async (prefs: TripPreferences) => {
      try {
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prefs),
        })

        const payload = await response.json()
        if (!response.ok) {
          throw new Error(payload?.error || 'Failed to fetch live recommendations')
        }

        if (!isMounted) return

        setRecommendations(payload.recommendations || [])
        setDataSource(payload.source || 'unknown')
        if ((payload.recommendations || []).length === 0) {
          setErrorMessage(
            payload?.message ||
              'No matching options are available right now. Try flexible dates or nearby airports.'
          )
        }
      } catch (error) {
        if (!isMounted) return
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Could not fetch live offers. Please try again in a moment.'
        )
        setRecommendations([])
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    const saved = localStorage.getItem('watchEmail')
    if (saved) setTrackEmail(saved)

    const stored = sessionStorage.getItem('tripPreferences')
    if (stored) {
      const prefs = JSON.parse(stored) as TripPreferences
      if (isMounted) setPreferences(prefs)
      void loadRecommendations(prefs)
    } else {
      if (isMounted) setIsLoading(false)
      setTimeout(() => router.push('/'), 1500)
    }

    return () => {
      isMounted = false
    }
  }, [router])

  const badgeByFlightId = useMemo(() => {
    const map = new Map<string, BadgeLabel[]>()
    if (!recommendations.length) return map

    const cheapest = recommendations.reduce((best, current) =>
      current.flight.totalCost.estimatedTotal < best.flight.totalCost.estimatedTotal ? current : best
    )
    const fastest = recommendations.reduce((best, current) =>
      current.flight.totalDuration < best.flight.totalDuration ? current : best
    )
    const bestValue = recommendations.reduce((best, current) =>
      current.score.overall > best.score.overall ? current : best
    )
    const smoothest = recommendations.reduce((best, current) => {
      if (current.flight.layoverCount !== best.flight.layoverCount) {
        return current.flight.layoverCount < best.flight.layoverCount ? current : best
      }
      const currentLayoverSum = current.flight.layoverDurations.reduce((sum, value) => sum + value, 0)
      const bestLayoverSum = best.flight.layoverDurations.reduce((sum, value) => sum + value, 0)
      return currentLayoverSum < bestLayoverSum ? current : best
    })

    const attachBadge = (id: string, badge: BadgeLabel) => {
      const existing = map.get(id) || []
      if (!existing.includes(badge)) existing.push(badge)
      map.set(id, existing)
    }

    attachBadge(bestValue.flight.id, 'Best Value')
    attachBadge(fastest.flight.id, 'Fastest')
    attachBadge(cheapest.flight.id, 'Cheapest')
    attachBadge(smoothest.flight.id, 'Smoothest')

    return map
  }, [recommendations])

  const sortedRecommendations = useMemo(() => {
    return [...recommendations].sort((a, b) => {
      const valueDelta =
        Number(b.flight.id === recommendations[0]?.flight.id) -
        Number(a.flight.id === recommendations[0]?.flight.id)
      if (valueDelta !== 0) return valueDelta
      return a.flight.totalCost.estimatedTotal - b.flight.totalCost.estimatedTotal
    })
  }, [recommendations])

  const openTrackModal = (recommendation: TravelRecommendation) => {
    setSelectedRecommendation(recommendation)
    setNotifyDrop(true)
    setNotifyBetter(true)
    setTrackError(null)
    setTrackSuccess(false)
    setTrackModalOpen(true)
  }

  const closeTrackModal = () => {
    if (isSavingWatch) return
    setTrackModalOpen(false)
    setTrackError(null)
  }

  const confirmTracking = async () => {
    if (!preferences || !selectedRecommendation) return

    if (!notifyDrop && !notifyBetter) {
      setTrackError('Choose at least one notification option.')
      return
    }

    if (!trackEmail.trim()) {
      setTrackError('Please enter an email so we can notify you.')
      return
    }

    setTrackError(null)
    setIsSavingWatch(true)
    try {
      const selectedPrice = selectedRecommendation.flight.totalCost.estimatedTotal
      const targetPrice = notifyDrop ? Math.max(1, selectedPrice - 1) : preferences.maxBudget

      const response = await fetch('/api/watches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trackEmail.trim(),
          preferences,
          targetPrice,
        }),
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error || 'Could not create watch.')
      }

      localStorage.setItem('watchEmail', trackEmail.trim().toLowerCase())
      setTrackSuccess(true)
    } catch (error) {
      setTrackError(error instanceof Error ? error.message : 'Could not create watch.')
    } finally {
      setIsSavingWatch(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-white/30 border-t-sky-300 animate-spin" />
          <p>Scanning live routes for your watch criteria...</p>
        </div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="mb-3 text-2xl font-semibold text-white">No trip details found</h2>
          <p className="mb-6 text-white/70">Start with a route and dates first.</p>
          <Link href="/" className="action-primary">
            Go to search
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <SiteHeader />

      <section className="app-content py-8 md:py-10">
        <div className="glass-panel p-6 md:p-8">
          <p className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Curated for your trip
          </p>
          <h1 className="mt-4 font-[family:var(--font-display)] text-3xl font-semibold text-white text-balance md:text-5xl">
            Routes from {preferences.origin} to {preferences.destination}
          </h1>
          <p className="mt-3 text-slate-300">
            {preferences.departureDate}
            {preferences.returnDate ? ` • Return ${preferences.returnDate}` : ' • One-way'}
            {' • '}
            Live source: {dataSource}
          </p>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-amber-100">
            {errorMessage}
          </div>
        )}

        <div className="mt-8 space-y-5">
          {sortedRecommendations.map(recommendation => (
            <FlightResultCard
              key={recommendation.flight.id}
              recommendation={recommendation}
              badges={badgeByFlightId.get(recommendation.flight.id) || []}
              onTrack={() => openTrackModal(recommendation)}
            />
          ))}
        </div>
      </section>

      {trackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button className="absolute inset-0 bg-slate-950/55" onClick={closeTrackModal} />
          <div className="relative w-full rounded-t-3xl border border-white/10 bg-[rgba(9,16,34,0.96)] p-6 shadow-2xl animate-sheet-enter sm:w-[520px] sm:rounded-3xl sm:p-7">
            {!trackSuccess ? (
              <>
                <h3 className="text-2xl font-semibold text-white">We&apos;ll keep an eye on this for you</h3>
                <p className="mt-2 text-slate-300">
                  Turn on the alerts you want and we&apos;ll monitor this route in the background.
                </p>

                <div className="mt-5 space-y-3">
                  <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/6 p-3">
                    <input
                      type="checkbox"
                      checked={notifyDrop}
                      onChange={event => setNotifyDrop(event.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm text-slate-200">Notify me if price drops</span>
                  </label>
                  <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/6 p-3">
                    <input
                      type="checkbox"
                      checked={notifyBetter}
                      onChange={event => setNotifyBetter(event.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm text-slate-200">Notify me if better option appears</span>
                  </label>
                </div>

                <div className="mt-4">
                  <label className="text-xs uppercase tracking-wide text-slate-400">Email for alerts</label>
                  <input
                    type="email"
                    value={trackEmail}
                    onChange={event => setTrackEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="field-shell mt-1 w-full"
                  />
                </div>

                {trackError && <p className="mt-3 text-sm text-red-300">{trackError}</p>}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button onClick={closeTrackModal} className="action-secondary">
                    Cancel
                  </button>
                  <button
                    onClick={confirmTracking}
                    disabled={isSavingWatch}
                    className="action-primary disabled:opacity-60"
                  >
                    {isSavingWatch ? 'Saving...' : 'Confirm tracking'}
                  </button>
                </div>
              </>
            ) : (
              <div className="py-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-white">You&apos;re all set.</h3>
                <p className="mt-2 text-slate-300">We&apos;ll keep watching this route for you.</p>
                <button onClick={closeTrackModal} className="action-primary mt-6">
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
