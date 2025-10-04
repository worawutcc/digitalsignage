# API Contracts: Media Library and Schedule Management UI

**Feature**: Media Library and Schedule Management UI  
**Date**: 4 October 2025  
**Context**: Enhancement contracts for existing functional pages

## Frontend Integration Contracts

### Media Library API Integration

#### GET /api/media - Enhanced Media List
```typescript
// Request
interface GetMediaRequest {
  folder?: string
  type?: 'image' | 'video' | 'document' | 'all'
  search?: string
  tags?: string[]
  page?: number
  pageSize?: number
  sortBy?: 'name' | 'uploadDate' | 'size' | 'usage'
  sortOrder?: 'asc' | 'desc'
}

// Response
interface GetMediaResponse {
  data: MediaFile[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
  aggregations: {
    totalSize: number
    typeBreakdown: Record<string, number>
    tagCloud: Array<{ tag: string; count: number }>
  }
}
```

#### POST /api/media/upload - Enhanced Upload
```typescript
// Request (FormData)
interface UploadMediaRequest {
  files: File[]
  folder?: string
  tags?: string[]
  description?: string
}

// Response
interface UploadMediaResponse {
  success: boolean
  uploadedFiles: Array<{
    id: string
    name: string
    status: 'success' | 'failed'
    error?: string
    url?: string
  }>
  errors?: string[]
}
```

#### GET /api/media/{id}/usage - Usage Information
```typescript
// Response
interface MediaUsageResponse {
  mediaId: string
  usageCount: number
  schedules: Array<{
    id: string
    name: string
    status: 'active' | 'inactive' | 'draft'
    deviceCount: number
    lastUsed: Date
  }>
  canDelete: boolean
  warnings: string[]
}
```

### Schedule Management API Integration

#### GET /api/schedules - Enhanced Schedule List
```typescript
// Request
interface GetSchedulesRequest {
  status?: ('draft' | 'active' | 'inactive' | 'expired')[]
  deviceId?: string
  deviceGroupId?: string
  dateRange?: {
    start: Date
    end: Date
  }
  hasConflicts?: boolean
  createdBy?: string
  page?: number
  pageSize?: number
}

// Response
interface GetSchedulesResponse {
  data: Schedule[]
  pagination: PaginationInfo
  statistics: {
    totalSchedules: number
    activeSchedules: number
    draftSchedules: number
    conflictCount: number
  }
}
```

#### POST /api/schedules/{id}/media - Add Media to Schedule
```typescript
// Request
interface AddMediaToScheduleRequest {
  mediaId: string
  order: number
  duration: number
  transition?: 'fade' | 'slide' | 'cut' | 'zoom'
  conditions?: {
    dayOfWeek?: number[]
    timeRange?: { start: string; end: string }
  }
}

// Response
interface AddMediaToScheduleResponse {
  success: boolean
  scheduleMediaItem: ScheduleMediaItem
  conflicts?: ScheduleConflict[]
  warnings?: string[]
}
```

#### GET /api/schedules/conflicts - Conflict Detection
```typescript
// Request
interface GetConflictsRequest {
  scheduleIds?: string[]
  deviceIds?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
}

// Response
interface GetConflictsResponse {
  conflicts: ScheduleConflict[]
  summary: {
    errorCount: number
    warningCount: number
    affectedDevices: number
    affectedSchedules: number
  }
  resolutionSuggestions: Array<{
    conflictId: string
    suggestion: string
    autoResolvable: boolean
  }>
}
```

## Component Integration Contracts

### MediaPicker Component Contract
```typescript
interface MediaPickerProps {
  // Selection behavior
  multiple?: boolean
  selectedMediaIds?: string[]
  onSelectionChange: (mediaIds: string[]) => void
  
  // Filtering
  allowedTypes?: ('image' | 'video' | 'document')[]
  folder?: string
  
  // UI customization
  viewMode?: 'grid' | 'list' | 'compact'
  showUpload?: boolean
  showPreview?: boolean
  
  // Integration
  onMediaUploaded?: (media: MediaFile) => void
  onClose?: () => void
}

interface MediaPickerRef {
  clearSelection: () => void
  selectAll: () => void
  refresh: () => void
}
```

### ScheduleBuilder Enhancement Contract
```typescript
interface EnhancedScheduleBuilderProps {
  // Enhanced media integration
  enableMediaPicker?: boolean
  mediaPickerConfig?: {
    allowedTypes?: string[]
    showUsageInfo?: boolean
    enablePreview?: boolean
  }
  
  // Conflict detection
  enableConflictDetection?: boolean
  onConflictDetected?: (conflicts: ScheduleConflict[]) => void
  
  // Auto-save
  enableAutoSave?: boolean
  autoSaveInterval?: number
  
  // Existing props
  initialData?: Partial<Schedule>
  onSave: (schedule: Schedule) => void
  onCancel: () => void
}
```

### MediaLibrary Enhancement Contract
```typescript
interface EnhancedMediaLibraryProps {
  // Usage integration
  showUsageInfo?: boolean
  onShowUsage?: (mediaId: string) => void
  
  // Schedule integration
  enableScheduleNavigation?: boolean
  onNavigateToSchedule?: (scheduleId: string) => void
  
  // Bulk operations
  enableBulkOperations?: boolean
  bulkOperations?: Array<{
    id: string
    label: string
    icon?: React.ComponentType
    handler: (mediaIds: string[]) => void
  }>
}
```

