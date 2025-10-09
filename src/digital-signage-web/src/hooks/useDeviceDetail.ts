import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deviceDetailService } from '@/services/deviceDetailService'
import type { 
  DeviceDetail, 
  DeviceConfiguration, 
  DeviceConfigurationUpdate 
} from '@/types/device-detail'

/**
 * Query keys for device detail
 */
export const deviceDetailKeys = {
  all: ['device-detail'] as const,
  detail: (id: number) => [...deviceDetailKeys.all, 'detail', id] as const,
  configuration: (id: number) => [...deviceDetailKeys.all, 'configuration', id] as const,
}

/**
 * Hook to fetch device detail by ID
 * Refetches every 30 seconds to keep status current
 */
export const useDeviceDetail = (deviceId: number) => {
  return useQuery({
    queryKey: deviceDetailKeys.detail(deviceId),
    queryFn: () => deviceDetailService.getById(deviceId),
    refetchInterval: 30000, // 30 seconds
    staleTime: 20000, // 20 seconds
  })
}

/**
 * Hook to fetch device configuration
 * Refetches every minute as configuration changes less frequently
 */
export const useDeviceConfiguration = (deviceId: number) => {
  return useQuery({
    queryKey: deviceDetailKeys.configuration(deviceId),
    queryFn: () => deviceDetailService.getConfiguration(deviceId),
    refetchInterval: 60000, // 1 minute
    staleTime: 45000, // 45 seconds
  })
}

/**
 * Hook to update device configuration
 */
export const useUpdateDeviceConfiguration = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      deviceId, 
      config 
    }: { 
      deviceId: number; 
      config: DeviceConfigurationUpdate 
    }) => deviceDetailService.updateConfiguration(deviceId, config),
    onSuccess: (_, { deviceId }) => {
      // Invalidate configuration query to refetch
      queryClient.invalidateQueries({ 
        queryKey: deviceDetailKeys.configuration(deviceId) 
      })
    },
  })
}

/**
 * Hook to update device information
 */
export const useUpdateDevice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      deviceId, 
      data 
    }: { 
      deviceId: number; 
      data: Partial<DeviceDetail> 
    }) => deviceDetailService.update(deviceId, data),
    onSuccess: (_, { deviceId }) => {
      // Invalidate device detail query to refetch
      queryClient.invalidateQueries({ 
        queryKey: deviceDetailKeys.detail(deviceId) 
      })
      // Also invalidate device list if it exists
      queryClient.invalidateQueries({ 
        queryKey: ['devices'] 
      })
    },
  })
}

/**
 * Hook to deactivate device
 */
export const useDeactivateDevice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (deviceId: number) => deviceDetailService.deactivate(deviceId),
    onSuccess: (_, deviceId) => {
      // Invalidate device detail query
      queryClient.invalidateQueries({ 
        queryKey: deviceDetailKeys.detail(deviceId) 
      })
      // Invalidate device list
      queryClient.invalidateQueries({ 
        queryKey: ['devices'] 
      })
    },
  })
}

/**
 * Hook to restart device
 */
export const useRestartDevice = () => {
  return useMutation({
    mutationFn: (deviceId: number) => deviceDetailService.restart(deviceId),
  })
}
