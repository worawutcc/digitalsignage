# Data Model: Complete Menu Actions API Integration Audit

**Feature**: 033-recheck-action-menu  
**Date**: 2025-10-09  
**Status**: Complete

## Overview

This document maps all entities involved in the 14 menu pages, their relationships, corresponding DTOs for API requests/responses, and TypeScript interfaces for frontend data binding.

---

## Entity Relationship Diagram

```
[User] --< UserDeviceAssociation >-- [Device]
  |                                     |
  |                                     |
  +-- [Role/Permission (RBAC)]          +-- [DeviceGroup]
                                        |
                                        +-- [DeviceHeart beat]
                                        |
                                        +-- [DeviceRegistrationRequest]
                                             |
                                             +-- [DeviceApproval]

[Media] --< MediaTag >-- [Tag]
  |
  |
  +-- [PlaylistItem] --< [Playlist]
  |
  +-- [ScheduleMedia] --< [Schedule]
  |
  +-- [Assignment] (polymorphic: targets Device/DeviceGroup, contains Media/Playlist/Schedule)

[QRCode]

[AnalyticsMetric] (aggregated data)

[Setting]

[AuditLog] (system-wide)
```

---

## Core Entities

### 1. User
**Domain Entity**: `DigitalSignage.Domain.Entities.User`

```csharp
public class User : BaseEntity
{
    public string Username { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public bool IsActive { get; set; }
    public DateTime LastLoginAt { get; set; }
    
    // Relationships
    public ICollection<UserRole> UserRoles { get; set; }
    public ICollection<UserDeviceAssociation> DeviceAssociations { get; set; }
}
```

**Application DTO**: `DigitalSignage.Application.DTOs.UserDto`

```csharp
public class UserDto
{
    public int Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public bool IsActive { get; set; }
    public DateTime LastLoginAt { get; set; }
    public List<string> Roles { get; set; } // Role names
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

**Frontend TypeScript Interface**: `src/types/User.ts`

```typescript
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  lastLoginAt: string; // ISO date string
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roleIds: number[];
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roleIds?: number[];
}
```

---

### 2. Device
**Domain Entity**: `DigitalSignage.Domain.Entities.Device`

```csharp
public class Device : BaseEntity
{
    public string DeviceName { get; set; }
    public string DeviceKey { get; set; } // Unique auth key
    public string? DeviceModel { get; set; }
    public string? SerialNumber { get; set; }
    public string? Resolution { get; set; }
    public string Status { get; set; } // Online, Offline, Error
    public DateTime? LastHeartbeatAt { get; set; }
    public string? Location { get; set; }
    public string? IpAddress { get; set; }
    
