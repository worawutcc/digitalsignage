/**
 * Mock Dashboard Service
 * Temporary mock data service until backend endpoints are implemented
 */

export interface DashboardStats {
  totalDevices: number
  onlineDevices: number
  totalPlaylists: number
  activePlaylists: number
  totalMediaFiles: number
  totalSchedules: number
  activeSchedules: number
  systemUptime: number // in seconds
}

export interface DeviceStatusChart {
  labels: string[]
  data: number[]
  colors: string[]
}

export interface MediaUsageChart {
  labels: string[]
  data: number[]
}

export interface ActivityLog {
  id: string
  timestamp: string
  type: 'device' | 'playlist' | 'media' | 'schedule' | 'system'
  action: string
  details: string
  user?: string
  deviceId?: string
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical'
  components: Array<{
    name: string
    status: 'healthy' | 'warning' | 'critical'
    message: string
    lastCheck: string
  }>
}

/**
 * Mock activity logs
 */
const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    type: 'device',
    action: 'Device Connected',
    details: 'Lobby Main Display came online',
    deviceId: '1'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    type: 'playlist',
    action: 'Playlist Updated',
    details: 'Welcome Playlist modified with new content',
    user: 'admin'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    type: 'media',
    action: 'Media Uploaded',
    details: 'New promotional video uploaded',
    user: 'admin'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    type: 'schedule',
    action: 'Schedule Created',
    details: 'Morning briefing schedule created',
    user: 'admin'
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    type: 'device',
    action: 'Device Offline',
    details: 'Reception Tablet went offline',
    deviceId: '3'
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    type: 'system',
    action: 'System Backup',
    details: 'Automated system backup completed successfully'
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
    type: 'playlist',
    action: 'Playlist Activated',
    details: 'Holiday Special playlist activated',
    user: 'admin'
  },
  {
    id: '8',
    timestamp: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
    type: 'device',
    action: 'Maintenance Mode',
    details: 'Cafeteria Screen entered maintenance mode',
    deviceId: '4'
  }
]

/**
 * Mock Dashboard Service
 * Provides mock data until backend endpoints are implemented
 */
export class MockDashboardService {
  /**
   * Get dashboard statistics
   */
  static async getStats(): Promise<DashboardStats> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    return {
      totalDevices: 5,
      onlineDevices: 2,
      totalPlaylists: 4,
      activePlaylists: 3,
      totalMediaFiles: 6,
      totalSchedules: 8,
      activeSchedules: 5,
      systemUptime: 2592000 // 30 days in seconds
    }
  }

  /**
   * Get device status chart data
   */
  static async getDeviceStatusChart(): Promise<DeviceStatusChart> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      labels: ['Online', 'Offline', 'Maintenance', 'Error'],
      data: [2, 1, 1, 1],
      colors: ['#10b981', '#6b7280', '#f59e0b', '#ef4444']
    }
  }

  /**
   * Get media usage chart data
   */
  static async getMediaUsageChart(): Promise<MediaUsageChart> {
    await new Promise(resolve => setTimeout(resolve, 250))
    
    return {
      labels: ['Images', 'Videos', 'Documents', 'Audio'],
      data: [3, 2, 1, 0]
    }
  }

  /**
   * Get recent activity logs
   */
  static async getActivityLogs(limit = 10): Promise<ActivityLog[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return mockActivityLogs.slice(0, limit)
  }

  /**
   * Get system health status
   */
  static async getSystemHealth(): Promise<SystemHealth> {
    await new Promise(resolve => setTimeout(resolve, 350))
    
    return {
      overall: 'healthy',
      components: [
        {
          name: 'Database',
          status: 'healthy',
          message: 'All database connections are stable',
          lastCheck: new Date(Date.now() - 2 * 60000).toISOString()
        },
        {
          name: 'File Storage',
          status: 'healthy',
          message: '78% storage capacity available',
          lastCheck: new Date(Date.now() - 5 * 60000).toISOString()
        },
        {
          name: 'Network',
          status: 'warning',
          message: 'Some devices experiencing intermittent connectivity',
          lastCheck: new Date(Date.now() - 1 * 60000).toISOString()
        },
        {
          name: 'Background Jobs',
          status: 'healthy',
          message: 'All scheduled tasks running normally',
          lastCheck: new Date(Date.now() - 3 * 60000).toISOString()
        },
        {
          name: 'API Services',
          status: 'healthy',
          message: 'All API endpoints responding normally',
          lastCheck: new Date(Date.now() - 1 * 60000).toISOString()
        }
      ]
    }
  }

  /**
   * Get performance metrics over time
   */
  static async getPerformanceMetrics(period: '24h' | '7d' | '30d' = '24h'): Promise<{
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      borderColor: string
      backgroundColor: string
    }>
  }> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Generate mock time series data
    const now = new Date()
    const labels: string[] = []
    const dataPoints = period === '24h' ? 24 : period === '7d' ? 7 : 30
    
    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date(now)
      if (period === '24h') {
        date.setHours(date.getHours() - i)
        labels.push(date.getHours().toString().padStart(2, '0') + ':00')
      } else if (period === '7d') {
        date.setDate(date.getDate() - i)
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }))
      } else {
        date.setDate(date.getDate() - i)
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      }
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Active Devices',
          data: Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 3) + 2),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)'
        },
        {
          label: 'Content Updates',
          data: Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 10)),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)'
        },
        {
          label: 'System Load (%)',
          data: Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 40) + 20),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)'
        }
      ]
    }
  }

  /**
   * Get device uptime statistics
   */
  static async getDeviceUptime(): Promise<Array<{
    deviceId: string
    deviceName: string
    uptime: number // percentage
    lastSeen: string
    status: 'online' | 'offline' | 'maintenance' | 'error'
  }>> {
    await new Promise(resolve => setTimeout(resolve, 250))
    
    return [
      {
        deviceId: '1',
        deviceName: 'Lobby Main Display',
        uptime: 98.5,
        lastSeen: new Date().toISOString(),
        status: 'online'
      },
      {
        deviceId: '2',
        deviceName: 'Conference Room A',
        uptime: 95.2,
        lastSeen: new Date(Date.now() - 5 * 60000).toISOString(),
        status: 'online'
      },
      {
        deviceId: '3',
        deviceName: 'Reception Tablet',
        uptime: 87.3,
        lastSeen: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
        status: 'offline'
      },
      {
        deviceId: '4',
        deviceName: 'Cafeteria Screen',
        uptime: 92.1,
        lastSeen: new Date(Date.now() - 30 * 60000).toISOString(),
        status: 'maintenance'
      },
      {
        deviceId: '5',
        deviceName: 'Emergency Kiosk',
        uptime: 78.9,
        lastSeen: new Date(Date.now() - 6 * 60 * 60000).toISOString(),
        status: 'error'
      }
    ]
  }
}

/**
 * Development flag to use mock service
 */
export const USE_MOCK_DASHBOARD_SERVICE = true