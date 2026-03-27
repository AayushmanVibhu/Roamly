'use client'

import { useState } from 'react'
import { MapPin, Calendar, Users, DollarSign, Luggage, Clock, Plane, Hotel, AlertCircle } from 'lucide-react'
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

/**
 * TripInputForm Component
 * Collects user's travel preferences and constraints for the recommendation engine
 */
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
      infants: 0
    },
    maxBudget: 1000,
    currency: 'USD',
    preferences: {
      cabinClass: 'economy',
      checkedBag: false,
      nonstopOnly: false,
      departureTimePreferences: [],
      hotelNeeded: false
    }
  })

  const [errors, setErrors] = useState<ValidationErrors>({})

  /**
   * Validate form inputs before submission
   */
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    // Validate origin
    if (!formData.origin.trim()) {
      newErrors.origin = 'Origin is required'
    } else if (formData.origin.length < 3) {
      newErrors.origin = 'Please enter at least 3 characters'
    }

    // Validate destination
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required'
    } else if (formData.destination.length < 3) {
      newErrors.destination = 'Please enter at least 3 characters'
    }

    // Check if origin and destination are different
    if (formData.origin.trim() && formData.destination.trim() && 
        formData.origin.toLowerCase() === formData.destination.toLowerCase()) {
      newErrors.destination = 'Destination must be different from origin'
    }

    // Validate departure date
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

    // Validate return date for round trips
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

    // Validate budget
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
    
    // Validate before submission
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('[data-error="true"]')
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    // Clear errors and submit
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
        [field]: value
      }
    }))
    // Clear related errors when field is updated
    if (parent === 'preferences') {
      setErrors(prev => ({ ...prev }))
    }
  }

  /**
   * Toggle departure time preference
   */
  const toggleDepartureTime = (time: string) => {
    const current = formData.preferences.departureTimePreferences
    const updated = current.includes(time)
      ? current.filter(t => t !== time)
      : [...current, time]
    updateNestedField('preferences', 'departureTimePreferences', updated)
  }

  /**
   * Get minimum date for date inputs (today)
   */
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Trip Type */}
      <div>
        <label className="block text-sm font-medium text-dark-200 mb-3">Trip Type</label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => {
              updateField('tripType', 'round-trip')
              setErrors(prev => ({ ...prev, returnDate: undefined }))
            }}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
              formData.tripType === 'round-trip'
                ? 'border-primary-600 bg-primary-900/30 text-primary-300'
                : 'border-dark-600 hover:border-dark-500'
            }`}
          >
            Round Trip
          </button>
          <button
            type="button"
            onClick={() => {
              updateField('tripType', 'one-way')
              updateField('returnDate', '')
              setErrors(prev => ({ ...prev, returnDate: undefined }))
            }}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
              formData.tripType === 'one-way'
                ? 'border-primary-600 bg-primary-900/30 text-primary-300'
                : 'border-dark-600 hover:border-dark-500'
            }`}
          >
            One Way
          </button>
        </div>
      </div>

      {/* Origin and Destination */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            From (Origin)
          </label>
          <input
            type="text"
            required
            placeholder="e.g., SFO, San Francisco"
            value={formData.origin}
            onChange={(e) => {
              updateField('origin', e.target.value)
              setErrors(prev => ({ ...prev, origin: undefined }))
            }}
            data-error={errors.origin ? 'true' : 'false'}
            className={`w-full px-4 py-3 bg-dark-800 text-dark-100 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition ${
              errors.origin ? 'border-red-500' : 'border-dark-600 focus:border-primary-500'
            }`}
          />
          {errors.origin && (
            <div className="flex items-center gap-1 mt-1 text-sm text-red-400" role="alert">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              <span>{errors.origin}</span>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            To (Destination)
          </label>
          <input
            type="text"
            required
            placeholder="e.g., JFK, New York"
            value={formData.destination}
            onChange={(e) => {
              updateField('destination', e.target.value)
              setErrors(prev => ({ ...prev, destination: undefined }))
            }}
            data-error={errors.destination ? 'true' : 'false'}
            className={`w-full px-4 py-3 bg-dark-800 text-dark-100 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition ${
              errors.destination ? 'border-red-500' : 'border-dark-600 focus:border-primary-500'
            }`}
          />
          {errors.destination && (
            <div className="flex items-center gap-1 mt-1 text-sm text-red-400" role="alert">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              <span>{errors.destination}</span>
            </div>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Departure Date
            </label>
            <input
              type="date"
              required
              min={getMinDate()}
              value={formData.departureDate}
              onChange={(e) => {
                updateField('departureDate', e.target.value)
                setErrors(prev => ({ ...prev, departureDate: undefined }))
              }}
              data-error={errors.departureDate ? 'true' : 'false'}
              className={`w-full px-4 py-3 bg-dark-800 text-dark-100 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition ${
                errors.departureDate ? 'border-red-500' : 'border-dark-600 focus:border-primary-500'
              }`}
            />
            {errors.departureDate && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-400" role="alert">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                <span>{errors.departureDate}</span>
              </div>
            )}
          </div>
          {formData.tripType === 'round-trip' && (
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Return Date
              </label>
              <input
                type="date"
                required={formData.tripType === 'round-trip'}
                min={formData.departureDate || getMinDate()}
                value={formData.returnDate}
                onChange={(e) => {
                  updateField('returnDate', e.target.value)
                  setErrors(prev => ({ ...prev, returnDate: undefined }))
                }}
                data-error={errors.returnDate ? 'true' : 'false'}
                className={`w-full px-4 py-3 bg-dark-800 text-dark-100 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition ${
                  errors.returnDate ? 'border-red-500' : 'border-dark-600 focus:border-primary-500'
                }`}
              />
              {errors.returnDate && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-400" role="alert">
                  <AlertCircle className="w-4 h-4" aria-hidden="true" />
                  <span>{errors.returnDate}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Flexible Dates Toggle */}
        <div className="bg-primary-900/20 border border-primary-700/30 rounded-lg p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.flexibleDates}
              onChange={(e) => updateField('flexibleDates', e.target.checked)}
              className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
            />
            <div>
              <div className="font-medium text-dark-50">My dates are flexible</div>
              <div className="text-sm text-dark-300">
                We&apos;ll search ±3 days to find you better deals
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Passengers */}
      <div>
        <label className="block text-sm font-medium text-dark-200 mb-3">
          <Users className="inline w-4 h-4 mr-1" />
          Passengers
        </label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-dark-300 mb-1">Adults (12+)</label>
            <input
              type="number"
              min="1"
              max="9"
              value={formData.passengers.adults}
              onChange={(e) => updateNestedField('passengers', 'adults', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-dark-800 text-dark-100 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-dark-300 mb-1">Children (2-11)</label>
            <input
              type="number"
              min="0"
              max="9"
              value={formData.passengers.children}
              onChange={(e) => updateNestedField('passengers', 'children', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-dark-800 text-dark-100 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-dark-300 mb-1">Infants (0-2)</label>
            <input
              type="number"
              min="0"
              max="9"
              value={formData.passengers.infants}
              onChange={(e) => updateNestedField('passengers', 'infants', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-dark-800 text-dark-100 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Maximum Budget */}
      <div>
        <label className="block text-sm font-medium text-dark-200 mb-3">
          <DollarSign className="inline w-4 h-4 mr-1" />
          Maximum Budget (per person)
        </label>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="50"
              max="5000"
              step="50"
              value={formData.maxBudget}
              onChange={(e) => {
                updateField('maxBudget', parseInt(e.target.value))
                setErrors(prev => ({ ...prev, maxBudget: undefined }))
              }}
              className="flex-1 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <div className="text-2xl font-bold text-primary-400 min-w-[120px] text-right">
              ${formData.maxBudget}
            </div>
          </div>
          {errors.maxBudget && (
            <div className="flex items-center gap-1 text-sm text-red-400" role="alert">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              <span>{errors.maxBudget}</span>
            </div>
          )}
          <div className="text-sm text-dark-300">
            {formData.maxBudget < 200 && '💡 Budget-friendly options'}
            {formData.maxBudget >= 200 && formData.maxBudget < 500 && '✈️ Standard options'}
            {formData.maxBudget >= 500 && formData.maxBudget < 1000 && '⭐ Premium options'}
            {formData.maxBudget >= 1000 && '🌟 Luxury options with extra comfort'}
          </div>
        </div>
      </div>

      <div className="border-t border-dark-700 pt-8">
        <h3 className="text-lg font-semibold mb-6 text-dark-50">Travel Preferences</h3>
        
        <div className="space-y-6">
          {/* Cabin Class */}
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-3">
              <Plane className="inline w-4 h-4 mr-1" />
              Cabin Class
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'economy', label: 'Economy', icon: '💺' },
                { value: 'premium-economy', label: 'Premium Economy', icon: '🎫' },
                { value: 'business', label: 'Business', icon: '💼' },
                { value: 'first', label: 'First Class', icon: '⭐' }
              ].map((cabin) => (
                <button
                  key={cabin.value}
                  type="button"
                  onClick={() => updateNestedField('preferences', 'cabinClass', cabin.value)}
                  className={`py-3 px-4 rounded-lg border-2 transition text-center ${
                    formData.preferences.cabinClass === cabin.value
                      ? 'border-primary-600 bg-primary-900/30 text-primary-300'
                      : 'border-dark-600 hover:border-dark-500 text-dark-200'
                  }`}
                >
                  <div className="text-2xl mb-1">{cabin.icon}</div>
                  <div className="text-sm font-medium">{cabin.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Checked Bag */}
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-3">
              <Luggage className="inline w-4 h-4 mr-1" />
              Baggage Requirements
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => updateNestedField('preferences', 'checkedBag', false)}
                className={`py-4 px-4 rounded-lg border-2 transition ${
                  !formData.preferences.checkedBag
                    ? 'border-primary-600 bg-primary-900/30 text-primary-300'
                    : 'border-dark-600 hover:border-dark-500 text-dark-200'
                }`}
              >
                <div className="text-2xl mb-2">🎒</div>
                <div className="font-medium">Carry-on only</div>
                <div className="text-xs mt-1 opacity-75">Pack light</div>
              </button>
              <button
                type="button"
                onClick={() => updateNestedField('preferences', 'checkedBag', true)}
                className={`py-4 px-4 rounded-lg border-2 transition ${
                  formData.preferences.checkedBag
                    ? 'border-primary-600 bg-primary-900/30 text-primary-300'
                    : 'border-dark-600 hover:border-dark-500 text-dark-200'
                }`}
              >
                <div className="text-2xl mb-2">🧳</div>
                <div className="font-medium">Checked bag needed</div>
                <div className="text-xs mt-1 opacity-75">Extra luggage</div>
              </button>
            </div>
          </div>

          {/* Nonstop Preference */}
          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-700/30 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.preferences.nonstopOnly}
                onChange={(e) => updateNestedField('preferences', 'nonstopOnly', e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500 mt-0.5"
              />
              <div className="flex-1">
                <div className="font-medium text-dark-50 flex items-center gap-2">
                  <Plane className="w-4 h-4" />
                  Nonstop flights only
                </div>
                <div className="text-sm text-dark-300 mt-1">
                  Filter out flights with layovers. May reduce available options.
                </div>
              </div>
            </label>
          </div>

          {/* Departure Time Preferences */}
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-3">
              <Clock className="inline w-4 h-4 mr-1" />
              Preferred Departure Times (select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'early-morning', label: 'Early Morning', time: '5AM-8AM', icon: '🌅' },
                { value: 'morning', label: 'Morning', time: '8AM-12PM', icon: '☀️' },
                { value: 'afternoon', label: 'Afternoon', time: '12PM-5PM', icon: '🌤️' },
                { value: 'evening', label: 'Evening', time: '5PM-10PM', icon: '🌆' }
              ].map((timeSlot) => (
                <button
                  key={timeSlot.value}
                  type="button"
                  onClick={() => toggleDepartureTime(timeSlot.value)}
                  className={`py-3 px-3 rounded-lg border-2 transition text-center ${
                    formData.preferences.departureTimePreferences.includes(timeSlot.value)
                      ? 'border-primary-600 bg-primary-900/30 text-primary-300'
                        : 'border-dark-600 hover:border-dark-500 text-dark-200'
                  }`}
                >
                  <div className="text-2xl mb-1">{timeSlot.icon}</div>
                  <div className="text-sm font-medium">{timeSlot.label}</div>
                  <div className="text-xs opacity-75 mt-0.5">{timeSlot.time}</div>
                </button>
              ))}
            </div>
            {formData.preferences.departureTimePreferences.length === 0 && (
              <div className="text-sm text-dark-300 mt-2">
                No preference selected - we&apos;ll show all departure times
              </div>
            )}
          </div>

          {/* Hotel Needed */}
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-700/30 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.preferences.hotelNeeded}
                onChange={(e) => updateNestedField('preferences', 'hotelNeeded', e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500 mt-0.5"
              />
              <div className="flex-1">
                <div className="font-medium text-dark-50 flex items-center gap-2">
                  <Hotel className="w-4 h-4" />
                  I need hotel recommendations
                </div>
                <div className="text-sm text-dark-300 mt-1">
                  We&apos;ll include hotel options in your recommendations (coming soon)
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="border-t border-dark-700 pt-8">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-600 text-white py-4 rounded-lg hover:bg-primary-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Searching for best options...
            </>
          ) : (
            <>
              <Plane className="w-5 h-5" />
              Find My Perfect Trip
            </>
          )}
        </button>
        <p className="text-center text-sm text-dark-300 mt-3">
          Our AI will analyze hundreds of options to find the best matches
        </p>
      </div>
    </form>
  )
}
