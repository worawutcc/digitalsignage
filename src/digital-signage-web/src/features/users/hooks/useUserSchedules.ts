/**
 * useUserSchedules Hook
 * 
 * Enhanced React Query hook for fetching schedules assigned to a specific user.
 * Provides automatic caching, refetching, loading states, conflict detection, and real-time updates.
 * 
 * @see copilot-instructions-web.md - API Integration Rules
 * @see specs/020-phase-1/contracts/user-schedules-api.yaml
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useCallback, useState } from 'react'
import { userScheduleService } from '../services/userScheduleService'
import { userService } from '../services/userService'
import { conflictService } from '@/services/conflictService'
import type { GetUserSchedulesResponse } from '../types/userSchedule'
import type { ScheduleConflict } from '@/types/schedule-conflicts'
import type { UserScheduleAssignment } from '../types'

export interface UseUserSchedulesOptions {
  /**
   * Whether to enable the query
   * @default true
   */
  enabled?: boolean
  
  /**
   * Refetch interval in milliseconds
   * @default 5 minutes (300000ms)
   */
  refetchInterval?: number | false
  
  /**
   * Whether to refetch on window focus
   * @default true
   */
  refetchOnWindowFocus?: boolean

  /**
   * Whether to include conflict detection
   * @default true
   */
  includeConflicts?: boolean

  /**
   * Whether to enable real-time updates via WebSocket
   * @default false
   */
  enableRealTimeUpdates?: boolean

  /**
   * Date range filter for assignments
   */
  dateRange?: {
    startDate?: string
    endDate?: string
  }

  /**
   * Whether to include inactive assignments
   * @default false
   */
  includeInactive?: boolean
}

/**
 * Enhanced hook to fetch schedules assigned to a user with conflict detection and real-time updates
 * 
 * @param userId - User ID to fetch schedules for
 * @param options - Query options
 * @returns React Query result with schedules data, conflicts, and real-time capabilities
 * 
 * @example
 * ```tsx
 * const { 
 *   data, 
 *   isLoading, 
 *   error, 
 *   conflicts, 
 *   hasConflicts, 
 *   refreshConflicts 
 * } = useUserSchedules(123, { includeConflicts: true })
 * 
 * if (isLoading) return <LoadingSkeleton />
 * if (error) return <ErrorMessage error={error} />
 * 
 * return (
 *   <div>
 *     <SchedulesList schedules={data?.assignments} />
 *     {hasConflicts && <ConflictAlert conflicts={conflicts} />}
 *   </div>
 * )
 * ```
 */
