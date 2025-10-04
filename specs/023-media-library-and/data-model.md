# Data Model: Media Library and Schedule Management UI

**Feature**: Media Library and Schedule Management UI  
**Date**: 4 October 2025  
**Context**: Enhancement of existing functional pages with improved integration

## Entity Definitions

### 1. MediaFile (Frontend Interface)

**Purpose**: Represents media content files in the digital signage system

**Complete Schema**:
```typescript
interface MediaFile {
  id: string
  name: string
  fileName: string
  type: 'image' | 'video' | 'document'
  mimeType: string
  size: number
  uploadDate: Date
  lastModified: Date
  thumbnail?: string
  url?: string
  s3Key: string
  folder?: string
  tags: string[]
  usageCount: number
  lastUsed?: Date
  createdBy: string
  metadata?: {
    width?: number
    height?: number
    duration?: number
    resolution?: string
  }
  status: 'uploading' | 'processing' | 'active' | 'failed'
}
```

**Validation Rules**:
- `name`: Required, 1-255 characters
- `type`: Must be one of supported types
- `size`: Must not exceed configured limits
- `mimeType`: Must match allowed MIME types
- `tags`: Each tag 1-50 characters, max 10 tags

**State Transitions**:
- `uploading` → `processing` → `active`
- `uploading` → `failed`
- `processing` → `failed`

### 2. MediaFolder (Frontend Interface)

**Purpose**: Organization structure for grouping media files

**Complete Schema**:
```typescript
interface MediaFolder {
  id: string
  name: string
  description?: string
  parentId?: string
  path: string
  level: number
  createdAt: Date
  updatedAt: Date
  fileCount: number
  totalSize: number
  isSystem: boolean
  permissions: {
    canEdit: boolean
    canDelete: boolean
    canAddFiles: boolean
  }
}
```

**Validation Rules**:
- `name`: Required, 1-100 characters, unique within parent
- `level`: Maximum depth of 5 levels
- `path`: Auto-generated hierarchical path

### 3. Schedule (Enhanced Frontend Interface)

**Purpose**: Content display timeline with media assignments

**Complete Schema**:
```typescript
interface Schedule {
  id: string
  name: string
  description?: string
  startDate: Date
  endDate: Date
  startTime?: string // HH:mm format
  endTime?: string   // HH:mm format
  isActive: boolean
  isDefault: boolean
  priority: number
  status: 'draft' | 'active' | 'inactive' | 'expired'
  
  // Content assignment
  mediaItems: ScheduleMediaItem[]
  
  // Device targeting
  deviceIds: string[]
  deviceGroupIds: string[]
  
  // Scheduling rules
  dayOfWeek?: number[] // 0-6, Sunday = 0
  recurrenceRule?: string
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastModifiedBy: string
  
  // Conflict detection
  conflicts?: ScheduleConflict[]
  
  // Usage tracking
  deploymentStatus: 'pending' | 'deployed' | 'failed'
  lastDeployed?: Date
  activeDeviceCount: number
}
```

### 4. ScheduleMediaItem (Frontend Interface)

**Purpose**: Media content within a schedule with playback settings

**Complete Schema**:
```typescript
interface ScheduleMediaItem {
  id: string
  scheduleId: string
  mediaId: string
  mediaFile: MediaFile // Populated from media library
  order: number
  duration: number // seconds
  transition: 'fade' | 'slide' | 'cut' | 'zoom'
  
  // Playback settings
  startTime?: number // offset within schedule
  volume?: number    // 0-100 for video/audio
  loop?: boolean
  
  // Conditional display
  conditions?: {
    dayOfWeek?: number[]
    timeRange?: { start: string; end: string }
  }
}
```

### 5. MediaUsage (Derived Interface)

**Purpose**: Tracks media file usage across schedules

**Complete Schema**:
```typescript
interface MediaUsage {
  mediaId: string
  scheduleId: string
  scheduleName: string
  usageType: 'active' | 'scheduled' | 'expired'
  addedDate: Date
  lastDisplayed?: Date
  displayCount: number
  deviceCount: number
}
```

### 6. ScheduleConflict (Frontend Interface)

**Purpose**: Represents schedule conflicts for resolution

**Complete Schema**:
```typescript
interface ScheduleConflict {
  id: string
  type: 'device_overlap' | 'time_overlap' | 'resource_conflict'
  severity: 'error' | 'warning' | 'info'
  message: string
  conflictingScheduleIds: string[]
  affectedDeviceIds: string[]
  suggestedResolution?: string
  canAutoResolve: boolean
}
```

