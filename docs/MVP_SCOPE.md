# Roamly MVP Scope (V1)

## One-line MVP

Roamly lets a traveler create a flight watch from trip constraints, checks the market automatically in the background, and notifies them when a matching option finally appears.

---

## Problem We Are Solving

Travelers waste time repeatedly searching and still get surprised by hidden costs (bags, taxes, seat fees, etc.).  
Roamly should reduce this by:

1. Understanding constraints in plain language
2. Saving a watch when the ideal fare is not available yet
3. Rechecking automatically until the right option appears
4. Explaining true expected trip cost in simple language

---

## In Scope (MVP V1)

### 1) Constraint collection
- Chat input (natural language)
- Structured form input
- Normalized constraint object with at least:
  - origin
  - destination
  - departure date
  - trip type
  - budget
  - cabin class
  - bag preference
  - nonstop preference

### 2) Watch creation and persistence
- User can create a watch when a route does not currently meet their target constraints
- Watch stores route, dates, budget target, and relevant travel preferences
- Watch remains active until paused, cancelled, or matched

### 3) Background monitoring
- Roamly rechecks active watches automatically
- Default cadence is every few hours for normal watches
- Cadence tightens to every hour when departure is close
- Matching logic respects the user constraints and target total price

### 4) Best-option recommendation
- Return ranked option(s) from available search data
- Show why each result matches constraints
- Show when an option does **not** fully match and which constraint is missed

### 5) Transparent total-cost estimate
- Show expected total as:
  - base fare
  - taxes/fees
  - baggage cost
  - known add-on costs (if available)
- Mark costs as:
  - included
  - extra
  - unknown

### 6) Notification
- Notify the user when a watch finds a matching option
- MVP can start with email delivery
- Notification should include route, matched price, and why it matched

### 7) AI explanation layer
- Explain tradeoffs in plain language, for example:
  - "This looks cheap at headline fare, but your total is higher because checked bag is extra."
  - "This option is slightly more expensive but includes baggage and has a shorter trip."

---

## Out of Scope (for this MVP slice)

- SMS/push notifications beyond email
- Full auth/account management
- Multi-provider optimization
- Booking transactions
- Hotels and broader trip packaging

---

## Definition of Done (MVP V1)

V1 is done when all are true:

1. User can input trip constraints via chat **or** form.
2. User can create a watch from those constraints.
3. If no match is available now, the watch stays active and is checked automatically in the background.
4. Watches recheck every few hours by default and every hour when departure is close.
5. When a matching option appears, the user receives a notification.
6. System returns ranked option(s) with constraint-fit reasoning.
7. Each result includes a clear total-cost breakdown (not just headline fare).
8. AI explanation clearly communicates what is included, extra, or uncertain.
9. A "no good match found" response still gives a helpful explanation and an obvious watch-creation path.

---

## Product Success Signals (Initial)

- Users trust the platform enough to stop manually rechecking the same route
- Users understand cost breakdown without confusion
- Users trust recommendation reasoning
- Reduced "surprise cost" feedback
- Successful watch-to-notification conversions

---

## Immediate Next Build Steps

1. Finalize adaptive watch cadence rules in code
2. Ensure watch creation is available from both chat and results flows
3. Harden notification delivery and messaging
4. Improve recommendation reasoning and total-cost explanation UI
