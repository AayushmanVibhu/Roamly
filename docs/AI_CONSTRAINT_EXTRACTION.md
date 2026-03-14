# AI Constraint Extraction & Guided Assistant

The Roamly AI assistant can extract travel preferences from natural language input and guides users with contextual questions and quick reply buttons.

## Guided Assistant Behavior

The assistant follows a structured conversation flow to gather essential information:

### Priority Order
1. **Origin** - Where are you flying from?
2. **Destination** - Where would you like to go?
3. **Dates** - When are you planning to travel?
4. **Trip Type** - One-way or round-trip?
5. **Budget** - Do you have a budget in mind?
6. **Preferences** - Cabin class, bags, nonstop, hotel, etc.

### Quick Reply Buttons

The assistant dynamically shows relevant quick reply buttons based on the conversation context:

**When asking for origin/destination:**
- Popular cities (New York, Los Angeles, Chicago, Miami, etc.)

**When asking for dates:**
- "This weekend"
- "Next week"
- "Next month"
- "Flexible dates"

**When asking for trip type:**
- "Round-trip"
- "One-way"

**When asking for budget:**
- "Under $300"
- "Under $500"
- "Under $1000"
- "No preference"

**When asking for preferences:**
- "Nonstop only"
- "Checked bag" / "Carry-on only"
- "Need hotel" / "No hotel"
- "Weekend trip"

## Supported Extractions

### Origins & Destinations
The system recognizes 50+ major airports and cities worldwide with improved parsing:
- **Example**: "I want to fly from Phoenix to New York"
- **Extracts**: `origin: "Phoenix (PHX)"`, `destination: "New York (NYC)"`
- **Supports**: 
  - Airport codes (LAX, SFO, ORD, LHR, CDG, etc.)
  - City names (with fuzzy matching)
  - Multi-word cities (New York, Los Angeles, San Francisco)
  - Common abbreviations (NYC, LA, SF, DC, Vegas)
- **Improved**: More precise extraction that won't grab extra text

### Budget
- **Example**: "under $400", "budget of $500", "max $1000"
- **Extracts**: `budget: 400`
- **Validation**: Only accepts amounts between $100-$50,000 to avoid false positives

### Dates
Supports relative, absolute, and specific date formats:
- **Relative dates**: 
  - "next month" → 1st of next month
  - "next week" → 7 days from today
  - "this weekend" → upcoming Friday
  - "tomorrow" → next day
  - "today" → current date
- **Specific dates**: 
  - "December 15" → December 15th
  - "15th of December" → December 15th
  - "March 5th" → March 5th
- **Month names**: 
  - "in December" → December 1st
  - "next January" → January 1st next year
- **Duration**: "5 days", "2 weeks" (for return date calculation)
- **Example**: "I want to fly next month for 5 days"
- **Extracts**: `departureDate: "2026-04-01"`, `returnDate: "2026-04-06"`
- **Improved**: Sets specific day of month (1st) when only month is mentioned, preventing random dates

### Trip Type
- **Example**: "one-way" or "round-trip"
- **Extracts**: `tripType: "one-way"` or `tripType: "round-trip"`

### Passengers
- **Example**: "for 2 people", "3 passengers", "solo trip"
- **Extracts**: `passengers: 2`

### Cabin Class
- **Example**: "business class", "first class", "premium economy"
- **Extracts**: `cabinClass: "business"`
- **Options**: economy, premium-economy, business, first

### Nonstop Preference
- **Example**: "nonstop only", "direct flights", "no layovers"
- **Extracts**: `nonstopOnly: true`

### Checked Baggage
- **Example**: "with one checked bag", "need luggage", "checked baggage"
- **Extracts**: `checkedBag: true`

### Flexible Dates
- **Example**: "flexible dates", "any day works"
- **Extracts**: `flexibleDates: true`

### Departure Time Preference
- **Example**: "morning flight", "evening departure", "afternoon"
- **Extracts**: `departureTimePreference: "morning"`
- **Options**: morning, afternoon, evening, night

### Hotel Needed
- **Example**: "need a hotel", "with accommodation"
- **Extracts**: `hotelNeeded: true`

## Example Queries

### Comprehensive Query
```
"I want to fly from Phoenix to New York next month under $400 with one checked bag"
```
**Extracts**:
- origin: "Phoenix (PHX)"
- destination: "New York (NYC)"
- departureDate: [calculated for next month]
- budget: 400
- checkedBag: true

### Business Travel
```
"Round trip from Chicago to San Francisco in December, business class, nonstop only"
```
**Extracts**:
- origin: "Chicago (ORD)"
- destination: "San Francisco (SFO)"
- departureDate: [December date]
- tripType: "round-trip"
- cabinClass: "business"
- nonstopOnly: true

### Budget Traveler
```
"Budget-friendly flight to Europe next week, flexible dates, just carry-on"
```
**Extracts**:
- destination: "Europe"
- departureDate: [next week]
- flexibleDates: true
- checkedBag: false

### Family Trip
```
"LA to Disney World for 4 people with checked bags and hotel"
```
**Extracts**:
- origin: "Los Angeles (LAX)"
- destination: "Orlando (MCO)"
- passengers: 4
- checkedBag: true
- hotelNeeded: true

## Implementation

The extraction logic is in `/lib/constraintExtractor.ts` with two main functions:

1. **`extractConstraints(text: string)`**: Extracts all possible constraints from input
2. **`generateConfirmation(constraints)`**: Creates natural language confirmation

The guided assistant logic is in `/app/assistant/page.tsx` with:
- **`generateMockResponse()`**: Creates contextual responses and questions
- **`generateQuickReplies()`**: Generates relevant quick reply buttons
- **`handleQuickReply()`**: Processes quick reply selections

## Conversational Features

### Natural Confirmations
When constraints are extracted, the assistant confirms in natural language:
```
"Got it! Flying from Phoenix (PHX) to New York (NYC), departing March 20, 
with a budget of $400, with checked baggage."
```

### Context-Aware Questions
The assistant asks follow-up questions based on what's missing:
- If no origin: "Where will you be flying from?"
- If no destination: "Where would you like to go?"
- If both set but no dates: "When are you planning to travel?"

### Mixed Input Methods
Users can freely mix:
- Natural language typing
- Quick reply buttons
- Quick constraint buttons (at the top)

All methods update the live constraint summary in real-time.

## Future Enhancements

- Date range support ("between Dec 1-15")
- Specific airlines preference ("on Delta")
- Loyalty program integration
- Multi-city trips
- Companion/group travel details
- Special needs (wheelchair, pets, etc.)
