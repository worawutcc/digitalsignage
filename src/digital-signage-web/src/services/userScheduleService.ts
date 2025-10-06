import { apiClient } from '@/lib/api'
import { ScheduleWithAssignments } from '@/features/schedules/types/schedule'

export interface UserSchedule {
  id: string
  scheduleId: string
  userId: string
  isDefault: boolean
  assignedAt: string
  assignedBy: string
  schedule: ScheduleWithAssignments
}

export interface AssignUserSchedulesRequest {
  userId: string
  scheduleIds: string[]
  replaceExisting?: boolean
}

export interface UpdateUserScheduleRequest {
  isDefault?: boolean
}

export interface GetUserSchedulesResponse {
  schedules: UserSchedule[]
  totalCount: number
  pagination?: {
    page: number
    pageSize: number
    totalPages: number
  }
}

export class UserScheduleService {
  /**
   * Get all schedules assigned to a user
   */
  async getUserSchedules(userId: string): Promise<GetUserSchedulesResponse> {
    const response = await apiClient.get(`/api/admin/users/${userId}/schedules`)
    return response.data
  }

  /**
   * Assign schedules to a user
   */
  async assignSchedules(request: AssignUserSchedulesRequest): Promise<UserSchedule[]> {
    const response = await apiClient.post(
      `/api/admin/users/${request.userId}/schedules/assign`,
      {
        scheduleIds: request.scheduleIds,
        replaceExisting: request.replaceExisting || false
      }
    )
    return response.data
  }

  /**
   * Remove a schedule from a user
   */
  async removeSchedule(userId: string, scheduleId: string): Promise<void> {
    await apiClient.delete(`/api/admin/users/${userId}/schedules/${scheduleId}`)
  }

  /**
   * Remove multiple schedules from a user
   */
  async removeSchedules(userId: string, scheduleIds: string[]): Promise<void> {
    await apiClient.post(`/api/admin/users/${userId}/schedules/remove`, {
      scheduleIds
    })
  }

  /**
   * Update user schedule (e.g., set as default)
   */
  async updateUserSchedule(
    userId: string,
    scheduleId: string,
    request: UpdateUserScheduleRequest
  ): Promise<UserSchedule> {
    const response = await apiClient.put(
      `/api/admin/users/${userId}/schedules/${scheduleId}`,
      request
    )
    return response.data
  }

  /**
   * Set a schedule as default for a user
   */
  async setDefaultSchedule(userId: string, scheduleId: string): Promise<void> {
    await apiClient.post(`/api/admin/users/${userId}/schedules/${scheduleId}/set-default`)
  }

  /**
   * Remove default status from a schedule
   */
  async removeDefaultSchedule(userId: string, scheduleId: string): Promise<void> {
    await apiClient.post(`/api/admin/users/${userId}/schedules/${scheduleId}/remove-default`)
  }

  /**
   * Reorder user schedules
   */
  async reorderSchedules(userId: string, scheduleIds: string[]): Promise<void> {
    await apiClient.post(`/api/admin/users/${userId}/schedules/reorder`, {
      scheduleIds
    })
  }

  /**
   * Assign schedules to user (alias method for test compatibility)
   */
  async assignSchedulesToUser(userId: number, scheduleIds: number[]): Promise<UserSchedule[]> {
    return this.assignSchedules({
      userId: userId.toString(),
      scheduleIds: scheduleIds.map(id => id.toString())
    })
  }

  /**
   * Remove all schedules from user
   */
  async removeAllSchedulesFromUser(userId: number): Promise<{ success: boolean }> {
    const userIdStr = userId.toString()
    const schedules = await this.getUserSchedules(userIdStr)
    const scheduleIds = schedules.schedules.map(s => s.scheduleId)
    
    if (scheduleIds.length > 0) {
      await this.removeSchedules(userIdStr, scheduleIds)
    }
    
    return { success: true }
  }
}

export const userScheduleService = new UserScheduleService()