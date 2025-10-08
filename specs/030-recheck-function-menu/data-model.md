# Phase 1: Data Model - API Integration Entities

**Created**: 2025-01-07  
**Purpose**: Document all entities involved in the API integration audit across all menu areas

## Entity Overview

This feature involves auditing and fixing integrations for **15+ core entities** across 7 menu areas. All entities already exist in the backend domain layer and have corresponding TypeScript types in the frontend.

## Phase 1: Playlists Menu Entities

### Playlist
**Purpose**: Content playlist management

**Backend Entity** (`DigitalSignage.Domain/Entities/Playlist.cs`):
```csharp
public class Playlist : BaseEntity
{
    public string Name { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public bool IsTemplate { get; set; }
    public int? TemplateId { get; set; }
    
    // Relationships
    public ICollection<PlaylistItem> PlaylistItems { get; set; }
    public ICollection<PlaylistAssignment> PlaylistAssignments { get; set; }
}
```

**Frontend Type** (`types/playlist.ts`):
```typescript
export interface Playlist {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  isTemplate: boolean;
  templateId?: number;
  createdAt: string;
  updatedAt: string;
  
  // Loaded relationships
  playlistItems?: PlaylistItem[];
  playlistAssignments?: PlaylistAssignment[];
}
```

**Validation Rules**:
- Name: Required, max 200 characters
- Description: Optional, max 1000 characters
- IsActive: Boolean, defaults to true
- IsTemplate: Boolean, defaults to false

**State Transitions**:
- Active ↔ Inactive (toggle)
- Regular → Template (convert)
- Template → Duplicate as regular (create from template)

### PlaylistItem
**Purpose**: Media items within a playlist

**Backend Entity**:
```csharp
public class PlaylistItem : BaseEntity
{
    public int PlaylistId { get; set; }
    public int MediaId { get; set; }
    public int Order { get; set; }
    public int Duration { get; set; } // seconds
    
    public Playlist Playlist { get; set; }
    public Media Media { get; set; }
}
```

**Frontend Type**:
```typescript
export interface PlaylistItem {
  id: number;
  playlistId: number;
  mediaId: number;
  order: number;
  duration: number; // seconds
  
  media?: Media;
}
```

**Validation Rules**:
- Order: Positive integer, unique within playlist
- Duration: Positive integer, min 1 second

### PlaylistAssignment
**Purpose**: Assignment of playlists to devices/groups

**Backend Entity**:
```csharp
public class PlaylistAssignment : BaseEntity
{
    public int PlaylistId { get; set; }
    public int? DeviceId { get; set; }
    public int? DeviceGroupId { get; set; }
    public bool IsActive { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    
    public Playlist Playlist { get; set; }
    public Device? Device { get; set; }
    public DeviceGroup? DeviceGroup { get; set; }
}
```

**Frontend Type**:
```typescript
export interface PlaylistAssignment {
  id: number;
  playlistId: number;
  deviceId?: number;
  deviceGroupId?: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  
  device?: Device;
  deviceGroup?: DeviceGroup;
}
```

**Validation Rules**:
- Must have either DeviceId OR DeviceGroupId (not both, not neither)
- StartDate < EndDate (if both provided)
- IsActive: Boolean, defaults to true

## Phase 2: Schedules Menu Entities

### Schedule
**Purpose**: Time-based content scheduling

**Backend Entity**:
```csharp
public class Schedule : BaseEntity
{
    public string Name { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public int Priority { get; set; } // 1-10
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; } // JSON
    
    public ICollection<TimeSlot> TimeSlots { get; set; }
    public ICollection<ScheduleMedia> ScheduleMedias { get; set; }
    public ICollection<UserSchedule> UserSchedules { get; set; }
}
```

**Frontend Type**:
```typescript
export interface Schedule {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  priority: number; // 1-10
  startDate: string;
  endDate?: string;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  createdAt: string;
  updatedAt: string;
  
  timeSlots?: TimeSlot[];
  scheduleMedias?: ScheduleMedia[];
  userSchedules?: UserSchedule[];
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[]; // 0-6 (Sun-Sat)
  dayOfMonth?: number;
  endAfter?: number; // occurrences
}
```

