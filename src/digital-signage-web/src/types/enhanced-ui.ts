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
// ENHANCED PERFORMANCE METRICS TYPES
// ============================================================================

/**
 * Comprehensive performance metrics for UI components
 */
export interface ComponentPerformanceMetrics {
  // Rendering Performance
  renderMetrics: {
    initialRender: number; // ms
    updateRender: number; // ms
    reRenderCount: number;
    largestContentfulPaint: number; // ms
    cumulativeLayoutShift: number;
    firstInputDelay: number; // ms
  };

  // Memory Usage
  memoryMetrics: {
    heapUsed: number; // bytes
    heapTotal: number; // bytes
    componentMemoryFootprint: number; // bytes
    memoryLeaks: Array<{
      component: string;
      leakSize: number;
      detectedAt: number;
    }>;
  };

  // Network Performance
  networkMetrics: {
    apiCallDuration: Record<string, number>; // endpoint -> ms
    cacheHitRate: number; // percentage
    networkRequestCount: number;
    dataTransferSize: number; // bytes
    offlineQueueSize: number;
  };

  // User Interaction
  interactionMetrics: {
    responseTime: Record<string, number>; // action -> ms
    clickThroughRate: number;
    userEngagementScore: number;
    errorRate: number; // percentage
    taskCompletionRate: number; // percentage
  };

  // Component Specific
  componentMetrics: {
    virtualScrollingEfficiency: number; // percentage
    bulkOperationThroughput: number; // items per second
    searchPerformance: number; // ms per query
    filteringLatency: number; // ms
    dragDropLatency: number; // ms
  };
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceMonitoringConfig {
  enabled: boolean;
  sampleRate: number; // 0-1, percentage of operations to monitor
  thresholds: {
    renderTime: number; // ms
    memoryUsage: number; // bytes
    networkLatency: number; // ms
    interactionDelay: number; // ms
  };
  alerting: {
    enabled: boolean;
    channels: ('console' | 'analytics' | 'webhook')[];
    webhookUrl?: string;
  };
  retention: {
    maxEntries: number;
    retentionDays: number;
  };
}

/**
 * Performance baseline for comparison
 */
export interface PerformanceBaseline {
  component: string;
  version: string;
  baseline: ComponentPerformanceMetrics;
  recordedAt: number;
  environment: {
    userAgent: string;
    deviceType: 'mobile' | 'tablet' | 'desktop';
    connectionType: string;
  };
}

// ============================================================================
// ENHANCED OPTIMISTIC UPDATE TYPES
// ============================================================================

/**
 * Enhanced optimistic update with rollback and conflict resolution
 */
export interface EnhancedOptimisticUpdate extends OptimisticUpdate {
  // Update Context
  context: {
    userId: string;
    sessionId: string;
    componentId: string;
    operationSource: 'user' | 'bulk' | 'system';
  };

  // Conflict Resolution
  conflictResolution: {
    strategy: 'abort' | 'merge' | 'override' | 'prompt';
    conflictDetected: boolean;
    conflictsWith: string[]; // other update IDs
    resolution?: OptimisticUpdateResolution;
  };

  // Update Chain
  dependencies: {
    parentUpdateId?: string;
    childUpdateIds: string[];
    blockingUpdates: string[];
  };

  // State Management
  stateSnapshot: {
    beforeUpdate: unknown;
    afterUpdate: unknown;
    intermediateStates: unknown[];
  };

  // Validation
  validation: {
    clientSideValid: boolean;
    serverSideValid?: boolean;
    validationErrors: ValidationError[];
    warningMessages: string[];
  };

  // Performance Tracking
  performance: {
    queueTime: number; // ms
    processingTime: number; // ms
    networkTime?: number; // ms
    totalTime: number; // ms
  };

  // Recovery Options
  recovery: {
    autoRetry: boolean;
    maxRetryAttempts: number;
    currentRetryAttempt: number;
    exponentialBackoff: boolean;
    fallbackStrategy?: 'rollback' | 'skip' | 'manual';
  };
}

/**
 * Optimistic update resolution strategies
 */
export interface OptimisticUpdateResolution {
  type: 'merge' | 'override' | 'abort' | 'manual';
  mergeStrategy?: {
    conflictFields: string[];
    preferLocal: boolean;
    customMerger?: (local: unknown, remote: unknown) => unknown;
  };
  resolvedAt: number;
  resolvedBy: 'system' | 'user';
  finalState: unknown;
}

/**
 * Optimistic update queue management
 */
export interface OptimisticUpdateQueue {
  updates: EnhancedOptimisticUpdate[];
  maxQueueSize: number;
  processingMode: 'sequential' | 'parallel' | 'hybrid';
  concurrencyLimit: number;
  conflictResolutionEnabled: boolean;
  automaticCleanup: {
    enabled: boolean;
    cleanupInterval: number; // ms
    maxAge: number; // ms
  };
}

/**
 * Optimistic update analytics
 */
export interface OptimisticUpdateAnalytics {
  successRate: number; // percentage
  averageConfirmationTime: number; // ms
  conflictRate: number; // percentage
  rollbackRate: number; // percentage
  performanceMetrics: {
    queueProcessingTime: number; // ms
    memoryUsage: number; // bytes
    cpuUsage: number; // percentage
  };
  userExperience: {
    perceivedLatency: number; // ms
    userSatisfactionScore: number;
    errorRecoveryTime: number; // ms
  };
}

// ============================================================================
// ADVANCED UI STATE MANAGEMENT
// ============================================================================

/**
 * Enhanced UI state with performance and optimization features
 */
export interface EnhancedUIState {
  // Component Lifecycle
  lifecycle: {
    mounted: boolean;
    initialized: boolean;
    destroyed: boolean;
    lastActivity: number;
  };

