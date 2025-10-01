import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deviceService } from '../services/deviceService'
import { Device } from '../types'

export interface UseDevicesOptions {
  refetchInterval?: number
  enabled?: boolean
}

export interface DeviceFilters {
  search?: string
  status?: string[]
  location?: string[]
  deviceGroup?: string[]
  resolution?: string[]
}

/**
 * Custom hook for managing device data with React Query
 * Provides CRUD operations and real-time updates for devices
 * 
 * @param options - Hook configuration options
 */
export function useDevices(options: UseDevicesOptions = {}) {
  const {
    refetchInterval = 30000, // 30 seconds
    enabled = true,
  } = options

  const queryClient = useQueryClient()

  // Fetch all devices
  const devicesQuery = useQuery<Device[]>({
    queryKey: ['devices'],
    queryFn: deviceService.getAll,
    refetchInterval,
    enabled,
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })

  // Create device mutation
  const createDeviceMutation = useMutation({
    mutationFn: deviceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      queryClient.invalidateQueries({ queryKey: ['device-stats'] })
    },
  })

  // Update device mutation
  const updateDeviceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Device> }) =>
      deviceService.update(id, data),
    onSuccess: (updatedDevice) => {
      queryClient.setQueryData(['devices'], (oldData: Device[] | undefined) => {
        if (!oldData) return [updatedDevice]
        return oldData.map(device => 
          device.id === updatedDevice.id ? updatedDevice : device
        )
      })
      queryClient.invalidateQueries({ queryKey: ['device-stats'] })
    },
  })

  // Delete device mutation
  const deleteDeviceMutation = useMutation({
    mutationFn: (id: number) => deviceService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['devices'], (oldData: Device[] | undefined) => {
        if (!oldData) return []
        return oldData.filter(device => device.id !== deletedId)
      })
      queryClient.invalidateQueries({ queryKey: ['device-stats'] })
    },
  })

  // Restart device mutation
  const restartDeviceMutation = useMutation({
    mutationFn: (deviceId: number) => deviceService.restart(deviceId),
    onSuccess: (_, deviceId) => {
      // Optimistically update device status
      queryClient.setQueryData(['devices'], (oldData: Device[] | undefined) => {
        if (!oldData) return []
        return oldData.map(device => 
          device.id === deviceId 
            ? { ...device, status: 'maintenance' as const }
            : device
        )
      })
      // Refetch after a delay to get the updated status
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['devices'] })
      }, 3000)
    },
  })

  // Get device statistics
  const deviceStatsQuery = useQuery({
    queryKey: ['device-stats'],
    queryFn: deviceService.getStats,
    refetchInterval,
    enabled,
  })

  // Filter devices based on criteria
  const filterDevices = (devices: Device[], filters: DeviceFilters): Device[] => {
    return devices.filter(device => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = 
          device.name.toLowerCase().includes(searchLower) ||
          device.location.toLowerCase().includes(searchLower)
        
        if (!matchesSearch) return false
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(device.status)) return false
      }

      // Location filter
      if (filters.location && filters.location.length > 0) {
        if (!filters.location.includes(device.location)) return false
      }

      // Device group filter
      if (filters.deviceGroup && filters.deviceGroup.length > 0) {
        if (!device.deviceGroupId || !filters.deviceGroup.includes(device.deviceGroupId.toString())) {
          return false
        }
      }

      // Resolution filter
      if (filters.resolution && filters.resolution.length > 0) {
        if (!device.resolution || !filters.resolution.includes(device.resolution)) return false
      }

      return true
    })
  }

  // Get unique values for filter options
  const getFilterOptions = (devices: Device[]) => {
    const locations = [...new Set(devices.map(d => d.location))].sort()
    const deviceGroups = [...new Set(devices.map(d => d.deviceGroupId?.toString()).filter(Boolean))].sort()
    const resolutions = [...new Set(devices.map(d => d.resolution).filter(Boolean))].sort()
    
    return { locations, deviceGroups, resolutions }
  }

  return {
    // Data
    devices: devicesQuery.data || [],
    deviceStats: deviceStatsQuery.data,
    
    // Loading states
    isLoading: devicesQuery.isLoading,
    isStatsLoading: deviceStatsQuery.isLoading,
    
    // Error states
    error: devicesQuery.error,
    statsError: deviceStatsQuery.error,
    
    // Mutations
    createDevice: createDeviceMutation.mutate,
    updateDevice: updateDeviceMutation.mutate,
    deleteDevice: deleteDeviceMutation.mutate,
    restartDevice: restartDeviceMutation.mutate,
    
    // Mutation states
    isCreating: createDeviceMutation.isPending,
    isUpdating: updateDeviceMutation.isPending,
    isDeleting: deleteDeviceMutation.isPending,
    isRestarting: restartDeviceMutation.isPending,
    
    // Utilities
    filterDevices,
    getFilterOptions,
    
    // Refresh functions
    refetch: devicesQuery.refetch,
    refetchStats: deviceStatsQuery.refetch,
  }
}

/**
 * Hook for getting a single device by ID
 */
export function useDevice(deviceId: number | null, enabled = true) {
  return useQuery<Device>({
    queryKey: ['device', deviceId],
    queryFn: () => deviceService.getById(deviceId!),
    enabled: enabled && deviceId !== null,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook for getting device heartbeat/health data
 */
export function useDeviceHealth(deviceId: number, enabled = true) {
  return useQuery({
    queryKey: ['device-health', deviceId],
    queryFn: () => deviceService.getHealth(deviceId),
    enabled: enabled && !!deviceId,
    refetchInterval: 10000, // 10 seconds for health data
  })
}

export default useDevices