'use client'

import React, { useState } from 'react'
import { PlaylistAssignmentSummary } from '@/features/playlists/components/PlaylistAssignmentSummary'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Plus, 
  Search, 
  Filter,
  Grid3x3,
  List,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  Clock,
  Monitor,
  MoreHorizontal,
  Calendar,
  AlertCircle,
  Loader2,
  Music
} from 'lucide-react'
import AdminLayout from '@/components/layouts/AdminLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import PlaylistService from '@/services/playlistService'
import {
  PlaylistDto,
  PlaylistStatus,
  PlaylistStatistics,
  formatPlaylistDuration,
  getPlaylistStatusLabel,
  getPlaylistStatusColor
} from '@/types/playlist'

export default function PlaylistsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | PlaylistStatus>('all')

  // Fetch playlists
  const { data: playlists = [], isLoading, error } = useQuery<PlaylistDto[], Error>({
    queryKey: ['playlists'],
    queryFn: () => PlaylistService.getAll()
  })

  // Fetch statistics
  const { data: stats } = useQuery<PlaylistStatistics>({
    queryKey: ['playlist-stats'],
    queryFn: () => PlaylistService.getStatistics()
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => PlaylistService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
      queryClient.invalidateQueries({ queryKey: ['playlist-stats'] })
    }
  })

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: (id: number) => PlaylistService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
    }
  })

  // Activate mutation
  const activateMutation = useMutation({
    mutationFn: (id: number) => PlaylistService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
      queryClient.invalidateQueries({ queryKey: ['playlist-stats'] })
    }
  })

  // Deactivate mutation
  const deactivateMutation = useMutation({
    mutationFn: (id: number) => PlaylistService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
      queryClient.invalidateQueries({ queryKey: ['playlist-stats'] })
    }
  })

  // Filter playlists
  const filteredPlaylists = playlists.filter(playlist => {
    const matchesSearch = !searchTerm || 
      playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (playlist.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    
    const matchesStatus = statusFilter === 'all' || playlist.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this playlist?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleDuplicate = (id: number) => {
    duplicateMutation.mutate(id)
  }

  const handleToggleActive = (playlist: PlaylistDto) => {
    if (playlist.status === PlaylistStatus.Active) {
      deactivateMutation.mutate(playlist.id)
    } else {
      activateMutation.mutate(playlist.id)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Playlists
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage content playlists for your digital signage displays
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button onClick={() => router.push('/playlists/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Playlist
            </Button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <Music className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Playlists
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.totalPlaylists ?? 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <Play className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.activePlaylists ?? 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <Monitor className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Assigned Devices
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.totalAssignedDevices ?? 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Avg Duration
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats ? formatPlaylistDuration(stats.averageDuration) : '0:00'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search playlists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="flex gap-2">
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error loading playlists
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error.message}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredPlaylists.length === 0 && (
          <div className="text-center py-20">
            <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No playlists found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first playlist'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => router.push('/playlists/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Playlist
              </Button>
            )}
          </div>
        )}

        {/* Playlists Grid/List */}
        {!isLoading && !error && filteredPlaylists.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlaylists.map((playlist) => (
              <div key={playlist.id} className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {playlist.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {playlist.description}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlaylistStatusColor(playlist.status)}`}>
                      {getPlaylistStatusLabel(playlist.status)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {playlist.playlistItems?.length ?? 0} items
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                      <span className="font-medium">{formatPlaylistDuration(playlist.totalDurationSeconds)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Loop:</span>
                      <span className="font-medium">{playlist.isLooped ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                      <span className="font-medium">{playlist.priority}</span>
                    </div>
                  </div>

                  {/* Assignment Summary UI */}
                  <div className="mb-4">
                    <PlaylistAssignmentSummary playlistId={playlist.id} />
                  </div>

                  {playlist.status === PlaylistStatus.Scheduled && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          Scheduled
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        Created: {new Date(playlist.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Items</th>
                    <th className="text-left p-4">Duration</th>
                    <th className="text-left p-4">Loop</th>
                    <th className="text-left p-4">Modified</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlaylists.map((playlist) => (
                    <tr key={playlist.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {playlist.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {playlist.description}
                          </div>
                          {playlist.status === PlaylistStatus.Scheduled && (
                            <div className="flex items-center mt-1">
                              <Calendar className="h-3 w-3 text-blue-500 mr-1" />
                              <span className="text-xs text-blue-600">
                                Created: {new Date(playlist.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlaylistStatusColor(playlist.status)}`}>
                          {getPlaylistStatusLabel(playlist.status)}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {playlist.playlistItems?.length ?? 0}
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {formatPlaylistDuration(playlist.totalDurationSeconds)}
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {playlist.isLooped ? 'Yes' : 'No'}
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {playlist.updatedAt ? new Date(playlist.updatedAt).toLocaleDateString() : new Date(playlist.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}