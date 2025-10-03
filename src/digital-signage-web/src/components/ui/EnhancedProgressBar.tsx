/**
 * Enhanced Progress Bar Component
 * 
 * Progress bar component for bulk operations with indeterminate and determinate modes,
 * cancellation functionality, and estimated time remaining display.
 * 
 * @see specs/021-user-schedule-assignment/tasks.md - T030
 * @see copilot-instructions-ui.instructions.md - Component Development Rules
 */

'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { X, Clock, Zap, AlertCircle, CheckCircle, Pause, Play, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EnhancedProgressBarProps {
  /** Current progress value */
  value?: number
  
  /** Maximum progress value */
  max?: number
  
  /** Progress bar mode */
  mode?: 'determinate' | 'indeterminate' | 'buffer'
  
  /** Progress bar variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  
  /** Show percentage text */
  showPercentage?: boolean
  
  /** Show progress value text (e.g., "5 of 10") */
  showValue?: boolean
  
  /** Label text */
  label?: string
  
  /** Description text */
  description?: string
  
  /** Enable cancellation */
  allowCancel?: boolean
  
  /** Cancel button callback */
  onCancel?: () => void
  
  /** Enable pause/resume */
  allowPause?: boolean
  
  /** Pause button callback */
  onPause?: () => void
  
  /** Resume button callback */
  onResume?: () => void
  
  /** Current pause state */
  isPaused?: boolean
  
  /** Show estimated time remaining */
  showEstimatedTime?: boolean
  
  /** Start time for ETA calculation */
  startTime?: Date
  
  /** Custom estimated time (if not auto-calculated) */
  estimatedTimeRemaining?: number
  
  /** Show current operation status */
  currentOperation?: string
  
  /** Progress animation speed */
  animationSpeed?: 'slow' | 'normal' | 'fast'
  
  /** Custom CSS class */
  className?: string
  
  /** Accessibility label */
  'aria-label'?: string
  
  /** Custom actions */
  actions?: Array<{
    label: string
    action: () => void
    icon?: React.ComponentType<{ className?: string }>
    variant?: 'primary' | 'secondary' | 'danger'
  }>
  
  /** Buffer progress (for buffer mode) */
  bufferValue?: number
}

/**
 * Enhanced Progress Bar Component
 * 
 * A comprehensive progress bar with support for different modes, cancellation,
 * pause/resume, time estimation, and custom actions.
 */
