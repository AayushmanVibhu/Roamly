'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChatMessage, TravelConstraints, QuickReply } from '@/types'
import ChatPanel from '@/components/ChatPanel'
import ConstraintSummaryPanel from '@/components/ConstraintSummaryPanel'
import RecommendationTrigger from '@/components/RecommendationTrigger'
import SiteHeader from '@/components/SiteHeader'
import { extractConstraints, generateConfirmation } from '@/lib/constraintExtractor'
import { 
  convertConstraintsToPreferences, 
  validateConstraints, 
  saveTripPreferences 
} from '@/lib/tripPreferencesUtils'
import { SlidersHorizontal, X, Sparkles } from 'lucide-react'

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
        "👋 Hi! I'm your AI travel assistant. I'll help you find the perfect flights step by step.\n\nYou can chat naturally like:\n• \"I want to fly from Phoenix to New York next month under $400\"\n\nI’ll ask follow-up questions only when needed.",
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
  const hasMinimumInfo = validateConstraints(constraints).isValid

  useEffect(() => {
    const seededPrompt = sessionStorage.getItem('roamlyChatPrompt')
    if (seededPrompt?.trim()) {
      handleSendMessage(seededPrompt.trim())
      sessionStorage.removeItem('roamlyChatPrompt')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    <div className="app-shell flex flex-col">
      <SiteHeader />

      {/* Main Content - Chat First */}
      <div className="app-content flex-1 min-h-0 overflow-hidden py-4 sm:py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="eyebrow">
              <Sparkles className="h-3.5 w-3.5" />
              Conversational trip intake
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Share the route naturally and tighten the watch details only when you need to.
            </p>
          </div>
          <button
            onClick={() => setIsConstraintPanelOpen(true)}
            className="action-secondary px-4 py-2.5 text-xs sm:text-sm"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Trip details
          </button>
        </div>
        <div className="mx-auto h-[calc(100vh-16rem)] max-w-4xl">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            onQuickReply={handleQuickReply}
          />
        </div>
      </div>

      <div className="border-t border-white/10 bg-[rgba(6,12,26,0.76)] px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="app-content flex max-w-4xl items-center gap-3 px-0">
          <button
            onClick={() => setIsConstraintPanelOpen(true)}
            className="action-secondary px-4 py-2.5"
          >
            <SlidersHorizontal className="w-4 h-4 text-sky-200" />
            Trip details
          </button>
          <button
            onClick={handleGenerateRecommendations}
            disabled={isGenerating}
            className={`ml-auto inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
              isGenerating
                ? 'bg-white/8 text-slate-500 cursor-not-allowed'
                : hasMinimumInfo
                  ? 'bg-sky-300 text-slate-950 hover:bg-sky-200'
                  : 'bg-white/8 text-slate-300 hover:bg-white/12'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : hasMinimumInfo ? 'Generate recommendations' : 'Complete trip details'}
          </button>
        </div>
      </div>

      {isConstraintPanelOpen && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
          <button
            onClick={() => setIsConstraintPanelOpen(false)}
            className="absolute inset-0 bg-black/60"
            aria-label="Close trip details panel"
          />
          <div className="relative w-full overflow-hidden rounded-t-3xl border border-white/10 bg-[rgba(7,14,30,0.96)] shadow-2xl animate-sheet-enter sm:max-w-lg sm:rounded-3xl max-h-[88vh]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Trip details</h3>
                <p className="text-xs text-slate-400">Open only when you need it</p>
              </div>
              <button
                onClick={() => setIsConstraintPanelOpen(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/8 hover:text-white"
                aria-label="Close trip details panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[calc(88vh-3.5rem)] overflow-y-auto">
              <ConstraintSummaryPanel
                constraints={constraints}
                onRemoveConstraint={handleRemoveConstraint}
              />
            </div>
            <div className="border-t border-white/10 p-3">
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
        </div>
      )}
    </div>
  )
}
