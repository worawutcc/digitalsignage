/**
 * Performance Optimization Utilities
 * 
 * Utilities for virtualization, debouncing, caching, and performance monitoring
 * following copilot-instructions-ui.instructions.md patterns.
 * 
 * @see T028 - Performance optimization utilities for user management
 */

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'

// ============================================================================
// DEBOUNCING UTILITIES
// ============================================================================

/**
 * Debounce function - delays execution until after delay milliseconds have passed
 * since the last time it was invoked
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * React hook for debounced values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * React hook for debounced callbacks
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    ((...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    }) as T,
    [delay]
  )
}

// ============================================================================
// THROTTLING UTILITIES
// ============================================================================

/**
 * Throttle function - ensures function is called at most once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * React hook for throttled callbacks
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const callbackRef = useRef(callback)
  const throttling = useRef(false)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    ((...args) => {
      if (!throttling.current) {
        callbackRef.current(...args)
        throttling.current = true
        setTimeout(() => {
          throttling.current = false
        }, limit)
      }
    }) as T,
    [limit]
  )
}

// ============================================================================
// VIRTUALIZATION UTILITIES
// ============================================================================

export interface VirtualizationOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
  scrollElement?: HTMLElement | null
}

export interface VirtualItem {
  index: number
  start: number
  end: number
  size: number
}

/**
 * Calculate which items should be visible in a virtualized list
 */
export function calculateVisibleItems(
  scrollTop: number,
  totalItems: number,
  options: VirtualizationOptions
): {
  startIndex: number
  endIndex: number
  visibleItems: VirtualItem[]
  totalHeight: number
} {
  const { itemHeight, containerHeight, overscan = 5 } = options
  const totalHeight = totalItems * itemHeight

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems: VirtualItem[] = []
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push({
      index: i,
      start: i * itemHeight,
      end: (i + 1) * itemHeight,
      size: itemHeight,
    })
  }

  return {
    startIndex,
    endIndex,
    visibleItems,
    totalHeight,
  }
}

/**
 * React hook for virtualization
 */
export interface UseVirtualizationResult {
  visibleItems: VirtualItem[]
  totalHeight: number
  scrollToIndex: (index: number) => void
  startIndex: number
  endIndex: number
}

export function useVirtualization(
  totalItems: number,
  options: VirtualizationOptions
): UseVirtualizationResult {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLElement | null>(null)

  const { visibleItems, totalHeight, startIndex, endIndex } = useMemo(() => {
    return calculateVisibleItems(scrollTop, totalItems, options)
  }, [scrollTop, totalItems, options])

  const scrollToIndex = useCallback(
    (index: number) => {
      const scrollElement = options.scrollElement || scrollElementRef.current
      if (scrollElement) {
        const targetScrollTop = index * options.itemHeight
        scrollElement.scrollTop = targetScrollTop
        setScrollTop(targetScrollTop)
      }
    },
    [options.itemHeight, options.scrollElement]
  )

  useEffect(() => {
    const scrollElement = options.scrollElement || scrollElementRef.current
    if (!scrollElement) return

    const handleScroll = throttle(() => {
      setScrollTop(scrollElement.scrollTop)
    }, 16) // ~60fps

    scrollElement.addEventListener('scroll', handleScroll, { passive: true })
    return () => scrollElement.removeEventListener('scroll', handleScroll)
  }, [options.scrollElement])

  return {
    visibleItems,
    totalHeight,
    scrollToIndex,
    startIndex,
    endIndex,
  }
}

// ============================================================================
// CACHING UTILITIES
// ============================================================================

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  accessed: number
}

export class MemoryCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>()
  private maxSize: number
  private defaultTtl: number

  constructor(maxSize = 100, defaultTtl = 5 * 60 * 1000) {
    this.maxSize = maxSize
    this.defaultTtl = defaultTtl
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    
    // Remove expired entries if cache is getting full
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    // If still full after cleanup, remove least recently accessed
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      ttl: ttl || this.defaultTtl,
      accessed: now,
    })
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    entry.accessed = now
    return entry.data
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestAccessed = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessed < oldestAccessed) {
        oldestAccessed = entry.accessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }
}

