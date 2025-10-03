/**
 * Enhanced UI Types for User Schedule Assignment Integration
 * 
 * This file contains enhanced type definitions that extend existing components
 * with improved UI functionality while maintaining backward compatibility.
 * 
 * @see copilot-instructions-web.md - TypeScript Strict Mode requirements
 * @see data-model.md - Enhanced UI state entities specification
 */

import { UserScheduleAssignmentProps, UserScheduleAssignmentState } from '@/features/users/components/UserScheduleAssignment.types'
import { UserSchedule } from '@/features/users/types/userSchedule'

// ============================================================================
// ENHANCED COMPONENT PROPS (extending existing interfaces)
// ============================================================================

/**
 * Enhanced UserScheduleAssignment component props
 * Extends existing props with enhanced UI capabilities
 */
export interface EnhancedUserScheduleAssignmentProps extends UserScheduleAssignmentProps {
  // Visual Enhancement Props
  /** Show loading skeleton placeholders */
  showLoadingSkeleton?: boolean
  /** Enable optimistic updates for immediate feedback */
  enableOptimisticUpdates?: boolean
  /** Show visual preview before operations */
  showVisualPreview?: boolean
  
  // Interaction Enhancement Props
  /** Enable bulk operations interface */
  enableBulkOperations?: boolean
  /** Show advanced filters and search */
  showAdvancedFilters?: boolean
  /** Enable drag and drop functionality */
  enableDragDrop?: boolean
  
  // Performance Enhancement Props
  /** Virtual scrolling configuration */
  virtualScrolling?: {
    enabled: boolean
    itemHeight: number
    overscan?: number
  }
  
  // Accessibility Enhancement Props
  /** Enhanced ARIA configuration */
  enhancedAria?: {
    announceChanges: boolean
    detailedDescriptions: boolean
  }
  
  // Enhanced Callbacks
  /** Callback when bulk operation starts */
  onBulkOperationStart?: (operation: BulkOperation) => void
  /** Callback when bulk operation completes */
  onBulkOperationComplete?: (result: BulkOperationResult) => void
  /** Callback when optimistic update occurs */
  onOptimisticUpdate?: (update: OptimisticUpdate) => void
  /** Callback for performance metrics */
  onPerformanceMetric?: (metric: PerformanceMetric) => void
}

/**
 * Enhanced Assignment State extending existing state
 */
export interface EnhancedAssignmentState extends UserScheduleAssignmentState {
  // Enhanced UI state
  ui: {
    selectedItems: Set<string>
    bulkOperationMode: boolean
    previewMode: {
      enabled: boolean
      assignmentId: string | null
      previewData: AssignmentPreview | null
    }
    optimisticUpdates: {
      enabled: boolean
      pendingOperations: OptimisticUpdate[]
    }
    filters: {
      searchTerm: string
      selectedTags: string[]
      dateRange: DateRange | null
      statusFilter: AssignmentStatus[]
    }
    sorting: {
      field: SortField
      direction: 'asc' | 'desc'
    }
    virtualScrolling: {
      startIndex: number
      endIndex: number
      totalItems: number
    }
  }
  
  // Enhanced caching
  cache: {
    lastFetch: number
    invalidationTriggers: string[]
    optimizedQueries: Map<string, CachedQuery>
  }
  
  // Enhanced error handling
  errors: {
    validation: ValidationError[]
    network: NetworkError[]
    user: UserError[]
  }
}

// ============================================================================
// BULK OPERATIONS TYPES
// ============================================================================

export interface BulkOperation {
  id: string
  type: 'assign' | 'remove' | 'change-priority' | 'toggle-default'
  selectedItems: string[]
  options: {
    scheduleIds?: string[]
    priority?: number
    defaultFlag?: boolean
  }
  progress: {
    total: number
    completed: number
    failed: number
    skipped: number
  }
  validation: {
    warnings: BulkWarning[]
    errors: BulkError[]
    canProceed: boolean
  }
}

