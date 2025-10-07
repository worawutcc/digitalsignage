/**
 * useDeleteDeviceGroup hook - Mutation hook for deleting device groups
 * Following copilot-instructions-ui.instructions.md patterns with React Query
 */

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import { deviceGroupKeys } from '@/hooks/keys/deviceGroupKeys'
import { deviceGroupService } from '@/services/deviceGroupService'
import type { DeviceGroup } from '@/types/deviceGroup.types'

interface UseDeleteDeviceGroupOptions {
  onSuccess?: (deletedGroup: DeviceGroup) => void
  onError?: (error: Error) => void
  onSettled?: () => void
  enableOptimisticUpdate?: boolean
}

/**
 * Hook for deleting a single device group
 */
export function useDeleteDeviceGroup(
  options?: UseDeleteDeviceGroupOptions
): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deviceGroupService.delete(id),

    onMutate: async (id: number) => {
      if (!options?.enableOptimisticUpdate) return

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: deviceGroupKeys.all })

      // Snapshot the previous data
      const previousGroup = queryClient.getQueryData<DeviceGroup>(
        deviceGroupKeys.detail(id)
      )
      const previousGroups = queryClient.getQueryData<DeviceGroup[]>(
        deviceGroupKeys.list()
      )

      // Optimistically remove from cache
      if (previousGroups) {
        queryClient.setQueryData<DeviceGroup[]>(
          deviceGroupKeys.list(),
          old => old?.filter(group => group.id !== id) || []
        )
      }

      // Remove individual cache entry
      queryClient.removeQueries({ queryKey: deviceGroupKeys.detail(id) })

      // Update parent's child count if has parent
      if (previousGroup?.parentId) {
        queryClient.setQueryData<DeviceGroup>(
          deviceGroupKeys.detail(previousGroup.parentId),
          old => old ? {
            ...old,
            childGroupCount: Math.max(0, old.childGroupCount - 1),
            children: old.children?.filter(child => child.id !== id) || []
          } : old
        )
      }

      return { previousGroup, previousGroups }
    },

    onError: (err: Error, id: number, context: any) => {
      // Rollback optimistic updates
      if (context?.previousGroups) {
        queryClient.setQueryData(
          deviceGroupKeys.list(),
          context.previousGroups
        )
      }

      if (context?.previousGroup) {
        queryClient.setQueryData(
          deviceGroupKeys.detail(id),
          context.previousGroup
        )

        // Restore parent's child count
        if (context.previousGroup.parentId) {
          queryClient.setQueryData<DeviceGroup>(
            deviceGroupKeys.detail(context.previousGroup.parentId),
            old => old ? {
              ...old,
              childGroupCount: old.childGroupCount + 1,
              children: old.children ? [...old.children, context.previousGroup] : [context.previousGroup]
            } : old
          )
        }
      }

      console.error('Error deleting device group:', err)
      options?.onError?.(err)
    },

    onSuccess: (_, id: number, context: any) => {
      // Permanently remove from cache
      queryClient.removeQueries({ queryKey: deviceGroupKeys.detail(id) })
      queryClient.removeQueries({ queryKey: deviceGroupKeys.descendants(id) })
      queryClient.removeQueries({ queryKey: deviceGroupKeys.ancestors(id) })

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.all })
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.tree() })
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.stat('count') })

      console.log('Device group deleted successfully')
      
      if (context?.previousGroup) {
        options?.onSuccess?.(context.previousGroup)
      }
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
      errorMessage: 'Failed to delete device group',
      successMessage: 'Device group deleted successfully',
    },
  })
}

/**
 * Hook for deleting device group with dependency validation
 */
