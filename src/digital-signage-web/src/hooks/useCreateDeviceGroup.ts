/**
 * useCreateDeviceGroup hook - Mutation hook for creating device groups
 * Following copilot-instructions-ui.instructions.md patterns with React Query
 */

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import { deviceGroupKeys } from '@/hooks/keys/deviceGroupKeys'
import { deviceGroupService } from '@/services/deviceGroupService'
import type { 
  DeviceGroup, 
  CreateDeviceGroupRequest, 
  DeviceGroupResponse 
} from '@/types/deviceGroup.types'

interface UseCreateDeviceGroupOptions {
  onSuccess?: (data: DeviceGroupResponse) => void
  onError?: (error: Error) => void
  onSettled?: () => void
  enableOptimisticUpdate?: boolean
}

/**
 * Hook for creating a new device group with optimistic updates
 */
export function useCreateDeviceGroup(
  options?: UseCreateDeviceGroupOptions
): UseMutationResult<DeviceGroupResponse, Error, CreateDeviceGroupRequest> {
  const queryClient = useQueryClient()

  return (useMutation as any)({
    mutationFn: (data: CreateDeviceGroupRequest) => deviceGroupService.create(data),
    
    onMutate: async (newDeviceGroup: CreateDeviceGroupRequest) => {
      if (!options?.enableOptimisticUpdate) return

      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: deviceGroupKeys.all })

      // Snapshot the previous value
      const previousDeviceGroups = queryClient.getQueryData<DeviceGroup[]>(
        deviceGroupKeys.list()
      )
      const previousTree = queryClient.getQueryData(deviceGroupKeys.tree())

      // Create optimistic device group
      const optimisticDeviceGroup: DeviceGroup = {
        id: Date.now(), // Temporary ID
        name: newDeviceGroup.name,
        ...(newDeviceGroup.description !== undefined && { description: newDeviceGroup.description }),
        ...(newDeviceGroup.parentGroupId !== undefined && { parentId: newDeviceGroup.parentGroupId }),
        level: 0, // Will be calculated by backend
        path: '', // Will be calculated by backend
        deviceCount: 0,
        childGroupCount: 0,
        totalDeviceCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        canDelete: true,
        canMove: true,
        children: [],
      }      // Optimistically update to the new value
      if (previousDeviceGroups) {
        queryClient.setQueryData<DeviceGroup[]>(
          deviceGroupKeys.list(),
          old => old ? [...old, optimisticDeviceGroup] : [optimisticDeviceGroup]
        )
      }

      // Update tree structure if available
      if (previousTree) {
        queryClient.setQueryData(
          deviceGroupKeys.tree(),
          (old: any) => {
            // Add to tree structure (simplified - real tree logic would be more complex)
            return old
          }
        )
      }

      // Update parent's children count if has parent
      if (newDeviceGroup.parentGroupId) {
        queryClient.setQueryData<DeviceGroup>(
          deviceGroupKeys.detail(newDeviceGroup.parentGroupId),
          old => old ? {
            ...old,
            childGroupCount: old.childGroupCount + 1,
            children: old.children ? [...old.children, optimisticDeviceGroup] : [optimisticDeviceGroup]
          } : old
        )
      }

      // Return a context object with the snapshotted value
      return { previousDeviceGroups, previousTree, optimisticDeviceGroup }
    },

    onError: (err: Error, newDeviceGroup: CreateDeviceGroupRequest, context: any) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousDeviceGroups) {
        queryClient.setQueryData(
          deviceGroupKeys.list(),
          context.previousDeviceGroups
        )
      }
      if (context?.previousTree) {
        queryClient.setQueryData(
          deviceGroupKeys.tree(),
          context.previousTree
        )
      }

      // Revert parent's children count
      if (newDeviceGroup.parentGroupId && context?.optimisticDeviceGroup) {
        queryClient.setQueryData<DeviceGroup>(
          deviceGroupKeys.detail(newDeviceGroup.parentGroupId),
          old => old ? {
            ...old,
            childGroupCount: Math.max(0, old.childGroupCount - 1),
            children: old.children?.filter(child => child.id !== context.optimisticDeviceGroup.id) || []
          } : old
        )
      }

      console.error('Error creating device group:', err)
      options?.onError?.(err)
    },

    onSuccess: (data: DeviceGroupResponse, variables: CreateDeviceGroupRequest) => {
      // Update the cache with the real data from the server
      if (!data.data) return
      
      queryClient.setQueryData<DeviceGroup[]>(
        deviceGroupKeys.list(),
        old => {
          if (!old) return [data.data!]
          
          // Replace optimistic update with real data
          const optimisticIndex = old.findIndex(item => item.id === Date.now())
          if (optimisticIndex >= 0) {
            const newList = [...old]
            newList[optimisticIndex] = data.data!
            return newList
          }
          
          // Add if not found (fallback)
          return [...old, data.data!]
        }
      )

      // Update individual cache entry
      queryClient.setQueryData(
        deviceGroupKeys.detail(data.data.id),
        data.data
      )

      // Update parent's data with real information
      if (variables.parentGroupId && data.data) {
        queryClient.setQueryData<DeviceGroup>(
          deviceGroupKeys.detail(variables.parentGroupId),
          old => {
            if (!old) return old
            
            const updatedChildren = old.children?.map(child => 
              child.id === Date.now() ? data.data! : child
            ).filter((child): child is DeviceGroup => Boolean(child)) || [data.data]
            
            return {
              ...old,
              childGroupCount: old.childGroupCount + 1,
              children: updatedChildren
            } as DeviceGroup
          }
        )
      }

      console.log('Device group created successfully:', data.data.name)
      options?.onSuccess?.(data)
    },

    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.all })
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.stat('count') })
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
      errorMessage: 'Failed to create device group',
      successMessage: 'Device group created successfully',
    },
  })
}

