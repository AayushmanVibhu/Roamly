'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plane, ArrowLeft, Filter, Sparkles } from 'lucide-react'
import { TripPreferences, TravelRecommendation } from '@/types'
import RecommendationCard from '@/components/RecommendationCard'

export default function ResultsPage() {
  const router = useRouter()
  const [preferences, setPreferences] = useState<TripPreferences | null>(null)
  const [recommendations, setRecommendations] = useState<TravelRecommendation[]>([])
  const [sortBy, setSortBy] = useState<'score' | 'price' | 'duration'>('score')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<string>('unknown')
  const [watchEmail, setWatchEmail] = useState('')
  const [watchStatusMessage, setWatchStatusMessage] = useState<string | null>(null)
  const [isCreatingWatch, setIsCreatingWatch] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadRecommendations = async (prefs: TripPreferences) => {
      try {
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
              'Option is not available for the selected constraints right now. Try flexible dates or a higher budget.'
          )
        }
      } catch (error) {
        console.error('Error generating recommendations:', error)
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

    // Load preferences from session storage
    const stored = sessionStorage.getItem('tripPreferences')
    if (stored) {
      const prefs = JSON.parse(stored)
      if (isMounted) setPreferences(prefs)
      void loadRecommendations(prefs)
    } else {
      // No preferences found, redirect to assistant page
      if (isMounted) setIsLoading(false)
      setTimeout(() => {
        router.push('/assistant')
      }, 2000)
    }

    return () => {
      isMounted = false
    }
  }, [router])

  const getSortedRecommendations = () => {
    const sorted = [...recommendations]
    switch (sortBy) {
      case 'score':
        return sorted.sort((a, b) => {
          const fullMatchDelta = Number(b.constraintMatch.isFullMatch) - Number(a.constraintMatch.isFullMatch)
          if (fullMatchDelta !== 0) return fullMatchDelta
          return b.score.overall - a.score.overall
        })
      case 'price':
        return sorted.sort((a, b) => a.flight.totalCost.estimatedTotal - b.flight.totalCost.estimatedTotal)
      case 'duration':
        return sorted.sort((a, b) => a.flight.totalDuration - b.flight.totalDuration)
      default:
        return sorted
    }
  }

  const handleCreateWatch = async () => {
    if (!preferences) return

    if (!watchEmail.trim()) {
      setWatchStatusMessage('Enter your email to create a price watch.')
      return
    }

    setIsCreatingWatch(true)
    setWatchStatusMessage(null)

    try {
      const response = await fetch('/api/watches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: watchEmail.trim(),
          preferences,
          targetPrice: preferences.maxBudget,
          checkIntervalMinutes: 60,
        }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to create watch.')
      }

      setWatchStatusMessage(
        `Watch created. We'll check every ${payload.watch?.checkIntervalMinutes || 60} minutes and alert ${watchEmail.trim()}.`
      )
    } catch (error) {
      setWatchStatusMessage(error instanceof Error ? error.message : 'Failed to create watch.')
    } finally {
      setIsCreatingWatch(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-dark-300">
            {preferences ? 'Finding best travel options for you...' : 'Loading your preferences...'}
          </p>
        </div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
        <div className="text-center max-w-md">
          <div className="bg-dark-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-dark-50 mb-2">No trip details found</h2>
          <p className="text-dark-400 mb-6">
            Let&apos;s start by telling me about your trip using our AI assistant!
          </p>
          <Link
            href="/assistant"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition"
          >
            <Sparkles className="w-5 h-5" />
            Start with AI Assistant
          </Link>
        </div>
      </div>
    )
  }

  const sortedRecommendations = getSortedRecommendations()

  return (
    <div className="roamly-shell">
      {/* Navigation */}
      <nav className="border-b border-dark-800/80 bg-dark-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Plane className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Roamly
              </span>
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/assistant"
                className="flex items-center gap-2 text-dark-300 hover:text-dark-50 transition text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                New Search
              </Link>
              <Link
                href="/planner"
                className="text-dark-300 hover:text-dark-50 transition text-sm"
              >
                Classic Form
              </Link>
              <Link
                href="/watches"
                className="text-dark-300 hover:text-dark-50 transition text-sm"
              >
                My Watches
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 roamly-glass rounded-2xl p-5 md:p-6">
          <div className="flex items-center gap-2 text-sm text-dark-300 mb-3">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span>AI-Powered Recommendations</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-700/40 bg-green-900/20 text-green-300 text-xs mb-4">
            <span>Live source: {dataSource}</span>
            {sortedRecommendations[0]?.flight?.id && (
              <span className="opacity-80">• {sortedRecommendations[0].flight.id}</span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-dark-50 mb-2 text-balance">
            Top matches for your trip
          </h1>
          <p className="text-lg text-dark-300">
            {preferences.origin} → {preferences.destination} • {preferences.departureDate}
            {preferences.tripType === 'round-trip' && ` - ${preferences.returnDate}`}
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 roamly-glass rounded-2xl p-4">
          <h3 className="text-dark-50 font-semibold mb-2">Track this trip automatically</h3>
          <p className="text-sm text-dark-300 mb-3">
            If this option is not available now, Roamly can keep checking and alert you when a matching deal appears.
          </p>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="email"
              value={watchEmail}
              onChange={e => setWatchEmail(e.target.value)}
              placeholder="Enter email for alerts"
              className="flex-1 px-3 py-2 rounded-lg bg-dark-900 border border-dark-700 text-dark-100 placeholder-dark-500 outline-none focus:border-primary-500"
            />
            <button
              onClick={handleCreateWatch}
              disabled={isCreatingWatch}
              className="roamly-btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isCreatingWatch ? 'Creating Watch...' : 'Create Watch'}
            </button>
          </div>
          {watchStatusMessage && (
            <div className="mt-3 text-sm text-primary-300">{watchStatusMessage}</div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8 roamly-glass rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-dark-300" />
            <span className="font-medium text-dark-200">Sort by:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSortBy('score')}
              className={`px-4 py-2 rounded-full transition text-sm font-medium ${
                sortBy === 'score'
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-800 hover:bg-dark-700 text-dark-200 border border-dark-700'
              }`}
            >
              Best Match
            </button>
            <button
              onClick={() => setSortBy('price')}
              className={`px-4 py-2 rounded-full transition text-sm font-medium ${
                sortBy === 'price'
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-800 hover:bg-dark-700 text-dark-200 border border-dark-700'
              }`}
            >
              Lowest Price
            </button>
            <button
              onClick={() => setSortBy('duration')}
              className={`px-4 py-2 rounded-full transition text-sm font-medium ${
                sortBy === 'duration'
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-800 hover:bg-dark-700 text-dark-200 border border-dark-700'
              }`}
            >
              Fastest
            </button>
          </div>
          <div className="md:ml-auto text-sm text-dark-300 flex items-center">
            Found {recommendations.length} options
          </div>
        </div>

        {/* Recommendations */}
        {errorMessage && (
          <div className="mb-6 bg-yellow-900/20 border border-yellow-700/30 text-yellow-200 rounded-lg p-4">
            {errorMessage}
          </div>
        )}

        <div className="space-y-6">
          {sortedRecommendations.map((recommendation, index) => (
            <RecommendationCard
              key={recommendation.flight.id}
              recommendation={recommendation}
              rank={index + 1}
            />
          ))}
        </div>

        {/* Travel Score Explanation */}
        <div className="mt-12 roamly-glass rounded-2xl p-8">
          <h3 className="text-xl font-bold text-dark-50 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span> How We Score Travel Options
          </h3>
          <p className="text-dark-200 mb-4">
            Each option receives a comprehensive Travel Score (0-100) based on multiple factors:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-dark-900/70 border border-dark-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💰</span>
                <span className="font-semibold text-dark-50">Cost Efficiency (30%)</span>
              </div>
              <p className="text-sm text-dark-300">
                How well the price fits your budget, including base fare and baggage fees
              </p>
            </div>
            <div className="bg-dark-900/70 border border-dark-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⚡</span>
                <span className="font-semibold text-dark-50">Convenience (25%)</span>
              </div>
              <p className="text-sm text-dark-300">
                Travel time, number of layovers, and connection quality
              </p>
            </div>
            <div className="bg-dark-900/70 border border-dark-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">✨</span>
                <span className="font-semibold text-dark-50">Comfort (20%)</span>
              </div>
              <p className="text-sm text-dark-300">
                Cabin class, amenities, baggage allowance, and legroom
              </p>
            </div>
            <div className="bg-dark-900/70 border border-dark-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🛡️</span>
                <span className="font-semibold text-dark-50">Reliability (15%)</span>
              </div>
              <p className="text-sm text-dark-300">
                Airline on-time performance and cancellation policies
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 roamly-glass rounded-2xl p-8">
          <h3 className="text-xl font-bold text-dark-50 mb-4">💡 Smart Booking Tips</h3>
          <ul className="space-y-3 text-dark-200">
            <li className="flex items-start gap-2">
              <span className="text-primary-400 font-bold">•</span>
              <span>Prices typically drop 3-4 weeks before departure for domestic flights</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-400 font-bold">•</span>
              <span>Book Tuesday-Thursday for potential savings of 5-10%</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-400 font-bold">•</span>
              <span>Consider nearby airports - you might save significantly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-400 font-bold">•</span>
              <span>Flexible dates can save you an average of $80 per ticket</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
