import { apiClient } from '@/lib/api'
import { Device } from '../types'

export interface DeviceStats {
  totalDevices: number
  onlineDevices: number
  offlineDevices: number
  maintenanceDevices: number
  errorDevices: number
  averageUptime: number
}

export interface DeviceHealth {
  deviceId: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  temperature: number
  lastHeartbeat: string
  networkLatency: number
}

/**
 * Enhanced service for device-related API operations
 * Provides comprehensive device management functionality
 */
export class DeviceService {
  /**
   * Get all devices
   */
  async getAll(): Promise<Device[]> {
    const response = await apiClient.get<Device[]>('/api/devices')
    return response.data
  }

  /**
   * Get device by ID
   */
  async getById(id: number): Promise<Device> {
    const response = await apiClient.get<Device>(`/api/devices/${id}`)
    return response.data
  }

  /**
   * Create new device
   */
  async create(device: Omit<Device, 'id' | 'lastSeen'>): Promise<Device> {
    const response = await apiClient.post<Device>('/api/devices', device)
    return response.data
  }

  /**
   * Update device
   */
  async update(id: number, device: Partial<Device>): Promise<Device> {
    const response = await apiClient.put<Device>(`/api/devices/${id}`, device)
    return response.data
  }

  /**
   * Delete device
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/devices/${id}`)
  }

  /**
   * Restart device
   */
  async restart(id: number): Promise<void> {
    await apiClient.post(`/api/devices/${id}/restart`)
  }

  /**
   * Update device content/schedule
   */
  async updateContent(deviceId: number, contentId: string): Promise<void> {
    await apiClient.post(`/api/devices/${deviceId}/content`, { contentId })
  }

  /**
   * Get device statistics
   */
  async getStats(): Promise<DeviceStats> {
    const response = await apiClient.get<DeviceStats>('/api/devices/stats')
    return response.data
  }

  /**
   * Get device health/heartbeat data
   */
  async getHealth(deviceId: number): Promise<DeviceHealth> {
    const response = await apiClient.get<DeviceHealth>(`/api/devices/${deviceId}/health`)
    return response.data
  }

  /**
   * Bulk operations
   */
  async bulkRestart(deviceIds: number[]): Promise<void> {
    await apiClient.post('/api/devices/bulk/restart', { deviceIds })
  }

  async bulkUpdateContent(deviceIds: number[], contentId: string): Promise<void> {
    await apiClient.post('/api/devices/bulk/content', { deviceIds, contentId })
  }

  async bulkDelete(deviceIds: number[]): Promise<void> {
    await apiClient.post('/api/devices/bulk/delete', { deviceIds })
  }

  /**
   * Device provisioning and registration
   */
  async provision(deviceKey: string, deviceInfo: Partial<Device>): Promise<Device> {
    const response = await apiClient.post<Device>('/api/devices/provision', {
      deviceKey,
      ...deviceInfo
    })
    return response.data
  }

  /**
   * Send command to device
   */
  async sendCommand(deviceId: number, command: string, params?: Record<string, any>): Promise<void> {
    await apiClient.post(`/api/devices/${deviceId}/command`, { command, params })
  }

  /**
   * Get device logs
   */
  async getLogs(deviceId: number, limit = 100): Promise<Array<{
    timestamp: string
    level: string
    message: string
    source: string
  }>> {
    const response = await apiClient.get(`/api/devices/${deviceId}/logs?limit=${limit}`)
    return response.data
  }

  /**
   * Get device screenshots (for debugging)
   */
  async getScreenshot(deviceId: number): Promise<string> {
    const response = await apiClient.get(`/api/devices/${deviceId}/screenshot`)
    return response.data.imageUrl
  }

  /**
   * Update device settings
   */
  async updateSettings(deviceId: number, settings: Record<string, any>): Promise<void> {
    await apiClient.put(`/api/devices/${deviceId}/settings`, settings)
  }

  /**
   * Get device performance metrics
   */
  async getMetrics(deviceId: number, timeRange = '24h'): Promise<Array<{
    timestamp: string
    cpuUsage: number
    memoryUsage: number
    networkIn: number
    networkOut: number
  }>> {
    const response = await apiClient.get(`/api/devices/${deviceId}/metrics?range=${timeRange}`)
    return response.data
  }

  /**
   * Get all approved devices
   * @returns Promise with approved devices array
   */
  async getApprovedDevices(): Promise<Device[]> {
    try {
      const response = await apiClient.get<Device[]>('/api/device/approved')
      return response.data
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.')
      }
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to view approved devices.')
      }
      throw new Error('Failed to fetch approved devices.')
    }
  }

  /**
   * Get all rejected devices
   * @returns Promise with rejected devices array
   */
  async getRejectedDevices(): Promise<Device[]> {
    try {
      const response = await apiClient.get<Device[]>('/api/device/rejected')
      return response.data
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.')
      }
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to view rejected devices.')
      }
      throw new Error('Failed to fetch rejected devices.')
    }
  }

  /**
   * Get all devices (approved + active)
   * @returns Promise with all devices array
   */
  async getAllDevices(): Promise<Device[]> {
    try {
      const response = await apiClient.get<Device[]>('/api/device')
      return response.data
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.')
      }
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to view devices.')
      }
      throw new Error('Failed to fetch devices.')
    }
  }

  /**
   * Reconsider (move back to pending) a rejected device
   * @param deviceId - Device ID to reconsider
   */
  async reconsiderDevice(deviceId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(
        `/api/device/reconsider/${deviceId}`
      )
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Device not found.')
      }
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to reconsider devices.')
      }
      throw new Error('Failed to reconsider device.')
    }
  }
}

export const deviceService = new DeviceService()