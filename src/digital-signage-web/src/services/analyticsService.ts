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
  getOverview: async (): Promise<AnalyticsOverview | null> => {
    try {
      const response = await apiClient.get<AnalyticsOverview>('/api/analytics/overview')
      if (!response.data) {
        console.error('[AnalyticsService] Invalid response structure for getOverview')
        return null
      }
      console.log('[AnalyticsService] Analytics overview retrieved')
      return response.data
    } catch (error) {
      console.error('[AnalyticsService] Failed to get analytics overview:', error)
      return null
    }
  },

  /**
   * Get top performing content by view count
   * @param limit - Number of top content items to return (default: 10)
   */
  getTopContent: async (limit: number = 10): Promise<ContentPerformance[]> => {
    try {
      const response = await apiClient.get<ContentPerformance[]>('/api/analytics/content-performance', {
        params: { limit }
      })
      const contentArray = Array.isArray(response.data) ? response.data : []
      console.log('[AnalyticsService] Top content retrieved:', contentArray.length, 'items')
      return contentArray
    } catch (error) {
      console.error('[AnalyticsService] Failed to get top content:', error)
      return []
    }
  },

  /**
   * Get device performance metrics
   */
  getDevicePerformance: async (): Promise<DevicePerformance[]> => {
    try {
      const response = await apiClient.get<DevicePerformance[]>('/api/analytics/device-performance')
      const devicesArray = Array.isArray(response.data) ? response.data : []
      console.log('[AnalyticsService] Device performance retrieved:', devicesArray.length, 'devices')
      return devicesArray
    } catch (error) {
      console.error('[AnalyticsService] Failed to get device performance:', error)
      return []
    }
  },

  /**
   * Get views distribution by hour
   * @param date - Target date (optional, defaults to today)
   */
  getViewsByHour: async (date?: Date): Promise<ViewsByHour[]> => {
    try {
      const params = date ? { date: date.toISOString() } : {}
      const response = await apiClient.get<ViewsByHour[]>('/api/analytics/views-by-hour', { params })
      const viewsArray = Array.isArray(response.data) ? response.data : []
      console.log('[AnalyticsService] Views by hour retrieved:', viewsArray.length, 'entries')
      return viewsArray
    } catch (error) {
      console.error('[AnalyticsService] Failed to get views by hour:', error)
      return []
    }
  },

  /**
   * Get content type statistics
   */
  getContentTypeStats: async (): Promise<ContentTypeStats[]> => {
    try {
      const response = await apiClient.get<ContentTypeStats[]>('/api/analytics/content-types')
      const statsArray = Array.isArray(response.data) ? response.data : []
      console.log('[AnalyticsService] Content type stats retrieved:', statsArray.length, 'types')
      return statsArray
    } catch (error) {
      console.error('[AnalyticsService] Failed to get content type stats:', error)
      return []
    }
  }
}