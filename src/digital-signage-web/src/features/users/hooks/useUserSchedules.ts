/**
 * useUserSchedules Hook
 * 
 * React Query hook for fetching schedules assigned to a specific user.
 * Provides automatic caching, refetching, and loading states.
 * 
 * @see copilot-instructions-web.md - API Integration Rules
 * @see specs/020-phase-1/contracts/user-schedules-api.yaml
 */

import { useQuery } from '@tanstack/react-query'
import { userScheduleService } from '../services/userScheduleService'
import type { GetUserSchedulesResponse } from '../types/userSchedule'

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
}

/**
 * Hook to fetch schedules assigned to a user
 * 
 * @param userId - User ID to fetch schedules for
 * @param options - Query options
 * @returns React Query result with schedules data
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useUserSchedules(123)
 * 
 * if (isLoading) return <LoadingSkeleton />
 * if (error) return <ErrorMessage error={error} />
 * 
 * return <SchedulesList schedules={data.schedules} />
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
  } = options
  
  return useQuery({
    queryKey: ['userSchedules', userId],
    queryFn: () => userScheduleService.getUserSchedules(userId),
    enabled: enabled && userId > 0,
    staleTime: refetchInterval || 300000,
    refetchInterval: refetchInterval || false,
    refetchOnWindowFocus,
  })
}

export default useUserSchedules
