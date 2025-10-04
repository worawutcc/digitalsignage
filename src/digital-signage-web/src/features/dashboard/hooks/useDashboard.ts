import { useState, useEffect } from 'react'
import { DashboardStats, SystemHealth } from '../types'

/**
 * Custom hook for managing dashboard statistics and system health
 */
export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDevices: 0,
    onlineDevices: 0,
    totalMedia: 0,
    activeSchedules: 0
  })

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    message: 'All systems operational',
    lastChecked: new Date().toISOString()
  })

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Mock API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock data - replace with actual API response
      setStats({
        totalDevices: 24,
        onlineDevices: 22,
        totalMedia: 156,
        activeSchedules: 8
      })

      setSystemHealth({
        status: 'healthy',
        message: 'All systems operational',
        lastChecked: new Date().toISOString()
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
      setSystemHealth({
        status: 'critical',
        message: 'Unable to fetch system status',
        lastChecked: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const refresh = () => {
    fetchDashboardData()
  }

  return {
    stats,
    systemHealth,
    isLoading,
    error,
    refresh
  }
}