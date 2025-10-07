/**
 * useDeviceHealth Hook
 * 
 * React Query hook for fetching and managing device health data including
 * real-time metrics, heartbeat information, and health alerts.
 * 
 * @example
 * ```typescript
 * const { data: deviceHealth, isLoading, error } = useDeviceHealth(deviceId)
 * 
 * if (deviceHealth) {
 *   console.log(`Device ${deviceHealth.deviceName} status: ${deviceHealth.healthStatus}`)
 *   console.log(`CPU Usage: ${deviceHealth.currentMetrics.cpuUsage}%`)
 * }
 * ```
 * 
 * @see copilot-instructions-ui.instructions.md - React Query patterns
 * @see DeviceHealth interface in types/deviceHealth.types.ts
 */

import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query'
import { useEffect } from 'react'
import { apiClient } from '@/lib/api'
import type {
  DeviceHealth,
  HealthMetrics,
  HeartbeatData,
  DeviceHealthFilters,
  HealthStatistics,
  HealthAlert,
  DeviceHealthStatus,
  DEFAULT_HEALTH_THRESHOLDS,
} from '@/types/deviceHealth.types'

/**
 * Fetch device health data for a specific device
 * 
 * @param deviceId - Device ID to fetch health for
 * @returns Promise resolving to DeviceHealth object
 * @throws {Error} If device not found or API error
 * 
 * @example
 * ```typescript
 * const health = await fetchDeviceHealth(123)
 * console.log('CPU:', health.currentMetrics.cpuUsage)
 * ```
 */
export async function fetchDeviceHealth(deviceId: number): Promise<DeviceHealth> {
  const response = await apiClient.get(`/api/devices/${deviceId}/health`)
  return response.data
}

/**
 * Fetch health data for all devices with optional filters
 * 
 * @param filters - Optional filters for health query
 * @returns Promise resolving to array of DeviceHealth objects
 * 
 * @example
 * ```typescript
 * const devices = await fetchAllDevicesHealth({
 *   healthStatus: ['warning', 'critical'],
 *   deviceStatus: ['Online']
 * })
 * ```
 */
export async function fetchAllDevicesHealth(
  filters?: DeviceHealthFilters
): Promise<DeviceHealth[]> {
  const response = await apiClient.get('/api/devices/health', { params: filters })
  return response.data
}

/**
 * Fetch health statistics summary
 * 
 * @returns Promise resolving to HealthStatistics object
 * 
 * @example
 * ```typescript
 * const stats = await fetchHealthStatistics()
 * console.log(`Healthy devices: ${stats.healthyDevices}/${stats.totalDevices}`)
 * ```
 */
export async function fetchHealthStatistics(): Promise<HealthStatistics> {
  const response = await apiClient.get('/api/devices/health/statistics')
  return response.data
}

/**
 * Fetch active health alerts
 * 
 * @param deviceId - Optional device ID to filter alerts
 * @returns Promise resolving to array of HealthAlert objects
 * 
 * @example
 * ```typescript
 * const alerts = await fetchHealthAlerts()
 * const criticalAlerts = alerts.filter(a => a.severity === 'critical')
 * ```
 */
export async function fetchHealthAlerts(deviceId?: number): Promise<HealthAlert[]> {
  const url = deviceId ? `/api/devices/${deviceId}/health/alerts` : '/api/devices/health/alerts'
  const response = await apiClient.get(url)
  return response.data
}

/**
 * Acknowledge a health alert
 * 
 * @param alertId - Alert ID to acknowledge
 * @returns Promise resolving when alert is acknowledged
 */
export async function acknowledgeAlert(alertId: string): Promise<void> {
  await apiClient.post(`/api/devices/health/alerts/${alertId}/acknowledge`)
}

/**
 * Calculate health status from metrics and thresholds
 * 
 * @param metrics - Current health metrics
 * @returns Calculated health status
 */
export function calculateHealthStatus(metrics: HealthMetrics): DeviceHealthStatus {
  const checks = [
    metrics.cpuUsage >= 90,
    metrics.memoryUsage >= 95,
    metrics.storageUsage >= 95,
    metrics.temperature >= 85,
  ]

  const warningChecks = [
    metrics.cpuUsage >= 75,
    metrics.memoryUsage >= 80,
    metrics.storageUsage >= 85,
    metrics.temperature >= 70,
  ]

  if (checks.some((check) => check)) {
    return 'critical'
  }

  if (warningChecks.some((check) => check)) {
    return 'warning'
  }

  return 'healthy'
}

/**
 * React Query hook for fetching device health
 * 
 * Automatically refetches every 10 seconds to keep health data current.
 * 
 * @param deviceId - Device ID to fetch health for
 * @param options - Query options
 * @returns React Query result with device health data
 * 
 * @example
 * ```typescript
 * function DeviceHealthPanel({ deviceId }: { deviceId: number }) {
 *   const { data, isLoading, error } = useDeviceHealth(deviceId)
 *   
 *   if (isLoading) return <LoadingSpinner />
 *   if (error) return <ErrorMessage error={error} />
 *   
 *   return (
 *     <div>
 *       <h3>{data.deviceName}</h3>
 *       <StatusBadge status={data.healthStatus} />
 *       <MetricsDisplay metrics={data.currentMetrics} />
 *     </div>
 *   )
 * }
 * ```
 */
