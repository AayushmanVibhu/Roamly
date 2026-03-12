# Roamly Travel Score System

## Overview

The Travel Score system provides a comprehensive 0-100 rating for each travel option based on multiple weighted factors. This helps users quickly identify the best options for their specific needs.

## Scoring Algorithm

### Overall Score Calculation

Each flight receives an overall score (0-100) calculated as a weighted average:

```
Overall Score = 
  (Price Score × 30%) +
  (Convenience Score × 25%) +
  (Comfort Score × 20%) +
  (Reliability Score × 15%) +
  (Schedule Match Score × 10%)
```

### 1. Cost Efficiency / Price Score (30% weight)

**What it measures:**
- How well the total price (base fare + baggage fees) fits the user's budget
- Value for money compared to budget allocation

**Calculation:**
- 100 points: Price is 50% or less of max budget (excellent value)
- 90-100 points: Price is 50-75% of max budget (optimal range)
- 50-90 points: Price is 75-100% of max budget (acceptable)
- 0 points: Price exceeds max budget (over budget)

**Example:**
- Budget: $500
- Flight price: $289 (58% of budget)
- Price Score: 95/100

### 2. Travel Time & Convenience Score (25% weight)

**What it measures:**
- Number of layovers and connection quality
- Total travel time
- Layover duration (too short or too long)

**Calculation:**
- Non-stop flights: 100 points (base)
- 1 layover: 75 points (base)
  - Penalty: -15 if layover < 60 minutes (too tight)
  - Penalty: -10 if layover > 180 minutes (too long)
- 2+ layovers: 50 points (base)
- Additional penalties:
  - -10 points if total time > 6 hours
  - -15 points if total time > 8 hours
  - -20 points if total time > 12 hours

**Example:**
- Non-stop flight, 5.5 hours total
- Convenience Score: 100/100

### 3. Comfort Score (20% weight)

**What it measures:**
- Cabin class selected
- Amenities available
- Baggage allowance (fees vs included)

**Calculation:**
- Base: 50 points
- Cabin class bonus:
  - Economy: +0
  - Premium Economy: +20
  - Business: +35
  - First: +45
- Amenities: +4 points per amenity (max +25)
- Baggage included: +10 points

**Example:**
- Economy class: 50 base
- 4 amenities (WiFi, Entertainment, Power, Snacks): +16
- Checked bag included: +10
- Comfort Score: 76/100

### 4. Reliability Score (15% weight)

**What it measures:**
- Airline on-time performance
- Historical reliability
- Cancellation policy

**Current Implementation:**
- Mock data: 85-95 range
- Future: Real airline performance data

### 5. Schedule Match Score (10% weight)

**What it measures:**
- How well departure time matches user preferences
- Flexibility for users with no preference

**Calculation:**
- 95 points: Matches user's preferred departure window
- 85 points: No preference specified (default)
- 65 points: Doesn't match stated preference

## Visual Display

### Score Badge

```
┌──────────┐
│    92    │  Excellent Value
│  ⭐     │  Overall Score
└──────────┘
```

**Color Coding:**
- 90-100: Green (Excellent)
- 80-89: Blue (Great)
- 70-79: Yellow (Good)
- Below 70: Orange (Fair)

### Score Breakdown (Expandable)

Shows all 5 components as progress bars:
```
💰 Price               95/100 ████████████████████
⚡ Convenience        100/100 ████████████████████
✨ Comfort             76/100 ███████████████▌
🛡️ Reliability         91/100 ██████████████████▎
🕐 Schedule Match      95/100 ███████████████████
```

## AI Explanations

Each option includes a natural language explanation:

### Structure:
1. **Opening assessment** based on overall score
2. **Price commentary** (value proposition)
3. **Travel time insights** (non-stop vs connections)
4. **Schedule fit** (if relevant)
5. **Comfort highlights** (amenities)

### Example:
> "This is an excellent match for your preferences. At $289, it's well within your budget and offers great value. The non-stop flight eliminates layover hassles and minimizes total travel time. The morning departure aligns with your preferences. Includes WiFi and In-flight Entertainment for a more comfortable journey."

## Insights

5 bullet-point insights highlighting key factors:

- ✈️ Non-stop flight saves 3+ hours
- 💰 Great value - $211 under your maximum budget
- 🧳 Checked bag included (saves $35)
- 📶 Free WiFi available on board
- 🌄 Early morning departure - arrive earlier

## Price Analysis

Additional context about pricing:

- **Comparison to market average** (e.g., "-17% below average")
- **Price trend** (rising/falling/stable)
- **Booking recommendation** (e.g., "Excellent time to book - price is 17% below average and trending up")

## Implementation Details

### Files:
- `/lib/recommendationEngine.ts` - Scoring algorithm
- `/components/TravelScoreBadge.tsx` - Visual score display
- `/components/RecommendationCard.tsx` - Full recommendation with scores
- `/types/index.ts` - TravelScore interface

### TravelScore Interface:
```typescript
interface TravelScore {
  overall: number              // 0-100
  breakdown: {
    price: number             // 0-100
    convenience: number       // 0-100
    comfort: number          // 0-100
    reliability: number       // 0-100
    scheduleMatch: number     // 0-100
  }
  insights: string[]          // 3-5 key insights
  priceAnalysis: {
    isPriceGood: boolean
    comparedToAverage: number  // percentage
    trend: 'rising' | 'falling' | 'stable'
    recommendation: string
  }
}
```

## Tags

Auto-generated tags for quick filtering:
- "Best Overall" (score ≥ 90)
- "Recommended" (score ≥ 85)
- "Best Value" (price < 55% of budget)
- "Non-Stop"
- "Fastest"
- "Baggage Included"
- Cabin class (if not economy)

## User Benefits

1. **Quick Decision Making**: Overall score provides instant ranking
2. **Transparency**: Breakdown shows exactly why each option scored as it did
3. **Personalization**: Scores adapt to user's specific preferences
4. **Context**: AI explanations provide reasoning, not just numbers
5. **Confidence**: Users understand trade-offs and make informed choices

## Future Enhancements

- Machine learning to optimize weights based on user feedback
- Historical price data for more accurate market comparisons
- Real-time airline reliability data
- Personalized scoring based on user history
- A/B testing different weight configurations
