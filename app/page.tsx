'use client'

import { FormEvent, startTransition, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plane, Sparkles, ArrowRight, MessageCircle, MapPin, CalendarDays, Luggage, Radar, BellRing, ShieldCheck } from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'
import { saveTripPreferences } from '@/lib/tripPreferencesUtils'
import { TripPreferences } from '@/types'

type InputMode = 'form' | 'chat'
type BaggagePreference = 'none' | 'carry-on' | 'checked'

export default function Home() {
  const router = useRouter()
  const [inputMode, setInputMode] = useState<InputMode>('form')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [baggage, setBaggage] = useState<BaggagePreference>('carry-on')
  const [chatPrompt, setChatPrompt] = useState('')

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    if (!from.trim() || !to.trim()) return

    const preferences: TripPreferences = {
      origin: from.trim(),
      destination: to.trim(),
      departureDate: departureDate || today,
      returnDate: returnDate || undefined,
      tripType: returnDate ? 'round-trip' : 'one-way',
      flexibleDates: false,
      passengers: {
        adults: 1,
        children: 0,
        infants: 0,
      },
      maxBudget: 1500,
      currency: 'USD',
      preferences: {
        cabinClass: 'economy',
        checkedBag: baggage === 'checked',
        nonstopOnly: false,
        departureTimePreferences: [],
        hotelNeeded: false,
      },
    }

    saveTripPreferences(preferences)
    router.push('/results')
  }

  const handleChatMode = () => {
    if (chatPrompt.trim()) {
      sessionStorage.setItem('roamlyChatPrompt', chatPrompt.trim())
    }

    startTransition(() => {
      router.push('/assistant')
    })

    window.setTimeout(() => {
      if (window.location.pathname !== '/assistant') {
        window.location.assign('/assistant')
      }
    }, 250)
  }

  return (
    <div className="app-shell">
      <SiteHeader />
      <section className="app-content pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="eyebrow">
                <Radar className="h-3.5 w-3.5" />
                Travel watch platform
              </p>
              <h1 className="font-[family:var(--font-display)] text-5xl font-semibold leading-[0.95] text-white text-balance md:text-7xl">
                Stop checking flight prices.
                <span className="block text-gradient-brand">Let Roamly watch them.</span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Create a watch for a specific route, date, and target budget. If the right fare
                is not available now, Roamly keeps checking until it is and then notifies you.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="soft-panel p-4">
                <BellRing className="mb-3 h-5 w-5 text-amber-300" />
                <p className="text-sm font-semibold text-white">Automatic price watches</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Search once, then let the platform keep monitoring the route for you.
                </p>
              </div>
              <div className="soft-panel p-4">
                <Radar className="mb-3 h-5 w-5 text-sky-300" />
                <p className="text-sm font-semibold text-white">Adaptive re-checking</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Watches recheck every few hours, and tighten to hourly when the flight is close.
                </p>
              </div>
              <div className="soft-panel p-4">
                <ShieldCheck className="mb-3 h-5 w-5 text-emerald-300" />
                <p className="text-sm font-semibold text-white">Decision-ready results</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  See true trip cost, fit against your constraints, and track the exact option.
                </p>
              </div>
            </div>

            <div className="glass-panel p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <span className="status-pill">Phoenix to New York</span>
                <span className="status-pill">April 14</span>
                <span className="status-pill">Under $250</span>
                <span className="status-pill">Checked bag</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Example: if fares are above your target today, Roamly keeps checking in the
                background and alerts you the moment the route drops into range.
              </p>
            </div>
          </div>

          <div className="glass-panel p-5 md:p-7">
            <div className="mb-5 inline-flex rounded-full border border-white/12 bg-white/6 p-1">
              <button
                type="button"
                onClick={() => setInputMode('form')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  inputMode === 'form'
                    ? 'bg-white text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Quick form
              </button>
              <button
                type="button"
                onClick={() => setInputMode('chat')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  inputMode === 'chat'
                    ? 'bg-white text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Chat style input
              </button>
            </div>

            {inputMode === 'form' ? (
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-3">
                  <label className="field-shell block">
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-400">From</span>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <input
                        value={from}
                        onChange={e => setFrom(e.target.value)}
                        placeholder="City or airport"
                        className="w-full bg-transparent text-white placeholder:text-slate-500 outline-none"
                        required
                      />
                    </div>
                  </label>

                  <label className="field-shell block">
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-400">To</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Plane className="w-4 h-4 text-slate-500" />
                      <input
                        value={to}
                        onChange={e => setTo(e.target.value)}
                        placeholder="Destination"
                        className="w-full bg-transparent text-white placeholder:text-slate-500 outline-none"
                        required
                      />
                    </div>
                  </label>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <label className="field-shell block">
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Departure</span>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarDays className="w-4 h-4 text-slate-500" />
                      <input
                        type="date"
                        value={departureDate}
                        onChange={e => setDepartureDate(e.target.value)}
                        min={today}
                        className="w-full bg-transparent text-white outline-none"
                      />
                    </div>
                  </label>

                  <label className="field-shell block">
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Return</span>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarDays className="w-4 h-4 text-slate-500" />
                      <input
                        type="date"
                        value={returnDate}
                        onChange={e => setReturnDate(e.target.value)}
                        min={departureDate || today}
                        className="w-full bg-transparent text-white outline-none"
                      />
                    </div>
                  </label>

                  <label className="field-shell block">
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Baggage</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Luggage className="w-4 h-4 text-slate-500" />
                      <select
                        value={baggage}
                        onChange={e => setBaggage(e.target.value as BaggagePreference)}
                        className="w-full bg-transparent text-white outline-none"
                      >
                        <option value="none">None</option>
                        <option value="carry-on">Carry-on</option>
                        <option value="checked">Checked</option>
                      </select>
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  className="action-primary w-full md:w-auto px-8"
                >
                  Search
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-300">
                  Keep it simple. Tell us your trip in one sentence and continue in chat.
                </p>
                <div className="field-shell p-3">
                  <textarea
                    value={chatPrompt}
                    onChange={e => setChatPrompt(e.target.value)}
                    placeholder="Example: I want to fly from Phoenix to New York under $350 with one checked bag."
                    className="h-24 w-full resize-none bg-transparent text-white placeholder:text-slate-500 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleChatMode}
                  className="action-primary"
                >
                  <MessageCircle className="w-4 h-4" />
                  Continue in chat
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