export function useDeviceHealth(
  deviceId: number,
  options?: {
    enabled?: boolean
    refetchInterval?: number
  }
): UseQueryResult<DeviceHealth, Error> {
  return useQuery({
    queryKey: ['deviceHealth', deviceId],
    queryFn: () => fetchDeviceHealth(deviceId),
    refetchInterval: options?.refetchInterval ?? 10000, // 10 seconds
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  })
}

/**
 * React Query hook for fetching all devices health
 * 
 * @param filters - Optional filters for health query
 * @param options - Query options
 * @returns React Query result with array of device health data
 * 
 * @example
 * ```typescript
 * function DevicesHealthDashboard() {
 *   const { data: devices, isLoading } = useAllDevicesHealth({
 *     healthStatus: ['warning', 'critical']
 *   })
 *   
 *   return (
 *     <DeviceGrid 
 *       devices={devices}
 *       loading={isLoading}
 *     />
 *   )
 * }
 * ```
 */
export function useAllDevicesHealth(
  filters?: DeviceHealthFilters,
  options?: {
    enabled?: boolean
    refetchInterval?: number
  }
): UseQueryResult<DeviceHealth[], Error> {
  return useQuery({
    queryKey: ['devicesHealth', filters],
    queryFn: () => fetchAllDevicesHealth(filters),
    refetchInterval: options?.refetchInterval ?? 10000, // 10 seconds
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  })
}

/**
 * React Query hook for fetching health statistics
 * 
 * @param options - Query options
 * @returns React Query result with health statistics
 * 
 * @example
 * ```typescript
 * function HealthOverview() {
 *   const { data: stats } = useHealthStatistics()
 *   
 *   return (
 *     <div>
 *       <StatCard label="Healthy" value={stats.healthyDevices} />
 *       <StatCard label="Warning" value={stats.warningDevices} />
 *       <StatCard label="Critical" value={stats.criticalDevices} />
 *     </div>
 *   )
 * }
 * ```
 */
export function useHealthStatistics(options?: {
  enabled?: boolean
  refetchInterval?: number
}): UseQueryResult<HealthStatistics, Error> {
  return useQuery({
    queryKey: ['healthStatistics'],
    queryFn: fetchHealthStatistics,
    refetchInterval: options?.refetchInterval ?? 30000, // 30 seconds
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  })
}

/**
 * React Query hook for fetching health alerts
 * 
 * @param deviceId - Optional device ID to filter alerts
 * @param options - Query options
 * @returns React Query result with health alerts
 * 
 * @example
 * ```typescript
 * function AlertsPanel({ deviceId }: { deviceId?: number }) {
 *   const { data: alerts } = useHealthAlerts(deviceId)
 *   
 *   const criticalAlerts = alerts?.filter(a => a.severity === 'critical') ?? []
 *   
 *   return (
 *     <AlertList 
 *       alerts={criticalAlerts}
 *       onAcknowledge={handleAcknowledge}
 *     />
 *   )
 * }
 * ```
 */
export function useHealthAlerts(
  deviceId?: number,
  options?: {
    enabled?: boolean
    refetchInterval?: number
  }
): UseQueryResult<HealthAlert[], Error> {
  return useQuery({
    queryKey: deviceId ? ['healthAlerts', deviceId] : ['healthAlerts'],
    queryFn: () => fetchHealthAlerts(deviceId),
    refetchInterval: options?.refetchInterval ?? 15000, // 15 seconds
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  })
}

/**
 * Hook to update device health cache from real-time events
 * 
 * Used with SignalR to keep React Query cache in sync with real-time updates.
 * 
 * @example
 * ```typescript
 * function DeviceDashboard() {
 *   const updateHealthCache = useDeviceHealthCache()
 *   
 *   useEffect(() => {
 *     signalRHub.on('HeartbeatReceived', (data: HeartbeatData) => {
 *       updateHealthCache(data.deviceId, data)
 *     })
 *   }, [updateHealthCache])
 * }
 * ```
 */
export function useDeviceHealthCache() {
  const queryClient = useQueryClient()

  return {
    updateHealth: (deviceId: number, healthData: Partial<DeviceHealth>) => {
      queryClient.setQueryData<DeviceHealth>(['deviceHealth', deviceId], (old) => {
        if (!old) return old
        return { ...old, ...healthData }
      })
    },
    updateMetrics: (deviceId: number, metrics: HealthMetrics) => {
      queryClient.setQueryData<DeviceHealth>(['deviceHealth', deviceId], (old) => {
        if (!old) return old
        return {
          ...old,
          currentMetrics: metrics,
          healthStatus: calculateHealthStatus(metrics),
        }
      })
    },
    updateHeartbeat: (deviceId: number, heartbeat: HeartbeatData) => {
      queryClient.setQueryData<DeviceHealth>(['deviceHealth', deviceId], (old) => {
        if (!old) return old
        return {
          ...old,
          lastHeartbeat: heartbeat,
          status: heartbeat.status,
          timeSinceLastHeartbeat: 0,
        }
      })
    },
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ['deviceHealth'] })
      queryClient.invalidateQueries({ queryKey: ['devicesHealth'] })
      queryClient.invalidateQueries({ queryKey: ['healthStatistics'] })
    },
  }
}
