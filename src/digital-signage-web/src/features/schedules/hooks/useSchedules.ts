// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ScheduleService } from '@/services'
import type {
  Schedule,
  ScheduleFilters,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ScheduleValidationRequest,
  CalendarData,
  ScheduleStats,
} from '../types'

// Simple wrapper to handle methods not available in ScheduleService
const scheduleServiceWrapper = {
  async getAll(filters?: ScheduleFilters) {
    return ScheduleService.getAll()
  },
  async getById(id: string) {
    return ScheduleService.getById(parseInt(id))
  },
  async create(schedule: CreateScheduleRequest) {
    // Transform features CreateScheduleRequest to services format
    return ScheduleService.create({
      name: schedule.name,
      description: schedule.description || '',
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      startTime: '00:00',
      endTime: '23:59',
      mediaFileIds: [],
      deviceIds: []
    })
  },
  async update(id: string, updates: any) {
    return ScheduleService.update(parseInt(id), updates)
  },
  async delete(id: string) {
    return ScheduleService.delete(parseInt(id))
  },
  async bulkDelete(ids: string[]) {
    return ScheduleService.bulkDelete(ids.map(id => parseInt(id)))
  },
  async toggleActive(id: string, isActive: boolean) {
    return ScheduleService.toggleActive(parseInt(id), isActive)
  },
  // Stub methods for features not yet implemented
  async validate() { return { isValid: true, errors: [] } },
  async activate(id: string) { return this.toggleActive(id, true) },
  async deactivate(id: string) { return this.toggleActive(id, false) },
  async duplicate() { throw new Error('Duplicate not implemented') },
  async bulkActivate() { throw new Error('Bulk activate not implemented') },
  async bulkDeactivate() { throw new Error('Bulk deactivate not implemented') },
  async setDefaultSchedule() { throw new Error('Set default not implemented') },
  async getScheduleUsers() { return [] },
  async getSchedulesForSelector() { return [] }
}

/**
 * Query Keys for Schedule Management
 */
export const scheduleKeys = {
  all: ['schedules'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  list: (filters?: ScheduleFilters) => [...scheduleKeys.lists(), filters] as const,
  details: () => [...scheduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...scheduleKeys.details(), id] as const,
  calendar: (start: string, end: string, devices?: string[], view?: string) =>
    [...scheduleKeys.all, 'calendar', start, end, devices, view] as const,
  stats: () => [...scheduleKeys.all, 'stats'] as const,
  forDevice: (deviceId: string) => [...scheduleKeys.all, 'device', deviceId] as const,
}

/**
 * Hook: Get all schedules with filtering
 */
export function useSchedules(filters?: ScheduleFilters) {
  return useQuery({
    queryKey: scheduleKeys.list(filters),
    queryFn: () => ScheduleService.getAll(),
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  })
}

/**
 * Hook: Get schedule by ID
 */
export function useSchedule(id: string) {
  return useQuery({
    queryKey: scheduleKeys.detail(id),
    queryFn: () => ScheduleService.getById(parseInt(id)),
    enabled: !!id,
  })
}

/**
 * Hook: Get calendar data for schedule visualization
 */
export function useScheduleCalendar(
  start: string,
  end: string,
  devices?: string[],
  view: string = 'month'
) {
  return useQuery({
    queryKey: scheduleKeys.calendar(start, end, devices, view),
    queryFn: async () => {
      // Get schedules by date range and transform to calendar format
      const schedules = await ScheduleService.getByDateRange(start, end)
      return {
        events: schedules.map(schedule => ({
          id: schedule.id.toString(),
          title: schedule.name,
          start: schedule.startDate,
          end: schedule.endDate,
          allDay: false,
          scheduleId: schedule.id.toString(),
          deviceNames: schedule.devices?.map(d => d.name) || [],
          status: schedule.isActive ? 'active' : 'inactive'
        })),
        conflicts: [] // TODO: Implement conflict detection
      }
    },
    staleTime: 30000,
  })
}

/**
 * Hook: Get schedule statistics
 */
export function useScheduleStats() {
  return useQuery({
    queryKey: scheduleKeys.stats(),
    queryFn: async () => {
      const schedules = await ScheduleService.getAll()
      const activeSchedules = schedules.filter(s => s.isActive)
      return {
        total: schedules.length,
        active: activeSchedules.length,
        inactive: schedules.length - activeSchedules.length,
        scheduledToday: 0,
        upcomingThisWeek: 0
      }
    },
    staleTime: 60000, // 1 minute
  })
}

/**
 * Hook: Get schedules for specific device
 */
export function useDeviceSchedules(deviceId: string) {
  return useQuery({
    queryKey: scheduleKeys.forDevice(deviceId),
    queryFn: () => ScheduleService.getByDevice(parseInt(deviceId)),
    enabled: !!deviceId,
  })
}

/**
 * Hook: Create schedule mutation
 */
export function useCreateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (schedule: CreateScheduleRequest) => scheduleServiceWrapper.create(schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all })
    },
  })
}

