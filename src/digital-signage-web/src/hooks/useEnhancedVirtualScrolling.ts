/**
 * useEnhancedVirtualScrolling Hook
 * 
 * Hook wrapping @tanstack/react-virtual with performance optimizations,
 * scroll position persistence, and dynamic item height support.
 * 
 * @see copilot-instructions-web.md - Performance Rules
 * @see specs/021-user-schedule-assignment/tasks.md - T033 Requirements
 */

import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { VirtualizerOptions } from '@tanstack/react-virtual'

export interface EnhancedVirtualScrollingOptions<T = any> {
  /** Items to virtualize */
  items: T[]
  /** Container element ref */
  parentRef: React.RefObject<HTMLElement>
  /** Estimated item size in pixels */
  estimateSize: number | ((index: number, item: T) => number)
  /** Overscan count (items to render outside viewport) */
  overscan?: number
  /** Enable scroll position persistence */
  enableScrollPersistence?: boolean
  /** Storage key for persisting scroll position */
  scrollPersistenceKey?: string
  /** Enable dynamic height calculations */
  enableDynamicHeight?: boolean
  /** Threshold for enabling virtual scrolling */
  virtualScrollingThreshold?: number
  /** Enable performance monitoring */
  enablePerformanceMonitoring?: boolean
  /** Performance metrics callback */
  onPerformanceMetric?: (metric: VirtualScrollPerformanceMetric) => void
  /** Scroll event callback */
  onScroll?: (scrollTop: number, isScrolling: boolean) => void
  /** Enable smooth scrolling */
  enableSmoothScrolling?: boolean
  /** Gap between items */
  gap?: number
}

export interface VirtualScrollPerformanceMetric {
  type: 'scroll' | 'render' | 'resize'
  duration: number
  itemCount: number
  visibleRange: { start: number; end: number }
  timestamp: number
}

export interface EnhancedVirtualScrollingResult<T = any> {
  /** Virtual items for rendering */
  virtualItems: Array<{
    index: number
    start: number
    size: number
    end: number
    key: string | number
    item: T
    isVisible: boolean
  }>
  /** Total size of all items */
  totalSize: number
  /** Is currently scrolling */
  isScrolling: boolean
  /** Current scroll offset */
  scrollOffset: number
  /** Visible range */
  visibleRange: { start: number; end: number }
  /** Virtual scroller utilities */
  scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' | 'auto'; behavior?: 'auto' | 'smooth' }) => void
  scrollToOffset: (offset: number, options?: { align?: 'start' | 'center' | 'end' | 'auto'; behavior?: 'auto' | 'smooth' }) => void
  scrollToItem: (item: T, options?: { align?: 'start' | 'center' | 'end' | 'auto'; behavior?: 'auto' | 'smooth' }) => void
  /** Measure item at index */
  measureElement: (element: HTMLElement | null) => void
  /** Reset scroll position */
  resetScroll: () => void
  /** Performance metrics */
  performanceMetrics?: VirtualScrollPerformanceMetric[] | undefined
  /** Get scroll position for persistence */
  getScrollPosition: () => number
  /** Restore scroll position */
  restoreScrollPosition: (position: number) => void
}

/**
 * Enhanced virtual scrolling hook with performance optimizations
 * 
 * @example
 * ```tsx
 * const parentRef = useRef<HTMLDivElement>(null)
 * 
 * const {
 *   virtualItems,
 *   totalSize,
 *   scrollToIndex,
 *   isScrolling
 * } = useEnhancedVirtualScrolling({
 *   items: users,
 *   parentRef,
 *   estimateSize: 60,
 *   enableScrollPersistence: true,
 *   scrollPersistenceKey: 'users-list-scroll',
 *   virtualScrollingThreshold: 50
 * })
 * 
 * return (
 *   <div ref={parentRef} className="h-96 overflow-auto">
 *     <div style={{ height: totalSize, position: 'relative' }}>
 *       {virtualItems.map((virtualItem) => (
 *         <div
 *           key={virtualItem.key}
 *           data-index={virtualItem.index}
 *           ref={(el) => virtualizer.measureElement(el)}
 *           style={{
 *             position: 'absolute',
 *             top: 0,
 *             left: 0,
 *             width: '100%',
 *             transform: `translateY(${virtualItem.start}px)`
 *           }}
 *         >
 *           <UserCard user={virtualItem.item} />
 *         </div>
 *       ))}
 *     </div>
 *   </div>
 * )
 * ```
 */
