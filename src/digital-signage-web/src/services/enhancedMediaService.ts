/**
 * Enhanced Media Service
 * 
 * Service layer for Enhanced Media Upload with Variants system.
 * Integrates with backend API endpoints and provides TypeScript-safe methods.
 * 
 * @see copilot-instructions-ui.instructions.md - API Integration Rules
 * @see copilot-instructions-api.instructions.md - Enhanced Media Upload
 */

import { apiClient } from '@/lib/api'
import type {
  MediaDto,
  CreateUploadRequestDto,
  UploadRequestResponseDto,
  CompleteUploadDto,
  UploadStatusDto,
  DeviceOptimalMediaDto,
  MediaVariantDto,
  DeviceCapabilityDto,
  UpdateDeviceCapabilityDto,
  QuickAssignRequestDto,
  QuickAssignResponseDto,
  MediaFile,
  MediaSearchParams,
  MediaResponse,
  MediaStatsResponse
} from '@/types/media'

/**
 * Enhanced Media Service
 * Handles all media-related API calls including the new Enhanced Upload system
 */
export class EnhancedMediaService {
  // Enhanced Upload Operations
  
  /**
   * Create upload request for Enhanced Media Upload
   */
  static async createUploadRequest(request: CreateUploadRequestDto): Promise<UploadRequestResponseDto> {
    const response = await apiClient.post('/api/media/enhanced/create-upload-request', request)
    return response.data
  }

  /**
   * Complete upload after file has been uploaded to S3
   */
  static async completeUpload(request: CompleteUploadDto): Promise<UploadStatusDto> {
    const response = await apiClient.post('/api/media/enhanced/complete-upload', request)
    return response.data
  }

  /**
   * Get upload status and progress
   */
  static async getUploadStatus(uploadRequestId: string): Promise<UploadStatusDto> {
    const response = await apiClient.get(`/api/media/enhanced/upload-status/${uploadRequestId}`)
    return response.data
  }

  /**
   * Get optimal media variant for specific device
   */
  static async getOptimalMediaForDevice(mediaId: number, deviceId: number): Promise<DeviceOptimalMediaDto> {
    const response = await apiClient.get(`/api/media/enhanced/optimal/${mediaId}/device/${deviceId}`)
    return response.data
  }

  /**
   * Get all variants for a media item
   */
  static async getMediaVariants(mediaId: number): Promise<MediaVariantDto[]> {
    const response = await apiClient.get(`/api/media/enhanced/variants/${mediaId}`)
    return response.data
  }

  // Device Capability Operations

