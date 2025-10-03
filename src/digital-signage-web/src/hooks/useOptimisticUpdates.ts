/**
 * useOptimisticUpdates Hook
 * 
 * Hook for managing optimistic updates with automatic rollback,
 * conflict resolution, and update queuing/batching.
 * 
 * @see copilot-instructions-web.md - State Management Rules
 * @see specs/021-user-schedule-assignment/tasks.md - T034 Requirements
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { useToast } from './useToast'

export interface OptimisticUpdate<T = any> {
  /** Unique identifier for the update */
  id: string
  /** Type of operation */
  type: string
  /** Timestamp when update was created */
  timestamp: number
  /** The optimistic data */
  data: T
  /** Previous data for rollback */
  previousData?: T
  /** Status of the update */
  status: 'pending' | 'confirmed' | 'failed' | 'rolled-back'
  /** Retry count */
  retryCount: number
  /** Maximum retry attempts */
  maxRetries: number
  /** Timeout for automatic rollback */
  timeout: number
  /** Additional metadata */
  metadata?: Record<string, any>
}

export interface OptimisticUpdatesConfig {
  /** Default timeout for automatic rollback (ms) */
  defaultTimeout?: number
  /** Maximum number of retries per update */
  maxRetries?: number
  /** Enable batching of updates */
  enableBatching?: boolean
  /** Batch size for processing updates */
  batchSize?: number
  /** Batch timeout (ms) */
  batchTimeout?: number
  /** Conflict resolution strategy */
  conflictResolution?: 'latest-wins' | 'merge' | 'manual'
  /** Enable automatic rollback on timeout */
  enableAutoRollback?: boolean
  /** Custom conflict resolver */
  conflictResolver?: <T>(current: T, incoming: T, type: string) => T
  /** Success callback */
  onSuccess?: (update: OptimisticUpdate) => void
  /** Error callback */
  onError?: (update: OptimisticUpdate, error: unknown) => void
  /** Rollback callback */
  onRollback?: (update: OptimisticUpdate) => void
}

export interface OptimisticUpdatesState<T = any> {
  /** All optimistic updates */
  updates: OptimisticUpdate<T>[]
  /** Pending updates count */
  pendingCount: number
  /** Failed updates count */
  failedCount: number
  /** Confirmed updates count */
  confirmedCount: number
  /** Whether updates are being processed */
  isProcessing: boolean
}

export interface OptimisticUpdatesResult<T = any> {
  /** Current state */
  state: OptimisticUpdatesState<T>
  /** Add optimistic update */
  addUpdate: (update: Omit<OptimisticUpdate<T>, 'id' | 'timestamp' | 'status' | 'retryCount'>) => string
  /** Confirm update as successful */
  confirmUpdate: (id: string) => void
  /** Mark update as failed and trigger rollback */
  failUpdate: (id: string, error?: unknown) => void
  /** Manually rollback update */
  rollbackUpdate: (id: string) => void
  /** Retry failed update */
  retryUpdate: (id: string) => void
  /** Clear all updates */
  clearUpdates: () => void
  /** Clear completed updates (confirmed/rolled-back) */
  clearCompleted: () => void
  /** Get update by id */
  getUpdate: (id: string) => OptimisticUpdate<T> | undefined
  /** Get updates by type */
  getUpdatesByType: (type: string) => OptimisticUpdate<T>[]
  /** Get pending updates */
  getPendingUpdates: () => OptimisticUpdate<T>[]
  /** Check if update exists */
  hasUpdate: (id: string) => boolean
  /** Apply optimistic data with conflict resolution */
  applyOptimisticData: <U>(baseData: U, transformer: (data: U, update: OptimisticUpdate<T>) => U) => U
}

/**
 * Hook for managing optimistic updates with advanced features
 * 
 * @example
 * ```tsx
 * const {
 *   addUpdate,
 *   confirmUpdate,
 *   failUpdate,
 *   applyOptimisticData,
 *   state
 * } = useOptimisticUpdates({
 *   defaultTimeout: 10000,
 *   maxRetries: 3,
 *   enableAutoRollback: true
 * })
 * 
 * const handleAssignSchedule = async (userId: number, scheduleId: number) => {
 *   // Add optimistic update
 *   const updateId = addUpdate({
 *     type: 'assign-schedule',
 *     data: { userId, scheduleId },
 *     previousData: currentUserSchedules,
 *     maxRetries: 2,
 *     timeout: 5000
 *   })
 *   
 *   try {
 *     await assignScheduleApi(userId, scheduleId)
 *     confirmUpdate(updateId)
 *   } catch (error) {
 *     failUpdate(updateId, error)
 *   }
 * }
 * 
 * // Apply optimistic updates to data
 * const optimisticSchedules = applyOptimisticData(baseSchedules, (data, update) => {
 *   if (update.type === 'assign-schedule') {
 *     return [...data, update.data]
 *   }
 *   return data
 * })
 * ```
 */
