'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChatMessage, TravelConstraints, QuickReply } from '@/types'
import ChatPanel from '@/components/ChatPanel'
import ConstraintSummaryPanel from '@/components/ConstraintSummaryPanel'
import RecommendationTrigger from '@/components/RecommendationTrigger'
import { extractConstraints, generateConfirmation } from '@/lib/constraintExtractor'
import { 
  convertConstraintsToPreferences, 
  validateConstraints, 
  saveTripPreferences 
} from '@/lib/tripPreferencesUtils'
import { Plane, ArrowLeft } from 'lucide-react'

// Generate contextual quick replies based on missing information
const generateQuickReplies = (mergedConstraints: TravelConstraints): QuickReply[] => {
  const replies: QuickReply[] = []
  
  // Budget-related quick replies
  if (!mergedConstraints.budget) {
    replies.push({ label: 'Under $500', field: 'budget', value: 500 })
    replies.push({ label: 'Under $1000', field: 'budget', value: 1000 })
  }
  
  // Trip type quick replies
  if (!mergedConstraints.tripType && mergedConstraints.origin && mergedConstraints.destination) {
    replies.push({ label: 'Round-trip', field: 'tripType', value: 'round-trip' })
    replies.push({ label: 'One-way', field: 'tripType', value: 'one-way' })
  }
  
  // Date-related quick replies
  if (!mergedConstraints.departureDate && !mergedConstraints.flexibleDates) {
    replies.push({ label: 'This weekend', field: 'departureDate', value: 'this weekend' })
    replies.push({ label: 'Next week', field: 'departureDate', value: 'next week' })
    replies.push({ label: 'Flexible dates', field: 'flexibleDates', value: true })
  }
  
  // Preference quick replies (show after basics are covered)
  if (mergedConstraints.origin && mergedConstraints.destination) {
    if (mergedConstraints.nonstopOnly === undefined) {
      replies.push({ label: 'Nonstop only', field: 'nonstopOnly', value: true })
    }
    if (mergedConstraints.checkedBag === undefined) {
      replies.push({ label: 'Checked bag', field: 'checkedBag', value: true })
      replies.push({ label: 'Carry-on only', field: 'checkedBag', value: false })
    }
    if (mergedConstraints.hotelNeeded === undefined) {
      replies.push({ label: 'Need hotel', field: 'hotelNeeded', value: true })
      replies.push({ label: 'No hotel', field: 'hotelNeeded', value: false })
    }
  }
  
  // Limit to 6 quick replies to avoid clutter
  return replies.slice(0, 6)
}

