import { apiClient } from '@/lib/api'

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

/**
 * Media service for API integration
 * Handles all media-related API calls
 */
export class MediaService {
  /**
   * Get all media files
   */
  static async getAll(): Promise<MediaFile[]> {
    const response = await apiClient.get('/api/media')
    return response.data
  }

  /**
   * Get media by ID
   */
  static async getById(id: number): Promise<MediaFile> {
    const response = await apiClient.get(`/api/media/${id}`)
    return response.data
  }

  /**
   * Search media files
   */
  static async search(params: MediaSearchParams): Promise<MediaFile[]> {
    const response = await apiClient.get('/api/media/search', { params })
    return response.data
  }

  /**
   * Get media by type
   */
  static async getByType(mediaType: string): Promise<MediaFile[]> {
    const response = await apiClient.get(`/api/media/type/${mediaType}`)
    return response.data
  }

  /**
   * Upload media file
   */
  static async upload(uploadData: MediaUploadRequest): Promise<MediaFile> {
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
    const response = await apiClient.put(`/api/media/${id}`, updates)
    return response.data
  }

  /**
   * Delete media file
   */
  static async delete(id: number): Promise<void> {
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
    const response = await apiClient.get(`/api/media/${id}/usage`)
    return response.data
  }
}