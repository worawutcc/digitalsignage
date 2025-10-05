# Phase 1: Data Model for Missing API Endpoints & Services

## Key Entities

### Media
- id: Guid
- name: string
- fileName: string
- filePath: string
- mediaType: enum (Image, Video, Document)
- fileSize: int
- uploadedAt: DateTime (UTC)
- lastModified: DateTime (UTC)
- isActive: bool
- tags: string[]
- thumbnailUrl: string
- duration: int?

### Schedule
- id: Guid
- name: string
- description: string
- startTime: DateTime (UTC)
- endTime: DateTime (UTC)
- recurrence: RecurrenceConfig
- mediaItems: List<Guid>
- devices: List<Guid>
- status: enum (Active, Inactive, Error)
- createdAt: DateTime (UTC)
- updatedAt: DateTime (UTC)

### Device
- id: Guid
- name: string
- type: enum (AndroidTV, Tablet, Display, Kiosk)
- status: enum (Online, Offline, Maintenance, Error)
- location: string
- ipAddress: string
- macAddress: string
- lastSeen: DateTime (UTC)
- currentPlaylist: Guid?
- systemInfo: DeviceSystemInfo
- tags: string[]

### Playlist
- id: Guid
- name: string
- description: string
- mediaItems: List<Guid>
- duration: int
- isActive: bool
- createdAt: DateTime (UTC)
- updatedAt: DateTime (UTC)
- tags: string[]
- scheduleCount: int

### DashboardStats
- totalDevices: int
- onlineDevices: int
- totalPlaylists: int
- activePlaylists: int
- totalMediaFiles: int
- totalSchedules: int
- activeSchedules: int
- systemUptime: int

### User
- id: Guid
- username: string
- email: string
- role: enum (Admin, Manager, Viewer)
- status: enum (Active, Inactive, Suspended)
- createdAt: DateTime (UTC)
- updatedAt: DateTime (UTC)

## Validation Rules
- All required fields must be present and of correct type
- DateTime fields must be UTC and stored as `timestamp without time zone`
- Enums must match allowed values
- Arrays/lists must not contain nulls
- String fields must be non-empty unless explicitly optional
- Numeric fields must be >= 0
