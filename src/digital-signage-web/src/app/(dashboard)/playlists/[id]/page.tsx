'use client'

/**
 * Playlist Detail View Page
 * 
 * Read-only page for viewing playlist information, media content, and analytics.
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
  Edit, 
  Play, 
  Clock, 
  Users, 
  Calendar,
  Monitor,
  Eye,
  BarChart3,
  Loader2,
  AlertCircle,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { PlaylistDto } from '@/types/playlist'
import { PlaylistStatus } from '@/types/playlist'
import { MediaType } from '@/types/media'

// Mock API for playlist details and analytics
const mockPlaylistApi = {
  getById: async (id: number): Promise<PlaylistDto> => {
    console.log('Fetching playlist details:', id)
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    return {
      id: id,
      name: `Playlist ${id}`,
      description: 'A comprehensive playlist showcasing various media content for digital signage displays.',
      status: PlaylistStatus.Active,
      isLooped: true,
      loopCount: null, // Infinite loop
      priority: 5,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T14:20:00Z',
      createdByUserId: 1,
      createdByUserName: 'John Doe',
      playlistItems: [
        {
          id: 1,
          playlistId: id,
          mediaId: 101,
          mediaName: 'Welcome Banner',
          mediaFileName: 'welcome-banner.jpg',
          mediaType: MediaType.Image,
          orderIndex: 0,
          durationSeconds: 10,
          useCustomDuration: true,
          transitionEffect: 1, // Fade
          transitionDurationMs: 500,
          isConditional: false,
          startTime: null,
          endTime: null
        },
        {
          id: 2,
          playlistId: id,
          mediaId: 102,
          mediaName: 'Product Video',
          mediaFileName: 'product-showcase.mp4',
          mediaType: MediaType.Video,
          orderIndex: 1,
          durationSeconds: 30,
          useCustomDuration: false,
          transitionEffect: 2, // Slide
          transitionDurationMs: 750,
          isConditional: false,
          startTime: null,
          endTime: null
        },
        {
          id: 3,
          playlistId: id,
          mediaId: 103,
          mediaName: 'Weather Widget',
          mediaFileName: 'weather-widget.html',
          mediaType: MediaType.Html,
          orderIndex: 2,
          durationSeconds: 15,
          useCustomDuration: true,
          transitionEffect: 0, // Cut
          transitionDurationMs: 0,
          isConditional: true,
          startTime: '06:00:00',
          endTime: '22:00:00'
        }
      ],
      totalItems: 3,
      totalDurationSeconds: 55
    }
  },

  getAnalytics: async (id: number) => {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    return {
      playCount: 1247,
      totalViewTime: 68585, // in seconds
      deviceCount: 12,
      averageViewTime: 45,
      lastPlayed: '2024-01-16T09:30:00Z',
      topDevice: 'Lobby Display #1',
      peakHours: ['09:00', '12:00', '17:00']
    }
  }
}

export default function PlaylistDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [activeTab, setActiveTab] = useState<'overview' | 'media' | 'analytics'>('overview')
  
  const playlistId = parseInt(params.id as string, 10)

  // Fetch playlist data
  const { 
    data: playlist, 
    isLoading, 
    error 
  } = useQuery<PlaylistDto>({
    queryKey: ['playlist', playlistId],
    queryFn: () => mockPlaylistApi.getById(playlistId),
    enabled: !isNaN(playlistId)
  })

  // Fetch analytics data
  const { 
    data: analytics,
    isLoading: analyticsLoading 
  } = useQuery({
    queryKey: ['playlist-analytics', playlistId],
    queryFn: () => mockPlaylistApi.getAnalytics(playlistId),
    enabled: !isNaN(playlistId) && activeTab === 'analytics'
  })

  const handleEdit = () => {
    router.push(`/playlists/${playlistId}/edit`)
  }

  const handleBack = () => {
    router.push('/playlists')
  }

  // Format duration helper
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get status variant and label
  const getStatusConfig = (status: PlaylistStatus) => {
    switch (status) {
      case PlaylistStatus.Active:
        return { variant: 'success' as const, label: 'Active', color: 'text-green-600' }
      case PlaylistStatus.Draft:
        return { variant: 'info' as const, label: 'Draft', color: 'text-blue-600' }
      case PlaylistStatus.Archived:
        return { variant: 'default' as const, label: 'Archived', color: 'text-gray-600' }
      case PlaylistStatus.Inactive:
        return { variant: 'error' as const, label: 'Inactive', color: 'text-red-600' }
      case PlaylistStatus.Scheduled:
        return { variant: 'info' as const, label: 'Scheduled', color: 'text-blue-600' }
      default:
        return { variant: 'default' as const, label: 'Unknown', color: 'text-gray-600' }
    }
  }

  // Handle invalid playlist ID
  if (isNaN(playlistId)) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
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
            <Button onClick={handleBack}>Back to Playlists</Button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Playlists</span>
        </Button>
        
        <div className="bg-white rounded-lg border shadow-sm p-12">
          <div className="text-center">
            <Loader2 className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Playlist</h3>
            <p className="text-gray-500">Please wait while we fetch the playlist details...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !playlist) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Playlists</span>
        </Button>
        
        <div className="bg-white rounded-lg border shadow-sm p-12">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Playlist Not Found</h3>
            <p className="text-gray-500 mb-6">
              The playlist you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={handleBack}>Back to Playlists</Button>
          </div>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(playlist.status)

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
            <span>Back to Playlists</span>
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-semibold text-gray-900">{playlist.name}</h1>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {playlist.description || 'No description provided'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleEdit} className="flex items-center space-x-2">
            <Edit className="h-4 w-4" />
            <span>Edit Playlist</span>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <Play className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{playlist.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Duration</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(playlist.totalDurationSeconds)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Priority</p>
              <p className="text-2xl font-bold text-gray-900">{playlist.priority}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <Monitor className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Loop Mode</p>
              <p className="text-2xl font-bold text-gray-900">
                {playlist.isLooped ? (playlist.loopCount ? `${playlist.loopCount}x` : '∞') : 'Off'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Overview</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'media'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Play className="h-4 w-4" />
                <span>Media Items ({playlist.totalItems})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Playlist Details</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created by</dt>
                      <dd className="text-sm text-gray-900">{playlist.createdByUserName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created on</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(playlist.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last updated</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(playlist.updatedAt || playlist.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Loop settings</dt>
                      <dd className="text-sm text-gray-900">
                        {playlist.isLooped ? 
                          (playlist.loopCount ? `Loop ${playlist.loopCount} times` : 'Loop infinitely') : 
                          'No looping'
                        }
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Priority level</dt>
                      <dd className="text-sm text-gray-900">{playlist.priority}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total duration</dt>
                      <dd className="text-sm text-gray-900">
                        {formatDuration(playlist.totalDurationSeconds)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Media Items</h3>
              <div className="space-y-3">
                {playlist.playlistItems.map((item, index) => (
                  <div key={item.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{item.mediaName}</h4>
                      <p className="text-sm text-gray-500">{item.mediaFileName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDuration(item.durationSeconds)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.useCustomDuration ? 'Custom duration' : 'Auto duration'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Analytics & Usage</h3>
              {analyticsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-500">Loading analytics...</p>
                </div>
              ) : analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{analytics.playCount}</p>
                    <p className="text-sm text-gray-500">Total plays</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{analytics.deviceCount}</p>
                    <p className="text-sm text-gray-500">Active devices</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatDuration(analytics.averageViewTime)}
                    </p>
                    <p className="text-sm text-gray-500">Avg. view time</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No analytics data available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}