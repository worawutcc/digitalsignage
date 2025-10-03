/**
 * useBulkOperations Hook
 * 
 * Reusable hook for managing bulk operations with progress tracking, cancellation,
 * retry mechanisms, and performance optimizations.
 * 
 * @see copilot-instructions-web.md - State Management Rules
 * @see specs/021-user-schedule-assignment/tasks.md - T022 Requirements
 */

import { useState, useCallback, useRef, useMemo } from 'react'
import { useToast } from './useToast'

export interface BulkOperationItem<T = any> {
  id: string | number
  data: T
}

export interface BulkOperationConfig<T = any, R = any> {
  /** Function to execute for each item */
  operation: (item: T) => Promise<R>
  /** Maximum number of concurrent operations */
  concurrency?: number
  /** Retry configuration */
  retry?: {
    attempts: number
    delay: number
    backoffMultiplier?: number
  }
  /** Custom error handler */
  onError?: (error: unknown, item: T, attempt: number) => void
  /** Progress callback */
  onProgress?: (progress: BulkOperationProgress<T, R>) => void
  /** Success callback */
  onSuccess?: (results: BulkOperationResult<T, R>[]) => void
  /** Enable performance monitoring */
  enablePerformanceMonitoring?: boolean
}

export interface BulkOperationProgress<T = any, R = any> {
  total: number
  completed: number
  failed: number
  inProgress: number
  percentage: number
  currentItem?: T
  results: BulkOperationResult<T, R>[]
  errors: BulkOperationError<T>[]
  startTime: number
  estimatedTimeRemaining?: number | undefined
}

export interface BulkOperationResult<T = any, R = any> {
  item: T
  result: R
  duration: number
  success: true
}

export interface BulkOperationError<T = any> {
  item: T
  error: unknown
  attempts: number
  success: false
}

export interface BulkOperationState<T = any, R = any> {
  isRunning: boolean
  isPaused: boolean
  isCancelled: boolean
  canRetry: boolean
  progress: BulkOperationProgress<T, R>
}

/**
 * Hook for managing bulk operations
 * 
 * @example
 * ```tsx
 * const { execute, state, cancel, pause, resume, retry } = useBulkOperations({
 *   operation: async (userId) => userService.deleteUser(userId),
 *   concurrency: 3,
 *   retry: { attempts: 2, delay: 1000 },
 *   onProgress: (progress) => console.log(`${progress.percentage}% complete`)
 * })
 * 
 * const handleBulkDelete = async () => {
 *   const userIds = [1, 2, 3, 4, 5]
 *   await execute(userIds)
 * }
 * ```
 */
