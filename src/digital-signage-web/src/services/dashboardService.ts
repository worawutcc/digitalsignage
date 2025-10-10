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
  async getSummary(): Promise<DashboardSummary> {
    const response = await apiClient.get<DashboardSummary>('/api/dashboard/summary')
    return response.data
  },

  /**
   * Get real-time device status grid
   * Endpoint: GET /api/dashboard/device-status
   */
  async getDeviceStatus(): Promise<DeviceStatusGrid> {
    const response = await apiClient.get<DeviceStatusGrid>('/api/dashboard/device-status')
    const data = response.data || { devices: [], timestamp: new Date().toISOString() }
    return {
      ...data,
      devices: Array.isArray(data.devices) ? data.devices : []
    }
  },
}