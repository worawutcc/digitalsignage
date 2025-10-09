import { apiClient } from '@/lib/api'
import type { 
  DeviceDetail, 
  DeviceConfiguration,
  DeviceConfigurationUpdate 
} from '@/types/device-detail'

/**
 * Device detail service for managing individual device information
 */
export const deviceDetailService = {
  /**
   * Get detailed device information by ID
   */
  getById: async (deviceId: number): Promise<DeviceDetail> => {
    const response = await apiClient.get<DeviceDetail>(`/api/devices/${deviceId}`)
    return response.data
  },

  /**
   * Get device configuration
   */
  getConfiguration: async (deviceId: number): Promise<DeviceConfiguration> => {
    const response = await apiClient.get<DeviceConfiguration>(
      `/api/devices/${deviceId}/configuration`
    )
    return response.data
  },

  /**
   * Update device configuration
   */
  updateConfiguration: async (
    deviceId: number, 
    config: DeviceConfigurationUpdate
  ): Promise<DeviceConfiguration> => {
    const response = await apiClient.put<DeviceConfiguration>(
      `/api/devices/${deviceId}/configuration`,
      config
    )
    return response.data
  },

  /**
   * Update device information
   */
  update: async (deviceId: number, data: Partial<DeviceDetail>): Promise<DeviceDetail> => {
    const response = await apiClient.put<DeviceDetail>(`/api/devices/${deviceId}`, data)
    return response.data
  },

  /**
   * Deactivate/delete device
   */
  deactivate: async (deviceId: number): Promise<void> => {
    await apiClient.delete(`/api/devices/${deviceId}`)
  },

  /**
   * Restart device (if endpoint exists)
   */
  restart: async (deviceId: number): Promise<void> => {
    // TODO: Check if restart endpoint exists in backend
    await apiClient.post(`/api/devices/${deviceId}/restart`)
  }
}
