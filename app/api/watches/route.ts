import { NextRequest, NextResponse } from 'next/server'
import { createWatch, listWatches } from '@/lib/watchStore'
import { TravelWatchStatus, TripPreferences } from '@/types'

export const dynamic = 'force-dynamic'

interface CreateWatchBody {
  email?: string
  preferences?: TripPreferences
  targetPrice?: number
  checkIntervalMinutes?: number
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email') || undefined
  const statusParam = request.nextUrl.searchParams.get('status') || undefined

  const status = isWatchStatus(statusParam) ? statusParam : undefined
  const watches = await listWatches({ email, status })

  return NextResponse.json({
    success: true,
    count: watches.length,
    watches,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateWatchBody

    if (!body.email || !isValidEmail(body.email)) {
      return NextResponse.json(
        { error: 'A valid email is required to create a watch.' },
        { status: 400 }
      )
    }

    if (!body.preferences) {
      return NextResponse.json(
        { error: 'preferences are required.' },
        { status: 400 }
      )
    }

    if (!body.preferences.origin || !body.preferences.destination || !body.preferences.departureDate) {
      return NextResponse.json(
        { error: 'preferences must include origin, destination, and departureDate.' },
        { status: 400 }
      )
    }

    const watch = await createWatch({
      email: body.email,
      preferences: body.preferences,
      targetPrice: body.targetPrice,
      checkIntervalMinutes: body.checkIntervalMinutes,
    })

    return NextResponse.json(
      {
        success: true,
        watch,
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create watch.' },
      { status: 500 }
    )
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function isWatchStatus(value?: string): value is TravelWatchStatus {
  return value === 'active' || value === 'paused' || value === 'matched' || value === 'cancelled'
}
