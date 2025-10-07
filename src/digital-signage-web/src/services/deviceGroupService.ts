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
  // The backend controller is routed at api/devicegroup (singular) in the API project
  private readonly baseUrl = '/api/devicegroup'

  /**
   * Get all device groups with optional filtering and sorting
   */
  async getAll(params?: DeviceGroupSearchParams): Promise<DeviceGroup[]> {
    try {
  // API request: GET /api/devicegroup
      // Backend returns DeviceGroup[] directly, not wrapped in { success, data }
      const response = await apiClient.get<DeviceGroup[]>(this.baseUrl, {
        params: this.sanitizeParams(params),
      })

  // API response returned
      return response.data
    } catch (error) {
      console.error('❌ Error fetching device groups:', error)
      throw this.handleError(error, 'Failed to fetch device groups')
    }
  }

  /**
   * Get device group by ID
   */
  async getById(id: number): Promise<DeviceGroup> {
    try {
      // Backend returns DeviceGroup directly
      const response = await apiClient.get<DeviceGroup>(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching device group ${id}:`, error)
      throw this.handleError(error, 'Failed to fetch device group')
    }
  }

  /**
   * Get hierarchical tree structure of all device groups
   */
  async getTree(params?: DeviceGroupSearchParams): Promise<DeviceGroup[]> {
    try {
      // Backend returns DeviceGroup[] as tree structure directly
      const response = await apiClient.get(`${this.baseUrl}/tree`, {
        params: this.sanitizeParams(params),
      })

      console.log('📡 Device Groups Tree API Response:', response.data)

      // API returns { data: DeviceGroup[] } structure
      const responseData = response.data?.data || response.data
      
      if (!Array.isArray(responseData)) {
        console.error('Invalid response format, expected array:', responseData)
        throw new Error('Invalid device group tree response from server')
      }

      console.log('✅ Parsed Device Groups Tree:', responseData)

      // Return the array of root groups (with children already populated by backend)
      return responseData
    } catch (error) {
      console.error('❌ Error fetching device groups tree:', error)
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

      // Backend returns DeviceGroup[] directly
      const response = await apiClient.get<DeviceGroup[]>(`${this.baseUrl}/search`, {
        params: this.sanitizeParams(searchParams),
      })
      return response.data
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
      // Backend returns DeviceGroup directly
      const response = await apiClient.post<DeviceGroup>(this.baseUrl, data)
      return response.data
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
      // Backend returns DeviceGroup directly
      const response = await apiClient.put<DeviceGroup>(`${this.baseUrl}/${id}`, data)
      return response.data
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
      // Backend returns 204 NoContent on success, or a ProblemDetails/HTTP error on failure
      await apiClient.delete(`${this.baseUrl}/${id}`)
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
      // Backend returns DeviceGroup[] directly
      const response = await apiClient.get<DeviceGroup[]>(`${this.baseUrl}/${id}/ancestors`)
      return response.data
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
      // Backend returns DeviceGroup[] directly
      const response = await apiClient.get<DeviceGroup[]>(`${this.baseUrl}/${id}/descendants`)
      return response.data
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

      // Backend returns { isUnique: boolean } directly
      const response = await apiClient.get<{ isUnique: boolean }>(
        `${this.baseUrl}/validate/name-unique`,
        { params: this.sanitizeParams(params) }
      )

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
      // Backend does not expose a dedicated can-delete endpoint.
      // Derive deleteability from the group's counts: no child groups and no devices.
      const group = await this.getById(id)

  const canDelete = (group.childGroupCount ?? 0) === 0 && (group.deviceCount ?? 0) === 0
  const reasonText = canDelete ? undefined : 'Group has child groups or devices'

  const result: { canDelete: boolean; reason?: string } = { canDelete }
  if (reasonText) result.reason = reasonText

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
      // Backend exposes: GET /api/devicegroup/{id}/can-move-to/{parentId?}
      const path = typeof newParentId === 'number'
        ? `${this.baseUrl}/${id}/can-move-to/${newParentId}`
        : `${this.baseUrl}/${id}/can-move-to`

      const response = await apiClient.get<{ canMove: boolean; reason?: string }>(path)

      const moveResult: { canMove: boolean; reason?: string } = { canMove: response.data.canMove }
      if (response.data.reason) moveResult.reason = response.data.reason
      return moveResult
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
      // Backend exposes content-distribution-stats which returns the stats DTO directly
      const response = await apiClient.get<{
        totalGroups: number
        maxDepth: number
        rootGroups: number
        totalDevices: number
      }>(`${this.baseUrl}/content-distribution-stats`)

      return response.data
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