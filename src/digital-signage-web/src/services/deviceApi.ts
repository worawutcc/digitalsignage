import { api } from '@/lib/api'
import { 
  Device, 
  DeviceConfiguration, 
  DeviceStatusLog, 
  RegistrationRecord,
  DeviceRegistrationRequest,
  DeviceRegistrationResponse,
  DeviceApprovalRequest,
  DeviceApprovalResponse,
  DeviceRejectionRequest,
  DeviceRejectionResponse,
  UpdateDeviceConfigurationRequest,
  DeviceFilters,
  ApiResponse 
} from '@/types/api'

// Using centralized API client with built-in authentication

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

    const response = await api.get<Device[]>(`/api/device?${params}`)
    return response
  },

  /**
   * Get device by ID
   */
  async getDevice(id: number): Promise<ApiResponse<Device>> {
    return await api.get<Device>(`/api/device/${id}`)
  },

  /**
   * Update device information
   */
  async updateDevice(id: number, data: Partial<Device>): Promise<ApiResponse<Device>> {
    return await api.put<Device>(`/api/device/${id}`, data)
  },

  /**
   * Delete device
   */
  async deleteDevice(id: number): Promise<ApiResponse<void>> {
    return await api.delete<void>(`/api/device/${id}`)
  },

  /**
   * Deactivate Android TV device
   */
  async deactivateDevice(id: number, reason?: string): Promise<ApiResponse<Device>> {
    return await api.post<Device>(`/api/device/${id}/deactivate`, { reason })
  },

  /**
   * Reactivate Android TV device
   */
  async reactivateDevice(id: number): Promise<ApiResponse<Device>> {
    return await api.post<Device>(`/api/device/${id}/reactivate`)
  },

  // ========================
  // Android TV Registration Workflow
  // ========================

  /**
   * Register new Android TV device (from device itself)
   */
  async registerDevice(data: DeviceRegistrationRequest): Promise<ApiResponse<DeviceRegistrationResponse>> {
    return await api.post<DeviceRegistrationResponse>('/api/device/register', data)
  },

  /**
   * Get pending device registration requests (admin)
   */
  async getPendingRegistrations(): Promise<ApiResponse<Device[]>> {
    return await api.get<Device[]>('/api/device/pending-registrations')
  },

  /**
   * Approve device registration (admin)
   */
  async approveDeviceRegistration(data: DeviceApprovalRequest): Promise<ApiResponse<DeviceApprovalResponse>> {
    return await api.post<DeviceApprovalResponse>('/api/admin/device-registration/approve', data)
  },

  /**
   * Reject device registration (admin)
   */
  async rejectDeviceRegistration(data: DeviceRejectionRequest): Promise<ApiResponse<DeviceRejectionResponse>> {
    return await api.post<DeviceRejectionResponse>('/api/admin/device-registration/reject', data)
  },

  /**
   * Get registration records for a device
   */
  async getRegistrationRecords(deviceId: number): Promise<ApiResponse<RegistrationRecord[]>> {
    return await api.get<RegistrationRecord[]>(`/api/device/${deviceId}/registration-records`)
  },

  // ========================
  // Device Configuration Management
  // ========================

  /**
   * Get device configuration
   */
  async getDeviceConfiguration(deviceId: number): Promise<ApiResponse<DeviceConfiguration>> {
    return await api.get<DeviceConfiguration>(`/api/device/${deviceId}/configuration`)
  },

  /**
   * Update device configuration
   */
  async updateDeviceConfiguration(
    deviceId: number, 
    data: UpdateDeviceConfigurationRequest
  ): Promise<ApiResponse<DeviceConfiguration>> {
    return await api.put<DeviceConfiguration>(`/api/device/${deviceId}/configuration`, data)
  },

  /**
   * Reset device configuration to defaults
   */
  async resetDeviceConfiguration(deviceId: number): Promise<ApiResponse<DeviceConfiguration>> {
    return await api.post<DeviceConfiguration>(`/api/device/${deviceId}/configuration/reset`)
  },

  // ========================
  // Device Status Monitoring
  // ========================

  /**
   * Get device status logs
   */
  async getDeviceStatusLogs(deviceId: number, limit = 50): Promise<ApiResponse<DeviceStatusLog[]>> {
    return await api.get<DeviceStatusLog[]>(`/api/device/${deviceId}/status-logs?limit=${limit}`)
  },

  /**
   * Send device heartbeat (from device)
   */
  async sendDeviceHeartbeat(deviceId: number, status: any): Promise<ApiResponse<void>> {
    return await api.post<void>(`/api/device/${deviceId}/heartbeat`, { status })
  },

  /**
   * Check device connectivity
   */
  async checkDeviceConnectivity(deviceId: number): Promise<ApiResponse<{ isOnline: boolean; lastSeen?: string }>> {
    return await api.get<{ isOnline: boolean; lastSeen?: string }>(`/api/device/${deviceId}/connectivity`)
  },

  /**
   * Force device status refresh
   */
  async refreshDeviceStatus(deviceId: number): Promise<ApiResponse<Device>> {
    return await api.post<Device>(`/api/device/${deviceId}/refresh-status`)
  },

  // ========================
  // Bulk Operations
  // ========================

  /**
   * Update multiple devices
   */
  async bulkUpdateDevices(deviceIds: number[], data: Partial<Device>): Promise<ApiResponse<Device[]>> {
    return await api.post<Device[]>('/api/device/bulk-update', { deviceIds, data })
  },

  /**
   * Deactivate multiple devices
   */
  async bulkDeactivateDevices(deviceIds: number[], reason?: string): Promise<ApiResponse<void>> {
    return await api.post<void>('/api/device/bulk-deactivate', { deviceIds, reason })
  },

  /**
   * Update device group assignment
   */
  async updateDeviceGroup(
    deviceId: number, 
    deviceGroupId: number | null
  ): Promise<ApiResponse<{
    deviceId: number
    deviceName: string
    previousGroupId: number | null
    previousGroupName: string | null
    newGroupId: number | null
    newGroupName: string | null
    updatedAt: string
    message: string
  }>> {
    return await api.put<{
      deviceId: number
      deviceName: string
      previousGroupId: number | null
      previousGroupName: string | null
      newGroupId: number | null
      newGroupName: string | null
      updatedAt: string
      message: string
    }>(`/api/device/${deviceId}/group`, { deviceGroupId })
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
    return await api.get<{
      total: number
      online: number
      offline: number
      pending: number
      error: number
      byManufacturer: Record<string, number>
      byAndroidVersion: Record<string, number>
    }>('/api/device/statistics')
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