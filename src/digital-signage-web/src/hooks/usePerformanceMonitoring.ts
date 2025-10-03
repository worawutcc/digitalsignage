/**
 * usePerformanceMonitoring Hook
 * 
 * Hook for monitoring component performance with render time tracking,
 * memory usage monitoring, and performance metric reporting.
 * 
 * @see copilot-instructions-web.md - Performance Rules
 * @see specs/021-user-schedule-assignment/tasks.md - T037 Requirements
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'

export interface PerformanceMetric {
  id: string
  name: string
  type: 'render' | 'interaction' | 'memory' | 'network' | 'custom'
  value: number
  unit: 'ms' | 'bytes' | 'count' | 'percentage'
  timestamp: number
  componentName?: string
  additionalData?: Record<string, any>
}

export interface RenderMetric extends PerformanceMetric {
  type: 'render'
  renderCount: number
  isFirstRender: boolean
  propsChanged: boolean
  stateChanged: boolean
}

export interface InteractionMetric extends PerformanceMetric {
  type: 'interaction'
  interactionType: string
  elementTarget?: string | undefined
}

export interface MemoryMetric extends PerformanceMetric {
  type: 'memory'
  heapUsed: number
  heapTotal: number
  external: number
}

export interface NetworkMetric extends PerformanceMetric {
  type: 'network'
  url: string
  method: string
  status: number
  responseSize: number
}

export interface PerformanceThresholds {
  renderTime: number // ms
  interactionTime: number // ms
  memoryUsage: number // bytes
  networkTime: number // ms
}

export interface PerformanceMonitoringConfig {
  /** Component name for tagging metrics */
  componentName?: string
  /** Enable render performance tracking */
  trackRenders?: boolean
  /** Enable interaction performance tracking */
  trackInteractions?: boolean
  /** Enable memory usage tracking */
  trackMemory?: boolean
  /** Enable network performance tracking */
  trackNetwork?: boolean
  /** Performance thresholds for alerts */
  thresholds?: Partial<PerformanceThresholds>
  /** Sample rate (0-1) for performance tracking */
  sampleRate?: number
  /** Buffer size for metrics */
  bufferSize?: number
  /** Callback for performance alerts */
  onPerformanceAlert?: (metric: PerformanceMetric, threshold: number) => void
  /** Callback for all metrics */
  onMetric?: (metric: PerformanceMetric) => void
  /** Enable automatic reporting */
  enableReporting?: boolean
  /** Reporting interval in milliseconds */
  reportingInterval?: number
}

export interface PerformanceStats {
  /** Average render time */
  avgRenderTime: number
  /** Maximum render time */
  maxRenderTime: number
  /** Total render count */
  renderCount: number
  /** Average interaction time */
  avgInteractionTime: number
  /** Maximum interaction time */
  maxInteractionTime: number
  /** Current memory usage */
  currentMemoryUsage: number
  /** Peak memory usage */
  peakMemoryUsage: number
  /** Network requests count */
  networkRequestCount: number
  /** Average network time */
  avgNetworkTime: number
  /** Performance alerts count */
  alertsCount: number
}

export interface PerformanceMonitoringResult {
  /** Current performance statistics */
  stats: PerformanceStats
  /** All collected metrics */
  metrics: PerformanceMetric[]
  /** Track a custom metric */
  trackMetric: (metric: Omit<PerformanceMetric, 'id' | 'timestamp'>) => void
  /** Track render performance */
  trackRender: (renderData?: Partial<RenderMetric>) => void
  /** Track interaction performance */
  trackInteraction: (interactionType: string, elementTarget?: string) => () => void
  /** Get performance summary */
  getPerformanceSummary: () => PerformanceStats
  /** Clear all metrics */
  clearMetrics: () => void
  /** Export metrics for reporting */
  exportMetrics: () => string
  /** Check if performance is healthy */
  isPerformanceHealthy: () => boolean
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  renderTime: 16, // 16ms for 60fps
  interactionTime: 100, // 100ms for responsive interactions
  memoryUsage: 50 * 1024 * 1024, // 50MB
  networkTime: 2000 // 2 seconds
}

/**
 * Hook for comprehensive performance monitoring
 * 
 * @example
 * ```tsx
 * const {
 *   stats,
 *   trackInteraction,
 *   trackMetric,
 *   isPerformanceHealthy
 * } = usePerformanceMonitoring({
 *   componentName: 'UserScheduleAssignment',
 *   trackRenders: true,
 *   trackInteractions: true,
 *   trackMemory: true,
 *   thresholds: {
 *     renderTime: 10,
 *     interactionTime: 50
 *   },
 *   onPerformanceAlert: (metric, threshold) => {
 *     console.warn(`Performance alert: ${metric.name} (${metric.value}${metric.unit}) exceeded threshold (${threshold})`)
 *   }
 * })
 * 
 * const handleClick = trackInteraction('button-click', 'assign-schedule-btn')
 * 
 * useEffect(() => {
 *   if (!isPerformanceHealthy()) {
 *     console.log('Performance issues detected:', stats)
 *   }
 * }, [stats, isPerformanceHealthy])
 * ```
 */
