/**
 * Types for dashboard page components
 */
export interface DashboardStats {
  totalDevices: number
  onlineDevices: number
  totalContent: number
  activeSchedules: number
}

export interface StatCardProps {
  name: string
  value: string
  change: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}