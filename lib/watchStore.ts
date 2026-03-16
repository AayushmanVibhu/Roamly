import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { TravelWatch, TravelWatchStatus, TripPreferences } from '@/types'

interface CreateWatchInput {
  email: string
  preferences: TripPreferences
  targetPrice?: number
  checkIntervalMinutes?: number
}

interface WatchFileShape {
  watches: TravelWatch[]
}

const DEFAULT_CHECK_INTERVAL_MINUTES = 60
const MIN_CHECK_INTERVAL_MINUTES = 5
const MAX_CHECK_INTERVAL_MINUTES = 720

function getWatchStorePath(): string {
  return process.env.WATCH_STORE_PATH || '/tmp/roamly-watches.json'
}

async function readStore(): Promise<WatchFileShape> {
  try {
    const raw = await readFile(getWatchStorePath(), 'utf8')
    const parsed = JSON.parse(raw) as WatchFileShape
    return { watches: Array.isArray(parsed.watches) ? parsed.watches : [] }
  } catch {
    return { watches: [] }
  }
}

async function writeStore(data: WatchFileShape): Promise<void> {
  const storePath = getWatchStorePath()
  await mkdir(path.dirname(storePath), { recursive: true })
  await writeFile(storePath, JSON.stringify(data, null, 2), 'utf8')
}

function clampCheckInterval(minutes?: number): number {
  if (!minutes || Number.isNaN(minutes)) return DEFAULT_CHECK_INTERVAL_MINUTES
  return Math.max(MIN_CHECK_INTERVAL_MINUTES, Math.min(MAX_CHECK_INTERVAL_MINUTES, Math.round(minutes)))
}

export async function listWatches(filters?: { email?: string; status?: TravelWatchStatus }): Promise<TravelWatch[]> {
  const store = await readStore()
  return store.watches
    .filter(watch => {
      if (filters?.email && watch.email.toLowerCase() !== filters.email.toLowerCase()) return false
      if (filters?.status && watch.status !== filters.status) return false
      return true
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getWatchById(watchId: string): Promise<TravelWatch | null> {
  const store = await readStore()
  return store.watches.find(watch => watch.id === watchId) || null
}

export async function createWatch(input: CreateWatchInput): Promise<TravelWatch> {
  const now = new Date().toISOString()
  const watch: TravelWatch = {
    id: randomUUID(),
    email: input.email.trim().toLowerCase(),
    preferences: input.preferences,
    targetPrice: input.targetPrice || input.preferences.maxBudget,
    checkIntervalMinutes: clampCheckInterval(input.checkIntervalMinutes),
    status: 'active',
    createdAt: now,
    updatedAt: now,
  }

  const store = await readStore()
  store.watches.push(watch)
  await writeStore(store)
  return watch
}

export async function updateWatch(
  watchId: string,
  updater: (watch: TravelWatch) => TravelWatch
): Promise<TravelWatch | null> {
  const store = await readStore()
  const idx = store.watches.findIndex(watch => watch.id === watchId)
  if (idx === -1) return null

  const updated = updater(store.watches[idx])
  store.watches[idx] = { ...updated, updatedAt: new Date().toISOString() }
  await writeStore(store)
  return store.watches[idx]
}

export async function deleteWatch(watchId: string): Promise<boolean> {
  const store = await readStore()
  const next = store.watches.filter(watch => watch.id !== watchId)
  if (next.length === store.watches.length) return false
  await writeStore({ watches: next })
  return true
}

export async function shouldCheckWatch(watch: TravelWatch): Promise<boolean> {
  if (watch.status !== 'active') return false
  if (!watch.lastCheckedAt) return true
  const elapsedMs = Date.now() - new Date(watch.lastCheckedAt).getTime()
  return elapsedMs >= watch.checkIntervalMinutes * 60_000
}