## Real-time Integration Contracts

### WebSocket Events
```typescript
// Media events
interface MediaUploadProgress {
  type: 'media:upload:progress'
  data: {
    uploadId: string
    fileName: string
    progress: number
    status: 'uploading' | 'processing' | 'complete' | 'error'
  }
}

interface MediaUsageUpdate {
  type: 'media:usage:updated'
  data: {
    mediaId: string
    usageCount: number
    newScheduleId?: string
    removedScheduleId?: string
  }
}

// Schedule events
interface ScheduleDeployed {
  type: 'schedule:deployed'
  data: {
    scheduleId: string
    deviceIds: string[]
    deployedAt: Date
    status: 'success' | 'partial' | 'failed'
  }
}

interface ScheduleConflictDetected {
  type: 'schedule:conflict:detected'
  data: {
    conflicts: ScheduleConflict[]
    affectedScheduleIds: string[]
  }
}
```

## Error Handling Contracts

### Standard Error Response
```typescript
interface APIError {
  error: {
    code: string
    message: string
    details?: Record<string, any>
    field?: string
    timestamp: Date
  }
  requestId: string
}

// Common error codes
const ERROR_CODES = {
  // Media errors
  MEDIA_FILE_TOO_LARGE: 'MEDIA_FILE_TOO_LARGE',
  MEDIA_TYPE_NOT_SUPPORTED: 'MEDIA_TYPE_NOT_SUPPORTED',
  MEDIA_IN_USE: 'MEDIA_IN_USE',
  MEDIA_UPLOAD_FAILED: 'MEDIA_UPLOAD_FAILED',
  
  // Schedule errors
  SCHEDULE_CONFLICT: 'SCHEDULE_CONFLICT',
  SCHEDULE_INVALID_DATE_RANGE: 'SCHEDULE_INVALID_DATE_RANGE',
  SCHEDULE_DEVICE_NOT_FOUND: 'SCHEDULE_DEVICE_NOT_FOUND',
  SCHEDULE_MEDIA_NOT_FOUND: 'SCHEDULE_MEDIA_NOT_FOUND',
  
  // General errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const
```

### Validation Error Details
```typescript
interface ValidationError extends APIError {
  error: {
    code: 'VALIDATION_ERROR'
    message: string
    details: {
      field: string
      value: any
      constraint: string
      message: string
    }[]
  }
}
```

## Performance Requirements

### Response Time SLAs
- Media list queries: < 300ms
- Media upload (per MB): < 2 seconds
- Schedule CRUD operations: < 200ms
- Conflict detection: < 500ms
- Usage queries: < 150ms

### Pagination Standards
- Default page size: 25 items
- Maximum page size: 100 items
- Cursor-based pagination for large datasets
- Include total count only when requested

### Caching Headers
```http
# Media files (immutable)
Cache-Control: public, max-age=31536000, immutable

# Media lists (frequently changing)
Cache-Control: public, max-age=300, stale-while-revalidate=60

# Schedule data (real-time critical)
Cache-Control: public, max-age=60, must-revalidate
```

## Integration Testing Contracts

### Media Upload Test Scenarios
```typescript
describe('Media Upload Integration', () => {
  it('should upload single image file successfully')
  it('should upload multiple files with progress tracking')
  it('should reject unsupported file types')
  it('should reject files exceeding size limit')
  it('should handle upload failures gracefully')
  it('should generate thumbnails for supported formats')
})
```

### Schedule Media Integration Test Scenarios
```typescript
describe('Schedule Media Integration', () => {
  it('should add media to schedule successfully')
  it('should detect conflicts when adding overlapping media')
  it('should prevent deletion of media used in active schedules')
  it('should update usage counters when media is added/removed')
  it('should validate media availability during schedule activation')
})
```

### Cross-Feature Navigation Test Scenarios
```typescript
describe('Cross-Feature Navigation', () => {
  it('should navigate from media usage to related schedule')
  it('should open media picker from schedule builder')
  it('should show media preview in schedule context')
  it('should maintain state during cross-navigation')
})
```

## Security Contracts

### Authentication Requirements
- All API endpoints require valid JWT token
- Token refresh handled automatically by client
- Session timeout: 8 hours

### Authorization Rules
```typescript
interface PermissionMatrix {
  media: {
    create: ['Admin', 'ContentManager']
    read: ['Admin', 'ContentManager', 'Viewer']
    update: ['Admin', 'ContentManager']
    delete: ['Admin']
  }
  schedules: {
    create: ['Admin', 'ContentManager']
    read: ['Admin', 'ContentManager', 'Viewer']
    update: ['Admin', 'ContentManager']
    delete: ['Admin']
    deploy: ['Admin']
  }
}
```

### Input Validation
- All file uploads scanned for malware
- File type validation by MIME type and extension
- Size limits enforced server-side
- SQL injection prevention through parameterized queries
- XSS protection through content sanitization