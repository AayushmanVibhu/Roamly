import { TravelWatch } from '@/types'

export const DEFAULT_CHECK_INTERVAL_MINUTES = 240
export const MIN_CHECK_INTERVAL_MINUTES = 5
export const MAX_CHECK_INTERVAL_MINUTES = 720
export const CLOSE_DEPARTURE_WINDOW_DAYS = 3
export const MID_DEPARTURE_WINDOW_DAYS = 10
export const CLOSE_DEPARTURE_INTERVAL_MINUTES = 60
export const MID_DEPARTURE_INTERVAL_MINUTES = 180
export const FAR_DEPARTURE_INTERVAL_MINUTES = 360

export function clampCheckInterval(minutes?: number): number {
  if (!minutes || Number.isNaN(minutes)) return DEFAULT_CHECK_INTERVAL_MINUTES
  return Math.max(MIN_CHECK_INTERVAL_MINUTES, Math.min(MAX_CHECK_INTERVAL_MINUTES, Math.round(minutes)))
}

export function getAdaptiveCheckIntervalMinutes(departureDate: string): number {
  const departure = new Date(`${departureDate}T12:00:00Z`)
  if (Number.isNaN(departure.getTime())) {
    return DEFAULT_CHECK_INTERVAL_MINUTES
  }

  const now = new Date()
  const daysUntilDeparture = Math.ceil((departure.getTime() - now.getTime()) / 86_400_000)

  if (daysUntilDeparture <= CLOSE_DEPARTURE_WINDOW_DAYS) {
    return CLOSE_DEPARTURE_INTERVAL_MINUTES
  }

  if (daysUntilDeparture <= MID_DEPARTURE_WINDOW_DAYS) {
    return MID_DEPARTURE_INTERVAL_MINUTES
  }

  return FAR_DEPARTURE_INTERVAL_MINUTES
}

export function getEffectiveCheckIntervalMinutes(watch: Pick<TravelWatch, 'checkIntervalMinutes' | 'preferences'>): number {
  const adaptiveInterval = getAdaptiveCheckIntervalMinutes(watch.preferences.departureDate)
  return Math.min(clampCheckInterval(watch.checkIntervalMinutes), adaptiveInterval)
}
