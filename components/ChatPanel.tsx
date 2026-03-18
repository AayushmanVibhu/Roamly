'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage as ChatMessageType, TravelConstraints, QuickReply } from '@/types'
import ChatMessage from './ChatMessage'
import QuickConstraintButtons from './QuickConstraintButtons'
import { Send, Sparkles } from 'lucide-react'

interface ChatPanelProps {
  messages: ChatMessageType[]
  onSendMessage: (message: string) => void
  onQuickConstraint: (field: keyof TravelConstraints, value: any, message: string) => void
  onQuickReply?: (reply: QuickReply) => void
}

export default function ChatPanel({ messages, onSendMessage, onQuickConstraint, onQuickReply }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-dark-900">
      {/* Header */}
      <div className="border-b border-dark-700 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-dark-50">AI Travel Assistant</h2>
        </div>
        <p className="text-sm text-dark-400">
          Tell me about your trip and I&apos;ll help you find the best options
        </p>
      </div>

      {/* Quick Constraint Buttons */}
      <QuickConstraintButtons onConstraintClick={onQuickConstraint} />

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Sparkles className="w-12 h-12 text-dark-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-300 mb-2">
                Start your journey
              </h3>
              <p className="text-sm text-dark-500">
                Type where you want to go, or use the quick buttons above to set your preferences
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} onQuickReply={onQuickReply} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-dark-700 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., I want to fly from NYC to Tokyo next month..."
            className="flex-1 bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none min-h-[48px] max-h-[120px]"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-dark-800 disabled:text-dark-600 text-white px-4 py-3 rounded-lg transition flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-xs text-dark-500 mt-2">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  )
}
