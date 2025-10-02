'use client'

/**
 * AssignedSchedulesList Component
 * 
 * Displays list of schedules assigned to a user with proper styling.
 * Shows schedule details, metadata, and provides a "Remove All" action.
 * 
 * @see copilot-instructions-web.md - Component Development Rules
 */

import { Calendar, Clock, User, AlertCircle } from 'lucide-react'
import { AssignedSchedulesListProps } from './AssignedSchedulesList.types'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

export function AssignedSchedulesList({
  schedules,
  isLoading = false,
  onRemoveAll,
  disableRemove = false,
  className,
}: AssignedSchedulesListProps) {
  // Loading state with skeleton (T054)
  if (isLoading) {
    return (
      <div data-testid="loading-skeleton" className={cn('grid gap-4 sm:grid-cols-1 lg:grid-cols-2', className)}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  // Empty state
  if (schedules.length === 0) {
    return (
      <div data-testid="empty-state">
        <EmptyState
          icon={Calendar}
          title="No schedules assigned"
          description="This user doesn't have any content schedules assigned yet. Click 'Assign Schedules' to get started."
          {...(className && { className })}
        />
      </div>
    )
  }

  return (
    <div data-testid="schedules-list" className={cn('space-y-6', className)}>
      {/* Schedules Grid */}
      <div data-testid="schedules-grid" className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            data-testid={`schedule-card-${schedule.id}`}
            className={cn(
              'rounded-lg border p-4 transition-all hover:shadow-md',
              schedule.isActive
                ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20'
                : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
            )}
          >
            {/* Header */}
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {schedule.name}
                </h3>
                {schedule.description && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {schedule.description}
                  </p>
                )}
              </div>
              <span
                data-testid={`schedule-status-${schedule.id}`}
                className={cn(
                  'ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  schedule.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                )}
              >
                {schedule.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Schedule Details */}
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {/* Dates */}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {schedule.startDate}
                  {schedule.endDate && ` - ${schedule.endDate}`}
                </span>
              </div>

              {/* Assigned By */}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Assigned by: {schedule.createdBy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Remove All Button */}
      <div className="flex items-center justify-between border-t pt-4 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <AlertCircle className="h-4 w-4" />
          <span>{schedules.length} schedule(s) assigned</span>
        </div>
        <Button
          data-testid="remove-all-button"
          onClick={onRemoveAll}
          disabled={disableRemove}
          variant="destructive"
        >
          Remove All Schedules
        </Button>
      </div>
    </div>
  )
}

