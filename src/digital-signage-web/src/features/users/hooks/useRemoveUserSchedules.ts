/**
 * useRemoveUserSchedules Hook
 * 
 * React Query mutation hook for removing all schedules from a user.
 * 
 * @see copilot-instructions-web.md - State Management Rules
 * @see specs/020-phase-1/contracts/user-schedules-api.yaml
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userScheduleService } from '../services/userScheduleService'
import type { RemoveSchedulesResponse } from '../types/userSchedule'
import { useToast } from '@/hooks/useToast'

export interface UseRemoveUserSchedulesOptions {
  /**
   * Callback function called on successful removal
   */
  onSuccess?: (data: RemoveSchedulesResponse, userId: number) => void
  
  /**
   * Callback function called on error
   */
  onError?: (error: Error, userId: number) => void
}

interface MutationContext {
  previousSchedules?: unknown
  userId: number
}

/**
 * Hook to remove all schedule assignments from a user
 * 
 * Features:
 * - Optimistic UI updates
 * - Automatic cache invalidation
 * - Toast notifications
 * - Error handling with rollback
 * 
 * @param options - Mutation options
 * @returns React Query mutation result
 * 
 * @example
 * ```tsx
 * const removeSchedules = useRemoveUserSchedules({
 *   onSuccess: () => {
 *     closeModal()
 *   }
 * })
 * 
 * const handleRemove = () => {
 *   removeSchedules.mutate(userId)
 * }
 * ```
 */
export function useRemoveUserSchedules(options: UseRemoveUserSchedulesOptions = {}) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation<
    RemoveSchedulesResponse,
    Error,
    number, // userId
    MutationContext
  >({
    mutationFn: (userId: number) =>
      userScheduleService.removeAllSchedules(userId),
    
    // Optimistic update - immediately clear schedules
    onMutate: async (userId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['userSchedules', userId] })
      
      // Snapshot previous value
      const previousSchedules = queryClient.getQueryData(['userSchedules', userId])
      
      // Optimistically update to empty state
      queryClient.setQueryData(['userSchedules', userId], {
        userId,
        schedules: [],
        totalCount: 0,
      })
      
      return { previousSchedules, userId }
    },
    
    // On error, rollback to previous value
    onError: (error, userId, context) => {
      if (context?.previousSchedules) {
        queryClient.setQueryData(
          ['userSchedules', context.userId],
          context.previousSchedules
        )
      }
      
      toast({
        title: 'Removal Failed',
        description: error.message || 'Failed to remove schedules. Please try again.',
        variant: 'destructive',
      })
      
      options.onError?.(error, userId)
    },
    
    // On success, invalidate cache and show toast
    onSuccess: (data, userId) => {
      // Invalidate user schedules cache
      queryClient.invalidateQueries({ queryKey: ['userSchedules', userId] })
      
      // Also invalidate related schedule users caches
      queryClient.invalidateQueries({ queryKey: ['scheduleUsers'] })
      
      toast({
        title: 'Schedules Removed',
        description: `Successfully removed ${data.removedCount} schedule(s).`,
        variant: 'success',
      })
      
      options.onSuccess?.(data, userId)
    },
    
    // Always refetch after error or success
    onSettled: (data, error, userId) => {
      queryClient.invalidateQueries({ queryKey: ['userSchedules', userId] })
    },
  })
}

export default useRemoveUserSchedules
