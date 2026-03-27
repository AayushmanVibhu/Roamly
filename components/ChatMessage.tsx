import { ChatMessage as ChatMessageType, QuickReply } from '@/types'
import { Bot, User } from 'lucide-react'

interface ChatMessageProps {
  message: ChatMessageType
  onQuickReply?: (reply: QuickReply) => void
}

export default function ChatMessage({ message, onQuickReply }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant'

  return (
    <div className="space-y-3">
      <div className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
        {isAssistant && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        )}
        
        <div
          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
            isAssistant
              ? 'bg-dark-800/70 text-dark-100 border border-white/10 backdrop-blur-sm'
              : 'bg-primary-700 text-white'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          
          {message.extractedConstraints && Object.keys(message.extractedConstraints).length > 0 && (
            <div className="mt-2 pt-2 border-t border-dark-600">
              <p className="text-xs text-dark-400 mb-1">Extracted:</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(message.extractedConstraints).map(([key, value]) => (
                  <span
                    key={key}
                    className="text-xs bg-primary-900/40 text-primary-300 px-2 py-1 rounded-full"
                  >
                    {key}: {String(value)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {!isAssistant && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Quick Reply Buttons */}
      {isAssistant && message.quickReplies && message.quickReplies.length > 0 && onQuickReply && (
        <div className="flex flex-wrap gap-2 ml-11">
          {message.quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => onQuickReply(reply)}
              className="px-4 py-2 bg-dark-800/60 hover:bg-primary-900/40 border border-white/10 hover:border-primary-700/50 text-dark-200 hover:text-primary-300 rounded-full text-sm transition backdrop-blur-sm"
            >
              {reply.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
