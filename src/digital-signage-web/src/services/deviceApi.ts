import axios from 'axios'
import { 
  Device, 
  DeviceConfiguration, 
  DeviceStatusLog, 
  RegistrationRecord,
  DeviceRegistrationRequest,
  DeviceRegistrationResponse,
  DeviceApprovalRequest,
  UpdateDeviceConfigurationRequest,
  DeviceFilters,
  ApiResponse 
} from '@/types/api'

// Base API URL - can be configured via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5100/api'

/**
 * Get authentication token from localStorage or other storage
 */
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token')
  }
  return null
}

/**
 * Create axios instance with default configuration
 */
const createApiClient = () => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Add auth token to requests
  client.interceptors.request.use((config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  return client
}

const apiClient = createApiClient()

/**
 * Device Management API Client
 */
export const deviceApi = {
  // ========================
  // Device CRUD Operations
  // ========================

  /**
   * Get all devices with optional filtering
   */
  async getDevices(filters?: DeviceFilters): Promise<ApiResponse<Device[]>> {
    const params = new URLSearchParams()
    
    if (filters?.search) params.append('search', filters.search)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.deviceGroupId) params.append('deviceGroupId', filters.deviceGroupId.toString())
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString())

    const response = await apiClient.get<ApiResponse<Device[]>>(`/device?${params}`)
    return response.data
  },

  /**
   * Get device by ID
   */
  async getDevice(id: number): Promise<ApiResponse<Device>> {
    const response = await apiClient.get<ApiResponse<Device>>(`/device/${id}`)
    return response.data
  },

  /**
   * Update device information
   */
  async updateDevice(id: number, data: Partial<Device>): Promise<ApiResponse<Device>> {
    const response = await apiClient.put<ApiResponse<Device>>(`/device/${id}`, data)
    return response.data
  },

  /**
   * Delete device
   */
  async deleteDevice(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/device/${id}`)
    return response.data
  },

  /**
   * Deactivate Android TV device
   */
  async deactivateDevice(id: number, reason?: string): Promise<ApiResponse<Device>> {
    const response = await apiClient.post<ApiResponse<Device>>(`/device/${id}/deactivate`, { reason })
    return response.data
  },

  /**
   * Reactivate Android TV device
   */
  async reactivateDevice(id: number): Promise<ApiResponse<Device>> {
    const response = await apiClient.post<ApiResponse<Device>>(`/device/${id}/reactivate`)
    return response.data
  },

  // ========================
  // Android TV Registration Workflow
  // ========================

  /**
   * Register new Android TV device (from device itself)
   */
  async registerDevice(data: DeviceRegistrationRequest): Promise<ApiResponse<DeviceRegistrationResponse>> {
    const response = await apiClient.post<ApiResponse<DeviceRegistrationResponse>>('/device/register', data)
    return response.data
  },

  /**
   * Get pending device registration requests (admin)
   */
  async getPendingRegistrations(): Promise<ApiResponse<Device[]>> {
    const response = await apiClient.get<ApiResponse<Device[]>>('/device/pending-registrations')
    return response.data
  },

  /**
   * Approve or reject device registration (admin)
   */
  async approveDeviceRegistration(data: DeviceApprovalRequest): Promise<ApiResponse<Device>> {
    const response = await apiClient.post<ApiResponse<Device>>('/device/approve-registration', data)
    return response.data
  },

  /**
   * Get registration records for a device
   */
  async getRegistrationRecords(deviceId: number): Promise<ApiResponse<RegistrationRecord[]>> {
    const response = await apiClient.get<ApiResponse<RegistrationRecord[]>>(`/device/${deviceId}/registration-records`)
    return response.data
  },

  // ========================
  // Device Configuration Management
  // ========================

  /**
   * Get device configuration
   */
  async getDeviceConfiguration(deviceId: number): Promise<ApiResponse<DeviceConfiguration>> {
    const response = await apiClient.get<ApiResponse<DeviceConfiguration>>(`/device/${deviceId}/configuration`)
    return response.data
  },

  /**
   * Update device configuration
   */
  async updateDeviceConfiguration(
    deviceId: number, 
    data: UpdateDeviceConfigurationRequest
  ): Promise<ApiResponse<DeviceConfiguration>> {
    const response = await apiClient.put<ApiResponse<DeviceConfiguration>>(`/device/${deviceId}/configuration`, data)
    return response.data
  },

  /**
   * Reset device configuration to defaults
   */
  async resetDeviceConfiguration(deviceId: number): Promise<ApiResponse<DeviceConfiguration>> {
    const response = await apiClient.post<ApiResponse<DeviceConfiguration>>(`/device/${deviceId}/configuration/reset`)
    return response.data
  },

  // ========================
  // Device Status Monitoring
  // ========================

  /**
   * Get device status logs
   */
  async getDeviceStatusLogs(deviceId: number, limit = 50): Promise<ApiResponse<DeviceStatusLog[]>> {
    const response = await apiClient.get<ApiResponse<DeviceStatusLog[]>>(`/device/${deviceId}/status-logs?limit=${limit}`)
    return response.data
  },

  /**
   * Send device heartbeat (from device)
   */
  async sendDeviceHeartbeat(deviceId: number, status: any): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(`/device/${deviceId}/heartbeat`, { status })
    return response.data
  },

  /**
   * Check device connectivity
   */
  async checkDeviceConnectivity(deviceId: number): Promise<ApiResponse<{ isOnline: boolean; lastSeen?: string }>> {
    const response = await apiClient.get<ApiResponse<{ isOnline: boolean; lastSeen?: string }>>(`/device/${deviceId}/connectivity`)
    return response.data
  },

  /**
   * Force device status refresh
   */
  async refreshDeviceStatus(deviceId: number): Promise<ApiResponse<Device>> {
    const response = await apiClient.post<ApiResponse<Device>>(`/device/${deviceId}/refresh-status`)
    return response.data
  },

  // ========================
  // Bulk Operations
  // ========================

  /**
   * Update multiple devices
   */
  async bulkUpdateDevices(deviceIds: number[], data: Partial<Device>): Promise<ApiResponse<Device[]>> {
    const response = await apiClient.post<ApiResponse<Device[]>>('/device/bulk-update', { deviceIds, data })
    return response.data
  },

  /**
   * Deactivate multiple devices
   */
  async bulkDeactivateDevices(deviceIds: number[], reason?: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>('/device/bulk-deactivate', { deviceIds, reason })
    return response.data
  },

  /**
   * Get device statistics
   */
  async getDeviceStatistics(): Promise<ApiResponse<{
    total: number
    online: number
    offline: number
    pending: number
    error: number
    byManufacturer: Record<string, number>
    byAndroidVersion: Record<string, number>
  }>> {
    const response = await apiClient.get<ApiResponse<any>>('/device/statistics')
    return response.data
  },

  // ========================
  // Real-time Integration
  // ========================

  /**
   * Subscribe to device events via WebSocket
   * This is a helper method that works with the SignalR hub
   */
  getWebSocketUrl(): string {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsHost = process.env.NEXT_PUBLIC_WS_URL || window.location.host.replace('3001', '5100')
    return `${wsProtocol}//${wsHost}/ws`
  }
}

export default deviceApi