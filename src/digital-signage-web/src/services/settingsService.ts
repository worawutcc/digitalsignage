import { apiClient } from '@/lib/api'
import type { 
  UserProfile, 
  UpdateProfileRequest, 
  ChangePasswordRequest 
} from '@/types/settings'

/**
 * Settings service for user profile and account management
 */
export const settingsService = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/api/users/profile')
    return response.data
  },

  /**
   * Update current user profile
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await apiClient.put<UserProfile>('/api/users/profile', data)
    return response.data
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post('/api/users/change-password', data)
  }
}
