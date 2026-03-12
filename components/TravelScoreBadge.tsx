import { Award } from 'lucide-react'

interface TravelScoreBadgeProps {
  score: number // 0-100
  size?: 'small' | 'medium' | 'large'
  showLabel?: boolean
}

/**
 * TravelScoreBadge Component
 * Displays a visual score indicator for travel options
 */
export default function TravelScoreBadge({ 
  score, 
  size = 'medium', 
  showLabel = true 
}: TravelScoreBadgeProps) {
  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 90) return 'text-green-400 bg-green-900/30 border-green-500'
    if (score >= 80) return 'text-blue-400 bg-blue-900/30 border-blue-500'
    if (score >= 70) return 'text-yellow-400 bg-yellow-900/30 border-yellow-500'
    return 'text-orange-400 bg-orange-900/30 border-orange-500'
  }

  const getScoreLabel = () => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Great'
    if (score >= 70) return 'Good'
    return 'Fair'
  }

  const sizeClasses = {
    small: 'w-12 h-12 text-sm',
    medium: 'w-16 h-16 text-lg',
    large: 'w-20 h-20 text-2xl'
  }

  const labelSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  }

  return (
    <div className="flex items-center gap-3">
      <div
        className={`
          ${sizeClasses[size]}
          ${getScoreColor()}
          rounded-full
          border-2
          flex
          items-center
          justify-center
          font-bold
          relative
        `}
      >
        {score}
        {score >= 90 && (
          <Award className="w-4 h-4 absolute -top-1 -right-1 text-yellow-500" />
        )}
      </div>
      {showLabel && (
        <div>
          <div className={`font-bold text-dark-50 ${labelSizeClasses[size]}`}>
            {getScoreLabel()} Value
          </div>
          <div className={`text-dark-400 ${labelSizeClasses[size]}`}>
            Overall Score
          </div>
        </div>
      )}
    </div>
  )
}
