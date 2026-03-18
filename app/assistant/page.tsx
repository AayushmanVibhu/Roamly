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
import {
  Plane,
  ArrowLeft,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  X,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'

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
  const [watchEmail, setWatchEmail] = useState('')
  const [watchStatusMessage, setWatchStatusMessage] = useState<string | null>(null)
  const [isCreatingWatch, setIsCreatingWatch] = useState(false)
  const [isConstraintPanelOpen, setIsConstraintPanelOpen] = useState(false)
  const constraintsRef = useRef<TravelConstraints>({})
  const constraintCount = Object.keys(constraints).length
  const hasMinimumInfo = Boolean(constraints.origin && constraints.destination)
  const requiredValidation = validateConstraints(constraints)
  const missingRequiredFields = requiredValidation.missingFields
  const hasMissingRequiredFields = missingRequiredFields.length > 0

  useEffect(() => {
    constraintsRef.current = constraints
  }, [constraints])

  useEffect(() => {
    const saved = localStorage.getItem('watchEmail')
    if (saved) setWatchEmail(saved)
  }, [])

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
      setIsConstraintPanelOpen(true)
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

  const handleCreateWatch = async () => {
    if (!watchEmail.trim()) {
      setWatchStatusMessage('Please enter an email to create a watch.')
      return
    }

    const validation = validateConstraints(constraintsRef.current)
    if (!validation.isValid) {
      setWatchStatusMessage(`To create a watch, add: ${validation.missingFields.join(', ')}`)
      setIsConstraintPanelOpen(true)
      return
    }

    const preferences = convertConstraintsToPreferences(constraintsRef.current)
    if (!preferences) {
      setWatchStatusMessage('Could not convert chat constraints to watch preferences.')
      return
    }

    setIsCreatingWatch(true)
    setWatchStatusMessage(null)

    try {
      const response = await fetch('/api/watches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: watchEmail.trim(),
          preferences,
          targetPrice: constraintsRef.current.budget || preferences.maxBudget,
          checkIntervalMinutes: 60,
        }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to create watch.')
      }

      localStorage.setItem('watchEmail', watchEmail.trim().toLowerCase())
      setWatchStatusMessage(
        `Watch created. We'll notify ${watchEmail.trim()} when a matching deal appears.`
      )
    } catch (error) {
      setWatchStatusMessage(error instanceof Error ? error.message : 'Failed to create watch.')
    } finally {
      setIsCreatingWatch(false)
    }
  }

  return (
    <div className="h-[100dvh] bg-dark-950 flex flex-col">
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
              <button
                onClick={() => setIsConstraintPanelOpen(true)}
                className={`hidden md:inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition ${
                  hasMissingRequiredFields
                    ? 'border-yellow-700/40 bg-yellow-900/20 text-yellow-200 hover:text-yellow-100'
                    : 'border-dark-700 bg-dark-800/80 text-dark-200 hover:text-dark-50'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Trip details ({constraintCount})
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            onQuickConstraint={handleQuickConstraint}
            onQuickReply={handleQuickReply}
          />
        </div>

        <div className="border-t border-dark-800 bg-dark-900/90 backdrop-blur-md p-3 sm:p-4">
          <div className="max-w-6xl mx-auto space-y-3">
            {hasMissingRequiredFields ? (
              <div className="rounded-xl border border-yellow-700/30 bg-yellow-900/15 px-3 py-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-yellow-200">Missing required trip details</p>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {missingRequiredFields.map(field => (
                        <span
                          key={field}
                          className="inline-flex items-center rounded-full bg-yellow-950/70 border border-yellow-700/40 px-2 py-0.5 text-[11px] text-yellow-100"
                        >
                          Add {field}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-green-700/30 bg-green-900/15 px-3 py-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-300" />
                <p className="text-xs text-green-200">
                  Required details captured. You can search now or refine more constraints.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              onClick={() => setIsConstraintPanelOpen(true)}
              className={`flex-1 text-left rounded-xl border px-4 py-3 transition ${
                hasMissingRequiredFields
                  ? 'border-yellow-700/40 bg-yellow-900/10 hover:border-yellow-600/60'
                  : 'border-dark-700 bg-dark-800/80 hover:border-dark-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-100">Trip details</p>
                  {constraintCount > 0 ? (
                    <p className="text-xs text-dark-400 mt-0.5">
                      {constraintCount} captured • {hasMinimumInfo ? 'Ready to search' : 'Need origin and destination'}
                    </p>
                  ) : (
                    <p className="text-xs text-dark-400 mt-0.5">No constraints yet — click to review or edit</p>
                  )}
                </div>
                <SlidersHorizontal className="w-4 h-4 text-primary-400" />
              </div>
            </button>

            <button
              onClick={handleGenerateRecommendations}
              disabled={!hasMinimumInfo || isGenerating}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition ${
                !hasMinimumInfo || isGenerating
                  ? 'bg-dark-800 text-dark-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:from-primary-700 hover:to-purple-700'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating...' : 'Generate Recommendations'}
              {!isGenerating && <ArrowRight className="w-4 h-4" />}
            </button>
            </div>
          </div>
        </div>
      </div>

      {isConstraintPanelOpen && (
        <div className="fixed inset-0 z-[60]">
          <button
            className="absolute inset-0 bg-black/60 animate-fade-in-fast"
            aria-label="Close trip details panel"
            onClick={() => setIsConstraintPanelOpen(false)}
          />

          <div className="absolute inset-x-0 bottom-0 h-[88vh] sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:w-[460px] bg-dark-900 border-t sm:border-t-0 sm:border-l border-dark-800 shadow-2xl flex flex-col animate-sheet-enter">
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-800">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-dark-100">Trip details & watches</h3>
                {hasMissingRequiredFields ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {missingRequiredFields.map(field => (
                      <span
                        key={`panel-${field}`}
                        className="inline-flex items-center rounded-full border border-yellow-700/40 bg-yellow-900/20 px-2 py-0.5 text-[11px] text-yellow-200"
                      >
                        Missing: {field}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-dark-400">Only shown when you need it</p>
                )}
              </div>
              <button
                onClick={() => setIsConstraintPanelOpen(false)}
                className="inline-flex items-center justify-center rounded-lg p-2 text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition"
                aria-label="Close trip details panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              <ConstraintSummaryPanel
                constraints={constraints}
                onRemoveConstraint={handleRemoveConstraint}
              />
            </div>

            <RecommendationTrigger
              constraints={constraints}
              onGenerateRecommendations={handleGenerateRecommendations}
              isGenerating={isGenerating}
              watchEmail={watchEmail}
              onWatchEmailChange={setWatchEmail}
              onCreateWatch={handleCreateWatch}
              isCreatingWatch={isCreatingWatch}
              watchStatusMessage={watchStatusMessage}
            />
          </div>
        </div>
      )}
    </div>
  )
}
