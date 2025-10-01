'use client'

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic'

import DashboardStats from '@/components/dashboard/DashboardStats'
import { LineChart, BarChart, PieChart } from '@/components/charts'
import AdminLayout from '@/components/layouts/AdminLayout'



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
 */
export default function DashboardPage() {
  const handleRefreshStats = async () => {
    // In a real app, this would refetch data from the API
    console.log('Refreshing dashboard stats...')
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return (
    <AdminLayout
      header={
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">
            Monitor your digital signage system performance and health
          </p>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Main Statistics */}
        <DashboardStats 
          data={mockStatsData}
          onRefresh={handleRefreshStats}
        />

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