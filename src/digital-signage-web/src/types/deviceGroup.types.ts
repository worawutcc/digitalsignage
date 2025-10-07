/**
 * TypeScript interface definitior Device Groups feature
 * Following copilot-instructions-ui.instructions.md patterns
 */

// Core entity from backend API
export interface DeviceGroup {
  id: number
  name: string
  description?: string
  parentId?: number
  parentName?: string
  level: number
  path: string
  deviceCount: number
  childGroupCount: number
  totalDeviceCount: number
  createdAt: string
  updatedAt: string
  canDelete: boolean
  canMove: boolean
  // Frontend-specific properties
  isExpanded?: boolean
  children?: DeviceGroup[]
}

// Hierarchical tree representation for UI components
export interface DeviceGroupTree {
  groups: DeviceGroup[]
  rootGroups: DeviceGroup[]
  totalCount: number
  maxDepth: number
  lastUpdated: string
}

// Form data interface for React Hook Form
export interface DeviceGroupFormData {
  name: string
  description?: string
  parentGroupId?: number
}

// Search and filtering parameters
export interface DeviceGroupSearchParams {
  query?: string
  parentId?: number
  includeChildren?: boolean
  level?: number
  sortBy?: 'name' | 'createdAt' | 'deviceCount'
  sortOrder?: 'asc' | 'desc'
}

// Async operation tracking for optimistic updates
export interface DeviceGroupOperation {
  id: string
  type: 'create' | 'update' | 'delete' | 'move'
  groupId?: number
  status: 'pending' | 'success' | 'error'
  timestamp: number
  error?: string
}

// API Request types
export interface CreateDeviceGroupRequest {
  name: string
  description?: string
  parentGroupId?: number
}

export interface UpdateDeviceGroupRequest {
  name: string
  description?: string
  parentGroupId?: number
}

// API Response types
export interface DeviceGroupResponse {
  success: boolean
  data?: DeviceGroup
  error?: string
  message?: string
}

export interface DeviceGroupListResponse {
  success: boolean
  data?: DeviceGroup[]
  error?: string
  totalCount?: number
}

export interface DeviceGroupTreeResponse {
  success: boolean
  data?: DeviceGroupTree
  error?: string
}

// UI State interfaces
export interface DeviceGroupUIState {
  selectedGroupId?: number
  expandedGroups: Set<number>
  searchQuery: string
  searchResults: DeviceGroup[]
  isSearchActive: boolean
  draggedGroup?: DeviceGroup
  dropTarget?: DeviceGroup
  viewMode: 'tree' | 'list'
  sortOrder: 'name' | 'created' | 'deviceCount'
}

// Modal state interface
export interface DeviceGroupModalState {
  isOpen: boolean
  mode: 'create' | 'edit' | 'delete' | 'view'
  selectedGroup?: DeviceGroup
  parentGroup?: DeviceGroup
}

// Error handling interface
export interface DeviceGroupError {
  code: string
  message: string
  field?: string
  details?: Record<string, any>
}

// Common error codes
export const DeviceGroupErrorCodes = {
  DUPLICATE_NAME: 'DUPLICATE_NAME',
  INVALID_PARENT: 'INVALID_PARENT',
  CIRCULAR_REFERENCE: 'CIRCULAR_REFERENCE',
  HAS_CHILDREN: 'HAS_CHILDREN',
  HAS_DEVICES: 'HAS_DEVICES',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const

export type DeviceGroupErrorCode = typeof DeviceGroupErrorCodes[keyof typeof DeviceGroupErrorCodes]

// Component prop interfaces
export interface DeviceGroupTreeProps {
  groups: DeviceGroup[]
  selectedGroupId?: number
  expandedGroups: Set<number>
  onGroupSelect: (group: DeviceGroup) => void
  onGroupExpand: (groupId: number) => void
  onGroupCreate: (parentGroup?: DeviceGroup) => void
  onGroupEdit: (group: DeviceGroup) => void
  onGroupDelete: (group: DeviceGroup) => void
  onGroupMove: (sourceGroup: DeviceGroup, targetGroup: DeviceGroup) => void
  isLoading?: boolean
}

export interface DeviceGroupItemProps {
  group: DeviceGroup
  isSelected: boolean
  isExpanded: boolean
  level: number
  onSelect: (group: DeviceGroup) => void
  onExpand: (groupId: number) => void
  onContextMenu: (group: DeviceGroup, event: React.MouseEvent) => void
  isDragOver: boolean
  onDragStart: (group: DeviceGroup) => void
  onDragEnd: () => void
  onDrop: (targetGroup: DeviceGroup) => void
}

export interface DeviceGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: DeviceGroupFormData) => void
  mode: 'create' | 'edit' | 'delete' | 'view'
  groups: DeviceGroup[]
  selectedGroup?: DeviceGroup
  parentGroup?: DeviceGroup
  isLoading?: boolean
}

export interface DeviceGroupSearchProps {
  searchQuery: string
  searchResults: DeviceGroup[]
  isSearchActive: boolean
  onSearchChange: (query: string) => void
  onSearchClear: () => void
  onResultSelect: (group: DeviceGroup) => void
  isLoading?: boolean
}

// Hook return types
export interface UseDeviceGroupsReturn {
  groups: DeviceGroup[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export interface UseDeviceGroupSearchReturn {
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: DeviceGroup[]
  isSearchActive: boolean
  isSearching: boolean
  error: Error | null
}