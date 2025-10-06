/**
 * Device Groups API Service
 * Following copilot-instructions-ui.instructions.md patterns with Axios
 */

import { apiClient } from '@/lib/api'
import type {
  DeviceGroup,
  DeviceGroupTree,
  CreateDeviceGroupRequest,
  UpdateDeviceGroupRequest,
  DeviceGroupSearchParams,
  DeviceGroupResponse,
  DeviceGroupListResponse,
  DeviceGroupTreeResponse,
} from '@/types/deviceGroup.types'

/**
 * Device Groups API Service Class
 * Handles all HTTP communications with the backend API
 */
export class DeviceGroupService {
  private readonly baseUrl = '/device-groups'

  /**
   * Get all device groups with optional filtering and sorting
   */
  async getAll(params?: DeviceGroupSearchParams): Promise<DeviceGroup[]> {
    try {
      const response = await apiClient.get<DeviceGroupListResponse>(this.baseUrl, {
        params: this.sanitizeParams(params),
      })

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to fetch device groups')
      }

      return response.data.data
    } catch (error) {
      console.error('Error fetching device groups:', error)
      throw this.handleError(error, 'Failed to fetch device groups')
    }
  }

  /**
   * Get device group by ID
   */
  async getById(id: number): Promise<DeviceGroup> {
    try {
      const response = await apiClient.get<DeviceGroupResponse>(`${this.baseUrl}/${id}`)

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Device group not found')
      }

      return response.data.data
    } catch (error) {
      console.error(`Error fetching device group ${id}:`, error)
      throw this.handleError(error, 'Failed to fetch device group')
    }
  }

  /**
   * Get hierarchical tree structure of all device groups
   */
  async getTree(params?: DeviceGroupSearchParams): Promise<DeviceGroupTree> {
    try {
      const response = await apiClient.get<DeviceGroupTreeResponse>(`${this.baseUrl}/tree`, {
        params: this.sanitizeParams(params),
      })

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to fetch device groups tree')
      }

      return response.data.data
    } catch (error) {
      console.error('Error fetching device groups tree:', error)
      throw this.handleError(error, 'Failed to fetch device groups tree')
    }
  }

  /**
   * Search device groups by name or description
   */
  async search(query: string, params?: Omit<DeviceGroupSearchParams, 'query'>): Promise<DeviceGroup[]> {
    try {
      const searchParams = {
        query: query.trim(),
        ...params,
      }

      const response = await apiClient.get<DeviceGroupListResponse>(`${this.baseUrl}/search`, {
        params: this.sanitizeParams(searchParams),
      })

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to search device groups')
      }

      return response.data.data
    } catch (error) {
      console.error('Error searching device groups:', error)
      throw this.handleError(error, 'Failed to search device groups')
    }
  }

  /**
   * Create a new device group
   */
  async create(data: CreateDeviceGroupRequest): Promise<DeviceGroup> {
    try {
      const response = await apiClient.post<DeviceGroupResponse>(this.baseUrl, data)

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to create device group')
      }

      return response.data.data
    } catch (error) {
      console.error('Error creating device group:', error)
      throw this.handleError(error, 'Failed to create device group')
    }
  }

  /**
   * Update an existing device group
   */
  async update(id: number, data: UpdateDeviceGroupRequest): Promise<DeviceGroup> {
    try {
      const response = await apiClient.put<DeviceGroupResponse>(`${this.baseUrl}/${id}`, data)

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to update device group')
      }

      return response.data.data
    } catch (error) {
      console.error(`Error updating device group ${id}:`, error)
      throw this.handleError(error, 'Failed to update device group')
    }
  }

  /**
   * Delete a device group
   */
  async delete(id: number): Promise<void> {
    try {
      const response = await apiClient.delete<{ success: boolean; error?: string }>(`${this.baseUrl}/${id}`)

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete device group')
      }
    } catch (error) {
      console.error(`Error deleting device group ${id}:`, error)
      throw this.handleError(error, 'Failed to delete device group')
    }
  }

  /**
   * Get ancestors of a device group (parent hierarchy)
   */
  async getAncestors(id: number): Promise<DeviceGroup[]> {
    try {
      const response = await apiClient.get<DeviceGroupListResponse>(`${this.baseUrl}/${id}/ancestors`)

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to fetch ancestors')
      }

      return response.data.data
    } catch (error) {
      console.error(`Error fetching ancestors for group ${id}:`, error)
      throw this.handleError(error, 'Failed to fetch ancestors')
    }
  }

  /**
   * Get descendants of a device group (children hierarchy)
   */
  async getDescendants(id: number): Promise<DeviceGroup[]> {
    try {
      const response = await apiClient.get<DeviceGroupListResponse>(`${this.baseUrl}/${id}/descendants`)

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to fetch descendants')
      }

      return response.data.data
    } catch (error) {
      console.error(`Error fetching descendants for group ${id}:`, error)
      throw this.handleError(error, 'Failed to fetch descendants')
    }
  }

  /**
   * Validate if a group name is unique at the given level
   */
  async validateNameUnique(name: string, parentId?: number, excludeId?: number): Promise<boolean> {
    try {
      const params = {
        name: name.trim(),
        parentId,
        excludeId,
      }

      const response = await apiClient.get<{ success: boolean; isUnique: boolean; error?: string }>(
        `${this.baseUrl}/validate/name-unique`,
        { params: this.sanitizeParams(params) }
      )

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to validate name uniqueness')
      }

      return response.data.isUnique
    } catch (error) {
      console.error('Error validating name uniqueness:', error)
      throw this.handleError(error, 'Failed to validate name uniqueness')
    }
  }

  /**
   * Check if a group can be deleted (no children or devices)
   */
  async canDelete(id: number): Promise<{ canDelete: boolean; reason?: string }> {
    try {
      const response = await apiClient.get<{
        success: boolean
        canDelete: boolean
        reason?: string
        error?: string
      }>(`${this.baseUrl}/${id}/can-delete`)

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to check delete permission')
      }

      const result: { canDelete: boolean; reason?: string } = {
        canDelete: response.data.canDelete,
      }
      
      if (response.data.reason) {
        result.reason = response.data.reason
      }
      
      return result
    } catch (error) {
      console.error(`Error checking delete permission for group ${id}:`, error)
      throw this.handleError(error, 'Failed to check delete permission')
    }
  }

  /**
   * Check if a group can be moved to a new parent (no circular reference)
   */
  async canMove(id: number, newParentId?: number): Promise<{ canMove: boolean; reason?: string }> {
    try {
      const params = {
        newParentId,
      }

      const response = await apiClient.get<{
        success: boolean
        canMove: boolean
        reason?: string
        error?: string
      }>(`${this.baseUrl}/${id}/can-move`, {
        params: this.sanitizeParams(params),
      })

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to check move permission')
      }

      const result: { canMove: boolean; reason?: string } = {
        canMove: response.data.canMove,
      }
      
      if (response.data.reason) {
        result.reason = response.data.reason
      }
      
      return result
    } catch (error) {
      console.error(`Error checking move permission for group ${id}:`, error)
      throw this.handleError(error, 'Failed to check move permission')
    }
  }

  /**
   * Get statistics about device groups
   */
  async getStatistics(): Promise<{
    totalGroups: number
    maxDepth: number
    rootGroups: number
    totalDevices: number
  }> {
    try {
      const response = await apiClient.get<{
        success: boolean
        data?: {
          totalGroups: number
          maxDepth: number
          rootGroups: number
          totalDevices: number
        }
        error?: string
      }>(`${this.baseUrl}/statistics`)

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to fetch statistics')
      }

      return response.data.data
    } catch (error) {
      console.error('Error fetching device group statistics:', error)
      throw this.handleError(error, 'Failed to fetch statistics')
    }
  }

  /**
   * Private helper methods
   */
  private sanitizeParams(params?: Record<string, any>): Record<string, any> {
    if (!params) return {}

    const sanitized: Record<string, any> = {}

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        sanitized[key] = value
      }
    })

    return sanitized
  }

  private handleError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.error) {
      return new Error(error.response.data.error)
    }

    if (error.response?.data?.message) {
      return new Error(error.response.data.message)
    }

    if (error.message) {
      return new Error(error.message)
    }

    return new Error(defaultMessage)
  }
}

// Create and export singleton instance
export const deviceGroupService = new DeviceGroupService()

// Export default for easier importing
export default deviceGroupService