export function EnhancedProgressBar({
  value = 0,
  max = 100,
  mode = 'determinate',
  variant = 'default',
  size = 'md',
  showPercentage = true,
  showValue = false,
  label,
  description,
  allowCancel = false,
  onCancel,
  allowPause = false,
  onPause,
  onResume,
  isPaused = false,
  showEstimatedTime = false,
  startTime,
  estimatedTimeRemaining,
  currentOperation,
  animationSpeed = 'normal',
  className,
  'aria-label': ariaLabel,
  actions = [],
  bufferValue = 0,
}: EnhancedProgressBarProps) {
  const [internalStartTime] = useState(() => startTime || new Date())
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null)

  // Calculate progress percentage
  const percentage = useMemo(() => {
    if (mode === 'indeterminate') return 0
    return Math.min(100, Math.max(0, (value / max) * 100))
  }, [value, max, mode])

  // Calculate buffer percentage
  const bufferPercentage = useMemo(() => {
    if (mode !== 'buffer') return 0
    return Math.min(100, Math.max(0, (bufferValue / max) * 100))
  }, [bufferValue, max, mode])

  // Calculate estimated time remaining
  useEffect(() => {
    if (!showEstimatedTime || mode === 'indeterminate' || isPaused) return
    
    if (estimatedTimeRemaining) {
      setEstimatedTime(estimatedTimeRemaining)
      return
    }

    if (value > 0 && percentage > 5) { // Only calculate after some progress
      const elapsed = Date.now() - internalStartTime.getTime()
      const rate = value / elapsed // items per millisecond
      const remaining = max - value
      const estimatedMs = remaining / rate
      setEstimatedTime(estimatedMs)
    }
  }, [value, max, percentage, showEstimatedTime, estimatedTimeRemaining, internalStartTime, mode, isPaused])

  // Get variant-specific classes
  const variantClasses = getVariantClasses(variant)
  const sizeClasses = getSizeClasses(size)
  const animationClasses = getAnimationClasses(animationSpeed)

  return (
    <div 
      className={cn('w-full', className)}
      role="progressbar"
      aria-label={ariaLabel || label || 'Progress'}
      aria-valuenow={mode === 'indeterminate' ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuetext={mode === 'indeterminate' ? 'Loading...' : `${value} of ${max}`}
      data-testid="enhanced-progress-bar"
    >
      {/* Header */}
      {(label || description || showPercentage || showValue || allowCancel || allowPause || actions.length > 0) && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1 min-w-0">
            {label && (
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {label}
              </div>
            )}
            {description && (
              <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {description}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3 ml-4">
            {/* Progress Text */}
            {(showPercentage || showValue) && (
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {showValue && `${value} of ${max}`}
                {showValue && showPercentage && ' • '}
                {showPercentage && mode !== 'indeterminate' && `${Math.round(percentage)}%`}
                {showPercentage && mode === 'indeterminate' && 'Loading...'}
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center space-x-1">
              {allowPause && (
                <button
                  onClick={isPaused ? onResume : onPause}
                  className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  aria-label={isPaused ? 'Resume' : 'Pause'}
                  disabled={!onPause || !onResume}
                >
                  {isPaused ? (
                    <Play className="h-4 w-4" />
                  ) : (
                    <Pause className="h-4 w-4" />
                  )}
                </button>
              )}

              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={cn(
                    'p-1 transition-colors',
                    getActionButtonClasses(action.variant || 'secondary')
                  )}
                  aria-label={action.label}
                >
                  {action.icon ? (
                    <action.icon className="h-4 w-4" />
                  ) : (
                    <span className="text-xs">{action.label}</span>
                  )}
                </button>
              ))}

              {allowCancel && (
                <button
                  onClick={onCancel}
                  className="p-1 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                  aria-label="Cancel operation"
                  disabled={!onCancel}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar Container */}
      <div className={cn('relative overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700', sizeClasses.container)}>
        {/* Buffer Progress (for buffer mode) */}
        {mode === 'buffer' && (
          <div 
            className="absolute top-0 left-0 h-full bg-gray-300 dark:bg-gray-600 transition-all duration-300"
            style={{ width: `${bufferPercentage}%` }}
          />
        )}

        {/* Main Progress */}
        <div 
          className={cn(
            'h-full transition-all',
            variantClasses.bar,
            animationClasses,
            mode === 'indeterminate' && 'animate-pulse',
            isPaused && 'opacity-75'
          )}
          style={{ 
            width: mode === 'indeterminate' ? '100%' : `${percentage}%`,
            ...(mode === 'indeterminate' && {
              background: 'linear-gradient(90deg, transparent, currentColor, transparent)',
              animation: 'progress-slide 2s infinite'
            })
          }}
        />

        {/* Indeterminate Animation Overlay */}
        {mode === 'indeterminate' && (
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className={cn('h-full w-1/3 opacity-75', variantClasses.bar)}
              style={{
                animation: 'progress-slide 2s infinite linear',
                background: 'linear-gradient(90deg, transparent, currentColor, transparent)'
              }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      {(currentOperation || showEstimatedTime) && (
        <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex-1 truncate">
            {currentOperation && (
              <span className="flex items-center">
                {isPaused ? (
                  <Pause className="h-3 w-3 mr-1 flex-shrink-0" />
                ) : (
                  <Zap className="h-3 w-3 mr-1 flex-shrink-0" />
                )}
                {currentOperation}
              </span>
            )}
          </div>
          
          {showEstimatedTime && estimatedTime && !isPaused && (
            <div className="flex items-center whitespace-nowrap ml-2">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(estimatedTime)} remaining
            </div>
          )}
          
          {isPaused && (
            <div className="flex items-center whitespace-nowrap ml-2 text-yellow-600 dark:text-yellow-400">
              <Pause className="h-3 w-3 mr-1" />
              Paused
            </div>
          )}
        </div>
      )}

      {/* CSS for indeterminate animation */}
      <style jsx>{`
        @keyframes progress-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  )
}

/**
 * Bulk Operation Progress Component
 * Specialized progress bar for bulk operations with built-in cancellation and retry
 */
export interface BulkOperationProgressProps {
  /** Operation type (e.g., "Assigning schedules", "Removing users") */
  operationType: string
  
  /** Items being processed */
  items: Array<{ id: string; name: string; status?: 'pending' | 'processing' | 'success' | 'error' }>
  
  /** Current processing index */
  currentIndex: number
  
  /** Processing start time */
  startTime?: Date
  
  /** Cancel callback */
  onCancel?: () => void
  
  /** Retry failed items callback */
  onRetryFailed?: () => void
  
  /** Pause callback */
  onPause?: () => void
  
  /** Resume callback */
  onResume?: () => void
  
  /** Current pause state */
  isPaused?: boolean
}

export function BulkOperationProgress({
  operationType,
  items,
  currentIndex,
  startTime,
  onCancel,
  onRetryFailed,
  onPause,
  onResume,
  isPaused = false,
}: BulkOperationProgressProps) {
  const completedItems = items.filter(item => 
    item.status === 'success' || item.status === 'error'
  ).length
  
  const successfulItems = items.filter(item => item.status === 'success').length
  const failedItems = items.filter(item => item.status === 'error').length
  
  const currentItem = items[currentIndex]
  const isComplete = completedItems === items.length
  
  // Determine variant based on results
  const variant = useMemo(() => {
    if (!isComplete) return 'info'
    if (failedItems === 0) return 'success'
    if (successfulItems === 0) return 'error'
    return 'warning'
  }, [isComplete, failedItems, successfulItems])

  const actions = useMemo(() => {
    const actionList = []
    
    if (isComplete && failedItems > 0 && onRetryFailed) {
      actionList.push({
        label: 'Retry Failed',
        action: onRetryFailed,
        icon: RotateCcw,
        variant: 'primary' as const,
      })
    }
    
    return actionList
  }, [isComplete, failedItems, onRetryFailed])

  // Prepare props conditionally to avoid undefined values
  const progressBarProps: any = {
    value: completedItems,
    max: items.length,
    variant,
    size: "md" as const,
    showValue: true,
    showPercentage: true,
    label: operationType,
    allowCancel: !isComplete && !!onCancel,
    onCancel,
    allowPause: !isComplete && !!onPause && !!onResume,
    onPause,
    onResume,
    isPaused,
    showEstimatedTime: !isComplete,
    startTime,
    actions,
  }

  // Only add optional props if they have values
  if (isComplete) {
    progressBarProps.description = `Complete: ${successfulItems} successful${failedItems > 0 ? `, ${failedItems} failed` : ''}`
  }

  if (!isComplete && currentItem) {
    progressBarProps.currentOperation = `Processing ${currentItem.name}...`
  }

  return <EnhancedProgressBar {...progressBarProps} />
}

/**
 * Simple Progress Ring Component
 * Circular progress indicator for compact spaces
 */
export interface ProgressRingProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  showPercentage?: boolean
  className?: string
}

export function ProgressRing({
  value,
  max = 100,
  size = 64,
  strokeWidth = 4,
  variant = 'default',
  showPercentage = false,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
  
  const variantClasses = getVariantClasses(variant)

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        data-testid="progress-ring"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={0}
          strokeLinecap="round"
          className={cn('transition-all duration-300', variantClasses.ring)}
        />
      </svg>
      
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  )
}

// Helper functions
function getVariantClasses(variant: string) {
  const variants = {
    default: {
      bar: 'bg-blue-600 dark:bg-blue-500',
      ring: 'text-blue-600 dark:text-blue-500',
    },
    success: {
      bar: 'bg-green-600 dark:bg-green-500',
      ring: 'text-green-600 dark:text-green-500',
    },
    warning: {
      bar: 'bg-yellow-600 dark:bg-yellow-500',
      ring: 'text-yellow-600 dark:text-yellow-500',
    },
    error: {
      bar: 'bg-red-600 dark:bg-red-500',
      ring: 'text-red-600 dark:text-red-500',
    },
    info: {
      bar: 'bg-blue-600 dark:bg-blue-500',
      ring: 'text-blue-600 dark:text-blue-500',
    },
  }
  
  return variants[variant as keyof typeof variants] || variants.default
}

function getSizeClasses(size: string) {
  const sizes = {
    sm: {
      container: 'h-2',
    },
    md: {
      container: 'h-3',
    },
    lg: {
      container: 'h-4',
    },
  }
  
  return sizes[size as keyof typeof sizes] || sizes.md
}

function getAnimationClasses(speed: string) {
  const speeds = {
    slow: 'duration-700',
    normal: 'duration-500',
    fast: 'duration-300',
  }
  
  return speeds[speed as keyof typeof speeds] || speeds.normal
}

function getActionButtonClasses(variant: string) {
  const variants = {
    primary: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200',
    secondary: 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
    danger: 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200',
  }
  
  return variants[variant as keyof typeof variants] || variants.secondary
}

function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60) 
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}