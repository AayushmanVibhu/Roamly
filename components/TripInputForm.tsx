'use client'

import { useState } from 'react'
import { AlertCircle, Calendar, Clock, DollarSign, Hotel, Luggage, MapPin, Plane, Users } from 'lucide-react'
import { TripPreferences } from '@/types'

interface TripInputFormProps {
  onSubmit: (preferences: TripPreferences) => void
  isLoading?: boolean
}

interface ValidationErrors {
  origin?: string
  destination?: string
  departureDate?: string
  returnDate?: string
  maxBudget?: string
}

export default function TripInputForm({ onSubmit, isLoading = false }: TripInputFormProps) {
  const [formData, setFormData] = useState<TripPreferences>({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    tripType: 'round-trip',
    flexibleDates: false,
    passengers: {
      adults: 1,
      children: 0,
      infants: 0,
    },
    maxBudget: 1000,
    currency: 'USD',
    preferences: {
      cabinClass: 'economy',
      checkedBag: false,
      nonstopOnly: false,
      departureTimePreferences: [],
      hotelNeeded: false,
    },
  })

  const [errors, setErrors] = useState<ValidationErrors>({})

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.origin.trim()) {
      newErrors.origin = 'Origin is required'
    } else if (formData.origin.length < 3) {
      newErrors.origin = 'Please enter at least 3 characters'
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required'
    } else if (formData.destination.length < 3) {
      newErrors.destination = 'Please enter at least 3 characters'
    }

    if (
      formData.origin.trim() &&
      formData.destination.trim() &&
      formData.origin.toLowerCase() === formData.destination.toLowerCase()
    ) {
      newErrors.destination = 'Destination must be different from origin'
    }

    if (!formData.departureDate) {
      newErrors.departureDate = 'Departure date is required'
    } else {
      const departure = new Date(formData.departureDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (departure < today) {
        newErrors.departureDate = 'Departure date cannot be in the past'
      }
    }

    if (formData.tripType === 'round-trip') {
      if (!formData.returnDate) {
        newErrors.returnDate = 'Return date is required for round trips'
      } else if (formData.departureDate) {
        const departure = new Date(formData.departureDate)
        const returnDate = new Date(formData.returnDate)
        if (returnDate <= departure) {
          newErrors.returnDate = 'Return date must be after departure date'
        }
      }
    }

    if (formData.maxBudget < 50) {
      newErrors.maxBudget = 'Budget must be at least $50'
    } else if (formData.maxBudget > 10000) {
      newErrors.maxBudget = 'Budget cannot exceed $10,000'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      const firstError = document.querySelector('[data-error="true"]')
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setErrors({})
    onSubmit(formData)
  }

  const updateField = (field: keyof TripPreferences, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateNestedField = (parent: keyof TripPreferences, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value,
      },
    }))
  }

  const toggleDepartureTime = (time: string) => {
    const current = formData.preferences.departureTimePreferences
    const updated = current.includes(time)
      ? current.filter(t => t !== time)
      : [...current, time]
    updateNestedField('preferences', 'departureTimePreferences', updated)
  }

  const getMinDate = () => new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section>
        <div className="mb-3 text-sm font-medium text-slate-200">Trip type</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {(['round-trip', 'one-way'] as const).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => {
                updateField('tripType', type)
                if (type === 'one-way') updateField('returnDate', '')
                setErrors(prev => ({ ...prev, returnDate: undefined }))
              }}
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                formData.tripType === type
                  ? 'border-sky-300/40 bg-sky-300/12 text-white'
                  : 'border-white/10 bg-white/6 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="text-sm font-semibold capitalize">{type.replace('-', ' ')}</div>
              <div className="mt-1 text-xs text-slate-400">
                {type === 'round-trip' ? 'For return travel with both dates.' : 'For single-direction travel.'}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Field label="From" icon={<MapPin className="h-4 w-4 text-slate-400" />} error={errors.origin}>
          <input
            type="text"
            required
            placeholder="e.g. Phoenix or PHX"
            value={formData.origin}
            onChange={e => {
              updateField('origin', e.target.value)
              setErrors(prev => ({ ...prev, origin: undefined }))
            }}
            data-error={errors.origin ? 'true' : 'false'}
            className="field-shell w-full"
          />
        </Field>

        <Field label="To" icon={<Plane className="h-4 w-4 text-slate-400" />} error={errors.destination}>
          <input
            type="text"
            required
            placeholder="e.g. New York or JFK"
            value={formData.destination}
            onChange={e => {
              updateField('destination', e.target.value)
              setErrors(prev => ({ ...prev, destination: undefined }))
            }}
            data-error={errors.destination ? 'true' : 'false'}
            className="field-shell w-full"
          />
        </Field>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Field label="Departure date" icon={<Calendar className="h-4 w-4 text-slate-400" />} error={errors.departureDate}>
          <input
            type="date"
            required
            min={getMinDate()}
            value={formData.departureDate}
            onChange={e => {
              updateField('departureDate', e.target.value)
              setErrors(prev => ({ ...prev, departureDate: undefined }))
            }}
            data-error={errors.departureDate ? 'true' : 'false'}
            className="field-shell w-full"
          />
        </Field>

        {formData.tripType === 'round-trip' && (
          <Field label="Return date" icon={<Calendar className="h-4 w-4 text-slate-400" />} error={errors.returnDate}>
            <input
              type="date"
              required
              min={formData.departureDate || getMinDate()}
              value={formData.returnDate}
              onChange={e => {
                updateField('returnDate', e.target.value)
                setErrors(prev => ({ ...prev, returnDate: undefined }))
              }}
              data-error={errors.returnDate ? 'true' : 'false'}
              className="field-shell w-full"
            />
          </Field>
        )}
      </section>

      <div className="soft-panel p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={formData.flexibleDates}
            onChange={e => updateField('flexibleDates', e.target.checked)}
            className="mt-1"
          />
          <div>
            <div className="font-medium text-white">My dates are flexible</div>
            <div className="mt-1 text-sm text-slate-400">
              Roamly can widen the search window to look for a better match.
            </div>
          </div>
        </label>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Field label="Adults" icon={<Users className="h-4 w-4 text-slate-400" />}>
          <input
            type="number"
            min="1"
            max="9"
            value={formData.passengers.adults}
            onChange={e => updateNestedField('passengers', 'adults', parseInt(e.target.value))}
            className="field-shell w-full"
          />
        </Field>
        <Field label="Children">
          <input
            type="number"
            min="0"
            max="9"
            value={formData.passengers.children}
            onChange={e => updateNestedField('passengers', 'children', parseInt(e.target.value))}
            className="field-shell w-full"
          />
        </Field>
        <Field label="Infants">
          <input
            type="number"
            min="0"
            max="9"
            value={formData.passengers.infants}
            onChange={e => updateNestedField('passengers', 'infants', parseInt(e.target.value))}
            className="field-shell w-full"
          />
        </Field>
      </section>

      <section className="soft-panel p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-200">
          <DollarSign className="h-4 w-4 text-slate-400" />
          Maximum budget per traveler
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <input
            type="range"
            min="50"
            max="5000"
            step="50"
            value={formData.maxBudget}
            onChange={e => {
              updateField('maxBudget', parseInt(e.target.value))
              setErrors(prev => ({ ...prev, maxBudget: undefined }))
            }}
            className="w-full accent-sky-300"
          />
          <div className="text-3xl font-semibold text-white md:min-w-[140px] md:text-right">
            ${formData.maxBudget}
          </div>
        </div>
        {errors.maxBudget && <ErrorText message={errors.maxBudget} />}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <PreferenceGroup title="Cabin class" icon={<Plane className="h-4 w-4 text-slate-400" />}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'economy', label: 'Economy' },
              { value: 'premium-economy', label: 'Premium economy' },
              { value: 'business', label: 'Business' },
              { value: 'first', label: 'First class' },
            ].map(cabin => (
              <SelectableCard
                key={cabin.value}
                active={formData.preferences.cabinClass === cabin.value}
                label={cabin.label}
                onClick={() => updateNestedField('preferences', 'cabinClass', cabin.value)}
              />
            ))}
          </div>
        </PreferenceGroup>

        <PreferenceGroup title="Bag preference" icon={<Luggage className="h-4 w-4 text-slate-400" />}>
          <div className="grid grid-cols-2 gap-3">
            <SelectableCard
              active={!formData.preferences.checkedBag}
              label="Carry-on only"
              note="Travel light"
              onClick={() => updateNestedField('preferences', 'checkedBag', false)}
            />
            <SelectableCard
              active={formData.preferences.checkedBag}
              label="Checked bag needed"
              note="Include baggage in the match"
              onClick={() => updateNestedField('preferences', 'checkedBag', true)}
            />
          </div>
        </PreferenceGroup>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <PreferenceGroup title="Departure time" icon={<Clock className="h-4 w-4 text-slate-400" />}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'early-morning', label: 'Early morning', note: '5AM–8AM' },
              { value: 'morning', label: 'Morning', note: '8AM–12PM' },
              { value: 'afternoon', label: 'Afternoon', note: '12PM–5PM' },
              { value: 'evening', label: 'Evening', note: '5PM–10PM' },
            ].map(timeSlot => (
              <SelectableCard
                key={timeSlot.value}
                active={formData.preferences.departureTimePreferences.includes(timeSlot.value)}
                label={timeSlot.label}
                note={timeSlot.note}
                onClick={() => toggleDepartureTime(timeSlot.value)}
              />
            ))}
          </div>
        </PreferenceGroup>

        <PreferenceGroup title="Extra filters" icon={<Hotel className="h-4 w-4 text-slate-400" />}>
          <label className="soft-panel flex cursor-pointer items-start gap-3 p-4">
            <input
              type="checkbox"
              checked={formData.preferences.nonstopOnly}
              onChange={e => updateNestedField('preferences', 'nonstopOnly', e.target.checked)}
              className="mt-1"
            />
            <div>
              <div className="font-medium text-white">Nonstop only</div>
              <div className="mt-1 text-sm text-slate-400">
                Exclude layovers from the result set.
              </div>
            </div>
          </label>
          <label className="soft-panel mt-3 flex cursor-pointer items-start gap-3 p-4">
            <input
              type="checkbox"
              checked={formData.preferences.hotelNeeded}
              onChange={e => updateNestedField('preferences', 'hotelNeeded', e.target.checked)}
              className="mt-1"
            />
            <div>
              <div className="font-medium text-white">Include hotel context</div>
              <div className="mt-1 text-sm text-slate-400">
                Saved for later expansion beyond flights.
              </div>
            </div>
          </label>
        </PreferenceGroup>
      </section>

      <div className="border-t border-white/10 pt-8">
        <button type="submit" disabled={isLoading} className="action-primary w-full text-base disabled:opacity-60">
          {isLoading ? 'Searching live fares...' : 'Find my best options'}
        </button>
        <p className="mt-3 text-center text-sm text-slate-400">
          Roamly will rank live options now and let you track the route if the right fare is not available yet.
        </p>
      </div>
    </form>
  )
}

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string
  icon?: React.ReactNode
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
        {icon}
        {label}
      </label>
      {children}
      {error && <ErrorText message={error} />}
    </div>
  )
}

function PreferenceGroup({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="soft-panel p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-200">
        {icon}
        {title}
      </div>
      {children}
    </div>
  )
}

function SelectableCard({
  active,
  label,
  note,
  onClick,
}: {
  active: boolean
  label: string
  note?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-4 text-left transition ${
        active
          ? 'border-sky-300/40 bg-sky-300/12 text-white'
          : 'border-white/10 bg-white/6 text-slate-300 hover:bg-white/10'
      }`}
    >
      <div className="font-medium">{label}</div>
      {note && <div className="mt-1 text-xs text-slate-400">{note}</div>}
    </button>
  )
}

function ErrorText({ message }: { message: string }) {
  return (
    <div className="mt-2 flex items-center gap-1 text-sm text-rose-300">
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  )
}
