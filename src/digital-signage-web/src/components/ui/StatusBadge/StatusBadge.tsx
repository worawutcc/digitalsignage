import { cn } from '@/lib/utils'
import { tv } from 'tailwind-variants'
import { StatusBadgeProps } from './StatusBadge.types'

const statusVariants = tv({
  base: 'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors',
  variants: {
    size: {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    },
    status: {
      // Device statuses
      online: 'bg-green-100 text-green-800 border border-green-200',
      offline: 'bg-gray-100 text-gray-800 border border-gray-200',
      warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      error: 'bg-red-100 text-red-800 border border-red-200',
      maintenance: 'bg-blue-100 text-blue-800 border border-blue-200',
      
      // Schedule statuses
      active: 'bg-green-100 text-green-800 border border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border border-gray-200',
      scheduled: 'bg-blue-100 text-blue-800 border border-blue-200',
      expired: 'bg-red-100 text-red-800 border border-red-200',
      draft: 'bg-gray-100 text-gray-600 border border-gray-200',
      
      // Media statuses
      ready: 'bg-green-100 text-green-800 border border-green-200',
      processing: 'bg-blue-100 text-blue-800 border border-blue-200',
      failed: 'bg-red-100 text-red-800 border border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      
      // Registration statuses
      approved: 'bg-green-100 text-green-800 border border-green-200',
      rejected: 'bg-red-100 text-red-800 border border-red-200',
    },
  },
  defaultVariants: {
    size: 'md',
    status: 'inactive',
  },
})

const pulseVariants: Record<string, string> = {
  online: 'animate-pulse bg-green-500',
  active: 'animate-pulse bg-green-500',
  processing: 'animate-pulse bg-blue-500',
}

/**
 * StatusBadge component for displaying entity status
 * 
 * Unified status indicator for devices, schedules, media, and registrations.
 * Supports multiple sizes, optional animations, and custom labels.
 * 
 * @example
 * ```tsx
 * // Device status
 * <StatusBadge status="online" animated />
 * 
 * // Schedule status
 * <StatusBadge status="scheduled" size="lg" />
 * 
 * // Custom label
 * <StatusBadge status="warning" label="Needs Attention" />
 * ```
 */
export function StatusBadge({
  status,
  size = 'md',
  animated = false,
  label,
  icon,
  className,
}: StatusBadgeProps) {
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1)
  const showPulse = animated && status in pulseVariants

  return (
    <span className={cn(statusVariants({ size, status: status as any }), className)}>
      {showPulse && (
        <span className={cn('h-2 w-2 rounded-full', pulseVariants[status])} />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {displayLabel}
    </span>
  )
}
