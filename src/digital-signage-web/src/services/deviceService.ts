import { apiClient } from '@/lib/api'

export interface Device {
  id: number
  name: string
  location: string
  status: 'Online' | 'Offline' | 'Maintenance'
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
 * Device service for API integration
 * Handles all device-related API calls
 */
export class DeviceService {
  /**
   * Get all devices
   */
  static async getAll(): Promise<Device[]> {
    const response = await apiClient.get('/api/devices')
    return response.data
  }

  /**
   * Get device by ID
   */
  static async getById(id: number): Promise<Device> {
    const response = await apiClient.get(`/api/devices/${id}`)
    return response.data
  }

  /**
   * Search devices
   */
  static async search(params: DeviceSearchParams): Promise<Device[]> {
    const response = await apiClient.get('/api/devices/search', { params })
    return response.data
  }

  /**
   * Get online devices
   */
  static async getOnline(): Promise<Device[]> {
    const response = await apiClient.get('/api/devices/online')
    return response.data
  }

  /**
   * Get devices by location
   */
  static async getByLocation(location: string): Promise<Device[]> {
    const response = await apiClient.get('/api/devices/location', { params: { location } })
    return response.data
  }

  /**
   * Register new device
   */
  static async register(deviceData: DeviceRegistrationRequest): Promise<Device> {
    const response = await apiClient.post('/api/devices/register', deviceData)
    return response.data
  }

  /**
   * Generate registration QR code
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
   * Update device
   */
  static async update(id: number, updates: DeviceUpdateRequest): Promise<Device> {
    const response = await apiClient.put(`/api/devices/${id}`, updates)
    return response.data
  }

  /**
   * Delete device
   */
  static async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/devices/${id}`)
  }

  /**
   * Bulk delete devices
   */
  static async bulkDelete(ids: number[]): Promise<void> {
    await apiClient.post('/api/devices/bulk-delete', { ids })
  }

  /**
   * Send command to device
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
   * Restart device
   */
  static async restart(id: number): Promise<void> {
    await apiClient.post(`/api/devices/${id}/restart`)
  }

  /**
   * Update device status
   */
  static async updateStatus(id: number, status: Device['status']): Promise<Device> {
    const response = await apiClient.patch(`/api/devices/${id}/status`, { status })
    return response.data
  }

  /**
   * Get device statistics
   */
  static async getStatistics(): Promise<DeviceStatistics> {
    const response = await apiClient.get('/api/devices/statistics')
    return response.data
  }

  /**
   * Get device health
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
   * Get device screenshots
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
   * Get device locations
   */
  static async getLocations(): Promise<string[]> {
    const response = await apiClient.get('/api/devices/locations')
    return response.data
  }
}