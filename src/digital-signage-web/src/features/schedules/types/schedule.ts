/**
 * Enhanced Schedule Types for User Assignment Feature
 * 
 * Extends existing schedule types with assignment-related metadata
 * for Phase 1: User Schedule Assignment UI
 */

/**
 * Content source priority tiers for schedule delivery
 */
export type ContentSource = 'User' | 'Group' | 'Default'

/**
 * Enhanced Schedule interface with assignment metadata
 * Extends the base Schedule type with user assignment tracking
 */
export interface ScheduleWithAssignments {
  /** Schedule ID */
  id: number
  /** Schedule name */
  name: string
  /** Schedule description (optional) */
  description: string | null
  /** Whether the schedule is currently active */
  isActive: boolean
  /** Whether this is the default schedule for fallback content */
  isDefault: boolean
  /** ISO 8601 date for schedule start */
  startDate: string
  /** ISO 8601 date for schedule end (null for indefinite) */
  endDate: string | null
  /** Priority level (higher = more important) */
  priority: number
  /** ISO 8601 datetime of creation */
  createdAt: string
  /** ISO 8601 datetime of last update */
  updatedAt: string
  
  // Assignment metadata
  /** Count of users assigned to this schedule */
  assignedUsersCount: number
  /** Count of devices assigned to this schedule */
  assignedDevicesCount: number
  /** Count of media items in this schedule */
  mediaCount: number
  
  /** Content source priority tier */
  contentSource: ContentSource
}

/**
 * Lightweight schedule item for lists and selectors
 */
export interface ScheduleListItem {
  /** Schedule ID */
  id: number
  /** Schedule name */
  name: string
  /** Whether the schedule is currently active */
  isActive: boolean
  /** Whether this is the default schedule */
  isDefault: boolean
  /** Count of users assigned to this schedule */
  assignedUsersCount: number
  /** ISO 8601 date for schedule start */
  startDate: string
  /** ISO 8601 date for schedule end (null for indefinite) */
  endDate: string | null
}

/**
 * User information for schedule assignment views
 */
export interface ScheduleAssignedUser {
  /** User ID */
  id: number
  /** User's display name */
  name: string
  /** User's email address */
  email: string
  /** ISO 8601 datetime when schedule was assigned */
  assignedAt: string
  /** Count of devices assigned to this user */
  deviceCount: number
}

/**
 * Response containing users assigned to a specific schedule
 */
export interface ScheduleUsersResponse {
  /** Schedule ID */
  scheduleId: number
  /** Schedule name */
  scheduleName: string
  /** Array of assigned users */
  users: ScheduleAssignedUser[]
  /** Total count of assigned users (optional since API may not provide it) */
  totalCount?: number
}

/**
 * Request to set a schedule as default
 */
export interface SetDefaultScheduleRequest {
  /** Schedule ID to update */
  scheduleId: number
  /** Whether to set as default (only one schedule can be default) */
  isDefault: boolean
}

/**
 * Response after setting default schedule
 */
export interface SetDefaultScheduleResponse {
  /** Schedule ID that was updated */
  scheduleId: number
  /** New default state */
  isDefault: boolean
  /** ID of previous default schedule (if any) */
  previousDefaultId: number | null
  /** Success message */
  message: string
}

/**
 * Query parameters for schedule selector
 */
export interface ScheduleSelectorQuery {
  /** Search term for filtering by name */
  search?: string
  /** Filter by active status */
  activeOnly?: boolean
  /** Page number for pagination */
  page?: number
  /** Items per page */
  pageSize?: number
  /** Sort field */
  sortBy?: 'name' | 'startDate' | 'assignedUsersCount' | 'priority'
  /** Sort direction */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Response from schedule selector API
 */
export interface ScheduleSelectorResponse {
  /** Array of schedule items */
  schedules: ScheduleListItem[]
  /** Total count of schedules (before pagination) */
  totalCount: number
  /** Current page number */
  page: number
  /** Items per page */
  pageSize: number
  /** Total number of pages */
  totalPages: number
}
