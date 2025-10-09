import { apiClient } from '@/lib/api'
import type {
  AnalyticsOverview,
  ContentPerformance,
  DevicePerformance,
  ViewsByHour,
  ContentTypeStats
} from '@/types/analytics'

/**
 * Analytics API service
 */
export const analyticsService = {
  /**
   * Get analytics overview with main dashboard metrics
   */
  getOverview: async (): Promise<AnalyticsOverview> => {
    const response = await apiClient.get<AnalyticsOverview>('/api/analytics/overview')
    return response.data
  },

  /**
   * Get top performing content by view count
   * @param limit - Number of top content items to return (default: 10)
   */
  getTopContent: async (limit: number = 10): Promise<ContentPerformance[]> => {
    const response = await apiClient.get<ContentPerformance[]>('/api/analytics/content-performance', {
      params: { limit }
    })
    return response.data
  },

  /**
   * Get device performance metrics
   */
  getDevicePerformance: async (): Promise<DevicePerformance[]> => {
    const response = await apiClient.get<DevicePerformance[]>('/api/analytics/device-performance')
    return response.data
  },

  /**
   * Get views distribution by hour
   * @param date - Target date (optional, defaults to today)
   */
  getViewsByHour: async (date?: Date): Promise<ViewsByHour[]> => {
    const params = date ? { date: date.toISOString() } : {}
    const response = await apiClient.get<ViewsByHour[]>('/api/analytics/views-by-hour', { params })
    return response.data
  },

  /**
   * Get content type statistics
   */
  getContentTypeStats: async (): Promise<ContentTypeStats[]> => {
    const response = await apiClient.get<ContentTypeStats[]>('/api/analytics/content-types')
    return response.data
  }
}