/**
 * React hook for cached values with automatic invalidation
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T> | T,
  ttl?: number
): {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => void
  invalidate: () => void
} {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const cacheRef = useRef(new MemoryCache<T>())

  const fetchData = useCallback(async () => {
    // Check cache first
    const cached = cacheRef.current.get(key)
    if (cached) {
      setData(cached)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await fetcher()
      cacheRef.current.set(key, result, ttl)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, ttl])

  const invalidate = useCallback(() => {
    cacheRef.current.delete(key)
  }, [key])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    invalidate,
  }
}

// ============================================================================
// PERFORMANCE MONITORING UTILITIES
// ============================================================================

export interface PerformanceMetric {
  name: string
  type: 'timing' | 'counter' | 'gauge'
  value: number
  timestamp: number
  tags?: Record<string, string>
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private timers = new Map<string, number>()
  private observers: ((metric: PerformanceMetric) => void)[] = []

  /**
   * Start timing a performance metric
   */
  startTiming(name: string): void {
    this.timers.set(name, performance.now())
  }

  /**
   * End timing and record the metric
   */
  endTiming(name: string, tags?: Record<string, string>): number {
    const startTime = this.timers.get(name)
    if (!startTime) {
      console.warn(`No start time found for timer: ${name}`)
      return 0
    }

    const duration = performance.now() - startTime
    this.timers.delete(name)

    this.recordMetric({
      name,
      type: 'timing',
      value: duration,
      timestamp: Date.now(),
      ...(tags && { tags }),
    })

    return duration
  }

  /**
   * Record a counter metric
   */
  incrementCounter(name: string, value = 1, tags?: Record<string, string>): void {
    this.recordMetric({
      name,
      type: 'counter',
      value,
      timestamp: Date.now(),
      ...(tags && { tags }),
    })
  }

  /**
   * Record a gauge metric
   */
  recordGauge(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric({
      name,
      type: 'gauge',
      value,
      timestamp: Date.now(),
      ...(tags && { tags }),
    })
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = []
  }

  /**
   * Subscribe to metric updates
   */
  subscribe(observer: (metric: PerformanceMetric) => void): () => void {
    this.observers.push(observer)
    return () => {
      const index = this.observers.indexOf(observer)
      if (index > -1) {
        this.observers.splice(index, 1)
      }
    }
  }

  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)
    this.observers.forEach(observer => observer(metric))

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor()

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])

  useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe((metric) => {
      setMetrics(performanceMonitor.getMetrics())
    })

    // Initial load
    setMetrics(performanceMonitor.getMetrics())

    return unsubscribe
  }, [])

  return {
    metrics,
    startTiming: performanceMonitor.startTiming.bind(performanceMonitor),
    endTiming: performanceMonitor.endTiming.bind(performanceMonitor),
    incrementCounter: performanceMonitor.incrementCounter.bind(performanceMonitor),
    recordGauge: performanceMonitor.recordGauge.bind(performanceMonitor),
    clearMetrics: performanceMonitor.clearMetrics.bind(performanceMonitor),
  }
}

// ============================================================================
// BATCH PROCESSING UTILITIES
// ============================================================================

export interface BatchProcessorOptions<T> {
  batchSize: number
  delay: number
  maxWaitTime?: number
}

export class BatchProcessor<T> {
  private queue: T[] = []
  private timer: NodeJS.Timeout | null = null
  private processor: (items: T[]) => Promise<void> | void
  private options: Required<BatchProcessorOptions<T>>

  constructor(
    processor: (items: T[]) => Promise<void> | void,
    options: BatchProcessorOptions<T>
  ) {
    this.processor = processor
    this.options = {
      ...options,
      maxWaitTime: options.maxWaitTime || options.delay * 10,
    }
  }

  add(item: T): void {
    this.queue.push(item)

    if (this.queue.length >= this.options.batchSize) {
      this.flush()
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.options.delay)
    }
  }

  async flush(): Promise<void> {
    if (this.queue.length === 0) return

    const items = this.queue.splice(0)
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    try {
      await this.processor(items)
    } catch (error) {
      console.error('Batch processing failed:', error)
      // Could implement retry logic here
    }
  }

  destroy(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.flush()
  }
}

/**
 * React hook for batch processing
 */
export function useBatchProcessor<T>(
  processor: (items: T[]) => Promise<void> | void,
  options: BatchProcessorOptions<T>
) {
  const processorRef = useRef(new BatchProcessor(processor, options))

  useEffect(() => {
    const currentProcessor = processorRef.current
    return () => currentProcessor.destroy()
  }, [])

  return {
    add: (item: T) => processorRef.current.add(item),
    flush: () => processorRef.current.flush(),
  }
}