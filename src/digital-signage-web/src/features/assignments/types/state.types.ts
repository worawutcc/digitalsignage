/**
 * @fileoverview Assignment Redux State Type Definitions
 * @description TypeScript interfaces for Redux state management
 */

import type {
  Assignment,
  AssignmentSummary,
  AssignmentFilter,
  AssignmentSort,
  AssignmentStatus,
} from './assignment.types';

import type {
  AssignmentAnalytics,
  AssignmentValidationResult,
} from './api.types';

// ============================================================================
// Assignment State
// ============================================================================

/**
 * Main assignment feature state
 */
export interface AssignmentState {
  // Assignment list state
  assignments: Assignment[];
  assignmentSummaries: AssignmentSummary[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  
  // Current assignment (detail view)
  currentAssignment: Assignment | null;
  
  // Filter and sort state
  filters: AssignmentFilter;
  sort: AssignmentSort;
  searchQuery: string;
  
  // Selection state (for bulk operations)
  selectedAssignmentIds: number[];
  
  // Draft assignment (form state)
  draftAssignment: Partial<Assignment> | null;
  
  // Analytics data
  analytics: AssignmentAnalytics | null;
  
  // UI state
  ui: AssignmentUIState;
  
  // Loading states
  loading: AssignmentLoadingState;
  
  // Error state
  errors: AssignmentErrorState;
}

/**
 * UI-specific state
 */
export interface AssignmentUIState {
  /** Whether the create/edit drawer is open */
  isDrawerOpen: boolean;
  
  /** Whether the bulk operations panel is visible */
  isBulkPanelVisible: boolean;
  
  /** Whether the filter panel is expanded */
  isFilterPanelExpanded: boolean;
  
  /** Current view mode (list, grid, calendar) */
  viewMode: 'list' | 'grid' | 'calendar';
  
  /** Whether to show expired assignments */
  showExpired: boolean;
  
  /** Whether to show only emergency broadcasts */
  onlyEmergencyBroadcasts: boolean;
}

/**
 * Loading states for different operations
 */
export interface AssignmentLoadingState {
  /** Loading assignment list */
  fetchingAssignments: boolean;
  
  /** Loading assignment details */
  fetchingAssignment: boolean;
  
  /** Creating assignment */
  creatingAssignment: boolean;
  
  /** Updating assignment */
  updatingAssignment: boolean;
  
  /** Deleting assignment */
  deletingAssignment: boolean;
  
  /** Bulk operations in progress */
  bulkOperationInProgress: boolean;
  
  /** Loading analytics */
  fetchingAnalytics: boolean;
  
  /** Validating assignment */
  validatingAssignment: boolean;
}

/**
 * Error states
 */
export interface AssignmentErrorState {
  /** Error fetching assignments */
  fetchError: string | null;
  
  /** Error creating assignment */
  createError: string | null;
  
  /** Error updating assignment */
  updateError: string | null;
  
  /** Error deleting assignment */
  deleteError: string | null;
  
  /** Bulk operation errors */
  bulkErrors: string[];
  
  /** Analytics errors */
  analyticsError: string | null;
  
  /** Validation errors */
  validationErrors: Record<string, string>;
}

// ============================================================================
// Action Payload Types
// ============================================================================

/**
 * Payload for setting assignments
 */
export interface SetAssignmentsPayload {
  assignments: Assignment[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/**
 * Payload for updating filter
 */
export interface UpdateFilterPayload {
  filter: Partial<AssignmentFilter>;
}

/**
 * Payload for updating sort
 */
export interface UpdateSortPayload {
  sort: AssignmentSort;
}

/**
 * Payload for bulk selection
 */
export interface BulkSelectionPayload {
  assignmentIds: number[];
  mode: 'add' | 'remove' | 'replace';
}

/**
 * Payload for status update
 */
export interface UpdateStatusPayload {
  assignmentId: number;
  status: AssignmentStatus;
  reason?: string;
}

/**
 * Payload for priority update
 */
export interface UpdatePriorityPayload {
  assignmentId: number;
  priority: number;
  resolveConflicts?: boolean;
}

/**
 * Payload for draft assignment changes
 */
export interface UpdateDraftPayload {
  changes: Partial<Assignment>;
  merge?: boolean; // true = merge with existing, false = replace
}

// ============================================================================
// Thunk Args (for async actions)
// ============================================================================

/**
 * Arguments for fetchAssignments thunk
 */
export interface FetchAssignmentsArgs {
  page?: number;
  pageSize?: number;
  filters?: AssignmentFilter;
  sort?: AssignmentSort;
  forceRefresh?: boolean;
}

/**
 * Arguments for createAssignment thunk
 */
export interface CreateAssignmentArgs {
  assignment: Partial<Assignment>;
  redirectOnSuccess?: boolean;
}

/**
 * Arguments for updateAssignment thunk
 */
export interface UpdateAssignmentArgs {
  assignmentId: number;
  changes: Partial<Assignment>;
  optimistic?: boolean;
}

/**
 * Arguments for deleteAssignment thunk
 */
export interface DeleteAssignmentArgs {
  assignmentId: number;
  reason?: string;
}

/**
 * Arguments for bulk operations
 */
export interface BulkOperationArgs {
  assignmentIds: number[];
  operation: 'activate' | 'pause' | 'delete' | 'updatePriority' | 'updateStatus';
  params?: Record<string, any>;
}

// ============================================================================
// Selector Return Types
// ============================================================================

/**
 * Return type for filtered assignments selector
 */
export interface FilteredAssignmentsResult {
  assignments: Assignment[];
  totalCount: number;
  hasMore: boolean;
}

/**
 * Return type for assignment statistics selector
 */
export interface AssignmentStatistics {
  total: number;
  byStatus: Record<AssignmentStatus, number>;
  emergencyCount: number;
  activeHighPriority: number;
}

/**
 * Return type for validation status selector
 */
export interface ValidationStatus {
  isValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  errorCount: number;
  warningCount: number;
}

// ============================================================================
// Cache Types
// ============================================================================

/**
 * Cache entry for assignment data
 */
export interface AssignmentCacheEntry {
  data: Assignment;
  timestamp: number;
  expiresAt: number;
}

/**
 * Cache configuration
 */
export interface AssignmentCacheConfig {
  /** Time-to-live in milliseconds */
  ttl: number;
  
  /** Maximum cache size */
  maxSize: number;
  
  /** Whether to use session storage for persistence */
  persistToSession: boolean;
}

// ============================================================================
// Persistence Types
// ============================================================================

/**
 * Persisted state structure (for localStorage)
 */
export interface PersistedAssignmentState {
  /** Draft assignment in progress */
  draftAssignment: Partial<Assignment> | null;
  
  /** Last used filters */
  filters: AssignmentFilter;
  
  /** Last used sort */
  sort: AssignmentSort;
  
  /** UI preferences */
  ui: Pick<AssignmentUIState, 'viewMode' | 'showExpired'>;
  
  /** Timestamp of last save */
  savedAt: number;
}

/**
 * Persistence configuration
 */
export interface PersistenceConfig {
  /** Storage key prefix */
  storageKey: string;
  
  /** Maximum age before clearing (ms) */
  maxAge: number;
  
  /** Whether to enable persistence */
  enabled: boolean;
}
