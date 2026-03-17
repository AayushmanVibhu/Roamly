import { TravelRecommendation, TravelWatch } from '@/types'

export interface WatchAlertResult {
  delivered: boolean
  provider: 'resend' | 'log'
  message: string
}

export async function sendWatchMatchAlert(
  watch: TravelWatch,
  recommendation: TravelRecommendation
): Promise<WatchAlertResult> {
  const resendApiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.ALERT_FROM_EMAIL

  const subject = `Deal found: ${watch.preferences.origin} → ${watch.preferences.destination} for $${recommendation.flight.totalCost.estimatedTotal}`
  const html = buildAlertEmailHtml(watch, recommendation)

  if (resendApiKey && fromEmail) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [watch.email],
          subject,
          html,
        }),
      })

      if (!response.ok) {
        const raw = await response.text()
        return {
          delivered: false,
          provider: 'resend',
          message: `Resend failed: ${raw}`,
        }
      }

      return {
        delivered: true,
        provider: 'resend',
        message: 'Alert sent via Resend.',
      }
    } catch (error) {
      return {
        delivered: false,
        provider: 'resend',
        message: error instanceof Error ? error.message : 'Unknown Resend error',
      }
    }
  }

  // Fallback developer-mode alert path
  console.log('[Watch Alert][Log Only]', {
    email: watch.email,
    route: `${watch.preferences.origin} -> ${watch.preferences.destination}`,
    price: recommendation.flight.totalCost.estimatedTotal,
    recommendationId: recommendation.flight.id,
  })

  return {
    delivered: false,
    provider: 'log',
    message: 'No email provider configured; alert logged to server output (not delivered by email).',
  }
}

function buildAlertEmailHtml(watch: TravelWatch, recommendation: TravelRecommendation): string {
  const firstSegment = recommendation.flight.segments[0]
  const confidence = recommendation.flight.totalCost.confidence

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">
      <h2>Good news — your tracked flight is available 🎉</h2>
      <p><strong>Route:</strong> ${watch.preferences.origin} → ${watch.preferences.destination}</p>
      <p><strong>Price:</strong> $${recommendation.flight.totalCost.estimatedTotal} (${recommendation.flight.totalCost.currency})</p>
      <p><strong>Airline:</strong> ${firstSegment?.airline || 'N/A'}</p>
      <p><strong>Departure:</strong> ${firstSegment?.departureTime || 'N/A'}</p>
      <p><strong>Pricing confidence:</strong> ${confidence}</p>
      <p><strong>Why this matched:</strong> ${recommendation.aiSummary}</p>
      <p>This alert came from your Roamly watch with target price $${watch.targetPrice}.</p>
    </div>
  `
}
