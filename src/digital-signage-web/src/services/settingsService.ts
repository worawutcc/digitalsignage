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
    try {
      const response = await apiClient.get<SystemSetting[]>('/api/settings')
      
      const settingsArray = Array.isArray(response.data) ? response.data : []
      console.log('[SettingsService] System settings retrieved:', settingsArray.length)
      return settingsArray
    } catch (error) {
      console.error('[SettingsService] Failed to get system settings:', error)
      return [] // Safe fallback
    }
  },

  /**
   * Get settings by category
   */
  getSettingsByCategory: async (category: string): Promise<SystemSetting[]> => {
    try {
      const response = await apiClient.get<SystemSetting[]>(`/api/settings/${category}`)
      
      const settingsArray = Array.isArray(response.data) ? response.data : []
      console.log('[SettingsService] Settings by category retrieved:', category, settingsArray.length)
      return settingsArray
    } catch (error) {
      console.error('[SettingsService] Failed to get settings by category:', category, error)
      return [] // Safe fallback
    }
  },

  /**
   * Update multiple system settings
   */
  updateSettings: async (request: UpdateSettingsRequest): Promise<SystemSetting[]> => {
    try {
      const response = await apiClient.put<SystemSetting[]>('/api/settings', request)
      
      const settingsArray = Array.isArray(response.data) ? response.data : []
      console.log('[SettingsService] Settings updated successfully:', settingsArray.length)
      return settingsArray
    } catch (error) {
      console.error('[SettingsService] Failed to update settings:', error)
      return [] // Safe fallback
    }
  },

  /**
   * Reset settings to default values
   */
  resetToDefaults: async (category?: string): Promise<SystemSetting[]> => {
    try {
      const response = await apiClient.post<SystemSetting[]>('/settings/reset', {
        category
      })
      
      const settingsArray = Array.isArray(response.data) ? response.data : []
      console.log('[SettingsService] Settings reset to defaults:', category || 'all', settingsArray.length)
      return settingsArray
    } catch (error) {
      console.error('[SettingsService] Failed to reset settings to defaults:', category, error)
      return [] // Safe fallback
    }
  },

  /**
   * Get available setting categories
   */
  getCategories: async (): Promise<string[]> => {
    try {
      // Extract categories from all settings
      const settings = await settingsService.getSettings()
      const categories = [...new Set(settings.map(s => s.category))].sort()
      console.log('[SettingsService] Setting categories retrieved:', categories.length)
      return categories
    } catch (error) {
      console.error('[SettingsService] Failed to get setting categories:', error)
      return [] // Safe fallback
    }
  }
}
