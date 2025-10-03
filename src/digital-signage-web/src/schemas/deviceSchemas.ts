import { z } from 'zod'

// Device Status enum for validation
const deviceStatusSchema = z.enum([
  'Pending',
  'Registered', 
  'Online',
  'Offline',
  'Error',
  'Maintenance',
  'Inactive'
])

// Display Orientation enum
const displayOrientationSchema = z.enum([
  'Portrait',
  'Landscape',
  'Auto'
])

// Power Management enum
const powerManagementSchema = z.enum([
  'Standard',
  'Optimized',
  'Maximum'
])

// Media Type enum
const mediaTypeSchema = z.enum([
  'Image',
  'Video', 
  'Html',
  'Text'
])

// User Role enum
const userRoleSchema = z.enum([
  'Admin',
  'Manager', 
  'User'
])

// Registration Action enum
const registrationActionSchema = z.enum([
  'Register',
  'Approve',
  'Reject',
  'Deactivate'
])

/**
 * Schema for device registration form
 * Used for Android TV device registration workflow
 */
export const deviceRegistrationSchema = z.object({
  deviceName: z.string()
    .min(1, 'Device name is required')
    .min(3, 'Device name must be at least 3 characters')
    .max(100, 'Device name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Device name can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  macAddress: z.string()
    .min(1, 'MAC address is required')
    .regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, 'Invalid MAC address format (e.g., 00:11:22:33:44:55)'),
  
  androidVersion: z.string()
    .min(1, 'Android version is required')
    .max(20, 'Android version must be less than 20 characters'),
  
  apiLevel: z.string()
    .min(1, 'API level is required')
    .regex(/^\d+$/, 'API level must be a number'),
  
  serialNumber: z.string()
    .min(1, 'Serial number is required')
    .max(50, 'Serial number must be less than 50 characters'),
  
  manufacturer: z.string()
    .min(1, 'Manufacturer is required')
    .max(50, 'Manufacturer must be less than 50 characters'),
  
  model: z.string()
    .min(1, 'Model is required')
    .max(50, 'Model must be less than 50 characters'),
  
  displayResolution: z.string()
    .min(1, 'Display resolution is required')
    .regex(/^\d+x\d+$/, 'Invalid resolution format (e.g., 1920x1080)'),
  
  location: z.string()
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val)
})

export type DeviceRegistrationFormData = z.infer<typeof deviceRegistrationSchema>

/**
 * Schema for creating a device
 * Used for basic device creation forms
 */
export const createDeviceSchema = z.object({
  name: z.string()
    .min(1, 'Device name is required')
    .min(3, 'Device name must be at least 3 characters')
    .max(100, 'Device name must be less than 100 characters'),
  
  location: z.string()
    .min(1, 'Location is required')
    .max(200, 'Location must be less than 200 characters'),
  
  deviceGroupId: z.number()
    .optional()
    .or(z.literal(0))
    .transform(val => val === 0 ? undefined : val),
  
  resolution: z.string()
    .min(1, 'Resolution is required')
    .regex(/^\d+x\d+$/, 'Invalid resolution format (e.g., 1920x1080)')
})

export type CreateDeviceFormData = z.infer<typeof createDeviceSchema>

/**
 * Schema for updating a device
 * All fields are optional for partial updates
 */
export const updateDeviceSchema = createDeviceSchema.partial().extend({
  isActive: z.boolean().optional()
})

export type UpdateDeviceFormData = z.infer<typeof updateDeviceSchema>

/**
 * Schema for device configuration form
 * Used for Android TV specific configuration management
 */
export const deviceConfigurationSchema = z.object({
  displayOrientation: displayOrientationSchema.default('Landscape'),
  
  screenTimeout: z.number()
    .min(30, 'Screen timeout must be at least 30 seconds')
    .max(86400, 'Screen timeout must be less than 24 hours (86400 seconds)')
    .default(300),
  
  powerManagement: powerManagementSchema.default('Standard'),
  
  autoRotate: z.boolean().default(false),
  
  networkConfig: z.any().optional(),
  
  appPermissions: z.any().optional(),
  
  proxySettings: z.any().optional()
})

