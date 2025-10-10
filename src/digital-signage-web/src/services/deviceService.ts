import { apiClient } from '@/lib/api'

export interface Device {
  id: number
  name: string
  location: string
  status: 'Pending' | 'Registered' | 'Online' | 'Offline' | 'Error' | 'Maintenance' | 'Inactive' // API returns enum as string
  lastSeen: string
  ipAddress: string
  macAddress: string
  androidTvVersion: string
  appVersion: string
  resolution: string
  orientation: 'landscape' | 'portrait'
  isActive: boolean
  registrationCode?: string
  qrCodeUrl?: string
  createdAt: string
  updatedAt: string
}

export interface DeviceSearchParams {
  searchTerm?: string
  status?: string
  location?: string
  sortBy?: 'name' | 'location' | 'status' | 'lastSeen'
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface DeviceRegistrationRequest {
  name: string
  location: string
  registrationCode: string
}

export interface DeviceUpdateRequest {
  name?: string
  location?: string
  orientation?: 'landscape' | 'portrait'
  isActive?: boolean
}

export interface DeviceStatistics {
  totalDevices: number
  onlineDevices: number
  offlineDevices: number
  maintenanceDevices: number
  averageUptime: number
  locationBreakdown: Array<{
    location: string
    count: number
    onlineCount: number
  }>
  recentlyAdded: Device[]
}

/**
 * Device Service
 * 
 * Handles all device-related API calls including CRUD operations,
 * device registration, status management, and statistics.
 * 
 * @see copilot-instructions-ui.instructions.md - API Integration Rules
 */
export class DeviceService {
  /**
   * Get all devices
   * 
   * Retrieves complete list of registered devices from the API.
   * Backend returns PagedResult<DeviceResponseDto> with structure:
   * { items: Device[], pageNumber: number, pageSize: number, totalCount: number, totalPages: number }
   * 
   * @returns Promise resolving to array of Device objects
   * 
   * @example
   * ```typescript
   * const devices = await DeviceService.getAll()
   * console.log(`Total devices: ${devices.length}`)
   * ```
   * 
   * @see Device interface for return type structure
   */
  static async getAll(): Promise<Device[]> {
    const response = await apiClient.get('/api/devices')
    
    // API returns PagedResult with items array
    if (response.data && Array.isArray(response.data.items)) {
      return response.data.items
    }
    
    // Fallback: direct array (for backwards compatibility)
    if (Array.isArray(response.data)) {
      return response.data
    }
    
    // No data found
    return []
  }

  /**
   * Get device by ID
   * 
   * Fetches detailed information for a specific device.
   * 
   * @param id - Unique device identifier
   * @returns Promise resolving to Device object
   * @throws {ApiError} If device not found (404) or API error occurs
   * 
   * @example
   * ```typescript
   * try {
   *   const device = await DeviceService.getById(123)
   *   console.log(`Device: ${device.name} - ${device.status}`)
   * } catch (error) {
   *   console.error('Device not found:', error)
   * }
   * ```
   */
  static async getById(id: number): Promise<Device> {
    const response = await apiClient.get(`/api/devices/${id}`)
    return response.data
  }

  /**
   * Search devices with filters
   * 
   * Search and filter devices by status, location, and other criteria.
   * Supports pagination and sorting.
   * 
   * @param params - Search parameters including filters, pagination, and sorting
   * @returns Promise resolving to filtered array of Device objects
   * 
   * @example
   * ```typescript
   * const onlineDevices = await DeviceService.search({
   *   status: 'Online',
   *   location: 'Building A',
   *   sortBy: 'name',
   *   sortOrder: 'asc'
   * })
   * ```
   */
  static async search(params: DeviceSearchParams): Promise<Device[]> {
    const response = await apiClient.get('/api/devices/search', { params })
    return Array.isArray(response.data) ? response.data : []
  }

  /**
   * Get all online devices
   * 
   * Retrieves list of devices currently with Online status.
   * Useful for monitoring active devices.
   * 
   * @returns Promise resolving to array of online Device objects
   * 
   * @example
   * ```typescript
   * const activeDevices = await DeviceService.getOnline()
   * console.log(`Active devices: ${activeDevices.length}`)
   * ```
   */
  static async getOnline(): Promise<Device[]> {
    const response = await apiClient.get('/api/devices/online')
    return response.data
  }

  /**
   * Get devices by location
   * 
   * Retrieves all devices in a specific location.
   * 
   * @param location - Location name to filter by
   * @returns Promise resolving to array of Device objects at the location
   * 
   * @example
   * ```typescript
   * const buildingADevices = await DeviceService.getByLocation('Building A')
   * ```
   */
  static async getByLocation(location: string): Promise<Device[]> {
    const response = await apiClient.get('/api/devices/location', { params: { location } })
    return response.data
  }

