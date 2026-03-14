import { TravelConstraints } from '@/types'
import { DollarSign, Plane, Calendar, Users, Briefcase, Clock, Package } from 'lucide-react'

interface QuickConstraintButtonsProps {
  onConstraintClick: (field: keyof TravelConstraints, value: any, message: string) => void
}

const quickConstraints = [
  {
    label: 'Budget travel',
    icon: DollarSign,
    field: 'budget' as keyof TravelConstraints,
    value: 500,
    message: 'I want budget-friendly options under $500'
  },
  {
    label: 'Nonstop only',
    icon: Plane,
    field: 'nonstopOnly' as keyof TravelConstraints,
    value: true,
    message: 'I prefer nonstop flights only'
  },
  {
    label: 'Flexible dates',
    icon: Calendar,
    field: 'flexibleDates' as keyof TravelConstraints,
    value: true,
    message: 'My dates are flexible'
  },
  {
    label: 'With checked bag',
    icon: Package,
    field: 'checkedBag' as keyof TravelConstraints,
    value: true,
    message: 'I need to bring one checked bag'
  },
  {
    label: 'Business class',
    icon: Briefcase,
    field: 'cabinClass' as keyof TravelConstraints,
    value: 'business',
    message: 'I prefer business class'
  },
  {
    label: 'Morning flights',
    icon: Clock,
    field: 'departureTimePreference' as keyof TravelConstraints,
    value: 'morning',
    message: 'I prefer morning departure'
  },
]

export default function QuickConstraintButtons({ onConstraintClick }: QuickConstraintButtonsProps) {
  return (
    <div className="border-b border-dark-700 p-4">
      <p className="text-xs text-dark-400 mb-3">Quick constraints:</p>
      <div className="flex flex-wrap gap-2">
        {quickConstraints.map((constraint) => {
          const Icon = constraint.icon
          return (
            <button
              key={constraint.label}
              onClick={() => onConstraintClick(constraint.field, constraint.value, constraint.message)}
              className="flex items-center gap-2 px-3 py-2 bg-dark-800 hover:bg-dark-750 border border-dark-700 rounded-lg text-sm text-dark-200 hover:text-dark-50 transition"
            >
              <Icon className="w-4 h-4" />
              <span>{constraint.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
