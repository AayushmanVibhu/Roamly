'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plane, Sparkles, ArrowRight, MessageCircle, MapPin, CalendarDays, Luggage } from 'lucide-react'
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
    router.push('/assistant')
  }

  return (
    <main className="min-h-screen bg-dark-950">
      <section
        aria-label="Hero"
        className="relative min-h-screen"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#f97316]/55 via-[#7c3aed]/45 to-[#2563eb]/55" />
        <div className="absolute inset-0 bg-black/40" />

        <nav className="relative z-10 border-b border-white/15 bg-black/20 backdrop-blur-sm" aria-label="Main navigation">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Plane className="w-7 h-7 text-white" />
                <span className="text-2xl font-bold text-white">Roamly</span>
              </Link>
              <div className="hidden md:flex items-center gap-6 text-white text-sm">
                <Link href="/results" className="hover:text-white/80 transition">Results</Link>
                <Link href="/assistant" className="hover:text-white/80 transition">Chat input</Link>
                <Link href="/watches" className="hover:text-white/80 transition">My Watches</Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-14">
          <div className="text-center mb-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-black/30 px-4 py-1.5 text-sm text-white font-medium">
              <Sparkles className="w-4 h-4" />
              Plan your next escape
            </p>
            <h1 className="mt-6 text-4xl md:text-6xl font-bold text-white drop-shadow-lg text-balance">
              Where do you want to go?
            </h1>
            <p className="mt-4 text-lg md:text-2xl text-white font-medium drop-shadow-md max-w-3xl mx-auto text-balance">
              We&apos;ll help you figure out the best way to get there
            </p>
          </div>

          <div className="max-w-4xl mx-auto rounded-3xl bg-white backdrop-blur-md shadow-[0_25px_80px_-35px_rgba(0,0,0,0.65)] border border-white/65 p-5 md:p-7">
            <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 mb-5">
              <button
                onClick={() => setInputMode('form')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  inputMode === 'form'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Quick form
              </button>
              <button
                onClick={() => setInputMode('chat')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  inputMode === 'chat'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chat style input
              </button>
            </div>

            {inputMode === 'form' ? (
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-3">
                  <label className="rounded-2xl border border-slate-200 px-4 py-3 bg-white block">
                    <span className="text-xs text-slate-600 uppercase tracking-wide font-semibold">From</span>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-slate-500" aria-hidden="true" />
                      <input
                        value={from}
                        onChange={e => setFrom(e.target.value)}
                        placeholder="City or airport"
                        className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 outline-none"
                        required
                      />
                    </div>
                  </label>

                  <label className="rounded-2xl border border-slate-200 px-4 py-3 bg-white block">
                    <span className="text-xs text-slate-600 uppercase tracking-wide font-semibold">To</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Plane className="w-4 h-4 text-slate-500" aria-hidden="true" />
                      <input
                        value={to}
                        onChange={e => setTo(e.target.value)}
                        placeholder="Destination"
                        className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 outline-none"
                        required
                      />
                    </div>
                  </label>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <label className="rounded-2xl border border-slate-200 px-4 py-3 bg-white block">
                    <span className="text-xs text-slate-600 uppercase tracking-wide font-semibold">Departure</span>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarDays className="w-4 h-4 text-slate-500" aria-hidden="true" />
                      <input
                        type="date"
                        value={departureDate}
                        onChange={e => setDepartureDate(e.target.value)}
                        min={today}
                        className="w-full bg-transparent text-slate-900 outline-none"
                      />
                    </div>
                  </label>

                  <label className="rounded-2xl border border-slate-200 px-4 py-3 bg-white block">
                    <span className="text-xs text-slate-600 uppercase tracking-wide font-semibold">Return</span>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarDays className="w-4 h-4 text-slate-500" aria-hidden="true" />
                      <input
                        type="date"
                        value={returnDate}
                        onChange={e => setReturnDate(e.target.value)}
                        min={departureDate || today}
                        className="w-full bg-transparent text-slate-900 outline-none"
                      />
                    </div>
                  </label>

                  <label className="rounded-2xl border border-slate-200 px-4 py-3 bg-white block">
                    <span className="text-xs text-slate-600 uppercase tracking-wide font-semibold">Baggage</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Luggage className="w-4 h-4 text-slate-500" aria-hidden="true" />
                      <select
                        value={baggage}
                        onChange={e => setBaggage(e.target.value as BaggagePreference)}
                        className="w-full bg-transparent text-slate-900 outline-none"
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
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 px-8 py-3 text-white font-semibold transition shadow-md"
                >
                  Search
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-700 text-sm">
                  Keep it simple. Tell us your trip in one sentence and continue in chat.
                </p>
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <textarea
                    value={chatPrompt}
                    onChange={e => setChatPrompt(e.target.value)}
                    placeholder="Example: I want to fly from Phoenix to New York under $350 with one checked bag."
                    className="w-full h-24 resize-none bg-transparent text-slate-900 placeholder:text-slate-400 outline-none"
                  />
                </div>
                <button
                  onClick={handleChatMode}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 px-6 py-3 text-white font-semibold transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  Continue in chat
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
