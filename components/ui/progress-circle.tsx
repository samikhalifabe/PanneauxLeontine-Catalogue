import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressCircleProps {
  progress: number // 0 to 100
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
  className?: string
  strokeWidth?: number
}

export function ProgressCircle({ 
  progress, 
  size = 'md', 
  showPercentage = true, 
  className,
  strokeWidth = 8 
}: ProgressCircleProps) {
  const sizes = {
    sm: { width: 'w-12 h-12', text: 'text-xs' },
    md: { width: 'w-16 h-16', text: 'text-sm' },
    lg: { width: 'w-20 h-20', text: 'text-base' }
  }
  
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - Math.max(0, Math.min(100, progress)) / 100)
  
  return (
    <div className={cn("relative", sizes[size].width, className)}>
      <svg 
        className={cn("transform -rotate-90", sizes[size].width)} 
        viewBox="0 0 100 100"
      >
        {/* Cercle de fond */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Cercle de progression */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className="text-primary transition-all duration-500 ease-out"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset
          }}
        />
      </svg>
      
      {/* Pourcentage au centre */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold text-gray-700", sizes[size].text)}>
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  )
} 