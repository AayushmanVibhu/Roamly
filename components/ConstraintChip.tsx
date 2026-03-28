import { X, Edit2 } from 'lucide-react'
import { TravelConstraints } from '@/types'

interface ConstraintChipProps {
  field: keyof TravelConstraints
  value: any
  onRemove: (field: keyof TravelConstraints) => void
  onEdit?: (field: keyof TravelConstraints) => void
}

const fieldLabels: Record<keyof TravelConstraints, string> = {
  origin: 'From',
  destination: 'To',
  departureDate: 'Departure',
  returnDate: 'Return',
  tripType: 'Trip Type',
  budget: 'Budget',
  passengers: 'Passengers',
  cabinClass: 'Class',
  checkedBag: 'Checked Bag',
  nonstopOnly: 'Nonstop',
  departureTimePreference: 'Time',
  hotelNeeded: 'Hotel',
  flexibleDates: 'Flexible Dates',
}

function formatValue(field: keyof TravelConstraints, value: any): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (field === 'budget') return `$${value}`
  if (field === 'passengers') return `${value} ${value === 1 ? 'person' : 'people'}`
  if (field === 'cabinClass') {
    return value.split('-').map((word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }
  if (field === 'departureTimePreference') {
    return value.charAt(0).toUpperCase() + value.slice(1)
  }
  return String(value)
}

export default function ConstraintChip({ field, value, onRemove, onEdit }: ConstraintChipProps) {
  return (
    <div className="group inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-3 py-2 text-sm text-slate-100">
      <div className="flex flex-col">
        <span className="text-xs text-slate-400">{fieldLabels[field]}</span>
        <span className="font-medium">{formatValue(field, value)}</span>
      </div>
      
      <div className="flex items-center gap-1 ml-1">
        {onEdit && (
          <button
            onClick={() => onEdit(field)}
            className="rounded p-1 opacity-0 transition hover:bg-white/10 group-hover:opacity-100"
            aria-label="Edit constraint"
          >
            <Edit2 className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={() => onRemove(field)}
          className="rounded p-1 opacity-70 transition hover:bg-white/10 hover:opacity-100"
          aria-label="Remove constraint"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
