/**
 * Optimized Content Service - API integration for device-specific content optimization
 * 
 * Provides functionality for content optimization, variant management,
 * and device-specific content delivery with performance optimization.
 * 
 * @see copilot-instructions-ui.md - API Integration Rules
 */

import { apiClient } from '@/lib/api'

/**
 * Media quality levels
 */
export type MediaQuality = 'auto' | 'low' | 'medium' | 'high' | 'ultra'

/**
 * Media optimization status
 */
export type OptimizationStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled'

/**
 * Optimized content item
 */
export interface OptimizedContentItemDto {
  mediaId: number
  originalUrl: string
  optimizedUrl: string
  mediaType: 'image' | 'video' | 'audio' | 'document'
  quality: string
  fileSize: number
  resolution: string
  codec?: string
  bitrate?: number
  duration?: number
  optimizedAt: string
  cacheExpiry: string
  compressionRatio?: number
  optimizationMethod: string
  metadata: Record<string, any>
}

/**
 * Media variant information
 */
export interface MediaVariantDto {
  id: number
  mediaId: number
  quality: MediaQuality
  resolution: string
  fileSize: number
  url: string
  codec?: string
  bitrate?: number
  format: string
  isOptimized: boolean
  targetDeviceTypes: string[]
  generatedAt: string
  lastAccessed?: string
  accessCount: number
}

/**
 * Media variant generation result
 */
export interface MediaVariantGenerationResultDto {
  jobId: string
  mediaId: number
  status: OptimizationStatus
  targetQualities: MediaQuality[]
  estimatedCompletionTime: string
  variants: MediaVariantDto[]
  progress: number
  message: string
  startedAt: string
  completedAt?: string
  errorMessage?: string
}

/**
 * Content optimization request
 */
export interface ContentOptimizationRequestDto {
  mediaId: number
  targetDeviceIds?: number[]
  qualities?: MediaQuality[]
  forceRegeneration?: boolean
  preserveOriginal?: boolean
  compressionLevel?: number
  customSettings?: Record<string, any>
}

/**
 * Bulk content optimization request
 */
export interface BulkContentOptimizationRequestDto {
  mediaIds: number[]
  targetDeviceIds?: number[]
  qualities?: MediaQuality[]
  forceRegeneration?: boolean
  preserveOriginal?: boolean
  compressionLevel?: number
  batchSize?: number
  priority?: 'Low' | 'Normal' | 'High'
}

/**
 * Content optimization job
 */
export interface ContentOptimizationJobDto {
  jobId: string
  mediaIds: number[]
  status: OptimizationStatus
  progress: number
  totalItems: number
  processedItems: number
  failedItems: number
  startedAt: string
  estimatedCompletionTime?: string
  completedAt?: string
  errorMessage?: string
  results: MediaVariantGenerationResultDto[]
}

/**
 * Content delivery statistics
 */
export interface ContentDeliveryStatsDto {
  totalRequests: number
  optimizedDeliveries: number
  originalDeliveries: number
  averageLoadTime: number
  bandwidthSaved: number
  compressionRatio: number
  cacheHitRate: number
  topRequestedContent: Array<{
    mediaId: number
    mediaName: string
    requestCount: number
    deliverySize: number
  }>
  deviceTypeBreakdown: Record<string, {
    requests: number
    avgLoadTime: number
    preferredQuality: string
  }>
  lastUpdated: string
}

/**
 * Content cache information
 */
export interface ContentCacheInfoDto {
  mediaId: number
  variants: Array<{
    quality: string
    cached: boolean
    cacheExpiry?: string
    lastAccessed?: string
    hitCount: number
  }>
  totalCacheSize: number
  cacheEfficiency: number
}

/**
 * Device content preferences
 */
export interface DeviceContentPreferencesDto {
  deviceId: number
  preferredQuality: MediaQuality
  maxFileSize: number
  supportedFormats: string[]
  networkCapability: 'Low' | 'Medium' | 'High'
  storageCapability: 'Low' | 'Medium' | 'High'
  processingCapability: 'Low' | 'Medium' | 'High'
  autoOptimize: boolean
  cacheEnabled: boolean
  lastUpdated: string
}

/**
 * Optimized content service
 * Handles content optimization and delivery management
 */
export class OptimizedContentService {
  private readonly basePath = '/api/optimized-content'

  /**
   * Get optimized content for specific device
   */
  async getOptimizedContentForDevice(
    deviceId: number,
    mediaIds?: number[],
    preferredQuality: string = 'auto'
  ): Promise<OptimizedContentItemDto[]> {
    const params = new URLSearchParams({
      preferredQuality: preferredQuality,
    })

    if (mediaIds?.length) {
      mediaIds.forEach(id => params.append('mediaIds', id.toString()))
    }

    const response = await apiClient.get<OptimizedContentItemDto[]>(
      `${this.basePath}/device/${deviceId}?${params.toString()}`
    )
    return response.data
  }