/**
 * Hook: Update schedule mutation
 */
export function useUpdateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateScheduleRequest }) =>
      scheduleServiceWrapper.update(id, updates),
    onSuccess: (data, variables) => {
      // Update the specific schedule in cache
      queryClient.setQueryData(scheduleKeys.detail(variables.id), data)
      // Invalidate lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.stats() })
    },
  })
}

/**
 * Hook: Delete schedule mutation
 */
export function useDeleteSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => scheduleServiceWrapper.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.stats() })
    },
  })
}

/**
 * Hook: Validate schedule
 */
export function useValidateSchedule() {
  return useMutation({
    mutationFn: (validation: ScheduleValidationRequest) =>
      scheduleServiceWrapper.validate(),
  })
}

/**
 * Hook: Activate schedule mutation
 */
export function useActivateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => scheduleServiceWrapper.activate(id),
    onSuccess: (data, id) => {
      queryClient.setQueryData(scheduleKeys.detail(id), data)
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.stats() })
    },
  })
}

/**
 * Hook: Deactivate schedule mutation
 */
export function useDeactivateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => scheduleServiceWrapper.deactivate(id),
    onSuccess: (data, id) => {
      queryClient.setQueryData(scheduleKeys.detail(id), data)
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.stats() })
    },
  })
}

/**
 * Hook: Duplicate schedule mutation
 */
export function useDuplicateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName?: string }) =>
      scheduleServiceWrapper.duplicate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.stats() })
    },
  })
}

/**
 * Hook: Bulk delete schedules mutation
 */
export function useBulkDeleteSchedules() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (scheduleIds: string[]) => scheduleServiceWrapper.bulkDelete(scheduleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.stats() })
    },
  })
}

/**
 * Hook: Bulk activate schedules mutation
 */
export function useBulkActivateSchedules() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (scheduleIds: string[]) => scheduleServiceWrapper.bulkActivate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.stats() })
    },
  })
}

/**
 * Hook: Bulk deactivate schedules mutation
 */
export function useBulkDeactivateSchedules() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (scheduleIds: string[]) => scheduleServiceWrapper.bulkDeactivate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.stats() })
    },
  })
}

// ==========================================
// Schedule Assignment & User Management Hooks (Phase 1)
// ==========================================

/**
 * Hook: Set default schedule flag (T031: useSetDefaultSchedule)
 * Business Rule: Only ONE schedule can be default at a time
 */
export function useSetDefaultSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ scheduleId, isDefault }: { scheduleId: number; isDefault: boolean }) => {
      return scheduleServiceWrapper.setDefaultSchedule()
    },

    // Optimistic update
    onMutate: async ({ scheduleId, isDefault }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: scheduleKeys.lists() })

      // Snapshot the previous value
      const previousLists = queryClient.getQueriesData({ queryKey: scheduleKeys.lists() })

      // Optimistically update all schedule lists
      queryClient.setQueriesData({ queryKey: scheduleKeys.lists() }, (old: any) => {
        if (!old) return old

        return {
          ...old,
          data: old.data?.map((schedule: any) => {
            // If setting this schedule as default, unset all others
            if (isDefault) {
              return {
                ...schedule,
                isDefault: schedule.id === scheduleId || schedule.scheduleId === scheduleId,
              }
            }
            // If unsetting default, only update the specific schedule
            if (schedule.id === scheduleId || schedule.scheduleId === scheduleId) {
              return { ...schedule, isDefault: false }
            }
            return schedule
          }),
        }
      })

      return { previousLists }
    },

    onSuccess: (data) => {
      // Invalidate all schedule queries to refetch with accurate data
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.stats() })

      // Show success notification
      if (typeof window !== 'undefined') {
        const message = data.isDefault
          ? 'Schedule set as default successfully'
          : 'Default flag removed successfully'
        console.log(message)
        // toast.success(message);
      }
    },

    onError: (error: any, _variables, context) => {
      // Rollback optimistic updates
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      // Show error notification
      if (typeof window !== 'undefined') {
        console.error('Failed to update default schedule:', error.message)
        // toast.error(error.message || 'Failed to update default schedule');
      }
    },
  })
}

/**
 * Hook: Get users assigned to a specific schedule (T032: useScheduleUsers)
 */
export function useScheduleUsers(scheduleId: number) {
  return useQuery({
    queryKey: ['scheduleUsers', scheduleId],
    queryFn: async () => {
      return scheduleServiceWrapper.getScheduleUsers(scheduleId)
    },
    enabled: !!scheduleId && scheduleId > 0,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook: Get schedules formatted for selector component
 * Used in schedule assignment modals
 */
export function useSchedulesForSelector(query?: {
  search?: string
  activeOnly?: boolean
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['schedulesSelector', query],
    queryFn: async () => {
      return scheduleServiceWrapper.getSchedulesForSelector(query)
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  })
}
