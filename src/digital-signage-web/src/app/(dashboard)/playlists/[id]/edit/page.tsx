'use client'

/**
 * Edit Playlist Page
 * 
 * Dynamic page for editing existing playlists using PlaylistEditor component.
 * Following UI copilot instructions:
 * - Client Component for interactivity
 * - TypeScript strict typing
 * - Tailwind CSS styling
 * - Next.js App Router dynamic routes
 * - Proper error handling and loading states
 */

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PlaylistEditor } from '@/features/playlists/components/PlaylistEditor'
import type { PlaylistDto, UpdatePlaylistRequest } from '@/types/playlist'
import { PlaylistStatus } from '@/types/playlist'

// Mock API functions
const mockPlaylistApi = {
  getById: async (id: number): Promise<PlaylistDto> => {
    console.log('Fetching playlist:', id)
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Return mock playlist data
    return {
      id: id,
      name: 'Sample Playlist ' + id,
      description: 'This is a sample playlist for editing',
      status: PlaylistStatus.Draft,
      isLooped: true,
      loopCount: 3,
      priority: 5,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T14:20:00Z',
      createdByUserId: 1,
      createdByUserName: 'John Doe',
      playlistItems: [],
      totalItems: 3,
      totalDurationSeconds: 180
    }
  },
  
  update: async (id: number, data: UpdatePlaylistRequest): Promise<PlaylistDto> => {
    console.log('Updating playlist:', id, data)
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Return updated playlist
    return {
      id: id,
      name: data.name,
      description: data.description || '',
      status: data.status || PlaylistStatus.Draft,
      isLooped: data.isLooped || false,
      loopCount: data.loopCount || null,
      priority: data.priority || 0,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: new Date().toISOString(),
      createdByUserId: 1,
      createdByUserName: 'John Doe',
      playlistItems: [],
      totalItems: 3,
      totalDurationSeconds: 180
    }
  }
}

export default function EditPlaylistPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)
  
  const playlistId = parseInt(params.id as string, 10)

  // Fetch playlist data
  const { 
    data: playlist, 
    isLoading, 
    error,
    refetch 
  } = useQuery<PlaylistDto>({
    queryKey: ['playlist', playlistId],
    queryFn: () => mockPlaylistApi.getById(playlistId),
    enabled: !isNaN(playlistId)
  })

  // Update playlist mutation
  const updatePlaylistMutation = useMutation({
    mutationFn: (data: UpdatePlaylistRequest) => mockPlaylistApi.update(playlistId, data),
    onSuccess: (updatedPlaylist) => {
      // Update the cached playlist data
      queryClient.setQueryData(['playlist', playlistId], updatedPlaylist)
      
      // Invalidate playlists list to refresh it
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
      queryClient.invalidateQueries({ queryKey: ['playlist-stats'] })
      
      // Navigate back to playlists list or show success message
      // TODO: Show success toast/notification
      console.log('Playlist updated successfully')
    },
    onError: (error) => {
      console.error('Failed to update playlist:', error)
      // TODO: Show error toast/notification
    }
  })

  const handleSave = async (playlistData: any) => {
    try {
      setIsSaving(true)
      
      const updateData: UpdatePlaylistRequest = {
        name: playlistData.name,
        description: playlistData.description,
        status: playlistData.status || PlaylistStatus.Draft,
        isLooped: playlistData.isLooped,
        loopCount: playlistData.loopCount,
        priority: playlistData.priority || 0
      }

      await updatePlaylistMutation.mutateAsync(updateData)
    } catch (error) {
      console.error('Error updating playlist:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // TODO: Show confirmation if form is dirty
    router.push('/playlists')
  }

  // Handle invalid playlist ID
  if (isNaN(playlistId)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/playlists')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Playlists</span>
          </Button>
        </div>
        
        <div className="bg-white rounded-lg border shadow-sm p-12">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Invalid Playlist ID
            </h3>
            <p className="text-gray-500 mb-6">
              The playlist ID provided is not valid.
            </p>
            <Button onClick={() => router.push('/playlists')}>
              Back to Playlists
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCancel}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Playlists</span>
          </Button>
          <div className="text-sm text-gray-500">
            Loading playlist...
          </div>
        </div>
        
        <div className="bg-white rounded-lg border shadow-sm p-12">
          <div className="text-center">
            <Loader2 className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Loading Playlist
            </h3>
            <p className="text-gray-500">
              Please wait while we fetch the playlist data...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !playlist) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCancel}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Playlists</span>
          </Button>
        </div>
        
        <div className="bg-white rounded-lg border shadow-sm p-12">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to Load Playlist
            </h3>
            <p className="text-gray-500 mb-6">
              {error ? 
                'There was an error loading the playlist. Please try again.' : 
                'Playlist not found or has been deleted.'
              }
            </p>
            <div className="space-x-3">
              <Button variant="outline" onClick={() => refetch()}>
                Try Again
              </Button>
              <Button onClick={handleCancel}>
                Back to Playlists
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main edit interface
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCancel}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Playlists</span>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Edit Playlist</h1>
            <p className="text-sm text-gray-600 mt-1">
              Modify playlist details and manage media content
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              // This will be handled by the PlaylistEditor component
              // The editor will call handleSave when the user clicks save
            }}
            disabled={isSaving}
            className="flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border shadow-sm">
        <PlaylistEditor
          playlist={playlist}
          isEditing={true}
          onSave={handleSave}
          onCancel={handleCancel}
          className="border-none shadow-none"
        />
      </div>
    </div>
  )
}