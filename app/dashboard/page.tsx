'use client'

import Link from 'next/link'
import { Plane, TrendingUp, Clock, Award, Plus, ArrowRight, DollarSign } from 'lucide-react'

export default function DashboardPage() {
  const stats = {
    totalTripsPlanned: 0,
    totalSaved: 0,
    averageScore: 0,
    recentSearches: [] as Array<{ id: string; route: string; date: string }>,
  }
  const savedTrips: Array<never> = []

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      {/* Navigation */}
      <nav className="border-b border-dark-800 bg-dark-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Plane className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Roamly
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-dark-300 hover:text-dark-50 transition">
                Home
              </Link>
              <Link href="/planner" className="text-dark-300 hover:text-dark-50 transition">
                Plan Trip
              </Link>
              <Link href="/dashboard" className="text-primary-400 font-medium">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-dark-50 mb-2">Your Travel Dashboard</h1>
          <p className="text-lg text-dark-300">Track your trips and savings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Total Trips */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary-900/30 p-3 rounded-lg">
                <Plane className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-dark-50">{stats.totalTripsPlanned}</div>
                <div className="text-sm text-dark-300">Trips Planned</div>
              </div>
            </div>
            <div className="text-xs text-dark-300 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>No trips yet</span>
            </div>
          </div>

          {/* Total Saved */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-900/30 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-dark-50">${stats.totalSaved}</div>
                <div className="text-sm text-dark-300">Total Saved</div>
              </div>
            </div>
            <div className="text-xs text-dark-300">
              Compared to average prices
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-900/30 p-3 rounded-lg">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-dark-50">{stats.averageScore}</div>
                <div className="text-sm text-dark-300">Avg. Score</div>
              </div>
            </div>
            <div className="text-xs text-dark-300">
              Quality of your bookings
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-900/30 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-dark-50">{stats.recentSearches.length}</div>
                <div className="text-sm text-dark-300">Recent Searches</div>
              </div>
            </div>
            <div className="text-xs text-dark-300">
              Last 30 days
            </div>
          </div>
        </div>

        {/* Saved Trips Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-dark-50">Your Saved Trips</h2>
            <Link
              href="/planner"
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              <Plus className="w-4 h-4" />
              New Trip
            </Link>
          </div>

          {savedTrips.length === 0 && (
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center text-dark-300">
              No saved trips yet. Start a search to create your first trip.
            </div>
          )}
        </div>

        {/* Recent Searches */}
        <div>
          <h2 className="text-2xl font-bold text-dark-50 mb-6">Recent Searches</h2>
          {stats.recentSearches.length === 0 ? (
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 text-dark-300">
              No recent searches yet.
            </div>
          ) : null}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Ready for your next adventure?</h3>
          <p className="mb-6 opacity-90">
            Start planning your next trip and let our AI find the best options for you
          </p>
          <Link
            href="/planner"
            className="inline-flex items-center gap-2 bg-dark-700 text-primary-300 border border-primary-700/50 px-6 py-3 rounded-lg hover:bg-dark-600 transition font-semibold"
          >
            Plan New Trip
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
