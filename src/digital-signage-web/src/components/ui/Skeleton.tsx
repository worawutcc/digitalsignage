/**
 * Skeleton Component
 * 
 * Loading skeleton component for async content.
 * Provides visual feedback while data is loading.
 * 
 * @see specs/020-phase-1/tasks.md - T054 Loading Skeletons
 * @see copilot-instructions-web.md - Component Development Rules
 */

import { cn } from '@/lib/utils'

export interface SkeletonProps {
  /**
   * CSS class name for styling
   */
  className?: string
  
  /**
   * Number of skeleton items to render
   * @default 1
   */
  count?: number
}

/**
 * Base Skeleton Component
 * 
 * Displays an animated loading placeholder.
 * 
 * @example
 * ```tsx
 * <Skeleton className="h-4 w-32" />
 * <Skeleton className="h-20 w-full" count={3} />
 * ```
 */
export function Skeleton({ className, count = 1 }: SkeletonProps) {
  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
              className
            )}
          />
        ))}
      </>
    )
  }
  
  return (
    <div
      data-testid="skeleton"
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
    />
  )
}

/**
 * Skeleton Card Component
 * 
 * Pre-styled skeleton for card layouts.
 * Commonly used for schedule cards, user cards, etc.
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      data-testid="skeleton-card"
      className={cn(
        'rounded-lg border border-gray-200 p-4 space-y-3 dark:border-gray-700',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

/**
 * Skeleton List Component
 * 
 * Pre-styled skeleton for list items.
 * Commonly used for schedule lists, user lists, etc.
 */
export function SkeletonList({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div data-testid="skeleton-list" className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}

/**
 * Skeleton Table Row Component
 * 
 * Pre-styled skeleton for table rows.
 */
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <div data-testid="skeleton-table-row" className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} className="h-4 flex-1" />
      ))}
    </div>
  )
}

/**
 * Skeleton Avatar Component
 * 
 * Pre-styled skeleton for avatar/profile pictures.
 */
export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  }
  
  return (
    <Skeleton 
      data-testid="skeleton-avatar"
      className={cn('rounded-full', sizeClasses[size])} 
    />
  )
}

/**
 * Skeleton Text Component
 * 
 * Pre-styled skeleton for text content.
 */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div data-testid="skeleton-text" className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index} 
          className={cn(
            'h-4',
            index === lines - 1 ? 'w-2/3' : 'w-full' // Last line shorter
          )} 
        />
      ))}
    </div>
  )
}
