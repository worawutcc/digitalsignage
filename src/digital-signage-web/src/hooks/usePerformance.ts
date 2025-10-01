/**
 * Performance Optimization Utilities
 * React.memo, useMemo, useCallback helpers and patterns
 */

'use client'

import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react'

/**
 * Debounce hook for performance optimization
 * Delays execution of expensive operations
 * 
 * @example
 * ```tsx
 * const debouncedSearch = useDebounce(searchTerm, 500)
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

/**
 * Throttle hook for limiting function execution rate
 * Useful for scroll handlers, resize handlers, etc.
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRan = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))

    return () => clearTimeout(handler)
  }, [value, limit])

  return throttledValue
}

/**
 * Memoized callback with stable reference
 * Better alternative to useCallback for complex dependencies
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef<T>(callback)

  useEffect(() => {
    callbackRef.current = callback
  })

  return useCallback(((...args) => callbackRef.current(...args)) as T, [])
}

/**
 * Intersection Observer hook for lazy loading
 * Optimizes rendering of items outside viewport
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setIsIntersecting(entry.isIntersecting)
      }
    }, options)

    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, options])

  return isIntersecting
}

/**
 * Virtual scrolling hook for large lists
 * Only renders visible items + buffer
 */
export function useVirtualScroll({
  totalItems,
  itemHeight,
  containerHeight,
  overscan = 3,
}: {
  totalItems: number
  itemHeight: number
  containerHeight: number
  overscan?: number
}) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      totalItems - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    return {
      startIndex,
      endIndex,
      offsetY: startIndex * itemHeight,
      visibleCount: endIndex - startIndex + 1,
    }
  }, [scrollTop, itemHeight, containerHeight, totalItems, overscan])

  const onScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    ...visibleItems,
    onScroll,
    totalHeight: totalItems * itemHeight,
  }
}

/**
 * Memoized array equality check
 * Prevents re-renders when array content is the same
 */
export function useDeepMemo<T>(value: T): T {
  const ref = useRef<T>(value)
  
  const isEqual = useMemo(() => {
    return JSON.stringify(ref.current) === JSON.stringify(value)
  }, [value])

  if (!isEqual) {
    ref.current = value
  }

  return ref.current
}

/**
 * Performance monitoring hook
 * Measures component render performance
 */
export function useRenderCount(componentName: string) {
  const renderCount = useRef(0)

  useEffect(() => {
    renderCount.current += 1
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${componentName}] Render #${renderCount.current}`)
    }
  })

  return renderCount.current
}

/**
 * Lazy initialization for expensive computations
 */
export function useLazyState<T>(initializer: () => T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(initializer)
  return [state, setState]
}

/**
 * Batched state updates for multiple setState calls
 */
export function useBatchedUpdates() {
  const [updates, setUpdates] = useState<Array<() => void>>([])

  const addUpdate = useCallback((update: () => void) => {
    setUpdates((prev) => [...prev, update])
  }, [])

  useEffect(() => {
    if (updates.length > 0) {
      updates.forEach((update) => update())
      setUpdates([])
    }
  }, [updates])

  return addUpdate
}

/**
 * Memoize expensive calculations
 */
export function useMemoizedValue<T>(factory: () => T, deps: React.DependencyList): T {
  return useMemo(factory, deps)
}

/**
 * Optimized event handlers
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps)
}

/**
 * Check if component is mounted to prevent state updates on unmounted components
 */
export function useIsMounted() {
  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  return useCallback(() => isMounted.current, [])
}

/**
 * Prevent unnecessary re-renders with shallow comparison
 */
export function shallowEqual(objA: any, objB: any): boolean {
  if (objA === objB) return true

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key) || objA[key] !== objB[key]) {
      return false
    }
  }

  return true
}

/**
 * HOC for memoizing components with custom comparison
 */
export function memoWithComparison<P extends object>(
  Component: React.ComponentType<P>,
  compare?: (prevProps: P, nextProps: P) => boolean
) {
  return React.memo(Component, compare)
}