export function useBulkOperations<T = any, R = any>(config: BulkOperationConfig<T, R>) {
  const {
    operation,
    concurrency = 3,
    retry = { attempts: 1, delay: 1000, backoffMultiplier: 1.5 },
    onError,
    onProgress,
    onSuccess,
    enablePerformanceMonitoring = true
  } = config

  const { toast } = useToast()
  const abortControllerRef = useRef<AbortController | null>(null)
  const operationStartTime = useRef<number>(0)
  const performanceMetrics = useRef<{
    averageOperationTime: number
    slowestOperation: number
    fastestOperation: number
    totalOperations: number
  }>({
    averageOperationTime: 0,
    slowestOperation: 0,
    fastestOperation: Infinity,
    totalOperations: 0
  })

  const [state, setState] = useState<BulkOperationState<T, R>>({
    isRunning: false,
    isPaused: false,
    isCancelled: false,
    canRetry: false,
    progress: {
      total: 0,
      completed: 0,
      failed: 0,
      inProgress: 0,
      percentage: 0,
      results: [],
      errors: [],
      startTime: 0
    }
  })

  // Calculate estimated time remaining
  const calculateEstimatedTime = useCallback((progress: BulkOperationProgress<T, R>) => {
    if (progress.completed === 0) return undefined

    const elapsed = Date.now() - progress.startTime
    const averageTimePerItem = elapsed / progress.completed
    const remaining = progress.total - progress.completed
    
    return Math.round(remaining * averageTimePerItem)
  }, [])

  // Update performance metrics
  const updatePerformanceMetrics = useCallback((duration: number) => {
    if (!enablePerformanceMonitoring) return

    const metrics = performanceMetrics.current
    metrics.totalOperations++
    metrics.averageOperationTime = 
      (metrics.averageOperationTime * (metrics.totalOperations - 1) + duration) / metrics.totalOperations
    metrics.slowestOperation = Math.max(metrics.slowestOperation, duration)
    metrics.fastestOperation = Math.min(metrics.fastestOperation, duration)
  }, [enablePerformanceMonitoring])

  // Execute single operation with retry logic
  const executeOperation = useCallback(async (
    item: T,
    attempt: number = 1
  ): Promise<BulkOperationResult<T, R> | BulkOperationError<T>> => {
    const startTime = Date.now()

    try {
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Operation cancelled')
      }

      const result = await operation(item)
      const duration = Date.now() - startTime

      updatePerformanceMetrics(duration)

      return {
        item,
        result,
        duration,
        success: true as const
      }
    } catch (error) {
      const duration = Date.now() - startTime
      
      onError?.(error, item, attempt)

      if (attempt < retry.attempts) {
        // Calculate backoff delay
        const delay = retry.delay * Math.pow(retry.backoffMultiplier || 1.5, attempt - 1)
        
        await new Promise(resolve => setTimeout(resolve, delay))
        
        return executeOperation(item, attempt + 1)
      }

      return {
        item,
        error,
        attempts: attempt,
        success: false as const
      }
    }
  }, [operation, retry, onError, updatePerformanceMetrics])

  // Execute bulk operation
  const execute = useCallback(async (items: T[]) => {
    if (state.isRunning) {
      toast({
        title: 'Operation already running',
        description: 'Please wait for the current operation to complete',
        variant: 'warning'
      })
      return
    }

    // Initialize state
    abortControllerRef.current = new AbortController()
    operationStartTime.current = Date.now()

    const initialProgress: BulkOperationProgress<T, R> = {
      total: items.length,
      completed: 0,
      failed: 0,
      inProgress: 0,
      percentage: 0,
      results: [],
      errors: [],
      startTime: operationStartTime.current
    }

    setState({
      isRunning: true,
      isPaused: false,
      isCancelled: false,
      canRetry: false,
      progress: initialProgress
    })

    onProgress?.(initialProgress)

    try {
      const results: (BulkOperationResult<T, R> | BulkOperationError<T>)[] = []
      const inProgress = new Set<Promise<any>>()

      for (let i = 0; i < items.length; i += concurrency) {
        if (abortControllerRef.current.signal.aborted) {
          break
        }

        const batch = items.slice(i, i + concurrency)
        const batchPromises = batch.map(async (item) => {
          setState(prev => ({
            ...prev,
            progress: {
              ...prev.progress,
              inProgress: prev.progress.inProgress + 1,
              currentItem: item
            }
          }))

          const result = await executeOperation(item)
          results.push(result)

          setState(prev => {
            const newCompleted = result.success ? prev.progress.completed + 1 : prev.progress.completed
            const newFailed = result.success ? prev.progress.failed : prev.progress.failed + 1
            const newInProgress = prev.progress.inProgress - 1
            const newPercentage = Math.round(((newCompleted + newFailed) / prev.progress.total) * 100)

            const newProgress: BulkOperationProgress<T, R> = {
              ...prev.progress,
              completed: newCompleted,
              failed: newFailed,
              inProgress: newInProgress,
              percentage: newPercentage,
              results: result.success 
                ? [...prev.progress.results, result]
                : prev.progress.results,
              errors: result.success 
                ? prev.progress.errors
                : [...prev.progress.errors, result],
              estimatedTimeRemaining: calculateEstimatedTime({
                ...prev.progress,
                completed: newCompleted + newFailed
              })
            }

            onProgress?.(newProgress)

            return {
              ...prev,
              progress: newProgress
            }
          })

          return result
        })

        // Wait for batch to complete
        await Promise.all(batchPromises)
      }

      const successfulResults = results.filter((r): r is BulkOperationResult<T, R> => r.success)
      const failedResults = results.filter((r): r is BulkOperationError<T> => !r.success)

      setState(prev => ({
        ...prev,
        isRunning: false,
        canRetry: failedResults.length > 0,
        progress: {
          ...prev.progress,
          inProgress: 0
        }
      }))

      if (successfulResults.length > 0) {
        onSuccess?.(successfulResults)
        
        toast({
          title: 'Bulk operation completed',
          description: `Successfully processed ${successfulResults.length} of ${items.length} items`,
          variant: successfulResults.length === items.length ? 'success' : 'warning'
        })
      }

      if (failedResults.length > 0) {
        toast({
          title: `${failedResults.length} operations failed`,
          description: 'You can retry the failed operations',
          variant: 'destructive'
        })
      }

      // Log performance metrics
      if (enablePerformanceMonitoring) {
        const totalTime = Date.now() - operationStartTime.current
        console.log('Bulk Operation Performance:', {
          totalTime: `${totalTime}ms`,
          totalItems: items.length,
          successfulItems: successfulResults.length,
          failedItems: failedResults.length,
          averageTimePerItem: `${Math.round(totalTime / items.length)}ms`,
          ...performanceMetrics.current
        })
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        isRunning: false,
        canRetry: true
      }))

      toast({
        title: 'Bulk operation failed',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })

      console.error('Bulk operation error:', error)
    }
  }, [
    state.isRunning,
    concurrency,
    executeOperation,
    onProgress,
    onSuccess,
    calculateEstimatedTime,
    enablePerformanceMonitoring,
    toast
  ])

  // Cancel operation
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      
      setState(prev => ({
        ...prev,
        isRunning: false,
        isCancelled: true,
        canRetry: true
      }))

      toast({
        title: 'Operation cancelled',
        description: 'The bulk operation has been cancelled',
        variant: 'warning'
      })
    }
  }, [toast])

  // Pause operation (not implemented in this version)
  const pause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: true
    }))

    toast({
      title: 'Operation paused',
      description: 'The bulk operation has been paused',
      variant: 'warning'
    })
  }, [toast])

  // Resume operation (not implemented in this version)
  const resume = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: false
    }))

    toast({
      title: 'Operation resumed',
      description: 'The bulk operation has been resumed',
      variant: 'success'
    })
  }, [toast])

  // Retry failed operations
  const retry_ = useCallback(async () => {
    const failedItems = state.progress.errors.map(error => error.item)
    
    if (failedItems.length === 0) {
      toast({
        title: 'No failed operations',
        description: 'There are no failed operations to retry',
        variant: 'warning'
      })
      return
    }

    await execute(failedItems)
  }, [state.progress.errors, execute, toast])

  // Memoized performance metrics
  const metrics = useMemo(() => {
    if (!enablePerformanceMonitoring) return null

    return {
      ...performanceMetrics.current,
      totalDuration: operationStartTime.current > 0 
        ? Date.now() - operationStartTime.current 
        : 0
    }
  }, [enablePerformanceMonitoring, state.progress.completed, state.progress.failed])

  return {
    /** Execute bulk operation */
    execute,
    /** Current operation state */
    state,
    /** Cancel running operation */
    cancel,
    /** Pause operation (placeholder) */
    pause,
    /** Resume operation (placeholder) */
    resume,
    /** Retry failed operations */
    retry: retry_,
    /** Performance metrics */
    metrics,
    /** Utilities */
    utils: {
      /** Get failed items */
      getFailedItems: () => state.progress.errors.map(error => error.item),
      /** Get successful results */
      getSuccessfulResults: () => state.progress.results,
      /** Calculate success rate */
      getSuccessRate: () => {
        const total = state.progress.completed + state.progress.failed
        return total > 0 ? (state.progress.completed / total) * 100 : 0
      }
    }
  }
}

/**
 * Export hook as default
 */
export default useBulkOperations