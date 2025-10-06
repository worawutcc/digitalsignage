/**
 * Zod validation schemas for Device Groups feature
 * Following copilot-instructions-ui.instructions.md patterns with React Hook Form integration
 */

import { z } from 'zod'

// Device Group form validation schema
export const deviceGroupSchema = z.object({
  name: z.string()
    .min(1, 'Group name is required')
    .max(255, 'Group name must be less than 255 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Group name contains invalid characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')), // Allow empty string
  parentGroupId: z.number()
    .int('Parent group ID must be an integer')
    .positive('Parent group ID must be positive')
    .optional(),
})

// Create device group request schema
export const createDeviceGroupSchema = deviceGroupSchema

// Update device group request schema
export const updateDeviceGroupSchema = deviceGroupSchema

// Search parameters validation schema
export const searchDeviceGroupSchema = z.object({
  query: z.string()
    .max(255, 'Search query too long')
    .optional(),
  parentId: z.number()
    .int()
    .positive()
    .optional(),
  includeChildren: z.boolean()
    .optional()
    .default(false),
  level: z.number()
    .int()
    .min(0, 'Level must be non-negative')
    .max(10, 'Level cannot exceed maximum depth')
    .optional(),
  sortBy: z.enum(['name', 'createdAt', 'deviceCount'])
    .optional()
    .default('name'),
  sortOrder: z.enum(['asc', 'desc'])
    .optional()
    .default('asc'),
})

// Device Group entity validation (for API responses)
export const deviceGroupEntitySchema: z.ZodType<any> = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional(),
  parentId: z.number().int().positive().optional(),
  parentName: z.string().optional(),
  level: z.number().int().min(0),
  path: z.string().min(1),
  deviceCount: z.number().int().min(0),
  childGroupCount: z.number().int().min(0),
  totalDeviceCount: z.number().int().min(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  canDelete: z.boolean(),
  canMove: z.boolean(),
  // Frontend-specific optional properties
  isExpanded: z.boolean().optional(),
  children: z.array(z.lazy((): z.ZodType<any> => deviceGroupEntitySchema)).optional(),
})

// API Response validation schemas
export const deviceGroupResponseSchema = z.object({
  success: z.boolean(),
  data: deviceGroupEntitySchema.optional(),
  error: z.string().optional(),
  message: z.string().optional(),
})

export const deviceGroupListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(deviceGroupEntitySchema).optional(),
  error: z.string().optional(),
  totalCount: z.number().int().min(0).optional(),
})

export const deviceGroupTreeSchema = z.object({
  groups: z.array(deviceGroupEntitySchema),
  rootGroups: z.array(deviceGroupEntitySchema),
  totalCount: z.number().int().min(0),
  maxDepth: z.number().int().min(0),
  lastUpdated: z.string().datetime(),
})

export const deviceGroupTreeResponseSchema = z.object({
  success: z.boolean(),
  data: deviceGroupTreeSchema.optional(),
  error: z.string().optional(),
})

// Error validation schema
export const deviceGroupErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  field: z.string().optional(),
  details: z.record(z.string(), z.any()).optional(),
})

// UI State validation schemas
export const deviceGroupUIStateSchema = z.object({
  selectedGroupId: z.number().int().positive().optional(),
  expandedGroups: z.set(z.number().int().positive()),
  searchQuery: z.string(),
  searchResults: z.array(deviceGroupEntitySchema),
  isSearchActive: z.boolean(),
  draggedGroup: deviceGroupEntitySchema.optional(),
  dropTarget: deviceGroupEntitySchema.optional(),
  viewMode: z.enum(['tree', 'list']),
  sortOrder: z.enum(['name', 'created', 'deviceCount']),
})

// Modal state validation schema
export const deviceGroupModalStateSchema = z.object({
  isOpen: z.boolean(),
  mode: z.enum(['create', 'edit', 'delete', 'view']),
  selectedGroup: deviceGroupEntitySchema.optional(),
  parentGroup: deviceGroupEntitySchema.optional(),
})

// Type inference from schemas
export type DeviceGroupFormData = z.infer<typeof deviceGroupSchema>
export type CreateDeviceGroupRequest = z.infer<typeof createDeviceGroupSchema>
export type UpdateDeviceGroupRequest = z.infer<typeof updateDeviceGroupSchema>
export type SearchDeviceGroupParams = z.infer<typeof searchDeviceGroupSchema>
export type DeviceGroupEntity = z.infer<typeof deviceGroupEntitySchema>
export type DeviceGroupResponse = z.infer<typeof deviceGroupResponseSchema>
export type DeviceGroupListResponse = z.infer<typeof deviceGroupListResponseSchema>
export type DeviceGroupTree = z.infer<typeof deviceGroupTreeSchema>
export type DeviceGroupTreeResponse = z.infer<typeof deviceGroupTreeResponseSchema>
export type DeviceGroupError = z.infer<typeof deviceGroupErrorSchema>
export type DeviceGroupUIState = z.infer<typeof deviceGroupUIStateSchema>
export type DeviceGroupModalState = z.infer<typeof deviceGroupModalStateSchema>

// Validation helper functions
export const validateDeviceGroupForm = (data: unknown) => {
  return deviceGroupSchema.safeParse(data)
}

export const validateCreateDeviceGroup = (data: unknown) => {
  return createDeviceGroupSchema.safeParse(data)
}

export const validateUpdateDeviceGroup = (data: unknown) => {
  return updateDeviceGroupSchema.safeParse(data)
}

export const validateSearchParams = (data: unknown) => {
  return searchDeviceGroupSchema.safeParse(data)
}

export const validateDeviceGroupResponse = (data: unknown) => {
  return deviceGroupResponseSchema.safeParse(data)
}

export const validateDeviceGroupListResponse = (data: unknown) => {
  return deviceGroupListResponseSchema.safeParse(data)
}

export const validateDeviceGroupTreeResponse = (data: unknown) => {
  return deviceGroupTreeResponseSchema.safeParse(data)
}

// Custom validation functions for business rules
export const validateUniqueNameAtLevel = (name: string, parentId?: number, existingGroups: DeviceGroupEntity[] = []) => {
  const duplicateExists = existingGroups.some(group => 
    group.name.toLowerCase() === name.toLowerCase() && 
    group.parentId === parentId
  )
  
  if (duplicateExists) {
    return {
      success: false,
      error: 'A group with this name already exists at this level'
    }
  }
  
  return { success: true }
}

export const validateNoCircularReference = (groupId: number, newParentId: number, allGroups: DeviceGroupEntity[]) => {
  // Check if newParentId would create a circular reference
  let currentGroup = allGroups.find(g => g.id === newParentId)
  
  while (currentGroup) {
    if (currentGroup.id === groupId) {
      return {
        success: false,
        error: 'Moving this group would create a circular reference'
      }
    }
    
    currentGroup = currentGroup.parentId 
      ? allGroups.find(g => g.id === currentGroup!.parentId)
      : undefined
  }
  
  return { success: true }
}

export const validateMaxDepth = (parentId: number | undefined, allGroups: DeviceGroupEntity[], maxDepth = 10) => {
  if (!parentId) return { success: true } // Root level is always valid
  
  const parentGroup = allGroups.find(g => g.id === parentId)
  if (!parentGroup) {
    return {
      success: false,
      error: 'Parent group not found'
    }
  }
  
  if (parentGroup.level >= maxDepth - 1) {
    return {
      success: false,
      error: 'Maximum hierarchy depth would be exceeded'
    }
  }
  
  return { success: true }
}