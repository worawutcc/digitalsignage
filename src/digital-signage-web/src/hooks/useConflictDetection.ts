/**
 * useConflictDetection Hook
 * 
 * Provides comprehensive conflict detection and monitoring capabilities
 * for schedules, users, and devices with React Query integration.
 * 
 * @see copilot-instructions-ui.instructions.md - React Query patterns
 * @see specs/021-user-schedule-assignment/tasks.md - T013 Requirements
 */

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { conflictService } from '../services/conflictService'
import { useToast } from './useToast'
import { 
  ScheduleConflict, 
  ConflictSeverity,
  ConflictType,
  ConflictDetectionRequest,
  ConflictDetectionResponse,
  ResolutionStrategy,
  ResolutionType
} from '../types/schedule-conflicts'

export interface UseConflictDetectionOptions {
  /** Auto-refresh interval in milliseconds */
  refreshInterval?: number
  /** Include resolved conflicts */
  includeResolved?: boolean
  /** Severity levels to include */
  severities?: ConflictSeverity[]
  /** Specific conflict types to monitor */
  conflictTypes?: ConflictType[]
  /** Entity filters */
  filters?: {
    userIds?: string[]
    scheduleIds?: string[]
  }
}

export interface ConflictDetectionState {
  /** All conflicts matching criteria */
  conflicts: ScheduleConflict[]
  /** Critical conflicts requiring immediate attention */
  criticalConflicts: ScheduleConflict[]
  /** High/medium severity conflicts */
  warningConflicts: ScheduleConflict[]
  /** Low severity conflicts */
  infoConflicts: ScheduleConflict[]
  /** Total conflict count */
  totalCount: number
  /** Conflicts by type */
  conflictsByType: Record<ConflictType, ScheduleConflict[]>
  /** Conflicts by severity */
  conflictsBySeverity: Record<ConflictSeverity, ScheduleConflict[]>
  /** Loading states */
  isLoading: boolean
  isRefreshing: boolean
  /** Last update timestamp */
  lastUpdated: Date | null
}

/**
 * Main conflict detection hook
 * 
 * @example
 * ```tsx
 * const {
 *   state,
 *   refreshConflicts
 * } = useConflictDetection({
 *   includeResolved: false,
 *   severities: [ConflictSeverity.CRITICAL, ConflictSeverity.HIGH],
 *   filters: { userIds: ['123'] }
 * })
 * 
 * // Show critical conflicts
 * if (state.criticalConflicts.length > 0) {
 *   return <CriticalConflictAlert conflicts={state.criticalConflicts} />
 * }
 * ```
 */
