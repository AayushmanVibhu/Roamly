# Roamly MVP Scope (V1)

## One-line MVP

Roamly helps a traveler share trip constraints (via chat or form), then returns the best option with a clear explanation of what is included and what total costs to expect.

---

## Problem We Are Solving

Travelers waste time repeatedly searching and still get surprised by hidden costs (bags, taxes, seat fees, etc.).  
Roamly should reduce this by:

1. Understanding constraints in plain language
2. Ranking the best matching option(s)
3. Explaining true expected trip cost in simple language

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

### 2) Best-option recommendation
- Return ranked option(s) from available search data
- Show why each result matches constraints
- Show when an option does **not** fully match and which constraint is missed

### 3) Transparent total-cost estimate
- Show expected total as:
  - base fare
  - taxes/fees
  - baggage cost
  - known add-on costs (if available)
- Mark costs as:
  - included
  - extra
  - unknown

### 4) AI explanation layer
- Explain tradeoffs in plain language, for example:
  - "This looks cheap at headline fare, but your total is higher because checked bag is extra."
  - "This option is slightly more expensive but includes baggage and has a shorter trip."

---

## Out of Scope (for this MVP slice)

- Continuous background tracking jobs
- Automated notifications (email/SMS/push)
- Full auth/account management
- Multi-provider optimization
- Booking transactions

These are important, but will be built after V1 core trust is proven.

---

## Definition of Done (MVP V1)

V1 is done when all are true:

1. User can input trip constraints via chat **or** form.
2. System returns ranked option(s) with constraint-fit reasoning.
3. Each result includes a clear total-cost breakdown (not just headline fare).
4. AI explanation clearly communicates what is included, extra, or uncertain.
5. A "no good match found" response still gives a helpful explanation.

---

## Product Success Signals (Initial)

- Users understand cost breakdown without confusion
- Users trust recommendation reasoning
- Reduced "surprise cost" feedback
- Users can make a decision without re-searching elsewhere

---

## Immediate Next Build Steps

1. Finalize the normalized constraint schema in code
2. Add a first-class total-cost model (types + UI rendering)
3. Update recommendation engine output to include included/extra/unknown costs
4. Improve AI summary prompts to explain cost tradeoffs clearly
