/**
 * Schedule Management Types
 * TypeScript interfaces for schedule-related data structures
 */

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
  id?: string
  groupId?: string
  name: string
  type: 'specific' | 'group'
}

export interface ScheduleContent {
  id: string
  mediaId: string
  mediaName: string
  order: number
  duration: number // seconds
  transition?: 'fade' | 'slide' | 'zoom' | 'none'
}

export interface ScheduleConflict {
  id: string
  type: 'overlap' | 'device_offline' | 'priority_conflict' | 'content_unavailable'
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
}

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

export interface ScheduleFilters {
  page?: number
  limit?: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  status?: ('active' | 'inactive' | 'expired' | 'draft')[]
  dateRange?: string
  priority?: string
  devices?: string[]
  createdBy?: string[]
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
