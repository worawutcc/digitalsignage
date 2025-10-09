'use client'

import { Button } from './Button'
import { cn } from '@/lib/utils'
import { EmptyStateProps } from './EmptyState.types'

/**
 * EmptyState Component
 * 
 * A reusable empty state component for displaying when no data is available.
 * Includes an icon, title, optional description, and optional action button.
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Calendar}
 *   title="No schedules assigned"
 *   description="This user doesn't have any schedules assigned yet."
 *   action={{
 *     label: "Assign Schedules",
 *     onClick: () => openModal(),
 *   }}
 * />
 * ```
 * 
 * @see copilot-instructions-web.md - Component Development Rules
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      data-testid="empty-state"
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
    >
      {/* Icon */}
      <div className="mb-4 rounded-full bg-gray-100 p-6 dark:bg-gray-800">
        <Icon className="h-12 w-12 text-gray-400 dark:text-gray-600" />
      </div>
      
      {/* Title */}
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      
      {/* Description */}
      {description && (
        <p className="mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      
      {/* Action Button */}
      {action && (
        <Button
          variant={action.variant || 'default'}
          onClick={() => {
            console.log('🔘 EmptyState button clicked!');
            action.onClick?.();
          }}
          data-testid="empty-state-action"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