  // Performance State
  performance: {
    metrics: ComponentPerformanceMetrics;
    monitoring: PerformanceMonitoringConfig;
    baseline?: PerformanceBaseline;
    alerts: PerformanceAlert[];
  };

  // Optimization State
  optimization: {
    memoization: {
      enabled: boolean;
      cacheSize: number;
      hitRate: number;
    };
    lazyLoading: {
      enabled: boolean;
      loadedChunks: Set<string>;
      pendingChunks: Set<string>;
    };
    preloading: {
      enabled: boolean;
      preloadedData: Map<string, unknown>;
      preloadStrategies: string[];
    };
  };

  // User Experience
  ux: {
    loadingStates: Map<string, LoadingState>;
    errorStates: Map<string, ErrorState>;
    successStates: Map<string, SuccessState>;
    accessibilityState: AccessibilityState;
  };

  // Data Synchronization
  sync: {
    optimisticUpdates: OptimisticUpdateQueue;
    serverState: Map<string, unknown>;
    conflictResolution: ConflictResolutionState;
    offlineQueue: OfflineOperationQueue;
  };
}

/**
 * Performance alert types
 */
export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical';
  metric: keyof ComponentPerformanceMetrics;
  threshold: number;
  actualValue: number;
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

/**
 * Loading state with progress tracking
 */
export interface LoadingState {
  loading: boolean;
  progress?: {
    current: number;
    total: number;
    percentage: number;
    estimatedTimeRemaining?: number; // ms
  };
  message?: string;
  skeletonConfig?: {
    enabled: boolean;
    variant: 'text' | 'circular' | 'rectangular';
    animation: 'pulse' | 'wave' | 'none';
  };
}

/**
 * Enhanced error state with recovery options
 */
export interface ErrorState {
  error: Error | null;
  errorCode?: string;
  recoverable: boolean;
  recoveryOptions?: Array<{
    label: string;
    action: () => void;
    primary: boolean;
  }>;
  retryCount: number;
  maxRetries: number;
  lastErrorTime?: number;
}

/**
 * Success state with feedback options
 */
export interface SuccessState {
  success: boolean;
  message?: string;
  actionTaken?: string;
  undoable: boolean;
  undoAction?: () => void;
  undoTimeout?: number; // ms
  timestamp: number;
}

/**
 * Accessibility state tracking
 */
export interface AccessibilityState {
  screenReaderEnabled: boolean;
  highContrastMode: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  keyboardNavigation: boolean;
  focusManagement: {
    focusedElement?: string;
    focusHistory: string[];
    focusTrap: boolean;
  };
  announcements: Array<{
    message: string;
    priority: 'polite' | 'assertive';
    timestamp: number;
  }>;
}

/**
 * Conflict resolution state
 */
export interface ConflictResolutionState {
  activeConflicts: Map<string, ConflictInfo>;
  resolutionHistory: Array<{
    conflictId: string;
    resolution: OptimisticUpdateResolution;
    timestamp: number;
  }>;
  autoResolutionEnabled: boolean;
  userPreferences: {
    defaultStrategy: 'merge' | 'override' | 'prompt';
    rememberChoices: boolean;
  };
}

/**
 * Offline operation queue
 */
export interface OfflineOperationQueue {
  operations: Array<{
    id: string;
    operation: unknown;
    timestamp: number;
    retryCount: number;
  }>;
  syncStatus: 'online' | 'offline' | 'syncing';
  lastSyncTime?: number;
  conflictResolutionNeeded: boolean;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

// Re-export existing types for convenience
export type { UserScheduleAssignmentProps, UserScheduleAssignmentState } from '@/features/users/components/UserScheduleAssignment.types'
export type { AssignedSchedulesListProps } from '@/features/users/components/AssignedSchedulesList.types'
export type { ScheduleSelectorProps } from '@/features/users/components/ScheduleSelector.types'
export type { UserSchedule } from '@/features/users/types/userSchedule'