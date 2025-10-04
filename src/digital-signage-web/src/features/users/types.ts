/**
 * User Management Feature Types
 * Defines all TypeScript interfaces for user, role, and permission management
 * Enhanced with bulk operations, conflict detection, and advanced filtering
 */

import { User } from '@/types/api'
export type { User }

// ============================================================================
// ENHANCED USER TYPES
// ============================================================================

/**
 * Enhanced User interface extending the base API User type
 * Adds schedule assignment and conflict tracking capabilities
 */
export interface EnhancedUser extends User {
  // Enhanced fields for schedule assignment
  assignedSchedules?: UserScheduleAssignment[]
  scheduleConflicts?: ScheduleConflict[]
  assignedSchedulesCount?: number
  conflictCount?: number
  
  // Additional profile fields
  profilePicture?: string
  department?: string
  timezone?: string
  
  // Status tracking
  lastScheduleUpdate?: string
  scheduleSyncStatus?: 'synced' | 'pending' | 'failed'
}

/**
 * User Schedule Assignment interface
 */
export interface UserScheduleAssignment {
  id: number
  userId: number
  scheduleId: number
  assignedAt: string
  assignedBy: number
  status: 'active' | 'inactive' | 'conflict' | 'pending'
  priority: number
  notes?: string
  
  // Relationship fields
  user?: User
  schedule?: ScheduleInfo
  assignedByUser?: User
  
  // Conflict tracking
  conflicts?: ScheduleConflict[]
  lastSyncedAt?: string
  syncStatus: 'synced' | 'pending' | 'failed'
}

/**
 * Schedule Conflict interface
 */
export interface ScheduleConflict {
  id: number
  userId: number
  scheduleIds: number[]
  conflictType: 'time_overlap' | 'resource_conflict' | 'device_conflict'
  severity: 'low' | 'medium' | 'high' | 'critical'
  detectedAt: string
  resolvedAt?: string
  resolutionStrategy?: 'priority' | 'manual' | 'ignore'
  resolvedBy?: number
  isActive: boolean
  
  // Conflict details
  overlapStart: string
  overlapEnd: string
  affectedDevices?: number[]
  autoResolutionAttempted: boolean
  manualResolutionRequired: boolean
}

/**
 * Schedule information for assignments
 */
export interface ScheduleInfo {
  id: number
  name: string
  description?: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  isActive: boolean
  priority: number
  category?: string
  tags?: string[]
}

// ============================================================================
// BULK OPERATION TYPES
// ============================================================================

/**
 * Bulk assignment request for multiple users and schedules
 */
export interface BulkScheduleAssignmentRequest {
  userIds: number[]
  scheduleIds: number[]
  assignmentSettings: {
    priority: number
    allowConflicts: boolean
    notes?: string
    replaceExisting: boolean
  }
}

/**
 * Bulk operation response from API
 */
export interface BulkOperationResponse {
  success: boolean
  data: {
    operationId: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    progress: {
      total: number
      completed: number
      failed: number
      skipped: number
    }
    estimatedCompletionTime?: string
  }
}

/**
 * User schedule assignment API response
 */
export interface UserScheduleAssignmentResponse {
  success: boolean
  data: UserScheduleAssignment[]
  conflicts?: ScheduleConflict[]
  pagination?: EnhancedPagination
}

/**
 * Create schedule assignment request
 */
export interface CreateScheduleAssignmentRequest {
  scheduleId: number
  priority?: number
  notes?: string
  allowConflicts?: boolean
}

/**
 * Update schedule assignment request
 */
export interface UpdateScheduleAssignmentRequest {
  priority?: number
  notes?: string
  status?: 'active' | 'inactive' | 'pending'
}

/**
 * Conflict error response from API
 */
export interface ConflictErrorResponse {
  success: false
  error: {
    code: 'SCHEDULE_CONFLICT'
    message: string
    details: {
      conflicts: ScheduleConflict[]
      resolutionOptions: Array<{
        type: 'priority' | 'reschedule' | 'ignore'
        description: string
        parameters?: Record<string, any>
      }>
    }
  }
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  level: number; // 1: Super Admin, 2: Admin, 3: Manager, 4: Operator
  permissions: Permission[];
  userCount?: number;
  createdAt: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  name?: string;
  conditions?: Record<string, any>;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  isActive?: boolean;
}

/**
 * Enhanced User Filters with advanced filtering capabilities
 */
export interface UserFilters {
  search?: string;
  role?: string[];
  status?: ('active' | 'inactive')[];
  lastLogin?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  
  // Enhanced filtering options
  department?: string[];
  hasScheduleConflicts?: boolean;
  assignedScheduleIds?: number[];
  lastScheduleUpdate?: {
    from?: string;
    to?: string;
  };
  scheduleSyncStatus?: ('synced' | 'pending' | 'failed')[];
  createdDate?: {
    from?: string;
    to?: string;
  };
}

/**
 * Enhanced User List Response with additional metadata
 */
export interface EnhancedUserListResponse extends UserListResponse {
  data: EnhancedUser[];
  aggregations?: {
    totalActiveUsers: number;
    totalConflicts: number;
    totalAssignments: number;
    usersByRole: Record<string, number>;
    usersByDepartment: Record<string, number>;
  };
  filters?: UserFilters;
}

export interface UserListResponse {
  success: boolean;
  data: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RoleListResponse {
  success: boolean;
  data: UserRole[];
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  level: number;
  permissions: Array<{
    resource: string;
    action: string;
  }>;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  level?: number;
  permissions?: Array<{
    resource: string;
    action: string;
  }>;
}

export interface PermissionResource {
  name: string;
  actions: string[];
}

// ============================================================================
// PERFORMANCE AND UI ENHANCEMENT TYPES
// ============================================================================

/**
 * Virtualization configuration for large user lists
 */
export interface UserListVirtualization {
  enabled: boolean;
  itemHeight: number;
  overscan?: number;
  threshold?: number; // Minimum items to enable virtualization
}

/**
 * User search and filtering configuration
 */
export interface UserSearchConfig {
  debounceMs: number;
  minSearchLength: number;
  enableFuzzySearch: boolean;
  searchFields: ('username' | 'email' | 'firstName' | 'lastName' | 'department')[];
}

/**
 * Enhanced pagination with performance metrics
 */
export interface EnhancedPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  
  // Performance metrics
  queryTime?: number;
  cacheHit?: boolean;
  totalFiltered?: number;
}

export const PERMISSION_RESOURCES: PermissionResource[] = [
  { name: 'users', actions: ['read', 'write', 'delete', 'assign'] },
  { name: 'roles', actions: ['read', 'write', 'delete'] },
  { name: 'devices', actions: ['read', 'write', 'delete'] },
  { name: 'schedules', actions: ['read', 'write', 'delete', 'assign'] },
  { name: 'media', actions: ['read', 'write', 'delete'] },
  { name: 'schedules', actions: ['read', 'write', 'delete'] },
  { name: 'analytics', actions: ['read'] },
  { name: 'settings', actions: ['read', 'write'] },
];