export interface BulkOperationResult {
  operationId: string
  overall: {
    total: number
    successful: number
    failed: number
    skipped: number
  }
  results: Array<{
    id: string
    status: 'success' | 'error' | 'skipped'
    data?: any
    error?: string
  }>
  performance: {
    totalDuration: number
    averageItemDuration: number
  }
}

export interface BulkWarning {
  type: 'conflict' | 'permission' | 'validation'
  message: string
  affectedItems: string[]
}

export interface BulkError {
  type: 'network' | 'validation' | 'permission' | 'system'
  message: string
  code?: string
  affectedItems: string[]
}

// ============================================================================
// OPTIMISTIC UPDATES TYPES
// ============================================================================

export interface OptimisticUpdate {
  id: string
  type: 'assign' | 'remove' | 'bulk-assign' | 'bulk-remove' | 'toggle-default'
  timestamp: number
  data: {
    original: any
    optimistic: any
    rollback: () => void
  }
  status: 'pending' | 'confirmed' | 'failed' | 'rolled-back'
  retryCount: number
  maxRetries: number
}

// ============================================================================
// VIRTUAL SCROLLING TYPES
// ============================================================================

export interface VirtualScrollConfig {
  itemHeight: number | ((index: number) => number)
  overscan?: number
  scrollingDelay?: number
  getItemKey: (index: number, data: any) => string
  estimatedItemSize?: number
}

// ============================================================================
// PERFORMANCE & CACHING TYPES
// ============================================================================

export interface PerformanceMetric {
  type: 'render' | 'interaction' | 'memory' | 'network'
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count'
  timestamp: number
}

export interface CachedQuery {
  key: string
  data: any
  timestamp: number
  ttl: number
  dependencies: string[]
  invalidationTriggers: string[]
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface AssignmentPreview {
  before: {
    assignedCount: number
    defaultSchedule?: UserSchedule
  }
  after: {
    assignedCount: number
    defaultSchedule?: UserSchedule
    newAssignments: UserSchedule[]
    removedAssignments: UserSchedule[]
  }
  conflicts: ConflictInfo[]
}

export interface ConflictInfo {
  type: 'time-overlap' | 'priority-conflict' | 'permission-denied'
  message: string
  affectedSchedules: string[]
  severity: 'low' | 'medium' | 'high'
}

export interface DateRange {
  start: Date
  end: Date
}

export type AssignmentStatus = 'active' | 'inactive' | 'pending' | 'expired'
export type SortField = 'name' | 'priority' | 'createdAt' | 'status'

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface NetworkError {
  message: string
  status: number
  code: string
  retryable: boolean
}

export interface UserError {
  message: string
  type: 'validation' | 'permission' | 'conflict'
  action?: string
}

// ============================================================================
// ENHANCED ASSIGNED SCHEDULES LIST TYPES
// ============================================================================

import type { AssignedSchedulesListProps } from '@/features/users/components/AssignedSchedulesList.types'

/**
 * Enhanced AssignedSchedulesList component props
 * Extends existing props with enhanced UI capabilities
 */
export interface EnhancedAssignedSchedulesListProps extends AssignedSchedulesListProps {
  // Virtual Scrolling Enhancement
  /** Enable virtual scrolling for large datasets */
  enableVirtualScrolling?: boolean
  /** Virtual scrolling configuration */
  virtualScrolling?: VirtualScrollConfig

  // Bulk Selection Enhancement
  /** Enable bulk selection interface */
  enableBulkSelection?: boolean
  /** Currently selected items */
  selectedItems?: Set<string>
  /** Callback when item selection changes */
  onItemSelect?: (itemId: string, selected: boolean) => void
  /** Callback for bulk select operations (all, none, inverse) */
  onBulkSelect?: (action: 'all' | 'none' | 'inverse') => void
  /** Available bulk actions */
  bulkActions?: Array<{
    label: string
    action: string
    icon: string
    disabled?: boolean
  }>

