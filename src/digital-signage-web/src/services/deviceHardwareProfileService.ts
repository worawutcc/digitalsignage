/**
 * Device Hardware Profile Service - API integration for device hardware management
 * 
 * Provides functionality for managing device hardware profiles including
 * hardware information retrieval, updates, and hardware capability management.
 * 
 * @see copilot-instructions-ui.md - API Integration Rules
 */

import { apiClient } from '@/lib/api'

/**
 * Device hardware profile information
 */
export interface DeviceHardwareProfileDto {
  id: number
  deviceId: number
  deviceName: string
  manufacturer: string
  model: string
  serialNumber: string
  hardwareVersion: string
  firmwareVersion: string
  operatingSystem: string
  osVersion: string
  processorInfo: ProcessorInfo
  memoryInfo: MemoryInfo
  storageInfo: StorageInfo
  displayInfo: DisplayInfo
  networkCapabilities: NetworkCapabilities
  audioCapabilities: AudioCapabilities
  additionalFeatures: Record<string, any>
  lastDetected: string
  detectionMethod: 'Manual' | 'Automatic' | 'Import'
  isVerified: boolean
  createdAt: string
  updatedAt: string
  updatedBy: number
}

/**
 * Processor information
 */
export interface ProcessorInfo {
  architecture: string
  model: string
  cores: number
  frequency: number
  vendor: string
  features: string[]
}

/**
 * Memory information
 */
export interface MemoryInfo {
  totalRam: number
  availableRam: number
  ramType: string
  speed: number
  slots: number
}

/**
 * Storage information
 */
export interface StorageInfo {
  totalStorage: number
  availableStorage: number
  storageType: 'eMMC' | 'SSD' | 'HDD' | 'NVMe'
  readSpeed: number
  writeSpeed: number
  partitions: StoragePartition[]
}

/**
 * Storage partition information
 */
export interface StoragePartition {
  name: string
  size: number
  used: number
  mountPoint: string
  fileSystem: string
}

/**
 * Display information
 */
export interface DisplayInfo {
  resolution: string
  screenSize: number
  aspectRatio: string
  refreshRate: number
  colorDepth: number
  supportedFormats: string[]
  hdmiPorts: number
  displayPorts: number
  touchScreen: boolean
}

/**
 * Network capabilities
 */
export interface NetworkCapabilities {
  ethernet: {
    available: boolean
    speed: number
    ports: number
  }
  wifi: {
    available: boolean
    standards: string[]
    frequencies: string[]
    maxSpeed: number
    antennaCount: number
  }
  bluetooth: {
    available: boolean
    version: string
    profiles: string[]
  }
  cellular: {
    available: boolean
    bands: string[]
    technologies: string[]
  }
}

/**
 * Audio capabilities
 */
export interface AudioCapabilities {
  inputPorts: AudioPort[]
  outputPorts: AudioPort[]
  supportedFormats: string[]
  maxSampleRate: number
  bitDepth: number
  channels: number
  dsp: boolean
}

/**
 * Audio port information
 */
export interface AudioPort {
  type: '3.5mm' | 'RCA' | 'XLR' | 'HDMI' | 'USB' | 'Optical'
  count: number
  maxVoltage?: number
}

/**
 * Device hardware profile update request
 */
export interface UpdateDeviceHardwareProfileRequestDto {
  manufacturer?: string
  model?: string
  serialNumber?: string
  hardwareVersion?: string
  firmwareVersion?: string
  operatingSystem?: string
  osVersion?: string
  processorInfo?: Partial<ProcessorInfo>
  memoryInfo?: Partial<MemoryInfo>
  storageInfo?: Partial<StorageInfo>
  displayInfo?: Partial<DisplayInfo>
  networkCapabilities?: Partial<NetworkCapabilities>
  audioCapabilities?: Partial<AudioCapabilities>
  additionalFeatures?: Record<string, any>
  isVerified?: boolean
}

/**
 * Hardware detection request
 */
export interface DetectHardwareRequestDto {
  deviceId: number
  components?: string[]
  forceRedetection?: boolean
}

/**
 * Hardware comparison result
 */
export interface HardwareComparisonResult {
  deviceId: number
  currentProfile: DeviceHardwareProfileDto
  detectedProfile: DeviceHardwareProfileDto
  differences: HardwareDifference[]
  confidenceScore: number
  recommendedActions: string[]
}

/**
 * Hardware difference information
 */
export interface HardwareDifference {
  component: string
  field: string
  currentValue: any
  detectedValue: any
  severity: 'Low' | 'Medium' | 'High'
  description: string
}

