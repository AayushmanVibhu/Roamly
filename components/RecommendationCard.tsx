'use client'

import { useState } from 'react'
import { TravelRecommendation } from '@/types'
import { 
  Plane, 
  Clock, 
  Luggage, 
  ChevronDown, 
  ChevronUp,
  TrendingDown,
  TrendingUp,
  Minus,
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import TravelScoreBadge from './TravelScoreBadge'
import PriceBreakdown from './PriceBreakdown'

interface RecommendationCardProps {
  recommendation: TravelRecommendation
  rank: number
}

/**
 * RecommendationCard Component
 * Displays a flight recommendation with AI analysis and scoring
 */
export default function RecommendationCard({ recommendation, rank }: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { flight, score, tags, aiSummary, constraintMatch } = recommendation

  // Format duration from minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  // Format time from ISO string
  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  // Get price trend icon
  const getPriceTrendIcon = () => {
    const trend = score.priceAnalysis.trend
    if (trend === 'rising') return <TrendingUp className="w-4 h-4 text-red-500" />
    if (trend === 'falling') return <TrendingDown className="w-4 h-4 text-green-500" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
      {/* Rank Badge */}
      {rank === 1 && (
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-4 py-2 flex items-center gap-2 font-semibold">
          <Award className="w-5 h-5" />
          <span>Best Overall Choice</span>
        </div>
      )}

      <div className="p-6">
        {/* Header with Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              constraintMatch.isFullMatch
                ? 'bg-green-900/20 text-green-400 border-green-700/40'
                : 'bg-yellow-900/20 text-yellow-300 border-yellow-700/40'
            }`}
          >
            {constraintMatch.isFullMatch
              ? 'Full Match'
              : `Partial Match (${constraintMatch.missedConstraints.length} missed)`}
          </span>
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-primary-900/30 text-primary-300 border border-primary-700/30 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Main Flight Info */}
        <div className="grid md:grid-cols-12 gap-6 mb-6">
          {/* Flight Details - Left Side */}
          <div className="md:col-span-7">
            {flight.segments.map((segment, index) => (
              <div key={segment.id} className="mb-4 last:mb-0">
                {index > 0 && (
                  <div className="flex items-center gap-2 my-3 text-sm text-dark-400">
                    <div className="flex-1 h-px bg-dark-600"></div>
                    <span className="px-2">
                      Layover: {formatDuration(flight.layoverDurations[index - 1])} in {flight.segments[index - 1].arrivalAirport}
                    </span>
                    <div className="flex-1 h-px bg-dark-600"></div>
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-dark-50">{formatTime(segment.departureTime)}</div>
                    <div className="text-sm text-dark-300">{segment.departureAirport}</div>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center">
                    <div className="text-xs text-dark-400 mb-1">{formatDuration(segment.duration)}</div>
                    <div className="w-full h-px bg-dark-600 relative">
                      <Plane className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-600 bg-dark-800" />
                    </div>
                    <div className="text-xs text-dark-400 mt-1">{segment.airline}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-dark-50">{formatTime(segment.arrivalTime)}</div>
                    <div className="text-sm text-dark-300">{segment.arrivalAirport}</div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Flight Metadata */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-dark-300">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Total: {formatDuration(flight.totalDuration)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Luggage className="w-4 h-4" />
                <span>
                  {flight.baggage.carryOn} carry-on
                  {flight.baggage.checked > 0 && `, ${flight.baggage.checked} checked`}
                </span>
              </div>
              {flight.layoverCount > 0 && (
                <div className="flex items-center gap-1">
                  <span>{flight.layoverCount} stop{flight.layoverCount > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>

          {/* Price & Score - Right Side */}
          <div className="md:col-span-5 flex flex-col justify-between border-l md:pl-6">
            <div>
              <TravelScoreBadge score={score.overall} size="large" />
              
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-dark-50">${flight.totalCost.estimatedTotal}</span>
                  <span className="text-dark-300">per person</span>
                </div>
                <div className="text-xs text-dark-400 mt-1">
                  Headline fare ${flight.totalCost.headlineFare} • Pricing confidence: {flight.totalCost.confidence}
                </div>
                
                <div className="flex items-center gap-2 mt-2 text-sm">
                  {getPriceTrendIcon()}
                  <span className={
                    score.priceAnalysis.isPriceGood 
                      ? 'text-green-600 font-medium' 
                      : 'text-dark-300'
                  }>
                    {score.priceAnalysis.comparedToAverage > 0 ? '+' : ''}
                    {score.priceAnalysis.comparedToAverage}% vs average
                  </span>
                </div>
              </div>
            </div>

            <button className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold mt-4">
              Select Flight
            </button>
          </div>
        </div>

        {/* AI Summary */}
        <div className="bg-gradient-to-r from-purple-900/20 to-primary-900/20 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-dark-50 mb-2">AI Insight</h4>
              <p className="text-sm text-dark-200">{aiSummary}</p>
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium transition"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-5 h-5" />
              Show Less Details
            </>
          ) : (
            <>
              <ChevronDown className="w-5 h-5" />
              Show More Details
            </>
          )}
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t space-y-6">
            {/* Constraint Match */}
            <div>
              <h4 className="font-semibold text-dark-50 mb-3">Constraint Match</h4>
              <div className="text-sm text-dark-300 mb-3">
                Matched {constraintMatch.matchedCount}/{constraintMatch.totalChecked} checked constraints
              </div>

              {constraintMatch.missedConstraints.length > 0 ? (
                <div className="space-y-2">
                  {constraintMatch.missedConstraints.map((item) => (
                    <div
                      key={`missed-${item.key}`}
                      className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-300 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <div className="text-yellow-200 font-medium">{item.label}</div>
                          <div className="text-yellow-100/90">{item.reason}</div>
                          <div className="text-xs text-yellow-100/70 mt-1">
                            Expected: {item.expectedValue} • Actual: {item.actualValue}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-3 text-sm text-green-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  All checked constraints are satisfied.
                </div>
              )}
            </div>

            {/* Score Breakdown */}
            <div>
              <h4 className="font-semibold text-dark-50 mb-4">Travel Score Breakdown</h4>
              <div className="space-y-3">
                {Object.entries(score.breakdown).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize flex items-center gap-2">
                        {key === 'price' && '💰'}
                        {key === 'convenience' && '⚡'}
                        {key === 'comfort' && '✨'}
                        {key === 'reliability' && '🛡️'}
                        {key === 'scheduleMatch' && '🕐'}
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-semibold">{value}/100</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          value >= 90 ? 'bg-green-500' :
                          value >= 75 ? 'bg-blue-500' :
                          value >= 60 ? 'bg-yellow-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-primary-900/20 rounded-lg text-sm text-dark-50">
                <strong>Note:</strong> Price score includes base fare + baggage fees. Comfort score considers included baggage allowance.
              </div>
            </div>

            {/* Key Insights */}
            <div>
              <h4 className="font-semibold text-dark-50 mb-3">Key Insights</h4>
              <ul className="space-y-2">
                {score.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-dark-200">
                    <span className="text-primary-400 mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Breakdown */}
            <PriceBreakdown flight={flight} />

            {/* Amenities */}
            {flight.amenities.length > 0 && (
              <div>
                <h4 className="font-semibold text-dark-50 mb-3">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {flight.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-3 py-1 bg-green-900/20 text-green-400 rounded-full text-sm"
                    >
                      ✓ {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cancellation Policy */}
            <div>
              <h4 className="font-semibold text-dark-50 mb-2">Cancellation Policy</h4>
              <p className="text-sm text-dark-200 capitalize">{flight.cancellationPolicy}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
