import { TravelConstraints } from '@/types'
import ConstraintChip from './ConstraintChip'
import { CheckCircle, AlertCircle, Plane, MapPin, Calendar, DollarSign } from 'lucide-react'

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

  // Group constraints by category
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
    const activeFields = fields.filter((field) => constraints[field] !== undefined)
    if (activeFields.length === 0) return null

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="text-sm font-semibold text-dark-300">{title}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeFields.map((field) => (
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
    <div className="flex flex-col h-full bg-dark-900">
      {/* Header */}
      <div className="border-b border-dark-700 p-4">
        <h2 className="text-lg font-semibold text-dark-50 mb-1">Trip Summary</h2>
        <div className="flex items-center gap-2">
          {hasMinimumInfo ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <p className="text-sm text-dark-400">
                {constraintCount} {constraintCount === 1 ? 'constraint' : 'constraints'} set
              </p>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <p className="text-sm text-dark-400">Add origin and destination to continue</p>
            </>
          )}
        </div>
      </div>

      {/* Constraints */}
      <div className="flex-1 overflow-y-auto p-4">
        {constraintCount === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-sm">
              <div className="bg-dark-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Plane className="w-8 h-8 text-dark-600" />
              </div>
              <h3 className="text-lg font-medium text-dark-300 mb-2">No constraints yet</h3>
              <p className="text-sm text-dark-500">
                Start chatting with the assistant to build your trip preferences
              </p>
            </div>
          </div>
        ) : (
          <>
            {renderConstraintGroup(
              'Route',
              <MapPin className="w-4 h-4 text-primary-400" />,
              routeConstraints
            )}
            {renderConstraintGroup(
              'Dates',
              <Calendar className="w-4 h-4 text-purple-400" />,
              dateConstraints
            )}
            {renderConstraintGroup(
              'Budget & Passengers',
              <DollarSign className="w-4 h-4 text-green-400" />,
              budgetConstraints
            )}
            {renderConstraintGroup(
              'Preferences',
              <Plane className="w-4 h-4 text-blue-400" />,
              preferenceConstraints
            )}
          </>
        )}
      </div>

      {/* Footer Stats */}
      {constraintCount > 0 && (
        <div className="border-t border-dark-700 p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-400">{constraintCount}</div>
              <div className="text-xs text-dark-500">Constraints</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-400">
                {hasMinimumInfo ? '✓' : '○'}
              </div>
              <div className="text-xs text-dark-500">Ready</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
