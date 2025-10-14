'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { Info, Save } from 'lucide-react'

interface PlaylistFormData {
  name: string
  description?: string
  isLooped: boolean
  priority: number
  status: number
}

interface Playlist {
  id: number
  name: string
  description?: string
  isLooped: boolean
  priority: number
  status: number
  createdAt: string
  updatedAt: string
}

interface PlaylistFormProps {
  playlist?: Playlist | null
  onSubmit: (data: PlaylistFormData) => Promise<void> | void
  onDirtyChange?: (isDirty: boolean) => void
  isLoading?: boolean
  className?: string
}

export function PlaylistForm({ 
  playlist, 
  onSubmit, 
  onDirtyChange, 
  isLoading = false,
  className 
}: PlaylistFormProps) {
  const [formData, setFormData] = useState<PlaylistFormData>({
    name: playlist?.name || '',
    description: playlist?.description || '',
    isLooped: playlist?.isLooped || false,
    priority: playlist?.priority || 0,
    status: playlist?.status || 0
  })
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  const handleFieldChange = (field: keyof PlaylistFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit(formData)
      setIsDirty(false)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const handleReset = () => {
    setFormData({
      name: playlist?.name || '',
      description: playlist?.description || '',
      isLooped: playlist?.isLooped || false,
      priority: playlist?.priority || 0,
      status: playlist?.status || 0
    })
    setIsDirty(false)
  }

  return (
    <div className={cn('space-y-8', className)}>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Info className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Basic Information</h3>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Playlist Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Enter playlist name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleFieldChange('status', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Draft</option>
                  <option value={1}>Active</option>
                  <option value={2}>Archived</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Enter playlist description (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Playback Settings */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Info className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Playback Settings</h3>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Priority (0-100)
                </label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => handleFieldChange('priority', parseInt(e.target.value) || 0)}
                  min="0"
                  max="100"
                  placeholder="0"
                />
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isLooped}
                    onChange={(e) => handleFieldChange('isLooped', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Loop playlist continuously
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || !isDirty}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {playlist ? 'Update Playlist' : 'Create Playlist'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default PlaylistForm