import Link from 'next/link'
import { ArrowRight, Plane, DollarSign, Clock, Award, Sparkles, CheckCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      {/* Navigation */}
      <nav className="border-b border-dark-800 bg-dark-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Plane className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Roamly
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-dark-300 hover:text-dark-50 transition">
                Features
              </Link>
              <Link href="#how-it-works" className="text-dark-300 hover:text-dark-50 transition">
                How It Works
              </Link>
              <Link href="/dashboard" className="text-dark-300 hover:text-dark-50 transition">
                Dashboard
              </Link>
              <Link
                href="/planner"
                className="bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition"
              >
                Start Planning
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary-900/30 text-primary-300 border border-primary-700/30 px-4 py-2 rounded-full mb-8">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Travel Decisions</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-dark-50 via-primary-400 to-purple-400 bg-clip-text text-transparent">
              Travel Smarter,
              <br />
              Not Harder
            </h1>
            
            <p className="text-xl md:text-2xl text-dark-300 mb-12 max-w-3xl mx-auto">
              Stop wasting time comparing flights. Let Roamly find the best travel options 
              based on your budget, preferences, and what matters most to you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/planner"
                className="group bg-primary-600 text-white px-8 py-4 rounded-full hover:bg-primary-700 transition flex items-center gap-2 text-lg font-semibold shadow-lg hover:shadow-xl"
              >
                Plan Your Trip
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <button className="text-dark-200 px-8 py-4 rounded-full hover:bg-dark-800 transition text-lg font-semibold border border-dark-700">
                See How It Works
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto">
              <div>
                <div className="text-4xl font-bold text-primary-400">85%</div>
                <div className="text-sm text-dark-400 mt-1">Time Saved</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-400">$340</div>
                <div className="text-sm text-dark-400 mt-1">Avg. Savings</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-400">4.9★</div>
                <div className="text-sm text-dark-400 mt-1">User Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-900/30 rounded-full filter blur-xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-900/30 rounded-full filter blur-xl opacity-50 animate-pulse"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-dark-50">
              Why Choose Roamly?
            </h2>
            <p className="text-xl text-dark-300">
              We don&apos;t just show you flights—we help you make the right decision
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-dark-800 to-dark-750 p-8 rounded-2xl hover:shadow-xl hover:shadow-primary-900/20 transition border border-dark-700">
              <div className="bg-primary-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-dark-50">Smart Pricing</h3>
              <p className="text-dark-300">
                Know if you&apos;re getting a good deal with price analysis and trend predictions
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-dark-800 to-dark-750 p-8 rounded-2xl hover:shadow-xl hover:shadow-purple-900/20 transition border border-dark-700">
              <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-dark-50">Time Optimizer</h3>
              <p className="text-dark-300">
                Factor in layovers, delays, and total travel time for real convenience
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-dark-800 to-dark-750 p-8 rounded-2xl hover:shadow-xl hover:shadow-green-900/20 transition border border-dark-700">
              <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-dark-50">Quality Score</h3>
              <p className="text-dark-300">
                See overall value scores based on price, comfort, schedule, and reliability
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-dark-800 to-dark-750 p-8 rounded-2xl hover:shadow-xl hover:shadow-orange-900/20 transition border border-dark-700">
              <div className="bg-orange-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-dark-50">AI Insights</h3>
              <p className="text-dark-300">
                Get personalized recommendations based on your preferences and constraints
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-dark-950 to-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-dark-50">
              How It Works
            </h2>
            <p className="text-xl text-dark-300">
              Three simple steps to smarter travel decisions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4 text-dark-50">Tell Us Your Plans</h3>
              <p className="text-dark-300 text-lg">
                Enter your destination, dates, budget, and preferences. Be as specific or flexible as you like.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4 text-dark-50">AI Analyzes Options</h3>
              <p className="text-dark-300 text-lg">
                Our AI evaluates hundreds of flights, considering price, time, comfort, and your specific needs.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 text-dark-50">Get Smart Recommendations</h3>
              <p className="text-dark-300 text-lg">
                See the best options ranked by value, with clear explanations of why each is worth considering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Travel Smarter?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of travelers who&apos;ve stopped stressing over flight searches
          </p>
          <Link
            href="/planner"
            className="inline-flex items-center gap-2 bg-dark-800 text-primary-300 border border-primary-700/50 px-8 py-4 rounded-full hover:bg-dark-700 transition text-lg font-semibold shadow-lg"
          >
            Start Planning for Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-950 text-dark-300 py-12 border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Plane className="w-6 h-6 text-primary-400" />
                <span className="text-xl font-bold text-white">Roamly</span>
              </div>
              <p className="text-sm">
                Making travel decisions simple and intelligent.
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
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-dark-300 hover:text-white transition">About</a></li>
                <li><a href="#" className="text-dark-300 hover:text-white transition">Blog</a></li>
                <li><a href="#" className="text-dark-300 hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-dark-300 hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="text-dark-300 hover:text-white transition">Terms</a></li>
                <li><a href="#" className="text-dark-300 hover:text-white transition">Contact</a></li>
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