  /**
   * Register a new device
   * 
   * Creates a new device registration using registration code.
   * The device must have obtained a valid registration code first.
   * 
   * @param deviceData - Device registration information
   * @returns Promise resolving to newly created Device object
   * @throws {ApiError} If registration code is invalid or expired
   * 
   * @example
   * ```typescript
   * const newDevice = await DeviceService.register({
   *   name: 'Lobby Display 1',
   *   location: 'Main Lobby',
   *   registrationCode: 'ABC123'
   * })
   * console.log(`Device registered: ${newDevice.id}`)
   * ```
   */
  static async register(deviceData: DeviceRegistrationRequest): Promise<Device> {
    const response = await apiClient.post('/api/devices/register', deviceData)
    return response.data
  }

  /**
   * Generate device registration QR code
   * 
   * Generates a QR code and registration code for device registration.
   * Optionally associates with existing device for re-registration.
   * 
   * @param deviceId - Optional device ID for re-registration
   * @returns Promise resolving to registration code, QR URL, and expiration time
   * 
   * @example
   * ```typescript
   * const registration = await DeviceService.generateQRCode()
   * console.log('Registration code:', registration.registrationCode)
   * console.log('QR code URL:', registration.qrCodeUrl)
   * console.log('Expires at:', registration.expiresAt)
   * ```
   */
  static async generateQRCode(deviceId?: number): Promise<{
    registrationCode: string
    qrCodeUrl: string
    expiresAt: string
  }> {
    const response = await apiClient.post('/api/devices/generate-qr', { deviceId })
    return response.data
  }

  /**
   * Update device information
   * 
   * Updates device properties such as name, location, resolution, etc.
   * Only provided fields will be updated.
   * 
   * @param id - Device ID to update
   * @param updates - Partial device data to update
   * @returns Promise resolving to updated Device object
   * @throws {ApiError} If device not found or validation fails
   * 
   * @example
   * ```typescript
   * const updated = await DeviceService.update(123, {
   *   name: 'New Display Name',
   *   location: 'Conference Room B'
   * })
   * ```
   */
  static async update(id: number, updates: DeviceUpdateRequest): Promise<Device> {
    const response = await apiClient.put(`/api/devices/${id}`, updates)
    return response.data
  }

