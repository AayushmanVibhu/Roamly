import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { getDbPool } from '@/lib/db'
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
const WATCH_TABLE = 'travel_watches'

let dbSchemaReady = false
let dbSchemaPromise: Promise<void> | null = null

function getWatchStorePath(): string {
  return process.env.WATCH_STORE_PATH || '/tmp/roamly-watches.json'
}

async function readFileStore(): Promise<WatchFileShape> {
  try {
    const raw = await readFile(getWatchStorePath(), 'utf8')
    const parsed = JSON.parse(raw) as WatchFileShape
    return { watches: Array.isArray(parsed.watches) ? parsed.watches : [] }
  } catch {
    return { watches: [] }
  }
}

async function writeFileStore(data: WatchFileShape): Promise<void> {
  const storePath = getWatchStorePath()
  await mkdir(path.dirname(storePath), { recursive: true })
  await writeFile(storePath, JSON.stringify(data, null, 2), 'utf8')
}

function clampCheckInterval(minutes?: number): number {
  if (!minutes || Number.isNaN(minutes)) return DEFAULT_CHECK_INTERVAL_MINUTES
  return Math.max(MIN_CHECK_INTERVAL_MINUTES, Math.min(MAX_CHECK_INTERVAL_MINUTES, Math.round(minutes)))
}