**Validation Rules**:
- Name: Required, max 200 characters
- Priority: Integer 1-10
- StartDate: Required, must be valid datetime
- EndDate: Optional, must be > StartDate if provided
- RecurrencePattern: Valid JSON matching RecurrencePattern type

### TimeSlot
**Purpose**: Time windows for schedule execution

**Backend Entity**:
```csharp
public class TimeSlot : BaseEntity
{
    public int ScheduleId { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public string DaysOfWeek { get; set; } // "0,1,2,3,4,5,6"
    
    public Schedule Schedule { get; set; }
}
```

**Frontend Type**:
```typescript
export interface TimeSlot {
  id: number;
  scheduleId: number;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  daysOfWeek: number[]; // 0-6
}
```

**Validation Rules**:
- StartTime: Valid time format (HH:mm)
- EndTime: Valid time format, must be > StartTime
- DaysOfWeek: Array of integers 0-6

### ScheduleMedia
**Purpose**: Media content assigned to schedules

**Backend Entity**:
```csharp
public class ScheduleMedia : BaseEntity
{
    public int ScheduleId { get; set; }
    public int MediaId { get; set; }
    public int Order { get; set; }
    public int Duration { get; set; }
    
    public Schedule Schedule { get; set; }
    public Media Media { get; set; }
}
```

**Frontend Type**:
```typescript
export interface ScheduleMedia {
  id: number;
  scheduleId: number;
  mediaId: number;
  order: number;
  duration: number;
  
  media?: Media;
}
```

## Phase 3: Devices Menu Entities

### Device
**Purpose**: Digital signage display hardware

**Backend Entity**:
```csharp
public class Device : BaseEntity
{
    public string Name { get; set; }
    public string? Location { get; set; }
    public string DeviceKey { get; set; }
    public string? Resolution { get; set; }
    public string Status { get; set; } // Online, Offline, Error
    public DateTime? LastHeartbeat { get; set; }
    public int? DeviceGroupId { get; set; }
    public string? HardwareProfile { get; set; } // JSON
    
    public DeviceGroup? DeviceGroup { get; set; }
    public ICollection<DeviceHeartbeat> DeviceHeartbeats { get; set; }
    public ICollection<PlaylistAssignment> PlaylistAssignments { get; set; }
    public ICollection<UserDeviceAssociation> UserDeviceAssociations { get; set; }
}
```

**Frontend Type**:
```typescript
export interface Device {
  id: number;
  name: string;
  location?: string;
  deviceKey: string;
  resolution?: string;
  status: 'Online' | 'Offline' | 'Error';
  lastHeartbeat?: string;
  deviceGroupId?: number;
  hardwareProfile?: HardwareProfile;
  createdAt: string;
  updatedAt: string;
  
  deviceGroup?: DeviceGroup;
}

export interface HardwareProfile {
  os: string;
  osVersion: string;
  model: string;
  screenSize: string;
  cpuInfo: string;
  memoryGB: number;
}
```

**Validation Rules**:
- Name: Required, max 200 characters
- DeviceKey: Required, unique, auto-generated
- Status: Enum ['Online', 'Offline', 'Error']
- Resolution: Optional, format "WIDTHxHEIGHT" (e.g., "1920x1080")

### DeviceGroup
**Purpose**: Logical grouping of devices

**Backend Entity**:
```csharp
public class DeviceGroup : BaseEntity
{
    public string Name { get; set; }
    public string? Description { get; set; }
    
    public ICollection<Device> Devices { get; set; }
    public ICollection<PlaylistAssignment> PlaylistAssignments { get; set; }
}
```

**Frontend Type**:
```typescript
export interface DeviceGroup {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  
  devices?: Device[];
  deviceCount?: number; // Computed
}
```

