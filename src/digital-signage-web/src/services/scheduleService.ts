import { apiClient } from '@/lib/api'
import type { User } from '@/types/api'
import type { UserScheduleAssignment, BulkOperationResponse } from '@/features/users/types'
import type { ScheduleConflict } from '@/types/schedule-conflicts'

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
  
  // Enhanced user assignment properties
  assignedUsers?: User[]
  assignedUsersCount?: number
  maxConcurrentUsers?: number
  userAssignments?: UserScheduleAssignment[]
  hasUserConflicts?: boolean
  conflictCount?: number
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
  
  // Enhanced filtering for user assignments
  hasAssignedUsers?: boolean
  assignedUserId?: number
  hasConflicts?: boolean
  userRole?: string
}

export interface ScheduleAssignmentRequest {
  userIds: number[]
  priority?: number
  notes?: string
  allowConflicts?: boolean
}

export interface ScheduleAssignmentResponse {
  success: boolean
  data: UserScheduleAssignment[]
  conflicts?: ScheduleConflict[]
  warnings?: string[]
}

export interface BulkScheduleUserAssignmentRequest {
  scheduleIds: number[]
  userIds: number[]
  assignmentSettings: {
    priority: number
    allowConflicts: boolean
    notes?: string
    replaceExisting: boolean
  }
}

/**
 * Schedule service for API integration
 * Handles all schedule-related API calls
 */
export class ScheduleService {
  // Instance methods for compatibility with tests
  /**
   * Get all schedules (instance method)
   */
  async getSchedules(params?: ScheduleSearchParams): Promise<Schedule[]> {
    if (params) {
      return ScheduleService.search(params)
    }
    return ScheduleService.getAll()
  }

  /**
   * Search schedules (instance method)
   */
  async searchSchedules(searchTerm: string): Promise<Schedule[]> {
    return ScheduleService.search({ searchTerm })
  }

  /**
   * Get schedule by ID (instance method)
   */
  async getScheduleById(id: number): Promise<Schedule> {
    return ScheduleService.getById(id)
  }

