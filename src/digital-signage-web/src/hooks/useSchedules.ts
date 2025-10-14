import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ScheduleService, Schedule, CreateScheduleRequest, ScheduleSearchParams, ScheduleTemplate } from '@/services'
import { useToast } from '@/hooks/useToast'

/**
 * Query key factory for schedule-related queries
 * 
 * Provides consistent cache keys for React Query schedule operations.
 * Used internally by schedule hooks for cache management and invalidation.
 * 
 * @see https://tanstack.com/query/latest/docs/react/guides/query-keys
 */
export const scheduleKeys = {
  all: ['schedules'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  list: (params: ScheduleSearchParams) => [...scheduleKeys.lists(), params] as const,
  details: () => [...scheduleKeys.all, 'detail'] as const,
  detail: (id: number) => [...scheduleKeys.details(), id] as const,
  active: () => [...scheduleKeys.all, 'active'] as const,
  dateRange: (startDate: string, endDate: string) => [...scheduleKeys.all, 'dateRange', startDate, endDate] as const,
  device: (deviceId: number) => [...scheduleKeys.all, 'device', deviceId] as const,
  templates: () => [...scheduleKeys.all, 'templates'] as const,
  template: (id: number) => [...scheduleKeys.templates(), id] as const,
  conflicts: () => [...scheduleKeys.all, 'conflicts'] as const,
  preview: () => [...scheduleKeys.all, 'preview'] as const,
}

/**
 * Hook to fetch all schedules
 * 
 * Retrieves complete list of content schedules for the digital signage system.
 * Includes schedule metadata, assigned media, devices, and time slots.
 * Results are cached for 5 minutes.
 * 
 * @returns React Query result with schedules array and query state
 * 
 * @example
 * ```tsx
 * const { data: schedules, isLoading, error } = useSchedules()
 * 
 * if (isLoading) return <LoadingSkeleton variant="table" count={5} />
 * if (error) return <ErrorState error={error} />
 * 
 * return <ScheduleList schedules={schedules} />
 * ```
 * 
 * @see ScheduleService.getAll for API implementation
 */
export function useSchedules() {
  return useQuery({
    queryKey: scheduleKeys.lists(),
    queryFn: ScheduleService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch a single schedule by ID
 * 
 * Retrieves detailed schedule information including all assigned media files,
 * target devices, time slots, recurrence patterns, and priority settings.
 * Data is cached for 10 minutes.
 * 
 * @param id - Schedule ID to fetch
 * @param enabled - Whether the query should run (default: true)
 * @returns React Query result with schedule details and query state
 * 
 * @example
 * ```tsx
 * const { data: schedule, isLoading } = useScheduleById(scheduleId)
 * 
 * if (isLoading) return <LoadingSkeleton variant="card" />
 * if (!schedule) return <EmptyState message="Schedule not found" />
 * 
 * return <ScheduleDetail schedule={schedule} />
 * ```
 * 
 * @see ScheduleService.getById for API implementation
 */
export function useScheduleById(id: number | string, enabled = true) {
  const numericId = typeof id === 'string' ? parseInt(id) : id
  return useQuery({
    queryKey: scheduleKeys.detail(numericId),
    queryFn: () => ScheduleService.getById(numericId),
    enabled: enabled && numericId > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to search schedules with filters
 * 
 * Performs search across schedules with support for text search, device filtering,
 * date range filtering, and status filtering. Query only runs when parameters provided.
 * 
 * @param params - Search parameters (searchTerm, deviceId, startDate, endDate, status)
 * @returns React Query result with matching schedules and query state
 * 
 * @example
 * ```tsx
 * const { data: schedules } = useScheduleSearch({
 *   deviceId: 123,
 *   startDate: '2025-01-01',
 *   endDate: '2025-01-31'
 * })
 * ```
 */
export function useScheduleSearch(params: ScheduleSearchParams) {
  return useQuery({
    queryKey: scheduleKeys.list(params),
    queryFn: () => ScheduleService.search(params),
    enabled: !!(params.searchTerm || params.deviceId || params.startDate),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook for fetching active schedules
 */
export function useActiveSchedules() {
  return useQuery({
    queryKey: scheduleKeys.active(),
    queryFn: ScheduleService.getActive,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

/**
 * Hook for fetching schedules by date range
 */
export function useSchedulesByDateRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: scheduleKeys.dateRange(startDate, endDate),
    queryFn: () => ScheduleService.getByDateRange(startDate, endDate),
    enabled: !!(startDate && endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for fetching schedules by device
 */
export function useSchedulesByDevice(deviceId: number) {
  return useQuery({
    queryKey: scheduleKeys.device(deviceId),
    queryFn: () => ScheduleService.getByDevice(deviceId),
    enabled: deviceId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for creating schedules
 */
export function useScheduleCreate() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (scheduleData: CreateScheduleRequest) =>
      ScheduleService.create(scheduleData),
    onSuccess: (newSchedule) => {
      // Invalidate and refetch schedule lists
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.active() })
      
      // Add to cache
      queryClient.setQueryData(scheduleKeys.detail(newSchedule.id), newSchedule)
      
      toast({
        title: 'Schedule created',
        description: `${newSchedule.name} has been created successfully.`,
        variant: 'success',
      })
    },
    onError: (error) => {
      console.error('Create schedule error:', error)
      toast({
        title: 'Failed to create schedule',
        description: 'Failed to create schedule. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for creating schedules from templates
 */
export function useScheduleCreateFromTemplate() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ templateId, scheduleData }: { templateId: number; scheduleData: Partial<CreateScheduleRequest> }) =>
      ScheduleService.createFromTemplate(templateId, scheduleData),
    onSuccess: (newSchedule) => {
      // Invalidate and refetch schedule lists
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.active() })
      
      // Add to cache
      queryClient.setQueryData(scheduleKeys.detail(newSchedule.id), newSchedule)
      
      toast({
        title: 'Schedule created from template',
        description: `${newSchedule.name} has been created successfully.`,
        variant: 'success',
      })
    },
    onError: (error) => {
      console.error('Create schedule from template error:', error)
      toast({
        title: 'Failed to create schedule',
        description: 'Failed to create schedule from template. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for updating schedules
 */
export function useScheduleUpdate() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Schedule> }) =>
      ScheduleService.update(id, updates),
    onSuccess: (updatedSchedule) => {
      // Update cache
      queryClient.setQueryData(scheduleKeys.detail(updatedSchedule.id), updatedSchedule)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.active() })
      
      toast({
        title: 'Schedule updated',
        description: `${updatedSchedule.name} has been updated successfully.`,
        variant: 'success',
      })
    },
    onError: (error) => {
      console.error('Update schedule error:', error)
      toast({
        title: 'Failed to update schedule',
        description: 'Failed to update schedule. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for deleting schedules
 */
export function useScheduleDelete() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: number) => ScheduleService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: scheduleKeys.detail(deletedId) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.active() })
      
      toast({
        title: 'Schedule deleted',
        description: 'Schedule has been deleted successfully.',
        variant: 'success',
      })
    },
    onError: (error) => {
      console.error('Delete schedule error:', error)
      toast({
        title: 'Failed to delete schedule',
        description: 'Failed to delete schedule. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for toggling schedule active status
 */
export function useScheduleToggleActive() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      ScheduleService.toggleActive(id, isActive),
    onSuccess: (updatedSchedule) => {
      // Update cache
      queryClient.setQueryData(scheduleKeys.detail(updatedSchedule.id), updatedSchedule)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.active() })
      
      toast({
        title: `Schedule ${updatedSchedule.isActive ? 'activated' : 'deactivated'}`,
        description: `${updatedSchedule.name} has been ${updatedSchedule.isActive ? 'activated' : 'deactivated'}.`,
        variant: 'success',
      })
    },
    onError: (error) => {
      console.error('Toggle active error:', error)
      toast({
        title: 'Failed to update schedule',
        description: 'Failed to update schedule status. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for fetching schedule templates
 */
export function useScheduleTemplates() {
  return useQuery({
    queryKey: scheduleKeys.templates(),
    queryFn: ScheduleService.getTemplates,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook for fetching schedule template by ID
 */
export function useScheduleTemplateById(id: number, enabled = true) {
  return useQuery({
    queryKey: scheduleKeys.template(id),
    queryFn: () => ScheduleService.getTemplateById(id),
    enabled: enabled && id > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook for creating schedule templates
 */
export function useScheduleTemplateCreate() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (templateData: Omit<ScheduleTemplate, 'id' | 'usageCount' | 'createdAt'>) =>
      ScheduleService.createTemplate(templateData),
    onSuccess: (newTemplate) => {
      // Invalidate templates list
      queryClient.invalidateQueries({ queryKey: scheduleKeys.templates() })
      
      // Add to cache
      queryClient.setQueryData(scheduleKeys.template(newTemplate.id), newTemplate)
      
      toast({
        title: 'Template created',
        description: `${newTemplate.name} template has been created successfully.`,
        variant: 'success',
      })
    },
    onError: (error) => {
      console.error('Create template error:', error)
      toast({
        title: 'Failed to create template',
        description: 'Failed to create schedule template. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for checking schedule conflicts
 */
export function useScheduleConflicts() {
  return useMutation({
    mutationFn: (scheduleData: CreateScheduleRequest) =>
      ScheduleService.getConflicts(scheduleData),
    // No automatic toast notifications for conflicts as they're used for validation
  })
}

/**
 * Hook for previewing schedules
 */
export function useSchedulePreview() {
  return useMutation({
    mutationFn: (scheduleData: CreateScheduleRequest) =>
      ScheduleService.preview(scheduleData),
    // No automatic toast notifications for previews
  })
}