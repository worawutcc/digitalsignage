/**
 * Playlist Item Builder Component
 * Component for adding and managing media items in playlists
 * with drag-and-drop ordering, duration settings, and transitions
 * Follows copilot-instructions-ui.instructions.md patterns
 */

'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Plus,
  Trash2,
  GripVertical,
  Clock,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Play,
  Settings,
  ChevronDown,
  ChevronUp,
  Search,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MediaService, MediaFile } from '@/services/mediaService'
import { MediaType } from '@/types/media'
import {
  PlaylistItemDto,
  CreatePlaylistItemRequest,
  TransitionEffect
} from '@/features/playlists/types'

/**
 * Props for PlaylistItemBuilder component
 */
export interface PlaylistItemBuilderProps {
  /** Existing playlist items to edit */
  items: PlaylistItemDto[]
  
  /** Callback when items change */
  onItemsChange: (items: PlaylistItemDto[]) => void
  
  /** Callback when new item is added */
  onAddItem?: (request: CreatePlaylistItemRequest) => void
  
  /** Callback when item is removed */
  onRemoveItem?: (itemId: number) => void
  
  /** Optional className */
  className?: string
  
  /** Read-only mode */
  readOnly?: boolean
}

/**
 * Get icon for media type
 */
const getMediaIcon = (mediaType: MediaType) => {
  const iconClass = "h-5 w-5"
  
  switch (mediaType) {
    case MediaType.Image:
      return <ImageIcon className={iconClass} />
    case MediaType.Video:
      return <Video className={iconClass} />
    case MediaType.Audio:
      return <Music className={iconClass} />
    default:
      return <FileText className={iconClass} />
  }
}

/**
 * Format duration seconds to readable string
 */
