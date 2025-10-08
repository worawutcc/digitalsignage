/**
 * User Schedule API service for user schedule assignment operations
 * Connects to backend /api/admin/users/{userId}/schedules endpoints (UserScheduleController)
 * 
 * IMPORTANT: Updated to match backend API routes exactly
 */

import { apiClient } from '@/lib/api';

// ================== Types & Interfaces ==================

/**
 * Schedule DTO matching backend
 */
export interface ScheduleDto {
  scheduleId: number;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get user schedules response (from backend)
 */
export interface GetUserSchedulesResponseDto {
  userId: number;
  userEmail: string;
  userName: string;
  schedules: ScheduleDto[];
  totalSchedules: number;
}

/**
 * Assign schedules response (from backend)
 */
export interface AssignSchedulesResponseDto {
  userId: number;
  assignedSchedules: ScheduleDto[];
  totalAssigned: number;
  assignedBy: number;
  assignedAt: string;
}

/**
 * User schedule service for API integration
 * Handles all user schedule assignment operations per backend UserScheduleController
 */
export class UserScheduleService {
  /**
   * Get schedules assigned to a user
   * Backend: GET /api/admin/users/{userId}/schedules
   * 
   * @param userId - User ID
   * @returns User schedules response
   */
  static async getUserSchedules(userId: number): Promise<GetUserSchedulesResponseDto> {
    const response = await apiClient.get(`/api/admin/users/${userId}/schedules`);
    return response.data;
  }

  /**
   * Assign schedules to a user (replaces existing assignments)
   * Backend: POST /api/admin/users/{userId}/schedules
   * 
   * IMPORTANT: This operation REPLACES all existing schedule assignments for this user.
   * To remove all assignments, send an empty array.
   * 
   * @param userId - User ID
   * @param scheduleIds - Array of schedule IDs to assign
   * @returns Assignment result with assigned schedules
   */
  static async assignUserSchedules(
    userId: number,
    scheduleIds: number[]
  ): Promise<AssignSchedulesResponseDto> {
    const response = await apiClient.post(
      `/api/admin/users/${userId}/schedules`,
      { scheduleIds }
    );
    return response.data;
  }

  /**
   * Remove all schedule assignments from a user
   * Backend: DELETE /api/admin/users/{userId}/schedules
   * 
   * @param userId - User ID
   * @returns No content on success
   */
  static async removeUserSchedules(userId: number): Promise<void> {
    await apiClient.delete(`/api/admin/users/${userId}/schedules`);
  }

  /**
   * Add a single schedule to a user (without replacing existing)
   * Helper method that fetches existing schedules and adds new one
   * 
   * @param userId - User ID
   * @param scheduleId - Schedule ID to add
   * @returns Assignment result
   */
  static async addScheduleToUser(
    userId: number,
    scheduleId: number
  ): Promise<AssignSchedulesResponseDto> {
    // Get existing schedules
    const existing = await this.getUserSchedules(userId);
    const existingIds = existing.schedules.map(s => s.scheduleId);
    
    // Add new schedule if not already assigned
    if (!existingIds.includes(scheduleId)) {
      existingIds.push(scheduleId);
    }
    
    // Assign all schedules
    return await this.assignUserSchedules(userId, existingIds);
  }

  /**
   * Remove a single schedule from a user (without removing others)
   * Helper method that fetches existing schedules and removes specific one
   * 
   * @param userId - User ID
   * @param scheduleId - Schedule ID to remove
   * @returns Assignment result
   */
  static async removeScheduleFromUser(
    userId: number,
    scheduleId: number
  ): Promise<AssignSchedulesResponseDto> {
    // Get existing schedules
    const existing = await this.getUserSchedules(userId);
    const existingIds = existing.schedules.map(s => s.scheduleId);
    
    // Remove the schedule
    const updatedIds = existingIds.filter(id => id !== scheduleId);
    
    // Assign remaining schedules
    return await this.assignUserSchedules(userId, updatedIds);
  }

  /**
   * Check if a user has a specific schedule assigned
   * 
   * @param userId - User ID
   * @param scheduleId - Schedule ID to check
   * @returns True if schedule is assigned
   */
  static async hasSchedule(userId: number, scheduleId: number): Promise<boolean> {
    try {
      const schedules = await this.getUserSchedules(userId);
      return schedules.schedules.some(s => s.scheduleId === scheduleId);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get count of schedules assigned to a user
   * 
   * @param userId - User ID
   * @returns Number of assigned schedules
   */
  static async getScheduleCount(userId: number): Promise<number> {
    try {
      const schedules = await this.getUserSchedules(userId);
      return schedules.totalSchedules;
    } catch (error) {
      return 0;
    }
  }
}

export default UserScheduleService;