export function usePerformanceMonitoring(
  config: PerformanceMonitoringConfig = {}
): PerformanceMonitoringResult {
  const {
    componentName = 'UnknownComponent',
    trackRenders = true,
    trackInteractions = true,
    trackMemory = false,
    trackNetwork = false,
    thresholds = {},
    sampleRate = 1.0,
    bufferSize = 1000,
    onPerformanceAlert,
    onMetric,
    enableReporting = false,
    reportingInterval = 30000
  } = config

  // State
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [alertsCount, setAlertsCount] = useState(0)

  // Refs
  const renderStartTime = useRef<number>(0)
  const renderCount = useRef<number>(0)
  const isFirstRender = useRef<boolean>(true)
  const previousProps = useRef<any>(null)
  const previousState = useRef<any>(null)
  const reportingInterval_ = useRef<NodeJS.Timeout | null>(null)

  // Merged thresholds
  const mergedThresholds = useMemo(() => ({
    ...DEFAULT_THRESHOLDS,
    ...thresholds
  }), [thresholds])

  // Generate unique ID for metrics
  const generateMetricId = useCallback(() => {
    return `${componentName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [componentName])

  // Check if we should sample this metric
  const shouldSample = useCallback(() => {
    return Math.random() <= sampleRate
  }, [sampleRate])

  // Add metric to buffer
  const addMetric = useCallback((metric: PerformanceMetric) => {
    setMetrics(prev => {
      const newMetrics = [...prev, metric]
      // Keep buffer size in check
      if (newMetrics.length > bufferSize) {
        return newMetrics.slice(-bufferSize)
      }
      return newMetrics
    })

    // Check thresholds and trigger alerts
    const threshold = mergedThresholds[metric.type as keyof PerformanceThresholds]
    if (threshold && metric.value > threshold) {
      setAlertsCount(prev => prev + 1)
      onPerformanceAlert?.(metric, threshold)
    }

    // Call metric callback
    onMetric?.(metric)
  }, [bufferSize, mergedThresholds, onPerformanceAlert, onMetric])

  // Track custom metric
  const trackMetric = useCallback((
    metric: Omit<PerformanceMetric, 'id' | 'timestamp'>
  ) => {
    if (!shouldSample()) return

    const fullMetric: PerformanceMetric = {
      ...metric,
      id: generateMetricId(),
      timestamp: Date.now(),
      componentName
    }

    addMetric(fullMetric)
  }, [shouldSample, generateMetricId, componentName, addMetric])

  // Track render performance
  const trackRender = useCallback((renderData: Partial<RenderMetric> = {}) => {
    if (!trackRenders || !shouldSample()) return

    const endTime = performance.now()
    const renderTime = renderStartTime.current > 0 ? endTime - renderStartTime.current : 0
    
    renderCount.current += 1

    const renderMetric: RenderMetric = {
      id: generateMetricId(),
      name: 'component-render',
      type: 'render',
      value: renderTime,
      unit: 'ms',
      timestamp: Date.now(),
      componentName,
      renderCount: renderCount.current,
      isFirstRender: isFirstRender.current,
      propsChanged: false, // This would need to be tracked by the component
      stateChanged: false, // This would need to be tracked by the component
      ...renderData
    }

    addMetric(renderMetric)
    isFirstRender.current = false
  }, [trackRenders, shouldSample, generateMetricId, componentName, addMetric])

  // Track interaction performance
  const trackInteraction = useCallback((
    interactionType: string,
    elementTarget?: string
  ) => {
    if (!trackInteractions || !shouldSample()) return () => {}

    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const interactionTime = endTime - startTime

      const interactionMetric: InteractionMetric = {
        id: generateMetricId(),
        name: `interaction-${interactionType}`,
        type: 'interaction',
        value: interactionTime,
        unit: 'ms',
        timestamp: Date.now(),
        componentName,
        interactionType,
        ...(elementTarget && { elementTarget })
      }

      addMetric(interactionMetric)
    }
  }, [trackInteractions, shouldSample, generateMetricId, componentName, addMetric])

  // Track memory usage
  const trackMemoryUsage = useCallback(() => {
    if (!trackMemory || !shouldSample()) return

    // Use performance.memory if available (Chrome)
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const memoryMetric: MemoryMetric = {
        id: generateMetricId(),
        name: 'memory-usage',
        type: 'memory',
        value: memory.usedJSHeapSize,
        unit: 'bytes',
        timestamp: Date.now(),
        componentName,
        heapUsed: memory.usedJSHeapSize,
        heapTotal: memory.totalJSHeapSize,
        external: memory.totalJSHeapSize - memory.usedJSHeapSize
      }

      addMetric(memoryMetric)
    }
  }, [trackMemory, shouldSample, generateMetricId, componentName, addMetric])

  // Performance statistics
  const stats = useMemo((): PerformanceStats => {
    const renderMetrics = metrics.filter(m => m.type === 'render')
    const interactionMetrics = metrics.filter(m => m.type === 'interaction')
    const memoryMetrics = metrics.filter(m => m.type === 'memory')
    const networkMetrics = metrics.filter(m => m.type === 'network')

    return {
      avgRenderTime: renderMetrics.length > 0
        ? renderMetrics.reduce((sum, m) => sum + m.value, 0) / renderMetrics.length
        : 0,
      maxRenderTime: renderMetrics.length > 0
        ? Math.max(...renderMetrics.map(m => m.value))
        : 0,
      renderCount: renderMetrics.length,
      avgInteractionTime: interactionMetrics.length > 0
        ? interactionMetrics.reduce((sum, m) => sum + m.value, 0) / interactionMetrics.length
        : 0,
      maxInteractionTime: interactionMetrics.length > 0
        ? Math.max(...interactionMetrics.map(m => m.value))
        : 0,
      currentMemoryUsage: memoryMetrics.length > 0
        ? memoryMetrics[memoryMetrics.length - 1]?.value || 0
        : 0,
      peakMemoryUsage: memoryMetrics.length > 0
        ? Math.max(...memoryMetrics.map(m => m.value))
        : 0,
      networkRequestCount: networkMetrics.length,
      avgNetworkTime: networkMetrics.length > 0
        ? networkMetrics.reduce((sum, m) => sum + m.value, 0) / networkMetrics.length
        : 0,
      alertsCount
    }
  }, [metrics, alertsCount])

  // Get performance summary
  const getPerformanceSummary = useCallback((): PerformanceStats => {
    return stats
  }, [stats])

  // Clear all metrics
  const clearMetrics = useCallback(() => {
    setMetrics([])
    setAlertsCount(0)
    renderCount.current = 0
    isFirstRender.current = true
  }, [])

  // Export metrics for reporting
  const exportMetrics = useCallback((): string => {
    const exportData = {
      componentName,
      timestamp: Date.now(),
      stats,
      metrics: metrics.slice(-100), // Export last 100 metrics
      thresholds: mergedThresholds
    }

    return JSON.stringify(exportData, null, 2)
  }, [componentName, stats, metrics, mergedThresholds])

  // Check if performance is healthy
  const isPerformanceHealthy = useCallback((): boolean => {
    const { avgRenderTime, maxRenderTime, avgInteractionTime, currentMemoryUsage } = stats

    return (
      avgRenderTime <= mergedThresholds.renderTime &&
      maxRenderTime <= mergedThresholds.renderTime * 2 &&
      avgInteractionTime <= mergedThresholds.interactionTime &&
      currentMemoryUsage <= mergedThresholds.memoryUsage
    )
  }, [stats, mergedThresholds])

  // Track render performance automatically
  useEffect(() => {
    if (trackRenders) {
      renderStartTime.current = performance.now()
      
      return () => {
        trackRender()
      }
    }
    return undefined
  })

  // Memory monitoring interval
  useEffect(() => {
    if (trackMemory) {
      const interval = setInterval(trackMemoryUsage, 5000) // Check every 5 seconds
      return () => clearInterval(interval)
    }
    return undefined
  }, [trackMemory, trackMemoryUsage])

  // Performance reporting interval
  useEffect(() => {
    if (enableReporting && reportingInterval > 0) {
      reportingInterval_.current = setInterval(() => {
        const report = exportMetrics()
        console.log('Performance Report:', report)
        
        // Here you could send the report to an analytics service
        // analytics.track('performance_report', JSON.parse(report))
      }, reportingInterval)

      return () => {
        if (reportingInterval_.current) {
          clearInterval(reportingInterval_.current)
        }
      }
    }
    return undefined
  }, [enableReporting, reportingInterval, exportMetrics])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reportingInterval_.current) {
        clearInterval(reportingInterval_.current)
      }
    }
  }, [])

  return {
    stats,
    metrics,
    trackMetric,
    trackRender,
    trackInteraction,
    getPerformanceSummary,
    clearMetrics,
    exportMetrics,
    isPerformanceHealthy
  }
}

export default usePerformanceMonitoring