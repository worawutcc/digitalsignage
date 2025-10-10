'use client'

import { UnifiedSearch } from '@/components/ui/UnifiedSearch'
import { Button } from '@/components/ui/Button'
import { 
  RefreshCw, 
  Monitor,
  Shield,
  Settings,
  Image,
  Play,
  Calendar,
  QrCode,
  TrendingUp,
  MonitorSpeaker,
  CheckCircle2,
  Upload,
  AlertTriangle,
  Activity,
  Database,
  HardDrive,
  Wifi,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { dashboardService, type DashboardSummary } from '@/services/dashboardService'
import { useQuery } from '@tanstack/react-query'

/**
 * Admin Dashboard - Central Hub for Digital Signage Management
 * 
 * Comprehensive admin interface following admin-only system architecture
 * Features device management, content control, and system monitoring
 */

interface AdminActionCardProps {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  status?: 'success' | 'warning' | 'error' | 'info'
  count?: number | string
  badge?: string
}

function AdminActionCard({ href, icon, title, description, status, count, badge }: AdminActionCardProps) {
  const statusStyles = {
    success: 'border-green-200 bg-green-50 hover:bg-green-100',
    warning: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100',
    error: 'border-red-200 bg-red-50 hover:bg-red-100',
    info: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
  }

  return (
    <Link href={href}>
      <div className={cn(
        'group relative overflow-hidden rounded-lg border-2 p-6 transition-all duration-200 hover:shadow-lg',
        status ? statusStyles[status] : 'border-gray-200 bg-white hover:bg-gray-50'
      )}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                {title}
              </h3>
              <p className="mt-1 text-xs text-gray-600">
                {description}
              </p>
            </div>
          </div>
          
          {(count || badge) && (
            <div className="flex flex-col items-end space-y-1">
              {count && (
                <span className="text-2xl font-bold text-gray-900">
                  {count}
                </span>
              )}
              {badge && (
                <span className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  status === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                )}>
                  {badge}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  // Fetch dashboard summary from backend
  const { data: summary, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => dashboardService.getSummary(),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  })

  const handleRefreshStats = async () => {
    await refetch()
  }

  // Default values while loading
  const adminStats = {
    totalDevices: summary?.totalDevices ?? 0,
    onlineDevices: summary?.onlineDevices ?? 0,
    offlineDevices: summary?.offlineDevices ?? 0,
    totalMedia: summary?.totalMedia ?? 0,
    totalPlaylists: summary?.totalPlaylists ?? 0,
    activeSchedules: summary?.activeSchedules ?? 0,
    pendingRegistrations: summary?.pendingRegistrations ?? 0,
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h2>
            <p className="text-sm text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'An error occurred while fetching dashboard data'}
            </p>
            <Button onClick={() => refetch()} className="flex items-center gap-2 mx-auto">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Central hub for managing your digital signage system
            {isLoading && <span className="ml-2 text-blue-600">(Loading...)</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
            <UnifiedSearch className="hidden md:block w-80" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshStats}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              Refresh
            </Button>
          <Link href="/media/upload">
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Upload Content
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Devices</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats.totalDevices}</p>
                <p className="text-xs text-green-600">{adminStats.onlineDevices} online</p>
              </div>
              <Monitor className="h-8 w-8 text-blue-500" />
            </div>
          </div>          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Media Files</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats.totalMedia}</p>
                <p className="text-xs text-blue-600">Content library</p>
              </div>
              <Image className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Schedules</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats.activeSchedules}</p>
                <p className="text-xs text-purple-600">Running now</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats.pendingRegistrations}</p>
                <p className="text-xs text-orange-600">Need attention</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

      {/* Admin Action Cards */}
      <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AdminActionCard
              href="/devices"
              icon={<Monitor className="h-6 w-6 text-blue-600" />}
              title="Device Management"
              description="Monitor devices, check status, and manage connections"
              count={adminStats.onlineDevices}
              status="success"
            />

            <AdminActionCard
              href="/device-registrations/pending"
              icon={<Shield className="h-6 w-6 text-orange-600" />}
              title="Device Registrations"
              description="Review Android TV self-registration requests"
              count={adminStats.pendingRegistrations}
              status="warning"
              badge="Pending"
            />

            <AdminActionCard
              href="/media"
              icon={<Image className="h-6 w-6 text-green-600" />}
              title="Media Library"
              description="Upload, organize, and manage content files"
              count={adminStats.totalMedia}
            />

            <AdminActionCard
              href="/playlists"
              icon={<Play className="h-6 w-6 text-purple-600" />}
              title="Playlists"
              description="Create and manage content playlists"
              count={adminStats.totalPlaylists}
            />

            <AdminActionCard
              href="/schedules"
              icon={<Calendar className="h-6 w-6 text-indigo-600" />}
              title="Schedules"
              description="Plan and manage content scheduling"
              count={adminStats.activeSchedules}
              badge="Active"
              status="info"
            />

            <AdminActionCard
              href="/device-groups"
              icon={<MonitorSpeaker className="h-6 w-6 text-cyan-600" />}
              title="Device Groups"
              description="Organize devices into manageable groups"
            />

            <AdminActionCard
              href="/qr-codes"
              icon={<QrCode className="h-6 w-6 text-pink-600" />}
              title="QR Codes"
              description="Generate QR codes for device setup"
            />

            <AdminActionCard
              href="/analytics"
              icon={<TrendingUp className="h-6 w-6 text-emerald-600" />}
              title="Analytics"
              description="View system performance and usage analytics"
            />

            <AdminActionCard
              href="/settings"
              icon={<Settings className="h-6 w-6 text-gray-600" />}
              title="System Settings"
              description="Configure system preferences and settings"
            />
          </div>
        </div>

        {/* System Status Summary */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-lg bg-white p-6 shadow-sm border">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full text-green-600 bg-green-100">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Online Devices</h4>
                  <div className="flex items-center mt-1">
                    <div className="h-2 w-2 rounded-full mr-2 bg-green-500"></div>
                    <span className="text-lg font-semibold text-gray-900">{adminStats.onlineDevices} / {adminStats.totalDevices}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Currently active</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm border">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "p-2 rounded-full",
                  adminStats.offlineDevices > 0 ? "text-yellow-600 bg-yellow-100" : "text-green-600 bg-green-100"
                )}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Offline Devices</h4>
                  <div className="flex items-center mt-1">
                    <div className={cn(
                      "h-2 w-2 rounded-full mr-2",
                      adminStats.offlineDevices > 0 ? "bg-yellow-500" : "bg-green-500"
                    )}></div>
                    <span className="text-lg font-semibold text-gray-900">{adminStats.offlineDevices}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Need attention</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm border">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "p-2 rounded-full",
                  adminStats.pendingRegistrations > 0 ? "text-orange-600 bg-orange-100" : "text-green-600 bg-green-100"
                )}>
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Pending Approvals</h4>
                  <div className="flex items-center mt-1">
                    <div className={cn(
                      "h-2 w-2 rounded-full mr-2",
                      adminStats.pendingRegistrations > 0 ? "bg-orange-500" : "bg-green-500"
                    )}></div>
                    <span className="text-lg font-semibold text-gray-900">{adminStats.pendingRegistrations}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Device registrations</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Device approved</p>
                  <p className="text-xs text-gray-500">Android TV - Conference Room A</p>
                </div>
                <span className="text-xs text-gray-500">2 mins ago</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                <Upload className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Media uploaded</p>
                  <p className="text-xs text-gray-500">holiday-promotion.mp4</p>
                </div>
                <span className="text-xs text-gray-500">15 mins ago</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Device offline</p>
                  <p className="text-xs text-gray-500">Display - Lobby East</p>
                </div>
                <span className="text-xs text-gray-500">1 hour ago</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link href="/media/upload" className="flex items-center justify-between p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Upload New Content</span>
                </div>
                <span className="text-xs text-blue-600">→</span>
              </Link>

              <Link href="/schedules/create" className="flex items-center justify-between p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">Create Schedule</span>
                </div>
                <span className="text-xs text-purple-600">→</span>
              </Link>

              <Link href="/device-registrations/pending" className="flex items-center justify-between p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-900">Review Registrations</span>
                </div>
                <span className="text-xs text-orange-600 bg-orange-200 px-2 py-0.5 rounded-full">{adminStats.pendingRegistrations}</span>
              </Link>
            </div>
          </div>
      </div>
    </div>
  )
}
