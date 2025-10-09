'use client'

import { 
  TrendingUp, 
  TrendingDown,
  Eye,
  Monitor,
  Clock,
  Download,
  RefreshCw,
  Loader2,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { 
  useAnalyticsOverview,
  useTopContent,
  useDevicePerformance,
  useViewsByHour,
  useContentTypeStats
} from '@/hooks/useAnalytics'

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
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useAnalyticsOverview()
  const { data: topContent = [], isLoading: topContentLoading } = useTopContent(10)
  const { data: devicePerformance = [], isLoading: devicePerfLoading } = useDevicePerformance()
  const { data: viewsByHour = [], isLoading: viewsLoading } = useViewsByHour()
  const { data: contentTypes = [], isLoading: typesLoading } = useContentTypeStats()

  const isLoading = overviewLoading || topContentLoading || devicePerfLoading || viewsLoading || typesLoading

  const handleRefresh = () => {
    refetchOverview()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
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
          <Button 
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
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
                {overview?.totalViews.toLocaleString() ?? '0'}
              </p>
              <div className="flex items-center mt-2">
                <Activity className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm text-gray-500">Aggregated views</span>
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
                {overview?.activeDevices ?? '0'} / {overview?.totalDevices ?? '0'}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-gray-500">{overview?.offlineDevices ?? '0'} offline</span>
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
                {overview?.totalContent ?? '0'}
              </p>
              <div className="flex items-center mt-2">
                <Activity className="h-4 w-4 text-purple-500 mr-1" />
                <span className="text-sm text-gray-500">{overview?.contentUtilization.toFixed(1) ?? '0'}% utilized</span>
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
                {overview?.avgViewTime.toFixed(1) ?? '0'}s
              </p>
              <div className="flex items-center mt-2">
                <Clock className="h-4 w-4 text-orange-500 mr-1" />
                <span className="text-sm text-gray-500">Average duration</span>
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
            {viewsByHour.slice(0, 12).map((data, index) => {
              const maxViews = Math.max(...viewsByHour.map(d => d.views), 1)
              return (
                <div key={index} className="flex items-center">
                  <div className="w-12 text-sm text-gray-600 dark:text-gray-400">
                    {data.hour}
                  </div>
                  <div className="flex-1 mx-2">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(data.views / maxViews) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-sm text-gray-900 dark:text-white text-right">
                    {data.views}
                  </div>
                </div>
              )
            })}
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
            {contentTypes.map((type, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    index === 0 ? 'bg-blue-500' : 
                    index === 1 ? 'bg-green-500' : 
                    index === 2 ? 'bg-purple-500' : 'bg-orange-500'
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
                    {type.percentage.toFixed(1)}%
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
                <th className="text-left p-4">Type</th>
                <th className="text-left p-4">Views</th>
                <th className="text-left p-4">Duration</th>
                <th className="text-left p-4">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {topContent.map((content, index) => (
                <tr key={content.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-blue-600">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {content.name}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {content.mediaType}
                    </span>
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
                        {content.engagement.toFixed(1)}%
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
                <th className="text-left p-4">Location</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Uptime</th>
                <th className="text-left p-4">Views</th>
                <th className="text-left p-4">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {devicePerformance.map((device) => (
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
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {device.location}
                    </span>
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
                        {device.uptime.toFixed(1)}%
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
  )
}
