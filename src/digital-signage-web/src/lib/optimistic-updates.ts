/**
 * Optimistic Updates System
 * 
 * Provides optimistic update capabilities for better user experience during
 * bulk operations and real-time interactions, with rollback functionality.
 * 
 * @see T029 - Optimistic updates for better user experience
 */

import { useCallback, useReducer, useRef, useEffect } from 'react'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

// Type constraint for items with ID
export interface WithId {
  id: string
}

export interface OptimisticAction<T = any> {
  id: string
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'BULK_UPDATE' | 'BULK_DELETE'
  payload: T
  timestamp: number
  reversePayload?: T
}

export interface OptimisticState<T extends WithId> {
  data: T[]
  pendingActions: OptimisticAction[]
  errors: Record<string, Error | undefined>
}

export interface OptimisticUpdateOptions {
  maxPendingActions?: number
  autoRollbackTimeout?: number
  enableLogging?: boolean
}

export interface BulkOperationOptions<T> {
  items: T[]
  operation: 'update' | 'delete' | 'create'
  getItemId: (item: T) => string
  batchSize?: number
  rollbackOnError?: boolean
}

// ============================================================================
// OPTIMISTIC REDUCER
// ============================================================================

type OptimisticReducerAction<T> =
  | { type: 'ADD_PENDING'; action: OptimisticAction<T> }
  | { type: 'CONFIRM_ACTION'; actionId: string }
  | { type: 'ROLLBACK_ACTION'; actionId: string; error?: Error }
  | { type: 'ROLLBACK_ALL' }
  | { type: 'SET_DATA'; data: T[] }
  | { type: 'CLEAR_ERRORS' }

function optimisticReducer<T extends WithId>(
  state: OptimisticState<T>,
  action: OptimisticReducerAction<T>
): OptimisticState<T> {
  switch (action.type) {
    case 'SET_DATA':
      return {
        ...state,
        data: action.data,
      }

    case 'ADD_PENDING': {
      const optimisticAction = action.action
      let updatedData = [...state.data]

      // Apply optimistic update to data
      switch (optimisticAction.type) {
        case 'CREATE':
          updatedData.push(optimisticAction.payload)
          break

        case 'UPDATE':
          const updateIndex = updatedData.findIndex(
            (item: any) => item.id === optimisticAction.payload.id
          )
          if (updateIndex !== -1) {
            updatedData[updateIndex] = {
              ...updatedData[updateIndex],
              ...optimisticAction.payload,
            }
          }
          break

        case 'DELETE':
          updatedData = updatedData.filter(
            (item: any) => item.id !== optimisticAction.payload.id
          )
          break

        case 'BULK_UPDATE':
          if (Array.isArray(optimisticAction.payload)) {
            optimisticAction.payload.forEach((update: any) => {
              const index = updatedData.findIndex((item: any) => item.id === update.id)
              if (index !== -1) {
                updatedData[index] = { ...updatedData[index], ...update }
              }
            })
          }
          break

        case 'BULK_DELETE':
          if (Array.isArray(optimisticAction.payload)) {
            const idsToDelete = new Set(optimisticAction.payload.map((item: any) => item.id))
            updatedData = updatedData.filter((item: any) => !idsToDelete.has(item.id))
          }
          break

        default:
          break
      }

      return {
        ...state,
        data: updatedData,
        pendingActions: [...state.pendingActions, optimisticAction],
      }
    }

    case 'CONFIRM_ACTION':
      return {
        ...state,
        pendingActions: state.pendingActions.filter(
          (pendingAction) => pendingAction.id !== action.actionId
        ),
        errors: {
          ...state.errors,
          [action.actionId]: undefined,
        },
      }

    case 'ROLLBACK_ACTION': {
      const actionToRollback = state.pendingActions.find(
        (pendingAction) => pendingAction.id === action.actionId
      )

      if (!actionToRollback) {
        return state
      }

      let rolledBackData = [...state.data]

      // Reverse the optimistic update
      switch (actionToRollback.type) {
        case 'CREATE':
          rolledBackData = rolledBackData.filter(
            (item: any) => item.id !== actionToRollback.payload.id
          )
          break

        case 'UPDATE':
          if (actionToRollback.reversePayload) {
            const index = rolledBackData.findIndex(
              (item: any) => item.id === actionToRollback.payload.id
            )
            if (index !== -1) {
              rolledBackData[index] = actionToRollback.reversePayload
            }
          }
          break

        case 'DELETE':
          if (actionToRollback.reversePayload) {
            rolledBackData.push(actionToRollback.reversePayload)
          }
          break

        case 'BULK_UPDATE':
          if (actionToRollback.reversePayload && Array.isArray(actionToRollback.reversePayload)) {
            actionToRollback.reversePayload.forEach((originalItem: any) => {
              const index = rolledBackData.findIndex(
                (item: any) => item.id === originalItem.id
              )
              if (index !== -1) {
                rolledBackData[index] = originalItem
              }
            })
          }
          break

        case 'BULK_DELETE':
          if (actionToRollback.reversePayload && Array.isArray(actionToRollback.reversePayload)) {
            rolledBackData.push(...actionToRollback.reversePayload)
          }
          break

        default:
          break
      }

      return {
        ...state,
        data: rolledBackData,
        pendingActions: state.pendingActions.filter(
          (pendingAction) => pendingAction.id !== action.actionId
        ),
        errors: {
          ...state.errors,
          [action.actionId]: action.error || new Error('Action rolled back'),
        },
      }
    }

    case 'ROLLBACK_ALL': {
      // Need to rollback all pending actions in reverse order
      let rolledBackData = [...state.data]
      const reversedActions = [...state.pendingActions].reverse()

      reversedActions.forEach((actionToRollback) => {
        switch (actionToRollback.type) {
          case 'CREATE':
            rolledBackData = rolledBackData.filter(
              (item: any) => item.id !== actionToRollback.payload.id
            )
            break

          case 'UPDATE':
            if (actionToRollback.reversePayload) {
              const index = rolledBackData.findIndex(
                (item: any) => item.id === actionToRollback.payload.id
              )
              if (index !== -1) {
                rolledBackData[index] = actionToRollback.reversePayload
              }
            }
            break

          case 'DELETE':
            if (actionToRollback.reversePayload) {
              rolledBackData.push(actionToRollback.reversePayload)
            }
            break

          case 'BULK_UPDATE':
            if (actionToRollback.reversePayload && Array.isArray(actionToRollback.reversePayload)) {
              actionToRollback.reversePayload.forEach((originalItem: any) => {
                const index = rolledBackData.findIndex(
                  (item: any) => item.id === originalItem.id
                )
                if (index !== -1) {
                  rolledBackData[index] = originalItem
                }
              })
            }
            break

          case 'BULK_DELETE':
            if (actionToRollback.reversePayload && Array.isArray(actionToRollback.reversePayload)) {
              rolledBackData.push(...actionToRollback.reversePayload)
            }
            break

          default:
            break
        }
      })

      return {
        ...state,
        data: rolledBackData,
        pendingActions: [],
        errors: {},
      }
    }

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {},
      }

    default:
      return state
  }
}