export function useOptimisticUpdates<T = any>(
  config: OptimisticUpdatesConfig = {}
): OptimisticUpdatesResult<T> {
  const {
    defaultTimeout = 10000,
    maxRetries = 3,
    enableBatching = false,
    batchSize = 10,
    batchTimeout = 1000,
    conflictResolution = 'latest-wins',
    enableAutoRollback = true,
    conflictResolver,
    onSuccess,
    onError,
    onRollback
  } = config

  const { toast } = useToast()
  const [updates, setUpdates] = useState<OptimisticUpdate<T>[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Refs for timers and batching
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const batchQueue = useRef<string[]>([])
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Generate unique ID for updates
  const generateId = useCallback(() => {
    return `optimistic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Add optimistic update
  const addUpdate = useCallback((
    updateData: Omit<OptimisticUpdate<T>, 'id' | 'timestamp' | 'status' | 'retryCount'>
  ): string => {
    const id = generateId()
    const timestamp = Date.now()
    
    const update: OptimisticUpdate<T> = {
      ...updateData,
      id,
      timestamp,
      status: 'pending',
      retryCount: 0,
      maxRetries: updateData.maxRetries || maxRetries,
      timeout: updateData.timeout || defaultTimeout
    }

    setUpdates(prev => {
      // Check for conflicts
      const existingUpdate = prev.find(u => 
        u.type === update.type && 
        u.status === 'pending' &&
        JSON.stringify(u.data) === JSON.stringify(update.data)
      )

      if (existingUpdate) {
        console.warn('Duplicate optimistic update detected:', update.type)
        return prev
      }

      // Apply conflict resolution
      if (conflictResolution === 'latest-wins') {
        return [...prev.filter(u => !(u.type === update.type && u.status === 'pending')), update]
      } else if (conflictResolution === 'merge' && conflictResolver) {
        const conflictingUpdate = prev.find(u => u.type === update.type && u.status === 'pending')
        if (conflictingUpdate) {
          const mergedData = conflictResolver(conflictingUpdate.data, update.data, update.type)
          const mergedUpdate = { ...update, data: mergedData }
          return [...prev.filter(u => u.id !== conflictingUpdate.id), mergedUpdate]
        }
      }

      return [...prev, update]
    })

    // Set up automatic rollback timeout
    if (enableAutoRollback && update.timeout > 0) {
      const timeoutId = setTimeout(() => {
        setUpdates(prev => {
          const currentUpdate = prev.find(u => u.id === id)
          if (currentUpdate && currentUpdate.status === 'pending') {
            console.warn(`Optimistic update timed out: ${id}`)
            onRollback?.(currentUpdate)
            toast({
              title: 'Update timed out',
              description: 'The operation took too long and was rolled back',
              variant: 'warning'
            })
            return prev.map(u => 
              u.id === id 
                ? { ...u, status: 'rolled-back' as const }
                : u
            )
          }
          return prev
        })
      }, update.timeout)

      timeoutRefs.current.set(id, timeoutId)
    }

    // Add to batch queue if batching is enabled
    if (enableBatching) {
      batchQueue.current.push(id)
      
      if (batchQueue.current.length >= batchSize) {
        processBatch()
      } else if (!batchTimeoutRef.current) {
        batchTimeoutRef.current = setTimeout(processBatch, batchTimeout)
      }
    }

    return id
  }, [
    generateId,
    maxRetries,
    defaultTimeout,
    enableAutoRollback,
    conflictResolution,
    conflictResolver,
    onRollback,
    toast,
    enableBatching,
    batchSize,
    batchTimeout
  ])

  // Process batch of updates
  const processBatch = useCallback(() => {
    if (batchQueue.current.length === 0) return

    setIsProcessing(true)
    
    // Process batch updates here
    console.log(`Processing batch of ${batchQueue.current.length} updates`)
    
    // Clear batch
    batchQueue.current = []
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current)
      batchTimeoutRef.current = null
    }
    
    setIsProcessing(false)
  }, [])

  // Confirm update as successful
  const confirmUpdate = useCallback((id: string) => {
    setUpdates(prev => {
      const update = prev.find(u => u.id === id)
      if (!update) return prev

      // Clear timeout
      const timeoutId = timeoutRefs.current.get(id)
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutRefs.current.delete(id)
      }

      onSuccess?.(update)
      
      return prev.map(u => 
        u.id === id 
          ? { ...u, status: 'confirmed' as const }
          : u
      )
    })
  }, [onSuccess])

  // Mark update as failed and trigger rollback
  const failUpdate = useCallback((id: string, error?: unknown) => {
    setUpdates(prev => {
      const update = prev.find(u => u.id === id)
      if (!update) return prev

      // Clear timeout
      const timeoutId = timeoutRefs.current.get(id)
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutRefs.current.delete(id)
      }

      onError?.(update, error)
      onRollback?.(update)

      toast({
        title: 'Update failed',
        description: 'The operation failed and was rolled back',
        variant: 'destructive'
      })

      return prev.map(u => 
        u.id === id 
          ? { ...u, status: 'failed' as const }
          : u
      )
    })
  }, [onError, onRollback, toast])

  // Manually rollback update
  const rollbackUpdate = useCallback((id: string) => {
    setUpdates(prev => {
      const update = prev.find(u => u.id === id)
      if (!update) return prev

      // Clear timeout
      const timeoutId = timeoutRefs.current.get(id)
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutRefs.current.delete(id)
      }

      onRollback?.(update)

      return prev.map(u => 
        u.id === id 
          ? { ...u, status: 'rolled-back' as const }
          : u
      )
    })
  }, [onRollback])

  // Retry failed update
  const retryUpdate = useCallback((id: string) => {
    setUpdates(prev => {
      const update = prev.find(u => u.id === id)
      if (!update || update.status !== 'failed') return prev

      if (update.retryCount >= update.maxRetries) {
        toast({
          title: 'Retry limit reached',
          description: 'This update has reached the maximum number of retries',
          variant: 'warning'
        })
        return prev
      }

      // Reset status and increment retry count
      return prev.map(u => 
        u.id === id 
          ? { 
              ...u, 
              status: 'pending' as const, 
              retryCount: u.retryCount + 1,
              timestamp: Date.now()
            }
          : u
      )
    })
  }, [toast])

  // Clear all updates
  const clearUpdates = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach((timeoutId) => {
      clearTimeout(timeoutId)
    })
    timeoutRefs.current.clear()

    setUpdates([])
  }, [])

  // Clear completed updates
  const clearCompleted = useCallback(() => {
    setUpdates(prev => prev.filter(u => u.status === 'pending'))
  }, [])

  // Get update by id
  const getUpdate = useCallback((id: string) => {
    return updates.find(u => u.id === id)
  }, [updates])

  // Get updates by type
  const getUpdatesByType = useCallback((type: string) => {
    return updates.filter(u => u.type === type)
  }, [updates])

  // Get pending updates
  const getPendingUpdates = useCallback(() => {
    return updates.filter(u => u.status === 'pending')
  }, [updates])

  // Check if update exists
  const hasUpdate = useCallback((id: string) => {
    return updates.some(u => u.id === id)
  }, [updates])

  // Apply optimistic data with conflict resolution
  const applyOptimisticData = useCallback(<U,>(
    baseData: U,
    transformer: (data: U, update: OptimisticUpdate<T>) => U
  ): U => {
    const pendingUpdates = updates.filter(u => u.status === 'pending')
    
    return pendingUpdates.reduce((accData, update) => {
      try {
        return transformer(accData, update)
      } catch (error) {
        console.error('Error applying optimistic update:', error, update)
        return accData
      }
    }, baseData)
  }, [updates])

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clear all timeouts on unmount
      timeoutRefs.current.forEach((timeoutId) => {
        clearTimeout(timeoutId)
      })
      timeoutRefs.current.clear()

      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current)
      }
    }
  }, [])

  // Calculate state
  const state: OptimisticUpdatesState<T> = {
    updates,
    pendingCount: updates.filter(u => u.status === 'pending').length,
    failedCount: updates.filter(u => u.status === 'failed').length,
    confirmedCount: updates.filter(u => u.status === 'confirmed').length,
    isProcessing
  }

  return {
    state,
    addUpdate,
    confirmUpdate,
    failUpdate,
    rollbackUpdate,
    retryUpdate,
    clearUpdates,
    clearCompleted,
    getUpdate,
    getUpdatesByType,
    getPendingUpdates,
    hasUpdate,
    applyOptimisticData
  }
}

export default useOptimisticUpdates