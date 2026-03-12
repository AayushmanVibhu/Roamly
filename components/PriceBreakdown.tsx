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
  // Calculate estimated taxes and fees (typically 15-20% of base fare)
  const baseFare = Math.round(flight.price.amount * 0.75)
  const taxes = Math.round(flight.price.amount * 0.15)
  const fees = Math.round(flight.price.amount * 0.10)
  
  // Calculate potential additional costs
  const checkedBagCost = flight.baggage.checked > 0 ? 0 : 35
  const seatSelectionCost = 25

  return (
    <div>
      <h4 className="font-semibold mb-3 flex items-center gap-2 text-dark-50">
        <DollarSign className="w-5 h-5" />
        Price Breakdown
      </h4>
      
      <div className="bg-dark-750 rounded-lg p-4 space-y-2 text-sm border border-dark-700">
        {/* Included in Price */}
        <div className="font-medium text-dark-50 mb-2">Included:</div>
        <div className="flex justify-between">
          <span className="text-dark-300">Base Fare</span>
          <span className="font-medium text-dark-100">${baseFare}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dark-300">Taxes</span>
          <span className="font-medium text-dark-100">${taxes}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dark-300">Booking Fees</span>
          <span className="font-medium text-dark-100">${fees}</span>
        </div>
        {flight.baggage.checked > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Checked Bag (1)</span>
            <span className="font-medium">Included ✓</span>
          </div>
        )}
        
        <div className="border-t pt-2 mt-2 flex justify-between text-base font-bold">
          <span className="text-dark-50">Total Price</span>
          <span className="text-primary-400">${flight.price.amount}</span>
        </div>

        {/* Potential Additional Costs */}
        <div className="border-t border-dark-700 pt-3 mt-3">
          <div className="font-medium text-dark-50 mb-2">Potential Add-ons:</div>
          {flight.baggage.checked === 0 && (
            <div className="flex justify-between text-dark-300">
              <span>Checked Bag (optional)</span>
              <span>+${checkedBagCost}</span>
            </div>
          )}
          <div className="flex justify-between text-dark-300">
            <span>Seat Selection (optional)</span>
            <span>+${seatSelectionCost}</span>
          </div>
        </div>

        {/* Price per mile */}
        <div className="border-t border-dark-700 pt-2 mt-2">
          <div className="flex justify-between text-xs text-dark-400">
            <span>Cost per hour of flight</span>
            <span>${Math.round(flight.price.amount / (flight.totalDuration / 60))}/hr</span>
          </div>
        </div>
      </div>

      {/* Savings Tip */}
      <div className="mt-3 p-3 bg-primary-900/20 border border-primary-700/30 rounded-lg text-xs text-primary-300">
        💡 <strong>Tip:</strong> Booking this flight now could save you an estimated $45-80 
        compared to waiting closer to departure.
      </div>
    </div>
  )
}
