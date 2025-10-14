'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Grid3x3, List, Music, Play, Monitor, Clock, Loader2, AlertCircle, MoreVertical, Edit, Copy, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
// Using basic divs instead of Card component
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/DropdownMenu'
import { PlaylistService } from '@/features/playlists/services/playlistService'
import { PlaylistStatus } from '@/features/playlists/types'
import type { 
  PlaylistDto, 
  PlaylistStatistics
} from '@/features/playlists/types'

interface PlaylistStats {
  totalPlaylists: number
  activePlaylists: number
  totalAssignedDevices: number
  averageDuration: number
}

// API Integration - Using real PlaylistService

export default function PlaylistsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  // View and filter state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | PlaylistStatus>('all')
  const [selectedItems, setSelectedItems] = useState<number[]>([])

  // API queries
  const { data: playlists = [], isLoading, error } = useQuery<PlaylistDto[]>({
    queryKey: ['playlists'],
    queryFn: PlaylistService.getAll,
    refetchOnWindowFocus: false,
  })

  const { data: playlistStats } = useQuery({
    queryKey: ['playlist-stats'],
    queryFn: PlaylistService.getStatistics,
    refetchOnWindowFocus: false,
  })

  // Convert PlaylistStatistics to PlaylistStats format
  const stats: PlaylistStats | undefined = playlistStats ? {
    totalPlaylists: playlistStats.totalPlaylists,
    activePlaylists: playlistStats.activePlaylists,
    totalAssignedDevices: playlistStats.totalAssignedDevices,
    averageDuration: playlistStats.averageDuration
  } : undefined

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: number) => PlaylistService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
      queryClient.invalidateQueries({ queryKey: ['playlist-stats'] })
    }
  })

  const duplicateMutation = useMutation({
    mutationFn: (id: number) => PlaylistService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
    }
  })

  // Filter playlists
  const filteredPlaylists = useMemo(() => {
    return playlists.filter(playlist => {
      const matchesSearch = !searchQuery || 
        playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        playlist.description?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || playlist.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [playlists, searchQuery, statusFilter])

  // Format duration helper
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get status badge variant
  const getStatusVariant = (status: PlaylistStatus) => {
    switch (status) {
      case PlaylistStatus.Active:
        return 'success'
      case PlaylistStatus.Draft:
        return 'info'
      case PlaylistStatus.Archived:
        return 'default'

      case PlaylistStatus.Scheduled:
        return 'info'
      default:
        return 'default'
    }
  }

  // Get status label
  const getStatusLabel = (status: PlaylistStatus) => {
    switch (status) {
      case PlaylistStatus.Active:
        return 'Active'
      case PlaylistStatus.Draft:
        return 'Draft'
      case PlaylistStatus.Archived:
        return 'Archived'
      case PlaylistStatus.Scheduled:
        return 'Scheduled'
      default:
        return 'Unknown'
    }
  }

  // Event handlers
  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this playlist?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleDuplicate = (id: number) => {
    duplicateMutation.mutate(id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Playlists
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage content playlists for your digital signage displays
          </p>
        </div>
        <Button onClick={() => router.push('/playlists/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Playlist
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <Music className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Playlists
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalPlaylists}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <Play className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activePlaylists}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <Monitor className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Assigned Devices
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalAssignedDevices}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Avg Duration
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(stats.averageDuration)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search playlists by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | PlaylistStatus)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value={PlaylistStatus.Active}>Active</option>
          <option value={PlaylistStatus.Draft}>Draft</option>
          <option value={PlaylistStatus.Archived}>Archived</option>

          <option value={PlaylistStatus.Scheduled}>Scheduled</option>
        </select>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading playlists...</span>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">Failed to load playlists</p>
            <p className="text-gray-600">Please try again later</p>
          </div>
        </div>
      ) : filteredPlaylists.length === 0 ? (
        <div className="text-center py-12">
          <Music className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No playlists found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first playlist.'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <div className="mt-6">
              <Button onClick={() => router.push('/playlists/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create your first playlist
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {filteredPlaylists.map((playlist) => (
            <div key={playlist.id} className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{playlist.name}</h3>
                  <Badge variant={getStatusVariant(playlist.status)}>
                    {getStatusLabel(playlist.status)}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/playlists/${playlist.id}`)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(playlist.id)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(playlist.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                {playlist.description && (
                  <p className="text-sm text-gray-600">
                    {playlist.description}
                  </p>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Items:</span>
                    <span className="font-medium">{playlist.totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium">{formatDuration(playlist.totalDurationSeconds)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Priority:</span>
                    <span className="font-medium">{playlist.priority}</span>
                  </div>
                </div>

                <div className="pt-3 border-t text-xs text-gray-500">
                  <p>Created by {playlist.createdByUserName}</p>
                  <p>{new Date(playlist.updatedAt || playlist.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}