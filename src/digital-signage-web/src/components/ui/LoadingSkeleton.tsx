/**
 * Enhanced Loading Skeleton Components
 * 
 * Provides configurable skeleton placeholders for enhanced user assignment components.
 * Includes skeleton layouts for list, grid, table views with animation and responsive design.
 * 
 * @see specs/021-user-schedule-assignment/tasks.md - T027
 * @see copilot-instructions-ui.instructions.md - Component Development Rules
 */

'use client'

import { cn } from '@/lib/utils'
import { Skeleton } from './Skeleton'

export interface LoadingSkeletonProps {
  /**
   * Layout type for the skeleton
   */
  layout?: 'list' | 'grid' | 'table' | 'card' | 'form'
  
  /**
   * Number of skeleton items to render
   * @default 3
   */
  count?: number
  
  /**
   * Animation style
   * @default 'pulse'
   */
  animation?: 'pulse' | 'wave' | 'shimmer' | 'none'
  
  /**
   * Size variant
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'
  
  /**
   * Enable responsive design adaptations
   * @default true
   */
  responsive?: boolean
  
  /**
   * Custom CSS class
   */
  className?: string
  
  /**
   * Show enhanced loading text
   * @default false
   */
  showLoadingText?: boolean
  
  /**
   * Custom loading message
   */
  loadingMessage?: string
}

/**
 * Enhanced Loading Skeleton Component
 * 
 * Provides intelligent skeleton placeholders that adapt to different layouts
 * and provide enhanced visual feedback during loading states.
 */
export function LoadingSkeleton({
  layout = 'list',
  count = 3,
  animation = 'pulse',
  size = 'md',
  responsive = true,
  className,
  showLoadingText = false,
  loadingMessage = 'Loading...',
}: LoadingSkeletonProps) {
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse', // Could be enhanced with custom wave animation
    shimmer: 'animate-pulse', // Could be enhanced with shimmer effect
    none: '',
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  const baseClasses = cn(
    animationClasses[animation],
    sizeClasses[size],
    responsive && 'transition-all duration-200',
    className
  )

  return (
    <div className={baseClasses} data-testid="loading-skeleton">
      {showLoadingText && (
        <div className="mb-4 text-center">
          <div className="text-gray-500 dark:text-gray-400 font-medium">
            {loadingMessage}
          </div>
        </div>
      )}
      
      {layout === 'list' && <ListSkeleton count={count} size={size} responsive={responsive} />}
      {layout === 'grid' && <GridSkeleton count={count} size={size} responsive={responsive} />}
      {layout === 'table' && <TableSkeleton count={count} size={size} responsive={responsive} />}
      {layout === 'card' && <CardSkeleton count={count} size={size} responsive={responsive} />}
      {layout === 'form' && <FormSkeleton size={size} responsive={responsive} />}
    </div>
  )
}

/**
 * User Assignment List Skeleton
 */
export function UserAssignmentListSkeleton({ 
  count = 5, 
  showBulkActions = false,
  showFilters = false,
  className 
}: { 
  count?: number
  showBulkActions?: boolean
  showFilters?: boolean
  className?: string 
}) {
  return (
    <div className={cn('space-y-4', className)} data-testid="user-assignment-list-skeleton">
      {/* Filters Skeleton */}
      {showFilters && (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-64" /> {/* Search input */}
            <Skeleton className="h-10 w-32" /> {/* Filter dropdown */}
            <Skeleton className="h-10 w-24" /> {/* Sort button */}
          </div>
          <Skeleton className="h-10 w-20" /> {/* Action button */}
        </div>
      )}

      {/* Bulk Actions Skeleton */}
      {showBulkActions && (
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-4 w-4 rounded" /> {/* Checkbox */}
            <Skeleton className="h-5 w-32" /> {/* "X items selected" */}
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-20" /> {/* Bulk assign button */}
            <Skeleton className="h-8 w-20" /> {/* Bulk remove button */}
          </div>
        </div>
      )}

      {/* List Items Skeleton */}
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <Skeleton className="h-4 w-4 rounded" /> {/* Checkbox */}
            <Skeleton className="h-10 w-10 rounded-full" /> {/* Avatar */}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" /> {/* Name */}
              <Skeleton className="h-4 w-32" /> {/* Email or role */}
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-16 rounded-full" /> {/* Status badge */}
              <Skeleton className="h-8 w-8 rounded" /> {/* Action button */}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Schedule Assignment Modal Skeleton
 */
export function ScheduleAssignmentModalSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)} data-testid="schedule-assignment-modal-skeleton">
      {/* Modal Header */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" /> {/* Modal title */}
        <Skeleton className="h-4 w-96" /> {/* Modal description */}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" /> {/* Search input */}
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-24" /> {/* Filter 1 */}
          <Skeleton className="h-8 w-24" /> {/* Filter 2 */}
          <Skeleton className="h-8 w-24" /> {/* Filter 3 */}
        </div>
      </div>

      {/* Schedule List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <Skeleton className="h-4 w-4 rounded" /> {/* Checkbox */}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" /> {/* Schedule name */}
              <div className="flex items-center space-x-4">
                <Skeleton className="h-3 w-20" /> {/* Priority */}
                <Skeleton className="h-3 w-16" /> {/* Status */}
                <Skeleton className="h-3 w-24" /> {/* Duration */}
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" /> {/* Status badge */}
          </div>
        ))}
      </div>

      {/* Modal Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <Skeleton className="h-4 w-32" /> {/* Selection count */}
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-20" /> {/* Cancel button */}
          <Skeleton className="h-10 w-24" /> {/* Assign button */}
        </div>
      </div>
    </div>
  )
}

/**
 * Performance Dashboard Skeleton
 */
export function PerformanceDashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800', className)}>
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-5 w-36" /> {/* Title */}
        <Skeleton className="h-4 w-12" /> {/* Clear button */}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="text-center">
            <Skeleton className="h-6 w-16 mx-auto mb-1" /> {/* Value */}
            <Skeleton className="h-4 w-20 mx-auto" /> {/* Label */}
          </div>
        ))}
      </div>
    </div>
  )
}

// Internal skeleton components
function ListSkeleton({ count, size, responsive }: { count: number; size: string; responsive: boolean }) {
  return (
    <div className="space-y-3" data-testid="list-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function GridSkeleton({ count, size, responsive }: { count: number; size: string; responsive: boolean }) {
  return (
    <div className={cn(
      'grid gap-4',
      responsive && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    )} data-testid="grid-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

function TableSkeleton({ count, size, responsive }: { count: number; size: string; responsive: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden" data-testid="table-skeleton">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-5 w-24" />
          ))}
        </div>
      </div>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {Array.from({ length: 4 }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 w-20" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function CardSkeleton({ count, size, responsive }: { count: number; size: string; responsive: boolean }) {
  return (
    <div className={cn(
      'grid gap-6',
      responsive && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    )} data-testid="card-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="p-6 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="flex items-start justify-between mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-4" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

function FormSkeleton({ size, responsive }: { size: string; responsive: boolean }) {
  return (
    <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg border" data-testid="form-skeleton">
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}