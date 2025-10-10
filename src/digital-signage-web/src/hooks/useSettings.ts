import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsService, type SystemSetting, type UpdateSettingsRequest } from '@/services/settingsService'
import { toast } from 'react-hot-toast'

/**
 * Query keys for settings
 */
export const settingsQueryKeys = {
  all: ['settings'] as const,
  lists: () => [...settingsQueryKeys.all, 'list'] as const,
  categories: () => [...settingsQueryKeys.all, 'categories'] as const,
  category: (category: string) => [...settingsQueryKeys.all, 'category', category] as const,
}

/**
 * Hook to fetch all system settings
 */
export const useSettings = () => {
  return useQuery({
    queryKey: settingsQueryKeys.lists(),
    queryFn: () => settingsService.getSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes - settings don't change often
    cacheTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook to fetch settings by category
 */
export const useSettingsByCategory = (category: string) => {
  return useQuery({
    queryKey: settingsQueryKeys.category(category),
    queryFn: () => settingsService.getSettingsByCategory(category),
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook to fetch available categories
 */
export const useSettingsCategories = () => {
  return useQuery({
    queryKey: settingsQueryKeys.categories(),
    queryFn: () => settingsService.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes - categories rarely change
    cacheTime: 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Hook to update system settings
 */
export const useUpdateSettings = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (request: UpdateSettingsRequest) => settingsService.updateSettings(request),
    onSuccess: (updatedSettings, variables) => {
      toast.success(`Updated ${variables.settings.length} settings successfully`)
      
      // Invalidate and refetch settings queries
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.all })
      
      // Update cache with new data
      queryClient.setQueryData(settingsQueryKeys.lists(), (oldData: SystemSetting[] | undefined) => {
        if (!oldData) return updatedSettings
        
        const updatedMap = new Map(updatedSettings.map(s => [s.key, s]))
        return oldData.map(setting => updatedMap.get(setting.key) || setting)
      })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update settings'
      toast.error(message)
    },
  })
}

/**
 * Hook to reset settings to defaults
 */
export const useResetSettings = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (category?: string) => settingsService.resetToDefaults(category),
    onSuccess: (resetSettings, category) => {
      const message = category 
        ? `Reset ${category} settings to defaults`
        : 'Reset all settings to defaults'
      toast.success(message)
      
      // Invalidate and refetch settings queries
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.all })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to reset settings'
      toast.error(message)
    },
  })
}

/**
 * Hook to get setting value by key (optimized for single setting access)
 */
export const useSettingValue = (key: string) => {
  const { data: settings } = useSettings()
  return settings?.find(s => s.key === key)?.value
}

/**
 * Hook to check if user can modify settings (admin check)
 */
export const useCanModifySettings = () => {
  // In a real implementation, this would check user permissions
  // For now, we'll assume admin access (you can integrate with your auth system)
  return true
}
