/**
 * @fileoverview Assignment Type Definitions
 * @description Core TypeScript interfaces and enums for assignment entities
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Types of content assignments
 */
export enum AssignmentType {
  /** Direct schedule assignment to device */
  Schedule = 0,
  /** Playlist assignment to device or group */
  Playlist = 1,
  /** Single media assignment to device or group */
  Media = 2,
  /** Emergency broadcast override assignment */
  Emergency = 3,
}

/**
 * Target type for content assignments
 */
export enum AssignmentTargetType {
  /** Assignment targets a specific device */
  Device = 0,
  /** Assignment targets a device group */
  DeviceGroup = 1,
}

/**
 * Status of content assignments
 */
export enum AssignmentStatus {
  /** Assignment is being drafted/configured */
  Draft = 0,
  /** Assignment is scheduled for future activation */
  Scheduled = 1,
  /** Assignment is currently active */
  Active = 2,
  /** Assignment has expired or ended */
  Expired = 3,
  /** Assignment is temporarily paused */
  Paused = 4,
  /** Assignment has been cancelled */
  Cancelled = 5,
}

/**
 * Actions performed on assignments for audit trail
 */
export enum AssignmentAction {
  /** Assignment was created */
  Created = 0,
  /** Assignment was updated/modified */
  Updated = 1,
  /** Assignment was deleted */
  Deleted = 2,
  /** Assignment was activated */
  Activated = 3,
  /** Assignment was deactivated */
  Deactivated = 4,
  /** Assignment status changed */
  StatusChanged = 5,
  /** Assignment priority changed */
  PriorityChanged = 6,
}

// ============================================================================
// Core Interfaces
// ============================================================================

/**
 * Assignment entity - represents a content-to-target assignment
 */
export interface Assignment {
  id: number;
  assignmentType: AssignmentType;
  contentId: number;
  contentName: string;
  targetType: AssignmentTargetType;
  targetId: number;
  targetName: string;
  priority: number; // 1-10
  startDate: string; // ISO date string
  endDate: string | null; // ISO date string
  startTime: string | null; // HH:mm format
  endTime: string | null; // HH:mm format
  isRecurring: boolean;
  recurrencePattern: string | null; // JSON string or pattern
  daysOfWeek: string | null; // Comma-separated: "Mon,Wed,Fri"
  status: AssignmentStatus;
  isEmergencyBroadcast: boolean;
  emergencyExpiresAt: string | null; // ISO date string
  notes: string | null;
  createdByUserId: number;
  createdByUserName: string;
  lastModifiedByUserId: number | null;
  lastModifiedByUserName: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Assignment history record for audit trail
 */
export interface AssignmentHistory {
  id: number;
  assignmentId: number;
  action: AssignmentAction;
  previousValues: string | null; // JSON string
  newValues: string | null; // JSON string
  reason: string | null;
  userId: number;
  userName: string;
  actionDate: string; // ISO date string
}

/**
 * Lightweight assignment summary for lists
 */
export interface AssignmentSummary {
  id: number;
  assignmentType: AssignmentType;
  contentName: string;
  targetName: string;
  priority: number;
  status: AssignmentStatus;
  startDate: string;
  endDate: string | null;
  isEmergencyBroadcast: boolean;
}

/**
 * Content reference for assignment creation
 */
export interface ContentReference {
  id: number;
  name: string;
  type: 'schedule' | 'playlist' | 'media';
  thumbnail?: string;
  duration?: number;
}

/**
 * Target reference for assignment creation
 */
export interface TargetReference {
  id: number;
  name: string;
  type: AssignmentTargetType;
  deviceCount?: number; // For device groups
  status?: 'online' | 'offline' | 'unknown';
}

/**
 * Recurrence pattern configuration
 */
export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number; // Every N days/weeks/months
  daysOfWeek?: number[]; // 0=Sunday, 6=Saturday
  dayOfMonth?: number; // 1-31
  endType: 'never' | 'date' | 'count';
  endDate?: string; // ISO date string
  occurrences?: number;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if assignment is emergency broadcast
 */
export const isEmergencyBroadcast = (
  assignment: Assignment | AssignmentSummary
): boolean => {
  return assignment.isEmergencyBroadcast;
};

/**
 * Type guard to check if assignment is active
 */
export const isActiveAssignment = (assignment: Assignment): boolean => {
  return assignment.status === AssignmentStatus.Active;
};

/**
 * Type guard to check if assignment has expired
 */
export const isExpiredAssignment = (assignment: Assignment): boolean => {
  if (!assignment.endDate) return false;
  return new Date(assignment.endDate) < new Date();
};

/**
 * Type guard to check if assignment is recurring
 */
export const isRecurringAssignment = (assignment: Assignment): boolean => {
  return assignment.isRecurring && !!assignment.recurrencePattern;
};

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Assignment form data type (for creation/update)
 */
export type AssignmentFormData = Omit<
  Assignment,
  | 'id'
  | 'contentName'
  | 'targetName'
  | 'createdByUserId'
  | 'createdByUserName'
  | 'lastModifiedByUserId'
  | 'lastModifiedByUserName'
  | 'createdAt'
  | 'updatedAt'
  | 'status'
>;

/**
 * Assignment filter criteria
 */
export interface AssignmentFilter {
  assignmentType?: AssignmentType;
  targetType?: AssignmentTargetType;
  status?: AssignmentStatus;
  isEmergencyBroadcast?: boolean;
  startDate?: string;
  endDate?: string;
  priority?: number;
  searchQuery?: string;
}

/**
 * Assignment sort options
 */
export type AssignmentSortField =
  | 'priority'
  | 'startDate'
  | 'endDate'
  | 'createdAt'
  | 'contentName'
  | 'targetName'
  | 'status';

export type AssignmentSortDirection = 'asc' | 'desc';

export interface AssignmentSort {
  field: AssignmentSortField;
  direction: AssignmentSortDirection;
}
