/**
 * @fileoverview Assignment API Type Definitions
 * @description TypeScript interfaces for API requests and responses
 */

import type {
  Assignment,
  AssignmentType,
  AssignmentTargetType,
  AssignmentStatus,
  AssignmentHistory,
  AssignmentFilter,
  AssignmentSort,
} from './assignment.types';

// ============================================================================
// Request Types
// ============================================================================

/**
 * Request to create a new assignment
 */
export interface CreateAssignmentRequest {
  assignmentType: AssignmentType;
  contentId: number;
  targetType: AssignmentTargetType;
  targetId: number;
  priority: number; // 1-10
  startDate: string; // ISO date string
  endDate?: string | null; // ISO date string
  startTime?: string | null; // HH:mm format
  endTime?: string | null; // HH:mm format
  isRecurring?: boolean;
  recurrencePattern?: string | null;
  daysOfWeek?: string | null;
  isEmergencyBroadcast?: boolean;
  emergencyExpiresAt?: string | null;
  notes?: string | null;
}

/**
 * Request to update an existing assignment
 */
export interface UpdateAssignmentRequest {
  priority?: number;
  startDate?: string;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  isRecurring?: boolean;
  recurrencePattern?: string | null;
  daysOfWeek?: string | null;
  status?: AssignmentStatus;
  notes?: string | null;
}

/**
 * Request to create multiple assignments in bulk
 */
export interface BulkCreateAssignmentRequest {
  assignments: CreateAssignmentRequest[];
  continueOnError?: boolean;
  useTransaction?: boolean;
}

/**
 * Request to update assignment status
 */
export interface UpdateAssignmentStatusRequest {
  status: AssignmentStatus;
  reason?: string;
}

/**
 * Request to update assignment priority
 */
export interface UpdateAssignmentPriorityRequest {
  priority: number;
  resolveConflicts?: boolean;
}

/**
 * Request to get assignment list with filters
 */
export interface GetAssignmentsRequest {
  status?: AssignmentStatus;
  assignmentType?: AssignmentType;
  targetType?: AssignmentTargetType;
  targetId?: number;
  createdByUserId?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Paginated response for assignment list
 */
export interface AssignmentListResponse {
  items: Assignment[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Response for assignment creation
 */
export interface CreateAssignmentResponse {
  assignment: Assignment;
  conflicts?: AssignmentConflict[];
}

/**
 * Response for bulk assignment creation
 */
export interface BulkAssignmentResponse {
  successfulCount: number;
  failedCount: number;
  createdAssignments: Assignment[];
  errors: BulkAssignmentError[];
}

/**
 * Bulk assignment error detail
 */
export interface BulkAssignmentError {
  index: number;
  request: CreateAssignmentRequest;
  errorMessage: string;
  errorCode?: string;
}

/**
 * Assignment conflict information
 */
export interface AssignmentConflict {
  conflictingAssignmentId: number;
  conflictingAssignmentName: string;
  conflictType: 'priority' | 'schedule' | 'resource';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion?: string;
}

/**
 * Response for assignment deletion
 */
export interface DeleteAssignmentResponse {
  success: boolean;
  message?: string;
}

/**
 * Response for assignment history
 */
export interface AssignmentHistoryResponse {
  history: AssignmentHistory[];
  totalCount: number;
}

// ============================================================================
// Analytics Types
// ============================================================================

/**
 * Assignment analytics/dashboard metrics
 */
export interface AssignmentAnalytics {
  totalAssignments: number;
  activeAssignments: number;
  scheduledAssignments: number;
  expiredAssignments: number;
  emergencyBroadcasts: number;
  
  byType: {
    [key in AssignmentType]?: number;
  };
  
  byStatus: {
    [key in AssignmentStatus]?: number;
  };
  
  byTargetType: {
    [key in AssignmentTargetType]?: number;
  };
  
  deviceUtilization: {
    totalDevices: number;
    devicesWithAssignments: number;
    utilizationPercentage: number;
  };
  
  priorityDistribution: {
    priority: number;
    count: number;
  }[];
  
  recentActivity: {
    date: string;
    created: number;
    activated: number;
    expired: number;
  }[];
}

/**
 * Device assignment summary
 */
export interface DeviceAssignmentSummary {
  deviceId: number;
  deviceName: string;
  activeAssignmentsCount: number;
  scheduledAssignmentsCount: number;
  highestPriority: number;
  hasEmergencyBroadcast: boolean;
  nextScheduledAssignment?: {
    id: number;
    contentName: string;
    startDate: string;
  };
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Assignment validation result
 */
export interface AssignmentValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  conflicts: AssignmentConflict[];
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

// ============================================================================
// Export Options
// ============================================================================

/**
 * Options for exporting assignments
 */
export interface ExportAssignmentsOptions {
  format: 'csv' | 'excel' | 'json';
  includeHistory?: boolean;
  filters?: AssignmentFilter;
  sort?: AssignmentSort;
}

/**
 * Options for importing assignments
 */
export interface ImportAssignmentsOptions {
  format: 'csv' | 'excel' | 'json';
  validateOnly?: boolean;
  continueOnError?: boolean;
  overwriteExisting?: boolean;
}

/**
 * Import assignments result
 */
export interface ImportAssignmentsResult {
  totalRecords: number;
  successCount: number;
  errorCount: number;
  warnings: string[];
  errors: BulkAssignmentError[];
  createdAssignments: Assignment[];
}

// ============================================================================
// Error Response
// ============================================================================

/**
 * API error response
 */
export interface AssignmentApiError {
  message: string;
  errors?: { [key: string]: string[] };
  statusCode: number;
  traceId?: string;
}
