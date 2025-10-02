/**
 * User Schedule Service
 * 
 * API client for user schedule assignment operations.
 * Handles CRUD operations for user-schedule relationships.
 */

import { apiClient } from '@/lib/api'
import type {
  UserSchedule,
  AssignSchedulesRequest,
  AssignSchedulesResponse,
  GetUserSchedulesResponse,
  RemoveSchedulesResponse,
} from '../types/userSchedule'

/**
 * Base API path for user schedule endpoints
 */
const BASE_PATH = '/api/admin/users'

/**
 * User Schedule Service
 * 
 * Provides methods for managing user schedule assignments
 */
export const userScheduleService = {
  /**
   * Get all schedules assigned to a specific user
   * 
   * @param userId - User ID to fetch schedules for
   * @returns Promise with user schedules data
   * @throws ApiError on failure (401, 403, 404, 500)
   */
  async getUserSchedules(userId: number): Promise<GetUserSchedulesResponse> {
    try {
      const response = await apiClient.get<GetUserSchedulesResponse>(
        `${BASE_PATH}/${userId}/schedules`
      )
      return response.data
    } catch (error: any) {
      // Enhanced error handling
      if (error.response) {
        const { status, data } = error.response
        
        switch (status) {
          case 401:
            throw new Error('Authentication required. Please log in.')
          case 403:
            throw new Error('You do not have permission to view this user\'s schedules.')
          case 404:
            throw new Error(`User with ID ${userId} not found.`)
          case 500:
            throw new Error('Server error while fetching schedules. Please try again.')
          default:
            throw new Error(data?.message || 'Failed to fetch user schedules.')
        }
      }
      
      throw new Error('Network error. Please check your connection.')
    }
  },

  /**
   * Assign schedules to a user (REPLACE semantics)
   * 
   * WARNING: This replaces ALL existing schedule assignments for the user.
   * The UI must show a confirmation modal before calling this method.
   * 
   * @param userId - User ID to assign schedules to
   * @param scheduleIds - Array of schedule IDs to assign (replaces existing)
   * @returns Promise with assignment response
   * @throws ApiError on failure (400, 401, 403, 404, 422, 500)
   */
  async assignSchedules(
    userId: number,
    scheduleIds: number[]
  ): Promise<AssignSchedulesResponse> {
    try {
      const payload: Pick<AssignSchedulesRequest, 'scheduleIds'> = {
        scheduleIds,
      }
      
      const response = await apiClient.post<AssignSchedulesResponse>(
        `${BASE_PATH}/${userId}/schedules`,
        payload
      )
      
      return response.data
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response
        
        switch (status) {
          case 400:
            throw new Error(data?.message || 'Invalid request. Please check your input.')
          case 401:
            throw new Error('Authentication required. Please log in.')
          case 403:
            throw new Error('You do not have permission to assign schedules.')
          case 404:
            throw new Error('User or one or more schedules not found.')
          case 422:
            // Validation error - return detailed message
            if (data?.errors && Array.isArray(data.errors)) {
              const errorMessages = data.errors.map((err: any) => err.message).join(', ')
              throw new Error(`Validation failed: ${errorMessages}`)
            }
            throw new Error(data?.message || 'Cannot assign inactive schedules.')
          case 500:
            throw new Error('Server error while assigning schedules. Please try again.')
          default:
            throw new Error(data?.message || 'Failed to assign schedules.')
        }
      }
      
      throw new Error('Network error. Please check your connection.')
    }
  },

  /**
   * Remove all schedule assignments from a user
   * 
   * @param userId - User ID to remove assignments from
   * @returns Promise with removal response
   * @throws ApiError on failure (401, 403, 404, 500)
   */
  async removeAllSchedules(userId: number): Promise<RemoveSchedulesResponse> {
    try {
      const response = await apiClient.delete<RemoveSchedulesResponse>(
        `${BASE_PATH}/${userId}/schedules`
      )
      
      return response.data
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response
        
        switch (status) {
          case 401:
            throw new Error('Authentication required. Please log in.')
          case 403:
            throw new Error('You do not have permission to remove schedule assignments.')
          case 404:
            throw new Error(`User with ID ${userId} not found.`)
          case 500:
            throw new Error('Server error while removing schedules. Please try again.')
          default:
            throw new Error(data?.message || 'Failed to remove schedules.')
        }
      }
      
      throw new Error('Network error. Please check your connection.')
    }
  },
}

/**
 * Export individual methods for tree-shaking and named imports
 */
export const {
  getUserSchedules,
  assignSchedules,
  removeAllSchedules,
} = userScheduleService

/**
 * Export service as default
 */
export default userScheduleService