// Generate AI response using constraint extraction with guided questions
const generateMockResponse = (userMessage: string, currentConstraints: TravelConstraints): ChatMessage => {
  // Extract constraints from the message
  const extractedConstraints = extractConstraints(userMessage)
  
  let response = ''
  let quickReplies: QuickReply[] = []
  
  // Generate confirmation if constraints were extracted
  if (Object.keys(extractedConstraints).length > 0) {
    const confirmation = generateConfirmation(extractedConstraints)
    response = `Got it! ${confirmation}\n\n`
    
    // Merge with current constraints to determine what's still needed
    const mergedConstraints = { ...currentConstraints, ...extractedConstraints }
    
    // Guided follow-up questions in priority order
    if (!mergedConstraints.origin) {
      response += "Where will you be flying from?"
      // Add common origin suggestions in quick replies
      quickReplies = [
        { label: 'New York', field: 'origin', value: 'New York (NYC)' },
        { label: 'Los Angeles', field: 'origin', value: 'Los Angeles (LAX)' },
        { label: 'Chicago', field: 'origin', value: 'Chicago (ORD)' },
        { label: 'Phoenix', field: 'origin', value: 'Phoenix (PHX)' },
      ]
    } else if (!mergedConstraints.destination) {
      response += "Where would you like to go?"
      // Add popular destinations
      quickReplies = [
        { label: 'New York', field: 'destination', value: 'New York (NYC)' },
        { label: 'Miami', field: 'destination', value: 'Miami (MIA)' },
        { label: 'Las Vegas', field: 'destination', value: 'Las Vegas (LAS)' },
        { label: 'San Francisco', field: 'destination', value: 'San Francisco (SFO)' },
      ]
    } else if (!mergedConstraints.departureDate && !mergedConstraints.flexibleDates) {
      response += "When are you planning to travel?"
      quickReplies = [
        { label: 'This weekend', field: 'departureDate', value: 'this weekend' },
        { label: 'Next week', field: 'departureDate', value: 'next week' },
        { label: 'Next month', field: 'departureDate', value: 'next month' },
        { label: 'Flexible dates', field: 'flexibleDates', value: true },
      ]
    } else if (!mergedConstraints.tripType) {
      response += "Is this a one-way or round-trip?"
      quickReplies = [
        { label: 'Round-trip', field: 'tripType', value: 'round-trip' },
        { label: 'One-way', field: 'tripType', value: 'one-way' },
      ]
    } else if (!mergedConstraints.budget) {
      response += "Do you have a budget in mind?"
      quickReplies = [
        { label: 'Under $300', field: 'budget', value: 300 },
        { label: 'Under $500', field: 'budget', value: 500 },
        { label: 'Under $1000', field: 'budget', value: 1000 },
        { label: 'No preference', field: 'budget', value: 10000 },
      ]
    } else {
      // All essentials covered, ask about preferences
      response += "Great! Any other preferences? (cabin class, nonstop only, bags, etc.)"
      quickReplies = generateQuickReplies(mergedConstraints)
    }
  } else {
    // No constraints extracted, provide helpful guidance
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      response = "I can help you find the perfect flights! Just tell me:\n\n• Where you're flying from and to\n• When you want to travel\n• Your budget (if any)\n• Any preferences (nonstop, cabin class, bags, etc.)\n\nFor example: \"I want to fly from Phoenix to New York next month under $400 with one checked bag\""
      quickReplies = [
        { label: 'Get started', field: 'origin', value: '' },
      ]
    } else if (lowerMessage.includes('ready') || lowerMessage.includes('done')) {
      response = "Perfect! You're all set. Click the 'Generate Recommendations' button to see your flight options."
    } else {
      // Generic response when we don't understand
      if (!currentConstraints.origin) {
        response = "Let's start with the basics. Where will you be flying from?"
        quickReplies = [
          { label: 'New York', field: 'origin', value: 'New York (NYC)' },
          { label: 'Los Angeles', field: 'origin', value: 'Los Angeles (LAX)' },
          { label: 'Chicago', field: 'origin', value: 'Chicago (ORD)' },
        ]
      } else if (!currentConstraints.destination) {
        response = "Great! And where would you like to go?"
        quickReplies = [
          { label: 'Miami', field: 'destination', value: 'Miami (MIA)' },
          { label: 'Las Vegas', field: 'destination', value: 'Las Vegas (LAS)' },
          { label: 'San Francisco', field: 'destination', value: 'San Francisco (SFO)' },
        ]
      } else {
        response = "I want to help you find the best flights! Could you share more details about your travel plans?"
        quickReplies = generateQuickReplies(currentConstraints)
      }
    }
  }

  return {
    id: `asst-${Date.now()}`,
    role: 'assistant',
    content: response.trim(),
    timestamp: new Date(),
    extractedConstraints: Object.keys(extractedConstraints).length > 0 ? extractedConstraints : undefined,
    quickReplies: quickReplies.length > 0 ? quickReplies : undefined,
  }
}

