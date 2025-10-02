'use client'

/**
 * DefaultScheduleToggle Component
 * 
 * Inline toggle for setting a schedule as default with visual badge.
 * Business Rule: Only ONE schedule can be default at a time.
 * 
 * @see copilot-instructions-web.md - Component Development Rules
 * @see specs/020-phase-1/data-model.md - Default Schedule Rules
 */

import { Shield, Loader2 } from 'lucide-react'
import { DefaultScheduleToggleProps } from './DefaultScheduleToggle.types'
import { cn } from '@/lib/utils'
import { useSetDefaultSchedule } from '@/features/schedules/hooks/useSetDefaultSchedule'

export function DefaultScheduleToggle({
  scheduleId,
  isDefault,
  className,
}: DefaultScheduleToggleProps) {
  const setDefaultSchedule = useSetDefaultSchedule()
  
  const isLoading = setDefaultSchedule.isPending
  
  const handleToggle = () => {
    if (!isLoading) {
      setDefaultSchedule.mutate({
        scheduleId,
        isDefault: !isDefault,
      })
    }
  }

  return (
    <div 
      data-testid="default-schedule-toggle" 
      className={cn('inline-flex items-center', className)}
    >
      {isDefault ? (
        <span
          data-testid="default-badge"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1',
            'border-blue-200 bg-blue-100 text-blue-700',
            'dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            'text-xs font-medium'
          )}
        >
          <Shield className="h-3 w-3" />
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
            'text-xs font-medium transition-colors',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          )}
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
    </div>
  )
}

