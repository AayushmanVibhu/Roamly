# Constraint Extraction Examples

Test these queries in the AI assistant to see the improved parsing:

## ✅ Location Extraction (FIXED)

### Before: Incorrect extractions
- "from Phoenix to New York" → might extract "Phoenix to New York" as origin ❌

### After: Precise extractions
- "from Phoenix to New York" → origin: "Phoenix (PHX)", destination: "New York (NYC)" ✅
- "flying from LA to Miami" → origin: "Los Angeles (LAX)", destination: "Miami (MIA)" ✅
- "Chicago to San Francisco" → origin: "Chicago (ORD)", destination: "San Francisco (SFO)" ✅
- "from JFK to LAX" → origin: "New York (JFK)", destination: "Los Angeles (LAX)" ✅

### Fuzzy Matching
- "new york city" → "New York (NYC)" ✅
- "vegas" → "Las Vegas (LAS)" ✅
- "dc" → "Washington (DCA)" ✅

## ✅ Date Extraction (FIXED)

### Before: Random days in correct month
- "in December" → might extract December 14th (current day) ❌

### After: Consistent, predictable dates
- "in December" → December 1st ✅
- "next month" → 1st of next month ✅
- "next January" → January 1st of next year ✅

### Specific Dates (NEW!)
- "December 15" → December 15, 2026 ✅
- "15th of December" → December 15, 2026 ✅
- "March 5th" → March 5, 2027 ✅
- "on the 20th of June" → June 20, 2026 ✅

### Relative Dates
- "tomorrow" → tomorrow's date ✅
- "next week" → 7 days from now ✅
- "this weekend" → upcoming Friday ✅
- "today" → current date ✅

## ✅ Budget Extraction (IMPROVED)

### Validation Added
- Only accepts amounts between $100-$50,000
- Avoids extracting random numbers like dates or flight numbers

### Examples
- "under $400" → budget: 400 ✅
- "budget of $1500" → budget: 1500 ✅
- "max $2000" → budget: 2000 ✅
- "$500 budget" → budget: 500 ✅

### Ignored (not budgets)
- "flight 123" → ignored (too small) ❌
- "in 2026" → ignored (context check) ❌

## 🧪 Complete Test Cases

Try these full queries:

### Basic Route
```
"I want to fly from Phoenix to New York"
```
**Expected**: origin: Phoenix (PHX), destination: New York (NYC)

### With Date
```
"Flying from LA to Miami in December"
```
**Expected**: origin: Los Angeles (LAX), destination: Miami (MIA), departureDate: December 1

### Specific Date
```
"Chicago to Seattle on December 15th"
```
**Expected**: origin: Chicago (ORD), destination: Seattle (SEA), departureDate: December 15

### Full Query
```
"I want to fly from Phoenix to New York on March 20th under $400 with one checked bag"
```
**Expected**: 
- origin: Phoenix (PHX)
- destination: New York (NYC)
- departureDate: March 20, 2026
- budget: 400
- checkedBag: true

### With Duration
```
"Boston to Miami next month for 5 days"
```
**Expected**: 
- origin: Boston (BOS)
- destination: Miami (MIA)
- departureDate: April 1, 2026
- returnDate: April 6, 2026

### Multiple Preferences
```
"Round trip from San Francisco to Tokyo in December, business class, nonstop only, under $3000"
```
**Expected**: 
- origin: San Francisco (SFO)
- destination: Tokyo (NRT)
- departureDate: December 1
- tripType: round-trip
- cabinClass: business
- nonstopOnly: true
- budget: 3000

## 📍 Supported Cities (50+)

### US Cities
New York, Los Angeles, Chicago, Miami, Phoenix, Seattle, Boston, Denver, Dallas, Atlanta, Las Vegas, Orlando, Portland, Austin, Houston, Washington DC, Philadelphia, San Diego, Tampa, Nashville, Detroit, Minneapolis, Salt Lake City

### International
London, Paris, Tokyo, Dubai, Singapore, Rome, Barcelona, Amsterdam, Sydney, Toronto, Mexico City, Cancun, Madrid, Frankfurt, Hong Kong, Bangkok

All with airport code recognition!
