'use client'

import Link from 'next/link'
import { ArrowRight, BellRing, DollarSign, Plane, Radar, Target } from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'

export default function DashboardPage() {
  const stats = {
    totalTripsPlanned: 0,
    totalSaved: 0,
    averageScore: 0,
    recentSearches: [] as Array<{ id: string; route: string; date: string }>,
  }

  return (
    <div className="app-shell">
      <SiteHeader />

      <div className="app-content py-8 md:py-10">
        <div className="glass-panel p-6 md:p-8">
          <div className="eyebrow">
            <Radar className="h-3.5 w-3.5" />
            Operator overview
          </div>
          <h1 className="mt-4 font-[family:var(--font-display)] text-3xl font-semibold text-white md:text-5xl">
            Roamly dashboard
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            This is the command center for trip searches, savings, and watch activity. The data
            layer is still thin, but the layout now matches the watch-first product direction.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard icon={<Plane className="h-5 w-5 text-sky-200" />} label="Trips planned" value={stats.totalTripsPlanned} />
          <StatCard icon={<DollarSign className="h-5 w-5 text-emerald-200" />} label="Saved" value={`$${stats.totalSaved}`} />
          <StatCard icon={<Target className="h-5 w-5 text-amber-200" />} label="Average score" value={stats.averageScore} />
          <StatCard icon={<BellRing className="h-5 w-5 text-rose-200" />} label="Recent searches" value={stats.recentSearches.length} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="soft-panel p-6">
            <h2 className="text-xl font-semibold text-white">Saved trips</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              No saved trips yet. Once searches and watchlists are persisted more broadly, this
              area can become the place to resume or compare tracked itineraries.
            </p>
            <Link href="/planner" className="action-primary mt-6">
              Start a trip
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="soft-panel p-6">
            <h2 className="text-xl font-semibold text-white">Recent watch activity</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Hook this panel up next to real watch runs, matched alerts, and latest route checks.
            </p>
            <Link href="/watches" className="action-secondary mt-6">
              Open watches
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="soft-panel p-5">
      <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/8 p-3">
        {icon}
      </div>
      <div className="text-3xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-sm text-slate-400">{label}</div>
    </div>
  )
}
