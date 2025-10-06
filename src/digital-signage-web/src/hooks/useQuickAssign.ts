/**
 * React Query Hooks for Quick Assignment Feature
 * 
 * Custom hooks for media quick assignment operations using React Query.
 * Provides data fetching, caching, and mutation capabilities.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mediaApi } from '@/services/api/mediaApi'
import { userApi } from '@/services/api/userApi'
import { scheduleApi } from '@/services/api/scheduleApi'
import type { QuickAssignRequest } from '@/types/quickAssign'

/**
 * Hook to quickly assign media to users/devices
 * 
 * @example
 * ```tsx
 * const { mutate, isPending } = useQuickAssign()
 * 
 * mutate({
 *   mediaId: 123,
 *   request: {
 *     assignmentType: 'new-schedule',
 *     scheduleName: 'Marketing Campaign',
 *     userIds: [1, 2, 3]
 *   }
 * })
 * ```
 */
export function useQuickAssign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      mediaId,
      request,
    }: {
      mediaId: number
      request: QuickAssignRequest
    }) => {
      return await mediaApi.quickAssign(mediaId, request)
    },

    onSuccess: (data) => {
      // Invalidate media queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['media'] })
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      queryClient.invalidateQueries({ queryKey: ['user-schedules'] })

      console.log('Quick assignment successful:', data)
    },

    onError: (error) => {
      console.error('Quick assignment failed:', error)
    },
  })
}

/**
 * Hook to fetch available users for assignment
 * 
 * @example
 * ```tsx
 * const { data: users, isLoading } = useAvailableUsers()
 * ```
 */
export function useAvailableUsers() {
  return useQuery({
    queryKey: ['users', 'active'],
    queryFn: async () => {
      const users = await userApi.getAll()
      
      // Filter active users only and transform to expected format
      return users
        .filter(user => user.isActive)
        .map(user => ({
          id: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
          email: user.email,
          role: user.role,
        }))
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch available schedules for assignment
 * 
 * @example
 * ```tsx
 * const { data: schedules, isLoading } = useAvailableSchedules()
 * ```
 */
export function useAvailableSchedules() {
  return useQuery({
    queryKey: ['schedules', 'active'],
    queryFn: async () => {
      const schedules = await scheduleApi.getAll()
      
      // Filter active schedules only and transform to expected format
      return schedules
        .filter(schedule => schedule.isActive)
        .map(schedule => ({
          id: schedule.id,
          name: schedule.name,
          startDate: schedule.startDate,
          endDate: schedule.endDate,
          isActive: schedule.isActive,
        }))
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
