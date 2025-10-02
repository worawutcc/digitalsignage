# Data Model: User Schedule Assignment UI Integration

**Feature**: User Schedule Assignment UI Integration  
**Date**: 2025-10-02  
**Context**: Enhanced UI data structures for existing User Schedule Assignment functionality

---

## Overview

This data model defines the enhanced UI state structures and TypeScript interfaces needed to support improved User Schedule Assignment functionality. All data structures extend or enhance existing implementations from 020-phase-1 rather than replacing them.

## Enhanced UI State Entities

### 1. Enhanced User Schedule Assignment State

```typescript
// Enhanced interface extending existing UserScheduleAssignmentProps
interface EnhancedUserScheduleAssignmentProps extends UserScheduleAssignmentProps {
  // Visual Enhancement Props
  showLoadingSkeleton?: boolean
  enableOptimisticUpdates?: boolean
  showVisualPreview?: boolean
  
  // Interaction Enhancement Props
  enableBulkOperations?: boolean
  showAdvancedFilters?: boolean
  enableDragDrop?: boolean
  
  // Performance Enhancement Props
  virtualScrolling?: {
    enabled: boolean
    itemHeight: number
    overscan?: number
  }
  
  // Accessibility Enhancement Props
  enhancedAria?: {
    announceChanges: boolean
    detailedDescriptions: boolean
  }
}

// Enhanced Assignment State for Redux Store
interface EnhancedAssignmentState {
  // Existing state (maintained for compatibility)
  assignments: UserScheduleAssignment[]
  loading: boolean
  error: string | null
  
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
      pendingOperations: OptimisticOperation[]
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
```

### 2. Enhanced Visual Feedback Types

```typescript
// Loading States
interface LoadingState {
  type: 'skeleton' | 'spinner' | 'progress' | 'optimistic'
  message?: string
  progress?: number
  estimatedTime?: number
}

// Enhanced Confirmation Dialog
interface EnhancedConfirmationDialog {
  type: 'replace' | 'bulk-assign' | 'bulk-remove' | 'default-change'
  title: string
  message: string
  preview?: {
    before: AssignmentSummary
    after: AssignmentSummary
    affectedItems: number
  }
  actions: {
    confirm: {
      label: string
      variant: 'primary' | 'destructive' | 'warning'
      loading?: boolean
    }
    cancel: {
      label: string
      variant: 'secondary'
    }
    alternative?: {
      label: string
      variant: 'secondary'
      action: string
    }
  }
  options?: {
    rememberChoice: boolean
    showDetailsToggle: boolean
  }
}

// Visual Indicators
interface VisualIndicator {
  type: 'success' | 'error' | 'warning' | 'info' | 'loading'
  message: string
  duration?: number
  position?: 'top' | 'bottom' | 'inline'
  actions?: Array<{
    label: string
    action: () => void
  }>
}
```

### 3. Enhanced Performance Types

```typescript
// Virtual Scrolling Configuration
interface VirtualScrollConfig {
  itemHeight: number | ((index: number) => number)
  overscan?: number
  scrollingDelay?: number
  getItemKey: (index: number, data: any) => string
  estimatedItemSize?: number
}

// Optimistic Update Operations
interface OptimisticOperation {
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

// Enhanced Query Cache
interface CachedQuery {
  key: string
  data: any
  timestamp: number
  ttl: number
  dependencies: string[]
  invalidationTriggers: string[]
}
```

### 4. Enhanced User Experience Types

```typescript
// Bulk Operation Interface
interface BulkOperation {
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

// Enhanced Filter Interface
interface EnhancedFilter {
  id: string
  label: string
  type: 'text' | 'select' | 'multiselect' | 'date-range' | 'boolean'
  value: any
  options?: FilterOption[]
  validation?: {
    required: boolean
    pattern?: RegExp
    min?: number
    max?: number
  }
  ui: {
    placeholder: string
    helpText?: string
    clearable: boolean
  }
}

// Enhanced Search Interface
interface EnhancedSearch {
  term: string
  filters: EnhancedFilter[]
  sorting: {
    field: string
    direction: 'asc' | 'desc'
  }
  results: {
    total: number
    filtered: number
    items: any[]
    facets: SearchFacet[]
  }
  performance: {
    debounceMs: number
    lastSearchTime: number
    cachedResults: Map<string, SearchResult>
  }
}
```

## Enhanced Component Prop Interfaces

### 1. Enhanced UserScheduleAssignment Component

```typescript
interface EnhancedUserScheduleAssignmentProps {
  // Existing props (maintained for compatibility)
  userId: string
  onAssignmentChange: (assignments: UserScheduleAssignment[]) => void
  
  // Enhanced UI props
  variant?: 'compact' | 'detailed' | 'mobile'
  showEnhancedFeatures?: boolean
  enableVirtualScrolling?: boolean
  enableBulkOperations?: boolean
  
  // Enhanced interaction props
  onBulkOperation?: (operation: BulkOperation) => Promise<void>
  onPreviewRequest?: (assignmentId: string) => void
  onOptimisticUpdate?: (operation: OptimisticOperation) => void
  
  // Enhanced customization props
  customFilters?: EnhancedFilter[]
  customActions?: CustomAction[]
  theme?: ComponentTheme
  
  // Enhanced accessibility props
  ariaLabels?: {
    bulkSelect: string
    assignButton: string
    removeButton: string
    previewButton: string
  }
}
```

### 2. Enhanced AssignedSchedulesList Component

