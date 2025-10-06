/**
 * Quick Assignment Types
 * Types for post-upload media assignment feature
 */

/**
 * Assignment type options
 */
export type AssignmentType = 'new-schedule' | 'existing-schedule'

/**
 * Request to quickly assign media after upload
 */
export interface QuickAssignRequest {
  /** Assignment type: create new schedule or add to existing */
  assignmentType: AssignmentType
  
  /** Schedule name (required for new-schedule) */
  scheduleName?: string
  
  /** Schedule start date (optional, defaults to now) */
  startDate?: Date
  
  /** Schedule end date (optional, defaults to 30 days) */
  endDate?: Date
  
  /** Priority for the schedule (optional, defaults to 5) */
  priority?: number
  
  /** User IDs to assign the schedule to */
  userIds?: number[]
  
  /** Device group IDs to assign the schedule to */
  deviceGroupIds?: number[]
  
  /** Existing schedule ID (required for existing-schedule) */
  scheduleId?: number
  
  /** Display duration in seconds */
  durationSeconds?: number
}

/**
 * Response from quick assignment operation
 */
export interface QuickAssignResponse {
  /** Media ID that was assigned */
  mediaId: number
  
  /** Media name */
  mediaName: string
  
  /** Schedule ID (new or existing) */
  scheduleId: number
  
  /** Schedule name */
  scheduleName: string
  
  /** Whether a new schedule was created */
  newScheduleCreated: boolean
  
  /** Number of users assigned */
  usersAssignedCount: number
  
  /** Number of device groups assigned */
  deviceGroupsAssignedCount: number
  
  /** Assigned user IDs */
  assignedUserIds: number[]
  
  /** Assigned device group IDs */
  assignedDeviceGroupIds: number[]
  
  /** Assignment timestamp */
  assignedAt: string
  
  /** Success message */
  message: string
}

/**
 * Available user for assignment
 */
export interface AssignableUser {
  id: number
  name: string
  email: string
  role: string
}

/**
 * Available schedule for assignment
 */
export interface AssignableSchedule {
  id: number
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  description?: string
}
