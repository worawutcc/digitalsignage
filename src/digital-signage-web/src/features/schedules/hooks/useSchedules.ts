import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { scheduleService } from '../services/scheduleService'
import type {
  Schedule,
  ScheduleFilters,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ScheduleValidationRequest,
  CalendarData,
  ScheduleStats,
} from '../types'

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
    queryFn: () => scheduleService.getAll(filters),
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Hook: Get schedule by ID
 */
export function useSchedule(id: string) {
  return useQuery({
    queryKey: scheduleKeys.detail(id),
    queryFn: () => scheduleService.getById(id),
    enabled: !!id,
  })
}

/**
 * Hook: Get calendar view data
 */
export function useScheduleCalendar(
  start: string,
  end: string,
  devices?: string[],
  view?: 'month' | 'week' | 'day'
) {
  return useQuery({
    queryKey: scheduleKeys.calendar(start, end, devices, view),
    queryFn: () => scheduleService.getCalendarData(start, end, devices, view),
    staleTime: 10000, // 10 seconds for calendar view
  })
}

/**
 * Hook: Get schedule statistics
 */
export function useScheduleStats() {
  return useQuery({
    queryKey: scheduleKeys.stats(),
    queryFn: () => scheduleService.getStats(),
    staleTime: 60000, // 1 minute
  })
}

/**
 * Hook: Get schedules for specific device
 */
export function useDeviceSchedules(deviceId: string) {
  return useQuery({
    queryKey: scheduleKeys.forDevice(deviceId),
    queryFn: () => scheduleService.getForDevice(deviceId),
    enabled: !!deviceId,
  })
}

/**
 * Hook: Create schedule mutation
 */
export function useCreateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (schedule: CreateScheduleRequest) => scheduleService.create(schedule),
    onSuccess: () => {
      // Invalidate all schedule lists and stats
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.stats() })
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
      scheduleService.update(id, updates),
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
    mutationFn: (id: string) => scheduleService.delete(id),
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
      scheduleService.validate(validation),
  })
}

/**
 * Hook: Activate schedule mutation
 */
export function useActivateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => scheduleService.activate(id),
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
    mutationFn: (id: string) => scheduleService.deactivate(id),
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
      scheduleService.duplicate(id, newName),
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
    mutationFn: (scheduleIds: string[]) => scheduleService.bulkDelete(scheduleIds),
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
    mutationFn: (scheduleIds: string[]) => scheduleService.bulkActivate(scheduleIds),
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
    mutationFn: (scheduleIds: string[]) => scheduleService.bulkDeactivate(scheduleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.stats() })
    },
  })
}
