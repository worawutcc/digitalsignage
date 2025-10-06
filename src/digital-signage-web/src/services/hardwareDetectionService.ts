/**
 * Hardware Detection Service - API integration for hardware detection management
 * 
 * Provides admin functionality for monitoring and managing hardware detection jobs,
 * including device hardware profiling and detection workflows.
 * 
 * @see copilot-instructions-ui.md - API Integration Rules
 */

import { apiClient } from '@/lib/api'

/**
 * Hardware detection job status
 */
export type HardwareDetectionStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled'

/**
 * Hardware detection job information
 */
export interface HardwareDetectionJobDto {
  jobId: string
  deviceId: number
  deviceName: string
  status: HardwareDetectionStatus
  progress: number
  startedAt: string
  completedAt?: string
  errorMessage?: string
  detectedHardware?: HardwareInfo
  executionTimeMs?: number
  retryCount: number
  maxRetries: number
  createdBy: number
  createdAt: string
  updatedAt: string
}

/**
 * Detailed hardware detection job information
 */
export interface HardwareDetectionJobDetailDto extends HardwareDetectionJobDto {
  executionLog: string[]
  detectionResults: HardwareDetectionResult[]
  systemInfo: SystemInformation
  networkInfo: NetworkInformation
}

/**
 * Hardware information detected from device
 */
export interface HardwareInfo {
  processor: {
    model: string
    cores: number
    architecture: string
    frequency: number
  }
  memory: {
    totalRam: number
    availableRam: number
    ramType: string
  }
  storage: {
    totalStorage: number
    availableStorage: number
    storageType: string
  }
  display: {
    resolution: string
    screenSize: number
    supportedFormats: string[]
  }
  network: {
    wifiCapable: boolean
    ethernetCapable: boolean
    bluetoothCapable: boolean
    macAddress: string
  }
  operatingSystem: {
    name: string
    version: string
    buildNumber: string
    apiLevel?: number
  }
}

/**
 * Hardware detection result
 */
export interface HardwareDetectionResult {
  component: string
  status: 'Success' | 'Failed' | 'Warning'
  details: Record<string, any>
  timestamp: string
  errorMessage?: string
}

/**
 * System information
 */
export interface SystemInformation {
  deviceModel: string
  manufacturer: string
  serialNumber: string
  androidVersion?: string
  kernelVersion: string
  uptime: number
  lastBootTime: string
}

/**
 * Network information
 */
export interface NetworkInformation {
  ipAddress: string
  subnet: string
  gateway: string
  dnsServers: string[]
  connectionType: 'WiFi' | 'Ethernet'
  signalStrength?: number
  networkSpeed: number
}

/**
 * Paginated hardware detection jobs response
 */
export interface PaginatedHardwareDetectionJobsDto {
  jobs: HardwareDetectionJobDto[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Hardware detection job creation request
 */
export interface CreateHardwareDetectionJobRequest {
  deviceId: number
  priority?: 'Low' | 'Normal' | 'High'
  detectComponents?: string[]
  forceRedetection?: boolean
}

/**
 * Bulk hardware detection request
 */
export interface BulkHardwareDetectionRequest {
  deviceIds: number[]
  priority?: 'Low' | 'Normal' | 'High'
  detectComponents?: string[]
  forceRedetection?: boolean
}

/**
 * Hardware detection statistics
 */
export interface HardwareDetectionStatsDto {
  totalJobs: number
  pendingJobs: number
  processingJobs: number
  completedJobs: number
  failedJobs: number
  averageExecutionTime: number
  successRate: number
  lastUpdated: string
}

/**
 * Hardware detection admin service
 * Handles hardware detection job management and monitoring
 */
export class HardwareDetectionService {
  private readonly basePath = '/api/admin/hardware-detection'

  /**
   * Get hardware detection jobs with filtering and pagination
   */
  async getHardwareDetectionJobs(
    status?: HardwareDetectionStatus,
    deviceId?: number,
    fromDate?: string,
    toDate?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedHardwareDetectionJobsDto> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    })

    if (status) params.append('status', status)
    if (deviceId) params.append('deviceId', deviceId.toString())
    if (fromDate) params.append('fromDate', fromDate)
    if (toDate) params.append('toDate', toDate)

    const response = await apiClient.get<PaginatedHardwareDetectionJobsDto>(
      `${this.basePath}/jobs?${params.toString()}`
    )
    return response.data
  }

