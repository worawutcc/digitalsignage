import { apiClient } from '@/lib/api'
import type { QuickAssignRequest, QuickAssignResponse } from '@/types/quickAssign'

/**
 * Media type enum matching API MediaType
 */
export type MediaType = 'Image' | 'Video' | 'Html'

/**
 * Media DTO matching API MediaDto response
 */
export interface Media {
  id: number
  name: string
  fileName: string
  type: MediaType
  fileSize: number
  s3Key: string
  mimeType: string
  durationSeconds: number
  createdAt: string
  updatedAt?: string
  fileSizeFormatted: string
  typeDisplayName: string
}

/**
 * Request for uploading media
 */
export interface MediaUploadRequest {
  file: File
  name?: string
  durationSeconds?: number
  type?: MediaType
}

/**
 * Request for updating media metadata
 */
export interface MediaUpdateRequest {
  name?: string
  durationSeconds?: number
}

/**
 * Media statistics from API
 */
export interface MediaStatistics {
  totalFileSize: number
  totalFileSizeFormatted: string
  countByType: Record<string, number>
  totalFiles: number
}

/**
 * Media validation result
 */
export interface MediaValidation {
  mediaId: number
  isValid: boolean
  errors: string[]
}

/**
 * Media usage information (future feature)
 */
export interface MediaUsage {
  scheduleCount: number
  playlistCount: number
  deviceCount: number
  lastUsed?: string
}

/**
 * Bulk delete request (future feature)
 */
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
   * Upload new media file using presigned URL (PREFERRED METHOD)
   * This method uploads directly to S3 without going through the API server
   */
  async upload(request: MediaUploadRequest): Promise<Media> {
    // Step 1: Request presigned upload URL from backend
    const uploadUrlResponse = await this.createUploadUrl(
      request.file.name,
      request.file.type,
      request.file.size
    )

    // Step 2: Upload file directly to S3 using presigned URL
    // If this fails (CORS or network), fall back to server-side upload (legacy)
    try {
      await this.uploadToS3(uploadUrlResponse.uploadUrl, request.file)
    } catch (err) {
      // Log and fallback to server upload
      // Note: Browser CORS errors surface as network errors — fallback is required when S3/CloudFront CORS isn't configured.
      // Use the legacy server-side multipart upload as a reliable fallback.
      // eslint-disable-next-line no-console
      console.warn('Presigned S3 upload failed, falling back to server upload:', err)

      // Use uploadLegacy which posts the file to the API server and returns created Media
      const legacyResult = await this.uploadLegacy(request)
      return legacyResult
    }

    // Step 3: Update media metadata if provided
    if (request.name || request.durationSeconds !== undefined) {
      const updateRequest: MediaUpdateRequest = {}
      if (request.name) updateRequest.name = request.name
      if (request.durationSeconds !== undefined) updateRequest.durationSeconds = request.durationSeconds
      
      return await this.update(uploadUrlResponse.media.id.toString(), updateRequest)
    }

    return uploadUrlResponse.media
  }

  /**
   * Legacy upload method (uploads through API server)
   * Use upload() instead for better performance
   */
  async uploadLegacy(request: MediaUploadRequest): Promise<Media> {
    const formData = new FormData()
    formData.append('file', request.file)
    
    if (request.name) {
      formData.append('name', request.name)
    }
    
    if (request.durationSeconds !== undefined) {
      formData.append('durationSeconds', request.durationSeconds.toString())
    }
    
    if (request.type) {
      formData.append('type', request.type)
    }

    const response = await apiClient.post('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Create presigned upload URL for direct S3 upload
   */
  async createUploadUrl(fileName: string, contentType: string, fileSize: number): Promise<{
    media: Media
    uploadUrl: string
    formFields: Record<string, string>
  }> {
    const response = await apiClient.post('/api/media/upload-url', null, {
      params: {
        fileName,
        contentType,
        fileSize
      }
    })
    return response.data
  }

  /**
   * Upload file directly to S3 using presigned URL
   */
  async uploadToS3(presignedUrl: string, file: File): Promise<void> {
    // eslint-disable-next-line no-console
    console.log('[MediaApi] Uploading to S3:', {
      url: presignedUrl.substring(0, 100) + '...',
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type
    })

    const res = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      // eslint-disable-next-line no-console
      console.error('[MediaApi] S3 upload failed:', {
        status: res.status,
        statusText: res.statusText,
        body,
        headers: Object.fromEntries(res.headers.entries())
      })
      throw new Error(`S3 upload failed with status ${res.status}: ${body}`)
    }

    // eslint-disable-next-line no-console
    console.log('[MediaApi] S3 upload successful')
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

  /**
   * Get media files by type
   */
  async getByType(type: MediaType): Promise<Media[]> {
    const response = await apiClient.get(`/api/media/type/${type}`)
    return response.data
  }

  /**
   * Search media files by name or filename
   */
  async search(searchTerm: string): Promise<Media[]> {
    const response = await apiClient.get(`/api/media/search`, {
      params: { searchTerm }
    })
    return response.data
  }

  /**
   * Get media statistics
   */
  async getStatistics(): Promise<MediaStatistics> {
    const response = await apiClient.get('/api/media/statistics')
    return response.data
  }

  /**
   * Validate media file integrity
   */
  async validate(id: number): Promise<MediaValidation> {
    const response = await apiClient.get(`/api/media/${id}/validate`)
    return response.data
  }

  /**
   * Get presigned URL with custom expiration
   */
  async getPresignedUrlWithExpiry(id: number, expirationMinutes: number = 60): Promise<string> {
    const response = await apiClient.get(`/api/media/${id}/presigned-url`, {
      params: { expirationMinutes }
    })
    return response.data
  }

  /**
   * Quick assign media to users/devices after upload
   */
  async quickAssign(mediaId: number, request: QuickAssignRequest): Promise<QuickAssignResponse> {
    const response = await apiClient.post(`/api/media/${mediaId}/quick-assign`, request)
    return response.data
  }
}

export const mediaApi = new MediaApi()