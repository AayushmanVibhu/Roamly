'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plane, ArrowLeft, Search } from 'lucide-react'
import TripInputForm from '@/components/TripInputForm'
import { TripPreferences } from '@/types'

export default function PlannerPage() {
  const router = useRouter()
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (preferences: TripPreferences) => {
    setIsSearching(true)
    
    try {
      // Store preferences in session storage
      sessionStorage.setItem('tripPreferences', JSON.stringify(preferences))
      
      // Log for debugging
      console.log('🚀 Trip Preferences:', preferences)
      
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Navigate to results page where recommendations will be generated
      router.push('/results')
    } catch (error) {
      console.error('Error processing request:', error)
      alert('There was an error processing your request. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="relative min-h-screen scenic-bg">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f97316]/40 via-[#7c3aed]/35 to-[#2563eb]/40" />
      <div className="absolute inset-0 bg-dark-950/55" />
      <nav className="relative z-10 border-b border-white/10 bg-dark-900/50 backdrop-blur-md sticky top-0" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Plane className="w-8 h-8 text-primary-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                Roamly
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-dark-300 hover:text-dark-50 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary-900/30 text-primary-300 border border-primary-700/30 px-4 py-2 rounded-full mb-6">
            <Search className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm font-medium">Smart Trip Planning</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-dark-50">
            Plan Your Perfect Trip
          </h1>
          <p className="text-xl text-dark-300">
            Tell us what you&apos;re looking for, and we&apos;ll find the best options for you
          </p>
        </div>

        {/* Trip Input Form */}
        <div className="bg-dark-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 p-8 mb-8">
          <TripInputForm onSubmit={handleSearch} isLoading={isSearching} />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-dark-800/60 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-sm">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-semibold mb-2 text-white">Personalized Results</h3>
            <p className="text-sm text-dark-200">
              Get recommendations tailored to your specific needs and preferences
            </p>
          </div>
          <div className="bg-dark-800/60 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-sm">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-semibold mb-2 text-white">Price Intelligence</h3>
            <p className="text-sm text-dark-200">
              See if you&apos;re getting a good deal with our AI price analysis
            </p>
          </div>
          <div className="bg-dark-800/60 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-sm">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-semibold mb-2 text-white">Instant Insights</h3>
            <p className="text-sm text-dark-200">
              Understand why each option is worth considering or avoiding
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
