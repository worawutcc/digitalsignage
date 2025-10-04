export interface DashboardStatsData {
  totalDevices: number
  activeDevices: number
  offlineDevices: number
  totalUsers: number
  activeUsers: number
  totalSchedules: number
  activeSchedules: number
  totalMediaFiles: number
  mediaSizeGB: number
  systemAlerts: number
}

export interface DashboardStatsProps {
  data?: DashboardStatsData
  loading?: boolean
  className?: string
  onRefresh?: () => void
}