export function useConflictDetection(options: UseConflictDetectionOptions = {}) {
  const {
    refreshInterval = 30000, // 30 seconds
    includeResolved = false,
    severities,
    conflictTypes,
    filters = {}
  } = options

  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Main conflicts query
  const conflictsQuery = useQuery({
    queryKey: ['conflicts', {
      includeResolved,
      severities,
      conflictTypes,
      ...filters
    }],
    queryFn: () => {
      const request: ConflictDetectionRequest = {
        includeResolved
      }
      
      // Only add properties if they have values
      if (severities?.length) request.severity = severities
      if (conflictTypes?.length) request.conflictTypes = conflictTypes
      if (filters.userIds?.length) request.userIds = filters.userIds
      if (filters.scheduleIds?.length) request.scheduleIds = filters.scheduleIds
      
      return conflictService.getConflicts(request)
    },
    refetchInterval: refreshInterval,
    refetchOnWindowFocus: true,
    staleTime: 10000, // 10 seconds
  })

  // Process and categorize conflicts
  const processedState = useMemo((): ConflictDetectionState => {
    const response = conflictsQuery.data
    const conflicts = response?.conflicts || []

    // Filter by severity
    const criticalConflicts = conflicts.filter(c => c.severity === ConflictSeverity.CRITICAL)
    const warningConflicts = conflicts.filter(c => 
      c.severity === ConflictSeverity.HIGH || c.severity === ConflictSeverity.MEDIUM
    )
    const infoConflicts = conflicts.filter(c => c.severity === ConflictSeverity.LOW)

    // Group by type
    const conflictsByType = conflicts.reduce((acc, conflict) => {
      if (!acc[conflict.type]) {
        acc[conflict.type] = []
      }
      acc[conflict.type].push(conflict)
      return acc
    }, {} as Record<ConflictType, ScheduleConflict[]>)

    // Group by severity
    const conflictsBySeverity = conflicts.reduce((acc, conflict) => {
      if (!acc[conflict.severity]) {
        acc[conflict.severity] = []
      }
      acc[conflict.severity].push(conflict)
      return acc
    }, {} as Record<ConflictSeverity, ScheduleConflict[]>)

    return {
      conflicts,
      criticalConflicts,
      warningConflicts,
      infoConflicts,
      totalCount: conflicts.length,
      conflictsByType,
      conflictsBySeverity,
      isLoading: conflictsQuery.isLoading,
      isRefreshing: conflictsQuery.isFetching && !conflictsQuery.isLoading,
      lastUpdated: conflictsQuery.dataUpdatedAt ? new Date(conflictsQuery.dataUpdatedAt) : null
    }
  }, [conflictsQuery.data, conflictsQuery.isLoading, conflictsQuery.isFetching, conflictsQuery.dataUpdatedAt])

  // Conflict resolution mutation
  const resolveConflictMutation = useMutation({
    mutationFn: ({ conflictId, strategy, type, parameters }: {
      conflictId: string
      strategy: ResolutionStrategy
      type: ResolutionType
      parameters?: Record<string, any>
    }) => {
      const request: any = { strategy, type }
      if (parameters !== undefined) request.parameters = parameters
      return conflictService.resolveConflict(conflictId, request)
    },
    onSuccess: (resolvedConflict) => {
      queryClient.invalidateQueries({ queryKey: ['conflicts'] })
      
      toast({
        title: 'Conflict Resolved',
        description: `Successfully resolved ${resolvedConflict.type} conflict`,
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Resolution Failed',
        description: 'Failed to resolve conflict. Please try again.',
        variant: 'destructive',
      })
      console.error('Conflict resolution failed:', error)
    }
  })

  // Utility functions
  const resolveConflict = useCallback((
    conflictId: string,
    strategy: ResolutionStrategy,
    type: ResolutionType = ResolutionType.MANUAL,
    parameters?: Record<string, any>
  ) => {
    const mutationParams: any = { conflictId, strategy, type }
    if (parameters !== undefined) mutationParams.parameters = parameters
    return resolveConflictMutation.mutate(mutationParams)
  }, [resolveConflictMutation])

  const refreshConflicts = useCallback(() => {
    return conflictsQuery.refetch()
  }, [conflictsQuery])

  // Get conflicts by specific user or schedule
  const getConflictsByUser = useCallback((userId: string) => {
    return processedState.conflicts.filter(conflict => 
      conflict.affectedUsers.some(user => user.id?.toString() === userId)
    )
  }, [processedState.conflicts])

  const getConflictsBySchedule = useCallback((scheduleId: string) => {
    return processedState.conflicts.filter(conflict => 
      conflict.scheduleIds.includes(scheduleId)
    )
  }, [processedState.conflicts])

  return {
    /** Current conflict detection state */
    state: processedState,
    
    /** Conflict resolution actions */
    resolveConflict,
    
    /** Data management */
    refreshConflicts,
    
    /** Utility functions */
    utils: {
      getConflictsByUser,
      getConflictsBySchedule,
      
      /** Check if user has conflicts */
      hasUserConflicts: (userId: string) => {
        return processedState.conflicts.some(conflict =>
          conflict.affectedUsers.some(user => user.id?.toString() === userId)
        )
      },
      
      /** Check if schedule has conflicts */
      hasScheduleConflicts: (scheduleId: string) => {
        return processedState.conflicts.some(conflict =>
          conflict.scheduleIds.includes(scheduleId)
        )
      },
      
      /** Get conflict summary statistics */
      getStatistics: () => ({
        total: processedState.totalCount,
        bySeverity: {
          critical: processedState.criticalConflicts.length,
          warning: processedState.warningConflicts.length,
          info: processedState.infoConflicts.length
        },
        byType: Object.entries(processedState.conflictsByType).reduce((acc, [type, conflicts]) => {
          acc[type as ConflictType] = conflicts.length
          return acc
        }, {} as Record<ConflictType, number>),
        unresolved: processedState.conflicts.filter(c => !c.resolvedAt).length
      })
    },
    
    /** Loading and error states */
    isLoading: processedState.isLoading,
    isRefreshing: processedState.isRefreshing,
    isResolving: resolveConflictMutation.isPending,
    error: conflictsQuery.error,
  }
}

/**
 * Simplified hook for monitoring conflicts for a specific user
 */
export function useUserConflictDetection(userId: string, options: Omit<UseConflictDetectionOptions, 'filters'> = {}) {
  return useConflictDetection({
    ...options,
    filters: { userIds: [userId] }
  })
}

/**
 * Simplified hook for monitoring conflicts for a specific schedule
 */
export function useScheduleConflictDetection(scheduleId: string, options: Omit<UseConflictDetectionOptions, 'filters'> = {}) {
  return useConflictDetection({
    ...options,
    filters: { scheduleIds: [scheduleId] }
  })
}

export default useConflictDetection