import { apiClient } from '@/lib/api'
import type {
  Schedule,
  ScheduleFilters,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ScheduleValidationRequest,
  ScheduleValidationResponse,
  CalendarData,
  ScheduleStats,
} from '../types'

/**
 * Schedule Service
 * Handles all schedule-related API operations including CRUD, validation, and calendar views
 */
export class ScheduleService {
  /**
   * Get all schedules with optional filtering
   */
  async getAll(filters?: ScheduleFilters): Promise<Schedule[]> {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.search) params.append('search', filters.search)
      if (filters.sort) params.append('sort', filters.sort)
      if (filters.order) params.append('order', filters.order)
      if (filters.status?.length) {
        filters.status.forEach(s => params.append('status', s))
      }
      if (filters.dateRange) params.append('dateRange', filters.dateRange)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.devices?.length) {
        filters.devices.forEach(d => params.append('devices', d))
      }
      if (filters.createdBy?.length) {
        filters.createdBy.forEach(u => params.append('createdBy', u))
      }
    }

    const response = await apiClient.get<{ success: boolean; data: Schedule[] }>(
      `/api/schedules?${params.toString()}`
    )
    return response.data.data
  }

  /**
   * Get schedule by ID
   */
  async getById(id: string): Promise<Schedule> {
    const response = await apiClient.get<{ success: boolean; data: Schedule }>(
      `/api/schedules/${id}`
    )
    return response.data.data
  }

  /**
   * Create new schedule
   */
  async create(schedule: CreateScheduleRequest): Promise<Schedule> {
    const response = await apiClient.post<{ success: boolean; data: Schedule }>(
      '/api/schedules',
      schedule
    )
    return response.data.data
  }

  /**
   * Update existing schedule
   */
  async update(id: string, updates: UpdateScheduleRequest): Promise<Schedule> {
    const response = await apiClient.put<{ success: boolean; data: Schedule }>(
      `/api/schedules/${id}`,
      updates
    )
    return response.data.data
  }

  /**
   * Delete schedule
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/schedules/${id}`)
  }

  /**
   * Validate schedule for conflicts before saving
   */
  async validate(
    validation: ScheduleValidationRequest
  ): Promise<ScheduleValidationResponse> {
    const response = await apiClient.post<{
      success: boolean
      data: ScheduleValidationResponse
    }>('/api/schedules/validate', validation)
    return response.data.data
  }

  /**
   * Get calendar view data with conflict visualization
   */
  async getCalendarData(
    start: string,
    end: string,
    devices?: string[],
    view?: 'month' | 'week' | 'day'
  ): Promise<CalendarData> {
    const params = new URLSearchParams({
      start,
      end,
    })
    
    if (view) params.append('view', view)
    if (devices?.length) {
      devices.forEach(d => params.append('devices', d))
    }

    const response = await apiClient.get<{ success: boolean; data: CalendarData }>(
      `/api/schedules/calendar?${params.toString()}`
    )
    return response.data.data
  }

  /**
   * Get schedule statistics
   */
  async getStats(): Promise<ScheduleStats> {
    const response = await apiClient.get<{ success: boolean; data: ScheduleStats }>(
      '/api/schedules/stats'
    )
    return response.data.data
  }

  /**
   * Activate schedule
   */
  async activate(id: string): Promise<Schedule> {
    const response = await apiClient.post<{ success: boolean; data: Schedule }>(
      `/api/schedules/${id}/activate`
    )
    return response.data.data
  }

  /**
   * Deactivate schedule
   */
  async deactivate(id: string): Promise<Schedule> {
    const response = await apiClient.post<{ success: boolean; data: Schedule }>(
      `/api/schedules/${id}/deactivate`
    )
    return response.data.data
  }

  /**
   * Duplicate schedule
   */
  async duplicate(id: string, newName?: string): Promise<Schedule> {
    const response = await apiClient.post<{ success: boolean; data: Schedule }>(
      `/api/schedules/${id}/duplicate`,
      { newName }
    )
    return response.data.data
  }

  /**
   * Bulk delete schedules
   */
  async bulkDelete(scheduleIds: string[]): Promise<void> {
    await apiClient.post('/api/schedules/bulk-delete', { scheduleIds })
  }

  /**
   * Bulk activate schedules
   */
  async bulkActivate(scheduleIds: string[]): Promise<void> {
    await apiClient.post('/api/schedules/bulk-activate', { scheduleIds })
  }

  /**
   * Bulk deactivate schedules
   */
  async bulkDeactivate(scheduleIds: string[]): Promise<void> {
    await apiClient.post('/api/schedules/bulk-deactivate', { scheduleIds })
  }

  /**
   * Get schedules for specific device
   */
  async getForDevice(deviceId: string): Promise<Schedule[]> {
    const response = await apiClient.get<{ success: boolean; data: Schedule[] }>(
      `/api/schedules/device/${deviceId}`
    )
    return response.data.data
  }
}

// Export singleton instance
export const scheduleService = new ScheduleService()
