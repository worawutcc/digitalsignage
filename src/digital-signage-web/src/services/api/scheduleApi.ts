/**
 * Schedule API Client
 * 
 * Provides methods for schedule management operations.
 * Following copilot-instructions-ui.instructions.md patterns.
 */

import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

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
    const response = await axios.get<Schedule[]>(`${API_BASE_URL}/api/schedules`, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })
    return response.data
  },

  /**
   * Get schedule by ID
   * @param id Schedule ID
   * @returns Promise with schedule details
   */
  getById: async (id: number): Promise<Schedule> => {
    const response = await axios.get<Schedule>(`${API_BASE_URL}/api/schedules/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })
    return response.data
  },

  /**
   * Create new schedule
   * @param data Schedule creation data
   * @returns Promise with created schedule
   */
  create: async (data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schedule> => {
    const response = await axios.post<Schedule>(`${API_BASE_URL}/api/schedules`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })
    return response.data
  },

  /**
   * Update existing schedule
   * @param id Schedule ID
   * @param data Schedule update data
   * @returns Promise with updated schedule
   */
  update: async (id: number, data: Partial<Schedule>): Promise<Schedule> => {
    const response = await axios.put<Schedule>(`${API_BASE_URL}/api/schedules/${id}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })
    return response.data
  },

  /**
   * Delete schedule
   * @param id Schedule ID
   * @returns Promise
   */
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/api/schedules/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })
  },
}
