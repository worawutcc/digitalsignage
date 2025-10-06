import { apiClient } from '@/lib/api'

export interface Media {
  id: number
  name: string
  fileName: string
  type: 'Image' | 'Video' | 'Html'
  fileSize: number
  s3Key: string
  mimeType: string
  durationSeconds: number
  createdAt: string
  updatedAt?: string
  fileSizeFormatted: string
  typeDisplayName: string
}

export interface MediaUploadRequest {
  file: File
  name?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface MediaUpdateRequest {
  name?: string
  tags?: string[]
  metadata?: Record<string, any>
  isActive?: boolean
}

export interface MediaUsage {
  scheduleCount: number
  playlistCount: number
  deviceCount: number
  lastUsed?: string
}

export interface BulkDeleteRequest {
  mediaIds: string[]
}

export class MediaApi {
  /**
   * Get all media files
   */
  async getAll(): Promise<Media[]> {
    const response = await apiClient.get('/api/media')
    return response.data
  }

  /**
   * Get all media files with pagination and filtering
   */
  async getMediaFiles(params?: {
    page?: number
    pageSize?: number
    search?: string
    mimeType?: string
    uploadedBy?: string
  }): Promise<Media[]> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.mimeType) queryParams.append('mimeType', params.mimeType)
    if (params?.uploadedBy) queryParams.append('uploadedBy', params.uploadedBy)

    const response = await apiClient.get(`/api/media?${queryParams.toString()}`)
    return response.data
  }

  /**
   * Get media by ID
   */
  async getById(id: string): Promise<Media> {
    const response = await apiClient.get(`/api/media/${id}`)
    return response.data
  }

  /**
   * Get media file by ID (alias for getById)
   */
  async getMediaFile(id: string): Promise<Media> {
    return this.getById(id)
  }

  /**
   * Upload new media file
   */
  async upload(request: MediaUploadRequest): Promise<Media> {
    const formData = new FormData()
    formData.append('file', request.file)
    
    if (request.name) {
      formData.append('name', request.name)
    }
    
    if (request.tags) {
      formData.append('tags', JSON.stringify(request.tags))
    }
    
    if (request.metadata) {
      formData.append('metadata', JSON.stringify(request.metadata))
    }

    const response = await apiClient.post('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Initiate media upload process
   */
  async initiateUpload(request: MediaUploadRequest): Promise<{ id: string; uploadUrl: string }> {
    const formData = new FormData()
    formData.append('file', request.file)
    
    if (request.name) {
      formData.append('name', request.name)
    }

    const response = await apiClient.post('/api/media/initiate-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Complete media upload
   */
  async uploadComplete(id: string): Promise<Media> {
    const response = await apiClient.post(`/api/media/${id}/upload-complete`)
    return response.data
  }

  /**
   * Confirm media upload completion
   */
  async confirmUpload(id: string): Promise<Media> {
    return this.uploadComplete(id)
  }

  /**
   * Get presigned URL for media access
   */
  async getPresignedUrl(id: string): Promise<{ url: string; expiresAt: string }> {
    const response = await apiClient.get(`/api/media/${id}/presigned-url`)
    return response.data
  }

  /**
   * Update media
   */
  async update(id: string, request: MediaUpdateRequest): Promise<Media> {
    const response = await apiClient.put(`/api/media/${id}`, request)
    return response.data
  }

  /**
   * Update media (alias for update)
   */
  async updateMedia(id: string, request: MediaUpdateRequest): Promise<Media> {
    return this.update(id, request)
  }

  /**
   * Delete media
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/media/${id}`)
  }

  /**
   * Delete media (alias for delete)
   */
  async deleteMedia(id: string): Promise<void> {
    return this.delete(id)
  }

  /**
   * Get media usage information
   */
  async getUsage(id: string): Promise<MediaUsage> {
    const response = await apiClient.get(`/api/media/${id}/usage`)
    return response.data
  }

  /**
   * Get media usage (alias for getUsage)
   */
  async getMediaUsage(id: string): Promise<MediaUsage> {
    return this.getUsage(id)
  }

  /**
   * Bulk delete media files
   */
  async bulkDelete(request: BulkDeleteRequest): Promise<void> {
    await apiClient.post('/api/media/bulk-delete', request)
  }

  /**
   * Bulk delete media files (alias for bulkDelete)
   */
  async bulkDeleteMedia(mediaIds: string[]): Promise<void> {
    return this.bulkDelete({ mediaIds })
  }
}

export const mediaApi = new MediaApi()