export function useUserSchedules(
  userId: number,
  options: UseUserSchedulesOptions = {}
) {
  const {
    enabled = true,
    refetchInterval = 300000, // 5 minutes
    refetchOnWindowFocus = true,
    includeConflicts = true,
    enableRealTimeUpdates = false,
    dateRange,
    includeInactive = false,
  } = options

  const queryClient = useQueryClient()
  const [realTimeEnabled, setRealTimeEnabled] = useState(enableRealTimeUpdates)

  // Main query for user schedule assignments
  const scheduleQuery = useQuery({
    queryKey: ['userSchedules', userId, { dateRange, includeInactive }],
    queryFn: () => {
      const params: {
        includeInactive?: boolean
        startDate?: string
        endDate?: string
      } = {}
      
      if (includeInactive !== undefined) params.includeInactive = includeInactive
      if (dateRange?.startDate) params.startDate = dateRange.startDate
      if (dateRange?.endDate) params.endDate = dateRange.endDate
      
      return userService.getUserScheduleAssignments(userId, params)
    },
    enabled: enabled && userId > 0,
    staleTime: refetchInterval || 300000,
    refetchInterval: realTimeEnabled ? false : (refetchInterval || false),
    refetchOnWindowFocus,
  })

  // Conflict detection query
  const conflictsQuery = useQuery({
    queryKey: ['userScheduleConflicts', userId],
    queryFn: () => conflictService.getUserConflicts(userId.toString(), {
      includeResolved: false,
    }),
    enabled: enabled && userId > 0 && includeConflicts,
    staleTime: 30000, // 30 seconds - conflicts change more frequently
    refetchOnWindowFocus: true,
  })

  // Real-time updates setup
  useEffect(() => {
    if (!realTimeEnabled || !userId) return

    console.log(`Setting up real-time updates for user ${userId}`)

    // Subscribe to conflict events for this user
    const unsubscribeConflicts = conflictService.subscribeToConflictEvents(
      { userIds: [userId.toString()] },
      {
        onNewConflict: (conflict) => {
          console.log('New conflict detected:', conflict)
          // Invalidate conflicts query to refetch
          queryClient.invalidateQueries({ 
            queryKey: ['userScheduleConflicts', userId] 
          })
        },
        onConflictResolved: (conflict) => {
          console.log('Conflict resolved:', conflict)
          queryClient.invalidateQueries({ 
            queryKey: ['userScheduleConflicts', userId] 
          })
        },
      }
    )

    // Setup periodic refresh for real-time feel
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ 
        queryKey: ['userSchedules', userId] 
      })
    }, 10000) // Every 10 seconds

    return () => {
      unsubscribeConflicts()
      clearInterval(interval)
    }
  }, [realTimeEnabled, userId, queryClient])

  // Utility functions
  const refreshConflicts = useCallback(() => {
    return conflictsQuery.refetch()
  }, [conflictsQuery])

  const refreshSchedules = useCallback(() => {
    return scheduleQuery.refetch()
  }, [scheduleQuery])

  const enableRealTime = useCallback(() => {
    setRealTimeEnabled(true)
  }, [])

  const disableRealTime = useCallback(() => {
    setRealTimeEnabled(false)
  }, [])

  // Compute derived state
  const hasConflicts = Boolean(conflictsQuery.data?.length)
  const criticalConflicts = conflictsQuery.data?.filter(c => c.severity === 'critical') || []
  const hasCriticalConflicts = criticalConflicts.length > 0

  return {
    // Main schedule data
    data: scheduleQuery.data,
    isLoading: scheduleQuery.isLoading,
    error: scheduleQuery.error,
    refetch: scheduleQuery.refetch,

    // Conflict data
    conflicts: conflictsQuery.data || [],
    conflictsLoading: conflictsQuery.isLoading,
    conflictsError: conflictsQuery.error,
    hasConflicts,
    criticalConflicts,
    hasCriticalConflicts,

    // Utility functions
    refreshConflicts,
    refreshSchedules,
    enableRealTime,
    disableRealTime,
    
    // Status
    isRealTimeEnabled: realTimeEnabled,
    
    // Combined loading state
    isLoadingAny: scheduleQuery.isLoading || (includeConflicts && conflictsQuery.isLoading),
  }
}

/**
 * Hook for managing user schedule assignment operations with conflict awareness
 */
export function useUserScheduleAssignmentOperations(userId: number) {
  const queryClient = useQueryClient()

  // Assign schedule to user
  const assignSchedule = useMutation({
    mutationFn: ({ scheduleId, priority, notes, allowConflicts }: {
      scheduleId: number
      priority?: number
      notes?: string
      allowConflicts?: boolean
    }) => {
      const request: any = { scheduleId }
      if (priority !== undefined) request.priority = priority
      if (notes !== undefined) request.notes = notes
      if (allowConflicts !== undefined) request.allowConflicts = allowConflicts
      return userService.assignScheduleToUser(userId, request)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSchedules', userId] })
      queryClient.invalidateQueries({ queryKey: ['userScheduleConflicts', userId] })
    },
  })

  // Update schedule assignment
  const updateAssignment = useMutation({
    mutationFn: ({ assignmentId, updates }: {
      assignmentId: number
      updates: {
        priority?: number
        notes?: string
        status?: 'active' | 'inactive' | 'pending'
      }
    }) => userService.updateScheduleAssignment(userId, assignmentId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSchedules', userId] })
    },
  })

  // Remove schedule assignment
  const removeAssignment = useMutation({
    mutationFn: (assignmentId: number) => 
      userService.removeScheduleAssignment(userId, assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSchedules', userId] })
      queryClient.invalidateQueries({ queryKey: ['userScheduleConflicts', userId] })
    },
  })

  // Resolve conflict
  const resolveConflict = useMutation({
    mutationFn: ({ conflictId, resolution }: {
      conflictId: number
      resolution: {
        strategy: 'priority' | 'reschedule' | 'ignore'
        parameters?: Record<string, any>
      }
    }) => userService.resolveUserScheduleConflict(userId, conflictId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userScheduleConflicts', userId] })
      queryClient.invalidateQueries({ queryKey: ['userSchedules', userId] })
    },
  })

  return {
    assignSchedule,
    updateAssignment,
    removeAssignment,
    resolveConflict,
  }
}

/**
 * Hook to check assignment compatibility before assigning
 */
export function useScheduleAssignmentCheck(userId: number, scheduleId: number) {
  return useQuery({
    queryKey: ['userScheduleAssignmentCheck', userId, scheduleId],
    queryFn: () => userService.canAssignUserToSchedule(userId, scheduleId),
    enabled: !!userId && !!scheduleId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })
}

export default useUserSchedules
