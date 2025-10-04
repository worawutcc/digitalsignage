/**
 * Bulk Operations Types
 * TypeScript interfaces for bulk operation management, progress tracking, 
 * error handling, and operation metadata
 * 
 * @see copilot-instructions-ui.instructions.md - TypeScript Strict Mode
 * @see specs/024-user-management-and/data-model.md - BulkOperation entities
 */

// ============================================================================
// BULK OPERATION CORE TYPES
// ============================================================================

/**
 * Bulk Operation Status enumeration
 */
export type BulkOperationStatus = 
  | 'pending'
  | 'in_progress' 
  | 'completed' 
  | 'failed' 
  | 'cancelled'
  | 'paused';

/**
 * Bulk Operation Type enumeration
 */
export type BulkOperationType = 
  | 'assign_schedules'
  | 'update_users'
  | 'delete_users'
  | 'resolve_conflicts'
  | 'import_users'
  | 'export_data'
  | 'sync_schedules';

/**
 * Main Bulk Operation interface
 */
export interface BulkOperation {
  id: string;
  type: BulkOperationType;
  status: BulkOperationStatus;
  progress: number; // 0-100
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: BulkOperationError[];
  startedAt: string;
  completedAt?: string;
  estimatedCompletionAt?: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  
  // Operation-specific metadata
  metadata: BulkOperationMetadata;
  
  // Performance tracking
  performance?: BulkOperationPerformance;
  
  // Cancellation support
  cancellationToken?: string;
  canBeCancelled: boolean;
  
  // Retry configuration
  retryConfig?: BulkOperationRetryConfig;
}

/**
 * Bulk Operation Metadata (operation-specific data)
 */
export interface BulkOperationMetadata {
  // User assignment operations
  userIds?: string[];
  scheduleIds?: string[];
  assignmentData?: {
    priority: number;
    allowConflicts: boolean;
    notes?: string;
    replaceExisting: boolean;
    notifyUsers: boolean;
  };
  
  // User update operations
  updateData?: {
    roleId?: string;
    isActive?: boolean;
    department?: string;
    customFields?: Record<string, any>;
  };
  
  // Conflict resolution operations
  conflictResolutionStrategy?: 'priority' | 'manual' | 'ignore';
  conflictIds?: string[];
  
  // Import/Export operations
  fileId?: string;
  fileName?: string;
  fileSize?: number;
  importMapping?: Record<string, string>;
  exportFormat?: 'csv' | 'excel' | 'json';
  exportFilters?: Record<string, any>;
  
  // Validation results
  validationErrors?: ValidationError[];
  preValidationPassed?: boolean;
}

/**
 * Bulk Operation Error
 */
export interface BulkOperationError {
  itemId: string;
  itemType: 'user' | 'schedule' | 'assignment' | 'conflict';
  errorType: 'validation' | 'conflict' | 'permission' | 'network' | 'unknown';
  errorCode: string;
  errorMessage: string;
  details?: Record<string, any>;
  retryable: boolean;
  retryCount: number;
  lastAttemptAt: string;
  suggestedResolution?: string;
}

/**
 * Validation Error
 */
export interface ValidationError {
  field: string;
  value: any;
  errorType: 'required' | 'format' | 'duplicate' | 'invalid';
  message: string;
  suggestion?: string;
}

// ============================================================================
// PERFORMANCE AND MONITORING TYPES
// ============================================================================

/**
 * Bulk Operation Performance Metrics
 */
export interface BulkOperationPerformance {
  startTime: number; // Unix timestamp
  endTime?: number;
  duration?: number; // milliseconds
  itemsPerSecond?: number;
  memoryUsage?: {
    peak: number; // bytes
    average: number;
    current: number;
  };
  apiCallsCount: number;
  cacheHits: number;
  cacheMisses: number;
  retryAttempts: number;
  
  // Batch processing metrics
  batchSize: number;
  batchesProcessed: number;
  averageBatchTime: number;
  
