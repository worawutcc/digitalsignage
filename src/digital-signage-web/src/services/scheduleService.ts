import { apiClient } from '@/lib/api'

export interface Schedule {
  id: number
  name: string
  description?: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  isActive: boolean
  recurrence?: RecurrencePattern
  mediaFiles: MediaFile[]
  devices: Device[]
  createdAt: string
  updatedAt: string
  lastModified: string
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  daysOfWeek?: number[]
  dayOfMonth?: number
  endDate?: string
  exceptions?: string[]
}

export interface MediaFile {
  id: number
  name: string
  fileName: string
  mediaType: 'Image' | 'Video' | 'Document'
  duration?: number
  order: number
}

export interface Device {
  id: number
  name: string
  location: string
  status: 'Online' | 'Offline' | 'Maintenance'
}

export interface ScheduleTemplate {
  id: number
  name: string
  description?: string
  category: string
  isDefault: boolean
  settings: {
    defaultDuration: number
    autoTransition: boolean
    shuffleMedia: boolean
    repeatPlaylist: boolean
  }
  mediaSlots: MediaSlot[]
  usageCount: number
  createdAt: string
}

export interface MediaSlot {
  id: number
  position: number
  mediaType: 'Image' | 'Video' | 'Document'
  duration: number
  isRequired: boolean
  placeholder?: string
}

export interface CreateScheduleRequest {
  name: string
  description?: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  recurrence?: RecurrencePattern
  mediaFileIds: number[]
  deviceIds: number[]
}

export interface ScheduleSearchParams {
  searchTerm?: string
  startDate?: string
  endDate?: string
  deviceId?: number
  isActive?: boolean
  page?: number
  pageSize?: number
}

/**
 * Schedule service for API integration
 * Handles all schedule-related API calls
 */
export class ScheduleService {
  /**
   * Get all schedules
   */
  static async getAll(): Promise<Schedule[]> {
    const response = await apiClient.get('/api/schedules')
    return response.data
  }

  /**
   * Get schedule by ID
   */
  static async getById(id: number): Promise<Schedule> {
    const response = await apiClient.get(`/api/schedules/${id}`)
    return response.data
  }

  /**
   * Search schedules
   */
  static async search(params: ScheduleSearchParams): Promise<Schedule[]> {
    const response = await apiClient.get('/api/schedules/search', { params })
    return response.data
  }

  /**
   * Get active schedules
   */
  static async getActive(): Promise<Schedule[]> {
    const response = await apiClient.get('/api/schedules/active')
    return response.data
  }

  /**
   * Get schedules by date range
   */
  static async getByDateRange(startDate: string, endDate: string): Promise<Schedule[]> {
    const response = await apiClient.get('/api/schedules/date-range', {
      params: { startDate, endDate }
    })
    return response.data
  }

  /**
   * Get schedules by device
   */
  static async getByDevice(deviceId: number): Promise<Schedule[]> {
    const response = await apiClient.get(`/api/schedules/device/${deviceId}`)
    return response.data
  }

  /**
   * Create new schedule
   */
  static async create(scheduleData: CreateScheduleRequest): Promise<Schedule> {
    const response = await apiClient.post('/api/schedules', scheduleData)
    return response.data
  }

  /**
   * Create schedule from template
   */
  static async createFromTemplate(templateId: number, scheduleData: Partial<CreateScheduleRequest>): Promise<Schedule> {
    const response = await apiClient.post(`/api/schedules/from-template/${templateId}`, scheduleData)
    return response.data
  }

  /**
   * Update schedule
   */
  static async update(id: number, updates: Partial<Schedule>): Promise<Schedule> {
    const response = await apiClient.put(`/api/schedules/${id}`, updates)
    return response.data
  }

  /**
   * Delete schedule
   */
  static async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/schedules/${id}`)
  }

  /**
   * Bulk delete schedules
   */
  static async bulkDelete(ids: number[]): Promise<void> {
    await apiClient.post('/api/schedules/bulk-delete', { ids })
  }

  /**
   * Activate/Deactivate schedule
   */
  static async toggleActive(id: number, isActive: boolean): Promise<Schedule> {
    const response = await apiClient.patch(`/api/schedules/${id}/toggle-active`, { isActive })
    return response.data
  }

  /**
   * Add media to schedule
   */
  static async addMedia(id: number, mediaFileIds: number[]): Promise<Schedule> {
    const response = await apiClient.post(`/api/schedules/${id}/media`, { mediaFileIds })
    return response.data
  }

  /**
   * Remove media from schedule
   */
  static async removeMedia(id: number, mediaFileIds: number[]): Promise<Schedule> {
    const response = await apiClient.delete(`/api/schedules/${id}/media`, { data: { mediaFileIds } })
    return response.data
  }

  /**
   * Add devices to schedule
   */
  static async addDevices(id: number, deviceIds: number[]): Promise<Schedule> {
    const response = await apiClient.post(`/api/schedules/${id}/devices`, { deviceIds })
    return response.data
  }

  /**
   * Remove devices from schedule
   */
  static async removeDevices(id: number, deviceIds: number[]): Promise<Schedule> {
    const response = await apiClient.delete(`/api/schedules/${id}/devices`, { data: { deviceIds } })
    return response.data
  }

  /**
   * Get schedule templates
   */
  static async getTemplates(): Promise<ScheduleTemplate[]> {
    const response = await apiClient.get('/api/schedules/templates')
    return response.data
  }

  /**
   * Get template by ID
   */
  static async getTemplateById(id: number): Promise<ScheduleTemplate> {
    const response = await apiClient.get(`/api/schedules/templates/${id}`)
    return response.data
  }

  /**
   * Create schedule template
   */
  static async createTemplate(templateData: Omit<ScheduleTemplate, 'id' | 'usageCount' | 'createdAt'>): Promise<ScheduleTemplate> {
    const response = await apiClient.post('/api/schedules/templates', templateData)
    return response.data
  }

  /**
   * Update schedule template
   */
  static async updateTemplate(id: number, updates: Partial<ScheduleTemplate>): Promise<ScheduleTemplate> {
    const response = await apiClient.put(`/api/schedules/templates/${id}`, updates)
    return response.data
  }

  /**
   * Delete schedule template
   */
  static async deleteTemplate(id: number): Promise<void> {
    await apiClient.delete(`/api/schedules/templates/${id}`)
  }

  /**
   * Get schedule conflicts
   */
  static async getConflicts(scheduleData: CreateScheduleRequest): Promise<{
    conflicts: Schedule[]
    canProceed: boolean
    warnings: string[]
  }> {
    const response = await apiClient.post('/api/schedules/check-conflicts', scheduleData)
    return response.data
  }

  /**
   * Preview schedule
   */
  static async preview(scheduleData: CreateScheduleRequest): Promise<{
    timeline: Array<{
      date: string
      startTime: string
      endTime: string
      mediaFiles: MediaFile[]
      devices: Device[]
    }>
    totalOccurrences: number
    estimatedDuration: number
  }> {
    const response = await apiClient.post('/api/schedules/preview', scheduleData)
    return response.data
  }
}