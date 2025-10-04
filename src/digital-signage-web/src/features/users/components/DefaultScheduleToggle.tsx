'use client'

/**
 * DefaultScheduleToggle Component
 * 
 * Enhanced toggle for setting a schedule as default with visual feedback,
 * optimistic updates, and enhanced confirmation dialog.
 * Business Rule: Only ONE schedule can be default at a time.
 * 
 * @see copilot-instructions-web.md - Component Development Rules
 * @see specs/020-phase-1/data-model.md - Default Schedule Rules
 */

import React, { useState, useCallback, useEffect } from 'react'
import { Shield, Loader2, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { DefaultScheduleToggleProps } from './DefaultScheduleToggle.types'
import { cn } from '@/lib/utils'
import { useSetDefaultSchedule } from '@/features/schedules/hooks/useSetDefaultSchedule'

// Enhanced props interface (inline definition for simplicity)
interface EnhancedDefaultScheduleToggleProps extends DefaultScheduleToggleProps {
  // Enhanced confirmation
  /** Show confirmation dialog for changes */
  showConfirmation?: boolean
  /** Custom confirmation message */
  confirmationMessage?: string
  
  // Optimistic updates
  /** Enable optimistic updates */
  enableOptimisticUpdates?: boolean
  /** Callback when optimistic update starts */
  onOptimisticStart?: (scheduleId: number, willBeDefault: boolean) => void
  /** Callback when optimistic update reverts */
  onOptimisticRevert?: (scheduleId: number, error: Error) => void
  
  // Visual feedback
  /** Show success animation */
  showSuccessAnimation?: boolean
  /** Show tooltip with additional info */
  showTooltip?: boolean
  /** Custom tooltip text */
  tooltipText?: string
  
  // Enhanced accessibility
  /** Enhanced aria labels */
  enhancedAriaLabels?: boolean
  /** Detailed description for screen readers */
  description?: string
  
  // Analytics and monitoring
  /** Track toggle interactions */
  enableAnalytics?: boolean
  /** Custom analytics event name */
  analyticsEvent?: string
  /** Analytics callback */
  onAnalyticsEvent?: (eventName: string, data: any) => void
}

export function DefaultScheduleToggle({
  scheduleId,
  isDefault,
  className,
  // Enhanced props with defaults
  showConfirmation = false,
  confirmationMessage,
  enableOptimisticUpdates = true,
  onOptimisticStart,
  onOptimisticRevert,
  showSuccessAnimation = true,
  showTooltip = false,
  tooltipText,
  enhancedAriaLabels = true,
  description,
  enableAnalytics = false,
  analyticsEvent = 'default_schedule_toggle',
  onAnalyticsEvent,
}: EnhancedDefaultScheduleToggleProps) {
  const setDefaultSchedule = useSetDefaultSchedule()
  
  // Enhanced state management
  const [optimisticState, setOptimisticState] = useState<boolean | null>(null)
  const [showSuccessIndicator, setShowSuccessIndicator] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  
  const isLoading = setDefaultSchedule.isPending
  const effectiveIsDefault = enableOptimisticUpdates && optimisticState !== null ? optimisticState : isDefault
  
  // Reset optimistic state when real state updates
  useEffect(() => {
    if (optimisticState !== null && !isLoading) {
      if (optimisticState === isDefault) {
        // Success - show animation if enabled
        if (showSuccessAnimation) {
          setShowSuccessIndicator(true)
          setTimeout(() => setShowSuccessIndicator(false), 2000)
        }
      } else {
        // Revert optimistic update
        onOptimisticRevert?.(scheduleId, new Error('Default schedule update failed'))
      }
      setOptimisticState(null)
    }
  }, [isDefault, isLoading, optimisticState, showSuccessAnimation, onOptimisticRevert, scheduleId])
  
  // Enhanced toggle handler
  const handleToggle = useCallback(() => {
    if (isLoading) return
    
    const willBeDefault = !effectiveIsDefault
    
    // Analytics tracking
    if (enableAnalytics && onAnalyticsEvent) {
      onAnalyticsEvent(analyticsEvent, {
        scheduleId,
        fromDefault: effectiveIsDefault,
        toDefault: willBeDefault,
        timestamp: Date.now()
      })
    }
    
    // Confirmation dialog
    if (showConfirmation && willBeDefault) {
      setShowConfirmDialog(true)
      return
    }
    
    executeToggle(willBeDefault)
  }, [
    isLoading, 
    effectiveIsDefault, 
    enableAnalytics, 
    onAnalyticsEvent, 
    analyticsEvent, 
    scheduleId, 
    showConfirmation,
    enableOptimisticUpdates,
    onOptimisticStart,
    setDefaultSchedule
  ])
  
  // Execute the toggle action
  const executeToggle = useCallback((willBeDefault: boolean) => {
    // Optimistic update
    if (enableOptimisticUpdates) {
      setOptimisticState(willBeDefault)
      onOptimisticStart?.(scheduleId, willBeDefault)
    }
    
    // Execute mutation
    setDefaultSchedule.mutate({
      scheduleId,
      isDefault: willBeDefault,
    })
    
    setShowConfirmDialog(false)
  }, [enableOptimisticUpdates, onOptimisticStart, scheduleId, setDefaultSchedule])
  
  // Enhanced accessibility attributes
  const getAriaAttributes = useCallback(() => {
    const base = {
      'aria-describedby': description ? `default-toggle-desc-${scheduleId}` : undefined,
    }
    
    if (enhancedAriaLabels) {
      return {
        ...base,
        'aria-label': effectiveIsDefault 
          ? `Remove default status from schedule ${scheduleId}` 
          : `Set schedule ${scheduleId} as default`,
        'aria-pressed': effectiveIsDefault,
        'role': 'switch'
      }
    }
    
    return base
  }, [description, scheduleId, enhancedAriaLabels, effectiveIsDefault])

  return (
    <>
      <div 
        data-testid="default-schedule-toggle" 
        className={cn('inline-flex items-center relative', className)}
        title={showTooltip ? (tooltipText || (effectiveIsDefault ? 'This is the default schedule' : 'Click to set as default')) : undefined}
      >
        {effectiveIsDefault ? (
          <span
            data-testid="default-badge"
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1',
              'border-blue-200 bg-blue-100 text-blue-700',
              'dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
              'text-xs font-medium transition-all',
              showSuccessIndicator && 'ring-2 ring-green-500 ring-opacity-50'
            )}
            {...getAriaAttributes()}
          >
            {showSuccessIndicator ? (
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            ) : (
              <Shield className="h-3 w-3" />
            )}
            Default Schedule
          </span>
        ) : (
          <button
            data-testid="set-default-button"
            onClick={handleToggle}
            disabled={isLoading}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border px-3 py-1',
              'border-gray-300 bg-white text-gray-700',
              'hover:bg-gray-50 hover:border-gray-400',
              'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300',
              'dark:hover:bg-gray-700 dark:hover:border-gray-500',
              'text-xs font-medium transition-all duration-200',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              optimisticState !== null && 'ring-2 ring-blue-400 ring-opacity-50'
            )}
            {...getAriaAttributes()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Setting...
              </>
            ) : (
              <>
                <Shield className="h-3 w-3" />
                Set as Default
              </>
            )}
          </button>
        )}
        
        {/* Description for screen readers */}
        {description && (
          <span 
            id={`default-toggle-desc-${scheduleId}`}
            className="sr-only"
          >
            {description}
          </span>
        )}
      </div>

      {/* Enhanced Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Set as Default Schedule
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {confirmationMessage || 
                    'This will replace any existing default schedule. Only one schedule can be the default at a time.'
                  }
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => executeToggle(true)}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Set as Default
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

