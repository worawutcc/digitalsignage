'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Music,
  Plus,
  Check,
  Loader2
} from 'lucide-react'
import { MediaService, type MediaFile } from '@/services/mediaService'

/**
 * Media item interface for internal component use
 */
interface MediaItem extends MediaFile {
  type: 'image' | 'video' | 'html' | 'audio'
  url: string
  thumbnailUrl?: string
  duration?: number
  sizeInBytes: number
  tags: string[]
}

/**
 * Props interface for MediaPicker component
 */
export interface MediaPickerProps {
  /** Array of selected media IDs */
  selectedMedia: number[]
  /** Callback when selection changes */
  onSelectionChange: (mediaIds: number[]) => void
  /** Media IDs to exclude from selection */
  excludeIds?: number[]
  /** Whether multiple selection is allowed */
  multiSelect?: boolean
  /** Whether to show filter controls */
  showFilters?: boolean
  /** Additional CSS classes */
  className?: string
}

const MEDIA_TYPES = [
  { value: 'all', label: 'All Media', icon: FileText },
  { value: 'image', label: 'Images', icon: ImageIcon },
  { value: 'video', label: 'Videos', icon: Video },
  { value: 'audio', label: 'Audio', icon: Music },
  { value: 'html', label: 'HTML', icon: FileText }
] as const

const VIEW_MODES = [
  { value: 'grid', icon: Grid },
  { value: 'list', icon: List }
] as const

/**
 * MediaPicker Component
 * 
 * A comprehensive media selection component with search, filtering, and grid/list views.
 * Supports single and multi-selection modes with thumbnails and metadata display.
 * 
 * @param selectedMedia - Array of currently selected media IDs
 * @param onSelectionChange - Callback when selection changes
 * @param excludeIds - Media IDs to exclude from selection
 * @param multiSelect - Whether multiple selection is allowed
 * @param showFilters - Whether to show filter controls
 * @param className - Additional CSS classes
 */
