'use client'

/**
 * Playlist Analytics Page
 * 
 * Analytics and performance metrics page for individual playlists.
 * Following UI copilot instructions:
 * - Client Component for interactivity
 * - TypeScript strict typing
 * - Tailwind CSS styling
 * - Next.js App Router dynamic routes
 * - Proper loading and error states
 */

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  TrendingUp,
  Eye,
  Clock,
  Monitor,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Loader2,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { PlaylistDto } from '@/types/playlist'
import { PlaylistStatus } from '@/types/playlist'

// Analytics types
interface PlaylistAnalyticsData {
  playCount: number
  totalViewTime: number // in seconds
  uniqueViewers: number
  deviceCount: number
  averageViewTime: number
  completionRate: number
  peakViewingHours: string[]
  topDevices: Array<{
    deviceId: number
    deviceName: string
    viewCount: number
    lastViewed: string
  }>
  viewsByDate: Array<{
    date: string
    views: number
    duration: number
  }>
  devicePerformance: Array<{
    deviceId: number
    deviceName: string
    uptime: number
    errorRate: number
    lastHeartbeat: string
  }>
  mediaItemStats: Array<{
    mediaId: number
    mediaName: string
    viewCount: number
    skipRate: number
    averageDuration: number
  }>
}

interface PlaylistInfo {
  id: number
  name: string
  status: PlaylistStatus
  totalItems: number
  totalDuration: number
  createdAt: string
  lastModified: string
}

// Mock API functions
const mockAnalyticsApi = {
  getPlaylistInfo: async (id: number): Promise<PlaylistInfo> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      id: id,
      name: `Analytics for Playlist ${id}`,
      status: PlaylistStatus.Active,
      totalItems: 5,
      totalDuration: 180,
      createdAt: '2024-01-15T10:30:00Z',
      lastModified: '2024-01-16T14:20:00Z'
    }
  },

  getAnalytics: async (id: number): Promise<PlaylistAnalyticsData> => {
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    return {
      playCount: 2847,
      totalViewTime: 142350, // ~39.5 hours
      uniqueViewers: 1256,
      deviceCount: 8,
      averageViewTime: 113, // seconds
      completionRate: 87.3,
      peakViewingHours: ['09:00', '12:00', '17:00'],
      topDevices: [
        { deviceId: 1, deviceName: 'Lobby Display Main', viewCount: 856, lastViewed: '2024-10-14T08:30:00Z' },
        { deviceId: 2, deviceName: 'Reception Screen', viewCount: 723, lastViewed: '2024-10-14T07:45:00Z' },
        { deviceId: 3, deviceName: 'Conference Room A', viewCount: 445, lastViewed: '2024-10-14T06:15:00Z' },
        { deviceId: 4, deviceName: 'Cafeteria Display', viewCount: 398, lastViewed: '2024-10-14T05:30:00Z' }
      ],
      viewsByDate: [
        { date: '2024-10-08', views: 245, duration: 12580 },
        { date: '2024-10-09', views: 298, duration: 15240 },
        { date: '2024-10-10', views: 356, duration: 18200 },
        { date: '2024-10-11', views: 423, duration: 21650 },
        { date: '2024-10-12', views: 389, duration: 19890 },
        { date: '2024-10-13', views: 445, duration: 22780 },
        { date: '2024-10-14', views: 691, duration: 35310 }
      ],
      devicePerformance: [
        { deviceId: 1, deviceName: 'Lobby Display Main', uptime: 99.2, errorRate: 0.8, lastHeartbeat: '2024-10-14T08:30:00Z' },
        { deviceId: 2, deviceName: 'Reception Screen', uptime: 98.5, errorRate: 1.5, lastHeartbeat: '2024-10-14T08:29:00Z' },
        { deviceId: 3, deviceName: 'Conference Room A', uptime: 97.1, errorRate: 2.9, lastHeartbeat: '2024-10-14T08:25:00Z' },
        { deviceId: 4, deviceName: 'Cafeteria Display', uptime: 96.8, errorRate: 3.2, lastHeartbeat: '2024-10-14T08:20:00Z' }
      ],
      mediaItemStats: [
        { mediaId: 101, mediaName: 'Welcome Banner', viewCount: 2847, skipRate: 5.2, averageDuration: 9.8 },
        { mediaId: 102, mediaName: 'Product Showcase', viewCount: 2698, skipRate: 12.3, averageDuration: 26.7 },
        { mediaId: 103, mediaName: 'Company News', viewCount: 2445, skipRate: 18.9, averageDuration: 22.1 },
        { mediaId: 104, mediaName: 'Weather Widget', viewCount: 2234, skipRate: 25.6, averageDuration: 13.2 },
        { mediaId: 105, mediaName: 'Event Calendar', viewCount: 2089, skipRate: 31.4, averageDuration: 18.9 }
      ]
    }
  }
}