  /**
   * Get assigned users for a schedule (instance method)
   */
  async getAssignedUsers(scheduleId: number, params?: { page?: number; pageSize?: number }): Promise<{
    users: User[]
    assignments: UserScheduleAssignment[]
    conflicts: ScheduleConflict[]
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> {
    const options: { includeInactive?: boolean; page?: number; limit?: number } = {}
    if (params?.page !== undefined) options.page = params.page
    if (params?.pageSize !== undefined) options.limit = params.pageSize
    return ScheduleService.getAssignedUsers(scheduleId, Object.keys(options).length > 0 ? options : undefined)
  }

  /**
   * Remove user from schedule (instance method)
   */
  async removeUserFromSchedule(scheduleId: number, userId: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/api/schedules/${scheduleId}/users/${userId}`)
    return response.data
  }

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

  // ============================================================================
  // USER ASSIGNMENT METHODS
  // ============================================================================

  /**
   * Get schedule with enhanced user assignment data
   */
  static async getWithUserAssignments(id: number): Promise<Schedule> {
    const response = await apiClient.get(`/api/schedules/${id}?includeUserAssignments=true`)
    return response.data
  }

  /**
   * Get assigned users for a schedule
   */
  static async getAssignedUsers(scheduleId: number, options?: {
    includeInactive?: boolean
    page?: number
    limit?: number
  }): Promise<{
    users: User[]
    assignments: UserScheduleAssignment[]
    conflicts: ScheduleConflict[]
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> {
    const params = new URLSearchParams()
    
    if (options?.includeInactive !== undefined) {
      params.append('includeInactive', options.includeInactive.toString())
    }
    if (options?.page) params.append('page', options.page.toString())
    if (options?.limit) params.append('limit', options.limit.toString())

    const response = await apiClient.get(
      `/api/schedules/${scheduleId}/assigned-users?${params.toString()}`
    )
    return response.data
  }

  /**
   * Assign users to schedule
   */
  static async assignUsers(scheduleId: number, request: ScheduleAssignmentRequest): Promise<ScheduleAssignmentResponse> {
    const response = await apiClient.post<ScheduleAssignmentResponse>(
      `/api/schedules/${scheduleId}/assign-users`,
      request
    )
    return response.data
  }

  /**
   * Remove user assignments from schedule
   */
  static async removeUserAssignments(scheduleId: number, userIds: number[]): Promise<void> {
    await apiClient.delete(`/api/schedules/${scheduleId}/assigned-users`, {
      data: { userIds }
    })
  }

  /**
   * Update user assignment for schedule
   */
  static async updateUserAssignment(
    scheduleId: number, 
    assignmentId: number, 
    updates: {
      priority?: number
      notes?: string
      status?: 'active' | 'inactive' | 'pending'
    }
  ): Promise<UserScheduleAssignment> {
    const response = await apiClient.put(
      `/api/schedules/${scheduleId}/assignments/${assignmentId}`,
      updates
    )
    return response.data
  }

  /**
   * Bulk assign users to multiple schedules
   */
  static async bulkAssignUsersToSchedules(request: BulkScheduleUserAssignmentRequest): Promise<BulkOperationResponse> {
    const response = await apiClient.post<BulkOperationResponse>(
      '/api/schedules/bulk-assign-users',
      request
    )
    return response.data
  }

  /**
   * Get schedules assigned to specific user
   */
  static async getSchedulesForUser(userId: number, options?: {
    includeInactive?: boolean
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<{
    schedules: Schedule[]
    assignments: UserScheduleAssignment[]
    conflicts: ScheduleConflict[]
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> {
    const params = new URLSearchParams()
    
    if (options?.includeInactive !== undefined) {
      params.append('includeInactive', options.includeInactive.toString())
    }
    if (options?.startDate) params.append('startDate', options.startDate)
    if (options?.endDate) params.append('endDate', options.endDate)
    if (options?.page) params.append('page', options.page.toString())
    if (options?.limit) params.append('limit', options.limit.toString())

    const response = await apiClient.get(
      `/api/schedules/user/${userId}?${params.toString()}`
    )
    return response.data
  }

  // ============================================================================
  // CONFLICT MANAGEMENT METHODS
  // ============================================================================

  /**
   * Get schedule conflicts
   */
  static async getScheduleConflicts(scheduleId?: number, options?: {
    severity?: ('low' | 'medium' | 'high' | 'critical')[]
    type?: string[]
    status?: ('active' | 'resolved' | 'ignored')[]
    page?: number
    limit?: number
  }): Promise<{
    conflicts: ScheduleConflict[]
    totalConflicts: number
    conflictsByType: Record<string, number>
    conflictsBySeverity: Record<string, number>
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> {
    const params = new URLSearchParams()
    
    if (scheduleId) params.append('scheduleId', scheduleId.toString())
    
    if (options?.severity?.length) {
      options.severity.forEach(s => params.append('severity', s))
    }
    
    if (options?.type?.length) {
      options.type.forEach(t => params.append('type', t))
    }
    
    if (options?.status?.length) {
      options.status.forEach(s => params.append('status', s))
    }
    
    if (options?.page) params.append('page', options.page.toString())
    if (options?.limit) params.append('limit', options.limit.toString())

    const response = await apiClient.get(`/api/schedule-conflicts?${params.toString()}`)
    return response.data
  }

  /**
   * Detect conflicts for schedule user assignment
   */
  static async detectUserAssignmentConflicts(
    scheduleId: number, 
    userIds: number[]
  ): Promise<{
    conflicts: ScheduleConflict[]
    canProceed: boolean
    warnings: string[]
    resolutions: Array<{
      conflictId: string
      suggestedResolution: string
      autoResolvable: boolean
    }>
  }> {
    const response = await apiClient.post(
      `/api/schedules/${scheduleId}/detect-user-conflicts`,
      { userIds }
    )
    return response.data
  }

  /**
   * Resolve schedule conflict
   */
  static async resolveConflict(
    conflictId: string, 
    resolution: {
      strategy: 'priority' | 'reschedule' | 'split' | 'ignore'
      parameters?: Record<string, any>
      notes?: string
    }
  ): Promise<{
    success: boolean
    resolvedConflict: ScheduleConflict
    newConflicts?: ScheduleConflict[]
    warnings?: string[]
  }> {
    const response = await apiClient.post(
      `/api/schedule-conflicts/${conflictId}/resolve`,
      resolution
    )
    return response.data
  }

  /**
   * Get conflict resolution suggestions
   */
  static async getConflictResolutionSuggestions(conflictId: string): Promise<{
    suggestions: Array<{
      type: 'priority' | 'reschedule' | 'split' | 'ignore'
      description: string
      impact: 'low' | 'medium' | 'high'
      automated: boolean
      parameters?: Record<string, any>
    }>
    recommendedSolution?: string
  }> {
    const response = await apiClient.get(`/api/schedule-conflicts/${conflictId}/suggestions`)
    return response.data
  }

  // ============================================================================
  // ANALYTICS AND REPORTING METHODS
  // ============================================================================

  /**
   * Get schedule assignment analytics
   */
  static async getAssignmentAnalytics(scheduleId?: number, options?: {
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month'
  }): Promise<{
    totalAssignments: number
    activeAssignments: number
    conflictRate: number
    assignmentsByRole: Record<string, number>
    assignmentTrends: Array<{
      date: string
      assignments: number
      conflicts: number
    }>
    topConflictTypes: Array<{
      type: string
      count: number
      percentage: number
    }>
  }> {
    const params = new URLSearchParams()
    
    if (scheduleId) params.append('scheduleId', scheduleId.toString())
    if (options?.startDate) params.append('startDate', options.startDate)
    if (options?.endDate) params.append('endDate', options.endDate)
    if (options?.groupBy) params.append('groupBy', options.groupBy)

    const response = await apiClient.get(`/api/schedules/analytics/assignments?${params.toString()}`)
    return response.data
  }

  /**
   * Get suggested users for schedule assignment
   */
  static async getSuggestedUsersForAssignment(scheduleId: number, options?: {
    limit?: number
    excludeUserIds?: number[]
    requiredRole?: string
    considerWorkload?: boolean
  }): Promise<{
    users: User[]
    suggestions: Array<{
      user: User
      score: number
      reasons: string[]
      conflicts: ScheduleConflict[]
      canAssign: boolean
    }>
  }> {
    const params = new URLSearchParams()
    
    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.requiredRole) params.append('requiredRole', options.requiredRole)
    if (options?.considerWorkload !== undefined) {
      params.append('considerWorkload', options.considerWorkload.toString())
    }
    if (options?.excludeUserIds?.length) {
      options.excludeUserIds.forEach(id => params.append('excludeUserIds', id.toString()))
    }

    const response = await apiClient.get(
      `/api/schedules/${scheduleId}/suggested-users?${params.toString()}`
    )
    return response.data
  }

  /**
   * Validate schedule assignment before creating
   */
  static async validateAssignment(scheduleId: number, userIds: number[]): Promise<{
    valid: boolean
    conflicts: ScheduleConflict[]
    warnings: string[]
    blockers: Array<{
      userId: number
      reason: string
      severity: 'warning' | 'error'
    }>
  }> {
    const response = await apiClient.post(
      `/api/schedules/${scheduleId}/validate-assignment`,
      { userIds }
    )
    return response.data
  }
}

// Export both class and instance for different import styles
export const scheduleService = new ScheduleService()