export const MediaPicker = memo(({
  selectedMedia,
  onSelectionChange,
  excludeIds = [],
  multiSelect = true,
  showFilters = true,
  className
}: MediaPickerProps) => {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'size'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Fetch media with filters
  const { 
    data: mediaData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['media', searchQuery, typeFilter, sortBy, sortOrder, page],
    queryFn: async (): Promise<MediaFile[]> => {
      try {
        if (searchQuery || typeFilter !== 'all') {
          const params: { searchTerm?: string; mediaType?: string; page?: number; pageSize?: number } = {
            page,
            pageSize: 20
          }
          
          if (searchQuery) {
            params.searchTerm = searchQuery
          }
          
          if (typeFilter !== 'all') {
            params.mediaType = typeFilter
          }
          
          return await MediaService.search(params)
        }
        return await MediaService.getAll()
      } catch (error) {
        console.error('❌ Failed to fetch media:', error)
        return []
      }
    },
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  })

  // Filter out excluded media and apply client-side filtering
  const availableMedia = useMemo((): MediaFile[] => {
    if (!mediaData) return []
    
    return mediaData.filter((media: MediaFile) => 
      !excludeIds.includes(media.id)
    )
  }, [mediaData, excludeIds])

  // Handle media selection
  const handleMediaClick = useCallback((mediaId: number) => {
    if (multiSelect) {
      const isSelected = selectedMedia.includes(mediaId)
      if (isSelected) {
        onSelectionChange(selectedMedia.filter(id => id !== mediaId))
      } else {
        onSelectionChange([...selectedMedia, mediaId])
      }
    } else {
      onSelectionChange([mediaId])
    }
  }, [multiSelect, selectedMedia, onSelectionChange])

  // Handle select all/none
  const handleSelectAll = useCallback(() => {
    if (selectedMedia.length === availableMedia.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(availableMedia.map((media: MediaFile) => media.id))
    }
  }, [selectedMedia.length, availableMedia, onSelectionChange])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [searchQuery, typeFilter, sortBy, sortOrder])

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Format duration
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return ''
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get media type icon
  const getMediaTypeIcon = useCallback((mediaType: string) => {
    if (!mediaType || typeof mediaType !== 'string') {
      return FileText
    }
    
    const type = mediaType.toLowerCase()
    switch (type) {
      case 'image': return ImageIcon
      case 'video': return Video
      case 'audio': return Music
      case 'document':
      case 'html': return FileText
      default: return FileText
    }
  }, [])

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Header with Search and Filters */}
      {showFilters && (
        <div className="p-4 border-b space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search media files..."
              className="pl-10"
            />
          </div>

          {/* Filters and Controls */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Media Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MEDIA_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Date Created</option>
                <option value="name">Name</option>
                <option value="size">File Size</option>
              </select>

              {/* Sort Order */}
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOrder === 'asc' ? '↑' : '↓'} {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Selection Controls */}
              {multiSelect && availableMedia.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedMedia.length === availableMedia.length ? 'None' : 'All'}
                </Button>
              )}

              {/* View Mode */}
              <div className="flex rounded-md border overflow-hidden">
                {VIEW_MODES.map((mode) => {
                  const Icon = mode.icon
                  return (
                    <button
                      key={mode.value}
                      onClick={() => setViewMode(mode.value)}
                      className={cn(
                        'p-2 hover:bg-gray-50 transition-colors',
                        viewMode === mode.value ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Selection Summary */}
          {selectedMedia.length > 0 && (
            <div className="flex items-center justify-between text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-md">
              <span>{selectedMedia.length} item{selectedMedia.length > 1 ? 's' : ''} selected</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectionChange([])}
              >
                Clear Selection
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading media...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-red-500 mb-2">
              <FileText className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Error loading media</p>
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        ) : availableMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-lg font-medium text-gray-900">No media found</p>
            <p className="text-gray-600">
              {searchQuery || typeFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Upload some media files to get started'
              }
            </p>
          </div>
        ) : (
          <div className="p-4">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {availableMedia.map((media: MediaFile) => {
                  const isSelected = selectedMedia.includes(media.id)
                  const MediaIcon = getMediaTypeIcon(media.mediaType)
                  
                  return (
                    <div
                      key={media.id}
                      onClick={() => handleMediaClick(media.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleMediaClick(media.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${isSelected ? 'Deselect' : 'Select'} ${media.name}`}
                      aria-pressed={isSelected}
                      className={cn(
                        'relative group cursor-pointer rounded-lg border-2 transition-all hover:shadow-md',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {/* Thumbnail */}
                      <div className="aspect-square rounded-t-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                        {media.thumbnailUrl ? (
                          <img
                            src={media.thumbnailUrl}
                            alt={media.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <MediaIcon className="h-8 w-8 text-gray-400" />
                        )}
                        
                        {/* Selection Indicator */}
                        <div className={cn(
                          'absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all',
                          isSelected 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white/80 text-gray-600 group-hover:bg-white'
                        )}>
                          {isSelected ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </div>

                        {/* Duration Badge */}
                        {media.duration && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {formatDuration(media.duration)}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-2">
                        <p className="text-sm font-medium text-gray-900 truncate" title={media.name}>
                          {media.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(media.fileSize)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {availableMedia.map((media: MediaFile) => {
                  const isSelected = selectedMedia.includes(media.id)
                  const MediaIcon = getMediaTypeIcon(media.mediaType)
                  
                  return (
                    <div
                      key={media.id}
                      onClick={() => handleMediaClick(media.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleMediaClick(media.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${isSelected ? 'Deselect' : 'Select'} ${media.name}`}
                      aria-pressed={isSelected}
                      className={cn(
                        'flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {media.thumbnailUrl ? (
                          <img
                            src={media.thumbnailUrl}
                            alt={media.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <MediaIcon className="h-6 w-6 text-gray-400" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{media.name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="capitalize">{media.mediaType?.toLowerCase?.() || 'unknown'}</span>
                          <span>{formatFileSize(media.fileSize)}</span>
                          {media.duration && (
                            <span>{formatDuration(media.duration)}</span>
                          )}
                        </div>
                        {media.tags && media.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {media.tags.slice(0, 3).map((tag: string) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {media.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{media.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Selection Indicator */}
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                        isSelected 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      )}>
                        {isSelected ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Load More Button */}
            {/* TODO: Add pagination support when API supports it */}
            {availableMedia.length >= 20 && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => setPage(prev => prev + 1)}
                  variant="outline"
                >
                  Load More Media
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
});

MediaPicker.displayName = 'MediaPicker';

export default MediaPicker;