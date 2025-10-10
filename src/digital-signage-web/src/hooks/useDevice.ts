import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deviceApi } from '@/services/deviceApi'
import { 
  Device, 
  DeviceConfiguration, 
  DeviceStatusLog, 
  RegistrationRecord,
  DeviceRegistrationRequest,
  DeviceApprovalRequest,
  DeviceRejectionRequest,
  UpdateDeviceConfigurationRequest,
  DeviceFilters 
} from '@/types/api'
import { toast } from 'react-hot-toast'

/**
 * Query key factory for device-related queries
 * 
 * Provides consistent cache keys for React Query device operations.
 * Used internally by device hooks for cache management and invalidation.
 * 
 * @see https://tanstack.com/query/latest/docs/react/guides/query-keys
 */
export const deviceQueryKeys = {
  all: ['devices'] as const,
  lists: () => [...deviceQueryKeys.all, 'list'] as const,
  list: (filters?: DeviceFilters) => [...deviceQueryKeys.lists(), filters] as const,
  details: () => [...deviceQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...deviceQueryKeys.details(), id] as const,
  configuration: (id: number) => [...deviceQueryKeys.all, 'configuration', id] as const,
  statusLogs: (id: number) => [...deviceQueryKeys.all, 'status-logs', id] as const,
  registrationRecords: (id: number) => [...deviceQueryKeys.all, 'registration-records', id] as const,
  pendingRegistrations: () => [...deviceQueryKeys.all, 'pending-registrations'] as const,
  statistics: () => [...deviceQueryKeys.all, 'statistics'] as const,
  connectivity: (id: number) => [...deviceQueryKeys.all, 'connectivity', id] as const,
}

// ========================
// Query Hooks
// ========================

/**
 * Hook to fetch all devices with optional filtering
 * 
 * Retrieves device list from the API with automatic caching and background refetching.
 * Supports filtering by status, location, group, and search query.
 * 
 * @param filters - Optional filters for device list (status, location, deviceGroupId, search)
 * @returns React Query result with devices array and query state
 * 
 * @example
 * ```tsx
 * // Fetch all devices
 * const { data: devices, isLoading, error } = useDevices()
 * 
 * // Fetch with filters
 * const { data } = useDevices({ 
 *   status: 'online', 
 *   deviceGroupId: 5 
 * })
 * 
 * // Handle loading and error states
 * if (isLoading) return <LoadingSkeleton variant="table" count={5} />
 * if (error) return <ErrorState error={error} />
 * ```
 * 
 * @see deviceApi.getDevices for API implementation
 */
export const useDevices = (filters?: DeviceFilters) => {
  return useQuery({
    queryKey: deviceQueryKeys.list(filters),
    queryFn: () => deviceApi.getDevices(filters),
    staleTime: 30000, // 30 seconds
    cacheTime: 300000, // 5 minutes
  })
}

/**
 * Hook to fetch a single device by ID
 * 
 * Retrieves detailed information for a specific device including status,
 * configuration, and last heartbeat. Data is cached for 5 minutes.
 * 
 * @param id - Device ID to fetch
 * @param enabled - Whether the query should run (default: true)
 * @returns React Query result with device details and query state
 * 
 * @example
 * ```tsx
 * const { data: device, isLoading } = useDevice(deviceId)
 * 
 * if (isLoading) return <LoadingSkeleton variant="card" />
 * if (!device) return <EmptyState message="Device not found" />
 * 
 * return <DeviceCard device={device} />
 * ```
 * 
 * @see deviceApi.getDevice for API implementation
 */
export const useDevice = (id: number, enabled = true) => {
  return useQuery({
    queryKey: deviceQueryKeys.detail(id),
    queryFn: () => deviceApi.getDevice(id),
    enabled: enabled && !!id,
    staleTime: 30000,
    cacheTime: 300000,
  })
}

/**
 * Hook to fetch device configuration settings
 * 
 * Retrieves configuration parameters for a specific device including
 * resolution, orientation, refresh rate, and other display settings.
 * 
 * @param deviceId - Device ID to fetch configuration for
 * @param enabled - Whether the query should run (default: true)
 * @returns React Query result with device configuration and query state
 * 
 * @example
 * ```tsx
 * const { data: config } = useDeviceConfiguration(deviceId)
 * 
 * return (
 *   <ConfigPanel 
 *     resolution={config?.resolution}
 *     orientation={config?.orientation}
 *   />
 * )
 * ```
 */
export const useDeviceConfiguration = (deviceId: number, enabled = true) => {
  return useQuery({
    queryKey: deviceQueryKeys.configuration(deviceId),
    queryFn: () => deviceApi.getDeviceConfiguration(deviceId),
    enabled: enabled && !!deviceId,
    staleTime: 60000, // 1 minute
    cacheTime: 300000,
  })
}

/**
 * Get device status logs
 */
export const useDeviceStatusLogs = (deviceId: number, limit = 50, enabled = true) => {
  return useQuery({
    queryKey: deviceQueryKeys.statusLogs(deviceId),
    queryFn: () => deviceApi.getDeviceStatusLogs(deviceId, limit),
    enabled: enabled && !!deviceId,
    staleTime: 10000, // 10 seconds
    cacheTime: 60000, // 1 minute
  })
}

/**
 * Get device registration records
 */