/**
 * Hook for bulk creating multiple device groups
 */
export function useBulkCreateDeviceGroups(
  options?: {
    onSuccess?: (results: DeviceGroupResponse[]) => void
    onError?: (error: Error) => void
  }
): UseMutationResult<DeviceGroupResponse[], Error, CreateDeviceGroupRequest[]> {
  const queryClient = useQueryClient()

  return (useMutation as any)({
    mutationFn: async (requests: CreateDeviceGroupRequest[]) => {
      // Execute all creates in parallel
      const promises = requests.map(request => deviceGroupService.create(request))
      return Promise.all(promises)
    },

    onSuccess: (results: DeviceGroupResponse[]) => {
      // Invalidate all related queries for a fresh fetch
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.all })
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.stat('count') })

      console.log(`Bulk created ${results.length} device groups successfully`)
      options?.onSuccess?.(results)
    },

    onError: (error: Error) => {
      console.error('Error bulk creating device groups:', error)
      options?.onError?.(error)
    },

    retry: (failureCount: number, error: any) => {
      // Don't retry on validation errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false
      }
      return failureCount < 2
    },

    meta: {
      errorMessage: 'Failed to create device groups',
      successMessage: 'Device groups created successfully',
    },
  })
}

/**
 * Hook for creating a device group with validation
 */
export function useCreateDeviceGroupWithValidation(
  options?: UseCreateDeviceGroupOptions & {
    validateNameUnique?: boolean
  }
): UseMutationResult<DeviceGroupResponse, Error, CreateDeviceGroupRequest> {
  const queryClient = useQueryClient()

  return (useMutation as any)({
    mutationFn: async (data: CreateDeviceGroupRequest) => {
      // Optional name validation before creation
      if (options?.validateNameUnique) {
        const isUnique = await deviceGroupService.validateNameUnique(
          data.name,
          data.parentGroupId
        )
        if (!isUnique) {
          throw new Error('Device group name already exists in this location')
        }
      }

      return deviceGroupService.create(data)
    },

    onSuccess: (data: DeviceGroupResponse, variables: CreateDeviceGroupRequest) => {
      if (!data.data) return

      // Update cache
      queryClient.setQueryData<DeviceGroup[]>(
        deviceGroupKeys.list(),
        old => old ? [...old, data.data!] : [data.data!]
      )

      queryClient.setQueryData(
        deviceGroupKeys.detail(data.data.id),
        data.data
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.all })
      queryClient.invalidateQueries({ queryKey: deviceGroupKeys.stat('count') })

      // Clear validation cache for this name
      queryClient.removeQueries({
        queryKey: deviceGroupKeys.nameUnique(variables.name, variables.parentGroupId)
      })

      console.log('Device group created with validation:', data.data.name)
      options?.onSuccess?.(data)
    },

    onError: (error: Error) => {
      console.error('Error creating device group with validation:', error)
      options?.onError?.(error)
    },

    retry: false, // Don't retry validation failures

    meta: {
      errorMessage: 'Failed to create device group',
      successMessage: 'Device group created successfully',
    },
  })
}