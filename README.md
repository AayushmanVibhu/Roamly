# Roamly ✈️

> AI-powered travel decision platform that helps users find the best travel options based on constraints like budget, preferences, baggage needs, and convenience.

![Roamly](https://img.shields.io/badge/status-MVP-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## 🎯 Overview

Roamly is not just another flight search engine. It's an intelligent travel companion that helps users **decide when an option is actually worth taking** by providing:

- **AI-Powered Recommendations**: Smart scoring system that evaluates flights based on price, convenience, comfort, and reliability
- **Price Intelligence**: Real-time analysis comparing current prices to historical averages with trend predictions
- **Decision Support**: Clear explanations of why each option is worth considering or avoiding
- **Personalized Matching**: Results tailored to individual constraints and preferences

## 🚀 Features

### Core Functionality

- ✅ **Landing Page**: Beautiful, modern hero section with feature highlights
- ✅ **Trip Planner**: Comprehensive form for collecting user preferences
- ✅ **Smart Recommendations**: AI-scored flight options with detailed analysis
- ✅ **Dashboard**: Track your trips, savings, and search history

### Smart Features

- 🎯 **Travel Score (0-100)**: Comprehensive scoring evaluating:
  - **Cost Efficiency (30%)**: Base fare + baggage fees vs budget
  - **Convenience (25%)**: Travel time + layover quality
  - **Comfort (20%)**: Cabin class + amenities + baggage allowance
  - **Reliability (15%)**: On-time performance + cancellation policy
  - **Schedule Match (10%)**: Departure time preferences
  
- 💰 **Price Analysis**:
  - Good deal indicator
  - Trend prediction (rising/falling/stable)
  - Comparison to route averages
  
- 🤖 **AI Explanations**: Natural language insights like:
  > "This option is recommended because it fits within your budget, avoids long layovers, and includes checked baggage at no extra cost."
  
- 🔍 **Detailed Breakdowns**:
  - Flight segments & layover analysis
  - Price breakdown with hidden costs
  - Amenities & cancellation policies

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Architecture**: Modular component design

## 📁 Project Structure

```
Roamly/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   ├── planner/
│   │   └── page.tsx              # Trip planning form
│   ├── results/
│   │   └── page.tsx              # Recommendations page
│   └── dashboard/
│       └── page.tsx              # User dashboard
├── components/                   # Reusable components
│   ├── TripInputForm.tsx         # Trip preferences form
│   ├── RecommendationCard.tsx    # Flight recommendation card
│   ├── PriceBreakdown.tsx        # Price detail component
│   └── TravelScoreBadge.tsx      # Score visualization
├── lib/
│   └── mockData.ts               # Mock travel data
├── types/
│   └── index.ts                  # TypeScript type definitions
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## 🏃 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AayushmanVibhu/Roamly.git
   cd Roamly
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🎨 Key Components

### TripInputForm
Comprehensive form component that collects:
- Origin/destination
- Travel dates (one-way or round-trip)
- Passenger counts
- Budget constraints
- Preferences (baggage, seat, departure time, layovers)

### RecommendationCard
Rich flight display showing:
- Flight segments with timing and layovers
- Overall travel score badge
- AI-generated insights
- Expandable details (score breakdown, amenities, price breakdown)
- Price trend indicators

### TravelScoreBadge
Visual score indicator (0-100) with:
- Color-coded ratings (Excellent/Great/Good/Fair)
- Responsive sizing
- Optional labels

### PriceBreakdown
Transparent pricing showing:
- Base fare, taxes, fees
- Included baggage
- Optional add-ons
- Cost per flight hour
- Booking tips

## 📊 Mock Data

Currently using mock data in `lib/mockData.ts` with:
- 4 sample flight routes (SFO → JFK)
- Varied airlines (United, Delta, JetBlue, American)
- Different price points ($199-$312)
- Realistic flight segments and layovers
- AI-generated insights and recommendations

## 🔮 Future Enhancements

### Phase 1 (Current MVP)
- ✅ Core UI/UX
- ✅ Mock data integration
- ✅ Scoring algorithm visualization

### Phase 2 (Next Steps)
- [ ] Real flight API integration (Amadeus, Skyscanner, etc.)
- [ ] User authentication
- [ ] Save/bookmark trips
- [ ] Price alerts & notifications
- [ ] Email notifications when prices drop

### Phase 3 (Advanced Features)
- [ ] Multi-city trip planning
- [ ] Hotel & rental car integration
- [ ] Calendar view for flexible dates
- [ ] Price prediction ML model
- [ ] Mobile app (React Native)

## 🎯 Design Philosophy

### User-Centric Decision Making
Rather than overwhelming users with hundreds of options, Roamly focuses on:
1. **Quality over quantity**: Show fewer, better-matched options
2. **Transparency**: Explain why each option is recommended
3. **Context**: Compare prices to historical data
4. **Practicality**: Factor in total travel time, not just price

### Modern, Minimal UI
- Clean gradient backgrounds
- Card-based layouts
- Generous whitespace
- Smooth animations
- Responsive design

## 🤝 Contributing

This is an MVP startup project. Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 👨‍💻 Author

**AayushmanVibhu**
- GitHub: [@AayushmanVibhu](https://github.com/AayushmanVibhu)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS
- Lucide for the beautiful icon set

---

**Made with ❤️ for travelers who value their time and money**
