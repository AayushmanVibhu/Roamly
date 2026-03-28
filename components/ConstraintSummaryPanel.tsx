import { AlertCircle, Calendar, CheckCircle, DollarSign, MapPin, Plane } from 'lucide-react'
import ConstraintChip from './ConstraintChip'
import { TravelConstraints } from '@/types'

interface ConstraintSummaryPanelProps {
  constraints: TravelConstraints
  onRemoveConstraint: (field: keyof TravelConstraints) => void
  onEditConstraint?: (field: keyof TravelConstraints) => void
}

export default function ConstraintSummaryPanel({
  constraints,
  onRemoveConstraint,
  onEditConstraint,
}: ConstraintSummaryPanelProps) {
  const constraintCount = Object.keys(constraints).length
  const hasMinimumInfo = constraints.origin && constraints.destination

  const routeConstraints: (keyof TravelConstraints)[] = ['origin', 'destination', 'tripType']
  const dateConstraints: (keyof TravelConstraints)[] = ['departureDate', 'returnDate', 'flexibleDates']
  const budgetConstraints: (keyof TravelConstraints)[] = ['budget', 'passengers']
  const preferenceConstraints: (keyof TravelConstraints)[] = [
    'cabinClass',
    'checkedBag',
    'nonstopOnly',
    'departureTimePreference',
    'hotelNeeded',
  ]

  const renderConstraintGroup = (
    title: string,
    icon: React.ReactNode,
    fields: (keyof TravelConstraints)[]
  ) => {
    const activeFields = fields.filter(field => constraints[field] !== undefined)
    if (activeFields.length === 0) return null

    return (
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeFields.map(field => (
            <ConstraintChip
              key={field}
              field={field}
              value={constraints[field]}
              onRemove={onRemoveConstraint}
              onEdit={onEditConstraint}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-transparent">
      <div className="border-b border-white/10 p-4">
        <h2 className="mb-1 text-lg font-semibold text-white">Trip summary</h2>
        <div className="flex items-center gap-2">
          {hasMinimumInfo ? (
            <>
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <p className="text-sm text-slate-400">
                {constraintCount} {constraintCount === 1 ? 'constraint' : 'constraints'} set
              </p>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <p className="text-sm text-slate-400">Add origin and destination to continue</p>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {constraintCount === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-sm text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/6">
                <Plane className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-slate-200">No constraints yet</h3>
              <p className="text-sm text-slate-500">
                Start chatting with the assistant to build your trip preferences.
              </p>
            </div>
          </div>
        ) : (
          <>
            {renderConstraintGroup('Route', <MapPin className="h-4 w-4 text-sky-300" />, routeConstraints)}
            {renderConstraintGroup('Dates', <Calendar className="h-4 w-4 text-indigo-300" />, dateConstraints)}
            {renderConstraintGroup('Budget & passengers', <DollarSign className="h-4 w-4 text-emerald-300" />, budgetConstraints)}
            {renderConstraintGroup('Preferences', <Plane className="h-4 w-4 text-amber-300" />, preferenceConstraints)}
          </>
        )}
      </div>

      {constraintCount > 0 && (
        <div className="border-t border-white/10 p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-sky-300">{constraintCount}</div>
              <div className="text-xs text-slate-500">Constraints</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-sky-300">{hasMinimumInfo ? 'Yes' : 'Not yet'}</div>
              <div className="text-xs text-slate-500">Ready</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
