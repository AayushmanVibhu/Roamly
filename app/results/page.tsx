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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="h-12 w-12 border-4 border-white/40 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p>Finding beautiful options for your route...</p>
        </div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-2xl font-semibold text-white mb-3">No trip details found</h2>
          <p className="text-white/70 mb-6">Start with a route and dates first.</p>
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-5 py-3 font-medium">
            Go to search
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef6ff] via-[#fff8f3] to-[#f7f4ff] text-slate-900">
      <nav className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Plane className="w-7 h-7 text-slate-800" />
            <span className="text-2xl font-bold text-slate-900">Roamly</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 transition">
              <ArrowLeft className="w-4 h-4" />
              New search
            </Link>
            <Link href="/watches" className="text-slate-600 hover:text-slate-900 transition">
              My Watches
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="rounded-3xl border border-white/70 bg-gradient-to-r from-[#f97316]/20 via-[#7c3aed]/10 to-[#2563eb]/15 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] p-6 md:p-8">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600 bg-white/70 border border-white rounded-full px-3 py-1">
            <Sparkles className="w-3.5 h-3.5" />
            Curated for your trip
          </p>
          <h1 className="mt-4 text-3xl md:text-4xl font-bold text-slate-900 text-balance">
            Routes from {preferences.origin} to {preferences.destination}
          </h1>
          <p className="mt-2 text-slate-600">
            {preferences.departureDate}
            {preferences.returnDate ? ` • Return ${preferences.returnDate}` : ' • One-way'}
            {' • '}
            Live source: {dataSource}
          </p>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <button className="absolute inset-0 bg-slate-950/55" onClick={closeTrackModal} />
          <div className="relative w-full sm:w-[520px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 animate-sheet-enter">
            {!trackSuccess ? (
              <>
                <h3 className="text-2xl font-semibold text-slate-900">We&apos;ll keep an eye on this for you</h3>
                <p className="text-slate-600 mt-2">
                  Turn on the alerts you want and we&apos;ll monitor this route in the background.
                </p>

                <div className="mt-5 space-y-3">
                  <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <input
                      type="checkbox"
                      checked={notifyDrop}
                      onChange={event => setNotifyDrop(event.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm text-slate-700">Notify me if price drops</span>
                  </label>
                  <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <input
                      type="checkbox"
                      checked={notifyBetter}
                      onChange={event => setNotifyBetter(event.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm text-slate-700">Notify me if better option appears</span>
                  </label>
                </div>

                <div className="mt-4">
                  <label className="text-xs uppercase tracking-wide text-slate-500">Email for alerts</label>
                  <input
                    type="email"
                    value={trackEmail}
                    onChange={event => setTrackEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-500"
                  />
                </div>

                {trackError && (
                  <p className="mt-3 text-sm text-red-600">{trackError}</p>
                )}

                <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <button
                    onClick={closeTrackModal}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmTracking}
                    disabled={isSavingWatch}
                    className="rounded-xl bg-slate-900 px-5 py-2.5 text-white font-semibold hover:bg-slate-800 transition disabled:opacity-60"
                  >
                    {isSavingWatch ? 'Saving...' : 'Confirm tracking'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-5">
                <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-slate-900">You&apos;re all set.</h3>
                <p className="mt-2 text-slate-600">We&apos;ll keep watching this route for you.</p>
                <button
                  onClick={closeTrackModal}
                  className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-white font-semibold hover:bg-slate-800 transition"
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
