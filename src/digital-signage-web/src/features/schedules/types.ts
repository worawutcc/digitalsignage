/**
 * Schedule Management Types
 * TypeScript interfaces for schedule-related data structures
 * Enhanced with user assignment capabilities and conflict tracking
 */

import type { User, UserScheduleAssignment } from '@/features/users/types'

export interface TimeSlot {
  id: string
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  daysOfWeek: number[] // 0=Sunday, 1=Monday, etc.
  timezone: string
}

export interface RecurrenceConfig {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' | 'never'
  interval: number
  endType: 'never' | 'date' | 'count'
  endDate?: string
  endCount?: number
}

export interface TargetDevice {
  deviceId: number  // Device ID from API as number
  groupId?: number
  name: string
  type: 'specific' | 'group'
}

export interface ScheduleContent {
  id: string  // Local form field ID (UUID)
  mediaId: number  // Media ID from API as number
  mediaName: string
  order: number
  duration: number // seconds
  transition?: 'fade' | 'slide' | 'zoom' | 'none'
}

/**
 * Enhanced Schedule Conflict interface with user and resolution tracking
 */
export interface ScheduleConflict {
  id: string
  type: 'overlap' | 'device_offline' | 'priority_conflict' | 'content_unavailable' | 'user_assignment_conflict'
  schedules?: string[]
  device?: string
  devices?: string[]
  timeRange?: {
    start: string
    end: string
  }
  severity: 'error' | 'warning' | 'info'
  message?: string
  suggestion?: string
  existingSchedule?: {
    id: string
    name: string
  }
  
  // Enhanced conflict tracking
  userId?: string
  userScheduleAssignmentId?: string
  detectedAt: string
  resolvedAt?: string
  resolutionStrategy?: 'priority' | 'manual' | 'ignore' | 'auto'
  resolvedBy?: {
    id: string
    name: string
  }
  isActive: boolean
  autoResolutionAttempted: boolean
  manualResolutionRequired: boolean
}

/**
 * Conflict Resolution History
 */
export interface ConflictResolution {
  id: string
  conflictId: string
  strategy: 'priority' | 'manual' | 'ignore' | 'auto'
  resolvedBy: {
    id: string
    name: string
  }
  resolvedAt: string
  resolution: string
  impactedSchedules: string[]
  impactedUsers: string[]
  notes?: string
}

/**
 * Enhanced Schedule interface with user assignment capabilities
 */
export interface Schedule {
  id: string
  name: string
  description?: string
  priority: number
  status: 'active' | 'inactive' | 'expired' | 'draft'
  startDate: string
  endDate: string
  timeSlots: TimeSlot[]
  recurrence: RecurrenceConfig
  targetDevices: TargetDevice[]
  content: ScheduleContent[]
  conflicts: ScheduleConflict[]
  createdBy: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
  
  // Enhanced fields for user assignment
  assignedUsers?: UserScheduleAssignment[]
  assignedUsersCount?: number
  maxConcurrentUsers?: number
  allowsConflicts: boolean
  autoResolveConflicts: boolean
  
  // Content categorization
  category?: string
  tags?: string[]
  
  // Approval workflow
  approvalStatus?: 'pending' | 'approved' | 'rejected'
  approvedBy?: {
    id: string
    name: string
    approvedAt: string
  }
  
  // Performance and tracking
  lastModified: string
  conflictResolutionHistory?: ConflictResolution[]
}

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  color?: string
  priority: number
  devices: string[]
  conflicts: ScheduleConflict[]
}

export interface CalendarData {
  events: CalendarEvent[]
  conflicts: ScheduleConflict[]
}

/**
 * Enhanced Schedule Filters with user assignment filtering
 */
export interface ScheduleFilters {
  page?: number
  limit?: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  status?: ('active' | 'inactive' | 'expired' | 'draft')[]
  
  // Enhanced filtering options
  assignedUserId?: string
  hasConflicts?: boolean
  category?: string[]
  tags?: string[]
  dateRange?: {
    from: string
    to: string
  }
  approvalStatus?: ('pending' | 'approved' | 'rejected')[]
  createdBy?: string[]
  lastModified?: {
    from?: string
    to?: string
  }
}

// ============================================================================
// USER ASSIGNMENT RELATED TYPES
// ============================================================================

/**
 * Schedule assignment request
 */
export interface ScheduleAssignmentRequest {
  scheduleId: string
  userIds: string[]
  assignmentSettings: {
    priority: number
    allowConflicts: boolean
    notes?: string
    notifyUsers: boolean
  }
}

/**
 * Schedule assignment response
 */
export interface ScheduleAssignmentResponse {
  success: boolean
  assignments: UserScheduleAssignment[]
  conflicts: ScheduleConflict[]
  summary: {
    successful: number
    failed: number
    conflicted: number
  }
}

/**
 * Schedule with assignment summary
 */
export interface ScheduleWithUsers extends Schedule {
  assignmentSummary: {
    totalAssigned: number
    activeAssignments: number
    conflictedAssignments: number
    pendingAssignments: number
  }
  recentAssignments: {
    user: User
    assignedAt: string
    assignedBy: User
  }[]
}

export interface ScheduleValidationRequest {
  name: string
  startDate: string
  endDate: string
  timeSlots: TimeSlot[]
  targetDevices: TargetDevice[]
  priority: number
  excludeScheduleId?: string
}

export interface ScheduleValidationResponse {
  valid: boolean
  conflicts: ScheduleConflict[]
  warnings: ScheduleConflict[]
}

export interface CreateScheduleRequest {
  name: string
  description?: string
  priority: number
  startDate: string
  endDate: string
  timeSlots: TimeSlot[]
  recurrence: RecurrenceConfig
  targetDevices: TargetDevice[]
  content: ScheduleContent[]
}

export interface UpdateScheduleRequest extends Partial<CreateScheduleRequest> {
  status?: 'active' | 'inactive' | 'draft'
}

export interface ScheduleStats {
  totalSchedules: number
  activeSchedules: number
  draftSchedules: number
  expiredSchedules: number
  conflictCount: number
  devicesCovered: number
}
