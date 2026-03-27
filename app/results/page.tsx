'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Plane, Sparkles } from 'lucide-react'
import { TripPreferences, TravelRecommendation } from '@/types'
import FlightResultCard from '@/components/FlightResultCard'

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
      const valueDelta = Number(b.flight.id === recommendations[0]?.flight.id) - Number(a.flight.id === recommendations[0]?.flight.id)
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
          checkIntervalMinutes: 60,
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
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center">
        <div className="text-center text-dark-50" role="status">
          <div className="h-12 w-12 border-4 border-white/40 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p>Finding beautiful options for your route...</p>
        </div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-2xl font-semibold text-dark-50 mb-3">No trip details found</h2>
          <p className="text-dark-300 mb-6">Start with a route and dates first.</p>
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-primary-600 text-white px-5 py-3 font-medium hover:bg-primary-700 transition">
            Go to search
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 text-dark-50">
      <nav className="border-b border-dark-800 bg-dark-900/80 backdrop-blur-md sticky top-0 z-40" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Plane className="w-7 h-7 text-primary-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">Roamly</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="inline-flex items-center gap-1 text-dark-300 hover:text-dark-50 transition">
              <ArrowLeft className="w-4 h-4" />
              New search
            </Link>
            <Link href="/watches" className="text-dark-300 hover:text-dark-50 transition">
              My Watches
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="rounded-3xl border border-dark-700 bg-gradient-to-r from-[#f97316]/15 via-[#7c3aed]/10 to-[#2563eb]/15 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.5)] p-6 md:p-8">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-dark-200 bg-dark-800/70 border border-dark-700 rounded-full px-3 py-1">
            <Sparkles className="w-3.5 h-3.5" />
            Curated for your trip
          </p>
          <h1 className="mt-4 text-3xl md:text-4xl font-bold text-dark-50 text-balance">
            Routes from {preferences.origin} to {preferences.destination}
          </h1>
          <p className="mt-2 text-dark-300">
            {preferences.departureDate}
            {preferences.returnDate ? ` • Return ${preferences.returnDate}` : ' • One-way'}
            {' • '}
            Live source: {dataSource}
          </p>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-amber-700/40 bg-amber-900/20 px-4 py-3 text-amber-200" role="alert">
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
      </main>

      {trackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Track price">
          <button className="absolute inset-0 bg-black/60" onClick={closeTrackModal} aria-label="Close tracking dialog" />
          <div className="relative w-full sm:w-[520px] bg-dark-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-dark-700 p-6 sm:p-7 animate-sheet-enter">
            {!trackSuccess ? (
              <>
                <h3 className="text-2xl font-semibold text-dark-50">We&apos;ll keep an eye on this for you</h3>
                <p className="text-dark-300 mt-2">
                  Turn on the alerts you want and we&apos;ll monitor this route in the background.
                </p>

                <div className="mt-5 space-y-3">
                  <label className="flex items-start gap-3 rounded-xl border border-dark-700 bg-dark-800 p-3">
                    <input
                      type="checkbox"
                      checked={notifyDrop}
                      onChange={event => setNotifyDrop(event.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm text-dark-200">Notify me if price drops</span>
                  </label>
                  <label className="flex items-start gap-3 rounded-xl border border-dark-700 bg-dark-800 p-3">
                    <input
                      type="checkbox"
                      checked={notifyBetter}
                      onChange={event => setNotifyBetter(event.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm text-dark-200">Notify me if better option appears</span>
                  </label>
                </div>

                <div className="mt-4">
                  <label className="block text-xs uppercase tracking-wide text-dark-400 font-semibold">Email for alerts</label>
                  <input
                    type="email"
                    value={trackEmail}
                    onChange={event => setTrackEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="mt-1 w-full rounded-xl border border-dark-700 bg-dark-800 text-dark-100 placeholder-dark-500 px-3 py-2.5 outline-none focus:border-primary-500"
                  />
                </div>

                {trackError && (
                  <p className="mt-3 text-sm text-red-400" role="alert">{trackError}</p>
                )}

                <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <button
                    onClick={closeTrackModal}
                    className="rounded-xl border border-dark-700 px-4 py-2.5 text-dark-200 hover:bg-dark-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmTracking}
                    disabled={isSavingWatch}
                    className="rounded-xl bg-primary-600 px-5 py-2.5 text-white font-semibold hover:bg-primary-700 transition disabled:opacity-60"
                  >
                    {isSavingWatch ? 'Saving...' : 'Confirm tracking'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-5">
                <div className="w-14 h-14 rounded-full bg-green-900/30 text-green-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-dark-50">You&apos;re all set.</h3>
                <p className="mt-2 text-dark-300">We&apos;ll keep watching this route for you.</p>
                <button
                  onClick={closeTrackModal}
                  className="mt-6 rounded-xl bg-primary-600 px-5 py-2.5 text-white font-semibold hover:bg-primary-700 transition"
                >
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
