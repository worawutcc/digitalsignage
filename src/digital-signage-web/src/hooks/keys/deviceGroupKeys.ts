/**
 * React Query keys structure for Device Groups feature
 * Following copilot-instructions-ui.instructions.md patterns with TanStack Query
 */

import type { DeviceGroupSearchParams } from '@/types/deviceGroup.types'

/**
 * Device Group query keys for React Query
 * Organized hierarchically to enable granular cache invalidation
 */
export const deviceGroupKeys = {
  // Base key for all device group queries
  all: ['deviceGroups'] as const,
  
  // List queries (filtered, sorted, paginated)
  lists: () => [...deviceGroupKeys.all, 'list'] as const,
  list: (filters: DeviceGroupSearchParams = {}) => 
    [...deviceGroupKeys.lists(), filters] as const,
  
  // Detail queries (single device group)
  details: () => [...deviceGroupKeys.all, 'detail'] as const,
  detail: (id: number) => [...deviceGroupKeys.details(), id] as const,
  
  // Tree structure queries
  trees: () => [...deviceGroupKeys.all, 'tree'] as const,
  tree: (filters: DeviceGroupSearchParams = {}) => 
    [...deviceGroupKeys.trees(), filters] as const,
  
  // Search queries
  searches: () => [...deviceGroupKeys.all, 'search'] as const,
  search: (query: string) => [...deviceGroupKeys.searches(), query] as const,
  
  // Statistics and counts
  stats: () => [...deviceGroupKeys.all, 'stats'] as const,
  stat: (type: 'count' | 'depth' | 'distribution') => 
    [...deviceGroupKeys.stats(), type] as const,
  
  // Hierarchy-related queries
  hierarchies: () => [...deviceGroupKeys.all, 'hierarchy'] as const,
  ancestors: (id: number) => [...deviceGroupKeys.hierarchies(), 'ancestors', id] as const,
  descendants: (id: number) => [...deviceGroupKeys.hierarchies(), 'descendants', id] as const,
  siblings: (id: number) => [...deviceGroupKeys.hierarchies(), 'siblings', id] as const,
  
  // Validation queries
  validations: () => [...deviceGroupKeys.all, 'validation'] as const,
  nameUnique: (name: string, parentId?: number) => 
    [...deviceGroupKeys.validations(), 'nameUnique', name, parentId] as const,
  canDelete: (id: number) => 
    [...deviceGroupKeys.validations(), 'canDelete', id] as const,
  canMove: (id: number, newParentId?: number) => 
    [...deviceGroupKeys.validations(), 'canMove', id, newParentId] as const,
} as const

/**
 * Helper functions for query key management
 */
export const deviceGroupKeyUtils = {
  // Get all query keys for a specific device group (for cache invalidation)
  getGroupKeys: (id: number) => [
    deviceGroupKeys.detail(id),
    deviceGroupKeys.ancestors(id),
    deviceGroupKeys.descendants(id),
    deviceGroupKeys.siblings(id),
    deviceGroupKeys.canDelete(id),
  ],
  
  // Get keys that should be invalidated when a group is created
  getCreateInvalidationKeys: (parentId?: number) => [
    deviceGroupKeys.lists(),
    deviceGroupKeys.trees(),
    deviceGroupKeys.stats(),
    ...(parentId ? [
      deviceGroupKeys.detail(parentId),
      deviceGroupKeys.descendants(parentId),
    ] : []),
  ],
  
  // Get keys that should be invalidated when a group is updated
  getUpdateInvalidationKeys: (id: number, oldParentId?: number, newParentId?: number) => [
    deviceGroupKeys.detail(id),
    deviceGroupKeys.lists(),
    deviceGroupKeys.trees(),
    deviceGroupKeys.stats(),
    deviceGroupKeys.ancestors(id),
    deviceGroupKeys.descendants(id),
    deviceGroupKeys.siblings(id),
    ...(oldParentId && oldParentId !== newParentId ? [
      deviceGroupKeys.detail(oldParentId),
      deviceGroupKeys.descendants(oldParentId),
    ] : []),
    ...(newParentId && oldParentId !== newParentId ? [
      deviceGroupKeys.detail(newParentId),
      deviceGroupKeys.descendants(newParentId),
    ] : []),
  ],
  
  // Get keys that should be invalidated when a group is deleted
  getDeleteInvalidationKeys: (id: number, parentId?: number) => [
    deviceGroupKeys.detail(id),
    deviceGroupKeys.lists(),
    deviceGroupKeys.trees(),
    deviceGroupKeys.stats(),
    deviceGroupKeys.ancestors(id),
    deviceGroupKeys.descendants(id),
    deviceGroupKeys.siblings(id),
    ...(parentId ? [
      deviceGroupKeys.detail(parentId),
      deviceGroupKeys.descendants(parentId),
    ] : []),
  ],
  
  // Get keys for search result invalidation
  getSearchInvalidationKeys: () => [
    deviceGroupKeys.searches(),
  ],
  
  // Get keys for real-time updates
  getRealTimeUpdateKeys: (groupId: number) => [
    deviceGroupKeys.detail(groupId),
    deviceGroupKeys.lists(),
    deviceGroupKeys.trees(),
  ],
} as const

/**
 * Query key type helpers for TypeScript inference
 */
export type DeviceGroupQueryKey = typeof deviceGroupKeys[keyof typeof deviceGroupKeys]
export type DeviceGroupListKey = ReturnType<typeof deviceGroupKeys.list>
export type DeviceGroupDetailKey = ReturnType<typeof deviceGroupKeys.detail>
export type DeviceGroupTreeKey = ReturnType<typeof deviceGroupKeys.tree>
export type DeviceGroupSearchKey = ReturnType<typeof deviceGroupKeys.search>

/**
 * Predefined query key sets for common operations
 */
export const queryKeySets = {
  // Keys for initial page load
  initialLoad: [
    deviceGroupKeys.lists(),
    deviceGroupKeys.trees(),
    deviceGroupKeys.stats(),
  ],
  
  // Keys for form operations
  formOperations: [
    deviceGroupKeys.lists(),
    deviceGroupKeys.validations(),
  ],
  
  // Keys for search operations
  searchOperations: [
    deviceGroupKeys.searches(),
    deviceGroupKeys.lists(),
  ],
  
  // Keys for hierarchy operations
  hierarchyOperations: [
    deviceGroupKeys.hierarchies(),
    deviceGroupKeys.trees(),
    deviceGroupKeys.stats(),
  ],
} as const

/**
 * Cache tags for grouped invalidation
 */
export const cacheTagging = {
  // Tag all device group related queries
  deviceGroups: 'device-groups',
  
  // Tag hierarchy-specific queries
  hierarchy: 'device-groups-hierarchy',
  
  // Tag search-specific queries
  search: 'device-groups-search',
  
  // Tag statistics-specific queries
  statistics: 'device-groups-stats',
  
  // Tag validation-specific queries
  validation: 'device-groups-validation',
} as const