export default function PlaylistAnalyticsPage() {
  const router = useRouter()
  const params = useParams()
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  
  const playlistId = parseInt(params.id as string, 10)

  // Fetch playlist info
  const { 
    data: playlistInfo, 
    isLoading: infoLoading, 
    error: infoError 
  } = useQuery<PlaylistInfo>({
    queryKey: ['playlist-info', playlistId],
    queryFn: () => mockAnalyticsApi.getPlaylistInfo(playlistId),
    enabled: !isNaN(playlistId)
  })

  // Fetch analytics data
  const { 
    data: analytics, 
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics
  } = useQuery<PlaylistAnalyticsData>({
    queryKey: ['playlist-analytics', playlistId, timeRange],
    queryFn: () => mockAnalyticsApi.getAnalytics(playlistId),
    enabled: !isNaN(playlistId)
  })

  const handleBack = () => {
    router.push(`/playlists/${playlistId}`)
  }

  const handleExport = () => {
    // TODO: Implement CSV/PDF export functionality
    console.log('Export analytics data for playlist:', playlistId)
  }

  // Helper functions
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const getStatusColor = (status: PlaylistStatus) => {
    switch (status) {
      case PlaylistStatus.Active:
        return 'text-green-600'
      case PlaylistStatus.Draft:
        return 'text-blue-600'
      case PlaylistStatus.Archived:
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  // Handle invalid playlist ID
  if (isNaN(playlistId)) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/playlists')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Playlists</span>
        </Button>
        
        <div className="bg-white rounded-lg border shadow-sm p-12">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Playlist ID</h3>
            <p className="text-gray-500 mb-6">The playlist ID provided is not valid.</p>
            <Button onClick={() => router.push('/playlists')}>Back to Playlists</Button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (infoLoading || analyticsLoading) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Playlist</span>
        </Button>
        
        <div className="bg-white rounded-lg border shadow-sm p-12">
          <div className="text-center">
            <Loader2 className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Analytics</h3>
            <p className="text-gray-500">Please wait while we fetch the analytics data...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (infoError || analyticsError || !playlistInfo || !analytics) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Playlist</span>
        </Button>
        
        <div className="bg-white rounded-lg border shadow-sm p-12">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Analytics</h3>
            <p className="text-gray-500 mb-6">
              There was an error loading the analytics data. Please try again.
            </p>
            <div className="space-x-3">
              <Button variant="outline" onClick={() => refetchAnalytics()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={handleBack}>Back to Playlist</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Playlist</span>
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-semibold text-gray-900">{playlistInfo.name}</h1>
              <Badge variant="success">Analytics</Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Performance metrics and usage statistics
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <Button 
            variant="outline"
            onClick={handleExport}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.playCount)}</p>
            </div>
            <Eye className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            +23% from last period
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Watch Time</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(analytics.totalViewTime)}</p>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Avg {formatDuration(analytics.averageViewTime)} per view
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Devices</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.deviceCount}</p>
            </div>
            <Monitor className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Across all locations
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.completionRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Users who watched till end
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Views Over Time</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {analytics.viewsByDate.map((day, index) => (
              <div key={day.date} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{day.views} views</p>
                  <p className="text-xs text-gray-500">{formatDuration(day.duration)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Devices */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Top Performing Devices</h3>
            <Monitor className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {analytics.topDevices.map((device, index) => (
              <div key={device.deviceId} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{device.deviceName}</p>
                    <p className="text-xs text-gray-500">
                      Last active {new Date(device.lastViewed).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{device.viewCount}</p>
                  <p className="text-xs text-gray-500">views</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Device Performance */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Device Performance</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Device</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Uptime</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Error Rate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Last Heartbeat</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.devicePerformance.map((device) => (
                  <tr key={device.deviceId} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{device.deviceName}</p>
                      <p className="text-sm text-gray-500">ID: {device.deviceId}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-green-500 rounded-full" 
                            style={{ width: `${device.uptime}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{device.uptime}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-medium ${
                        device.errorRate < 2 ? 'text-green-600' : 
                        device.errorRate < 5 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {device.errorRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900">
                        {new Date(device.lastHeartbeat).toLocaleString()}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={device.uptime > 98 ? 'success' : device.uptime > 95 ? 'warning' : 'error'}>
                        {device.uptime > 98 ? 'Excellent' : device.uptime > 95 ? 'Good' : 'Poor'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Media Item Performance */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Media Item Performance</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.mediaItemStats.map((media) => (
              <div key={media.mediaId} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{media.mediaName}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Views:</span>
                    <span className="font-medium">{formatNumber(media.viewCount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Skip rate:</span>
                    <span className={`font-medium ${
                      media.skipRate < 10 ? 'text-green-600' : 
                      media.skipRate < 25 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {media.skipRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Avg duration:</span>
                    <span className="font-medium">{media.averageDuration}s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}