// ============================================================================
// OPTIMISTIC UPDATES HOOK
// ============================================================================

export interface UseOptimisticUpdatesResult<T extends WithId> {
  data: T[]
  pendingActions: OptimisticAction[]
  errors: Record<string, Error | undefined>
  isLoading: boolean
  
  // Core operations
  optimisticCreate: (item: T) => Promise<string>
  optimisticUpdate: (item: T, originalItem?: T) => Promise<string>
  optimisticDelete: (item: T) => Promise<string>
  
  // Bulk operations
  optimisticBulkUpdate: (items: T[], originalItems?: T[]) => Promise<string>
  optimisticBulkDelete: (items: T[]) => Promise<string>
  
  // Control operations
  confirmAction: (actionId: string) => void
  rollbackAction: (actionId: string, error?: Error) => void
  rollbackAll: () => void
  clearErrors: () => void
  
  // State management
  setData: (data: T[]) => void
  refreshData: () => Promise<void>
}

export function useOptimisticUpdates<T extends WithId>(
  initialData: T[] = [],
  dataFetcher?: () => Promise<T[]>,
  options: OptimisticUpdateOptions = {}
): UseOptimisticUpdatesResult<T> {
  const {
    maxPendingActions = 50,
    autoRollbackTimeout = 30000,
    enableLogging = false,
  } = options

  const [state, dispatch] = useReducer(optimisticReducer<T>, {
    data: initialData,
    pendingActions: [],
    errors: {},
  })

  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const isLoadingRef = useRef(false)

  // Auto-rollback timeout handler
  const setupAutoRollback = useCallback((actionId: string) => {
    if (autoRollbackTimeout > 0) {
      const timeout = setTimeout(() => {
        if (enableLogging) {
          console.warn(`Auto-rolling back action ${actionId} after timeout`)
        }
        dispatch({ 
          type: 'ROLLBACK_ACTION', 
          actionId, 
          error: new Error('Action timed out') 
        })
      }, autoRollbackTimeout)

      timeoutsRef.current.set(actionId, timeout)
    }
  }, [autoRollbackTimeout, enableLogging])

  const clearAutoRollback = useCallback((actionId: string) => {
    const timeout = timeoutsRef.current.get(actionId)
    if (timeout) {
      clearTimeout(timeout)
      timeoutsRef.current.delete(actionId)
    }
  }, [])

  // Generate unique action ID
  const generateActionId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Core operations
  const optimisticCreate = useCallback(async (item: T): Promise<string> => {
    const actionId = generateActionId()
    const action: OptimisticAction<T> = {
      id: actionId,
      type: 'CREATE',
      payload: item,
      timestamp: Date.now(),
    }

    dispatch({ type: 'ADD_PENDING', action })
    setupAutoRollback(actionId)

    if (enableLogging) {
      console.log('Optimistic create:', actionId, item)
    }

    return actionId
  }, [generateActionId, setupAutoRollback, enableLogging])

  const optimisticUpdate = useCallback(async (
    item: T,
    originalItem?: T
  ): Promise<string> => {
    const actionId = generateActionId()
    const action: OptimisticAction<T> = {
      id: actionId,
      type: 'UPDATE',
      payload: item,
      timestamp: Date.now(),
      ...(originalItem && { reversePayload: originalItem }),
    }

    dispatch({ type: 'ADD_PENDING', action })
    setupAutoRollback(actionId)

    if (enableLogging) {
      console.log('Optimistic update:', actionId, item)
    }

    return actionId
  }, [generateActionId, setupAutoRollback, enableLogging])

  const optimisticDelete = useCallback(async (item: T): Promise<string> => {
    const actionId = generateActionId()
    const action: OptimisticAction<T> = {
      id: actionId,
      type: 'DELETE',
      payload: item,
      reversePayload: item,
      timestamp: Date.now(),
    }

    dispatch({ type: 'ADD_PENDING', action })
    setupAutoRollback(actionId)

    if (enableLogging) {
      console.log('Optimistic delete:', actionId, item)
    }

    return actionId
  }, [generateActionId, setupAutoRollback, enableLogging])

  // Bulk operations
  const optimisticBulkUpdate = useCallback(async (
    items: T[],
    originalItems?: T[]
  ): Promise<string> => {
    const actionId = generateActionId()
    const action: OptimisticAction<T[]> = {
      id: actionId,
      type: 'BULK_UPDATE',
      payload: items,
      timestamp: Date.now(),
      ...(originalItems && { reversePayload: originalItems }),
    }

    dispatch({ type: 'ADD_PENDING', action: action as unknown as OptimisticAction<T> })
    setupAutoRollback(actionId)

    if (enableLogging) {
      console.log('Optimistic bulk update:', actionId, items.length, 'items')
    }

    return actionId
  }, [generateActionId, setupAutoRollback, enableLogging])

  const optimisticBulkDelete = useCallback(async (items: T[]): Promise<string> => {
    const actionId = generateActionId()
    const action: OptimisticAction<T[]> = {
      id: actionId,
      type: 'BULK_DELETE',
      payload: items,
      reversePayload: items,
      timestamp: Date.now(),
    }

    dispatch({ type: 'ADD_PENDING', action: action as unknown as OptimisticAction<T> })
    setupAutoRollback(actionId)

    if (enableLogging) {
      console.log('Optimistic bulk delete:', actionId, items.length, 'items')
    }

    return actionId
  }, [generateActionId, setupAutoRollback, enableLogging])

  // Control operations
  const confirmAction = useCallback((actionId: string) => {
    clearAutoRollback(actionId)
    dispatch({ type: 'CONFIRM_ACTION', actionId })

    if (enableLogging) {
      console.log('Confirmed action:', actionId)
    }
  }, [clearAutoRollback, enableLogging])

  const rollbackAction = useCallback((actionId: string, error?: Error) => {
    clearAutoRollback(actionId)
    dispatch({ type: 'ROLLBACK_ACTION', actionId, ...(error && { error }) })

    if (enableLogging) {
      console.log('Rolled back action:', actionId, error?.message)
    }
  }, [clearAutoRollback, enableLogging])

  const rollbackAll = useCallback(() => {
    // Clear all timeouts
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
    timeoutsRef.current.clear()

    dispatch({ type: 'ROLLBACK_ALL' })

    if (enableLogging) {
      console.log('Rolled back all actions')
    }
  }, [enableLogging])

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' })
  }, [])

  // State management
  const setData = useCallback((data: T[]) => {
    dispatch({ type: 'SET_DATA', data })
  }, [])

  const refreshData = useCallback(async () => {
    if (!dataFetcher || isLoadingRef.current) return

    try {
      isLoadingRef.current = true
      const freshData = await dataFetcher()
      setData(freshData)
    } catch (error) {
      if (enableLogging) {
        console.error('Failed to refresh data:', error)
      }
    } finally {
      isLoadingRef.current = false
    }
  }, [dataFetcher, setData, enableLogging])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
      timeoutsRef.current.clear()
    }
  }, [])

  // Limit pending actions
  useEffect(() => {
    if (state.pendingActions.length > maxPendingActions) {
      const excessActions = state.pendingActions.slice(0, state.pendingActions.length - maxPendingActions)
      excessActions.forEach((action) => {
        rollbackAction(action.id, new Error('Exceeded max pending actions'))
      })
    }
  }, [state.pendingActions.length, maxPendingActions, rollbackAction])

  return {
    data: state.data,
    pendingActions: state.pendingActions,
    errors: state.errors,
    isLoading: isLoadingRef.current,
    
    optimisticCreate,
    optimisticUpdate,
    optimisticDelete,
    optimisticBulkUpdate,
    optimisticBulkDelete,
    
    confirmAction,
    rollbackAction,
    rollbackAll,
    clearErrors,
    
    setData,
    refreshData,
  }
}

