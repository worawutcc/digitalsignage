# Data Model: Enhanced UI Playlist Management

**Date**: 2025-10-14  
**Feature**: Enhanced UI Playlist Management  
**Branch**: 036-enhance-ui-playlist

## Domain Entities

### 1. Playlist (Enhanced)
**Purpose**: Core playlist entity with enhanced UI-specific properties
**Location**: `DigitalSignage.Domain/Entities/Playlist.cs`

```csharp
// Enhanced properties for UI functionality
public class Playlist : BaseEntity
{
    // Existing core properties
    public string Name { get; set; }
    public string Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; }
    public string UpdatedBy { get; set; }
    
    // Enhanced properties for UI
    public int TotalDuration { get; set; } // Calculated field in seconds
    public string ThumbnailUrl { get; set; } // First media item thumbnail
    public PlaylistStatus Status { get; set; } // Draft, Active, Scheduled, Error
    public DateTime? LastPlayedAt { get; set; }
    public int PlayCount { get; set; }
    public bool IsTemplate { get; set; } // For playlist duplication
    
    // Navigation properties
    public ICollection<PlaylistMedia> MediaItems { get; set; }
    public ICollection<DevicePlaylist> DeviceAssignments { get; set; }
    public ICollection<PlaylistAnalytics> Analytics { get; set; }
}

public enum PlaylistStatus
{
    Draft = 0,
    Active = 1,
    Scheduled = 2,
    Error = 3,
    Archived = 4
}
```

### 2. PlaylistMedia (Enhanced)
**Purpose**: Junction entity for playlist-media relationships with ordering and timing
**Location**: `DigitalSignage.Domain/Entities/PlaylistMedia.cs`

```csharp
public class PlaylistMedia : BaseEntity
{
    public int PlaylistId { get; set; }
    public int MediaId { get; set; }
    public int Order { get; set; } // Display order in playlist
    public int DurationSeconds { get; set; } // Override default media duration
    public string TransitionEffect { get; set; } // Fade, Slide, None
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Navigation properties
    public Playlist Playlist { get; set; }
    public Media Media { get; set; }
}
```

### 3. DevicePlaylist (New)
**Purpose**: Device assignment tracking with scheduling
**Location**: `DigitalSignage.Domain/Entities/DevicePlaylist.cs`

```csharp
public class DevicePlaylist : BaseEntity
{
    public int DeviceId { get; set; }
    public int PlaylistId { get; set; }
    public int Priority { get; set; } // 1-10, higher = more priority
    public DateTime? ScheduledStart { get; set; }
    public DateTime? ScheduledEnd { get; set; }
    public bool IsActive { get; set; }
    public DateTime AssignedAt { get; set; }
    public string AssignedBy { get; set; }
    
    // Navigation properties
    public Device Device { get; set; }
    public Playlist Playlist { get; set; }
}
```

### 4. PlaylistAnalytics (New)
**Purpose**: Usage analytics for playlists
**Location**: `DigitalSignage.Domain/Entities/PlaylistAnalytics.cs`

```csharp
public class PlaylistAnalytics : BaseEntity
{
    public int PlaylistId { get; set; }
    public int DeviceId { get; set; }
    public DateTime PlayStartTime { get; set; }
    public DateTime? PlayEndTime { get; set; }
    public bool CompletedSuccessfully { get; set; }
    public string ErrorMessage { get; set; }
    public int MediaItemsPlayed { get; set; }
    
    // Navigation properties
    public Playlist Playlist { get; set; }
    public Device Device { get; set; }
}
```

## Data Transfer Objects (DTOs)

### 1. PlaylistDto (Enhanced)
**Purpose**: API data transfer with calculated fields
**Location**: `DigitalSignage.Application/DTOs/Playlist/PlaylistDto.cs`

