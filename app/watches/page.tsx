'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plane, ArrowLeft, RefreshCcw, BellRing, PauseCircle, PlayCircle, Trash2 } from 'lucide-react'
import { TravelWatch, TravelWatchStatus } from '@/types'

type WatchFilter = 'all' | TravelWatchStatus

export default function WatchesPage() {
  const [email, setEmail] = useState('')
  const [watches, setWatches] = useState<TravelWatch[]>([])
  const [filter, setFilter] = useState<WatchFilter>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [updatingWatchId, setUpdatingWatchId] = useState<string | null>(null)

  useEffect(() => {
    const storedEmail = localStorage.getItem('watchEmail')
    if (storedEmail) {
      setEmail(storedEmail)
      void loadWatches(storedEmail, filter)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredWatches = useMemo(() => {
    if (filter === 'all') return watches
    return watches.filter(watch => watch.status === filter)
  }, [watches, filter])

  const loadWatches = async (emailValue = email, filterValue = filter) => {
    if (!emailValue.trim()) {
      setStatusMessage('Enter your email to load your watches.')
      return
    }

    setIsLoading(true)
    setStatusMessage(null)
    try {
      localStorage.setItem('watchEmail', emailValue.trim().toLowerCase())
      const query = new URLSearchParams({ email: emailValue.trim().toLowerCase() })
      if (filterValue !== 'all') query.set('status', filterValue)

      const response = await fetch(`/api/watches?${query.toString()}`)
      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.error || 'Failed to load watches.')

      setWatches(payload.watches || [])
      if ((payload.watches || []).length === 0) {
        setStatusMessage('No watches found for this email yet.')
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to load watches.')
      setWatches([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateWatch = async (watchId: string, action: 'pause' | 'resume' | 'cancel') => {
    setUpdatingWatchId(watchId)
    setStatusMessage(null)
    try {
      const response = await fetch(`/api/watches/${watchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.error || 'Failed to update watch.')

      setStatusMessage(`Watch ${action}d successfully.`)
      await loadWatches()
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to update watch.')
    } finally {
      setUpdatingWatchId(null)
    }
  }

  const handleDeleteWatch = async (watchId: string) => {
    setUpdatingWatchId(watchId)
    setStatusMessage(null)
    try {
      const response = await fetch(`/api/watches/${watchId}`, { method: 'DELETE' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.error || 'Failed to delete watch.')
      setStatusMessage('Watch deleted.')
      await loadWatches()
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to delete watch.')
    } finally {
      setUpdatingWatchId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      <nav className="border-b border-dark-800 bg-dark-900/80 backdrop-blur-sm sticky top-0 z-50" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Plane className="w-8 h-8 text-primary-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                Roamly
              </span>
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/results" className="text-dark-300 hover:text-dark-50 transition">Results</Link>
              <Link href="/assistant" className="text-dark-300 hover:text-dark-50 transition">Assistant</Link>
              <Link href="/" className="flex items-center gap-2 text-dark-300 hover:text-dark-50 transition">
                <ArrowLeft className="w-4 h-4" />
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-dark-50 mb-2">My Watches</h1>
          <p className="text-dark-300">
            Manage your price watches. Roamly will keep checking and alert you when matching deals appear.
          </p>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter email used for watch alerts"
              aria-label="Email used for watch alerts"
              className="flex-1 px-3 py-3 rounded-lg bg-dark-900 border border-dark-700 text-dark-100 placeholder-dark-500"
            />
            <button
              onClick={() => loadWatches(email, filter)}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white disabled:opacity-60 inline-flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              {isLoading ? 'Loading...' : 'Load Watches'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3" role="group" aria-label="Filter watches by status">
            {(['all', 'active', 'paused', 'matched', 'cancelled'] as WatchFilter[]).map(status => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status)
                  void loadWatches(email, status)
                }}
                aria-pressed={filter === status}
                className={`px-3 py-2 rounded-full text-xs border capitalize ${
                  filter === status
                    ? 'bg-primary-900/30 text-primary-300 border-primary-700/40'
                    : 'bg-dark-900 text-dark-300 border-dark-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {statusMessage && (
          <div className="mb-4 bg-primary-900/20 border border-primary-700/30 text-primary-300 rounded-lg p-3 text-sm" role="status">
            {statusMessage}
          </div>
        )}

        <div className="space-y-4">
          {filteredWatches.length === 0 ? (
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center text-dark-300">
              No watches to show for this filter.
            </div>
          ) : (
            filteredWatches.map(watch => (
              <div key={watch.id} className="bg-dark-800 border border-dark-700 rounded-xl p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <BellRing className="w-4 h-4 text-primary-400" />
                      <h3 className="text-lg font-semibold text-dark-50">
                        {watch.preferences.origin} → {watch.preferences.destination}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${statusBadgeClass(watch.status)}`}>
                        {watch.status}
                      </span>
                    </div>
                    <div className="text-sm text-dark-300 space-y-1">
                      <div>Target price: ${watch.targetPrice} ({watch.preferences.currency})</div>
                      <div>Checking every {watch.checkIntervalMinutes} minutes</div>
                      <div>Departure: {watch.preferences.departureDate}</div>
                      {watch.lastCheckedAt && <div>Last checked: {formatDateTime(watch.lastCheckedAt)}</div>}
                      {watch.latestMatch && (
                        <div className="text-primary-300">
                          Latest match: ${watch.latestMatch.estimatedTotal} at {formatDateTime(watch.latestMatch.matchedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {watch.status === 'active' ? (
                      <button
                        onClick={() => handleUpdateWatch(watch.id, 'pause')}
                        disabled={updatingWatchId === watch.id}
                        className="px-3 py-2 rounded-lg bg-dark-900 border border-dark-700 text-dark-100 text-sm inline-flex items-center gap-2"
                      >
                        <PauseCircle className="w-4 h-4" />
                        Pause
                      </button>
                    ) : (
                      watch.status !== 'cancelled' && (
                        <button
                          onClick={() => handleUpdateWatch(watch.id, 'resume')}
                          disabled={updatingWatchId === watch.id}
                          className="px-3 py-2 rounded-lg bg-dark-900 border border-dark-700 text-dark-100 text-sm inline-flex items-center gap-2"
                        >
                          <PlayCircle className="w-4 h-4" />
                          Resume
                        </button>
                      )
                    )}

                    {watch.status !== 'cancelled' && (
                      <button
                        onClick={() => handleUpdateWatch(watch.id, 'cancel')}
                        disabled={updatingWatchId === watch.id}
                        className="px-3 py-2 rounded-lg bg-yellow-900/20 border border-yellow-700/40 text-yellow-300 text-sm"
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteWatch(watch.id)}
                      disabled={updatingWatchId === watch.id}
                      className="px-3 py-2 rounded-lg bg-red-900/20 border border-red-700/40 text-red-300 text-sm inline-flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

function statusBadgeClass(status: TravelWatchStatus): string {
  if (status === 'active') return 'bg-green-900/20 text-green-300 border-green-700/40'
  if (status === 'paused') return 'bg-yellow-900/20 text-yellow-300 border-yellow-700/40'
  if (status === 'matched') return 'bg-primary-900/20 text-primary-300 border-primary-700/40'
  return 'bg-dark-900 text-dark-300 border-dark-700'
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