  /**
   * Get device capability
   */
  static async getDeviceCapability(deviceId: number): Promise<DeviceCapabilityDto | null> {
    try {
      const response = await apiClient.get(`/api/media/device-capability/${deviceId}`)
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  /**
   * Update device capability
   */
  static async updateDeviceCapability(deviceId: number, capability: UpdateDeviceCapabilityDto): Promise<DeviceCapabilityDto> {
    const response = await apiClient.put(`/api/media/device-capability/${deviceId}`, capability)
    return response.data
  }

  /**
   * Get all device capabilities
   */
  static async getAllDeviceCapabilities(): Promise<DeviceCapabilityDto[]> {
    const response = await apiClient.get('/api/media/device-capabilities')
    return response.data
  }

  // Quick Assignment Operations

  /**
   * Quick assign media to users/devices after upload
   */
  static async quickAssignMedia(mediaId: number, request: QuickAssignRequestDto): Promise<QuickAssignResponseDto> {
    const response = await apiClient.post(`/api/media/${mediaId}/quick-assign`, request)
    return response.data
  }

  // Standard Media Operations (for backward compatibility)

  /**
   * Get all media files
   */
  static async getAll(): Promise<MediaDto[]> {
    const response = await apiClient.get('/api/media')
    return response.data
  }

  /**
   * Get media by ID
   */
  static async getById(id: number): Promise<MediaDto> {
    const response = await apiClient.get(`/api/media/${id}`)
    return response.data
  }

  /**
   * Search media files
   */
  static async search(params: MediaSearchParams): Promise<MediaDto[]> {
    const response = await apiClient.get('/api/media/search', { params })
    return response.data
  }

  /**
   * Get media statistics
   */
  static async getStats(): Promise<MediaStatsResponse> {
    const response = await apiClient.get('/api/media/stats')
    return response.data
  }

  /**
   * Update media metadata
   */
  static async update(id: number, updates: Partial<MediaDto>): Promise<MediaDto> {
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
   * Get presigned URL for media access
   */
  static async getPresignedUrl(id: number, expirationMinutes?: number): Promise<string> {
    const response = await apiClient.get(`/api/media/${id}/presigned-url`, {
      params: expirationMinutes ? { expirationMinutes } : undefined
    })
    return response.data
  }

  /**
   * Check if media file exists
   */
  static async fileExists(id: number): Promise<boolean> {
    try {
      const response = await apiClient.get(`/api/media/${id}/exists`)
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false
      }
      throw error
    }
  }

  /**
   * Validate media file
   */
  static async validateMedia(id: number): Promise<boolean> {
    try {
      const response = await apiClient.get(`/api/media/${id}/validate`)
      return response.data
    } catch (error: any) {
      return false
    }
  }

  /**
   * Get validation errors for media
   */
  static async getValidationErrors(id: number): Promise<string[]> {
    try {
      const response = await apiClient.get(`/api/media/${id}/validation-errors`)
      return response.data
    } catch (error: any) {
      return ['Failed to get validation errors']
    }
  }

  // Legacy Upload Support (for backward compatibility)

  /**
   * Legacy upload method - creates presigned url and uploads directly
   */
  static async createUploadUrl(fileName: string, contentType: string, fileSize: number): Promise<{
    media: MediaDto
    uploadUrl: string
    formFields: Record<string, string>
  }> {
    const response = await apiClient.post('/api/media/upload-url', {
      fileName,
      contentType,
      fileSize
    })
    return response.data
  }

  /**
   * Process uploaded file after legacy upload
   */
  static async processUploadedFile(s3Key: string, fileName: string, contentType: string, fileSize: number): Promise<MediaDto> {
    const response = await apiClient.post('/api/media/process-upload', {
      s3Key,
      fileName,
      contentType,
      fileSize
    })
    return response.data
  }

  // Utility Methods

  /**
   * Convert MediaDto to legacy MediaFile format
   */
  static convertToLegacyFormat(media: MediaDto): MediaFile {
    const result: MediaFile = {
      id: media.id,
      name: media.name,
      fileName: media.fileName,
      filePath: media.s3Key,
      mediaType: media.type as 'Image' | 'Video' | 'Document',
      fileSize: media.fileSize,
      uploadedAt: media.createdAt,
      lastModified: media.updatedAt || media.createdAt,
      isActive: media.status !== 'Failed'
    }
    
    if (media.durationSeconds && media.durationSeconds > 0) {
      result.duration = media.durationSeconds
    }
    
    return result
  }

  /**
   * Get file type from content type
   */
  static getFileTypeFromContentType(contentType: string): 'image' | 'video' | 'audio' | 'document' {
    if (contentType.startsWith('image/')) return 'image'
    if (contentType.startsWith('video/')) return 'video'
    if (contentType.startsWith('audio/')) return 'audio'
    return 'document'
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  /**
   * Calculate upload progress percentage
   */
  static calculateProgress(status: string, uploadProgress: number, processingProgress: number): number {
    switch (status) {
      case 'pending':
        return 0
      case 'uploading':
        return Math.floor(uploadProgress * 0.3) // Upload is 30% of total
      case 'processing':
        return 30 + Math.floor(processingProgress * 0.7) // Processing is 70% of total
      case 'completed':
        return 100
      case 'error':
        return 0
      default:
        return 0
    }
  }
}

// Export for backward compatibility
export const MediaService = EnhancedMediaService