export function useDeleteDeviceGroupWithValidation(
  options?: UseDeleteDeviceGroupOptions & {
    skipValidation?: boolean
  }
): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      // Validate if group can be deleted (unless skipped)
      if (!options?.skipValidation) {
        const canDelete = await deviceGroupService.canDelete(id)
        if (!canDelete) {
          throw new Error('Cannot delete device group: contains child groups or devices')
        }
      }

      return deviceGroupService.delete(id)
    },

    onSuccess: (_, id: number) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: deviceGroupKeys.detail(id) })
      queryClient.removeQueries({ queryKey: deviceGroupKeys.descendants(id) })
      queryClient.removeQueries({ queryKey: deviceGroupKeys.ancestors(id) })

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.all })
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.tree() })
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.stat('count') })

      console.log('Device group deleted with validation')

      // Get deleted group from cache before removal for callback
      const deletedGroup = queryClient.getQueryData<DeviceGroup>(
        deviceGroupKeys.detail(id)
      )
      if (deletedGroup) {
        options?.onSuccess?.(deletedGroup)
      }
    },

    onError: (error: Error) => {
      console.error('Error deleting device group with validation:', error)
      options?.onError?.(error)
    },

    onSettled: () => {
      options?.onSettled?.()
    },

    retry: false, // Don't retry validation failures

    meta: {
      errorMessage: 'Failed to delete device group',
      successMessage: 'Device group deleted successfully',
    },
  })
}

/**
 * Hook for bulk deleting multiple device groups
 */
export function useBulkDeleteDeviceGroups(
  options?: {
    onSuccess?: (deletedIds: number[]) => void
    onError?: (error: Error) => void
    onSettled?: () => void
    validateBeforeDelete?: boolean
  }
): UseMutationResult<void, Error, number[]> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      // Validate all groups can be deleted if required
      if (options?.validateBeforeDelete) {
        const validationPromises = ids.map(id => deviceGroupService.canDelete(id))
        const canDeleteResults = await Promise.all(validationPromises)
        
        const invalidIds = ids.filter((_, index) => !canDeleteResults[index])
        if (invalidIds.length > 0) {
          throw new Error(`Cannot delete groups: ${invalidIds.join(', ')} contain child groups or devices`)
        }
      }

      // Execute all deletes in parallel
      const deletePromises = ids.map(id => deviceGroupService.delete(id))
      await Promise.all(deletePromises)
    },

    onSuccess: (_, deletedIds: number[]) => {
      // Remove all deleted groups from cache
      deletedIds.forEach(id => {
        queryClient.removeQueries({ queryKey: deviceGroupKeys.detail(id) })
        queryClient.removeQueries({ queryKey: deviceGroupKeys.descendants(id) })
        queryClient.removeQueries({ queryKey: deviceGroupKeys.ancestors(id) })
      })

      // Invalidate all related queries for fresh data
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.all })
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.tree() })
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.stat('count') })

      console.log(`Bulk deleted ${deletedIds.length} device groups successfully`)
      options?.onSuccess?.(deletedIds)
    },

    onError: (error: Error) => {
      console.error('Error bulk deleting device groups:', error)
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
      errorMessage: 'Failed to delete device groups',
      successMessage: 'Device groups deleted successfully',
    },
  })
}

/**
 * Hook for deleting device group and all its descendants
 */
export function useDeleteDeviceGroupCascade(
  options?: UseDeleteDeviceGroupOptions
): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      // Get all descendants first
      const descendants = await deviceGroupService.getDescendants(id)
      const allIds = [id, ...descendants.map(group => group.id)]

      // Delete all groups (backend should handle cascade)
      await deviceGroupService.delete(id)
      
      return allIds
    },

    onSuccess: (allIds: any, originalId: number) => {
      // Remove all affected groups from cache
      const idsToRemove = Array.isArray(allIds) ? allIds : [originalId]
      
      idsToRemove.forEach((id: number) => {
        queryClient.removeQueries({ queryKey: deviceGroupKeys.detail(id) })
        queryClient.removeQueries({ queryKey: deviceGroupKeys.descendants(id) })
        queryClient.removeQueries({ queryKey: deviceGroupKeys.ancestors(id) })
      })

      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.all })
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.tree() })
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.stat('count') })

      console.log(`Cascade deleted device group and ${idsToRemove.length - 1} descendants`)

      // Get deleted group from cache for callback
      const deletedGroup = queryClient.getQueryData<DeviceGroup>(
        deviceGroupKeys.detail(originalId)
      )
      if (deletedGroup) {
        options?.onSuccess?.(deletedGroup)
      }
    },

    onError: (error: Error) => {
      console.error('Error cascade deleting device group:', error)
      options?.onError?.(error)
    },

    onSettled: () => {
      options?.onSettled?.()
    },

    retry: false, // Don't retry cascade operations

    meta: {
      errorMessage: 'Failed to delete device group and children',
      successMessage: 'Device group and children deleted successfully',
    },
  })
}