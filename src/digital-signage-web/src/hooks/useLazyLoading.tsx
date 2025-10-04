import React, { lazy, Suspense, ComponentType } from 'react'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'

/**
 * Generic loading fallback component
 */
const DefaultLoadingFallback = () => (
  <div className="animate-pulse">
    <LoadingSkeleton className="h-8 w-48 mb-4" />
    <LoadingSkeleton className="h-32 w-full" />
  </div>
)

/**
 * Higher-order component for lazy loading with suspense
 */
export function withLazyLoading<T extends ComponentType<any>>(
  componentLoader: () => Promise<{ default: T }>,
  fallback?: ComponentType
) {
  const LazyComponent = lazy(componentLoader)
  const FallbackComponent = fallback || DefaultLoadingFallback

  return function LazyLoadedComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

/**
 * Hook for dynamic imports with error handling
 */
export function useDynamicImport<T>(
  importFn: () => Promise<T>,
  deps: React.DependencyList = []
): {
  data: T | null
  loading: boolean
  error: Error | null
} {
  const [state, setState] = React.useState<{
    data: T | null
    loading: boolean
    error: Error | null
  }>({
    data: null,
    loading: true,
    error: null
  })

  React.useEffect(() => {
    let cancelled = false

    setState(prev => ({ ...prev, loading: true, error: null }))

    importFn()
      .then(result => {
        if (!cancelled) {
          setState({ data: result, loading: false, error: null })
        }
      })
      .catch(error => {
        if (!cancelled) {
          setState({ data: null, loading: false, error })
        }
      })

    return () => {
      cancelled = true
    }
  }, deps)

  return state
}

/**
 * Optimized lazy loading for heavy components
 * Note: Components must be default exports for lazy loading to work
 */
export const LazyComponents = {
  // Example lazy components - replace with actual component paths as needed
  // MediaGrid: withLazyLoading(() => import('@/features/media/components/MediaGrid')),
}

/**
 * Prefetch component for better UX
 */
export function prefetchComponent(componentPath: string) {
  if (typeof window !== 'undefined') {
    // Use Next.js router prefetch or dynamic import
    import(componentPath).catch(() => {
      // Silently fail - component will load on demand
    })
  }
}

/**
 * Hook for intersection observer based lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<HTMLElement | null>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = React.useState(false)

  React.useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) {
          setIsIntersecting(entry.isIntersecting)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [ref, options])

  return isIntersecting
}

/**
 * Lazy load component when it enters viewport
 */
export function LazyOnIntersection({
  children,
  fallback = <DefaultLoadingFallback />,
  ...options
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
} & IntersectionObserverInit) {
  const ref = React.useRef<HTMLDivElement>(null)
  const isIntersecting = useIntersectionObserver(ref, options)

  return (
    <div ref={ref}>
      {isIntersecting ? children : fallback}
    </div>
  )
}