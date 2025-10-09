// Analytics Types - matching backend DTOs

export interface AnalyticsOverview {
  totalViews: number
  totalDevices: number
  totalContent: number
  avgViewTime: number
  activeDevices: number
  offlineDevices: number
  totalSchedules: number
  contentUtilization: number
}

export interface ContentPerformance {
  id: number
  name: string
  views: number
  duration: string
  engagement: number
  mediaType: string
  lastPlayed: string
}

export interface DevicePerformance {
  id: number
  name: string
  uptime: number
  views: number
  lastSeen: string
  status: 'online' | 'offline' | 'error'
  location: string
  errorCount: number
}

export interface ViewsByHour {
  hour: string
  views: number
  date: string
}

export interface ContentTypeStats {
  type: string
  count: number
  percentage: number
  totalSize: number
}