  /**
   * Delete a device
   * 
   * Permanently deletes a device and all associated data.
   * This action cannot be undone.
   * 
   * @param id - Device ID to delete
   * @returns Promise resolving when deletion completes
   * @throws {ApiError} If device not found or deletion fails
   * 
   * @example
   * ```typescript
   * await DeviceService.delete(123)
   * console.log('Device deleted successfully')
   * ```
   */
  static async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/devices/${id}`)
  }

  /**
   * Delete multiple devices in bulk
   * 
   * Permanently deletes multiple devices at once.
   * This action cannot be undone.
   * 
   * @param ids - Array of device IDs to delete
   * @returns Promise resolving when all deletions complete
   * @throws {ApiError} If any device not found or deletion fails
   * 
   * @example
   * ```typescript
   * await DeviceService.bulkDelete([123, 456, 789])
   * console.log('3 devices deleted')
   * ```
   */
  static async bulkDelete(ids: number[]): Promise<void> {
    await apiClient.post('/api/devices/bulk-delete', { ids })
  }

  /**
   * Send command to device
   * 
   * Sends a remote command to the device for execution.
   * Supported commands depend on device capabilities.
   * 
   * @param id - Device ID to send command to
   * @param command - Command name to execute
   * @param params - Optional command parameters
   * @returns Promise resolving to command execution result
   * @throws {ApiError} If device offline or command not supported
   * 
   * @example
   * ```typescript
   * const result = await DeviceService.sendCommand(123, 'refresh-content', { force: true })
   * if (result.success) {
   *   console.log('Command executed:', result.message)
   * }
   * ```
   */
  static async sendCommand(id: number, command: string, params?: any): Promise<{
    success: boolean
    message: string
    result?: any
  }> {
    const response = await apiClient.post(`/api/devices/${id}/command`, { command, params })
    return response.data
  }

  /**
   * Restart a device
   * 
   * Sends restart command to device. Device will reboot and reconnect.
   * May take 1-2 minutes to complete.
   * 
   * @param id - Device ID to restart
   * @returns Promise resolving when restart command is sent
   * @throws {ApiError} If device not found or offline
   * 
   * @example
   * ```typescript
   * await DeviceService.restart(123)
   * console.log('Restart command sent')
   * ```
   */
  static async restart(id: number): Promise<void> {
    await apiClient.post(`/api/devices/${id}/restart`)
  }

  /**
   * Update device status manually
   * 
   * Changes device status (Online, Offline, Error, Maintenance).
   * Typically used for maintenance mode or manual overrides.
   * 
   * @param id - Device ID to update
   * @param status - New status value
   * @returns Promise resolving to updated Device object
   * @throws {ApiError} If device not found or invalid status
   * 
   * @example
   * ```typescript
   * const device = await DeviceService.updateStatus(123, 'Maintenance')
   * console.log('Device now in maintenance mode')
   * ```
   */
  static async updateStatus(id: number, status: Device['status']): Promise<Device> {
    const response = await apiClient.patch(`/api/devices/${id}/status`, { status })
    return response.data
  }

  /**
   * Get device statistics summary
   * 
   * Retrieves aggregated statistics for all devices including counts,
   * online/offline status, and resource usage metrics.
   * 
   * @returns Promise resolving to DeviceStatistics object
   * 
   * @example
   * ```typescript
   * const stats = await DeviceService.getStatistics()
   * console.log(`Total devices: ${stats.totalDevices}`)
   * console.log(`Online: ${stats.onlineDevices}`)
   * ```
   * 
   * @see DeviceStatistics for available metrics
   */
  static async getStatistics(): Promise<DeviceStatistics> {
    const response = await apiClient.get('/api/devices/statistics')
    return response.data
  }

  /**
   * Get device health metrics
   * 
   * Retrieves real-time health metrics including CPU, memory, storage,
   * temperature, and network latency for a specific device.
   * 
   * @param id - Device ID to check health for
   * @returns Promise resolving to health metrics object
   * @throws {ApiError} If device not found or health data unavailable
   * 
   * @example
   * ```typescript
   * const health = await DeviceService.getHealth(123)
   * if (health.cpuUsage > 90) {
   *   console.warn('High CPU usage detected')
   * }
   * ```
   */
  static async getHealth(id: number): Promise<{
    cpuUsage: number
    memoryUsage: number
    storageUsage: number
    temperature: number
    networkLatency: number
    lastHeartbeat: string
    issues: Array<{
      type: string
      severity: 'low' | 'medium' | 'high'
      message: string
      timestamp: string
    }>
  }> {
    const response = await apiClient.get(`/api/devices/${id}/health`)
    return response.data
  }

  /**
   * Get device schedules
   * 
   * Retrieves all schedules currently assigned to a specific device.
   * 
   * @param id - Device ID to get schedules for
   * @returns Promise resolving to array of schedule summaries
   * @throws {ApiError} If device not found
   * 
   * @example
   * ```typescript
   * const schedules = await DeviceService.getSchedules(123)
   * const activeSchedules = schedules.filter(s => s.isActive)
   * console.log(`Active schedules: ${activeSchedules.length}`)
   * ```
   */
  static async getSchedules(id: number): Promise<Array<{
    id: number
    name: string
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    isActive: boolean
    mediaCount: number
  }>> {
    const response = await apiClient.get(`/api/devices/${id}/schedules`)
    return response.data
  }

  /**
   * Get device logs
   * 
   * Retrieves log entries for a device with optional filtering.
   * Useful for troubleshooting and monitoring device behavior.
   * 
   * @param id - Device ID to get logs for
   * @param params - Optional filters for log level, date range, and limit
   * @returns Promise resolving to array of log entries
   * @throws {ApiError} If device not found
   * 
   * @example
   * ```typescript
   * const errorLogs = await DeviceService.getLogs(123, {
   *   level: 'error',
   *   startDate: '2024-01-01',
   *   limit: 50
   * })
   * console.log(`Found ${errorLogs.length} error logs`)
   * ```
   */
  static async getLogs(id: number, params?: {
    level?: 'info' | 'warning' | 'error'
    startDate?: string
    endDate?: string
    limit?: number
  }): Promise<Array<{
    id: number
    level: string
    message: string
    timestamp: string
    details?: any
  }>> {
    const response = await apiClient.get(`/api/devices/${id}/logs`, { params })
    return response.data
  }

  /**
   * Get device screenshot
   * 
   * Captures and retrieves a current screenshot from the device.
   * May take a few seconds to capture and upload.
   * 
   * @param id - Device ID to capture screenshot from
   * @returns Promise resolving to screenshot URL and metadata
   * @throws {ApiError} If device offline or screenshot capture fails
   * 
   * @example
   * ```typescript
   * const screenshot = await DeviceService.getScreenshot(123)
   * console.log('Screenshot URL:', screenshot.imageUrl)
   * console.log('Resolution:', screenshot.resolution)
   * ```
   */
  static async getScreenshot(id: number): Promise<{
    imageUrl: string
    timestamp: string
    resolution: string
  }> {
    const response = await apiClient.get(`/api/devices/${id}/screenshot`)
    return response.data
  }

  /**
   * Get all unique device locations
   * 
   * Retrieves a list of all unique locations where devices are deployed.
   * Useful for location filters and reports.
   * 
   * @returns Promise resolving to array of location names
   * 
   * @example
   * ```typescript
   * const locations = await DeviceService.getLocations()
   * console.log(`Devices deployed in ${locations.length} locations`)
   * ```
   */
  static async getLocations(): Promise<string[]> {
    const response = await apiClient.get('/api/devices/locations')
    return response.data
  }
}