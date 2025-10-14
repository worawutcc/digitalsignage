# API Contracts: Enhanced Playlist Management

**Date**: 2025-10-14  
**Feature**: Enhanced UI Playlist Management  
**Base URL**: `/api/playlist`

## Playlist Management Endpoints

### 1. Get All Playlists with Enhanced Data
```http
GET /api/playlist
```

**Query Parameters:**
- `page` (int, optional): Page number (default: 1)
- `pageSize` (int, optional): Items per page (default: 20, max: 100)
- `status` (string, optional): Filter by status (draft, active, scheduled, error, archived)
- `search` (string, optional): Search by name or description
- `createdBy` (string, optional): Filter by creator
- `isTemplate` (bool, optional): Filter templates vs regular playlists
- `sortBy` (string, optional): Sort field (name, createdAt, updatedAt, playCount)
- `sortOrder` (string, optional): Sort direction (asc, desc)

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Morning News Playlist",
      "description": "Daily morning content rotation",
      "status": "active",
      "totalDuration": 3600,
      "thumbnailUrl": "https://cdn.example.com/thumb/playlist1.jpg",
      "mediaItemsCount": 5,
      "deviceAssignmentsCount": 3,
      "createdAt": "2025-10-14T08:00:00Z",
      "updatedAt": "2025-10-14T10:30:00Z",
      "createdBy": "admin@company.com",
      "updatedBy": "admin@company.com",
      "lastPlayedAt": "2025-10-14T09:15:00Z",
      "playCount": 142,
      "isTemplate": false
    }
  ],
  "totalCount": 25,
  "currentPage": 1,
  "totalPages": 2,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

### 2. Get Playlist Details with Media Items
```http
GET /api/playlist/{id}
```

**Response 200:**
```json
{
  "id": 1,
  "name": "Morning News Playlist",
  "description": "Daily morning content rotation",
  "status": "active",
  "totalDuration": 3600,
  "thumbnailUrl": "https://cdn.example.com/thumb/playlist1.jpg",
  "mediaItemsCount": 5,
  "deviceAssignmentsCount": 3,
  "createdAt": "2025-10-14T08:00:00Z",
  "updatedAt": "2025-10-14T10:30:00Z",
  "createdBy": "admin@company.com",
  "updatedBy": "admin@company.com",
  "lastPlayedAt": "2025-10-14T09:15:00Z",
  "playCount": 142,
  "isTemplate": false,
  "mediaItems": [
    {
      "id": 1,
      "playlistId": 1,
      "mediaId": 101,
      "order": 1,
      "durationSeconds": 30,
      "transitionEffect": "fade",
      "mediaName": "Logo Animation.mp4",
      "mediaType": "video",
      "thumbnailUrl": "https://cdn.example.com/thumb/media101.jpg",
      "previewUrl": "https://cdn.example.com/preview/media101.mp4",
      "fileSize": 5242880
    }
  ],
  "deviceAssignments": [
    {
      "deviceId": 201,
      "deviceName": "Lobby Display",
      "priority": 1,
      "scheduledStart": null,
      "scheduledEnd": null,
      "isActive": true,
      "assignedAt": "2025-10-14T08:00:00Z"
    }
  ]
}
```

**Response 404:**
```json
{
  "error": "Playlist not found",
  "message": "No playlist found with ID: {id}"
}
```

### 3. Create New Playlist
```http
POST /api/playlist
```

**Request Body:**
```json
{
  "name": "New Playlist",
  "description": "Description of the new playlist",
  "isTemplate": false,
  "mediaItems": [
    {
      "mediaId": 101,
      "order": 1,
      "durationSeconds": 30,
      "transitionEffect": "fade"
    },
    {
      "mediaId": 102,
      "order": 2,
      "durationSeconds": 60,
      "transitionEffect": "slide"
    }
  ]
}
```

**Response 201:**
```json
{
  "id": 25,
  "name": "New Playlist",
  "description": "Description of the new playlist",
  "status": "draft",
  "totalDuration": 90,
  "thumbnailUrl": "https://cdn.example.com/thumb/media101.jpg",
  "mediaItemsCount": 2,
  "deviceAssignmentsCount": 0,
  "createdAt": "2025-10-14T12:00:00Z",
  "updatedAt": "2025-10-14T12:00:00Z",
  "createdBy": "admin@company.com",
  "updatedBy": "admin@company.com",
  "lastPlayedAt": null,
  "playCount": 0,
  "isTemplate": false
}
```

**Response 400:**
```json
{
  "error": "Validation failed",
  "message": "Invalid playlist data",
  "details": [
    {
      "field": "name",
      "message": "Playlist name is required"
    },
    {
      "field": "mediaItems",
      "message": "At least one media item is required"
    }
  ]
}
```

### 4. Update Playlist
```http
PUT /api/playlist/{id}
```

**Request Body:** Same as Create Playlist

**Response 200:** Updated playlist object (same format as Get Playlist Details)

**Response 404:** Playlist not found
**Response 400:** Validation failed

### 5. Update Media Item Order (Drag & Drop)
```http
PATCH /api/playlist/{id}/reorder
```