export type DeviceConfigurationFormData = z.infer<typeof deviceConfigurationSchema>

/**
 * Schema for updating device configuration
 * All fields are optional for partial updates
 */
export const updateDeviceConfigurationSchema = deviceConfigurationSchema.partial()

export type UpdateDeviceConfigurationFormData = z.infer<typeof updateDeviceConfigurationSchema>

/**
 * Schema for device approval form
 * Used when approving pending device registrations
 */
export const deviceApprovalSchema = z.object({
  deviceId: z.number().min(1, 'Device ID is required'),
  approve: z.boolean(),
  notes: z.string()
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val)
})

export type DeviceApprovalFormData = z.infer<typeof deviceApprovalSchema>

/**
 * Schema for device group creation
 * Used for organizing devices into hierarchical groups
 */
export const createDeviceGroupSchema = z.object({
  name: z.string()
    .min(1, 'Group name is required')
    .min(3, 'Group name must be at least 3 characters')
    .max(100, 'Group name must be less than 100 characters'),
  
  description: z.string()
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val),
  
  parentGroupId: z.number()
    .optional()
    .or(z.literal(0))
    .transform(val => val === 0 ? undefined : val)
})

export type CreateDeviceGroupFormData = z.infer<typeof createDeviceGroupSchema>

/**
 * Schema for media upload form
 * Used for uploading media files to the system
 */
export const mediaUploadSchema = z.object({
  name: z.string()
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val),
  
  type: mediaTypeSchema.optional(),
  
  durationSeconds: z.number()
    .min(1, 'Duration must be at least 1 second')
    .max(7200, 'Duration must be less than 2 hours (7200 seconds)')
    .optional()
})

export type MediaUploadFormData = z.infer<typeof mediaUploadSchema>

/**
 * Schema for device filters/search form
 * Used for filtering device lists
 */
export const deviceFiltersSchema = z.object({
  search: z.string()
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val),
  
  status: deviceStatusSchema.optional(),
  
  deviceGroupId: z.number()
    .optional()
    .or(z.literal(0))
    .transform(val => val === 0 ? undefined : val),
  
  isActive: z.boolean().optional(),
  
  page: z.number().min(1).default(1),
  
  pageSize: z.number().min(1).max(100).default(10)
})

export type DeviceFiltersFormData = z.infer<typeof deviceFiltersSchema>

/**
 * Schema for user authentication
 * Used for login forms
 */
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Schema for bulk operations on devices
 * Used for performing batch operations on multiple devices
 */
export const bulkDeviceOperationsSchema = z.object({
  deviceIds: z.array(z.number())
    .min(1, 'At least one device must be selected'),
  
  operation: z.enum([
    'activate',
    'deactivate', 
    'restart',
    'update-configuration',
    'assign-group',
    'remove-group'
  ]),
  
  parameters: z.record(z.string(), z.any()).optional()
})

export type BulkDeviceOperationsFormData = z.infer<typeof bulkDeviceOperationsSchema>

// Export all schemas for easy access
export const deviceSchemas = {
  deviceRegistration: deviceRegistrationSchema,
  createDevice: createDeviceSchema,
  updateDevice: updateDeviceSchema,
  deviceConfiguration: deviceConfigurationSchema,
  updateDeviceConfiguration: updateDeviceConfigurationSchema,
  deviceApproval: deviceApprovalSchema,
  createDeviceGroup: createDeviceGroupSchema,
  mediaUpload: mediaUploadSchema,
  deviceFilters: deviceFiltersSchema,
  login: loginSchema,
  bulkDeviceOperations: bulkDeviceOperationsSchema
}

// Export enum schemas for reuse
export const enumSchemas = {
  deviceStatus: deviceStatusSchema,
  displayOrientation: displayOrientationSchema,
  powerManagement: powerManagementSchema,
  mediaType: mediaTypeSchema,
  userRole: userRoleSchema,
  registrationAction: registrationActionSchema
}