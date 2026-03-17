import { NextResponse } from 'next/server'
import { listWatches } from '@/lib/watchStore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [activeWatches, matchedWatches, pausedWatches] = await Promise.all([
      listWatches({ status: 'active' }),
      listWatches({ status: 'matched' }),
      listWatches({ status: 'paused' }),
    ])

    const hasSerpApiKey = Boolean(process.env.SERPAPI_API_KEY)
    const hasWatchSecret = Boolean(process.env.WATCH_CHECK_SECRET || process.env.CRON_SECRET)
    const hasResend = Boolean(process.env.RESEND_API_KEY)
    const hasAlertFromEmail = Boolean(process.env.ALERT_FROM_EMAIL)
    const hasDatabaseUrl = Boolean(process.env.DATABASE_URL)

    return NextResponse.json({
      success: true,
      checkerReady: hasSerpApiKey && hasWatchSecret,
      config: {
        hasSerpApiKey,
        hasWatchSecret,
        hasResend,
        hasAlertFromEmail,
        hasDatabaseUrl,
      },
      counts: {
        active: activeWatches.length,
        matched: matchedWatches.length,
        paused: pausedWatches.length,
      },
      checkedAt: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load checker status.',
      },
      { status: 500 }
    )
  }
}