export const useRegistrationRecords = (deviceId: number, enabled = true) => {
  return useQuery({
    queryKey: deviceQueryKeys.registrationRecords(deviceId),
    queryFn: () => deviceApi.getRegistrationRecords(deviceId),
    enabled: enabled && !!deviceId,
    staleTime: 30000,
    cacheTime: 300000,
  })
}

/**
 * Get pending device registration requests
 */
export const usePendingRegistrations = () => {
  return useQuery({
    queryKey: deviceQueryKeys.pendingRegistrations(),
    queryFn: () => deviceApi.getPendingRegistrations(),
    staleTime: 10000, // 10 seconds
    cacheTime: 60000,
  })
}

/**
 * Get device statistics
 */
export const useDeviceStatistics = () => {
  return useQuery({
    queryKey: deviceQueryKeys.statistics(),
    queryFn: () => deviceApi.getDeviceStatistics(),
    staleTime: 60000, // 1 minute
    cacheTime: 300000,
  })
}

/**
 * Check device connectivity
 */
export const useDeviceConnectivity = (deviceId: number, enabled = true) => {
  return useQuery({
    queryKey: deviceQueryKeys.connectivity(deviceId),
    queryFn: () => deviceApi.checkDeviceConnectivity(deviceId),
    enabled: enabled && !!deviceId,
    staleTime: 5000, // 5 seconds
    cacheTime: 30000,
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

// ========================
// Mutation Hooks
// ========================

/**
 * Register new Android TV device
 */
export const useRegisterDevice = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: DeviceRegistrationRequest) => deviceApi.registerDevice(data),
    onSuccess: (response) => {
      toast.success('Device registration request submitted successfully')
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.pendingRegistrations() })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to register device')
    },
  })
}

/**
 * Approve/reject device registration
 */
export const useApproveDeviceRegistration = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: DeviceApprovalRequest) => deviceApi.approveDeviceRegistration(data),
    onSuccess: (response, variables) => {
      toast.success('Device registration approved successfully')
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.pendingRegistrations() })
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.statistics() })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve device registration')
    },
  })
}

export const useRejectDeviceRegistration = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: DeviceRejectionRequest) => deviceApi.rejectDeviceRegistration(data),
    onSuccess: (response, variables) => {
      toast.success('Device registration rejected successfully')
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.pendingRegistrations() })
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.statistics() })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject device registration')
    },
  })
}

/**
 * Update device information
 */
export const useUpdateDevice = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Device> }) => 
      deviceApi.updateDevice(id, data),
    onSuccess: (response, variables) => {
      toast.success('Device updated successfully')
      
      // Update cache
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.lists() })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update device')
    },
  })
}

/**
 * Update device configuration
 */
export const useUpdateDeviceConfiguration = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ deviceId, data }: { deviceId: number; data: UpdateDeviceConfigurationRequest }) => 
      deviceApi.updateDeviceConfiguration(deviceId, data),
    onSuccess: (response, variables) => {
      toast.success('Device configuration updated successfully')
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.configuration(variables.deviceId) })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update device configuration')
    },
  })
}

/**
 * Deactivate device
 */
export const useDeactivateDevice = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => 
      deviceApi.deactivateDevice(id, reason),
    onSuccess: (response, variables) => {
      toast.success('Device deactivated successfully')
      
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.statistics() })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to deactivate device')
    },
  })
}

/**
 * Reactivate device
 */
export const useReactivateDevice = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => deviceApi.reactivateDevice(id),
    onSuccess: (response, variables) => {
      toast.success('Device reactivated successfully')
      
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.detail(variables) })
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.statistics() })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reactivate device')
    },
  })
}

/**
 * Delete device
 */
export const useDeleteDevice = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => deviceApi.deleteDevice(id),
    onSuccess: (response, variables) => {
      toast.success('Device deleted successfully')
      
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.statistics() })
      queryClient.removeQueries({ queryKey: deviceQueryKeys.detail(variables) })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete device')
    },
  })
}

/**
 * Reset device configuration
 */
export const useResetDeviceConfiguration = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (deviceId: number) => deviceApi.resetDeviceConfiguration(deviceId),
    onSuccess: (response, variables) => {
      toast.success('Device configuration reset to defaults')
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.configuration(variables) })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reset device configuration')
    },
  })
}

/**
 * Refresh device status
 */
export const useRefreshDeviceStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (deviceId: number) => deviceApi.refreshDeviceStatus(deviceId),
    onSuccess: (response, variables) => {
      toast.success('Device status refreshed')
      
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.detail(variables) })
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.connectivity(variables) })
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.statusLogs(variables) })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to refresh device status')
    },
  })
}

/**
 * Bulk update devices
 */
export const useBulkUpdateDevices = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ deviceIds, data }: { deviceIds: number[]; data: Partial<Device> }) => 
      deviceApi.bulkUpdateDevices(deviceIds, data),
    onSuccess: () => {
      toast.success('Devices updated successfully')
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.statistics() })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update devices')
    },
  })
}

/**
 * Bulk deactivate devices
 */
export const useBulkDeactivateDevices = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ deviceIds, reason }: { deviceIds: number[]; reason?: string }) => 
      deviceApi.bulkDeactivateDevices(deviceIds, reason),
    onSuccess: () => {
      toast.success('Devices deactivated successfully')
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: deviceQueryKeys.statistics() })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to deactivate devices')
    },
  })
}