  /**
   * Generate media variants for specific content
   */
  async generateMediaVariants(
    mediaId: number,
    targetDeviceIds?: number[]
  ): Promise<MediaVariantGenerationResultDto> {
    const params = new URLSearchParams()
    if (targetDeviceIds?.length) {
      targetDeviceIds.forEach(id => params.append('targetDeviceIds', id.toString()))
    }

    const response = await apiClient.post<MediaVariantGenerationResultDto>(
      `${this.basePath}/variants/generate/${mediaId}?${params.toString()}`
    )
    return response.data
  }

  /**
   * Get media variants for content
   */
  async getMediaVariants(mediaId: number): Promise<MediaVariantDto[]> {
    const response = await apiClient.get<MediaVariantDto[]>(`${this.basePath}/variants/${mediaId}`)
    return response.data
  }

  /**
   * Delete specific media variant
   */
  async deleteMediaVariant(variantId: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/variants/${variantId}`)
  }

  /**
   * Optimize content for specific requirements
   */
  async optimizeContent(request: ContentOptimizationRequestDto): Promise<ContentOptimizationJobDto> {
    const response = await apiClient.post<ContentOptimizationJobDto>(`${this.basePath}/optimize`, request)
    return response.data
  }

  /**
   * Bulk optimize multiple content items
   */
  async bulkOptimizeContent(request: BulkContentOptimizationRequestDto): Promise<ContentOptimizationJobDto> {
    const response = await apiClient.post<ContentOptimizationJobDto>(`${this.basePath}/optimize/bulk`, request)
    return response.data
  }

  /**
   * Get optimization job status
   */
  async getOptimizationJobStatus(jobId: string): Promise<ContentOptimizationJobDto> {
    const response = await apiClient.get<ContentOptimizationJobDto>(`${this.basePath}/jobs/${jobId}`)
    return response.data
  }

  /**
   * Cancel optimization job
   */
  async cancelOptimizationJob(jobId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/jobs/${jobId}/cancel`)
  }

  /**
   * Get content delivery statistics
   */
  async getContentDeliveryStats(
    fromDate?: string,
    toDate?: string,
    deviceId?: number
  ): Promise<ContentDeliveryStatsDto> {
    const params = new URLSearchParams()
    if (fromDate) params.append('fromDate', fromDate)
    if (toDate) params.append('toDate', toDate)
    if (deviceId) params.append('deviceId', deviceId.toString())

    const response = await apiClient.get<ContentDeliveryStatsDto>(
      `${this.basePath}/stats?${params.toString()}`
    )
    return response.data
  }

  /**
   * Get content cache information
   */
  async getContentCacheInfo(mediaId: number): Promise<ContentCacheInfoDto> {
    const response = await apiClient.get<ContentCacheInfoDto>(`${this.basePath}/cache/${mediaId}`)
    return response.data
  }

  /**
   * Clear content cache
   */
  async clearContentCache(mediaId?: number): Promise<void> {
    const url = mediaId ? `${this.basePath}/cache/${mediaId}` : `${this.basePath}/cache`
    await apiClient.delete(url)
  }

  /**
   * Preload content for device
   */
  async preloadContentForDevice(deviceId: number, mediaIds: number[]): Promise<void> {
    await apiClient.post(`${this.basePath}/preload/device/${deviceId}`, { mediaIds })
  }

  /**
   * Get device content preferences
   */
  async getDeviceContentPreferences(deviceId: number): Promise<DeviceContentPreferencesDto> {
    const response = await apiClient.get<DeviceContentPreferencesDto>(`${this.basePath}/preferences/device/${deviceId}`)
    return response.data
  }

  /**
   * Update device content preferences
   */
  async updateDeviceContentPreferences(
    deviceId: number,
    preferences: Partial<DeviceContentPreferencesDto>
  ): Promise<DeviceContentPreferencesDto> {
    const response = await apiClient.put<DeviceContentPreferencesDto>(
      `${this.basePath}/preferences/device/${deviceId}`,
      preferences
    )
    return response.data
  }

  /**
   * Get optimization queue status
   */
  async getOptimizationQueueStatus(): Promise<{
    queueLength: number
    processingJobs: number
    averageWaitTime: number
    estimatedCompletionTime?: string
  }> {
    const response = await apiClient.get(`${this.basePath}/queue/status`)
    return response.data
  }

  /**
   * Purge optimization queue
   */
  async purgeOptimizationQueue(): Promise<void> {
    await apiClient.post(`${this.basePath}/queue/purge`)
  }

  /**
   * Test content optimization
   */
  async testContentOptimization(
    mediaId: number,
    quality: MediaQuality
  ): Promise<{
    originalSize: number
    optimizedSize: number
    compressionRatio: number
    estimatedTime: number
    preview: string
  }> {
    const response = await apiClient.post(`${this.basePath}/test-optimization`, {
      mediaId,
      quality
    })
    return response.data
  }

  /**
   * Get supported optimization formats
   */
  async getSupportedFormats(): Promise<{
    input: string[]
    output: string[]
    codecs: Record<string, string[]>
  }> {
    const response = await apiClient.get(`${this.basePath}/supported-formats`)
    return response.data
  }
}

// Export singleton instance
export const optimizedContentService = new OptimizedContentService()

// Export class for dependency injection
export default OptimizedContentService