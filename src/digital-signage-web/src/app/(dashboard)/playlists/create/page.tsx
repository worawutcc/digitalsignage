'use client'

/**
 * Create Playlist Page
 * 
 * Page for creating new playlists with scenes and media content.
 * Following UI copilot instructions:
 * - Client Component for interactivity
 * - TypeScript strict typing
 * - Tailwind CSS styling
 * - Feature-based organization
 */

import { useRouter } from 'next/navigation'
import { ArrowLeft, Film } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function CreatePlaylistPage() {
  const router = useRouter()

  const handleCancel = () => {
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
              Build a playlist by adding scenes with media content
            </p>
          </div>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12">
        <div className="text-center">
          <Film className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Playlist Builder Coming Soon
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            The playlist builder interface is under development. 
            You'll be able to create playlists with scenes and media content here.
          </p>
          <Button onClick={handleCancel}>
            Return to Playlists
          </Button>
        </div>
      </div>
    </div>
  )
}
