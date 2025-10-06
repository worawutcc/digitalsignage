/**
 * Device Health Service - API integration for device monitoring and configuration
 * 
 * Provides comprehensive device health monitoring including status tracking,
 * configuration management, and performance metrics.
 * 
 * @see copilot-instructions-ui.md - API Integration Rules
 */

import { apiClient } from '@/lib/api'

/**
 * Device status enumeration matching backend
 */
export type DeviceStatus = 'Online' | 'Offline' | 'Error' | 'Maintenance'

/**
 * Device status information
 */
export interface DeviceStatusDto {
  deviceId: number
  status: DeviceStatus
  lastHeartbeat: string
  ipAddress: string
  currentContent?: string
  softwareVersion: string
  hardwareInfo: string
  cpuUsage?: number
  memoryUsage?: number
  diskUsage?: number
  temperature?: number
  networkLatency?: number
  uptime: number
  lastUpdateAt: string
}

/**
 * Device status history log entry
 */
export interface DeviceStatusLogDto {
  id: number
  deviceId: number
  status: DeviceStatus
  previousStatus?: DeviceStatus
  statusMessage?: string
  timestamp: string
  cpuUsage?: number
  memoryUsage?: number
  diskUsage?: number
  temperature?: number
  networkLatency?: number
  additionalData?: Record<string, any>
}

/**
 * Device configuration settings
 */
export interface DeviceConfigurationDto {
  deviceId: number
  displaySettings: {
    brightness: number
    contrast: number
    volume: number
    orientation: 'landscape' | 'portrait'
    resolution: string
  }
  networkSettings: {
    dhcp: boolean
    staticIp?: string
    subnet?: string
    gateway?: string
    dns1?: string
    dns2?: string
  }
  playbackSettings: {
    autoPlay: boolean
    loop: boolean
    shuffle: boolean
    transitionEffect: string
    defaultDuration: number
  }
  systemSettings: {
    timezone: string
    language: string
    autoUpdate: boolean
    rebootSchedule?: string
    logLevel: 'Debug' | 'Info' | 'Warning' | 'Error'
  }
  lastUpdated: string
  updatedBy: number
}

/**
 * Device configuration update request
 */
export interface DeviceConfigurationUpdateDto {
  displaySettings?: Partial<DeviceConfigurationDto['displaySettings']>
  networkSettings?: Partial<DeviceConfigurationDto['networkSettings']>
  playbackSettings?: Partial<DeviceConfigurationDto['playbackSettings']>
  systemSettings?: Partial<DeviceConfigurationDto['systemSettings']>
}

/**
 * Paginated result wrapper
 */
export interface PagedResult<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Device health monitoring service
 * Handles device status, configuration, and performance metrics
 */
export class DeviceHealthService {
  /**
   * Get current device status
   */
  async getDeviceStatus(deviceId: number): Promise<DeviceStatusDto> {
    const response = await apiClient.get<DeviceStatusDto>(`/api/devices/${deviceId}/status`)
    return response.data
  }

  /**
   * Get device status history with pagination and filtering
   */
  async getDeviceStatusHistory(
    deviceId: number,
    pageNumber: number = 1,
    pageSize: number = 20,
    fromDate?: string,
    toDate?: string,
    status?: DeviceStatus
  ): Promise<PagedResult<DeviceStatusLogDto>> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    })

    if (fromDate) params.append('fromDate', fromDate)
    if (toDate) params.append('toDate', toDate)
    if (status) params.append('status', status)

    const response = await apiClient.get<PagedResult<DeviceStatusLogDto>>(
      `/api/devices/${deviceId}/status/history?${params.toString()}`
    )
    return response.data
  }

  /**
   * Get device configuration
   */
  async getDeviceConfiguration(deviceId: number): Promise<DeviceConfigurationDto> {
    const response = await apiClient.get<DeviceConfigurationDto>(`/api/devices/${deviceId}/configuration`)
    return response.data
  }

  /**
   * Update device configuration
   */
  async updateDeviceConfiguration(
    deviceId: number,
    configuration: DeviceConfigurationUpdateDto
  ): Promise<DeviceConfigurationDto> {
    const response = await apiClient.put<DeviceConfigurationDto>(
      `/api/devices/${deviceId}/configuration`,
      configuration
    )
    return response.data
  }

  /**
   * Reset device configuration to defaults
   */
  async resetDeviceConfiguration(deviceId: number): Promise<DeviceConfigurationDto> {
    const response = await apiClient.post<DeviceConfigurationDto>(`/api/devices/${deviceId}/configuration/reset`)
    return response.data
  }

  /**
   * Get device performance metrics
   */
  async getDevicePerformanceMetrics(
    deviceId: number,
    fromDate?: string,
    toDate?: string
  ): Promise<DeviceStatusLogDto[]> {
    const params = new URLSearchParams()
    if (fromDate) params.append('fromDate', fromDate)
    if (toDate) params.append('toDate', toDate)

    const response = await apiClient.get<DeviceStatusLogDto[]>(
      `/api/devices/${deviceId}/status/metrics?${params.toString()}`
    )
    return response.data
  }

  /**
   * Restart device
   */
  async restartDevice(deviceId: number): Promise<void> {
    await apiClient.post(`/api/devices/${deviceId}/configuration/restart`)
  }

  /**
   * Update device firmware
   */
  async updateDeviceFirmware(deviceId: number): Promise<void> {
    await apiClient.post(`/api/devices/${deviceId}/configuration/update-firmware`)
  }

  /**
   * Get device logs
   */
  async getDeviceLogs(
    deviceId: number,
    pageNumber: number = 1,
    pageSize: number = 50,
    logLevel?: string,
    fromDate?: string,
    toDate?: string
  ): Promise<PagedResult<any>> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    })

    if (logLevel) params.append('logLevel', logLevel)
    if (fromDate) params.append('fromDate', fromDate)
    if (toDate) params.append('toDate', toDate)

    const response = await apiClient.get<PagedResult<any>>(
      `/api/devices/${deviceId}/configuration/logs?${params.toString()}`
    )
    return response.data
  }

  /**
   * Clear device logs
   */
  async clearDeviceLogs(deviceId: number): Promise<void> {
    await apiClient.delete(`/api/devices/${deviceId}/configuration/logs`)
  }

  /**
   * Get device network diagnostics
   */
  async getNetworkDiagnostics(deviceId: number): Promise<any> {
    const response = await apiClient.get(`/api/devices/${deviceId}/status/network-diagnostics`)
    return response.data
  }

  /**
   * Test device network connectivity
   */
  async testNetworkConnectivity(deviceId: number): Promise<any> {
    const response = await apiClient.post(`/api/devices/${deviceId}/status/test-connectivity`)
    return response.data
  }
}

// Export singleton instance
export const deviceHealthService = new DeviceHealthService()

// Export class for dependency injection
export default DeviceHealthService