'use client'

import { useEffect, useMemo, useState } from 'react'
import { BellRing, PauseCircle, PlayCircle, RefreshCcw, Trash2 } from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'
import { getEffectiveCheckIntervalMinutes } from '@/lib/watchIntervals'
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
    <div className="app-shell">
      <SiteHeader />

      <div className="app-content py-8 md:py-10">
        <div className="glass-panel p-6 md:p-8">
          <div className="eyebrow">
            <BellRing className="h-3.5 w-3.5" />
            Active route monitoring
          </div>
          <h1 className="mt-4 font-[family:var(--font-display)] text-3xl font-semibold text-white md:text-5xl">
            Your flight watches
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Manage the routes Roamly is monitoring for you. Watches check every few hours by
            default and tighten to hourly as departure gets close.
          </p>
        </div>

        <div className="mt-6 soft-panel p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter email used for watch alerts"
              className="field-shell flex-1"
            />
            <button
              onClick={() => loadWatches(email, filter)}
              disabled={isLoading}
              className="action-primary"
            >
              <RefreshCcw className="h-4 w-4" />
              {isLoading ? 'Loading...' : 'Load watches'}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {(['all', 'active', 'paused', 'matched', 'cancelled'] as WatchFilter[]).map(status => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status)
                  void loadWatches(email, status)
                }}
                className={`rounded-full px-3 py-1 text-xs capitalize transition ${
                  filter === status
                    ? 'bg-white text-slate-950'
                    : 'border border-white/10 bg-white/6 text-slate-300 hover:bg-white/10'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {statusMessage && (
          <div className="mt-4 rounded-2xl border border-sky-400/25 bg-sky-400/10 p-3 text-sm text-sky-100">
            {statusMessage}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {filteredWatches.length === 0 ? (
            <div className="soft-panel p-8 text-center text-slate-300">
              No watches to show for this filter.
            </div>
          ) : (
            filteredWatches.map(watch => {
              const effectiveInterval = getEffectiveCheckIntervalMinutes(watch)

              return (
                <div key={watch.id} className="glass-panel p-5">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-semibold text-white">
                          {watch.preferences.origin} → {watch.preferences.destination}
                        </h3>
                        <span className={`status-pill ${statusBadgeClass(watch.status)}`}>
                          {watch.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-slate-300">
                        <div>Target price: ${watch.targetPrice} ({watch.preferences.currency})</div>
                        <div>Departure: {watch.preferences.departureDate}</div>
                        <div>Current cadence: every {effectiveInterval} minutes</div>
                        {watch.lastCheckedAt && <div>Last checked: {formatDateTime(watch.lastCheckedAt)}</div>}
                        {watch.latestMatch && (
                          <div className="text-emerald-300">
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
                          className="action-secondary"
                        >
                          <PauseCircle className="h-4 w-4" />
                          Pause
                        </button>
                      ) : (
                        watch.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateWatch(watch.id, 'resume')}
                            disabled={updatingWatchId === watch.id}
                            className="action-secondary"
                          >
                            <PlayCircle className="h-4 w-4" />
                            Resume
                          </button>
                        )
                      )}

                      {watch.status !== 'cancelled' && (
                        <button
                          onClick={() => handleUpdateWatch(watch.id, 'cancel')}
                          disabled={updatingWatchId === watch.id}
                          className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/15"
                        >
                          Cancel
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteWatch(watch.id)}
                        disabled={updatingWatchId === watch.id}
                        className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/15"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

function statusBadgeClass(status: TravelWatchStatus): string {
  if (status === 'active') return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
  if (status === 'paused') return 'border-amber-400/25 bg-amber-400/10 text-amber-100'
  if (status === 'matched') return 'border-sky-400/25 bg-sky-400/10 text-sky-100'
  return 'border-white/10 bg-white/6 text-slate-300'
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