## Entity Relationships

### Media Library Relationships
```
MediaFile (1) ←→ (N) ScheduleMediaItem
MediaFile (N) ←→ (1) MediaFolder  
MediaFile (1) ←→ (N) MediaUsage
```

### Schedule Management Relationships
```
Schedule (1) ←→ (N) ScheduleMediaItem
Schedule (1) ←→ (N) ScheduleConflict
Schedule (N) ←→ (N) Device (via deviceIds)
Schedule (N) ←→ (N) DeviceGroup (via deviceGroupIds)
```

### Cross-Domain Relationships
```
MediaFile (1) ←→ (N) ScheduleMediaItem (integration point)
MediaFile (1) ←→ (N) MediaUsage (usage tracking)
```

## Data Flow Patterns

### Media Upload Flow
1. User selects files → `MediaFile` (status: 'uploading')
2. Files uploaded to S3 → Update S3Key, generate thumbnail
3. Processing complete → Status: 'active', available for schedules
4. Error handling → Status: 'failed', retry options

### Schedule Creation Flow
1. Create `Schedule` → Status: 'draft'
2. Add `ScheduleMediaItem` → Link to `MediaFile`
3. Assign devices → Populate deviceIds/deviceGroupIds
4. Conflict detection → Generate `ScheduleConflict` if needed
5. Activate → Status: 'active', trigger deployment

### Usage Tracking Flow
1. Media added to schedule → Create `MediaUsage` record
2. Schedule deployed → Update display metrics
3. Media removed → Update or remove usage record
4. Regular sync → Update display counts and last displayed

## State Management Integration

### Redux Store Structure
```typescript
interface MediaLibraryState {
  files: MediaFile[]
  folders: MediaFolder[]
  selectedFolder: string | null
  uploadProgress: Record<string, number>
  searchFilters: MediaSearchFilters
  viewMode: 'grid' | 'list'
}

interface ScheduleManagementState {
  schedules: Schedule[]
  selectedSchedule: Schedule | null
  calendarView: 'month' | 'week' | 'day'
  conflicts: ScheduleConflict[]
  creationMode: boolean
}
```

### API Integration Points
```typescript
// Media API endpoints
GET /api/media - List media files
POST /api/media/upload - Upload new media
DELETE /api/media/{id} - Delete media file
GET /api/media/{id}/usage - Get usage information

// Schedule API endpoints  
GET /api/schedules - List schedules
POST /api/schedules - Create schedule
PUT /api/schedules/{id} - Update schedule
GET /api/schedules/conflicts - Get conflicts

// Cross-domain endpoints
GET /api/media/{id}/schedules - Get schedules using media
POST /api/schedules/{id}/media - Add media to schedule
```

## Validation & Business Rules

### Media File Rules
- Maximum file size: 100MB per file
- Supported formats: JPG, PNG, MP4, PDF
- Filename uniqueness within folder
- Automatic thumbnail generation for images/videos
- Virus scanning before activation

### Schedule Rules
- End date must be after start date
- Priority range: 1-10 (10 = highest)
- Maximum 50 media items per schedule
- Device assignment required for activation
- Conflict resolution required before deployment

### Cross-Domain Rules
- Media files cannot be deleted if used in active schedules
- Schedule media items must reference existing, active media files
- Usage counters updated in real-time
- Orphaned usage records cleaned up daily

## Performance Considerations

### Indexing Strategy
- Media files: Index by folder, type, upload date
- Schedules: Index by status, date range, device assignments
- Usage tracking: Index by media ID and schedule ID

### Caching Strategy
- Media thumbnails: CDN caching with 30-day TTL
- Schedule data: Redis cache with 5-minute TTL
- Usage statistics: Hourly aggregation cache

### Data Pagination
- Media files: 50 items per page (grid), 25 items per page (list)
- Schedules: 20 items per page
- Usage records: 100 items per page

## Security & Access Control

### Data Access Rules
- Admin: Full access to all media and schedules
- Content Manager: Full access to media, read-only schedules
- Viewer: Read-only access to assigned content

### Data Protection
- Media files: S3 bucket encryption at rest
- API communication: HTTPS only
- File upload: Server-side validation and scanning
- Audit logging: All CRUD operations logged