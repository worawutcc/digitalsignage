import { apiClient } from '@/lib/api'
import { MockScheduleService, USE_MOCK_SCHEDULE_SERVICE } from '@/services/mockScheduleService'
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
import type {
  ScheduleUsersResponse,
  SetDefaultScheduleRequest,
  SetDefaultScheduleResponse,
  ScheduleSelectorQuery,
  ScheduleSelectorResponse,
} from '../types/schedule'

/**
 * Schedule Service
 * Handles all schedule-related API operations including CRUD, validation, and calendar views
 */
export class ScheduleService {
  /**
   * Get all schedules with optional filtering
   */
  async getAll(filters?: ScheduleFilters): Promise<Schedule[]> {
    // Use mock service in development when API is not available
    if (USE_MOCK_SCHEDULE_SERVICE || process.env.NODE_ENV === 'development') {
      return MockScheduleService.getAll(filters)
    }

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
      if (filters.assignedUserId) params.append('assignedUserId', filters.assignedUserId)
    }

    const response = await apiClient.get<{ success: boolean; data: Schedule[] }>(
      `/api/admin/schedules?${params.toString()}`
    )
    return response.data.data
  }

  /**
   * Get schedule by ID
   */
  async getById(id: string): Promise<Schedule> {
    // Use mock service in development
    if (USE_MOCK_SCHEDULE_SERVICE || process.env.NODE_ENV === 'development') {
      return MockScheduleService.getById(id)
    }

    const response = await apiClient.get<{ success: boolean; data: Schedule }>(
      `/api/admin/schedules/${id}`
    )
    return response.data.data
  }

  /**
   * Create new schedule
   */
  async create(schedule: CreateScheduleRequest): Promise<Schedule> {
    const response = await apiClient.post<{ success: boolean; data: Schedule }>(
      '/api/admin/schedules',
      schedule
    )
    return response.data.data
  }

  /**
   * Update existing schedule
   */
  async update(id: string, updates: UpdateScheduleRequest): Promise<Schedule> {
    const response = await apiClient.put<{ success: boolean; data: Schedule }>(
      `/api/admin/schedules/${id}`,
      updates
    )
    return response.data.data
  }

  /**
   * Delete schedule
   */
  async delete(id: string): Promise<void> {
  await apiClient.delete(`/api/admin/schedules/${id}`)
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
    }>('/api/admin/schedules/validate', validation)
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
    // Use mock service in development
    if (USE_MOCK_SCHEDULE_SERVICE || process.env.NODE_ENV === 'development') {
      return MockScheduleService.getCalendarData(start, end, devices, view)
    }

    const params = new URLSearchParams({
      start,
      end,
    })
    
    if (view) params.append('view', view)
    if (devices?.length) {
      devices.forEach(d => params.append('devices', d))
    }

    const response = await apiClient.get<{ success: boolean; data: CalendarData }>(
      `/api/admin/schedules/calendar?${params.toString()}`
    )
    return response.data.data
  }

  /**
   * Get schedule statistics
   */
  async getStats(): Promise<ScheduleStats> {
    // Use mock service in development
    if (USE_MOCK_SCHEDULE_SERVICE || process.env.NODE_ENV === 'development') {
      return MockScheduleService.getStats()
    }

    const response = await apiClient.get<{ success: boolean; data: ScheduleStats }>(
      '/api/admin/schedules/stats'
    )
    return response.data.data
  }

  /**
   * Activate schedule
   */
  async activate(id: string): Promise<Schedule> {
    const response = await apiClient.post<{ success: boolean; data: Schedule }>(
      `/api/admin/schedules/${id}/activate`
    )
    return response.data.data
  }

  /**
   * Deactivate schedule
   */
  async deactivate(id: string): Promise<Schedule> {
    const response = await apiClient.post<{ success: boolean; data: Schedule }>(
      `/api/admin/schedules/${id}/deactivate`
    )
    return response.data.data
  }

  /**
   * Duplicate schedule
   */
  async duplicate(id: string, newName?: string): Promise<Schedule> {
    const response = await apiClient.post<{ success: boolean; data: Schedule }>(
      `/api/admin/schedules/${id}/duplicate`,
      { newName }
    )
    return response.data.data
  }

  /**
   * Bulk delete schedules
   */
  async bulkDelete(scheduleIds: string[]): Promise<void> {
  await apiClient.post('/api/admin/schedules/bulk-delete', { scheduleIds })
  }

  /**
   * Bulk activate schedules
   */
  async bulkActivate(scheduleIds: string[]): Promise<void> {
  await apiClient.post('/api/admin/schedules/bulk-activate', { scheduleIds })
  }

  /**
   * Bulk deactivate schedules
   */
  async bulkDeactivate(scheduleIds: string[]): Promise<void> {
  await apiClient.post('/api/admin/schedules/bulk-deactivate', { scheduleIds })
  }

  /**
   * Get schedules for specific device
   */
  async getForDevice(deviceId: string): Promise<Schedule[]> {
    const response = await apiClient.get<{ success: boolean; data: Schedule[] }>(
      `/api/admin/schedules/device/${deviceId}`
    )
    return response.data.data
  }

  /**
   * Get users assigned to a specific schedule
   * 
   * @param scheduleId - Schedule ID to fetch assigned users for
   * @returns Promise with list of assigned users
   */
  async getScheduleUsers(scheduleId: number): Promise<ScheduleUsersResponse> {
    try {
      const response = await apiClient.get<ScheduleUsersResponse>(
        `/api/admin/schedules/${scheduleId}/users`
      )
      return response.data
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response
        
        switch (status) {
          case 401:
            throw new Error('Authentication required. Please log in.')
          case 403:
            throw new Error('You do not have permission to view schedule users.')
          case 404:
            throw new Error(`Schedule with ID ${scheduleId} not found.`)
          case 500:
            throw new Error('Server error while fetching schedule users.')
          default:
            throw new Error(data?.message || 'Failed to fetch schedule users.')
        }
      }
      throw new Error('Network error. Please check your connection.')
    }
  }

  /**
   * Set a schedule as default (or remove default status)
   * 
   * Note: Only one schedule can be default at a time.
   * Setting a new default will automatically unset the previous default.
   * 
   * @param scheduleId - Schedule ID to update
   * @param isDefault - Whether to set as default
   * @returns Promise with updated schedule information
   */
  async setDefaultSchedule(
    scheduleId: number,
    isDefault: boolean
  ): Promise<SetDefaultScheduleResponse> {
    try {
      const payload: SetDefaultScheduleRequest = {
        scheduleId,
        isDefault,
      }
      
      const response = await apiClient.put<SetDefaultScheduleResponse>(
        `/api/admin/schedules/${scheduleId}/default`,
        payload
      )
      
      return response.data
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response
        
        switch (status) {
          case 401:
            throw new Error('Authentication required. Please log in.')
          case 403:
            throw new Error('You do not have permission to set default schedules.')
          case 404:
            throw new Error(`Schedule with ID ${scheduleId} not found.`)
          case 422:
            throw new Error(data?.message || 'Cannot set inactive schedule as default.')
          case 500:
            throw new Error('Server error while updating default schedule.')
          default:
            throw new Error(data?.message || 'Failed to update default schedule.')
        }
      }
      throw new Error('Network error. Please check your connection.')
    }
  }

  /**
   * Get schedules for selector component
   * 
   * Optimized endpoint for schedule selection UI with search and pagination.
   * Returns lightweight schedule items suitable for dropdowns and multi-select.
   * 
   * @param query - Search and filter parameters
   * @returns Promise with paginated schedule list
   */
  async getSchedulesForSelector(
    query?: ScheduleSelectorQuery
  ): Promise<ScheduleSelectorResponse> {
    try {
      const params = new URLSearchParams()
      
      if (query?.search) {
        params.append('search', query.search)
      }
      if (query?.activeOnly !== undefined) {
        params.append('activeOnly', query.activeOnly.toString())
      }
      if (query?.page !== undefined) {
        params.append('page', query.page.toString())
      }
      if (query?.pageSize !== undefined) {
        params.append('pageSize', query.pageSize.toString())
      }
      if (query?.sortBy) {
        params.append('sortBy', query.sortBy)
      }
      if (query?.sortOrder) {
        params.append('sortOrder', query.sortOrder)
      }
      
      const response = await apiClient.get<ScheduleSelectorResponse>(
        `/api/admin/schedules?${params.toString()}`
      )
      
      return response.data
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response
        
        switch (status) {
          case 401:
            throw new Error('Authentication required. Please log in.')
          case 403:
            throw new Error('You do not have permission to view schedules.')
          case 500:
            throw new Error('Server error while fetching schedules.')
          default:
            throw new Error(data?.message || 'Failed to fetch schedules.')
        }
      }
      throw new Error('Network error. Please check your connection.')
    }
  }
}

// Export singleton instance
export const scheduleService = new ScheduleService()