/**
 * Bulk hardware profile update request
 */
export interface BulkHardwareProfileUpdateRequest {
  deviceIds: number[]
  updates: UpdateDeviceHardwareProfileRequestDto
  verifyChanges: boolean
}

/**
 * Device hardware profile service
 * Handles device hardware profile management and operations
 */
export class DeviceHardwareProfileService {
  private readonly basePath = '/api/device'

  /**
   * Get device hardware profile by device ID
   */
  async getDeviceHardwareProfile(deviceId: number): Promise<DeviceHardwareProfileDto> {
    const response = await apiClient.get<DeviceHardwareProfileDto>(`${this.basePath}/${deviceId}/hardware-profile`)
    return response.data
  }

  /**
   * Update device hardware profile (Admin only)
   */
  async updateDeviceHardwareProfile(
    deviceId: number,
    request: UpdateDeviceHardwareProfileRequestDto
  ): Promise<DeviceHardwareProfileDto> {
    const response = await apiClient.put<DeviceHardwareProfileDto>(
      `${this.basePath}/${deviceId}/hardware-profile`,
      request
    )
    return response.data
  }

  /**
   * Detect hardware for device
   */
  async detectDeviceHardware(request: DetectHardwareRequestDto): Promise<DeviceHardwareProfileDto> {
    const response = await apiClient.post<DeviceHardwareProfileDto>(
      `${this.basePath}/${request.deviceId}/hardware-profile/detect`,
      request
    )
    return response.data
  }

  /**
   * Compare current profile with detected hardware
   */
  async compareHardwareProfile(deviceId: number): Promise<HardwareComparisonResult> {
    const response = await apiClient.get<HardwareComparisonResult>(
      `${this.basePath}/${deviceId}/hardware-profile/compare`
    )
    return response.data
  }

  /**
   * Verify hardware profile information
   */
  async verifyHardwareProfile(deviceId: number): Promise<DeviceHardwareProfileDto> {
    const response = await apiClient.post<DeviceHardwareProfileDto>(
      `${this.basePath}/${deviceId}/hardware-profile/verify`
    )
    return response.data
  }

  /**
   * Get hardware profile history
   */
  async getHardwareProfileHistory(
    deviceId: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ items: DeviceHardwareProfileDto[]; totalCount: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    })

    const response = await apiClient.get(
      `${this.basePath}/${deviceId}/hardware-profile/history?${params.toString()}`
    )
    return response.data
  }

  /**
   * Export hardware profile to JSON
   */
  async exportHardwareProfile(deviceId: number): Promise<Blob> {
    const response = await apiClient.get(`${this.basePath}/${deviceId}/hardware-profile/export`, {
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * Import hardware profile from JSON
   */
  async importHardwareProfile(deviceId: number, profileData: any): Promise<DeviceHardwareProfileDto> {
    const response = await apiClient.post<DeviceHardwareProfileDto>(
      `${this.basePath}/${deviceId}/hardware-profile/import`,
      profileData
    )
    return response.data
  }

  /**
   * Get supported hardware components
   */
  async getSupportedComponents(): Promise<string[]> {
    const response = await apiClient.get<string[]>(`${this.basePath}/hardware-profile/supported-components`)
    return response.data
  }

  /**
   * Bulk update hardware profiles
   */
  async bulkUpdateHardwareProfiles(request: BulkHardwareProfileUpdateRequest): Promise<DeviceHardwareProfileDto[]> {
    const response = await apiClient.post<DeviceHardwareProfileDto[]>(
      `${this.basePath}/hardware-profile/bulk-update`,
      request
    )
    return response.data
  }

  /**
   * Delete hardware profile
   */
  async deleteHardwareProfile(deviceId: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${deviceId}/hardware-profile`)
  }

  /**
   * Get hardware profile template
   */
  async getHardwareProfileTemplate(deviceModel?: string): Promise<DeviceHardwareProfileDto> {
    const params = deviceModel ? `?model=${encodeURIComponent(deviceModel)}` : ''
    const response = await apiClient.get<DeviceHardwareProfileDto>(
      `${this.basePath}/hardware-profile/template${params}`
    )
    return response.data
  }

  /**
   * Validate hardware profile data
   */
  async validateHardwareProfile(profileData: UpdateDeviceHardwareProfileRequestDto): Promise<{
    isValid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const response = await apiClient.post(`${this.basePath}/hardware-profile/validate`, profileData)
    return response.data
  }
}

// Export singleton instance
export const deviceHardwareProfileService = new DeviceHardwareProfileService()

// Export class for dependency injection
export default DeviceHardwareProfileService