# Data Model: Enhanced Device Groups UI with API Integration

**Phase**: 1 - Design & Contracts  
**Date**: 2025-10-06  
**Feature**: 029-ui-device-groups

## Core Entities

### DeviceGroup
**Source**: Backend API DeviceGroupDto + Frontend types
```typescript
interface DeviceGroup {
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
```

**Validation Rules**:
- `name`: Required, min 1 character, max 255 characters
- `description`: Optional, max 500 characters
- `parentId`: Optional, must be valid existing group ID
- `level`: Read-only, calculated by backend
- `path`: Read-only, calculated by backend
- Device/child counts: Read-only, calculated by backend

**State Transitions**:
- Created → Active
- Active → Updating (during edit)
- Active → Deleting (during delete operation)
- Any → Error (on API failure)

### DeviceGroupTree
**Purpose**: Hierarchical representation for tree UI components
```typescript
interface DeviceGroupTree {
  groups: DeviceGroup[]
  rootGroups: DeviceGroup[]
  totalCount: number
  maxDepth: number
  lastUpdated: string
}
```

### DeviceGroupFormData
**Purpose**: Form input validation with Zod schema
```typescript
interface DeviceGroupFormData {
  name: string
  description?: string
  parentGroupId?: number
}

// Zod Schema
const deviceGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(255, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  parentGroupId: z.number().positive().optional(),
})
```

### DeviceGroupSearchParams
**Purpose**: Search and filtering functionality
```typescript
interface DeviceGroupSearchParams {
  query?: string
  parentId?: number
  includeChildren?: boolean
  level?: number
  sortBy?: 'name' | 'createdAt' | 'deviceCount'
  sortOrder?: 'asc' | 'desc'
}
```

### DeviceGroupOperation
**Purpose**: Track async operations for optimistic updates
```typescript
interface DeviceGroupOperation {
  id: string
  type: 'create' | 'update' | 'delete' | 'move'
  groupId?: number
  status: 'pending' | 'success' | 'error'
  timestamp: number
  error?: string
}
```

## API Request/Response Types

### CreateDeviceGroupRequest
```typescript
interface CreateDeviceGroupRequest {
  name: string
  description?: string
  parentGroupId?: number
}
```

### UpdateDeviceGroupRequest
```typescript
interface UpdateDeviceGroupRequest {
  name: string
  description?: string
  parentGroupId?: number
}
```

### DeviceGroupResponse
```typescript
interface DeviceGroupResponse {
  success: boolean
  data?: DeviceGroup
  error?: string
  message?: string
}
```

### DeviceGroupListResponse
```typescript
interface DeviceGroupListResponse {
  success: boolean
  data?: DeviceGroup[]
  error?: string
  totalCount?: number
}
```

### DeviceGroupTreeResponse
```typescript
interface DeviceGroupTreeResponse {
  success: boolean
  data?: DeviceGroupTree
  error?: string
}
```

## UI State Models

### DeviceGroupUIState
**Purpose**: Component-level state management
```typescript
interface DeviceGroupUIState {
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
```

### DeviceGroupModalState
**Purpose**: Modal state management
```typescript
interface DeviceGroupModalState {
  isOpen: boolean
  mode: 'create' | 'edit' | 'delete' | 'view'
  selectedGroup?: DeviceGroup
  parentGroup?: DeviceGroup
}
```

## React Query Keys

### Query Key Structure
```typescript
// Query Keys for React Query
export const deviceGroupKeys = {
  all: ['deviceGroups'] as const,
  lists: () => [...deviceGroupKeys.all, 'list'] as const,
  list: (filters: DeviceGroupSearchParams) => 
    [...deviceGroupKeys.lists(), filters] as const,
  details: () => [...deviceGroupKeys.all, 'detail'] as const,
  detail: (id: number) => [...deviceGroupKeys.details(), id] as const,
  tree: () => [...deviceGroupKeys.all, 'tree'] as const,
  search: (query: string) => [...deviceGroupKeys.all, 'search', query] as const,
}
```

## Relationships

### Parent-Child Hierarchy
- Each DeviceGroup can have one parent (parentId)
- Each DeviceGroup can have multiple children
- Root groups have parentId = null
- Maximum depth recommended: 10 levels
- Circular references prevented by backend validation

### Device Assignment
- Devices belong to exactly one DeviceGroup
- DeviceGroup.deviceCount shows direct device assignments
- DeviceGroup.totalDeviceCount includes devices in child groups
- Device assignment managed through separate API endpoints

### Content Assignment
- Content can be assigned to DeviceGroups
- Inheritance: Child groups inherit parent content unless overridden
- Assignment managed through existing content assignment APIs

## Validation Rules

### Frontend Validation (Zod)
```typescript
export const createDeviceGroupSchema = z.object({
  name: z.string()
    .min(1, 'Group name is required')
    .max(255, 'Group name must be less than 255 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Group name contains invalid characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  parentGroupId: z.number()
    .int()
    .positive('Parent group ID must be positive')
    .optional(),
})

export const updateDeviceGroupSchema = createDeviceGroupSchema
export const searchDeviceGroupSchema = z.object({
  query: z.string().max(255).optional(),
  parentId: z.number().int().positive().optional(),
  includeChildren: z.boolean().optional(),
})
```

### Business Rules
1. **Unique Names**: Group names must be unique within the same parent level
2. **Deletion Rules**: Groups with children or assigned devices cannot be deleted
3. **Move Rules**: Groups cannot be moved to become their own descendant
4. **Depth Limit**: Maximum 10 levels of hierarchy depth
5. **Name Rules**: No special characters except hyphens and underscores

## Error Handling

### API Error Types
```typescript
interface DeviceGroupError {
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
```

### UI Error States
- Network errors: Show retry button with exponential backoff
- Validation errors: Inline form field errors
- Deletion conflicts: Detailed explanation with resolution options
- Optimistic update failures: Automatic rollback with user notification

---

**Data Model Status**: ✅ Complete - All entities defined with validation rules and relationships