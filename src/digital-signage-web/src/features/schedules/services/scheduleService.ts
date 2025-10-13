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
    try {
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

      const response = await apiClient.get<Schedule[]>(
        `/api/admin/schedules?${params.toString()}`
      )
      
      console.log('📅 Schedules API response:', response.data)
      
      // Backend returns array directly, not wrapped
      const schedulesArray = Array.isArray(response.data) ? response.data : []
      return schedulesArray
    } catch (error) {
      console.error('❌ Failed to fetch schedules:', error)
      return []
    }
  }

  /**
   * Get schedule by ID
   */
  async getById(id: string): Promise<Schedule> {
    try {
      const response = await apiClient.get<Schedule>(
        `/api/admin/schedules/${id}`
      )
      
      console.log('📅 Schedule detail API response:', response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Failed to fetch schedule ${id}:`, error)
      throw error
    }
  }

  /**
   * Create new schedule
   */
  async create(schedule: CreateScheduleRequest): Promise<Schedule> {
    try {
      console.log('📅 Creating schedule (original):', schedule)
      
      // ✅ TRANSFORM: Map frontend structure to backend DTO
      // Backend expects: { name, startDate, endDate, startTime, endTime, deviceId, mediaIds }
      // Frontend sends: { name, startDate, endDate, timeSlots[], targetDevices[], content[] }
      
      const firstTimeSlot = schedule.timeSlots?.[0]
      const firstDevice = schedule.targetDevices?.[0]
      
      // 🔍 DEBUG: Log extraction details
      console.log('🔍 Data extraction details:')
      console.log('  - timeSlots:', schedule.timeSlots)
      console.log('  - firstTimeSlot:', firstTimeSlot)
      console.log('  - targetDevices:', schedule.targetDevices)
      console.log('  - firstDevice:', firstDevice)
      console.log('  - content:', schedule.content)
      
      // ⚠️ VALIDATION: Check for critical missing data
      if (!firstDevice?.deviceId) {
        console.error('❌ CRITICAL: No device selected! deviceId will be 0')
        throw new Error('Please select a target device before creating the schedule')
      }
      
      if (!firstTimeSlot?.startTime || !firstTimeSlot?.endTime) {
        console.error('❌ CRITICAL: Missing time slot data!')
        throw new Error('Please configure time slots before creating the schedule')
      }
      
      const backendPayload = {
        name: schedule.name,
        description: schedule.description,
        priority: schedule.priority,
        startDate: schedule.startDate,
        endDate: schedule.endDate,
        // Extract startTime and endTime from first timeSlot
        startTime: firstTimeSlot?.startTime || '00:00',
        endTime: firstTimeSlot?.endTime || '23:59',
        // Extract deviceId from first targetDevice
        deviceId: firstDevice?.deviceId || 0,
        // Extract mediaIds from content array
        mediaIds: schedule.content?.map(c => c.mediaId) || [],
        // Recurrence fields
        isRecurring: schedule.recurrence?.type !== 'never',
        recurrencePattern: schedule.recurrence?.type !== 'never' 
          ? JSON.stringify(schedule.recurrence) 
          : undefined,
        isDefault: false,
      }
      
      console.log('📦 Transformed payload for API:', backendPayload)
      
      // 🔍 PAYLOAD VALIDATION: Check final payload before sending
      if (backendPayload.deviceId === 0) {
        console.error('❌ PAYLOAD ERROR: deviceId is 0, API will likely reject this')
      }
      if (!backendPayload.mediaIds || backendPayload.mediaIds.length === 0) {
        console.warn('⚠️ WARNING: No media selected, schedule will be empty')
      }
      
      const response = await apiClient.post<Schedule>(
        '/api/admin/schedules',
        backendPayload
      )
      
      console.log('✅ Schedule created:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Failed to create schedule:', error)
      throw error
    }
  }

  /**
   * Update existing schedule
   */
  async update(id: string, updates: UpdateScheduleRequest): Promise<Schedule> {
    try {
      console.log(`📅 Updating schedule ${id}:`, updates)
      const response = await apiClient.put<Schedule>(
        `/api/admin/schedules/${id}`,
        updates
      )
      
      console.log('✅ Schedule updated:', response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Failed to update schedule ${id}:`, error)
      throw error
    }
  }

  /**
   * Delete schedule
   */
  async delete(id: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting schedule ${id}`)
      await apiClient.delete(`/api/admin/schedules/${id}`)
      console.log(`✅ Schedule ${id} deleted`)
    } catch (error) {
      console.error(`❌ Failed to delete schedule ${id}:`, error)
      throw error
    }
  }

  /**
   * Validate schedule for conflicts before saving
   */
  async validate(
    validation: ScheduleValidationRequest
  ): Promise<ScheduleValidationResponse> {
    try {
      console.log('🔍 Validating schedule:', validation)
      const response = await apiClient.post<ScheduleValidationResponse>(
        '/api/admin/schedules/validate',
        validation
      )
      
      console.log('✅ Validation result:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Schedule validation failed:', error)
      throw error
    }
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
    try {
      const params = new URLSearchParams({
        start,
        end,
      })
      
      if (view) params.append('view', view)
      if (devices?.length) {
        devices.forEach(d => params.append('devices', d))
      }

      const response = await apiClient.get<CalendarData>(
        `/api/admin/schedules/calendar?${params.toString()}`
      )
      
      console.log('📅 Calendar data API response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Failed to fetch calendar data:', error)
      throw error
    }
  }

  /**
   * Get schedule statistics
   */
  async getStats(): Promise<ScheduleStats> {
    try {
      const response = await apiClient.get<ScheduleStats>(
        '/api/admin/schedules/stats'
      )
      
      console.log('📊 Schedule stats API response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Failed to fetch schedule stats:', error)
      throw error
    }
  }

  /**
   * Activate schedule
   */
  async activate(id: string): Promise<Schedule> {
    try {
      console.log(`▶️ Activating schedule ${id}`)
      const response = await apiClient.post<Schedule>(
        `/api/admin/schedules/${id}/activate`
      )
      
      console.log('✅ Schedule activated:', response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Failed to activate schedule ${id}:`, error)
      throw error
    }
  }

  /**
   * Deactivate schedule
   */
  async deactivate(id: string): Promise<Schedule> {
    try {
      console.log(`⏸️ Deactivating schedule ${id}`)
      const response = await apiClient.post<Schedule>(
        `/api/admin/schedules/${id}/deactivate`
      )
      
      console.log('✅ Schedule deactivated:', response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Failed to deactivate schedule ${id}:`, error)
      throw error
    }
  }

  /**
   * Duplicate schedule
   */
  async duplicate(id: string, newName?: string): Promise<Schedule> {
    try {
      console.log(`📋 Duplicating schedule ${id}`)
      const response = await apiClient.post<Schedule>(
        `/api/admin/schedules/${id}/duplicate`,
        { newName }
      )
      
      console.log('✅ Schedule duplicated:', response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Failed to duplicate schedule ${id}:`, error)
      throw error
    }
  }

  /**
   * Bulk delete schedules
   */
  async bulkDelete(scheduleIds: string[]): Promise<void> {
    try {
      console.log('🗑️ Bulk deleting schedules:', scheduleIds)
      await apiClient.post('/api/admin/schedules/bulk-delete', { scheduleIds })
      console.log('✅ Schedules bulk deleted')
    } catch (error) {
      console.error('❌ Failed to bulk delete schedules:', error)
      throw error
    }
  }

  /**
   * Bulk activate schedules
   */
  async bulkActivate(scheduleIds: string[]): Promise<void> {
    try {
      console.log('▶️ Bulk activating schedules:', scheduleIds)
      await apiClient.post('/api/admin/schedules/bulk-activate', { scheduleIds })
      console.log('✅ Schedules bulk activated')
    } catch (error) {
      console.error('❌ Failed to bulk activate schedules:', error)
      throw error
    }
  }

  /**
   * Bulk deactivate schedules
   */
  async bulkDeactivate(scheduleIds: string[]): Promise<void> {
    try {
      console.log('⏸️ Bulk deactivating schedules:', scheduleIds)
      await apiClient.post('/api/admin/schedules/bulk-deactivate', { scheduleIds })
      console.log('✅ Schedules bulk deactivated')
    } catch (error) {
      console.error('❌ Failed to bulk deactivate schedules:', error)
      throw error
    }
  }

  /**
   * Get schedules for specific device
   */
  async getForDevice(deviceId: string): Promise<Schedule[]> {
    try {
      const response = await apiClient.get<Schedule[]>(
        `/api/admin/schedules/device/${deviceId}`
      )
      
      console.log(`📅 Device ${deviceId} schedules:`, response.data)
      const schedulesArray = Array.isArray(response.data) ? response.data : []
      return schedulesArray
    } catch (error) {
      console.error(`❌ Failed to fetch schedules for device ${deviceId}:`, error)
      return []
    }
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