```typescript
interface EnhancedAssignedSchedulesListProps {
  // Existing props
  assignments: UserScheduleAssignment[]
  onRemove: (assignmentId: string) => void
  onToggleDefault: (assignmentId: string) => void
  
  // Enhanced display props
  layout?: 'list' | 'grid' | 'compact'
  showMetadata?: boolean
  showActions?: boolean
  
  // Enhanced interaction props
  selectable?: boolean
  selectedItems?: Set<string>
  onSelectionChange?: (selected: Set<string>) => void
  enableDragReorder?: boolean
  onReorder?: (newOrder: string[]) => void
  
  // Enhanced performance props
  virtualScrolling?: VirtualScrollConfig
  lazyLoading?: boolean
  
  // Enhanced customization props
  customColumns?: ColumnConfig[]
  customRowActions?: RowAction[]
  emptyState?: EmptyStateConfig
}
```

### 3. Enhanced ScheduleSelector Component

```typescript
interface EnhancedScheduleSelectorProps {
  // Existing props
  availableSchedules: Schedule[]
  selectedScheduleIds: string[]
  onSelectionChange: (scheduleIds: string[]) => void
  
  // Enhanced search props
  searchable?: boolean
  searchConfig?: {
    placeholder: string
    debounceMs: number
    minChars: number
  }
  
  // Enhanced filtering props
  filterable?: boolean
  filterConfig?: {
    availableFilters: EnhancedFilter[]
    defaultFilters: FilterValue[]
  }
  
  // Enhanced display props
  displayMode?: 'dropdown' | 'modal' | 'inline'
  showPreview?: boolean
  showMetadata?: boolean
  
  // Enhanced selection props
  selectionMode?: 'single' | 'multiple' | 'replace'
  maxSelections?: number
  groupByCategory?: boolean
  
  // Enhanced validation props
  validation?: {
    required: boolean
    minSelections?: number
    maxSelections?: number
    customValidator?: (selections: string[]) => ValidationResult
  }
}
```

## Enhanced Redux Store Structure

```typescript
// Enhanced User Feature Store Slice
interface EnhancedUserFeatureState {
  // Existing state structure (preserved)
  users: User[]
  selectedUser: User | null
  loading: boolean
  error: string | null
  
  // Enhanced UI state
  ui: {
    assignmentDialog: {
      open: boolean
      userId: string | null
      loading: boolean
      error: string | null
    }
    bulkOperations: {
      mode: boolean
      selectedUsers: Set<string>
      operation: BulkOperation | null
      progress: BulkProgress | null
    }
    filters: EnhancedFilter[]
    search: EnhancedSearch
    view: {
      layout: 'list' | 'grid' | 'compact'
      sortBy: string
      sortDirection: 'asc' | 'desc'
      pageSize: number
      currentPage: number
    }
  }
  
  // Enhanced caching and performance
  cache: {
    userAssignments: Map<string, CachedAssignments>
    scheduleData: Map<string, CachedSchedule>
    lastFetch: number
    invalidationQueue: string[]
  }
  
  // Enhanced error handling
  errors: {
    network: NetworkError[]
    validation: ValidationError[]
    user: UserError[]
    retryableOperations: RetryableOperation[]
  }
}
```

## Validation Schemas (Zod)

```typescript
// Enhanced Assignment Validation Schema
const EnhancedUserScheduleAssignmentSchema = z.object({
  // Existing fields (preserved)
  userId: z.string().uuid(),
  scheduleIds: z.array(z.string().uuid()).min(1),
  isDefault: z.boolean().optional(),
  
  // Enhanced validation fields
  metadata: z.object({
    assignedBy: z.string().uuid(),
    assignedAt: z.date(),
    reason: z.string().optional(),
    priority: z.number().min(1).max(10).optional(),
    tags: z.array(z.string()).optional(),
    expiresAt: z.date().optional(),
  }).optional(),
  
  // Enhanced UI validation
  ui: z.object({
    validated: z.boolean(),
    warnings: z.array(z.string()),
    confirmationRequired: z.boolean(),
    estimatedImpact: z.object({
      affectedUsers: z.number(),
      affectedSchedules: z.number(),
      conflictCount: z.number(),
    }).optional(),
  }).optional(),
})

// Enhanced Bulk Operation Schema
const BulkOperationSchema = z.object({
  type: z.enum(['assign', 'remove', 'change-priority', 'toggle-default']),
  targetUserIds: z.array(z.string().uuid()).min(1),
  scheduleIds: z.array(z.string().uuid()).optional(),
  options: z.object({
    priority: z.number().min(1).max(10).optional(),
    defaultFlag: z.boolean().optional(),
    replaceExisting: z.boolean().default(false),
    skipConflicts: z.boolean().default(false),
  }).optional(),
  validation: z.object({
    requireConfirmation: z.boolean().default(true),
    maxAffectedItems: z.number().default(100),
    allowPartialSuccess: z.boolean().default(true),
  }).optional(),
})
```

## Integration with Existing Types

All enhanced types extend existing interfaces to maintain backward compatibility:

```typescript
// Existing types are preserved and extended
type UserScheduleAssignment = ExistingUserScheduleAssignment & {
  enhancedMetadata?: EnhancedAssignmentMetadata
}

type EnhancedUserScheduleAssignmentComponent = React.FC<
  UserScheduleAssignmentProps & EnhancedUserScheduleAssignmentProps
>
```

---

**Data Model Status**: ✅ Complete  
**Next Phase**: Contracts Generation  
**Integration Approach**: Extension of existing types with backward compatibility