  // Drag and Drop Enhancement
  /** Enable drag and drop reordering */
  enableDragDrop?: boolean
  /** Callback when items are reordered */
  onReorder?: (oldIndex: number, newIndex: number) => void
  /** Drag constraints */
  dragConstraints?: {
    vertical: boolean
    horizontal: boolean
  }
  /** Drag preview configuration */
  dragPreview?: {
    showPreview: boolean
    previewComponent: string
  }

  // Filtering and Sorting Enhancement
  /** Enable filtering interface */
  enableFiltering?: boolean
  /** Show filter controls */
  showFilterControls?: boolean
  /** Current filter options */
  filterOptions?: {
    searchTerm: string
    statusFilter: string[]
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
  /** Callback when filter changes */
  onFilterChange?: (filters: any) => void

  // Performance Monitoring
  /** Performance monitoring configuration */
  performanceMonitoring?: {
    enabled: boolean
    measureRenderTime?: boolean
  }
  /** Callback for performance metrics */
  onPerformanceMetric?: (metric: PerformanceMetric) => void
}

// ============================================================================
// ENHANCED SCHEDULE SELECTOR TYPES
// ============================================================================

import type { ScheduleSelectorProps } from '@/features/users/components/ScheduleSelector.types'

/**
 * Enhanced ScheduleSelector component props
 * Extends existing props with enhanced UI capabilities
 */
export interface EnhancedScheduleSelectorProps extends ScheduleSelectorProps {
  // Advanced Search Enhancement
  /** Enable fuzzy search functionality */
  enableFuzzySearch?: boolean
  /** Search debounce delay in milliseconds */
  searchDebounceMs?: number
  /** Advanced search configuration */
  advancedSearch?: {
    searchFields: string[]
    highlightMatches: boolean
    minimumMatchScore: number
  }

  // Filtering Enhancement
  /** Enable advanced filtering */
  enableAdvancedFiltering?: boolean
  /** Available filter criteria */
  filterCriteria?: Array<{
    field: string
    label: string
    type: 'text' | 'select' | 'date' | 'boolean'
    options?: Array<{ label: string; value: any }>
  }>
  /** Current filter state */
  currentFilters?: Record<string, any>
  /** Callback when filters change */
  onFiltersChange?: (filters: Record<string, any>) => void

  // Display Mode Enhancement
  /** Display mode: modal or inline */
  displayMode?: 'modal' | 'inline'
  /** Inline container configuration */
  inlineConfig?: {
    maxHeight: number
    showBorder: boolean
    compact: boolean
  }

  // Selection Enhancement
  /** Enable selection validation */
  enableSelectionValidation?: boolean
  /** Selection validation rules */
  selectionValidation?: {
    minItems: number
    maxItems: number
    validateConflicts: boolean
    customValidator?: (selectedIds: number[]) => { valid: boolean; message?: string }
  }
  /** Show selection preview */
  showSelectionPreview?: boolean

  // Performance Enhancement
  /** Enable performance optimizations for large datasets */
  enablePerformanceMode?: boolean
  /** Virtualization threshold (number of items before virtual scrolling) */
  virtualizationThreshold?: number
  /** Performance monitoring */
  performanceMonitoring?: {
    enabled: boolean
    measureSearchTime?: boolean
    measureRenderTime?: boolean
  }
  /** Callback for performance metrics */
  onPerformanceMetric?: (metric: PerformanceMetric) => void
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

// Re-export existing types for convenience
export type { UserScheduleAssignmentProps, UserScheduleAssignmentState } from '@/features/users/components/UserScheduleAssignment.types'
export type { AssignedSchedulesListProps } from '@/features/users/components/AssignedSchedulesList.types'
export type { ScheduleSelectorProps } from '@/features/users/components/ScheduleSelector.types'
export type { UserSchedule } from '@/features/users/types/userSchedule'