```csharp
public class PlaylistDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public PlaylistStatus Status { get; set; }
    public int TotalDuration { get; set; }
    public string ThumbnailUrl { get; set; }
    public int MediaItemsCount { get; set; }
    public int DeviceAssignmentsCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; }
    public string UpdatedBy { get; set; }
    public DateTime? LastPlayedAt { get; set; }
    public int PlayCount { get; set; }
    public bool IsTemplate { get; set; }
    
    // Related data
    public List<PlaylistMediaDto> MediaItems { get; set; }
    public List<DeviceAssignmentDto> DeviceAssignments { get; set; }
}
```

### 2. PlaylistMediaDto (Enhanced)
**Purpose**: Media item within playlist with ordering
**Location**: `DigitalSignage.Application/DTOs/Playlist/PlaylistMediaDto.cs`

```csharp
public class PlaylistMediaDto
{
    public int Id { get; set; }
    public int PlaylistId { get; set; }
    public int MediaId { get; set; }
    public int Order { get; set; }
    public int DurationSeconds { get; set; }
    public string TransitionEffect { get; set; }
    
    // Media details
    public string MediaName { get; set; }
    public string MediaType { get; set; }
    public string ThumbnailUrl { get; set; }
    public string PreviewUrl { get; set; }
    public long FileSize { get; set; }
}
```

### 3. CreatePlaylistRequest
**Purpose**: Playlist creation with media items
**Location**: `DigitalSignage.Application/DTOs/Playlist/CreatePlaylistRequest.cs`

```csharp
public class CreatePlaylistRequest
{
    public string Name { get; set; }
    public string Description { get; set; }
    public bool IsTemplate { get; set; }
    public List<PlaylistMediaRequest> MediaItems { get; set; }
}

public class PlaylistMediaRequest
{
    public int MediaId { get; set; }
    public int Order { get; set; }
    public int? DurationSeconds { get; set; } // Optional override
    public string TransitionEffect { get; set; }
}
```

### 4. UpdatePlaylistOrderRequest
**Purpose**: Bulk reordering for drag-and-drop
**Location**: `DigitalSignage.Application/DTOs/Playlist/UpdatePlaylistOrderRequest.cs`

```csharp
public class UpdatePlaylistOrderRequest
{
    public List<MediaOrderItem> MediaItems { get; set; }
}

public class MediaOrderItem
{
    public int PlaylistMediaId { get; set; }
    public int NewOrder { get; set; }
}
```

### 5. BulkPlaylistActionRequest
**Purpose**: Bulk operations on multiple playlists
**Location**: `DigitalSignage.Application/DTOs/Playlist/BulkPlaylistActionRequest.cs`

```csharp
public class BulkPlaylistActionRequest
{
    public List<int> PlaylistIds { get; set; }
    public BulkAction Action { get; set; }
    public BulkActionParameters Parameters { get; set; }
}

public enum BulkAction
{
    Delete,
    Duplicate,
    AssignToDevices,
    ChangeStatus,
    Archive
}

public class BulkActionParameters
{
    public List<int> DeviceIds { get; set; } // For AssignToDevices
    public PlaylistStatus? NewStatus { get; set; } // For ChangeStatus
    public string NameSuffix { get; set; } // For Duplicate
}
```

## Frontend Data Models

### 1. PlaylistItem (TypeScript)
**Purpose**: Client-side playlist representation with UI state
**Location**: `digital-signage-web/src/types/playlist.ts`

```typescript
export interface PlaylistItem {
  id: number
  name: string
  description: string
  status: PlaylistStatus
  totalDuration: number
  thumbnailUrl?: string
  mediaItemsCount: number
  deviceAssignmentsCount: number
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  lastPlayedAt?: string
  playCount: number
  isTemplate: boolean
  
  // UI-specific properties
  isSelected?: boolean
  isDragging?: boolean
  isExpanded?: boolean
}

export enum PlaylistStatus {
  Draft = 'draft',
  Active = 'active',
  Scheduled = 'scheduled',
  Error = 'error',
  Archived = 'archived'
}
```

### 2. PlaylistMediaItem (TypeScript)
**Purpose**: Media item within playlist editor
**Location**: `digital-signage-web/src/types/playlist.ts`

