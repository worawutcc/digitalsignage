/**
 * Performance Monitoring
 * Web Vitals tracking and performance metrics
 */

'use client'

import { useEffect } from 'react'

/**
 * Web Vitals metrics interface
 */
export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType: string
}

/**
 * Performance entry interface
 */
export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
  metadata?: Record<string, any>
}

/**
 * Web Vitals thresholds
 */
const VITALS_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
}

/**
 * Rate metric based on thresholds
 */
function rateMetric(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = VITALS_THRESHOLDS[name as keyof typeof VITALS_THRESHOLDS]
  if (!thresholds) return 'good'

  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.poor) return 'needs-improvement'
  return 'poor'
}

/**
 * Report Web Vitals to analytics
 */
export function reportWebVitals(metric: WebVitalsMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', {
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
    })
  }

  // Send to analytics service in production
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // Example: Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        event_label: metric.id,
        non_interaction: true,
      })
    }

    // Example: Send to custom analytics endpoint
    sendToAnalytics({
      type: 'web-vitals',
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      page: window.location.pathname,
      timestamp: Date.now(),
    })
  }
}

/**
 * Send metrics to analytics endpoint
 */
async function sendToAnalytics(data: any) {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true, // Keep request alive even if page is unloading
    })
  } catch (error) {
    console.error('Failed to send analytics:', error)
  }
}

/**
 * Hook to track component render performance
 */
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName} render time: ${renderTime.toFixed(2)}ms`)
      }

      // Track slow renders
      if (renderTime > 100 && typeof window !== 'undefined') {
        sendToAnalytics({
          type: 'slow-render',
          component: componentName,
          duration: renderTime,
          page: window.location.pathname,
          timestamp: Date.now(),
        })
      }
    }
  }, [componentName])
}

/**
 * Track API request performance
 */
export function trackApiPerformance(
  endpoint: string,
  duration: number,
  status: number,
  error?: string
) {
  const metric: PerformanceMetric = {
    name: 'api-request',
    value: duration,
    unit: 'ms',
    timestamp: Date.now(),
    metadata: {
      endpoint,
      status,
      error,
    },
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[API Performance]', {
      endpoint,
      duration: `${duration.toFixed(2)}ms`,
      status,
      error,
    })
  }

  // Track slow API calls
  if (duration > 1000 && typeof window !== 'undefined') {
    sendToAnalytics({
      type: 'slow-api',
      endpoint,
      duration,
      status,
      error,
      page: window.location.pathname,
      timestamp: Date.now(),
    })
  }
}

/**
 * Track page load performance
 */
export function trackPageLoad() {
  if (typeof window === 'undefined') return

  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    if (navigation) {
      const metrics = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        domComplete: navigation.domComplete - navigation.fetchStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart,
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[Page Load Metrics]', metrics)
      }

      sendToAnalytics({
        type: 'page-load',
        metrics,
        page: window.location.pathname,
        timestamp: Date.now(),
      })
    }
  })
}

/**
 * Track user interactions
 */
export function trackInteraction(action: string, metadata?: Record<string, any>) {
  if (typeof window === 'undefined') return
  
  sendToAnalytics({
    type: 'interaction',
    action,
    metadata,
    page: window.location.pathname,
    timestamp: Date.now(),
  })
}

/**
 * Track errors
 */
export function trackError(error: Error, context?: Record<string, any>) {
  if (typeof window === 'undefined') return
  
  sendToAnalytics({
    type: 'error',
    message: error.message,
    stack: error.stack,
    context,
    page: window.location.pathname,
    timestamp: Date.now(),
  })
}

/**
 * Resource timing observer
 * Monitors slow-loading resources
 */
export function observeResourceTiming() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const resource = entry as PerformanceResourceTiming

      // Track slow resources (> 2s)
      if (resource.duration > 2000) {
        sendToAnalytics({
          type: 'slow-resource',
          name: resource.name,
          duration: resource.duration,
          size: resource.transferSize,
          resourceType: resource.initiatorType,
          page: window.location.pathname,
          timestamp: Date.now(),
        })
      }
    }
  })

  observer.observe({ entryTypes: ['resource'] })

  return () => observer.disconnect()
}

/**
 * Long task observer
 * Monitors tasks that block the main thread
 */
export function observeLongTasks() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return undefined

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Track tasks longer than 50ms
        if (entry.duration > 50) {
          sendToAnalytics({
            type: 'long-task',
            duration: entry.duration,
            page: window.location.pathname,
            timestamp: Date.now(),
          })
        }
      }
    })

    observer.observe({ entryTypes: ['longtask'] })

    return () => observer.disconnect()
  } catch (error) {
    // PerformanceObserver may not support longtask on all browsers
    console.warn('Long task monitoring not supported')
    return undefined
  }
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage() {
  if (typeof window === 'undefined' || !(performance as any).memory) return null

  const memory = (performance as any).memory
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
  }
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return

  // Track page load
  trackPageLoad()

  // Observe resources
  const cleanupResources = observeResourceTiming()

  // Observe long tasks
  const cleanupLongTasks = observeLongTasks()

  // Monitor memory every 30 seconds
  const memoryInterval = setInterval(() => {
    const memory = getMemoryUsage()
    if (memory && memory.percentage > 80) {
      sendToAnalytics({
        type: 'high-memory-usage',
        memory,
        page: window.location.pathname,
        timestamp: Date.now(),
      })
    }
  }, 30000)

  // Global error handler
  window.addEventListener('error', (event) => {
    trackError(event.error, {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    trackError(
      new Error(event.reason?.message || 'Unhandled Promise Rejection'),
      {
        reason: event.reason,
      }
    )
  })

  // Cleanup function
  return () => {
    cleanupResources?.()
    cleanupLongTasks?.()
    clearInterval(memoryInterval)
  }
}

/**
 * Performance monitoring component
 * Add to root layout to enable monitoring
 */
export function PerformanceMonitor({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const cleanup = initPerformanceMonitoring()
    return cleanup
  }, [])

  return <>{children}</>
}

// Global type augmentation for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}