export function useEnhancedVirtualScrolling<T = any>(
  options: EnhancedVirtualScrollingOptions<T>
): EnhancedVirtualScrollingResult<T> {
  const {
    items,
    parentRef,
    estimateSize,
    overscan = 5,
    enableScrollPersistence = false,
    scrollPersistenceKey = 'virtual-scroll-position',
    enableDynamicHeight = true,
    virtualScrollingThreshold = 50,
    enablePerformanceMonitoring = false,
    onPerformanceMetric,
    onScroll,
    enableSmoothScrolling = true,
    gap = 0
  } = options

  // Performance monitoring state
  const [performanceMetrics, setPerformanceMetrics] = useState<VirtualScrollPerformanceMetric[]>([])
  const performanceStartTime = useRef<number>(0)
  
  // Scroll persistence state
  const [restoredScrollPosition, setRestoredScrollPosition] = useState<number | null>(null)
  const hasRestoredScroll = useRef(false)

  // Determine if virtual scrolling should be enabled
  const shouldUseVirtualScrolling = items.length >= virtualScrollingThreshold

  // Create virtualizer options
  const virtualizerOptions = useMemo(() => ({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof estimateSize === 'function' 
      ? (index: number) => {
          const item = items[index]
          return item ? estimateSize(index, item) : 50
        }
      : () => estimateSize,
    overscan,
    gap,
    initialOffset: restoredScrollPosition || 0,
    // Performance optimizations
    onChange: (instance: any) => {
      if (enablePerformanceMonitoring) {
        const endTime = Date.now()
        const duration = endTime - performanceStartTime.current
        
        const metric: VirtualScrollPerformanceMetric = {
          type: 'scroll',
          duration,
          itemCount: items.length,
          visibleRange: {
            start: instance.getVirtualItems()[0]?.index || 0,
            end: instance.getVirtualItems()[instance.getVirtualItems().length - 1]?.index || 0
          },
          timestamp: endTime
        }
        
        setPerformanceMetrics(prev => [...prev.slice(-99), metric])
        onPerformanceMetric?.(metric)
      }
      
      // Handle scroll callbacks
      const scrollOffset = instance.scrollOffset || 0
      onScroll?.(scrollOffset, instance.isScrolling)
      
      // Persist scroll position
      if (enableScrollPersistence && scrollPersistenceKey && scrollOffset !== null) {
        localStorage.setItem(scrollPersistenceKey, scrollOffset.toString())
      }
    }
  }), [
    items.length,
    parentRef,
    estimateSize,
    overscan,
    gap,
    restoredScrollPosition,
    enablePerformanceMonitoring,
    onPerformanceMetric,
    onScroll,
    enableScrollPersistence,
    scrollPersistenceKey,
    items
  ])

  // Create virtualizer
  const virtualizer = useVirtualizer(virtualizerOptions)

  // Restore scroll position on mount
  useEffect(() => {
    if (enableScrollPersistence && scrollPersistenceKey && !hasRestoredScroll.current) {
      const savedPosition = localStorage.getItem(scrollPersistenceKey)
      if (savedPosition) {
        const position = parseInt(savedPosition, 10)
        setRestoredScrollPosition(position)
        
        // Restore after virtualizer is ready
        setTimeout(() => {
          virtualizer.scrollToOffset(position, { align: 'start' })
          hasRestoredScroll.current = true
        }, 100)
      }
    }
  }, [enableScrollPersistence, scrollPersistenceKey, virtualizer])

  // Performance monitoring effect
  useEffect(() => {
    if (enablePerformanceMonitoring) {
      performanceStartTime.current = Date.now()
    }
  }, [enablePerformanceMonitoring, virtualizer.isScrolling])

  // Enhanced virtual items with additional properties
  const enhancedVirtualItems = useMemo(() => {
    if (!shouldUseVirtualScrolling) {
      // Return all items when virtual scrolling is disabled
      return items.map((item, index) => ({
        index,
        start: index * (typeof estimateSize === 'number' ? estimateSize : 50) + (index * gap),
        size: typeof estimateSize === 'number' ? estimateSize : 50,
        end: (index + 1) * (typeof estimateSize === 'number' ? estimateSize : 50) + (index * gap),
        key: index.toString(),
        item,
        isVisible: true
      }))
    }

    return virtualizer.getVirtualItems().map(virtualItem => ({
      index: virtualItem.index,
      start: virtualItem.start,
      size: virtualItem.size,
      end: virtualItem.end,
      key: virtualItem.key.toString(),
      item: items[virtualItem.index] as T,
      isVisible: true
    }))
  }, [items, virtualizer, shouldUseVirtualScrolling, estimateSize, gap])

  // Scroll to item utility
  const scrollToItem = useCallback((item: T, options?: { align?: 'start' | 'center' | 'end' | 'auto'; behavior?: 'auto' | 'smooth' }) => {
    const index = items.indexOf(item)
    if (index !== -1) {
      virtualizer.scrollToIndex(index, options)
    }
  }, [items, virtualizer])

  // Reset scroll position
  const resetScroll = useCallback(() => {
    virtualizer.scrollToOffset(0)
    if (enableScrollPersistence && scrollPersistenceKey) {
      localStorage.removeItem(scrollPersistenceKey)
    }
  }, [virtualizer, enableScrollPersistence, scrollPersistenceKey])

  // Get current scroll position
  const getScrollPosition = useCallback(() => {
    return virtualizer.scrollOffset || 0
  }, [virtualizer.scrollOffset])

  // Restore scroll position
  const restoreScrollPosition = useCallback((position: number) => {
    virtualizer.scrollToOffset(position, { align: 'start' })
  }, [virtualizer])

  // Visible range calculation
  const visibleRange = useMemo(() => {
    const virtualItems = virtualizer.getVirtualItems()
    return {
      start: virtualItems[0]?.index || 0,
      end: virtualItems[virtualItems.length - 1]?.index || 0
    }
  }, [virtualizer.getVirtualItems()])

  return {
    virtualItems: enhancedVirtualItems,
    totalSize: shouldUseVirtualScrolling ? virtualizer.getTotalSize() : items.length * (typeof estimateSize === 'number' ? estimateSize : 50),
    isScrolling: virtualizer.isScrolling,
    scrollOffset: virtualizer.scrollOffset || 0,
    visibleRange,
    scrollToIndex: virtualizer.scrollToIndex,
    scrollToOffset: virtualizer.scrollToOffset,
    scrollToItem,
    measureElement: virtualizer.measureElement,
    resetScroll,
    performanceMetrics: enablePerformanceMonitoring ? performanceMetrics : undefined,
    getScrollPosition,
    restoreScrollPosition
  }
}

export default useEnhancedVirtualScrolling