    // Relationships
    public ICollection<DeviceGroupMembership> GroupMemberships { get; set; }
    public ICollection<DeviceHeartbeat> Heartbeats { get; set; }
    public ICollection<Assignment> Assignments { get; set; }
}
```

**Application DTO**: `DigitalSignage.Application.DTOs.DeviceDto`

```csharp
public class DeviceDto
{
    public int Id { get; set; }
    public string DeviceName { get; set; }
    public string? DeviceModel { get; set; }
    public string? SerialNumber { get; set; }
    public string? Resolution { get; set; }
    public string Status { get; set; }
    public DateTime? LastHeartbeatAt { get; set; }
    public string? Location { get; set; }
    public string? IpAddress { get; set; }
    public List<DeviceGroupSummaryDto> Groups { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

**Frontend TypeScript Interface**: `src/types/Device.ts`

```typescript
export interface Device {
  id: number;
  deviceName: string;
  deviceModel: string | null;
  serialNumber: string | null;
  resolution: string | null;
  status: 'Online' | 'Offline' | 'Error';
  lastHeartbeatAt: string | null;
  location: string | null;
  ipAddress: string | null;
  groups: DeviceGroupSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeviceRequest {
  deviceName: string;
  deviceModel?: string;
  serialNumber?: string;
  resolution?: string;
  location?: string;
}

export interface UpdateDeviceRequest {
  deviceName?: string;
  deviceModel?: string;
  resolution?: string;
  location?: string;
  groupIds?: number[];
}
```

---

### 3. DeviceGroup
**Domain Entity**: `DigitalSignage.Domain.Entities.DeviceGroup`

```csharp
public class DeviceGroup : BaseEntity
{
    public string Name { get; set; }
    public string? Description { get; set; }
    public string? Location { get; set; }
    
    // Relationships
    public ICollection<DeviceGroupMembership> Memberships { get; set; }
    public ICollection<Assignment> Assignments { get; set; }
}
```

**Application DTO**: `DigitalSignage.Application.DTOs.DeviceGroupDto`

```csharp
public class DeviceGroupDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public string? Location { get; set; }
    public int DeviceCount { get; set; }
    public List<DeviceSummaryDto> Devices { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

**Frontend TypeScript Interface**: `src/types/DeviceGroup.ts`

```typescript
export interface DeviceGroup {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  deviceCount: number;
  devices: DeviceSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeviceGroupRequest {
  name: string;
  description?: string;
  location?: string;
  deviceIds?: number[];
}
```

---

### 4. Media
**Domain Entity**: `DigitalSignage.Domain.Entities.Media`

```csharp
public class Media : BaseEntity
{
    public string Name { get; set; }
    public string FileName { get; set; }
    public string FilePath { get; set; } // S3 key
    public string FileType { get; set; } // image, video, html
    public long FileSize { get; set; }
    public int? Duration { get; set; } // For videos in seconds
    public string? ThumbnailPath { get; set; }
    public string? Description { get; set; }
    
    // Relationships
    public ICollection<MediaTagRelation> TagRelations { get; set; }
    public ICollection<PlaylistItem> PlaylistItems { get; set; }
    public ICollection<ScheduleMedia> ScheduleMedia { get; set; }
}
```

**Application DTO**: `DigitalSignage.Application.DTOs.MediaDto`

```csharp
public class MediaDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string FileName { get; set; }
    public string FileType { get; set; }
    public long FileSize { get; set; }
    public int? Duration { get; set; }
    public string? ThumbnailUrl { get; set; } // Presigned URL
    public string? Description { get; set; }
    public List<string> Tags { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

**Frontend TypeScript Interface**: `src/types/Media.ts`

```typescript
export interface MediaItem {
  id: number;
  name: string;
  fileName: string;
  fileType: 'image' | 'video' | 'html';
  fileSize: number;
  duration: number | null;
  thumbnailUrl: string | null;
  description: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMediaRequest {
  name: string;
  file: File; // For upload
  description?: string;
  tagIds?: number[];
}

export interface UpdateMediaRequest {
  name?: string;
  description?: string;
  tagIds?: number[];
}
```

---

### 5. Playlist
**Domain Entity**: `DigitalSignage.Domain.Entities.Playlist`

```csharp
public class Playlist : BaseEntity
{
    public string Name { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public int TotalDuration { get; set; } // Calculated in seconds
    
    // Relationships
    public ICollection<PlaylistItem> Items { get; set; }
    public ICollection<ScheduleMedia> ScheduleMedia { get; set; }
}
```

**Application DTO**: `DigitalSignage.Application.DTOs.PlaylistDto`

```csharp
public class PlaylistDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public int TotalDuration { get; set; }
    public int ItemCount { get; set; }
    public List<PlaylistItemDto> Items { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

**Frontend TypeScript Interface**: `src/types/Playlist.ts`

```typescript
export interface Playlist {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  totalDuration: number;
  itemCount: number;
  items: PlaylistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistItem {
  id: number;
  mediaId: number;
  mediaName: string;
  mediaThumbnail: string | null;
  order: number;
  duration: number;
}

export interface CreatePlaylistRequest {
  name: string;
  description?: string;
  isActive?: boolean;
  mediaIds: number[]; // Will be converted to PlaylistItems
}
```

---

### 6. Schedule
**Domain Entity**: `DigitalSignage.Domain.Entities.Schedule`

```csharp
public class Schedule : BaseEntity
{
    public string Name { get; set; }
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string Recurrence { get; set; } // Daily, Weekly, Monthly
    public string? RecurrencePattern { get; set; } // JSON or comma-separated days
    public int Priority { get; set; }
    public bool IsActive { get; set; }
    
    // Relationships
    public ICollection<ScheduleMedia> ScheduleMedia { get; set; }
    public ICollection<Assignment> Assignments { get; set; }
}
```

**Application DTO**: `DigitalSignage.Application.DTOs.ScheduleDto`

```csharp
public class ScheduleDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string Recurrence { get; set; }
    public string? RecurrencePattern { get; set; }
    public int Priority { get; set; }
    public bool IsActive { get; set; }
    public List<ScheduleMediaDto> Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

**Frontend TypeScript Interface**: `src/types/Schedule.ts`

```typescript
export interface Schedule {
  id: number;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  startTime: string; // HH:mm:ss format
  endTime: string;
  recurrence: 'Daily' | 'Weekly' | 'Monthly' | 'Custom';
  recurrencePattern: string | null;
  priority: number;
  isActive: boolean;
  content: ScheduleContent[];
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleContent {
  mediaId?: number;
  playlistId?: number;
  name: string;
  type: 'media' | 'playlist';
}

export interface CreateScheduleRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  startTime: string;
  endTime: string;
  recurrence: string;
  recurrencePattern?: string;
  priority?: number;
  contentIds: number[];
}
```

---

### 7. Assignment
**Domain Entity**: `DigitalSignage.Domain.Entities.Assignment`

```csharp
public class Assignment : BaseEntity
{
    public string Name { get; set; }
    public string? Description { get; set; }
    
    // Polymorphic target: Device or DeviceGroup
    public int? DeviceId { get; set; }
    public Device? Device { get; set; }
    public int? DeviceGroupId { get; set; }
    public DeviceGroup? DeviceGroup { get; set; }
    
    // Polymorphic content: Media, Playlist, or Schedule
    public int? MediaId { get; set; }
    public Media? Media { get; set; }
    public int? PlaylistId { get; set; }
    public Playlist? Playlist { get; set; }
    public int? ScheduleId { get; set; }
    public Schedule? Schedule { get; set; }
    
    public int Priority { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; }
}
```

**Application DTO**: `DigitalSignage.Application.DTOs.AssignmentDto`

```csharp
public class AssignmentDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public string TargetType { get; set; } // Device, DeviceGroup
    public int TargetId { get; set; }
    public string TargetName { get; set; }
    public string ContentType { get; set; } // Media, Playlist, Schedule
    public int ContentId { get; set; }
    public string ContentName { get; set; }
    public int Priority { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

**Frontend TypeScript Interface**: `src/types/Assignment.ts`

```typescript
export interface Assignment {
  id: number;
  name: string;
  description: string | null;
  targetType: 'Device' | 'DeviceGroup';
  targetId: number;
  targetName: string;
  contentType: 'Media' | 'Playlist' | 'Schedule';
  contentId: number;
  contentName: string;
  priority: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentRequest {
  name: string;
  description?: string;
  targetType: 'Device' | 'DeviceGroup';
  targetId: number;
  contentType: 'Media' | 'Playlist' | 'Schedule';
  contentId: number;
  priority?: number;
  startDate?: string;
  endDate?: string;
}
```

---

### 8. DeviceRegistrationRequest
**Domain Entity**: `DigitalSignage.Domain.Entities.DeviceRegistrationRequest`

```csharp
public class DeviceRegistrationRequest : BaseEntity
{
    public string DeviceName { get; set; }
    public string? DeviceModel { get; set; }
    public string? SerialNumber { get; set; }
    public string Pin { get; set; } // 6-digit PIN
    public string Status { get; set; } // Pending, Approved, Rejected
    public DateTime? ApprovedAt { get; set; }
    public int? ApprovedByUserId { get; set; }
    public string? RejectionReason { get; set; }
    public int? CreatedDeviceId { get; set; } // After approval
    
    // Relationships
    public User? ApprovedByUser { get; set; }
    public Device? CreatedDevice { get; set; }
}
```

**Application DTO**: `DigitalSignage.Application.DTOs.DeviceRegistrationDto`

```csharp
public class DeviceRegistrationDto
{
    public int Id { get; set; }
    public string DeviceName { get; set; }
    public string? DeviceModel { get; set; }
    public string? SerialNumber { get; set; }
    public string Pin { get; set; }
    public string Status { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? ApprovedByUserName { get; set; }
    public string? RejectionReason { get; set; }
    public int? CreatedDeviceId { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

**Frontend TypeScript Interface**: `src/types/DeviceRegistration.ts`

```typescript
export interface DeviceRegistration {
  id: number;
  deviceName: string;
  deviceModel: string | null;
  serialNumber: string | null;
  pin: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedAt: string | null;
  approvedByUserName: string | null;
  rejectionReason: string | null;
  createdDeviceId: number | null;
  createdAt: string;
}

export interface ApproveRegistrationRequest {
  deviceGroupIds?: number[];
  location?: string;
}

export interface RejectRegistrationRequest {
  reason: string;
}
```

---

### 9. AnalyticsMetric (Aggregated)
**Application DTO Only** (No domain entity - aggregated from multiple sources)

```csharp
public class DashboardMetricsDto
{
    public int TotalDevices { get; set; }
    public int OnlineDevices { get; set; }
    public int OfflineDevices { get; set; }
    public int TotalMedia { get; set; }
    public int TotalPlaylists { get; set; }
    public int ActiveSchedules { get; set; }
    public int PendingRegistrations { get; set; }
    public List<DeviceStatusSummary> DeviceStatuses { get; set; }
    public List<MediaUsageSummary> TopMedia { get; set; }
}

public class AnalyticsOverviewDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalPlaybackHours { get; set; }
    public int UniqueMediaPlayed { get; set; }
    public List<DailyMetric> DailyMetrics { get; set; }
}
```

**Frontend TypeScript Interface**: `src/types/Analytics.ts`

```typescript
export interface DashboardMetrics {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  totalMedia: number;
  totalPlaylists: number;
  activeSchedules: number;
  pendingRegistrations: number;
  deviceStatuses: DeviceStatusSummary[];
  topMedia: MediaUsageSummary[];
}

export interface AnalyticsOverview {
  startDate: string;
  endDate: string;
  totalPlaybackHours: number;
  uniqueMediaPlayed: number;
  dailyMetrics: DailyMetric[];
}

export interface DeviceStatusSummary {
  deviceId: number;
  deviceName: string;
  status: string;
  lastHeartbeat: string;
}
```

---

### 10. QRCode
**Domain Entity**: `DigitalSignage.Domain.Entities.QRCode` (if exists)

```csharp
public class QRCode : BaseEntity
{
    public string Code { get; set; } // Unique code
    public string? DeviceId { get; set; } // Associated device (if any)
    public string QRImagePath { get; set; } // S3 path
    public DateTime? ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
}
```

**Application DTO**: `DigitalSignage.Application.DTOs.QRCodeDto`

```csharp
public class QRCodeDto
{
    public int Id { get; set; }
    public string Code { get; set; }
    public string? DeviceId { get; set; }
    public string QRImageUrl { get; set; } // Presigned URL
    public DateTime? ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

**Frontend TypeScript Interface**: `src/types/QRCode.ts`

```typescript
export interface QRCode {
  id: number;
  code: string;
  deviceId: string | null;
  qrImageUrl: string;
  expiresAt: string | null;
  isUsed: boolean;
  createdAt: string;
}

export interface GenerateQRCodeRequest {
  deviceName?: string;
  expiresInHours?: number;
}
```

---

### 11. Setting
**Domain Entity**: `DigitalSignage.Domain.Entities.Setting` (if exists)

```csharp
public class Setting : BaseEntity
{
    public string Category { get; set; } // General, Display, Notifications, etc.
    public string Key { get; set; }
    public string Value { get; set; }
    public string? Description { get; set; }
}
```

**Application DTO**: `DigitalSignage.Application.DTOs.SettingDto`

```csharp
public class SettingDto
{
    public int Id { get; set; }
    public string Category { get; set; }
    public string Key { get; set; }
    public string Value { get; set; }
    public string? Description { get; set; }
}
```

**Frontend TypeScript Interface**: `src/types/Setting.ts`

```typescript
export interface Setting {
  id: number;
  category: string;
  key: string;
  value: string;
  description: string | null;
}

export interface UpdateSettingsRequest {
  settings: Array<{
    key: string;
    value: string;
  }>;
}
```

---

### 12. Report (if exists)
**Application DTO**: `DigitalSignage.Application.DTOs.ReportDto`

```csharp
public class ReportDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Type { get; set; } // DeviceUsage, MediaPerformance, etc.
    public string? Description { get; set; }
    public DateTime? GeneratedAt { get; set; }
    public string? FilePath { get; set; }
}
```

**Frontend TypeScript Interface**: `src/types/Report.ts`

```typescript
export interface Report {
  id: number;
  name: string;
  type: string;
  description: string | null;
  generatedAt: string | null;
  downloadUrl: string | null;
}

export interface GenerateReportRequest {
  type: string;
  startDate: string;
  endDate: string;
  format: 'csv' | 'pdf' | 'xlsx';
  filters?: Record<string, any>;
}
```

---

## Entity Relationships Summary

### One-to-Many
- `User` → `DeviceRegistrationRequest` (approver)
- `DeviceGroup` → `Device` (through DeviceGroupMembership)
- `Playlist` → `PlaylistItem` → `Media`
- `Schedule` → `ScheduleMedia` → `Media/Playlist`

### Many-to-Many
- `Device` ↔ `DeviceGroup` (through DeviceGroupMembership)
- `User` ↔ `Device` (through UserDeviceAssociation)
- `Media` ↔ `Tag` (through MediaTagRelation)

### Polymorphic
- `Assignment` → targets (`Device` OR `DeviceGroup`)
- `Assignment` → content (`Media` OR `Playlist` OR `Schedule`)

---

## DTO Naming Conventions

### Backend (C#)
- **Entity DTO**: `EntityDto` (e.g., `UserDto`, `DeviceDto`)
- **Create Request**: `CreateEntityRequest` (e.g., `CreateUserRequest`)
- **Update Request**: `UpdateEntityRequest` (e.g., `UpdateUserRequest`)
- **Summary DTO**: `EntitySummaryDto` (for nested/referenced entities)

### Frontend (TypeScript)
- **Interface**: `Entity` (e.g., `User`, `Device`)
- **Create Request**: `CreateEntityRequest`
- **Update Request**: `UpdateEntityRequest`
- **Summary**: `EntitySummary`

---

## Field Mapping Notes

### DateTime Handling
- **Backend**: `DateTime` (stored as `timestamp without time zone` in PostgreSQL)
- **C# Pattern**: `DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)` before persisting
- **API Response**: Serialized to ISO 8601 string (e.g., `"2025-10-09T14:30:00"`)
- **Frontend**: Always `string` type (ISO format), convert to `Date` object only when needed for display

### Nullable Fields
- **Backend**: Use `?` for nullable reference types (e.g., `string? Description`)
- **Frontend**: Use `| null` for nullable fields (e.g., `description: string | null`)
- **API Mapping**: Always provide default values (e.g., `description: dto.description || null`)

### Enums
- **Backend**: Use string enums or constants (e.g., `Status: "Online" | "Offline" | "Error"`)
- **Frontend**: Use TypeScript union types or enums
- **Example**:
  ```csharp
  // Backend
  public string Status { get; set; } // "Online", "Offline", "Error"
  
  // Frontend
  status: 'Online' | 'Offline' | 'Error'
  ```

### Collections
- **Backend**: `ICollection<T>` or `List<T>`
- **Frontend**: `T[]` (array)
- **API Mapping**: Always use `Array.isArray()` guard before mapping

---

## Conclusion

This data model document provides:

1. ✅ **12 Core Entities** with domain, DTO, and TypeScript mappings
2. ✅ **Relationship Diagrams** showing entity connections
3. ✅ **Request/Response DTOs** for all CRUD operations
4. ✅ **Field Mapping Rules** for DateTime, nullability, enums, collections
5. ✅ **Naming Conventions** for backend and frontend consistency

**Ready for Phase 1 (continued)**: Contracts generation