// ============================================================================
// BATCH OPTIMISTIC OPERATIONS
// ============================================================================

export class OptimisticBatchProcessor<T extends WithId> {
  private batchQueue: Array<{
    operation: 'create' | 'update' | 'delete'
    item: T
    originalItem?: T
    resolve: (actionId: string) => void
    reject: (error: Error) => void
  }> = []

  private flushTimer: NodeJS.Timeout | null = null
  private isProcessing = false

  constructor(
    private optimisticUpdates: UseOptimisticUpdatesResult<T>,
    private batchSize = 50,
    private batchDelay = 100
  ) {}

  async create(item: T): Promise<string> {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({
        operation: 'create',
        item,
        resolve,
        reject,
      })
      this.scheduleBatchFlush()
    })
  }

  async update(item: T, originalItem?: T): Promise<string> {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({
        operation: 'update',
        item,
        ...(originalItem && { originalItem }),
        resolve,
        reject,
      })
      this.scheduleBatchFlush()
    })
  }

  async delete(item: T): Promise<string> {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({
        operation: 'delete',
        item,
        resolve,
        reject,
      })
      this.scheduleBatchFlush()
    })
  }

  private scheduleBatchFlush(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
    }

    if (this.batchQueue.length >= this.batchSize) {
      this.flushBatch()
    } else {
      this.flushTimer = setTimeout(() => this.flushBatch(), this.batchDelay)
    }
  }

  private async flushBatch(): Promise<void> {
    if (this.isProcessing || this.batchQueue.length === 0) {
      return
    }

    this.isProcessing = true

    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }

    const batch = this.batchQueue.splice(0, this.batchSize)

    try {
      // Group by operation type
      const createItems = batch.filter(item => item.operation === 'create')
      const updateItems = batch.filter(item => item.operation === 'update')
      const deleteItems = batch.filter(item => item.operation === 'delete')

      // Process bulk operations
      const promises: Promise<void>[] = []

      if (createItems.length > 0) {
        promises.push(
          this.optimisticUpdates.optimisticBulkUpdate(
            createItems.map(item => item.item)
          ).then(actionId => {
            createItems.forEach(item => item.resolve(actionId))
          })
        )
      }

      if (updateItems.length > 0) {
        promises.push(
          this.optimisticUpdates.optimisticBulkUpdate(
            updateItems.map(item => item.item),
            updateItems.map(item => item.originalItem).filter(Boolean) as T[]
          ).then(actionId => {
            updateItems.forEach(item => item.resolve(actionId))
          })
        )
      }

      if (deleteItems.length > 0) {
        promises.push(
          this.optimisticUpdates.optimisticBulkDelete(
            deleteItems.map(item => item.item)
          ).then(actionId => {
            deleteItems.forEach(item => item.resolve(actionId))
          })
        )
      }

      await Promise.all(promises)
    } catch (error) {
      // Reject all items in the batch
      batch.forEach(item => {
        item.reject(error instanceof Error ? error : new Error('Batch processing failed'))
      })
    } finally {
      this.isProcessing = false

      // Process any remaining items
      if (this.batchQueue.length > 0) {
        this.scheduleBatchFlush()
      }
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }

    // Reject any pending operations
    this.batchQueue.forEach(item => {
      item.reject(new Error('Batch processor destroyed'))
    })
    this.batchQueue = []
  }
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for batch optimistic operations
 */
export function useOptimisticBatch<T extends WithId>(
  optimisticUpdates: UseOptimisticUpdatesResult<T>,
  batchSize = 50,
  batchDelay = 100
) {
  const batchProcessorRef = useRef<OptimisticBatchProcessor<T> | null>(null)

  if (!batchProcessorRef.current) {
    batchProcessorRef.current = new OptimisticBatchProcessor(
      optimisticUpdates,
      batchSize,
      batchDelay
    )
  }

  useEffect(() => {
    return () => {
      batchProcessorRef.current?.destroy()
    }
  }, [])

  return {
    create: (item: T) => batchProcessorRef.current!.create(item),
    update: (item: T, originalItem?: T) => 
      batchProcessorRef.current!.update(item, originalItem),
    delete: (item: T) => batchProcessorRef.current!.delete(item),
  }
}