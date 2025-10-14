'use client'

/**
 * Create Playlist Page
 * 
 * Enhanced page for creating new playlists using PlaylistEditor component.
 * Following UI copilot instructions:
 * - Client Component for interactivity
 * - TypeScript strict typing  
 * - Tailwind CSS styling
 * - Feature-based organization
 * - Next.js App Router patterns
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PlaylistEditor } from '@/features/playlists/components/PlaylistEditor'
import type { CreatePlaylistRequest, PlaylistDto } from '@/types/playlist'
import { PlaylistStatus } from '@/types/playlist'

// Mock API function for creating playlist
const mockPlaylistApi = {
  create: async (data: CreatePlaylistRequest): Promise<PlaylistDto> => {
    console.log('Creating playlist:', data)
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Return mock created playlist
    return {
      id: Date.now(), // Mock ID
      name: data.name,
      description: data.description || '',
      status: data.status || PlaylistStatus.Draft,
      isLooped: data.isLooped || false,
      loopCount: data.loopCount || null,
      priority: data.priority || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByUserId: 1, // Mock user ID
      createdByUserName: 'Current User',
      playlistItems: [],
      totalItems: 0,
      totalDurationSeconds: 0
    }
  }
}

export default function CreatePlaylistPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)

  // Create playlist mutation
  const createPlaylistMutation = useMutation({
    mutationFn: mockPlaylistApi.create,
    onSuccess: (createdPlaylist) => {
      // Invalidate and refetch playlists
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
      queryClient.invalidateQueries({ queryKey: ['playlist-stats'] })
      
      // Navigate to the created playlist's edit page
      router.push(`/playlists/${createdPlaylist.id}/edit`)
    },
    onError: (error) => {
      console.error('Failed to create playlist:', error)
      // TODO: Show error toast/notification
    }
  })

  const handleSave = async (playlistData: any) => {
    try {
      setIsSaving(true)
      
      const createData: CreatePlaylistRequest = {
        name: playlistData.name,
        description: playlistData.description,
        status: PlaylistStatus.Draft, // New playlists start as draft
        isLooped: playlistData.isLooped,
        loopCount: playlistData.loopCount,
        priority: playlistData.priority || 0,
        playlistItems: [] // Empty for new playlists
      }

      await createPlaylistMutation.mutateAsync(createData)
    } catch (error) {
      console.error('Error creating playlist:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // TODO: Show confirmation if form is dirty
    router.push('/playlists')
  }

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
            <h1 className="text-2xl font-semibold text-gray-900">Create New Playlist</h1>
            <p className="text-sm text-gray-600 mt-1">
              Set up your playlist details and add media content
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
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Create Playlist</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border shadow-sm">
        <PlaylistEditor
          isEditing={false}
          onSave={handleSave}
          onCancel={handleCancel}
          className="border-none shadow-none"
        />
      </div>
    </div>
  )
}
