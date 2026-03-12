# Trip Planner Form - Technical Documentation

## Overview

The Trip Planner Form is a comprehensive, validated React component that collects user travel preferences and prepares them for the AI recommendation engine.

## Form Fields

### Core Trip Details
- **Origin** (required): Airport code or city name
- **Destination** (required): Airport code or city name
- **Departure Date** (required): Must be today or future date
- **Return Date** (conditional): Required for round trips, must be after departure
- **Trip Type**: One-way or Round-trip

### Flexibility
- **Flexible Dates Toggle**: Allows ±3 day search window for better deals

### Passengers
- **Adults** (12+): 1-9 passengers
- **Children** (2-11): 0-9 passengers
- **Infants** (0-2): 0-9 passengers

### Budget
- **Maximum Budget**: $50 - $5,000 per person (slider control)
- Visual indicators for budget categories:
  - < $200: Budget-friendly options
  - $200-$499: Standard options
  - $500-$999: Premium options
  - $1,000+: Luxury options

### Travel Preferences

#### Cabin Class
- Economy (💺)
- Premium Economy (🎫)
- Business (💼)
- First Class (⭐)

#### Baggage
- Carry-on only (🎒)
- Checked bag needed (🧳)

#### Flight Type
- **Nonstop Preference**: Toggle to filter out flights with layovers

#### Departure Times (Multi-select)
- Early Morning (5AM-8AM) 🌅
- Morning (8AM-12PM) ☀️
- Afternoon (12PM-5PM) 🌤️
- Evening (5PM-10PM) 🌆

#### Additional Services
- **Hotel Needed**: Flag for hotel recommendations

## Form Validation

### Real-time Validation
The form validates inputs as users interact with fields:

1. **Origin/Destination**
   - Must be at least 3 characters
   - Cannot be the same
   - Shows inline error messages

2. **Dates**
   - Departure date cannot be in the past
   - Return date must be after departure date
   - Validated on change

3. **Budget**
   - Must be between $50 and $10,000
   - Validated on submission

### Error Handling
- Visual error indicators (red borders)
- Alert icons with descriptive messages
- Auto-scroll to first error on submission
- Prevents submission until all errors are resolved

## Data Flow

### 1. Form State Management
```typescript
interface TripPreferences {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  tripType: 'one-way' | 'round-trip'
  flexibleDates: boolean
  passengers: {
    adults: number
    children: number
    infants: number
  }
  maxBudget: number
  currency: string
  preferences: {
    cabinClass: 'economy' | 'premium-economy' | 'business' | 'first'
    checkedBag: boolean
    nonstopOnly: boolean
    departureTimePreferences: string[]
    hotelNeeded: boolean
  }
}
```

### 2. Transformation for API
The `prepareRecommendationRequest()` function transforms form data into API-ready format:

```typescript
interface RecommendationRequest {
  route: {
    origin: string          // Normalized to uppercase
    destination: string     // Normalized to uppercase
    departureDate: string
    returnDate?: string
    tripType: 'one-way' | 'round-trip'
  }
  passengers: {
    adults: number
    children: number
    infants: number
    total: number          // Calculated sum
  }
  budget: {
    maxPerPerson: number
    totalMax: number       // Calculated: maxPerPerson * total passengers
    currency: string
  }
  flightPreferences: {
    cabinClass: string
    nonstopOnly: boolean
    checkedBagRequired: boolean
    departureTimeWindows: string[]
    flexibleDates: boolean
    flexibilityDays: number  // 3 if flexible, 0 otherwise
  }
  additionalServices: {
    hotelRequired: boolean
  }
  metadata: {
    searchTimestamp: string  // ISO format
    userTimezone: string     // Auto-detected
  }
}
```

### 3. Search Prioritization
The `calculateSearchPriorities()` function determines algorithm weights:

```typescript
{
  priceWeight: 0.4,        // Adjusted based on budget
  timeWeight: 0.2,         // Increased if nonstop only
  comfortWeight: 0.2,      // Increased for premium cabins
  convenienceWeight: 0.2   // Increased for nonstop preference
}
```

**Priority Adjustments:**
- Low budget (< $300): Price weight increases to 0.6
- High budget (> $1,000): Comfort weight increases to 0.4
- Business/First class: Comfort weight = 0.4, price = 0.2
- Nonstop only: Time & convenience = 0.3 each

## Usage Example

### In Planner Page Component
```typescript
import TripInputForm from '@/components/TripInputForm'
import { fetchRecommendations, prepareRecommendationRequest } from '@/lib/recommendationEngine'

const handleSearch = async (preferences: TripPreferences) => {
  setIsSearching(true)
  
  // Transform data for API
  const request = prepareRecommendationRequest(preferences)
  
  // Calculate search priorities
  const priorities = calculateSearchPriorities(preferences)
  
  // Send to recommendation engine
  const results = await fetchRecommendations(preferences)
  
  // Store and navigate
  sessionStorage.setItem('tripPreferences', JSON.stringify(preferences))
  router.push('/results')
}

<TripInputForm onSubmit={handleSearch} isLoading={isSearching} />
```

## Developer Console Output

When form is submitted, the console displays:
```
🚀 Sending to Recommendation Engine:
Request Payload: {
  route: { origin: "SFO", destination: "JFK", ... }
  passengers: { adults: 2, children: 0, infants: 0, total: 2 }
  budget: { maxPerPerson: 500, totalMax: 1000, currency: "USD" }
  ...
}
Search Priorities: {
  priceWeight: 0.4,
  timeWeight: 0.2,
  comfortWeight: 0.2,
  convenienceWeight: 0.2
}
```

## API Integration (Future)

To integrate with a real recommendation API:

```typescript
// In lib/recommendationEngine.ts
export async function fetchRecommendations(preferences: TripPreferences) {
  const request = prepareRecommendationRequest(preferences)
  
  const response = await fetch('/api/recommendations', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.API_KEY}`
    },
    body: JSON.stringify(request)
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch recommendations')
  }
  
  return response.json()
}
```

## UI/UX Features

### Visual Feedback
- Loading spinner during search
- Disabled state for submit button
- Progress indication
- Smooth animations

### Accessibility
- Proper label associations
- Keyboard navigation
- ARIA attributes
- Error announcements

### Responsive Design
- Mobile-first approach
- Grid layouts adapt to screen size
- Touch-friendly controls
- Optimized for all devices

## Testing Checklist

- [ ] All required fields validated
- [ ] Date logic works correctly
- [ ] Budget slider updates display
- [ ] Multi-select departure times work
- [ ] Flexible dates toggle functions
- [ ] Form submission calls handler
- [ ] Loading state displays correctly
- [ ] Errors scroll into view
- [ ] Console logs show correct data
- [ ] Mobile responsive layout works

## Future Enhancements

1. **Auto-complete for airports** using airport database API
2. **Calendar view** for date selection with price indicators
3. **Saved searches** to quickly re-run common searches
4. **Price alerts** when prices drop for saved searches
5. **Multi-city support** for complex itineraries
6. **Airline alliance preferences**
7. **Seat map preview** integration
8. **Real-time availability** indicators