  // Resource utilization
  cpuUsage?: number; // percentage
  networkUsage?: {
    bytesTransferred: number;
    requestCount: number;
  };
}

/**
 * Bulk Operation Retry Configuration
 */
export interface BulkOperationRetryConfig {
  maxRetries: number;
  retryDelay: number; // milliseconds
  exponentialBackoff: boolean;
  retryableErrorTypes: string[];
  stopOnFirstSuccess: boolean;
}

// ============================================================================
// REQUEST AND RESPONSE TYPES
// ============================================================================

/**
 * Bulk Schedule Assignment Request
 */
export interface BulkScheduleAssignmentRequest {
  userIds: string[];
  scheduleIds: string[];
  assignmentSettings: {
    priority: number;
    allowConflicts: boolean;
    notes?: string;
    replaceExisting: boolean;
    notifyUsers: boolean;
  };
  operationConfig?: {
    batchSize?: number;
    delayBetweenBatches?: number;
    validateFirst?: boolean;
    skipExisting?: boolean;
  };
}

/**
 * Bulk User Update Request
 */
export interface BulkUserUpdateRequest {
  userIds: string[];
  updateData: {
    roleId?: string;
    isActive?: boolean;
    department?: string;
    customFields?: Record<string, any>;
  };
  operationConfig?: {
    batchSize?: number;
    validateFirst?: boolean;
    skipUnchanged?: boolean;
  };
}

/**
 * Bulk Operation Response
 */
export interface BulkOperationResponse {
  operationId: string;
  status: BulkOperationStatus;
  message: string;
  estimatedDuration?: string; // Human readable, e.g., "2-3 minutes"
  pollInterval?: number; // milliseconds
  statusUrl?: string;
  
  // Immediate validation results
  preValidation?: {
    passed: boolean;
    errors: ValidationError[];
    warnings: string[];
  };
}

/**
 * Bulk Operation Progress Update
 */
export interface BulkOperationProgressUpdate {
  operationId: string;
  status: BulkOperationStatus;
  progress: number;
  processedItems: number;
  totalItems: number;
  currentItem?: {
    id: string;
    name: string;
    type: string;
  };
  recentErrors: BulkOperationError[];
  estimatedTimeRemaining?: number; // milliseconds
  performance: BulkOperationPerformance;
}

// ============================================================================
// UI AND INTERACTION TYPES
// ============================================================================

/**
 * Bulk Operation UI State
 */
export interface BulkOperationUIState {
  selectedItems: Set<string>;
  bulkMode: boolean;
  activeOperation?: BulkOperation;
  operationHistory: BulkOperation[];
  
  // UI preferences
  showAdvancedOptions: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  
  // Confirmation dialogs
  pendingConfirmation?: {
    type: BulkOperationType;
    itemCount: number;
    riskLevel: 'low' | 'medium' | 'high';
    confirmationRequired: string[];
  };
}

/**
 * Bulk Operation Filter
 */
export interface BulkOperationFilter {
  status?: BulkOperationStatus[];
  type?: BulkOperationType[];
  createdBy?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  search?: string;
}

/**
 * Bulk Operation List Response
 */
export interface BulkOperationListResponse {
  operations: BulkOperation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: BulkOperationFilter;
  summary: {
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
    cancelled: number;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Bulk Operation Event for real-time updates
 */
export interface BulkOperationEvent {
  type: 'progress' | 'completed' | 'failed' | 'cancelled' | 'error';
  operationId: string;
  timestamp: string;
  data: BulkOperationProgressUpdate | BulkOperationError;
}

/**
 * Bulk Operation Template for common operations
 */
export interface BulkOperationTemplate {
  id: string;
  name: string;
  description: string;
  type: BulkOperationType;
  defaultConfig: Partial<BulkOperationMetadata>;
  requiredFields: string[];
  estimatedDuration: string;
  riskLevel: 'low' | 'medium' | 'high';
  icon?: string;
}

// Types are automatically exported above, no need for additional exports