### DeviceRegistrationRequest
**Purpose**: Pending device registration approvals

**Backend Entity**:
```csharp
public class DeviceRegistrationRequest : BaseEntity
{
    public string PIN { get; set; }
    public string? DeviceName { get; set; }
    public string? Location { get; set; }
    public string Status { get; set; } // Pending, Approved, Rejected
    public DateTime ExpiresAt { get; set; }
    public int? ApprovedByUserId { get; set; }
    public int? DeviceId { get; set; }
    
    public User? ApprovedByUser { get; set; }
    public Device? Device { get; set; }
}
```

**Frontend Type**:
```typescript
export interface DeviceRegistrationRequest {
  id: number;
  pin: string;
  deviceName?: string;
  location?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  expiresAt: string;
  approvedByUserId?: number;
  deviceId?: number;
  createdAt: string;
  
  device?: Device;
}
```

## Phase 4: Media Menu Entities

### Media
**Purpose**: Content files (images, videos, HTML)

**Backend Entity**:
```csharp
public class Media : BaseEntity
{
    public string FileName { get; set; }
    public string FileType { get; set; } // Image, Video, HTML
    public string S3Key { get; set; }
    public long FileSize { get; set; } // bytes
    public int? Width { get; set; }
    public int? Height { get; set; }
    public int? Duration { get; set; } // seconds for video
    public string? ThumbnailS3Key { get; set; }
    public string? Tags { get; set; } // JSON array
    
    public ICollection<PlaylistItem> PlaylistItems { get; set; }
    public ICollection<ScheduleMedia> ScheduleMedias { get; set; }
}
```

**Frontend Type**:
```typescript
export interface Media {
  id: number;
  fileName: string;
  fileType: 'Image' | 'Video' | 'HTML';
  s3Key: string;
  fileSize: number; // bytes
  width?: number;
  height?: number;
  duration?: number; // seconds
  thumbnailS3Key?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  
  // Computed/runtime
  presignedUrl?: string;
  thumbnailUrl?: string;
}
```

**Validation Rules**:
- FileName: Required, max 500 characters
- FileType: Enum ['Image', 'Video', 'HTML']
- S3Key: Required, unique
- FileSize: Positive integer
- Width/Height: Positive integers if provided

## Phase 5: Users Menu Entities

### User
**Purpose**: Admin and user accounts

**Backend Entity**:
```csharp
public class User : BaseEntity
{
    public string Username { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public string Role { get; set; } // Admin, User
    public bool IsActive { get; set; }
    public DateTime? LastLoginAt { get; set; }
    
    public ICollection<UserDeviceAssociation> UserDeviceAssociations { get; set; }
    public ICollection<UserSchedule> UserSchedules { get; set; }
}
```

**Frontend Type**:
```typescript
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'Admin' | 'User';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Excluded from API responses
  // passwordHash never sent to frontend
}
```

**Validation Rules**:
- Username: Required, unique, 3-50 characters
- Email: Required, unique, valid email format
- Role: Enum ['Admin', 'User']
- PasswordHash: Required (never sent to frontend)

### UserDeviceAssociation
**Purpose**: User-to-device access mappings

**Backend Entity**:
```csharp
public class UserDeviceAssociation : BaseEntity
{
    public int UserId { get; set; }
    public int DeviceId { get; set; }
    
    public User User { get; set; }
    public Device Device { get; set; }
}
```

**Frontend Type**:
```typescript
export interface UserDeviceAssociation {
  id: number;
  userId: number;
  deviceId: number;
  
  user?: User;
  device?: Device;
}
```

### UserSchedule
**Purpose**: User-specific schedule assignments

**Backend Entity**:
```csharp
public class UserSchedule : BaseEntity
{
    public int UserId { get; set; }
    public int ScheduleId { get; set; }
    public bool IsDefault { get; set; }
    
    public User User { get; set; }
    public Schedule Schedule { get; set; }
}
```

