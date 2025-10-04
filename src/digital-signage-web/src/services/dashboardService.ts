import { apiClient } from '@/lib/api'

export interface DashboardMetrics {
  overview: {
    totalDevices: number
    onlineDevices: number
    activeSchedules: number
    totalMediaFiles: number
    storageUsed: number
    storageTotal: number
  }
  activity: {
    recentUploads: Array<{
      id: number
      name: string
      fileName: string
      mediaType: string
      uploadedAt: string
      fileSize: number
    }>
    recentSchedules: Array<{
      id: number
      name: string
      startDate: string
      endDate: string
      deviceCount: number
      mediaCount: number
      createdAt: string
    }>
    systemAlerts: Array<{
      id: number
      type: 'warning' | 'error' | 'info'
      title: string
      message: string
      timestamp: string
      isRead: boolean
    }>
  }
  analytics: {
    mediaTypeBreakdown: Array<{
      type: string
      count: number
      percentage: number
      totalSize: number
    }>
    deviceStatusBreakdown: Array<{
      status: string
      count: number
      percentage: number
    }>
    scheduleUsageStats: Array<{
      date: string
      activeSchedules: number
      totalPlaytime: number
    }>
    popularTags: Array<{
      name: string
      usageCount: number
      color?: string
    }>
  }
  performance: {
    systemHealth: {
      apiResponseTime: number
      databaseHealth: 'good' | 'warning' | 'critical'
      storageHealth: 'good' | 'warning' | 'critical'
      networkLatency: number
    }
    devicePerformance: Array<{
      deviceId: number
      deviceName: string
      location: string
      cpuUsage: number
      memoryUsage: number
      lastSeen: string
      issues: number
    }>
  }
}

export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  action: string
  params?: any
  requiresPermission?: string[]
}

export interface RecentItem {
  id: number
  type: 'media' | 'schedule' | 'device'
  title: string
  description: string
  timestamp: string
  status?: string
  thumbnailUrl?: string
  metadata?: {
    [key: string]: any
  }
}

export interface SearchResult {
  media: Array<{
    id: number
    name: string
    fileName: string
    mediaType: string
    tags: string[]
    thumbnailUrl?: string
    relevanceScore: number
  }>
  schedules: Array<{
    id: number
    name: string
    description?: string
    startDate: string
    endDate: string
    isActive: boolean
    deviceCount: number
    relevanceScore: number
  }>
  devices: Array<{
    id: number
    name: string
    location: string
    status: string
    lastSeen: string
    relevanceScore: number
  }>
  tags: Array<{
    id: number
    name: string
    description?: string
    mediaCount: number
    color?: string
    relevanceScore: number
  }>
}

/**
 * Dashboard service for API integration
 * Handles all dashboard-related API calls
 */
export class DashboardService {
  /**
   * Get dashboard metrics
   */
  static async getMetrics(): Promise<DashboardMetrics> {
    const response = await apiClient.get('/api/dashboard/metrics')
    return response.data
  }

  /**
   * Get quick actions
   */
  static async getQuickActions(): Promise<QuickAction[]> {
    const response = await apiClient.get('/api/dashboard/quick-actions')
    return response.data
  }

  /**
   * Get recent items
   */
  static async getRecentItems(limit: number = 10): Promise<RecentItem[]> {
    const response = await apiClient.get('/api/dashboard/recent-items', { params: { limit } })
    return response.data
  }

  /**
   * Unified search across all entities
   */
  static async search(query: string, filters?: {
    types?: Array<'media' | 'schedules' | 'devices' | 'tags'>
    limit?: number
  }): Promise<SearchResult> {
    const response = await apiClient.get('/api/dashboard/search', {
      params: { query, ...filters }
    })
    return response.data
  }

  /**
   * Get system health
   */
  static async getSystemHealth(): Promise<{
    overall: 'healthy' | 'warning' | 'critical'
    services: Array<{
      name: string
      status: 'healthy' | 'warning' | 'critical'
      lastChecked: string
      responseTime?: number
      message?: string
    }>
    uptime: number
    version: string
  }> {
    const response = await apiClient.get('/api/dashboard/system-health')
    return response.data
  }

  /**
   * Get notifications
   */
  static async getNotifications(): Promise<Array<{
    id: number
    type: 'info' | 'warning' | 'error' | 'success'
    title: string
    message: string
    timestamp: string
    isRead: boolean
    actions?: Array<{
      label: string
      action: string
      params?: any
    }>
  }>> {
    const response = await apiClient.get('/api/dashboard/notifications')
    return response.data
  }

  /**
   * Mark notification as read
   */
  static async markNotificationRead(id: number): Promise<void> {
    await apiClient.patch(`/api/dashboard/notifications/${id}/read`)
  }

  /**
   * Mark all notifications as read
   */
  static async markAllNotificationsRead(): Promise<void> {
    await apiClient.patch('/api/dashboard/notifications/read-all')
  }

  /**
   * Get activity feed
   */
  static async getActivityFeed(params?: {
    type?: string
    userId?: number
    limit?: number
    offset?: number
  }): Promise<Array<{
    id: number
    type: string
    title: string
    description: string
    timestamp: string
    userId?: number
    userName?: string
    metadata?: any
  }>> {
    const response = await apiClient.get('/api/dashboard/activity', { params })
    return response.data
  }

  /**
   * Get usage analytics
   */
  static async getUsageAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<{
    period: string
    data: Array<{
      date: string
      metrics: {
        activeDevices: number
        playedSchedules: number
        uploadedMedia: number
        systemEvents: number
      }
    }>
    summary: {
      totalActiveDevices: number
      totalPlayedSchedules: number
      totalUploadedMedia: number
      averageDeviceUptime: number
    }
  }> {
    const response = await apiClient.get('/api/dashboard/analytics', { params: { period } })
    return response.data
  }

  /**
   * Export dashboard data
   */
  static async exportData(format: 'json' | 'csv' | 'pdf', options?: {
    includeMetrics?: boolean
    includeActivity?: boolean
    includeAnalytics?: boolean
    dateRange?: {
      startDate: string
      endDate: string
    }
  }): Promise<{
    downloadUrl: string
    fileName: string
    expiresAt: string
  }> {
    const response = await apiClient.post('/api/dashboard/export', { format, options })
    return response.data
  }
}