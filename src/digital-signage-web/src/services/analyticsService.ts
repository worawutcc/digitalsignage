import { apiClient } from '@/lib/api'

/**
 * Analytics service for gathering system metrics
 */
export class AnalyticsService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const response = await apiClient.get<{
      totalDevices: number
      onlineDevices: number
      totalContent: number
      activeSchedules: number
    }>('/api/analytics/dashboard')
    return response.data
  }

  /**
   * Get device analytics
   */
  async getDeviceAnalytics(timeRange: '24h' | '7d' | '30d' = '7d') {
    const response = await apiClient.get<{
      deviceUptime: Array<{ date: string; uptime: number }>
      contentViews: Array<{ deviceId: number; views: number }>
    }>(`/api/analytics/devices?range=${timeRange}`)
    return response.data
  }
}

export const analyticsService = new AnalyticsService()