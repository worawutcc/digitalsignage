import { apiClient } from '@/lib/api'
import { MediaItem, MockMediaService, USE_MOCK_MEDIA_SERVICE } from './mockMediaService'

// Legacy interface (keep for backward compatibility)
export interface MediaFile {
  id: number
  name: string
  fileName: string
  filePath: string
  mediaType: 'Image' | 'Video' | 'Document'
  fileSize: number
  uploadedAt: string
  lastModified: string
  isActive: boolean
  tags?: string[]
  thumbnailUrl?: string
  duration?: number
}

export interface MediaUploadRequest {
  file: File
  name?: string
  tags?: string[]
}

export interface MediaSearchParams {
  searchTerm?: string
  mediaType?: string
  tags?: string[]
  page?: number
  pageSize?: number
}

export interface MediaResponse {
  data: MediaFile[]
  total: number
}

export interface MediaStatsResponse {
  totalFiles: number
  totalSize: number
  byType: Record<string, number>
}

/**
 * Convert MediaItem to MediaFile format
 */
function convertToMediaFile(item: MediaItem): MediaFile {
  return {
    id: parseInt(item.id),
    name: item.name,
    fileName: item.name,
    filePath: item.url,
    mediaType: item.type === 'image' ? 'Image' : 
               item.type === 'video' ? 'Video' : 'Document',
    fileSize: item.size,
    uploadedAt: item.createdAt,
    lastModified: item.updatedAt,
    isActive: item.status === 'active',
    ...(item.tags && { tags: item.tags }),
    ...(item.thumbnailUrl && { thumbnailUrl: item.thumbnailUrl }),
    ...(item.duration && { duration: item.duration })
  }
}

/**
 * Media service for API integration
 * Handles all media-related API calls
 */
export class MediaService {
  /**
   * Get all media files
   */
  static async getAll(): Promise<MediaFile[]> {
    if (USE_MOCK_MEDIA_SERVICE || process.env.NODE_ENV === 'development') {
      const items = await MockMediaService.getAll()
      return items.map(convertToMediaFile)
    }
    
    const response = await apiClient.get('/api/media')
    return response.data
  }

  /**
   * Get media by ID
   */
  static async getById(id: number): Promise<MediaFile> {
    if (USE_MOCK_MEDIA_SERVICE || process.env.NODE_ENV === 'development') {
      const item = await MockMediaService.getById(id.toString())
      return convertToMediaFile(item)
    }
    
    const response = await apiClient.get(`/api/media/${id}`)
    return response.data
  }

  /**
   * Search media files
   */
  static async search(params: MediaSearchParams): Promise<MediaFile[]> {
    if (USE_MOCK_MEDIA_SERVICE || process.env.NODE_ENV === 'development') {
      const items = await MockMediaService.search(params.searchTerm || '')
      return items.map(convertToMediaFile)
    }
    
    const response = await apiClient.get('/api/media/search', { params })
    return response.data
  }

  /**
   * Get media by type
   */
  static async getByType(mediaType: string): Promise<MediaFile[]> {
    if (USE_MOCK_MEDIA_SERVICE || process.env.NODE_ENV === 'development') {
      const type = mediaType.toLowerCase() as 'image' | 'video' | 'audio' | 'text'
      const items = await MockMediaService.getByType(type)
      return items.map(convertToMediaFile)
    }
    
    const response = await apiClient.get(`/api/media/type/${mediaType}`)
    return response.data
  }

  /**
   * Upload media file
   */
  static async upload(uploadData: MediaUploadRequest): Promise<MediaFile> {
    if (USE_MOCK_MEDIA_SERVICE || process.env.NODE_ENV === 'development') {
      const item = await MockMediaService.upload(uploadData.file)
      return convertToMediaFile(item)
    }
    
    const formData = new FormData()
    formData.append('file', uploadData.file)
    if (uploadData.name) {
      formData.append('name', uploadData.name)
    }
    if (uploadData.tags) {
      uploadData.tags.forEach(tag => formData.append('tags', tag))
    }

    const response = await apiClient.post('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  /**
   * Update media file
   */
  static async update(id: number, updates: Partial<MediaFile>): Promise<MediaFile> {
    if (USE_MOCK_MEDIA_SERVICE || process.env.NODE_ENV === 'development') {
      const updateData: Partial<MediaItem> = {}
      
      const nameUpdate = updates.fileName || updates.name
      if (nameUpdate) {
        updateData.name = nameUpdate
      }
      if (updates.fileSize !== undefined) {
        updateData.size = updates.fileSize
      }
      if (updates.tags) {
        updateData.tags = updates.tags
      }
      if (updates.isActive !== undefined) {
        updateData.status = updates.isActive ? 'active' : 'error'
      }
      
      const item = await MockMediaService.update(id.toString(), updateData)
      return convertToMediaFile(item)
    }
    
    const response = await apiClient.put(`/api/media/${id}`, updates)
    return response.data
  }

  /**
   * Delete media file
   */
  static async delete(id: number): Promise<void> {
    if (USE_MOCK_MEDIA_SERVICE || process.env.NODE_ENV === 'development') {
      await MockMediaService.delete(id.toString())
      return
    }
    
    await apiClient.delete(`/api/media/${id}`)
  }

  /**
   * Bulk delete media files
   */
  static async bulkDelete(ids: number[]): Promise<void> {
    await apiClient.post('/api/media/bulk-delete', { ids })
  }

  /**
   * Add tags to media file
   */
  static async addTags(id: number, tags: string[]): Promise<MediaFile> {
    const response = await apiClient.post(`/api/media/${id}/tags`, { tags })
    return response.data
  }

  /**
   * Remove tags from media file
   */
  static async removeTags(id: number, tags: string[]): Promise<MediaFile> {
    const response = await apiClient.delete(`/api/media/${id}/tags`, { data: { tags } })
    return response.data
  }

  /**
   * Get media usage statistics
   */
  static async getUsageStats(id: number): Promise<{
    scheduleCount: number
    activeSchedules: string[]
    lastUsed: string
    totalViews: number
  }> {
    if (USE_MOCK_MEDIA_SERVICE || process.env.NODE_ENV === 'development') {
      // Mock usage stats
      return {
        scheduleCount: Math.floor(Math.random() * 5),
        activeSchedules: ['Schedule 1', 'Schedule 2'],
        lastUsed: new Date().toISOString(),
        totalViews: Math.floor(Math.random() * 1000)
      }
    }
    
    const response = await apiClient.get(`/api/media/${id}/usage`)
    return response.data
  }

  /**
   * Get media statistics
   */
  static async getStats(): Promise<MediaStatsResponse> {
    if (USE_MOCK_MEDIA_SERVICE || process.env.NODE_ENV === 'development') {
      return MockMediaService.getStats()
    }
    
    const response = await apiClient.get('/api/media/stats')
    return response.data
  }
}