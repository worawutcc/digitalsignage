/**
 * useEnhancedUserScheduleAssignment Hook
 * 
 * Enhanced hook that combines existing user schedule hooks with optimistic updates,
 * bulk operations, real-time sync, and advanced caching strategies.
 * 
 * @see copilot-instructions-web.md - State Management Rules
 * @see specs/021-user-schedule-assignment/tasks.md - T021 Requirements
 */

import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query'
import { useUserSchedules } from './useUserSchedules'
import { useRemoveUserSchedules } from './useRemoveUserSchedules'
import { userScheduleService } from '../services/userScheduleService'
import { useToast } from '@/hooks/useToast'
import type { 
  GetUserSchedulesResponse, 
  AssignSchedulesRequest,
  RemoveSchedulesResponse,
  UserSchedule 
} from '../types/userSchedule'

// Enhanced configuration options
export interface EnhancedUserScheduleAssignmentOptions {
  // Basic options
  /** User ID to manage schedules for */
  userId: number
  
  // Optimistic updates
  /** Enable optimistic UI updates */
  enableOptimisticUpdates?: boolean
  /** Rollback timeout in milliseconds */
  rollbackTimeout?: number
  
  // Real-time sync
  /** Enable real-time synchronization */
  enableRealTimeSync?: boolean
  /** WebSocket endpoint for real-time updates */
  realTimeSyncEndpoint?: string
  /** Sync interval in milliseconds */
  syncInterval?: number
  
  // Enhanced caching
  /** Enable aggressive caching strategies */
  enableEnhancedCaching?: boolean
  /** Cache prefetch strategy */
  prefetchStrategy?: 'none' | 'related' | 'predictive'
  /** Background refetch interval */
  backgroundRefetchInterval?: number
  
  // Performance monitoring
  /** Enable performance monitoring */
  enablePerformanceMonitoring?: boolean
  /** Performance metrics callback */
  onPerformanceMetric?: (metric: PerformanceMetric) => void
  
  // Analytics
  /** Enable analytics tracking */
  enableAnalytics?: boolean
  /** Analytics event callback */
  onAnalyticsEvent?: (eventName: string, data: any) => void
  
  // Callbacks
  /** Success callback for operations */
  onSuccess?: (operation: string, data: any) => void
  /** Error callback for operations */
  onError: (
      operationType: 'assign' | 'remove',
      error: unknown
    ) => void
}

interface PerformanceMetric {
  type: 'render' | 'interaction' | 'memory' | 'network'
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count'
  timestamp: number
}

interface OptimisticUpdate {
  id: string
  type: 'assign' | 'remove' | 'reorder'
  timestamp: number
  data: any
  rollbackData?: any
}

interface BulkOperationProgress {
  total: number
  completed: number
  failed: number
  currentItem?: string
  errors: Array<{ item: string; error: string }>
}

/**
 * Enhanced user schedule assignment hook with advanced features
 */
