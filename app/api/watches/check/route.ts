import { NextRequest, NextResponse } from 'next/server'
import { getLiveRecommendations } from '@/lib/liveRecommendations'
import { sendWatchMatchAlert } from '@/lib/watchAlertService'
import { listWatches, shouldCheckWatch, updateWatch } from '@/lib/watchStore'

export const dynamic = 'force-dynamic'

const ALERT_COOLDOWN_MS = 6 * 60 * 60 * 1000 // 6 hours

export async function POST(request: NextRequest) {
  try {
    const authError = validateCheckerAuth(request)
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 })
    }

    const emailFilter = request.nextUrl.searchParams.get('email') || undefined
    const watches = await listWatches({ email: emailFilter, status: 'active' })

    let processed = 0
    let skipped = 0
    let matched = 0
    let alertsSent = 0
    const details: Array<Record<string, unknown>> = []

    for (const watch of watches) {
      const canCheck = await shouldCheckWatch(watch)
      if (!canCheck) {
        skipped += 1
        continue
      }

      processed += 1
      const checkedAt = new Date().toISOString()

      try {
        const { recommendations } = await getLiveRecommendations(watch.preferences)
        const matchingRecommendation = recommendations.find(
          recommendation =>
            recommendation.constraintMatch.isFullMatch &&
            recommendation.flight.totalCost.estimatedTotal <= watch.targetPrice
        )

        if (!matchingRecommendation) {
          await updateWatch(watch.id, current => ({
            ...current,
            lastCheckedAt: checkedAt,
          }))
          details.push({ watchId: watch.id, status: 'no-match' })
          continue
        }

        matched += 1
        const inCooldown =
          watch.lastNotifiedAt &&
          Date.now() - new Date(watch.lastNotifiedAt).getTime() < ALERT_COOLDOWN_MS

        if (inCooldown && watch.latestMatch?.recommendationId === matchingRecommendation.flight.id) {
          await updateWatch(watch.id, current => ({
            ...current,
            lastCheckedAt: checkedAt,
          }))
          details.push({ watchId: watch.id, status: 'matched-cooldown' })
          continue
        }

        const alertResult = await sendWatchMatchAlert(watch, matchingRecommendation)

        await updateWatch(watch.id, current => ({
          ...current,
          lastCheckedAt: checkedAt,
          lastNotifiedAt: alertResult.delivered ? checkedAt : current.lastNotifiedAt,
          status: alertResult.delivered ? 'matched' : current.status,
          latestMatch: {
            recommendationId: matchingRecommendation.flight.id,
            estimatedTotal: matchingRecommendation.flight.totalCost.estimatedTotal,
            currency: matchingRecommendation.flight.totalCost.currency,
            matchedAt: checkedAt,
            summary: matchingRecommendation.aiSummary,
          },
        }))

        if (alertResult.delivered) alertsSent += 1
        details.push({
          watchId: watch.id,
          status: 'matched',
          alertDelivered: alertResult.delivered,
          alertProvider: alertResult.provider,
          message: alertResult.message,
        })
      } catch (error) {
        await updateWatch(watch.id, current => ({
          ...current,
          lastCheckedAt: checkedAt,
        }))
        details.push({
          watchId: watch.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      totalActiveWatches: watches.length,
      processed,
      skipped,
      matched,
      alertsSent,
      details,
      checkedAt: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to run watch checks.' },
      { status: 500 }
    )
  }
}

function validateCheckerAuth(request: NextRequest): string | null {
  const secret = process.env.WATCH_CHECK_SECRET
  if (!secret) {
    return null // allow in development if no secret configured
  }

  const provided = request.headers.get('x-watch-check-secret')
  if (!provided || provided !== secret) {
    return 'Invalid watch check secret.'
  }

  return null
}
