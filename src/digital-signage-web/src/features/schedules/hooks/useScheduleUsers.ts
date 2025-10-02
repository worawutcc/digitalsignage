/**
 * useScheduleUsers Hook
 * 
 * React Query hook for fetching users assigned to a specific schedule.
 * Supports pagination for large user lists.
 * 
 * @see copilot-instructions-web.md - API Integration Rules
 * @see specs/020-phase-1/contracts/user-schedules-api.yaml
 */

import { useQuery } from '@tanstack/react-query'
import { scheduleService } from '../services/scheduleService'
import type { ScheduleUsersResponse } from '../types/schedule'

export interface UseScheduleUsersOptions {
  /**
   * Page number for pagination
   * @default 1
   */
  page?: number
  
  /**
   * Number of items per page
   * @default 20
   */
  limit?: number
  
  /**
   * Whether to enable the query
   * @default true
   */
  enabled?: boolean
  
  /**
   * Whether to refetch on window focus
   * @default true
   */
  refetchOnWindowFocus?: boolean
}

/**
 * Hook to fetch users assigned to a schedule
 * 
 * @param scheduleId - Schedule ID to fetch users for
 * @param options - Query options
 * @returns React Query result with users data
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useScheduleUsers(scheduleId, {
 *   page: 1,
 *   limit: 20
 * })
 * 
 * if (isLoading) return <LoadingSkeleton />
 * if (error) return <ErrorMessage error={error} />
 * 
 * return <UsersList users={data.users} />
 * ```
 */
export function useScheduleUsers(
  scheduleId: number,
  options: UseScheduleUsersOptions = {}
) {
  const {
    page = 1,
    limit = 20,
    enabled = true,
    refetchOnWindowFocus = true,
  } = options
  
  return useQuery({
    queryKey: ['scheduleUsers', scheduleId, page, limit],
    queryFn: () => scheduleService.getScheduleUsers(scheduleId),
    enabled: enabled && scheduleId > 0,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus,
  })
}

export default useScheduleUsers
