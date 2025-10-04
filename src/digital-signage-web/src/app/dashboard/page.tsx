'use client'

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic'

import DashboardStats from '@/components/dashboard/DashboardStats'
import { LineChart, BarChart, PieChart } from '@/components/charts'
import AdminLayout from '@/components/layouts/AdminLayout'
import { UnifiedSearch } from '@/components/ui/UnifiedSearch'
import { RecentItems } from '@/features/dashboard/components/RecentItems'
import { Button } from '@/components/ui/Button'
import { Plus, Upload, Calendar, Tag, Copy, Users, RefreshCw, AlertCircle, TrendingUp, Activity } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'



// Mock data - In a real app, this would come from API calls
const mockStatsData = {
  totalDevices: 156,
  activeDevices: 142,
  offlineDevices: 14,
  totalUsers: 24,
  activeUsers: 18,
  totalSchedules: 89,
  activeSchedules: 67,
  totalMediaFiles: 1247,
  mediaSizeGB: 23.7,
  systemAlerts: 3,
}

const mockDeviceStatusData = [
  { label: 'Jan', value: 95 },
  { label: 'Feb', value: 87 },
  { label: 'Mar', value: 92 },
  { label: 'Apr', value: 89 },
  { label: 'May', value: 94 },
  { label: 'Jun', value: 91 },
]

const mockContentTypeData = [
  { label: 'Images', value: 847, color: '#3B82F6' },
  { label: 'Videos', value: 234, color: '#EF4444' },
  { label: 'HTML', value: 166, color: '#10B981' },
]

const mockDeviceLocationData = [
  { label: 'Lobby', value: 45 },
  { label: 'Conference Rooms', value: 38 },
  { label: 'Cafeteria', value: 25 },
  { label: 'Hallways', value: 32 },
  { label: 'Reception', value: 16 },
]

/**
 * Dashboard page showing system overview, metrics, and analytics
 * Displays real-time statistics, charts, and system health information
 * Enhanced with Tailwind CSS 4 patterns and mobile-first responsive design
 */
export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const handleRefreshStats = async () => {
    setIsRefreshing(true)
    // In a real app, this would refetch data from the API
    console.log('Refreshing dashboard stats...')
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  return (
    <AdminLayout
      header={
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Monitor your digital signage system performance and health
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <UnifiedSearch className="flex-1 sm:flex-none sm:w-80" />
            <Button
              onClick={handleRefreshStats}
              variant="secondary"
              size="sm"
              className="shrink-0"
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              <span className="hidden sm:inline ml-2">Refresh</span>
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 sm:space-y-8">
        {/* System Health Alert */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-orange-900 dark:text-orange-100">System Health Check</h3>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                3 devices offline • 2 schedules require attention • Storage at 78%
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link href="/media" className="group">
              <Button 
                variant="secondary" 
                className="w-full justify-start h-auto p-4 group-hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col items-center gap-2 w-full">
                  <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium">Upload Media</span>
                </div>
              </Button>
            </Link>
            <Link href="/schedules" className="group">
              <Button 
                variant="secondary" 
                className="w-full justify-start h-auto p-4 group-hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col items-center gap-2 w-full">
                  <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium">New Schedule</span>
                </div>
              </Button>
            </Link>
            <Link href="/media/tags" className="group">
              <Button 
                variant="secondary" 
                className="w-full justify-start h-auto p-4 group-hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col items-center gap-2 w-full">
                  <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-medium">Manage Tags</span>
                </div>
              </Button>
            </Link>
            <Link href="/schedules/templates" className="group">
              <Button 
                variant="secondary" 
                className="w-full justify-start h-auto p-4 group-hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col items-center gap-2 w-full">
                  <Copy className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs font-medium">Templates</span>
                </div>
              </Button>
            </Link>
            <Link href="/users" className="group">
              <Button 
                variant="secondary" 
                className="w-full justify-start h-auto p-4 group-hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col items-center gap-2 w-full">
                  <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-medium">User Mgmt</span>
                </div>
              </Button>
            </Link>
            <Link href="/devices" className="group">
              <Button 
                variant="secondary" 
                className="w-full justify-start h-auto p-4 group-hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col items-center gap-2 w-full">
                  <Plus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-medium">Add Device</span>
                </div>
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Items and Search (Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Main Statistics */}
            <DashboardStats 
              data={mockStatsData}
              onRefresh={handleRefreshStats}
            />
          </div>
          <div className="space-y-6">
            <UnifiedSearch className="md:hidden" />
            <RecentItems maxItems={5} />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Device Uptime Trend */}
          <LineChart
            data={mockDeviceStatusData}
            title="Device Uptime Trend (%)"
            height={250}
            color="#10B981"
          />

          {/* Content Distribution */}
          <PieChart
            data={mockContentTypeData}
            title="Content Distribution"
            size={250}
            showLegend={true}
            showPercentages={true}
          />
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Devices by Location */}
          <BarChart
            data={mockDeviceLocationData}
            title="Devices by Location"
            height={300}
            showValues={true}
          />

          {/* Recent Activity Summary */}
          <div className="rounded-lg bg-white p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">New device registered</p>
                  <p className="text-xs text-gray-500">Conference Room B - Display #157</p>
                </div>
                <span className="text-xs text-gray-400">2 min ago</span>
              </div>
              
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">Schedule updated</p>
                  <p className="text-xs text-gray-500">Lobby promotion campaign</p>
                </div>
                <span className="text-xs text-gray-400">15 min ago</span>
              </div>
              
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">Media uploaded</p>
                  <p className="text-xs text-gray-500">summer-promo-video.mp4 (12.3 MB)</p>
                </div>
                <span className="text-xs text-gray-400">1 hour ago</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Device offline</p>
                  <p className="text-xs text-red-500">Cafeteria - Display #089</p>
                </div>
                <span className="text-xs text-gray-400">2 hours ago</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all activity →
              </button>
            </div>
          </div>
        </div>

        {/* System Health Status */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">API Status</h4>
                <div className="flex items-center mt-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-600">Operational</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Response time: 120ms</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">Database</h4>
                <div className="flex items-center mt-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Connections: 12/100</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">Storage</h4>
                <div className="flex items-center mt-1">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-yellow-600">Warning</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Used: 78% of 100GB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}