async function getWatchDb() {
  const pool = getDbPool()
  if (!pool) return null

  if (dbSchemaReady) return pool

  if (!dbSchemaPromise) {
    dbSchemaPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ${WATCH_TABLE} (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          preferences JSONB NOT NULL,
          target_price INTEGER NOT NULL,
          check_interval_minutes INTEGER NOT NULL,
          status TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL,
          last_checked_at TIMESTAMPTZ NULL,
          last_notified_at TIMESTAMPTZ NULL,
          latest_match JSONB NULL
        );
      `)
      await pool.query(`CREATE INDEX IF NOT EXISTS ${WATCH_TABLE}_email_idx ON ${WATCH_TABLE} (email);`)
      await pool.query(`CREATE INDEX IF NOT EXISTS ${WATCH_TABLE}_status_idx ON ${WATCH_TABLE} (status);`)
      dbSchemaReady = true
    })().finally(() => {
      dbSchemaPromise = null
    })
  }

  await dbSchemaPromise
  return pool
}

function parseStatus(value: string): TravelWatchStatus {
  if (value === 'active' || value === 'paused' || value === 'matched' || value === 'cancelled') {
    return value
  }
  return 'active'
}

function toIsoString(value: unknown): string | undefined {
  if (!value) return undefined
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') return new Date(value).toISOString()
  return undefined
}

function mapDbRow(row: any): TravelWatch {
  return {
    id: row.id,
    email: row.email,
    preferences: typeof row.preferences === 'string' ? JSON.parse(row.preferences) : row.preferences,
    targetPrice: Number(row.target_price),
    checkIntervalMinutes: Number(row.check_interval_minutes),
    status: parseStatus(row.status),
    createdAt: toIsoString(row.created_at) || new Date().toISOString(),
    updatedAt: toIsoString(row.updated_at) || new Date().toISOString(),
    lastCheckedAt: toIsoString(row.last_checked_at),
    lastNotifiedAt: toIsoString(row.last_notified_at),
    latestMatch:
      row.latest_match
        ? typeof row.latest_match === 'string'
          ? JSON.parse(row.latest_match)
          : row.latest_match
        : undefined,
  }
}

export async function listWatches(filters?: { email?: string; status?: TravelWatchStatus }): Promise<TravelWatch[]> {
  const db = await getWatchDb()
  if (db) {
    const where: string[] = []
    const params: unknown[] = []

    if (filters?.email) {
      params.push(filters.email.trim().toLowerCase())
      where.push(`email = $${params.length}`)
    }

    if (filters?.status) {
      params.push(filters.status)
      where.push(`status = $${params.length}`)
    }

    const sql = `
      SELECT * FROM ${WATCH_TABLE}
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY created_at DESC
    `

    const result = await db.query(sql, params)
    return result.rows.map(mapDbRow)
  }

  const store = await readFileStore()
  return store.watches
    .filter(watch => {
      if (filters?.email && watch.email.toLowerCase() !== filters.email.toLowerCase()) return false
      if (filters?.status && watch.status !== filters.status) return false
      return true
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getWatchById(watchId: string): Promise<TravelWatch | null> {
  const db = await getWatchDb()
  if (db) {
    const result = await db.query(`SELECT * FROM ${WATCH_TABLE} WHERE id = $1 LIMIT 1`, [watchId])
    return result.rows[0] ? mapDbRow(result.rows[0]) : null
  }

  const store = await readFileStore()
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

  const db = await getWatchDb()
  if (db) {
    const result = await db.query(
      `
        INSERT INTO ${WATCH_TABLE}
          (id, email, preferences, target_price, check_interval_minutes, status, created_at, updated_at, last_checked_at, last_notified_at, latest_match)
        VALUES
          ($1, $2, $3::jsonb, $4, $5, $6, $7::timestamptz, $8::timestamptz, $9::timestamptz, $10::timestamptz, $11::jsonb)
        RETURNING *
      `,
      [
        watch.id,
        watch.email,
        JSON.stringify(watch.preferences),
        watch.targetPrice,
        watch.checkIntervalMinutes,
        watch.status,
        watch.createdAt,
        watch.updatedAt,
        null,
        null,
        null,
      ]
    )
    return mapDbRow(result.rows[0])
  }

  const store = await readFileStore()
  store.watches.push(watch)
  await writeFileStore(store)
  return watch
}

export async function updateWatch(
  watchId: string,
  updater: (watch: TravelWatch) => TravelWatch
): Promise<TravelWatch | null> {
  const current = await getWatchById(watchId)
  if (!current) return null

  const updatedAt = new Date().toISOString()
  const updated = {
    ...updater(current),
    id: current.id,
    createdAt: current.createdAt,
    updatedAt,
  }

  const db = await getWatchDb()
  if (db) {
    const result = await db.query(
      `
        UPDATE ${WATCH_TABLE}
        SET
          email = $2,
          preferences = $3::jsonb,
          target_price = $4,
          check_interval_minutes = $5,
          status = $6,
          created_at = $7::timestamptz,
          updated_at = $8::timestamptz,
          last_checked_at = $9::timestamptz,
          last_notified_at = $10::timestamptz,
          latest_match = $11::jsonb
        WHERE id = $1
        RETURNING *
      `,
      [
        watchId,
        updated.email,
        JSON.stringify(updated.preferences),
        updated.targetPrice,
        updated.checkIntervalMinutes,
        updated.status,
        updated.createdAt,
        updated.updatedAt,
        updated.lastCheckedAt || null,
        updated.lastNotifiedAt || null,
        updated.latestMatch ? JSON.stringify(updated.latestMatch) : null,
      ]
    )

    return result.rows[0] ? mapDbRow(result.rows[0]) : null
  }

  const store = await readFileStore()
  const idx = store.watches.findIndex(watch => watch.id === watchId)
  if (idx === -1) return null
  store.watches[idx] = updated
  await writeFileStore(store)
  return store.watches[idx]
}

export async function deleteWatch(watchId: string): Promise<boolean> {
  const db = await getWatchDb()
  if (db) {
    const result = await db.query(`DELETE FROM ${WATCH_TABLE} WHERE id = $1`, [watchId])
    return (result.rowCount || 0) > 0
  }

  const store = await readFileStore()
  const next = store.watches.filter(watch => watch.id !== watchId)
  if (next.length === store.watches.length) return false
  await writeFileStore({ watches: next })
  return true
}

export async function shouldCheckWatch(watch: TravelWatch): Promise<boolean> {
  if (watch.status !== 'active') return false
  if (!watch.lastCheckedAt) return true
  const elapsedMs = Date.now() - new Date(watch.lastCheckedAt).getTime()
  return elapsedMs >= watch.checkIntervalMinutes * 60_000
}
