import { apiClient } from '@/lib/api'

/**
 * System setting interface matching backend DTO
 */
export interface SystemSetting {
  id: number
  key: string
  value: string
  category: string
  displayName: string
  description: string
  dataType: string
  defaultValue?: string
  isReadOnly: boolean
  updatedAt: string
  updatedBy: string
}

/**
 * Request to update multiple settings
 */
export interface UpdateSettingsRequest {
  settings: UpdateSettingItem[]
}

/**
 * Individual setting update item
 */
export interface UpdateSettingItem {
  key: string
  value: string
}

/**
 * Request to reset settings to defaults
 */
export interface ResetSettingsRequest {
  category?: string
}

/**
 * Settings service for system configuration management
 */
export const settingsService = {
  /**
   * Get all system settings
   */
  getSettings: async (): Promise<SystemSetting[]> => {
    const response = await apiClient.get<SystemSetting[]>('/api/settings')
    // Add Array.isArray() guard for safety
    return Array.isArray(response.data) ? response.data : []
  },

  /**
   * Get settings by category
   */
  getSettingsByCategory: async (category: string): Promise<SystemSetting[]> => {
    const response = await apiClient.get<SystemSetting[]>(`/api/settings/${category}`)
    // Add Array.isArray() guard for safety
    return Array.isArray(response.data) ? response.data : []
  },

  /**
   * Update multiple system settings
   */
  updateSettings: async (request: UpdateSettingsRequest): Promise<SystemSetting[]> => {
    const response = await apiClient.put<SystemSetting[]>('/api/settings', request)
    // Add Array.isArray() guard for safety
    return Array.isArray(response.data) ? response.data : []
  },

    /**
   * Reset settings to default values
   */
  resetToDefaults: async (category?: string): Promise<SystemSetting[]> => {
    const response = await apiClient.post<SystemSetting[]>('/settings/reset', {
      category
    })
    return Array.isArray(response.data) ? response.data : []
  },

  /**
   * Get available setting categories
   */
  getCategories: async (): Promise<string[]> => {
    // Extract categories from all settings
    const settings = await settingsService.getSettings()
    const categories = [...new Set(settings.map(s => s.category))].sort()
    return categories
  }
}