export default function AIAssistantPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "👋 Hi! I'm your AI travel assistant. I'll help you find the perfect flights step by step.\n\nYou can chat naturally like:\n• \"I want to fly from Phoenix to New York next month under $400\"\n\nOr use the quick buttons below to get started!",
      timestamp: new Date(),
      quickReplies: [
        { label: 'New York', field: 'origin', value: 'New York (NYC)' },
        { label: 'Los Angeles', field: 'origin', value: 'Los Angeles (LAX)' },
        { label: 'Chicago', field: 'origin', value: 'Chicago (ORD)' },
        { label: 'Phoenix', field: 'origin', value: 'Phoenix (PHX)' },
      ],
    },
  ])
  const [constraints, setConstraints] = useState<TravelConstraints>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const constraintsRef = useRef<TravelConstraints>({})

  useEffect(() => {
    constraintsRef.current = constraints
  }, [constraints])

  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Generate AI response with extracted constraints
    setTimeout(() => {
      const aiMessage = generateMockResponse(content, constraintsRef.current)
      setMessages((prev) => [...prev, aiMessage])

      // Update constraints if any were extracted
      if (aiMessage.extractedConstraints) {
        setConstraints((prev) => ({ ...prev, ...aiMessage.extractedConstraints }))
      }
    }, 500)
  }

  const handleQuickConstraint = (field: keyof TravelConstraints, value: any, message: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Update constraint
    setConstraints((prev) => ({ ...prev, [field]: value }))

    // Add confirmation message
    setTimeout(() => {
      const mergedConstraints = { ...constraintsRef.current, [field]: value }
      const aiMessage = generateMockResponse('', mergedConstraints)
      setMessages((prev) => [...prev, aiMessage])
    }, 300)
  }

  const handleQuickReply = (reply: QuickReply) => {
    // Treat quick reply as a user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: reply.label,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Process special date values
    let processedValue = reply.value
    if (reply.field === 'departureDate' && typeof reply.value === 'string') {
      // Extract date from string like "this weekend", "next week", etc.
      const extracted = extractConstraints(reply.value)
      if (extracted.departureDate) {
        processedValue = extracted.departureDate
      }
    }

    // Update constraint with processed value
    setConstraints((prev) => ({ ...prev, [reply.field]: processedValue }))

    // Generate follow-up response
    setTimeout(() => {
      const mergedConstraints = { ...constraintsRef.current, [reply.field]: processedValue }
      const aiMessage = generateMockResponse('', mergedConstraints)
      setMessages((prev) => [...prev, aiMessage])
    }, 300)
  }

  const handleRemoveConstraint = (field: keyof TravelConstraints) => {
    setConstraints((prev) => {
      const updated = { ...prev }
      delete updated[field]
      return updated
    })
  }

  const handleGenerateRecommendations = () => {
    // Validate constraints
    const validation = validateConstraints(constraints)
    
    if (!validation.isValid) {
      // Add assistant message about missing fields
      const missingFieldsMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: `I need a bit more information! Please provide: ${validation.missingFields.join(', ')}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, missingFieldsMessage])
      return
    }

    // Convert constraints to trip preferences
    const preferences = convertConstraintsToPreferences(constraints)
    
    if (!preferences) {
      // Should not happen if validation passed, but just in case
      const errorMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, there was an error processing your preferences. Please make sure you\'ve provided origin and destination.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      return
    }

    setIsGenerating(true)

    // Save preferences to session storage
    saveTripPreferences(preferences)

    // Simulate processing time for better UX
    setTimeout(() => {
      setIsGenerating(false)
      // Navigate to results page
      router.push('/results')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Header */}
      <nav className="border-b border-dark-800 bg-dark-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5 text-dark-400 hover:text-dark-200 transition" />
              </Link>
              <div className="flex items-center gap-2">
                <Plane className="w-8 h-8 text-primary-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  Roamly AI
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/planner"
                className="text-dark-300 hover:text-dark-50 transition text-sm"
              >
                Classic Form
              </Link>
              <Link
                href="/dashboard"
                className="text-dark-300 hover:text-dark-50 transition text-sm"
              >
                Dashboard
              </Link>
              <Link
                href="/watches"
                className="text-dark-300 hover:text-dark-50 transition text-sm"
              >
                My Watches
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Two Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat */}
        <div className="w-full lg:w-1/2 border-r border-dark-800">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            onQuickConstraint={handleQuickConstraint}
            onQuickReply={handleQuickReply}
          />
        </div>

        {/* Right Panel - Summary */}
        <div className="hidden lg:flex lg:w-1/2 flex-col">
          <div className="flex-1 overflow-hidden">
            <ConstraintSummaryPanel
              constraints={constraints}
              onRemoveConstraint={handleRemoveConstraint}
            />
          </div>
          <RecommendationTrigger
            constraints={constraints}
            onGenerateRecommendations={handleGenerateRecommendations}
            isGenerating={isGenerating}
          />
        </div>
      </div>

      {/* Mobile Summary (Bottom Sheet Style) */}
      <div className="lg:hidden border-t border-dark-800 bg-dark-900">
        <div className="max-h-64 overflow-y-auto">
          <ConstraintSummaryPanel
            constraints={constraints}
            onRemoveConstraint={handleRemoveConstraint}
          />
        </div>
        <RecommendationTrigger
          constraints={constraints}
          onGenerateRecommendations={handleGenerateRecommendations}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  )
}
