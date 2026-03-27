'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage as ChatMessageType, QuickReply } from '@/types'
import ChatMessage from './ChatMessage'
import { Send, Sparkles, Plane } from 'lucide-react'

interface ChatPanelProps {
  messages: ChatMessageType[]
  onSendMessage: (message: string) => void
  onQuickReply?: (reply: QuickReply) => void
}

export default function ChatPanel({ messages, onSendMessage, onQuickReply }: ChatPanelProps) {
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
    <div className="flex flex-col h-full min-h-0 rounded-3xl border border-dark-800 bg-gradient-to-b from-dark-900/95 to-dark-950 shadow-[0_20px_55px_-35px_rgba(56,189,248,0.45)] overflow-hidden">
      {/* Header */}
      <div className="border-b border-dark-800 px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-semibold text-dark-50">Roamly Assistant</h2>
          </div>
          <div className="relative hidden sm:flex items-center w-32">
            <div className="w-full border-t border-dashed border-primary-700/60" />
            <Plane className="w-3.5 h-3.5 text-primary-400 absolute right-0 animate-float-soft" />
          </div>
        </div>
        <p className="text-sm text-dark-400">
          Tell me your route naturally. I&apos;ll help shape the trip as we chat.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-5 py-5 sm:px-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Sparkles className="w-12 h-12 text-primary-700/70 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-200 mb-2">
                Start your journey
              </h3>
              <p className="text-sm text-dark-500 leading-relaxed">
                Try something simple like: &quot;I want to fly from Phoenix to New York next month under $400.&quot;
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
      <div className="border-t border-dark-800 px-5 py-4 sm:px-6">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., I want to fly from NYC to Tokyo next month..."
            className="flex-1 bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none min-h-[50px] max-h-[120px]"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-dark-800 disabled:text-dark-600 text-white px-4 py-3 rounded-xl transition flex items-center justify-center"
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