```typescript
export interface PlaylistMediaItem {
  id: number
  playlistId: number
  mediaId: number
  order: number
  durationSeconds: number
  transitionEffect: string
  
  // Media details for UI
  mediaName: string
  mediaType: string
  thumbnailUrl?: string
  previewUrl?: string
  fileSize: number
  
  // UI state
  isSelected?: boolean
  isDragging?: boolean
}
```

### 3. PlaylistFormData (TypeScript)
**Purpose**: Form validation schema with Zod
**Location**: `digital-signage-web/src/features/playlists/schemas/playlist.schema.ts`

```typescript
import { z } from 'zod'

export const playlistFormSchema = z.object({
  name: z.string().min(1, 'Playlist name is required').max(100),
  description: z.string().max(500).optional(),
  isTemplate: z.boolean().default(false),
  mediaItems: z.array(z.object({
    mediaId: z.number(),
    order: z.number(),
    durationSeconds: z.number().positive().optional(),
    transitionEffect: z.string().optional()
  })).min(1, 'At least one media item is required')
})

export type PlaylistFormData = z.infer<typeof playlistFormSchema>
```

## Database Schema Changes

### 1. New Tables
- `DevicePlaylist` - Device assignment tracking
- `PlaylistAnalytics` - Usage analytics

### 2. Enhanced Tables
- `Playlist` - Add Status, ThumbnailUrl, LastPlayedAt, PlayCount, IsTemplate columns
- `PlaylistMedia` - Add TransitionEffect column

### 3. Indexes for Performance
```sql
-- Playlist queries
CREATE INDEX IX_Playlist_Status ON Playlist(Status)
CREATE INDEX IX_Playlist_CreatedBy ON Playlist(CreatedBy)
CREATE INDEX IX_Playlist_IsTemplate ON Playlist(IsTemplate)

-- PlaylistMedia ordering
CREATE INDEX IX_PlaylistMedia_PlaylistId_Order ON PlaylistMedia(PlaylistId, [Order])

-- Device assignments
CREATE INDEX IX_DevicePlaylist_DeviceId_IsActive ON DevicePlaylist(DeviceId, IsActive)
CREATE INDEX IX_DevicePlaylist_PlaylistId_Priority ON DevicePlaylist(PlaylistId, Priority)

-- Analytics queries
CREATE INDEX IX_PlaylistAnalytics_PlaylistId_PlayStartTime ON PlaylistAnalytics(PlaylistId, PlayStartTime)
CREATE INDEX IX_PlaylistAnalytics_DeviceId_PlayStartTime ON PlaylistAnalytics(DeviceId, PlayStartTime)
```

## Validation Rules

### Backend Validation
1. Playlist name must be unique per user/tenant
2. Media items must exist and be accessible
3. Order values must be sequential and unique within playlist
4. Duration overrides must be positive
5. Device assignments must reference valid devices
6. Bulk operations limited to 50 playlists per request

### Frontend Validation  
1. Real-time form validation with Zod schemas
2. Drag-and-drop validation for valid drop zones
3. Media file type validation before adding to playlist
4. Duplicate name detection with suggestions
5. Maximum playlist duration warnings (configurable)

## State Transitions

### Playlist Status Flow
```
Draft → Active (when published)
Draft → Archived (when cancelled)
Active → Scheduled (when scheduled for future)
Scheduled → Active (when schedule activates)
Active → Error (on playback failure)
Error → Active (when issues resolved)
Any → Archived (manual archiving)
```

## Integration Points

### 1. Media Service Integration
- Thumbnail generation for playlist previews
- Presigned URL generation for media previews
- File validation and metadata extraction

### 2. Device Service Integration  
- Device availability checking for assignments
- Real-time device status updates
- Playlist synchronization to devices

### 3. Analytics Service Integration
- Play event tracking
- Performance metrics calculation
- Usage reporting and insights

This data model provides the foundation for enhanced playlist management UI while maintaining compatibility with existing systems and following established architectural patterns.