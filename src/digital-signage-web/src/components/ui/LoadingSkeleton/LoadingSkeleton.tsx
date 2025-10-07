import { cn } from '@/lib/utils'
import { LoadingSkeletonProps } from './LoadingSkeleton.types'

/**
 * Skeleton loader component for loading states
 * 
 * Provides consistent loading UI across the application with multiple variants.
 * Supports different layouts (card, table, list) and custom sizing.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <LoadingSkeleton />
 * 
 * // Card variant with multiple items
 * <LoadingSkeleton variant="card" count={3} />
 * 
 * // Table loading
 * <LoadingSkeleton variant="table" count={5} />
 * 
 * // Custom dimensions
 * <LoadingSkeleton height={200} width="100%" />
 * ```
 */
export function LoadingSkeleton({
  variant = 'default',
  count = 1,
  className,
  height,
  width,
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={cn('rounded-lg border border-gray-200 bg-white p-6', className)}>
            <div className="space-y-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
              <div className="h-20 w-full animate-pulse rounded bg-gray-200" />
              <div className="flex gap-2">
                <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </div>
        )

      case 'table':
        return (
          <div className={cn('w-full space-y-2', className)}>
            <div className="flex gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 flex-1 animate-pulse rounded bg-gray-200"
                />
              ))}
            </div>
          </div>
        )

      case 'list':
        return (
          <div className={cn('flex items-center gap-4', className)}>
            <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        )

      case 'avatar':
        return (
          <div className={cn('h-10 w-10 animate-pulse rounded-full bg-gray-200', className)} />
        )

      case 'image':
        return (
          <div
            className={cn('aspect-video w-full animate-pulse rounded-lg bg-gray-200', className)}
            style={{ height, width }}
          />
        )

      case 'text':
        return (
          <div
            className={cn('h-4 animate-pulse rounded bg-gray-200', className)}
            style={{ height, width }}
          />
        )

      default:
        return (
          <div
            className={cn('h-20 w-full animate-pulse rounded-lg bg-gray-200', className)}
            style={{ height, width }}
          />
        )
    }
  }

  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div key={index} className={count > 1 && index > 0 ? 'mt-4' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  )
}