  /**
   * Get specific hardware detection job details
   */
  async getHardwareDetectionJob(jobId: string): Promise<HardwareDetectionJobDetailDto> {
    const response = await apiClient.get<HardwareDetectionJobDetailDto>(`${this.basePath}/jobs/${jobId}`)
    return response.data
  }

  /**
   * Create new hardware detection job for single device
   */
  async createHardwareDetectionJob(request: CreateHardwareDetectionJobRequest): Promise<HardwareDetectionJobDto> {
    const response = await apiClient.post<HardwareDetectionJobDto>(`${this.basePath}/jobs`, request)
    return response.data
  }

  /**
   * Create hardware detection jobs for multiple devices
   */
  async createBulkHardwareDetectionJobs(request: BulkHardwareDetectionRequest): Promise<HardwareDetectionJobDto[]> {
    const response = await apiClient.post<HardwareDetectionJobDto[]>(`${this.basePath}/jobs/bulk`, request)
    return response.data
  }

  /**
   * Cancel hardware detection job
   */
  async cancelHardwareDetectionJob(jobId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/jobs/${jobId}/cancel`)
  }

  /**
   * Retry failed hardware detection job
   */
  async retryHardwareDetectionJob(jobId: string): Promise<HardwareDetectionJobDto> {
    const response = await apiClient.post<HardwareDetectionJobDto>(`${this.basePath}/jobs/${jobId}/retry`)
    return response.data
  }

  /**
   * Delete hardware detection job
   */
  async deleteHardwareDetectionJob(jobId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/jobs/${jobId}`)
  }

  /**
   * Get hardware detection statistics
   */
  async getHardwareDetectionStats(): Promise<HardwareDetectionStatsDto> {
    const response = await apiClient.get<HardwareDetectionStatsDto>(`${this.basePath}/stats`)
    return response.data
  }

  /**
   * Get hardware detection job execution log
   */
  async getJobExecutionLog(jobId: string): Promise<string[]> {
    const response = await apiClient.get<string[]>(`${this.basePath}/jobs/${jobId}/logs`)
    return response.data
  }

  /**
   * Export hardware detection jobs to CSV
   */
  async exportHardwareDetectionJobs(
    status?: HardwareDetectionStatus,
    fromDate?: string,
    toDate?: string
  ): Promise<Blob> {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (fromDate) params.append('fromDate', fromDate)
    if (toDate) params.append('toDate', toDate)

    const response = await apiClient.get(`${this.basePath}/jobs/export?${params.toString()}`, {
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * Get supported hardware components for detection
   */
  async getSupportedComponents(): Promise<string[]> {
    const response = await apiClient.get<string[]>(`${this.basePath}/supported-components`)
    return response.data
  }

  /**
   * Test hardware detection on specific device without creating job
   */
  async testHardwareDetection(deviceId: number): Promise<HardwareInfo> {
    const response = await apiClient.post<HardwareInfo>(`${this.basePath}/test-detection/${deviceId}`)
    return response.data
  }

  /**
   * Get hardware detection configuration
   */
  async getDetectionConfiguration(): Promise<any> {
    const response = await apiClient.get(`${this.basePath}/configuration`)
    return response.data
  }

  /**
   * Update hardware detection configuration
   */
  async updateDetectionConfiguration(config: any): Promise<any> {
    const response = await apiClient.put(`${this.basePath}/configuration`, config)
    return response.data
  }
}

// Export singleton instance
export const hardwareDetectionService = new HardwareDetectionService()

// Export class for dependency injection
export default HardwareDetectionService