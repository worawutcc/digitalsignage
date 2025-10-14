import { apiClient } from '@/lib/api'
import type {
  AnalyticsOverview,
  ContentPerformance,
  DevicePerformance,
  ViewsByHour,
  ContentTypeStats
} from '@/types/analytics'
import type { 
  PlaylistAnalyticsData,
  PlaylistViewMetrics,
  DeviceMetrics,
  MediaItemAnalytics
} from '../features/playlists/components/PlaylistAnalytics'

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
  },

  /**
   * PLAYLIST-SPECIFIC ANALYTICS
   */

  /**
   * Get comprehensive analytics data for a specific playlist
   * @param playlistId - ID of the playlist to get analytics for
   * @param dateRange - Optional date range filter
   */
  getPlaylistAnalytics: async (
    playlistId: number,
    dateRange?: { from: Date; to: Date }
  ): Promise<PlaylistAnalyticsData | null> => {
    try {
      const params: Record<string, string> = {}
      if (dateRange) {
        params.from = dateRange.from.toISOString()
        params.to = dateRange.to.toISOString()
      }

      const response = await apiClient.get<PlaylistAnalyticsData>(
        `/api/playlist/${playlistId}/analytics`,
        { params }
      )
      
      if (!response.data) {
        console.error('[AnalyticsService] Invalid response structure for getPlaylistAnalytics')
        return null
      }
      
      console.log(`[AnalyticsService] Playlist analytics retrieved for playlist ${playlistId}`)
      return response.data
    } catch (error) {
      console.error(`[AnalyticsService] Failed to get playlist analytics for ID ${playlistId}:`, error)
      return null
    }
  },

  /**
   * Get playlist view trends over time
   * @param playlistId - ID of the playlist
   * @param days - Number of days to look back (default: 30)
   */
  getPlaylistViewTrends: async (
    playlistId: number,
    days: number = 30
  ): Promise<PlaylistViewMetrics[]> => {
    try {
      const response = await apiClient.get<PlaylistViewMetrics[]>(
        `/api/playlist/${playlistId}/analytics/trends`,
        { params: { days } }
      )
      
      const trendsArray = Array.isArray(response.data) ? response.data : []
      console.log(`[AnalyticsService] View trends retrieved for playlist ${playlistId}:`, trendsArray.length, 'data points')
      return trendsArray
    } catch (error) {
      console.error(`[AnalyticsService] Failed to get playlist view trends for ID ${playlistId}:`, error)
      return []
    }
  },

  /**
   * Get device performance metrics for a specific playlist
   * @param playlistId - ID of the playlist
   */
  getPlaylistDeviceMetrics: async (playlistId: number): Promise<DeviceMetrics[]> => {
    try {
      const response = await apiClient.get<DeviceMetrics[]>(
        `/api/playlist/${playlistId}/analytics/devices`
      )
      
      const devicesArray = Array.isArray(response.data) ? response.data : []
      console.log(`[AnalyticsService] Device metrics retrieved for playlist ${playlistId}:`, devicesArray.length, 'devices')
      return devicesArray
    } catch (error) {
      console.error(`[AnalyticsService] Failed to get playlist device metrics for ID ${playlistId}:`, error)
      return []
    }
  },

  /**
   * Get individual media item analytics within a playlist
   * @param playlistId - ID of the playlist
   */
  getPlaylistMediaAnalytics: async (playlistId: number): Promise<MediaItemAnalytics[]> => {
    try {
      const response = await apiClient.get<MediaItemAnalytics[]>(
        `/api/playlist/${playlistId}/analytics/media`
      )
      
      const mediaArray = Array.isArray(response.data) ? response.data : []
      console.log(`[AnalyticsService] Media analytics retrieved for playlist ${playlistId}:`, mediaArray.length, 'media items')
      return mediaArray
    } catch (error) {
      console.error(`[AnalyticsService] Failed to get playlist media analytics for ID ${playlistId}:`, error)
      return []
    }
  },

  /**
   * Get playlist performance summary
   * @param playlistId - ID of the playlist
   */
  getPlaylistSummary: async (playlistId: number): Promise<{
    totalViews: number;
    uniqueViews: number;
    totalDuration: number;
    averageViewTime: number;
    conversionRate: number;
  } | null> => {
    try {
      const response = await apiClient.get(
        `/api/playlist/${playlistId}/analytics/summary`
      )
      
      if (!response.data) {
        console.error('[AnalyticsService] Invalid response structure for getPlaylistSummary')
        return null
      }
      
      console.log(`[AnalyticsService] Playlist summary retrieved for playlist ${playlistId}`)
      return response.data
    } catch (error) {
      console.error(`[AnalyticsService] Failed to get playlist summary for ID ${playlistId}:`, error)
      return null
    }
  },

  /**
   * Export playlist analytics data
   * @param playlistId - ID of the playlist
   * @param format - Export format ('csv' | 'pdf')
   * @param dateRange - Optional date range filter
   */
  exportPlaylistAnalytics: async (
    playlistId: number,
    format: 'csv' | 'pdf',
    dateRange?: { from: Date; to: Date }
  ): Promise<Blob | null> => {
    try {
      const params: Record<string, string> = { format }
      if (dateRange) {
        params.from = dateRange.from.toISOString()
        params.to = dateRange.to.toISOString()
      }

      const response = await apiClient.get(
        `/api/playlist/${playlistId}/analytics/export`,
        { 
          params,
          responseType: 'blob'
        }
      )
      
      console.log(`[AnalyticsService] Analytics export generated for playlist ${playlistId} in ${format} format`)
      return response.data
    } catch (error) {
      console.error(`[AnalyticsService] Failed to export playlist analytics for ID ${playlistId}:`, error)
      return null
    }
  }
}