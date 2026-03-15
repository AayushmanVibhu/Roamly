import { FlightOption } from '@/types'
import { DollarSign } from 'lucide-react'

interface PriceBreakdownProps {
  flight: FlightOption
}

/**
 * PriceBreakdown Component
 * Shows detailed price breakdown for a flight option
 */
export default function PriceBreakdown({ flight }: PriceBreakdownProps) {
  const { totalCost } = flight
  const requiredItems = totalCost.lineItems.filter(item => item.required)
  const optionalItems = totalCost.lineItems.filter(item => !item.required)
  const unknownItems = totalCost.lineItems.filter(item => item.status === 'unknown')

  const renderAmount = (amount?: number) => (typeof amount === 'number' ? `$${amount}` : '—')

  return (
    <div>
      <h4 className="font-semibold mb-3 flex items-center gap-2 text-dark-50">
        <DollarSign className="w-5 h-5" />
        Price Breakdown
      </h4>
      
      <div className="bg-dark-750 rounded-lg p-4 space-y-2 text-sm border border-dark-700">
        <div className="font-medium text-dark-50 mb-2">Estimated Required Costs:</div>
        {requiredItems.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span className="text-dark-300">{item.label}</span>
            <span
              className={`font-medium ${
                item.status === 'included'
                  ? 'text-green-500'
                  : item.status === 'extra'
                    ? 'text-dark-100'
                    : 'text-yellow-400'
              }`}
            >
              {item.status === 'included' && item.amount === 0 ? 'Included ✓' : renderAmount(item.amount)}
            </span>
          </div>
        ))}
        
        <div className="border-t pt-2 mt-2 flex justify-between text-base font-bold">
          <span className="text-dark-50">Estimated Total</span>
          <span className="text-primary-400">${totalCost.estimatedTotal}</span>
        </div>

        <div className="flex justify-between text-xs text-dark-400">
          <span>Headline fare</span>
          <span>${totalCost.headlineFare}</span>
        </div>

        <div className="border-t border-dark-700 pt-3 mt-3">
          <div className="font-medium text-dark-50 mb-2">Optional / Variable Costs:</div>
          {optionalItems.map((item) => (
            <div key={item.id} className="flex justify-between text-dark-300">
              <span>{item.label}</span>
              <span>
                {item.status === 'unknown' ? 'Unknown' : `+$${item.amount || 0}`}
              </span>
            </div>
          ))}
          <div className="flex justify-between text-xs text-dark-400 mt-2">
            <span>Potential total with common add-ons</span>
            <span>${totalCost.potentialTotal}</span>
          </div>
        </div>

        {unknownItems.length > 0 && (
          <div className="text-xs text-yellow-300 bg-yellow-900/20 border border-yellow-700/30 rounded-md px-2 py-1">
            Some costs are marked unknown and may vary at checkout.
          </div>
        )}

        <div className="border-t border-dark-700 pt-2 mt-2">
          <div className="flex justify-between text-xs text-dark-400">
            <span>Cost per hour of flight</span>
            <span>${Math.round(totalCost.estimatedTotal / (flight.totalDuration / 60))}/hr</span>
          </div>
          <div className="flex justify-between text-xs text-dark-400 mt-1">
            <span>Pricing confidence</span>
            <span className="capitalize">{totalCost.confidence}</span>
          </div>
        </div>
      </div>

      {/* Savings Tip */}
      <div className="mt-3 p-3 bg-primary-900/20 border border-primary-700/30 rounded-lg text-xs text-primary-300">
        💡 <strong>Tip:</strong> Compare estimated total, not just headline fare, to avoid checkout surprises.
      </div>
    </div>
  )
}
