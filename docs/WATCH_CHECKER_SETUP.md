# Watch Checker Setup (Production)

This guide makes Roamly watches run automatically in production.

## 1) Set environment variables

In your deployment platform (for example Vercel), set:

- `SERPAPI_API_KEY`
- `CRON_SECRET` (recommended for Vercel Cron auth)
- `WATCH_CHECK_SECRET` (optional, alternate secret name)
- `DATABASE_URL` (recommended for persistent watches)
- `RESEND_API_KEY` and `ALERT_FROM_EMAIL` (for real email delivery)

## 2) Cron schedule

`vercel.json` should call the checker every hour:

- `GET /api/watches/check` at the top of every hour

Hourly cron is safe because each watch decides whether it is due:

- far-away departures: every few hours
- near departures: every hour

If your hosting plan cannot run hourly cron, use an external scheduler that calls this endpoint with your secret.

## 3) Auth for cron calls

The check endpoint accepts any of:

- `Authorization: Bearer <CRON_SECRET>`
- `x-watch-check-secret: <WATCH_CHECK_SECRET>`
- `?token=<WATCH_CHECK_SECRET or CRON_SECRET>`

If `WATCH_CHECK_SECRET` and `CRON_SECRET` are both missing, auth is skipped (development mode).

## 4) Verify checker health

Use:

- `GET /api/watches/check/status`

It returns:

- readiness (`checkerReady`)
- config flags (keys/DB/email setup present or not)
- watch counts (`active`, `matched`, `paused`)

## 5) Manual test run

Run once manually:

- `POST /api/watches/check?dryRun=true`

Or for one email:

- `POST /api/watches/check?email=user@example.com&dryRun=true`

Then run real mode:

- `POST /api/watches/check?email=user@example.com`

> Note: `dryRun=true` does not send emails and does not update watch timestamps/status.
