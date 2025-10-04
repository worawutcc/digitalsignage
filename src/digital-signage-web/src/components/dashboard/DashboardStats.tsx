'use client'

import { useEffect, useState } from 'react'
import { Monitor, Users, Calendar, FileText, AlertTriangle, CheckCircle } from 'lucide-react'
import { MetricCard } from './MetricCard'
import { DashboardStatsData, DashboardStatsProps } from './DashboardStats.types'

/**
 * Dashboard statistics component displaying key metrics
 * Shows device status, user counts, schedules, media, and system health
 * 
 * @param data - Dashboard statistics data
 * @param loading - Loading state
 * @param className - Additional CSS classes
 * @param onRefresh - Callback for refreshing data
 */
export function DashboardStats({
  data,
  loading = false,
  className = '',
  onRefresh
}: DashboardStatsProps) {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (onRefresh && !refreshing) {
      setRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setTimeout(() => setRefreshing(false), 1000) // Minimum refresh indicator time
      }
    }
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (onRefresh) {
      const interval = setInterval(() => {
        onRefresh()
      }, 30000)
      return () => clearInterval(interval)
    }
    return undefined
  }, [onRefresh])

  // Calculate derived metrics
  const deviceUptime = data ? (data.activeDevices / data.totalDevices) * 100 : 0
  const userEngagement = data ? (data.activeUsers / data.totalUsers) * 100 : 0
  const scheduleUtilization = data ? (data.activeSchedules / data.totalSchedules) * 100 : 0

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-600">Real-time system metrics and status</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <span className={refreshing ? 'animate-spin' : ''}>↻</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Device Metrics */}
        <MetricCard
          title="Total Devices"
          value={data?.totalDevices || 0}
          icon={Monitor}
          loading={loading}
          trend={{
            value: deviceUptime,
            isPositive: deviceUptime >= 95,
            suffix: '% uptime'
          }}
          color="blue"
        />

        <MetricCard
          title="Active Devices"
          value={data?.activeDevices || 0}
          icon={CheckCircle}
          loading={loading}
          subtitle={`${data?.offlineDevices || 0} offline`}
          trend={{
            value: data?.activeDevices || 0,
            isPositive: (data?.activeDevices || 0) > (data?.offlineDevices || 0),
            suffix: 'online'
          }}
          color="green"
        />

        {/* User Metrics */}
        <MetricCard
          title="Total Users"
          value={data?.totalUsers || 0}
          icon={Users}
          loading={loading}
          trend={{
            value: userEngagement,
            isPositive: userEngagement >= 70,
            suffix: '% active'
          }}
          color="purple"
        />

        <MetricCard
          title="Active Schedules"
          value={data?.activeSchedules || 0}
          icon={Calendar}
          loading={loading}
          subtitle={`${data?.totalSchedules || 0} total`}
          trend={{
            value: scheduleUtilization,
            isPositive: scheduleUtilization >= 80,
            suffix: '% utilization'
          }}
          color="indigo"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <MetricCard
          title="Media Library"
          value={data?.totalMediaFiles || 0}
          icon={FileText}
          loading={loading}
          subtitle={`${data?.mediaSizeGB || 0} GB total`}
          color="orange"
        />

        <MetricCard
          title="System Status"
          value={data?.systemAlerts || 0}
          icon={AlertTriangle}
          loading={loading}
          subtitle="Active alerts"
          trend={{
            value: data?.systemAlerts || 0,
            isPositive: (data?.systemAlerts || 0) === 0,
            suffix: data?.systemAlerts === 0 ? 'All clear' : 'needs attention'
          }}
          color={(data?.systemAlerts || 0) > 0 ? 'red' : 'green'}
        />

        <MetricCard
          title="Performance"
          value={Math.round(deviceUptime)}
          icon={CheckCircle}
          loading={loading}
          subtitle="Overall health"
          trend={{
            value: deviceUptime,
            isPositive: deviceUptime >= 95,
            suffix: '% healthy'
          }}
          color={deviceUptime >= 95 ? 'green' : deviceUptime >= 85 ? 'yellow' : 'red'}
        />
      </div>

      {/* Status Bar */}
      {data && (
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>System Online</span>
              </div>
              {data.systemAlerts > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <span>{data.systemAlerts} Alert{data.systemAlerts !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardStats