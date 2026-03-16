import { NextRequest, NextResponse } from 'next/server'
import { deleteWatch, getWatchById, updateWatch } from '@/lib/watchStore'

export const dynamic = 'force-dynamic'

interface UpdateWatchBody {
  action?: 'pause' | 'resume' | 'cancel'
  targetPrice?: number
  checkIntervalMinutes?: number
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { watchId: string } }
) {
  const watch = await getWatchById(params.watchId)
  if (!watch) {
    return NextResponse.json({ error: 'Watch not found.' }, { status: 404 })
  }
  return NextResponse.json({ success: true, watch })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { watchId: string } }
) {
  try {
    const body = (await request.json()) as UpdateWatchBody

    const watch = await updateWatch(params.watchId, current => {
      let next = { ...current }

      if (body.action === 'pause') next.status = 'paused'
      if (body.action === 'resume') next.status = 'active'
      if (body.action === 'cancel') next.status = 'cancelled'

      if (typeof body.targetPrice === 'number' && body.targetPrice > 0) {
        next.targetPrice = Math.round(body.targetPrice)
      }

      if (typeof body.checkIntervalMinutes === 'number' && body.checkIntervalMinutes > 0) {
        next.checkIntervalMinutes = Math.round(body.checkIntervalMinutes)
      }

      return next
    })

    if (!watch) {
      return NextResponse.json({ error: 'Watch not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, watch })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update watch.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { watchId: string } }
) {
  const deleted = await deleteWatch(params.watchId)
  if (!deleted) {
    return NextResponse.json({ error: 'Watch not found.' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
