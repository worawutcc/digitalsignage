/**
 * Zod Validation Schemas
 * Centralized validation schemas for all forms using Zod
 */

import { z } from 'zod'

/**
 * Common validation patterns
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_REGEX = /^https?:\/\/.+/
const RESOLUTION_REGEX = /^\d{3,5}x\d{3,5}$/
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/

/**
 * Authentication schemas
 */
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').regex(EMAIL_REGEX, 'Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

export const registerSchema = z
  .object({
    email: z.string().min(1, 'Email is required').regex(EMAIL_REGEX, 'Invalid email format'),
    firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').regex(EMAIL_REGEX, 'Invalid email format'),
})

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })

/**
 * Device schemas
 */
export const deviceSchema = z.object({
  name: z.string().min(1, 'Device name is required').max(100, 'Device name is too long'),
  location: z.string().min(1, 'Location is required').max(200, 'Location is too long'),
  deviceGroupId: z.number().int().positive().optional().nullable(),
  resolution: z
    .string()
    .regex(RESOLUTION_REGEX, 'Invalid resolution format (e.g., 1920x1080)')
    .optional()
    .default('1920x1080'),
  orientation: z.enum(['landscape', 'portrait']).optional().default('landscape'),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().max(500, 'Notes are too long').optional(),
})

export const deviceGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100, 'Group name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  parentGroupId: z.number().int().positive().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
})

export const deviceBulkUpdateSchema = z.object({
  deviceIds: z.array(z.number().int().positive()).min(1, 'Select at least one device'),
  updates: z.object({
    deviceGroupId: z.number().int().positive().optional().nullable(),
    tags: z.array(z.string()).optional(),
  }),
})

/**
 * Media/Content schemas
 */
export const mediaUploadSchema = z.object({
  file: z.instanceof(File, { message: 'File is required' }).refine(
    (file) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm']
      return allowedTypes.includes(file.type)
    },
    { message: 'Invalid file type. Allowed: JPEG, PNG, GIF, MP4, WEBM' }
  ),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  tags: z.array(z.string()).optional().default([]),
  duration: z.number().int().positive().optional(),
})

export const mediaUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  tags: z.array(z.string()).optional(),
})

export const mediaBulkUpdateSchema = z.object({
  mediaIds: z.array(z.number().int().positive()).min(1, 'Select at least one media item'),
  updates: z.object({
    tags: z.array(z.string()).optional(),
  }),
})

/**
 * Schedule schemas
 */
export const scheduleSchema = z
  .object({
    name: z.string().min(1, 'Schedule name is required').max(200, 'Schedule name is too long'),
    startTime: z.string().min(1, 'Start time is required').datetime('Invalid datetime format'),
    endTime: z.string().min(1, 'End time is required').datetime('Invalid datetime format'),
    priority: z.number().int().min(0).max(100).default(50),
    recurrenceRule: z.string().max(500).optional().nullable(),
    deviceIds: z.array(z.number().int().positive()).min(1, 'Select at least one device'),
    mediaIds: z.array(z.number().int().positive()).min(1, 'Select at least one media item'),
    isActive: z.boolean().optional().default(true),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: 'End time must be after start time',
    path: ['endTime'],
  })

export const scheduleUpdateSchema = z
  .object({
    name: z.string().min(1, 'Schedule name is required').max(200, 'Schedule name is too long'),
    startTime: z.string().min(1, 'Start time is required').datetime('Invalid datetime format'),
    endTime: z.string().min(1, 'End time is required').datetime('Invalid datetime format'),
    priority: z.number().int().min(0).max(100),
    recurrenceRule: z.string().max(500).optional().nullable(),
    deviceIds: z.array(z.number().int().positive()).min(1, 'Select at least one device'),
    mediaIds: z.array(z.number().int().positive()).min(1, 'Select at least one media item'),
    isActive: z.boolean(),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: 'End time must be after start time',
    path: ['endTime'],
  })

/**
 * User management schemas
 */
export const userSchema = z.object({
  email: z.string().min(1, 'Email is required').regex(EMAIL_REGEX, 'Invalid email format'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  role: z.enum(['admin', 'manager', 'user'], { message: 'Invalid role' }),
  permissions: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
})

export const userUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  role: z.enum(['admin', 'manager', 'user'], { message: 'Invalid role' }),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean(),
})

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  email: z.string().min(1, 'Email is required').regex(EMAIL_REGEX, 'Invalid email format'),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .nullable(),
})

/**
 * Settings schemas
 */
export const systemSettingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required').max(100, 'Site name is too long'),
  siteUrl: z.string().regex(URL_REGEX, 'Invalid URL format'),
  contactEmail: z.string().regex(EMAIL_REGEX, 'Invalid email format'),
  defaultDeviceResolution: z.string().regex(RESOLUTION_REGEX, 'Invalid resolution format'),
  defaultSchedulePriority: z.number().int().min(0).max(100),
  enableNotifications: z.boolean(),
  enableRealTimeUpdates: z.boolean(),
  sessionTimeout: z.number().int().min(5).max(1440), // 5 minutes to 24 hours
})

export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  deviceOfflineAlert: z.boolean(),
  scheduleConflictAlert: z.boolean(),
  mediaUploadComplete: z.boolean(),
  systemMaintenanceAlert: z.boolean(),
})

/**
 * Search and filter schemas
 */
export const deviceFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['online', 'offline', 'all']).optional().default('all'),
  deviceGroupId: z.number().int().positive().optional().nullable(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['name', 'location', 'lastSeen', 'status']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(10).max(100).optional().default(20),
})

export const mediaFilterSchema = z.object({
  search: z.string().optional(),
  type: z.enum(['image', 'video', 'all']).optional().default('all'),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['title', 'uploadDate', 'size', 'type']).optional().default('uploadDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(10).max(100).optional().default(20),
})

export const scheduleFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'all']).optional().default('all'),
  deviceId: z.number().int().positive().optional().nullable(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['name', 'startTime', 'priority']).optional().default('startTime'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(10).max(100).optional().default(20),
})

/**
 * Type inference helpers
 */
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export type DeviceFormData = z.infer<typeof deviceSchema>
export type DeviceGroupFormData = z.infer<typeof deviceGroupSchema>
export type DeviceBulkUpdateData = z.infer<typeof deviceBulkUpdateSchema>

export type MediaUploadFormData = z.infer<typeof mediaUploadSchema>
export type MediaUpdateFormData = z.infer<typeof mediaUpdateSchema>
export type MediaBulkUpdateData = z.infer<typeof mediaBulkUpdateSchema>

export type ScheduleFormData = z.infer<typeof scheduleSchema>
export type ScheduleUpdateFormData = z.infer<typeof scheduleUpdateSchema>

export type UserFormData = z.infer<typeof userSchema>
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>

export type SystemSettingsFormData = z.infer<typeof systemSettingsSchema>
export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>

export type DeviceFilterData = z.infer<typeof deviceFilterSchema>
export type MediaFilterData = z.infer<typeof mediaFilterSchema>
export type ScheduleFilterData = z.infer<typeof scheduleFilterSchema>
