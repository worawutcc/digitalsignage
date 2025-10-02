/**
 * User Schedule Assignment Types
 * 
 * Defines TypeScript interfaces for user-schedule relationship management,
 * including assignment operations and user schedule summaries.
 */

/**
 * Represents the relationship between a user and an assigned schedule
 */
export interface UserSchedule {
  /** User ID */
  userId: number
  /** Schedule ID */
  scheduleId: number
  /** Schedule name */
  scheduleName: string
  /** Schedule description (optional) */
  scheduleDescription: string | null
  /** Whether the schedule is currently active */
  isActive: boolean
  /** ISO 8601 datetime when schedule was assigned */
  assignedAt: string
  /** Username of admin who assigned the schedule */
  assignedBy: string
}

/**
 * Summary information about a user's schedule and device assignments
 */
export interface UserScheduleSummary {
  /** User ID */
  userId: number
  /** User's display name */
  userName: string
  /** User's email address */
  userEmail: string
  /** Total count of assigned schedules */
  assignedSchedulesCount: number
  /** Total count of assigned devices */
  assignedDevicesCount: number
  /** ISO 8601 datetime of last assignment (null if no assignments) */
  lastAssignedAt: string | null
}

/**
 * Request payload for assigning schedules to a user
 * Note: Uses REPLACE semantics - replaces all existing assignments
 */
export interface AssignSchedulesRequest {
  /** Target user ID */
  userId: number
  /** Array of schedule IDs to assign (replaces ALL existing) */
  scheduleIds: number[]
}

/**
 * Response after successfully assigning schedules
 */
export interface AssignSchedulesResponse {
  /** User ID that received assignments */
  userId: number
  /** Array of newly assigned schedule IDs */
  assignedScheduleIds: number[]
  /** Array of previously assigned schedule IDs that were replaced */
  previousScheduleIds: number[]
  /** ISO 8601 datetime of assignment */
  assignedAt: string
  /** Username of admin who performed the assignment */
  assignedBy: string
  /** Success message */
  message: string
}

/**
 * Request to remove all schedule assignments from a user
 */
export interface RemoveAllSchedulesRequest {
  /** User ID to remove assignments from */
  userId: number
}

/**
 * Response after successfully removing all schedule assignments
 */
export interface RemoveSchedulesResponse {
  /** User ID that had assignments removed */
  userId: number
  /** Count of schedules that were removed */
  removedCount: number
  /** ISO 8601 datetime of removal */
  removedAt: string
  /** Success message */
  message: string
}

/**
 * API response when fetching user's assigned schedules
 */
export interface GetUserSchedulesResponse {
  /** User ID */
  userId: number
  /** User's display name */
  userName: string
  /** Array of assigned schedules */
  schedules: UserSchedule[]
  /** Total count of assigned schedules */
  totalCount: number
}
