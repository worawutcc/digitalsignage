/**
 * useDeviceGroups hook - Main query hook for device groups
 * Following copilot-instructions-ui.instructions.md patterns with React Query
 */

import { useState, useEffect } from 'react'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { deviceGroupKeys } from '@/hooks/keys/deviceGroupKeys'
import { deviceGroupService } from '@/services/deviceGroupService'
import type { DeviceGroup, DeviceGroupSearchParams } from '@/types/deviceGroup.types'

/**
 * Hook for fetching all device groups with optional filtering and sorting
 */
export function useDeviceGroups(
  params?: DeviceGroupSearchParams,
  options?: {
    enabled?: boolean
    refetchInterval?: number
    staleTime?: number
    cacheTime?: number
  }
): UseQueryResult<DeviceGroup[], Error> {
  return useQuery({
    queryKey: deviceGroupKeys.list(params),
    queryFn: () => deviceGroupService.getAll(params),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval ?? 30000, // 30 seconds
    staleTime: options?.staleTime ?? 10000, // 10 seconds
    cacheTime: options?.cacheTime ?? 300000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false
      }
      return failureCount < 3
    },
    onError: (error: Error) => {
      console.error('Error in useDeviceGroups:', error)
    },
  })
}

/**
 * Hook for fetching a single device group by ID
 */
export function useDeviceGroup(
  id: number,
  options?: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  }
): UseQueryResult<DeviceGroup, Error> {
  return useQuery({
    queryKey: deviceGroupKeys.detail(id),
    queryFn: () => deviceGroupService.getById(id),
    enabled: (options?.enabled ?? true) && !!id,
    staleTime: options?.staleTime ?? 30000, // 30 seconds
    cacheTime: options?.cacheTime ?? 300000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 errors
      if (error?.response?.status === 404) {
        return false
      }
      // Don't retry on other 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false
      }
      return failureCount < 3
    },
    onError: (error: Error) => {
      console.error(`Error in useDeviceGroup for ID ${id}:`, error)
    },
  })
}

/**
 * Hook for fetching device groups tree structure
 */
export function useDeviceGroupsTree(
  params?: DeviceGroupSearchParams,
  options?: {
    enabled?: boolean
    refetchInterval?: number
    staleTime?: number
    cacheTime?: number
  }
) {
  return useQuery({
    queryKey: deviceGroupKeys.tree(params),
    queryFn: () => deviceGroupService.getTree(params),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval ?? 30000, // 30 seconds
    staleTime: options?.staleTime ?? 15000, // 15 seconds
    cacheTime: options?.cacheTime ?? 300000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false
      }
      return failureCount < 3
    },
    onError: (error: Error) => {
      console.error('Error in useDeviceGroupsTree:', error)
    },
  })
}

/**
 * Hook for fetching device group ancestors (parent hierarchy)
 */
export function useDeviceGroupAncestors(
  id: number,
  options?: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  }
): UseQueryResult<DeviceGroup[], Error> {
  return useQuery({
    queryKey: deviceGroupKeys.ancestors(id),
    queryFn: () => deviceGroupService.getAncestors(id),
    enabled: (options?.enabled ?? true) && !!id,
    staleTime: options?.staleTime ?? 60000, // 1 minute (hierarchy changes infrequently)
    cacheTime: options?.cacheTime ?? 600000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false
      }
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false
      }
      return failureCount < 3
    },
    onError: (error: Error) => {
      console.error(`Error in useDeviceGroupAncestors for ID ${id}:`, error)
    },
  })
}

/**
 * Hook for fetching device group descendants (children hierarchy)
 */
export function useDeviceGroupDescendants(
  id: number,
  options?: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  }
): UseQueryResult<DeviceGroup[], Error> {
  return useQuery({
    queryKey: deviceGroupKeys.descendants(id),
    queryFn: () => deviceGroupService.getDescendants(id),
    enabled: (options?.enabled ?? true) && !!id,
    staleTime: options?.staleTime ?? 30000, // 30 seconds
    cacheTime: options?.cacheTime ?? 300000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false
      }
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false
      }
      return failureCount < 3
    },
    onError: (error: Error) => {
      console.error(`Error in useDeviceGroupDescendants for ID ${id}:`, error)
    },
  })
}

/**
 * Hook for fetching device group statistics
 */
export function useDeviceGroupStatistics(
  options?: {
    enabled?: boolean
    refetchInterval?: number
    staleTime?: number
    cacheTime?: number
  }
) {
  return useQuery({
    queryKey: deviceGroupKeys.stat('count'),
    queryFn: () => deviceGroupService.getStatistics(),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval ?? 60000, // 1 minute
    staleTime: options?.staleTime ?? 30000, // 30 seconds
    cacheTime: options?.cacheTime ?? 600000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false
      }
      return failureCount < 3
    },
    onError: (error: Error) => {
      console.error('Error in useDeviceGroupStatistics:', error)
    },
  })
}

/**
 * Hook for validating device group name uniqueness with debounce
 */
export function useDeviceGroupNameValidation(
  name: string,
  parentId?: number,
  excludeId?: number,
  options?: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
    debounceMs?: number
  }
) {
  const [debouncedName, setDebouncedName] = useState(name)
  
  // Debounce the name input to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedName(name)
    }, options?.debounceMs ?? 500) // Default 500ms debounce
    
    return () => clearTimeout(timer)
  }, [name, options?.debounceMs])
  
  return useQuery({
    queryKey: deviceGroupKeys.nameUnique(debouncedName, parentId),
    queryFn: () => deviceGroupService.validateNameUnique(debouncedName, parentId, excludeId),
    enabled: (options?.enabled ?? true) && !!debouncedName.trim() && debouncedName.length >= 2,
    staleTime: options?.staleTime ?? 60000, // 1 minute
    cacheTime: options?.cacheTime ?? 300000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false, // Don't retry validation queries
    onError: (error: Error) => {
      console.error('Error in useDeviceGroupNameValidation:', error)
    },
  })
}

/**
 * Hook for checking if a device group can be deleted
 */
export function useDeviceGroupCanDelete(
  id: number,
  options?: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  }
) {
  return useQuery({
    queryKey: deviceGroupKeys.canDelete(id),
    queryFn: () => deviceGroupService.canDelete(id),
    enabled: (options?.enabled ?? true) && !!id,
    staleTime: options?.staleTime ?? 30000, // 30 seconds
    cacheTime: options?.cacheTime ?? 300000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false
      }
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false
      }
      return failureCount < 3
    },
    onError: (error: Error) => {
      console.error(`Error in useDeviceGroupCanDelete for ID ${id}:`, error)
    },
  })
}

/**
 * Hook for checking if a device group can be moved
 */
export function useDeviceGroupCanMove(
  id: number,
  newParentId?: number,
  options?: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  }
) {
  return useQuery({
    queryKey: deviceGroupKeys.canMove(id, newParentId),
    queryFn: () => deviceGroupService.canMove(id, newParentId),
    enabled: (options?.enabled ?? true) && !!id,
    staleTime: options?.staleTime ?? 30000, // 30 seconds
    cacheTime: options?.cacheTime ?? 300000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false
      }
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false
      }
      return failureCount < 3
    },
    onError: (error: Error) => {
      console.error(`Error in useDeviceGroupCanMove for ID ${id}:`, error)
    },
  })
}