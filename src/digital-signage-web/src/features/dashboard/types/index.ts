export interface RecentItem {
  id: string
  title: string
  type: 'media' | 'schedule'
  path: string
  accessedAt: string
  thumbnail?: string
}

export interface RecentItemsProps {
  className?: string
  maxItems?: number
}

export interface DashboardStats {
  totalDevices: number
  onlineDevices: number
  totalMedia: number
  activeSchedules: number
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  message: string
  lastChecked: string
}

export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  path: string
  variant: 'primary' | 'secondary' | 'outline'
}