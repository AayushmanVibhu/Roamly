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
    <div className="glass-panel flex h-full min-h-0 flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-300" />
            <h2 className="text-lg font-semibold text-white">Roamly Assistant</h2>
          </div>
          <div className="relative hidden sm:flex items-center w-32">
            <div className="w-full border-t border-dashed border-sky-300/30" />
            <Plane className="absolute right-0 h-3.5 w-3.5 animate-float-soft text-sky-300" />
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Tell me your route naturally. I&apos;ll help shape the trip as we chat.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-5 py-5 sm:px-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-sky-300/50" />
              <h3 className="mb-2 text-lg font-medium text-slate-100">
                Start your journey
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">
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
      <div className="border-t border-white/10 px-5 py-4 sm:px-6">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., I want to fly from NYC to Tokyo next month..."
            className="min-h-[50px] max-h-[120px] flex-1 resize-none rounded-xl border border-white/10 bg-[rgba(6,12,26,0.82)] px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-300/20"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex items-center justify-center rounded-xl bg-sky-300 px-4 py-3 text-slate-950 transition hover:bg-sky-200 disabled:bg-white/8 disabled:text-slate-600"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-500">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  )
}
