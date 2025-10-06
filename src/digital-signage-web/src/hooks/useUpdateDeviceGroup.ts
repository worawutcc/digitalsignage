/**
 * useUpdateDeviceGroup hook - Mutation hook for updating device groups
 * Following copilot-instructions-ui.instructions.md patterns with React Query
 */

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import { deviceGroupKeys } from '@/hooks/keys/deviceGroupKeys'
import { deviceGroupService } from '@/services/deviceGroupService'
import type { 
  DeviceGroup, 
  UpdateDeviceGroupRequest, 
  DeviceGroupResponse 
} from '@/types/deviceGroup.types'

interface UseUpdateDeviceGroupOptions {
  onSuccess?: (data: DeviceGroupResponse) => void
  onError?: (error: Error) => void
  onSettled?: () => void
  enableOptimisticUpdate?: boolean
}

/**
 * Hook for updating a device group
 */
export function useUpdateDeviceGroup(
  options?: UseUpdateDeviceGroupOptions
): UseMutationResult<DeviceGroup, Error, { id: number; data: UpdateDeviceGroupRequest }> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDeviceGroupRequest }) => 
      deviceGroupService.update(id, data),

    onSuccess: (updatedGroup: DeviceGroup, { id }) => {
      // Update cache entries
      queryClient.setQueryData(
        deviceGroupKeys.detail(id),
        updatedGroup
      )

      // Update list cache
      queryClient.setQueryData<DeviceGroup[]>(
        deviceGroupKeys.list(),
        old => old?.map(group => 
          group.id === id ? updatedGroup : group
        ) || []
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.all })
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.ancestors(id) })
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.descendants(id) })

      console.log('Device group updated successfully:', updatedGroup.name)
      
      // Create response object for callback
      const response: DeviceGroupResponse = {
        success: true,
        data: updatedGroup
      }
      options?.onSuccess?.(response)
    },

    onError: (error: Error) => {
      console.error('Error updating device group:', error)
      options?.onError?.(error)
    },

    onSettled: () => {
      options?.onSettled?.()
    },

    retry: (failureCount: number, error: any) => {
      // Don't retry on validation errors (4xx)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false
      }
      return failureCount < 2
    },

    meta: {
      errorMessage: 'Failed to update device group',
      successMessage: 'Device group updated successfully',
    },
  })
}

/**
 * Hook for moving a device group to a different parent
 */
export function useMoveDeviceGroup(
  options?: UseUpdateDeviceGroupOptions
): UseMutationResult<DeviceGroup, Error, { id: number; newParentId?: number }> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, newParentId }: { id: number; newParentId?: number }) => {
      // First validate the move is allowed
      const canMove = await deviceGroupService.canMove(id, newParentId)
      if (!canMove) {
        throw new Error('Cannot move device group to this location')
      }

      // Get current group to preserve other properties
      const currentGroup = await deviceGroupService.getById(id)
      
      // Update with new parent
      const updateRequest: UpdateDeviceGroupRequest = {
        name: currentGroup.name,
      }
      
      if (currentGroup.description) {
        updateRequest.description = currentGroup.description
      }
      
      if (newParentId !== undefined) {
        updateRequest.parentGroupId = newParentId
      }
      
      return deviceGroupService.update(id, updateRequest)
    },

    onSuccess: (updatedGroup: DeviceGroup, { id }) => {
      // Update cache with real data
      queryClient.setQueryData(
        deviceGroupKeys.detail(id),
        updatedGroup
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.all })
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.tree() })
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.ancestors(id) })
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.descendants(id) })

      console.log('Device group moved successfully:', updatedGroup.name)
      
      // Create response object for callback
      const response: DeviceGroupResponse = {
        success: true,
        data: updatedGroup
      }
      options?.onSuccess?.(response)
    },

    onError: (error: Error) => {
      console.error('Error moving device group:', error)
      options?.onError?.(error)
    },

    onSettled: () => {
      options?.onSettled?.()
    },

    retry: false, // Don't retry move operations

    meta: {
      errorMessage: 'Failed to move device group',
      successMessage: 'Device group moved successfully',
    },
  })
}

/**
 * Hook for bulk updating multiple device groups
 */
export function useBulkUpdateDeviceGroups(
  options?: {
    onSuccess?: (results: DeviceGroup[]) => void
    onError?: (error: Error) => void
    onSettled?: () => void
  }
): UseMutationResult<DeviceGroup[], Error, Array<{ id: number; data: UpdateDeviceGroupRequest }>> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: Array<{ id: number; data: UpdateDeviceGroupRequest }>) => {
      // Execute all updates in parallel
      const promises = updates.map(({ id, data }) => 
        deviceGroupService.update(id, data)
      )
      return Promise.all(promises)
    },

    onSuccess: (results: DeviceGroup[]) => {
      // Update cache for all successful updates
      results.forEach((updatedGroup) => {
        queryClient.setQueryData(
          deviceGroupKeys.detail(updatedGroup.id),
          updatedGroup
        )
      })

      // Invalidate all related queries for fresh data
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.all })

      console.log(`Bulk updated ${results.length} device groups successfully`)
      options?.onSuccess?.(results)
    },

    onError: (error: Error) => {
      console.error('Error bulk updating device groups:', error)
      options?.onError?.(error)
    },

    onSettled: () => {
      options?.onSettled?.()
    },

    retry: (failureCount: number, error: any) => {
      // Don't retry on validation errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false
      }
      return failureCount < 2
    },

    meta: {
      errorMessage: 'Failed to update device groups',
      successMessage: 'Device groups updated successfully',
    },
  })
}