**Request Body:**
```json
{
  "mediaItems": [
    {
      "playlistMediaId": 1,
      "newOrder": 2
    },
    {
      "playlistMediaId": 2,
      "newOrder": 1
    }
  ]
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Playlist order updated successfully",
  "updatedItems": [
    {
      "id": 1,
      "order": 2
    },
    {
      "id": 2,
      "order": 1
    }
  ]
}
```

### 6. Duplicate Playlist
```http
POST /api/playlist/{id}/duplicate
```

**Request Body:**
```json
{
  "newName": "Copy of Original Playlist",
  "includeDeviceAssignments": false
}
```

**Response 201:** New playlist object (same format as Create Playlist response)

### 7. Bulk Playlist Operations
```http
POST /api/playlist/bulk-action
```

**Request Body:**
```json
{
  "playlistIds": [1, 2, 3, 4, 5],
  "action": "assignToDevices",
  "parameters": {
    "deviceIds": [201, 202, 203],
    "priority": 1
  }
}
```

**Actions:**
- `delete` - Delete selected playlists
- `duplicate` - Create copies with name suffix
- `assignToDevices` - Assign to specified devices
- `changeStatus` - Update playlist status
- `archive` - Archive playlists

**Response 200:**
```json
{
  "success": true,
  "message": "Bulk operation completed",
  "processedCount": 5,
  "failedCount": 0,
  "results": [
    {
      "playlistId": 1,
      "success": true,
      "message": "Assigned to 3 devices"
    }
  ]
}
```

## Device Assignment Endpoints

### 8. Get Available Devices for Assignment
```http
GET /api/playlist/{id}/available-devices
```

**Response 200:**
```json
{
  "devices": [
    {
      "id": 201,
      "name": "Lobby Display",
      "location": "Main Lobby",
      "status": "online",
      "isAssigned": false,
      "currentPlaylist": null
    },
    {
      "id": 202,
      "name": "Conference Room TV",
      "location": "Conference Room A",
      "status": "offline",
      "isAssigned": true,
      "currentPlaylist": "Meeting Room Content"
    }
  ]
}
```

### 9. Assign Playlist to Devices
```http
POST /api/playlist/{id}/assign-devices
```

**Request Body:**
```json
{
  "deviceIds": [201, 202, 203],
  "priority": 1,
  "scheduledStart": "2025-10-15T09:00:00Z",
  "scheduledEnd": "2025-10-15T17:00:00Z"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Playlist assigned to 3 devices",
  "assignments": [
    {
      "deviceId": 201,
      "deviceName": "Lobby Display",
      "success": true,
      "message": "Assignment successful"
    }
  ]
}
```

## Analytics Endpoints

### 10. Get Playlist Analytics
```http
GET /api/playlist/{id}/analytics
```

**Query Parameters:**
- `dateFrom` (string, optional): Start date (ISO 8601)
- `dateTo` (string, optional): End date (ISO 8601)
- `deviceId` (int, optional): Filter by device

**Response 200:**
```json
{
  "playlistId": 1,
  "totalPlays": 245,
  "totalDuration": 882000,
  "averageCompletionRate": 0.95,
  "deviceStats": [
    {
      "deviceId": 201,
      "deviceName": "Lobby Display",
      "plays": 120,
      "completionRate": 0.98,
      "lastPlayed": "2025-10-14T09:15:00Z"
    }
  ],
  "dailyStats": [
    {
      "date": "2025-10-14",
      "plays": 15,
      "completionRate": 0.96
    }
  ]
}
```

## Real-time Events (SignalR)

### WebSocket Events

**Connection Hub**: `/hubs/playlist`

**Events Sent to Clients:**
- `PlaylistCreated` - New playlist created
- `PlaylistUpdated` - Playlist modified
- `PlaylistDeleted` - Playlist deleted
- `PlaylistOrderChanged` - Media order updated
- `DeviceAssignmentChanged` - Device assignments modified
- `PlaylistStatusChanged` - Status updated

**Event Payload Example:**
```json
{
  "eventType": "PlaylistUpdated",
  "playlistId": 1,
  "timestamp": "2025-10-14T12:00:00Z",
  "userId": "admin@company.com",
  "data": {
    "changedFields": ["name", "description"],
    "previousValues": {
      "name": "Old Name"
    },
    "currentValues": {
      "name": "New Name"
    }
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "error": "error_code",
  "message": "Human readable error message",
  "timestamp": "2025-10-14T12:00:00Z",
  "path": "/api/playlist/123",
  "details": {}
}
```

### Common Error Codes
- `PLAYLIST_NOT_FOUND` (404)
- `INVALID_REQUEST_DATA` (400)
- `DUPLICATE_PLAYLIST_NAME` (409)
- `MEDIA_ITEM_NOT_FOUND` (400)
- `DEVICE_NOT_AVAILABLE` (400)
- `INSUFFICIENT_PERMISSIONS` (403)
- `BULK_OPERATION_FAILED` (400)

## Authentication & Authorization

All endpoints require JWT authentication with appropriate roles:
- `playlist:read` - View playlists
- `playlist:write` - Create/update playlists  
- `playlist:delete` - Delete playlists
- `playlist:assign` - Assign to devices
- `playlist:analytics` - View analytics

## Rate Limiting

- Standard endpoints: 100 requests per minute
- Bulk operations: 10 requests per minute
- Analytics endpoints: 30 requests per minute
- WebSocket connections: 5 per user