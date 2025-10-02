/**
 * useAssignSchedules Hook
 * 
 * React Query mutation hook for assigning schedules to a user.
 * Handles optimistic updates and cache invalidation.
 * 
 * IMPORTANT: This mutation uses REPLACE semantics - all existing schedules are replaced.
 * The UI must show a confirmation modal before calling this mutation.
 * 
 * PERFORMANCE (T053): 
 * - Uses specific query keys for targeted cache invalidation
 * - Implements optimistic updates for instant UI feedback
 * - Sets appropriate staleTime (5 minutes) for user schedules
 * 
 * @see copilot-instructions-web.md - State Management Rules
 * @see specs/020-phase-1/contracts/user-schedules-api.yaml
 * @see specs/020-phase-1/tasks.md - T053 Optimize React Query Cache
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userScheduleService } from '../services/userScheduleService'
import type { AssignSchedulesResponse } from '../types/userSchedule'
import { useToast } from '@/hooks/useToast'

export interface AssignSchedulesVariables {
  userId: number
  scheduleIds: number[]
}

export interface UseAssignSchedulesOptions {
  /**
   * Callback function called on successful assignment
   */
  onSuccess?: (data: AssignSchedulesResponse, variables: AssignSchedulesVariables) => void
  
  /**
   * Callback function called on error
   */
  onError?: (error: Error, variables: AssignSchedulesVariables) => void
}

interface MutationContext {
  previousSchedules?: unknown
  userId: number
}

/**
 * Hook to assign schedules to a user (REPLACE semantics)
 * 
 * Features:
 * - Optimistic UI updates for immediate feedback
 * - Automatic cache invalidation
 * - Toast notifications
 * - Error handling with rollback
 * 
 * @param options - Mutation options
 * @returns React Query mutation result
 * 
 * @example
 * ```tsx
 * const assignSchedules = useAssignSchedules({
 *   onSuccess: () => {
 *     closeModal()
 *   }
 * })
 * 
 * const handleAssign = () => {
 *   assignSchedules.mutate({ 
 *     userId: 123, 
 *     scheduleIds: [1, 2, 3] 
 *   })
 * }
 * ```
 */
export function useAssignSchedules(options: UseAssignSchedulesOptions = {}) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation<
    AssignSchedulesResponse,
    Error,
    AssignSchedulesVariables,
    MutationContext
  >({
    mutationFn: ({ userId, scheduleIds }) =>
      userScheduleService.assignSchedules(userId, scheduleIds),
    
    // Optimistic update - Immediately update UI before API call (T053/T055)
    onMutate: async ({ userId, scheduleIds }) => {
      // Cancel outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['userSchedules', userId] })
      
      // Snapshot previous value for rollback on error
      const previousSchedules = queryClient.getQueryData(['userSchedules', userId])
      
      // Optimistically update the cache with new schedule IDs
      queryClient.setQueryData(['userSchedules', userId], (old: any) => {
        if (!old) return old
        return {
          ...old,
          schedules: scheduleIds.map(id => ({
            id,
            // Minimal data for optimistic update - will be filled by actual API response
            name: 'Loading...',
            isActive: true,
          })),
        }
      })
      
      // Return context with snapshot for rollback
      return { previousSchedules, userId }
    },
    
    // On error, rollback to previous value
    onError: (error, variables, context) => {
      if (context?.previousSchedules) {
        queryClient.setQueryData(
          ['userSchedules', context.userId],
          context.previousSchedules
        )
      }
      
      // Toast notification
      toast({
        title: 'Assignment Failed',
        description: error.message || 'Failed to assign schedules. Please try again.',
        variant: 'destructive',
      })
      
      options.onError?.(error, variables)
    },
    
    // On success, use specific cache invalidation (T053)
    onSuccess: (data, variables) => {
      // Only invalidate affected caches - not all queries
      // This prevents unnecessary refetches of unrelated data
      
      // 1. Invalidate specific user's schedules
      queryClient.invalidateQueries({ 
        queryKey: ['userSchedules', variables.userId],
        exact: true // Only this specific user, not all user schedules
      })
      
      // 2. Invalidate schedule users cache only for affected schedules
      data.assignedScheduleIds.forEach(scheduleId => {
        queryClient.invalidateQueries({ 
          queryKey: ['scheduleUsers', scheduleId],
          exact: true
        })
      })
      
      // 3. Optionally invalidate the user list if it shows schedule counts
      // Only if we're displaying aggregate data
      // queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
      
      // Toast notification
      toast({
        title: 'Schedules Assigned',
        description: `Successfully assigned ${data.assignedScheduleIds.length} schedule(s).`,
        variant: 'success',
      })
      
      options.onSuccess?.(data, variables)
    },
    
    // Always refetch after error or success
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userSchedules', variables.userId] })
    },
  })
}

export default useAssignSchedules