export function useEnhancedUserScheduleAssignment(
  options: EnhancedUserScheduleAssignmentOptions
) {
  const {
    userId,
    enableOptimisticUpdates = true,
    rollbackTimeout = 5000,
    enableRealTimeSync = false,
    realTimeSyncEndpoint,
    syncInterval = 30000,
    enableEnhancedCaching = true,
    prefetchStrategy = 'related',
    backgroundRefetchInterval = 60000,
    enablePerformanceMonitoring = false,
    onPerformanceMetric,
    enableAnalytics = false,
    onAnalyticsEvent,
    onSuccess,
    onError,
  } = options
  
  // Core dependencies
  const queryClient = useQueryClient()
  const toast = useToast()
  
  // Enhanced state management
  const [optimisticUpdates, setOptimisticUpdates] = useState<OptimisticUpdate[]>([])
  const [bulkOperationProgress, setBulkOperationProgress] = useState<BulkOperationProgress | null>(null)
  const [isRealTimeSyncActive, setIsRealTimeSyncActive] = useState(false)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([])
  
  // Refs for performance monitoring
  const operationStartTime = useRef<number>(0)
  const wsRef = useRef<WebSocket | null>(null)
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Base hooks - enhanced with caching options
  const userSchedulesQuery = useUserSchedules(userId, {
    enabled: userId > 0,
    refetchInterval: backgroundRefetchInterval,
    refetchOnWindowFocus: true,
  })
  
  const removeSchedulesMutation = useRemoveUserSchedules({
    onSuccess: (data) => {
      trackAnalytics('schedules_removed', { userId, count: data.removedCount })
      onSuccess?.('remove', data)
    },
    onError: (error) => {
      onError?.('remove', error)
    }
  })
  
  // Enhanced assign schedules mutation with optimistic updates
  const assignSchedulesMutation = useMutation({
    mutationFn: (request: AssignSchedulesRequest) => userScheduleService.assignSchedules(request.userId, request.scheduleIds),
    onMutate: async (request) => {
      if (!enableOptimisticUpdates) return
      
      // Track performance
      operationStartTime.current = Date.now()
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['userSchedules', userId] })
      
      // Snapshot the previous value
      const previousSchedules = queryClient.getQueryData(['userSchedules', userId])
      
      // Create optimistic update
      const optimisticId = `assign-${Date.now()}`
      const optimisticUpdate: OptimisticUpdate = {
        id: optimisticId,
        type: 'assign',
        timestamp: Date.now(),
        data: request,
        rollbackData: previousSchedules
      }
      
      setOptimisticUpdates(prev => [...prev, optimisticUpdate])
      
        // Optimistically update the cache
        queryClient.setQueryData(['userSchedules', userId], (old: GetUserSchedulesResponse | undefined) => {
          if (!old) return old
          
          // This is a simplified optimistic update - add placeholder UserSchedule objects
          const newSchedules: UserSchedule[] = request.scheduleIds.map(scheduleId => ({
            userId: request.userId,
            scheduleId,
            scheduleName: `Schedule ${scheduleId}`,
            scheduleDescription: 'Loading...',
            isActive: true,
            assignedAt: new Date().toISOString(),
            assignedBy: 'Current User'
          }))
          
          return {
            ...old,
            schedules: [...old.schedules, ...newSchedules],
            totalCount: old.totalCount + newSchedules.length
          }
        })
      
      return { previousSchedules, optimisticId }
    },
    onError: (error, request, context) => {
      // Rollback optimistic update
      if (context?.previousSchedules) {
        queryClient.setQueryData(['userSchedules', userId], context.previousSchedules)
      }
      
      if (context?.optimisticId) {
        setOptimisticUpdates(prev => prev.filter(update => update.id !== context.optimisticId))
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      trackAnalytics('schedule_assignment_failed', { userId, error: errorMessage })
      onError?.('assign', error)
      toast.toast({ title: 'Failed to assign schedules', variant: 'destructive' })
    },
    onSuccess: (data, request, context) => {
      // Clear optimistic update
      if (context?.optimisticId) {
        setOptimisticUpdates(prev => prev.filter(update => update.id !== context.optimisticId))
      }
      
      // Track performance
      if (enablePerformanceMonitoring && onPerformanceMetric) {
        const duration = Date.now() - operationStartTime.current
        onPerformanceMetric({
          type: 'interaction',
          name: 'schedule_assignment',
          value: duration,
          unit: 'ms',
          timestamp: Date.now()
        })
      }
      
      trackAnalytics('schedules_assigned', { 
        userId, 
        scheduleIds: request.scheduleIds,
        count: request.scheduleIds.length
      })
      
      onSuccess?.('assign', data)
      toast.toast({ 
        title: `Successfully assigned ${request.scheduleIds.length} schedule(s)`,
        variant: 'success'
      })
    },
    onSettled: () => {
      // Always refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['userSchedules', userId] })
    }
  })
  
  // Bulk operations support
  const bulkAssignSchedules = useCallback(async (
    userIds: number[], 
    scheduleIds: number[], 
    options: { replace?: boolean } = {}
  ) => {
    setBulkOperationProgress({
      total: userIds.length,
      completed: 0,
      failed: 0,
      errors: []
    })
    
    const results = []
    
    for (let i = 0; i < userIds.length; i++) {
      const currentUserId = userIds[i]
      
      setBulkOperationProgress(prev => ({
        ...prev!,
        currentItem: `User ${currentUserId}`
      }))
      
      try {
        if (!currentUserId) throw new Error('No user ID available')
        
        const result = await userScheduleService.assignSchedules(
          currentUserId,
          scheduleIds
        )
        
        results.push({ userId: currentUserId, success: true, data: result })
        
        setBulkOperationProgress(prev => ({
          ...prev!,
          completed: prev!.completed + 1
        }))
        
      } catch (error) {
        results.push({ userId: currentUserId, success: false, error })
        
        setBulkOperationProgress(prev => ({
          ...prev!,
          failed: prev!.failed + 1,
          errors: [...prev!.errors, { 
            item: `User ${currentUserId}`, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          }]
        }))
      }
    }
    
    setBulkOperationProgress(null)
    trackAnalytics('bulk_schedule_assignment', { 
      totalUsers: userIds.length,
      successCount: results.filter(r => r.success).length,
      failureCount: results.filter(r => !r.success).length
    })
    
    return results
  }, [])
  
  // Real-time sync setup
  useEffect(() => {
    if (!enableRealTimeSync || !realTimeSyncEndpoint || !userId) return
    
    const connectWebSocket = () => {
      const ws = new WebSocket(`${realTimeSyncEndpoint}?userId=${userId}`)
      
      ws.onopen = () => {
        setIsRealTimeSyncActive(true)
        console.log('Real-time sync connected')
      }
      
      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data)
          
          if (update.type === 'schedule_updated') {
            // Invalidate and refetch the user schedules
            queryClient.invalidateQueries({ queryKey: ['userSchedules', userId] })
            trackAnalytics('realtime_schedule_update', { userId, updateType: update.type })
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      ws.onclose = () => {
        setIsRealTimeSyncActive(false)
        // Attempt to reconnect after a delay
        setTimeout(connectWebSocket, 5000)
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsRealTimeSyncActive(false)
      }
      
      wsRef.current = ws
    }
    
    connectWebSocket()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [enableRealTimeSync, realTimeSyncEndpoint, userId, queryClient])
  
  // Enhanced caching with prefetching
  useEffect(() => {
    if (!enableEnhancedCaching || prefetchStrategy === 'none') return
    
    const prefetchRelatedData = async () => {
      if (prefetchStrategy === 'related' && userSchedulesQuery.data && 'data' in userSchedulesQuery.data && Array.isArray(userSchedulesQuery.data.data)) {
        // Enhanced prefetching can be implemented when schedule details endpoint is available
        // For now, we rely on the main user schedules query which contains schedule names and descriptions
        console.log(`Enhanced caching enabled for ${userSchedulesQuery.data.data.length} schedules`)
      }
    }
    
    prefetchRelatedData()
  }, [enableEnhancedCaching, prefetchStrategy, userSchedulesQuery.data, queryClient])
  
  // Analytics tracking helper
  const trackAnalytics = useCallback((eventName: string, data: any) => {
    if (enableAnalytics && onAnalyticsEvent) {
      onAnalyticsEvent(eventName, {
        ...data,
        timestamp: Date.now(),
        userId
      })
    }
  }, [enableAnalytics, onAnalyticsEvent, userId])
  
  // Performance monitoring
  const trackPerformanceMetric = useCallback((metric: PerformanceMetric) => {
    if (enablePerformanceMonitoring) {
      setPerformanceMetrics(prev => [...prev.slice(-99), metric]) // Keep last 100 metrics
      onPerformanceMetric?.(metric)
    }
  }, [enablePerformanceMonitoring, onPerformanceMetric])
  
  // Enhanced computed values
  const enhancedData = useMemo(() => {
    const baseData = userSchedulesQuery.data
    if (!baseData) return null
    
    return {
      ...baseData,
      // Add computed properties
      totalSchedules: baseData.data?.length || 0,
      activeSchedules: baseData.data?.filter((s: any) => s.isActive).length || 0,
      hasOptimisticUpdates: optimisticUpdates.length > 0,
      isRealTimeConnected: isRealTimeSyncActive,
      
      // Performance info
      performanceMetrics: enablePerformanceMonitoring ? performanceMetrics : undefined,
      
      // Enhanced schedule data
      schedules: baseData.data?.map((schedule: any) => ({
        ...schedule,
        // Add computed properties to each schedule
        isOptimistic: optimisticUpdates.some(update => 
          update.type === 'assign' && 
          update.data.scheduleIds?.includes(schedule.scheduleId)
        )
      }))
    }
  }, [userSchedulesQuery.data, optimisticUpdates, isRealTimeSyncActive, performanceMetrics, enablePerformanceMonitoring])
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [])
  
  return {
    // Enhanced data
    data: enhancedData,
    schedules: enhancedData?.schedules || [],
    
    // Loading states
    isLoading: userSchedulesQuery.isLoading,
    isAssigning: assignSchedulesMutation.isPending,
    isRemoving: removeSchedulesMutation.isPending,
    isBulkOperating: bulkOperationProgress !== null,
    
    // Error states
    error: userSchedulesQuery.error,
    assignError: assignSchedulesMutation.error,
    removeError: removeSchedulesMutation.error,
    
    // Enhanced states
    optimisticUpdates,
    bulkOperationProgress,
    isRealTimeSyncActive,
    performanceMetrics: enablePerformanceMonitoring ? performanceMetrics : undefined,
    
    // Actions
    assignSchedules: assignSchedulesMutation.mutate,
    removeAllSchedules: () => removeSchedulesMutation.mutate(userId),
    bulkAssignSchedules,
    
    // Utilities
    refetch: userSchedulesQuery.refetch,
    invalidateCache: () => queryClient.invalidateQueries({ queryKey: ['userSchedules', userId] }),
    clearOptimisticUpdates: () => setOptimisticUpdates([]),
    
    // Performance utilities
    trackPerformanceMetric,
    getPerformanceSummary: () => {
      if (!enablePerformanceMonitoring) return null
      
      const metrics = performanceMetrics
      const renderMetrics = metrics.filter(m => m.type === 'render')
      const interactionMetrics = metrics.filter(m => m.type === 'interaction')
      
      return {
        totalMetrics: metrics.length,
        avgRenderTime: renderMetrics.length > 0 
          ? renderMetrics.reduce((sum, m) => sum + m.value, 0) / renderMetrics.length 
          : 0,
        avgInteractionTime: interactionMetrics.length > 0
          ? interactionMetrics.reduce((sum, m) => sum + m.value, 0) / interactionMetrics.length
          : 0
      }
    }
  }
}

export default useEnhancedUserScheduleAssignment