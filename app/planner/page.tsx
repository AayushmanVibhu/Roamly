'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'
import TripInputForm from '@/components/TripInputForm'
import { TripPreferences } from '@/types'

export default function PlannerPage() {
  const router = useRouter()
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (preferences: TripPreferences) => {
    setIsSearching(true)

    try {
      sessionStorage.setItem('tripPreferences', JSON.stringify(preferences))
      await new Promise(resolve => setTimeout(resolve, 1500))
      router.push('/results')
    } catch (error) {
      console.error('Error processing request:', error)
      alert('There was an error processing your request. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="app-shell">
      <SiteHeader />

      <div className="app-content py-10 md:py-14">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 grid gap-5 lg:grid-cols-[1fr,auto] lg:items-end">
            <div>
              <div className="eyebrow mb-5">
                <Search className="h-3.5 w-3.5" />
                Structured trip builder
              </div>
              <h1 className="section-title">Build a watch-worthy trip brief</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                Use the full form when you want more control over dates, cabin class, baggage,
                and timing preferences before we rank and track routes.
              </p>
            </div>
            <Link href="/" className="action-secondary">
              Back to quick search
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="glass-panel p-6 md:p-8">
            <TripInputForm onSubmit={handleSearch} isLoading={isSearching} />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="soft-panel p-5">
              <p className="text-sm font-semibold text-white">Constraint-aware search</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Route, dates, bags, and cabin preferences all feed the ranking engine.
              </p>
            </div>
            <div className="soft-panel p-5">
              <p className="text-sm font-semibold text-white">Transparent pricing</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Roamly compares headline fare against the likely real trip total.
              </p>
            </div>
            <div className="soft-panel p-5">
              <p className="text-sm font-semibold text-white">Track after search</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Save a watch if the right fare is not live yet and let the system re-check.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
