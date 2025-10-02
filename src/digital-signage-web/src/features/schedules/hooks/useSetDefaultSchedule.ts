/**
 * useSetDefaultSchedule Hook
 * 
 * React Query mutation hook for setting/unsetting a schedule as default.
 * Enforces business rule: Only one schedule can be default at a time.
 * 
 * @see copilot-instructions-web.md - State Management Rules
 * @see specs/020-phase-1/data-model.md - Default Schedule Rules
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { scheduleService } from '../services/scheduleService'
import type { SetDefaultScheduleResponse } from '../types/schedule'
import { useToast } from '@/hooks/useToast'

export interface SetDefaultScheduleVariables {
  scheduleId: number
  isDefault: boolean
}

export interface UseSetDefaultScheduleOptions {
  /**
   * Callback function called on successful update
   */
  onSuccess?: (data: SetDefaultScheduleResponse, variables: SetDefaultScheduleVariables) => void
  
  /**
   * Callback function called on error
   */
  onError?: (error: Error, variables: SetDefaultScheduleVariables) => void
}

interface MutationContext {
  previousSchedules?: unknown
}

/**
 * Hook to set/unset a schedule as default
 * 
 * Business Rule: Only one schedule can be marked as default at a time.
 * When setting a schedule as default, the previous default will be unset automatically.
 * 
 * @param options - Mutation options
 * @returns React Query mutation result
 * 
 * @example
 * ```tsx
 * const setDefault = useSetDefaultSchedule({
 *   onSuccess: () => {
 *     console.log('Default schedule updated')
 *   }
 * })
 * 
 * const handleToggle = (scheduleId: number, isDefault: boolean) => {
 *   setDefault.mutate({ scheduleId, isDefault })
 * }
 * ```
 */
export function useSetDefaultSchedule(options: UseSetDefaultScheduleOptions = {}) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation<
    SetDefaultScheduleResponse,
    Error,
    SetDefaultScheduleVariables,
    MutationContext
  >({
    mutationFn: ({ scheduleId, isDefault }) =>
      scheduleService.setDefaultSchedule(scheduleId, isDefault),
    
    // Optimistic update
    onMutate: async ({ scheduleId, isDefault }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['schedules'] })
      
      // Snapshot previous value
      const previousSchedules = queryClient.getQueryData(['schedules'])
      
      // Optimistically update schedules in cache
      // If setting as default, unset all others
      queryClient.setQueryData(['schedules'], (old: any) => {
        if (!old) return old
        
        return old.map((schedule: any) => ({
          ...schedule,
          isDefault: schedule.id === scheduleId ? isDefault : (isDefault ? false : schedule.isDefault)
        }))
      })
      
      return { previousSchedules }
    },
    
    // On error, rollback to previous value
    onError: (error, variables, context) => {
      if (context?.previousSchedules) {
        queryClient.setQueryData(['schedules'], context.previousSchedules)
      }
      
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update default schedule. Please try again.',
        variant: 'destructive',
      })
      
      options.onError?.(error, variables)
    },
    
    // On success, invalidate cache and show toast
    onSuccess: (data, variables) => {
      // Invalidate all schedule caches to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      
      toast({
        title: variables.isDefault ? 'Default Schedule Set' : 'Default Schedule Unset',
        description: data.message || 'Schedule default status updated successfully.',
        variant: 'success',
      })
      
      options.onSuccess?.(data, variables)
    },
    
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
    },
  })
}

export default useSetDefaultSchedule