const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}m ${secs}s`
}

/**
 * Get transition effect label
 */
const getTransitionLabel = (effect: TransitionEffect): string => {
  return TransitionEffect[effect] || 'Cut'
}

/**
 * Playlist Item Builder Component
 */
export function PlaylistItemBuilder({
  items,
  onItemsChange,
  onAddItem,
  onRemoveItem,
  className = '',
  readOnly = false
}: PlaylistItemBuilderProps) {
  const [showMediaSelector, setShowMediaSelector] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Fetch available media
  const { data: mediaList = [], isLoading, error } = useQuery({
    queryKey: ['media-all'],
    queryFn: () => MediaService.getAll(),
    enabled: showMediaSelector
  })

  // Filter media
  const filteredMedia = (mediaList as MediaFile[]).filter((media: MediaFile) =>
    searchTerm === '' ||
    media.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    media.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Toggle item expansion
  const toggleExpanded = (itemId: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  // Add media to playlist
  const handleAddMedia = (media: MediaFile) => {
    // Convert MediaFile mediaType to MediaType enum
    const mediaType = media.mediaType === 'Image' ? MediaType.Image :
                     media.mediaType === 'Video' ? MediaType.Video :
                     MediaType.Document
    
    const newItem: PlaylistItemDto = {
      id: Date.now(), // Temporary ID
      playlistId: 0, // Will be set by parent
      mediaId: media.id,
      mediaName: media.name,
      mediaFileName: media.fileName,
      mediaType: mediaType,
      orderIndex: items.length,
      durationSeconds: media.duration || 10,
      useCustomDuration: false,
      transitionEffect: TransitionEffect.Fade,
      transitionDurationMs: 500,
      isConditional: false,
      startTime: null,
      endTime: null
    }

    onItemsChange([...items, newItem])
    setShowMediaSelector(false)
    
    if (onAddItem) {
      const request: CreatePlaylistItemRequest = {
        mediaId: media.id,
        orderIndex: items.length,
        durationSeconds: newItem.durationSeconds,
        useCustomDuration: false,
        transitionEffect: TransitionEffect.Fade,
        transitionDurationMs: 500
      }
      onAddItem(request)
    }
  }

  // Remove item
  const handleRemoveItem = (index: number) => {
    const item = items[index]
    const newItems = items.filter((_, i) => i !== index)
    // Re-index items
    newItems.forEach((item, i) => {
      item.orderIndex = i
    })
    onItemsChange(newItems)
    
    if (onRemoveItem && item && item.id > 0) {
      onRemoveItem(item.id)
    }
  }

  // Update item property
  const handleUpdateItem = (index: number, updates: Partial<PlaylistItemDto>) => {
    const newItems = [...items]
    const currentItem = newItems[index]
    if (currentItem) {
      newItems[index] = { ...currentItem, ...updates }
      onItemsChange(newItems)
    }
  }

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newItems = [...items]
    const draggedItem = newItems[draggedIndex]
    if (!draggedItem) return
    
    newItems.splice(draggedIndex, 1)
    newItems.splice(index, 0, draggedItem)

    // Re-index
    newItems.forEach((item, i) => {
      item.orderIndex = i
    })

    setDraggedIndex(index)
    onItemsChange(newItems)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Playlist Items
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {items.length} {items.length === 1 ? 'item' : 'items'} • Total duration: {formatDuration(
              items.reduce((sum, item) => sum + item.durationSeconds, 0)
            )}
          </p>
        </div>
        {!readOnly && (
          <Button onClick={() => setShowMediaSelector(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Media
          </Button>
        )}
      </div>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No items yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Add media files to build your playlist
          </p>
          {!readOnly && (
            <Button onClick={() => setShowMediaSelector(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable={!readOnly}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                bg-white dark:bg-gray-800 border rounded-lg overflow-hidden
                ${draggedIndex === index ? 'opacity-50' : ''}
                ${!readOnly ? 'cursor-move hover:shadow-md transition-shadow' : ''}
              `}
            >
              {/* Item Header */}
              <div className="flex items-center gap-3 p-4">
                {/* Drag Handle */}
                {!readOnly && (
                  <div className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-5 w-5" />
                  </div>
                )}

                {/* Order Index */}
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>

                {/* Media Icon */}
                <div className="flex-shrink-0 text-gray-600 dark:text-gray-400">
                  {getMediaIcon(item.mediaType)}
                </div>

                {/* Item Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {item.mediaName}
                  </h4>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(item.durationSeconds)}
                    </span>
                    <span>
                      {getTransitionLabel(item.transitionEffect)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(item.id)}
                  >
                    {expandedItems.has(item.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Expanded Settings */}
              {expandedItems.has(item.id) && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Duration (seconds)
                      </label>
                      <Input
                        type="number"
                        value={item.durationSeconds}
                        onChange={(e) => handleUpdateItem(index, {
                          durationSeconds: parseInt(e.target.value) || 0,
                          useCustomDuration: true
                        })}
                        disabled={readOnly}
                        min="1"
                      />
                    </div>

                    {/* Transition Effect */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Transition Effect
                      </label>
                      <select
                        value={item.transitionEffect}
                        onChange={(e) => handleUpdateItem(index, {
                          transitionEffect: parseInt(e.target.value) as TransitionEffect
                        })}
                        disabled={readOnly}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value={TransitionEffect.Cut}>Cut</option>
                        <option value={TransitionEffect.Fade}>Fade</option>
                        <option value={TransitionEffect.Slide}>Slide</option>
                        <option value={TransitionEffect.Zoom}>Zoom</option>
                        <option value={TransitionEffect.Wipe}>Wipe</option>
                        <option value={TransitionEffect.Push}>Push</option>
                        <option value={TransitionEffect.Reveal}>Reveal</option>
                        <option value={TransitionEffect.Dissolve}>Dissolve</option>
                      </select>
                    </div>

                    {/* Transition Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Transition Duration (ms)
                      </label>
                      <Input
                        type="number"
                        value={item.transitionDurationMs}
                        onChange={(e) => handleUpdateItem(index, {
                          transitionDurationMs: parseInt(e.target.value) || 0
                        })}
                        disabled={readOnly}
                        min="0"
                        step="100"
                      />
                    </div>

                    {/* Conditional Time */}
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <input
                          type="checkbox"
                          checked={item.isConditional}
                          onChange={(e) => handleUpdateItem(index, {
                            isConditional: e.target.checked
                          })}
                          disabled={readOnly}
                          className="rounded"
                        />
                        <span>Time Conditional</span>
                      </label>
                      {item.isConditional && (
                        <div className="flex gap-2">
                          <Input
                            type="time"
                            value={item.startTime || ''}
                            onChange={(e) => handleUpdateItem(index, {
                              startTime: e.target.value
                            })}
                            disabled={readOnly}
                            placeholder="Start"
                          />
                          <Input
                            type="time"
                            value={item.endTime || ''}
                            onChange={(e) => handleUpdateItem(index, {
                              endTime: e.target.value
                            })}
                            disabled={readOnly}
                            placeholder="End"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span>File: {item.mediaFileName}</span>
                      <span>Type: {item.mediaType}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Media Selector Modal */}
      {showMediaSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Select Media
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMediaSelector(false)}
                >
                  ×
                </Button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search media..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading && (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              )}

              {error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Error loading media
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {error instanceof Error ? error.message : 'An error occurred'}
                    </p>
                  </div>
                </div>
              ) : null}

              {!isLoading && !error && filteredMedia.length === 0 && (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No media found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'Try a different search term' : 'Upload media files first'}
                  </p>
                </div>
              )}

              {!isLoading && !error && filteredMedia.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMedia.map((media) => {
                    const mediaType = media.mediaType === 'Image' ? MediaType.Image :
                                     media.mediaType === 'Video' ? MediaType.Video :
                                     MediaType.Document
                    
                    return (
                      <div
                        key={media.id}
                        onClick={() => handleAddMedia(media)}
                        className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-gray-600 dark:text-gray-400">
                            {getMediaIcon(mediaType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {media.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {media.fileName}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>{media.mediaType}</span>
                              {media.duration && media.duration > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{formatDuration(media.duration)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlaylistItemBuilder
