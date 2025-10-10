import { apiClient } from '@/lib/api'

/**
 * Dashboard summary statistics (from /api/dashboard/summary)
 */
export interface DashboardSummary {
  totalDevices: number
  onlineDevices: number
  offlineDevices: number
  totalMedia: number
  totalPlaylists: number
  activeSchedules: number
  pendingRegistrations: number
}

/**
 * Device status item for grid display
 */
export interface DeviceStatusItem {
  id: number
  name: string
  status: string
  lastHeartbeat: string | null
  currentContent: string
  location: string
}

/**
 * Device status grid response (from /api/dashboard/device-status)
 */
export interface DeviceStatusGrid {
  devices: DeviceStatusItem[]
  timestamp: string
}

/**
 * Dashboard service for API integration
 * Matches backend DashboardController endpoints
 */
export const dashboardService = {
  /**
   * Get dashboard summary statistics
   * Endpoint: GET /api/dashboard/summary
   */
  async getSummary(): Promise<DashboardSummary | null> {
    try {
      const response = await apiClient.get<DashboardSummary>('/api/dashboard/summary')
      if (!response.data) {
        console.error('[DashboardService] Invalid response structure for getSummary')
        return null
      }
      console.log('[DashboardService] Dashboard summary retrieved')
      return response.data
    } catch (error) {
      console.error('[DashboardService] Failed to get dashboard summary:', error)
      return null
    }
  },

  /**
   * Get real-time device status grid
   * Endpoint: GET /api/dashboard/device-status
   */
  async getDeviceStatus(): Promise<DeviceStatusGrid> {
    try {
      const response = await apiClient.get<DeviceStatusGrid>('/api/dashboard/device-status')
      const data = response.data || { devices: [], timestamp: new Date().toISOString() }
      const devicesArray = Array.isArray(data.devices) ? data.devices : []
      console.log('[DashboardService] Device status retrieved:', devicesArray.length, 'devices')
      return {
        ...data,
        devices: devicesArray
      }
    } catch (error) {
      console.error('[DashboardService] Failed to get device status:', error)
      return { devices: [], timestamp: new Date().toISOString() }
    }
  },
}