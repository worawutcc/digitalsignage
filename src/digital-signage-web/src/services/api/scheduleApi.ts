/**
 * Schedule API Client
 * 
 * Provides methods for schedule management operations.
 * Following copilot-instructions-ui.instructions.md patterns.
 */

import { apiClient } from '@/lib/api'

/**
 * Schedule DTO from backend
 */
export interface Schedule {
  id: number
  name: string
  startDate: string
  endDate: string
  priority: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Schedule API client
 */
export const scheduleApi = {
  /**
   * Get all schedules
   * @returns Promise with array of schedules
   */
  getAll: async (): Promise<Schedule[]> => {
    const response = await apiClient.get<Schedule[]>('/api/schedules')
    return response.data
  },

  /**
   * Get schedule by ID
   * @param id Schedule ID
   * @returns Promise with schedule details
   */
  getById: async (id: number): Promise<Schedule> => {
    const response = await apiClient.get<Schedule>(`/api/schedules/${id}`)
    return response.data
  },

  /**
   * Create new schedule
   * @param data Schedule creation data
   * @returns Promise with created schedule
   */
  create: async (data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schedule> => {
    const response = await apiClient.post<Schedule>('/api/schedules', data)
    return response.data
  },

  /**
   * Update existing schedule
   * @param id Schedule ID
   * @param data Schedule update data
   * @returns Promise with updated schedule
   */
  update: async (id: number, data: Partial<Schedule>): Promise<Schedule> => {
    const response = await apiClient.put<Schedule>(`/api/schedules/${id}`, data)
    return response.data
  },

  /**
   * Delete schedule
   * @param id Schedule ID
   * @returns Promise
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/schedules/${id}`)
  },
}
