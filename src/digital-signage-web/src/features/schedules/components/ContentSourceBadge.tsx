'use client'

import { User, Users, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ContentSourceBadgeProps {
  /**
   * Content source type determines the badge color and label
   */
  contentSource: 'User' | 'Group' | 'Default'
  
  /**
   * Whether to show tooltip on hover
   * @default true
   */
  showTooltip?: boolean
  
  /**
   * Additional CSS classes
   */
  className?: string
}

const sourceConfig = {
  User: {
    icon: User,
    label: 'User',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
    tooltip: 'Content assigned directly to this user (highest priority)',
  },
  Group: {
    icon: Users,
    label: 'Group',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-300',
    borderColor: 'border-green-200 dark:border-green-800',
    tooltip: 'Content assigned through device group (medium priority)',
  },
  Default: {
    icon: Shield,
    label: 'Default',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-700 dark:text-gray-300',
    borderColor: 'border-gray-200 dark:border-gray-700',
    tooltip: 'Default fallback content (lowest priority)',
  },
}

/**
 * ContentSourceBadge Component
 * 
 * Displays a badge indicating the source/priority of content assignment.
 * Color-coded: Blue (User), Green (Group), Gray (Default).
 * 
 * @example
 * ```tsx
 * <ContentSourceBadge contentSource="User" />
 * <ContentSourceBadge contentSource="Group" showTooltip={false} />
 * <ContentSourceBadge contentSource="Default" />
 * ```
 * 
 * @see copilot-instructions-web.md - Component Development Rules
 * @see specs/020-phase-1/data-model.md - Content Priority Rules
 */
export function ContentSourceBadge({
  contentSource,
  showTooltip = true,
  className,
}: ContentSourceBadgeProps) {
  const config = sourceConfig[contentSource]
  const Icon = config.icon
  
  return (
    <div
      data-testid="content-source-badge"
      data-source={contentSource}
      className={cn('group relative inline-flex', className)}
    >
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
          config.bgColor,
          config.textColor,
          config.borderColor,
          'transition-colors'
        )}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
      
      {/* Tooltip */}
      {showTooltip && (
        <div
          className={cn(
            'pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2',
            'w-48 rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg',
            'opacity-0 transition-opacity group-hover:opacity-100',
            'dark:bg-gray-700'
          )}
          role="tooltip"
        >
          {config.tooltip}
          <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
        </div>
      )}
    </div>
  )
}

export default ContentSourceBadge
