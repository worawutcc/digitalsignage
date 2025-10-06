/**
 * User API Client
 * 
 * Provides methods for user management operations.
 * Following copilot-instructions-ui.instructions.md patterns.
 */

import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

/**
 * User DTO from backend
 */
export interface User {
  id: number
  username: string
  email: string
  firstName?: string
  lastName?: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/**
 * User API client
 */
export const userApi = {
  /**
   * Get all users (Admin only)
   * @returns Promise with array of users
   */
  getAll: async (): Promise<User[]> => {
    const response = await axios.get<User[]>(`${API_BASE_URL}/api/users`, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })
    return response.data
  },

  /**
   * Get user by ID
   * @param id User ID
   * @returns Promise with user details
   */
  getById: async (id: number): Promise<User> => {
    const response = await axios.get<User>(`${API_BASE_URL}/api/users/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })
    return response.data
  },

  /**
   * Get current user profile
   * @returns Promise with current user details
   */
  getProfile: async (): Promise<User> => {
    const response = await axios.get<User>(`${API_BASE_URL}/api/users/profile`, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })
    return response.data
  },
}
