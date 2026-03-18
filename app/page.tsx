import Link from 'next/link'
import {
  ArrowRight,
  Plane,
  DollarSign,
  Clock3,
  Sparkles,
  BellRing,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'

export default function Home() {
  return (
    <div className="roamly-shell">
      <nav className="sticky top-0 z-50 border-b border-dark-800/80 bg-dark-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Plane className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Roamly
              </span>
            </div>
            <div className="hidden md:flex items-center gap-7 text-sm">
              <Link href="#features" className="text-dark-300 hover:text-dark-50 transition">
                Features
              </Link>
              <Link href="#how-it-works" className="text-dark-300 hover:text-dark-50 transition">
                How It Works
              </Link>
              <Link href="/assistant" className="text-dark-300 hover:text-dark-50 transition">
                AI Assistant
              </Link>
              <Link href="/dashboard" className="text-dark-300 hover:text-dark-50 transition">
                Dashboard
              </Link>
              <Link href="/watches" className="text-dark-300 hover:text-dark-50 transition">
                My Watches
              </Link>
              <Link href="/planner" className="roamly-btn-primary">
                Start Planning
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="animate-fade-in">
              <div className="roamly-pill mb-6">
                <BellRing className="w-4 h-4" />
                Set-and-forget flight agent
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-balance">
                Flights that match your rules —
                <span className="block bg-gradient-to-r from-primary-300 to-purple-300 bg-clip-text text-transparent">
                  with transparent total cost.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-dark-300 mb-9 max-w-xl">
                Roamly keeps searching after you leave, tracks live prices, and alerts you when a deal fits your
                budget, bags, and preferences.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/assistant" className="roamly-btn-primary">
                  <Sparkles className="w-5 h-5" />
                  Start with AI Assistant
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/planner" className="roamly-btn-secondary">
                  Use Structured Form
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-6 mt-10 max-w-md">
                <div>
                  <div className="text-2xl font-bold text-dark-50">24/7</div>
                  <div className="text-xs text-dark-400 mt-1">Auto price checks</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-dark-50">All-in</div>
                  <div className="text-xs text-dark-400 mt-1">Cost visibility</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-dark-50">1 tap</div>
                  <div className="text-xs text-dark-400 mt-1">Book handoff</div>
                </div>
              </div>
            </div>

            <div className="roamly-glass rounded-2xl p-6 md:p-7">
              <div className="flex items-center justify-between mb-5">
                <div className="text-sm text-dark-300">Live watch preview</div>
                <span className="roamly-pill">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI monitoring
                </span>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-dark-700 bg-dark-900/80 p-4">
                  <p className="text-dark-100 font-semibold">PHX → JFK · Under $250</p>
                  <p className="text-xs text-dark-400 mt-1">Checks every hour • non-stop preferred • 1 checked bag</p>
                </div>
                <div className="rounded-xl border border-green-700/30 bg-green-900/15 p-4">
                  <p className="text-green-300 font-semibold">Match found at $238</p>
                  <p className="text-xs text-green-200/80 mt-1">Estimated total includes fare + expected bag cost.</p>
                </div>
                <div className="space-y-2 text-sm text-dark-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-400" />
                    Total cost confidence shown for every recommendation
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-400" />
                    Booking link opens directly when you select an option
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-400" />
                    Alerts sent when constraints and target price align
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="roamly-pill mb-4">
              <Sparkles className="w-4 h-4" />
              Built for modern travelers
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 text-dark-50">Commercial-grade travel UX</h2>
            <p className="text-lg text-dark-300">
              Less noise, better decisions, and complete price transparency.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="roamly-glass rounded-2xl p-6">
              <div className="w-11 h-11 rounded-lg bg-primary-600/90 flex items-center justify-center mb-4">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-dark-50 mb-2">Total price, not teaser fare</h3>
              <p className="text-dark-300">
                Roamly highlights what is included, extra, and unknown so users understand the true cost upfront.
              </p>
            </div>
            <div className="roamly-glass rounded-2xl p-6">
              <div className="w-11 h-11 rounded-lg bg-purple-600/90 flex items-center justify-center mb-4">
                <Clock3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-dark-50 mb-2">Always-on watch engine</h3>
              <p className="text-dark-300">
                Users save a watch once, and the system keeps checking. No need to refresh search every few hours.
              </p>
            </div>
            <div className="roamly-glass rounded-2xl p-6">
              <div className="w-11 h-11 rounded-lg bg-green-600/90 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-dark-50 mb-2">Clear why this is recommended</h3>
              <p className="text-dark-300">
                Every option explains constraint match quality, pricing confidence, and tradeoffs before booking.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 text-dark-50">How Roamly works</h2>
            <p className="text-lg text-dark-300">Three steps from intent to booking.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="roamly-glass rounded-2xl p-6">
              <div className="mb-5 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3 text-dark-50">Share constraints</h3>
              <p className="text-dark-300">Use chat or form to set route, dates, budget, bags, cabin class, and stops.</p>
            </div>
            <div className="roamly-glass rounded-2xl p-6">
              <div className="mb-5 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3 text-dark-50">AI ranks options</h3>
              <p className="text-dark-300">Each result gets a match score, total-cost estimate, and plain-language explanation.</p>
            </div>
            <div className="roamly-glass rounded-2xl p-6">
              <div className="mb-5 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3 text-dark-50">Book or activate watch</h3>
              <p className="text-dark-300">Book immediately through a direct link, or create a watch and get alerted later.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="roamly-glass rounded-2xl px-6 py-10 md:px-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-dark-50">Ready for startup-grade travel decisions?</h2>
            <p className="text-dark-300 text-lg mb-8">
              Ship the first version your users trust: clear prices, clear recommendations, clear next step.
            </p>
            <Link href="/assistant" className="roamly-btn-primary text-base md:text-lg px-7 py-3">
              Launch AI Assistant
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-dark-950 text-dark-300 py-12 border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Plane className="w-6 h-6 text-primary-400" />
                <span className="text-xl font-bold text-white">Roamly</span>
              </div>
              <p className="text-sm">
                AI flight intelligence for people who value time, money, and clarity.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/planner" className="text-dark-300 hover:text-white transition">Trip Planner</Link></li>
                <li><Link href="/dashboard" className="text-dark-300 hover:text-white transition">Dashboard</Link></li>
                <li><Link href="#features" className="text-dark-300 hover:text-white transition">Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Navigate</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/assistant" className="text-dark-300 hover:text-white transition">Assistant</Link></li>
                <li><Link href="/results" className="text-dark-300 hover:text-white transition">Results</Link></li>
                <li><Link href="/watches" className="text-dark-300 hover:text-white transition">My Watches</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-dark-800 pt-8 text-sm text-center text-dark-400">
            <p>&copy; 2026 Roamly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