**Frontend Type**:
```typescript
export interface UserSchedule {
  id: number;
  userId: number;
  scheduleId: number;
  isDefault: boolean;
  
  user?: User;
  schedule?: Schedule;
}
```

## Phase 6: QR Codes Menu Entities

### QRCode
**Purpose**: QR codes for device provisioning

**Backend Entity**:
```csharp
public class QRCode : BaseEntity
{
    public string Code { get; set; }
    public string Type { get; set; } // Registration, Information
    public int? DeviceId { get; set; }
    public string? Metadata { get; set; } // JSON
    public bool IsActive { get; set; }
    public int ScanCount { get; set; }
    
    public Device? Device { get; set; }
}
```

**Frontend Type**:
```typescript
export interface QRCode {
  id: number;
  code: string;
  type: 'Registration' | 'Information';
  deviceId?: number;
  metadata?: Record<string, any>;
  isActive: boolean;
  scanCount: number;
  createdAt: string;
  updatedAt: string;
  
  device?: Device;
  qrCodeImageUrl?: string; // Generated on demand
}
```

**Validation Rules**:
- Code: Required, unique, auto-generated
- Type: Enum ['Registration', 'Information']
- IsActive: Boolean, defaults to true
- ScanCount: Non-negative integer

## Phase 7: Dashboard Entities

### AuditLog
**Purpose**: System activity tracking

**Backend Entity**:
```csharp
public class AuditLog : BaseEntity
{
    public string Action { get; set; }
    public string EntityType { get; set; }
    public int? EntityId { get; set; }
    public int? UserId { get; set; }
    public string? Details { get; set; } // JSON
    
    public User? User { get; set; }
}
```

**Frontend Type**:
```typescript
export interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId?: number;
  userId?: number;
  details?: Record<string, any>;
  createdAt: string;
  
  user?: User;
}
```

### DeviceHeartbeat
**Purpose**: Device health monitoring

**Backend Entity**:
```csharp
public class DeviceHeartbeat : BaseEntity
{
    public int DeviceId { get; set; }
    public string Status { get; set; }
    public string? ErrorMessage { get; set; }
    public int? CpuUsage { get; set; }
    public int? MemoryUsage { get; set; }
    
    public Device Device { get; set; }
}
```

**Frontend Type**:
```typescript
export interface DeviceHeartbeat {
  id: number;
  deviceId: number;
  status: string;
  errorMessage?: string;
  cpuUsage?: number;
  memoryUsage?: number;
  createdAt: string;
}
```

## Common Patterns

### BaseEntity
All entities inherit from BaseEntity:

```csharp
public abstract class BaseEntity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

Frontend equivalent:
```typescript
export interface BaseEntity {
  id: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### Relationship Loading
- Backend: Use EF Core `.Include()` for eager loading
- Frontend: Optional properties (e.g., `device?: Device`)
- API: Separate endpoints for relationships (e.g., `/api/playlist/{id}/items`)

### Validation Strategy
- Backend: FluentValidation or Data Annotations
- Frontend: Zod schemas matching backend rules
- API: Return 400 Bad Request with validation errors

## Data Flow Patterns

### CRUD Operations
```
Frontend Component
  ↓ user action
React Hook (useQuery/useMutation)
  ↓ call
Service Layer (playlistService.ts)
  ↓ HTTP via apiClient
API Controller (PlaylistController.cs)
  ↓ delegate
Application Service (PlaylistService.cs)
  ↓ query/command
Repository/DbContext
  ↓ EF Core
PostgreSQL Database
```

### Type Flow
```
PostgreSQL Schema
  ↓ EF Core mapping
Domain Entity (Playlist.cs)
  ↓ mapping/AutoMapper
DTO (PlaylistDto.cs)
  ↓ JSON serialization
HTTP Response
  ↓ apiClient deserialization
Frontend Type (Playlist interface)
  ↓ React Query cache
UI Component
```

## Next Steps → Contracts Generation
Generate OpenAPI contracts for each entity's CRUD operations and specialized endpoints.
