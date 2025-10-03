'use client'

import { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown,
  Eye,
  Monitor,
  Users,
  Clock,
  Download,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react'
import AdminLayout from '@/components/layouts/AdminLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface AnalyticsData {
  totalViews: number
  totalDevices: number
  totalContent: number
  avgViewTime: number
  topContent: Array<{
    id: string
    name: string
    views: number
    duration: string
    engagement: number
  }>
  devicePerformance: Array<{
    id: string
    name: string
    uptime: number
    views: number
    lastSeen: string
    status: 'online' | 'offline' | 'error'
  }>
  viewsByHour: Array<{
    hour: string
    views: number
  }>
  contentTypes: Array<{
    type: string
    count: number
    percentage: number
  }>
}

const mockAnalytics: AnalyticsData = {
  totalViews: 15420,
  totalDevices: 25,
  totalContent: 156,
  avgViewTime: 45,
  topContent: [
    {
      id: '1',
      name: 'Product Showcase Video',
      views: 2340,
      duration: '2:15',
      engagement: 85
    },
    {
      id: '2', 
      name: 'Welcome Message',
      views: 1890,
      duration: '0:30',
      engagement: 92
    },
    {
      id: '3',
      name: 'Event Promotion',
      views: 1456,
      duration: '1:45',
      engagement: 78
    },
    {
      id: '4',
      name: 'Company News',
      views: 1123,
      duration: '1:00',
      engagement: 71
    }
  ],
  devicePerformance: [
    {
      id: '1',
      name: 'Lobby Display 1',
      uptime: 99.5,
      views: 2340,
      lastSeen: '2 minutes ago',
      status: 'online'
    },
    {
      id: '2',
      name: 'Conference Room A',
      uptime: 98.2,
      views: 1890,
      lastSeen: '5 minutes ago', 
      status: 'online'
    },
    {
      id: '3',
      name: 'Cafeteria Screen',
      uptime: 95.8,
      views: 1456,
      lastSeen: '1 hour ago',
      status: 'offline'
    },
    {
      id: '4',
      name: 'Reception Display',
      uptime: 87.3,
      views: 1123,
      lastSeen: '3 hours ago',
      status: 'error'
    }
  ],
  viewsByHour: [
    { hour: '6AM', views: 45 },
    { hour: '7AM', views: 123 },
    { hour: '8AM', views: 456 },
    { hour: '9AM', views: 789 },
    { hour: '10AM', views: 654 },
    { hour: '11AM', views: 567 },
    { hour: '12PM', views: 890 },
    { hour: '1PM', views: 734 },
    { hour: '2PM', views: 623 },
    { hour: '3PM', views: 567 },
    { hour: '4PM', views: 456 },
    { hour: '5PM', views: 234 }
  ],
  contentTypes: [
    { type: 'Videos', count: 45, percentage: 42 },
    { type: 'Images', count: 78, percentage: 38 },
    { type: 'Text', count: 33, percentage: 20 }
  ]
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'text-green-500'
    case 'offline':
      return 'text-gray-500'
    case 'error':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

const getStatusBg = (status: string) => {
  switch (status) {
    case 'online':
      return 'bg-green-100 text-green-800'
    case 'offline':
      return 'bg-gray-100 text-gray-800'
    case 'error':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d')
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false)
    }, 2000)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor performance and engagement across your digital signage network
            </p>
          </div>
          <div className="flex gap-2">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <Button 
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Views
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockAnalytics.totalViews.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12.5%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last week</span>
                </div>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Devices
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockAnalytics.totalDevices}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+2</span>
                  <span className="text-sm text-gray-500 ml-1">new devices</span>
                </div>
              </div>
              <Monitor className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Content
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockAnalytics.totalContent}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8</span>
                  <span className="text-sm text-gray-500 ml-1">this week</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg View Time
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockAnalytics.avgViewTime}s
                </p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">-2.1%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last week</span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Views by Hour Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Views by Hour
              </h3>
              <BarChart3 className="h-5 w-5 text-gray-500" />
            </div>
            <div className="space-y-2">
              {mockAnalytics.viewsByHour.map((data, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-12 text-sm text-gray-600 dark:text-gray-400">
                    {data.hour}
                  </div>
                  <div className="flex-1 mx-2">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(data.views / Math.max(...mockAnalytics.viewsByHour.map(d => d.views))) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-sm text-gray-900 dark:text-white text-right">
                    {data.views}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Types */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Content Distribution
              </h3>
              <PieChart className="h-5 w-5 text-gray-500" />
            </div>
            <div className="space-y-4">
              {mockAnalytics.contentTypes.map((type, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      index === 0 ? 'bg-blue-500' : 
                      index === 1 ? 'bg-green-500' : 'bg-purple-500'
                    }`} />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {type.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {type.count}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {type.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Content Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Performing Content
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Most viewed content in the selected time period
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Content</th>
                  <th className="text-left p-4">Views</th>
                  <th className="text-left p-4">Duration</th>
                  <th className="text-left p-4">Engagement</th>
                  <th className="text-left p-4">Performance</th>
                </tr>
              </thead>
              <tbody>
                {mockAnalytics.topContent.map((content, index) => (
                  <tr key={content.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-blue-600">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {content.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {content.views.toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {content.duration}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${content.engagement}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {content.engagement}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        {content.engagement > 80 ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm ${content.engagement > 80 ? 'text-green-600' : 'text-red-600'}`}>
                          {content.engagement > 80 ? 'Excellent' : 'Needs Improvement'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Device Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Device Performance
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor uptime and performance across all devices
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Device</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Uptime</th>
                  <th className="text-left p-4">Views</th>
                  <th className="text-left p-4">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {mockAnalytics.devicePerformance.map((device) => (
                  <tr key={device.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-4">
                      <div className="flex items-center">
                        <Monitor className={`h-5 w-5 mr-3 ${getStatusColor(device.status)}`} />
                        <div className="font-medium text-gray-900 dark:text-white">
                          {device.name}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBg(device.status)}`}>
                        {device.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              device.uptime > 95 ? 'bg-green-500' :
                              device.uptime > 85 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${device.uptime}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {device.uptime}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {device.views.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {device.lastSeen}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}