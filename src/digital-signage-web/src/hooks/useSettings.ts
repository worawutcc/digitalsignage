import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsService } from '@/services/settingsService'
import type { UpdateProfileRequest, ChangePasswordRequest } from '@/types/settings'

/**
 * Query keys for settings
 */
export const settingsKeys = {
  all: ['settings'] as const,
  profile: () => [...settingsKeys.all, 'profile'] as const,
}

/**
 * Hook to fetch current user profile
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: settingsKeys.profile(),
    queryFn: () => settingsService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes - profile doesn't change often
  })
}

/**
 * Hook to update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => settingsService.updateProfile(data),
    onSuccess: () => {
      // Invalidate profile to refetch updated data
      queryClient.invalidateQueries({ 
        queryKey: settingsKeys.profile() 
      })
    },
  })
}

/**
 * Hook to change password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => settingsService.changePassword(data),
  })
}
