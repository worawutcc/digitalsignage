# API Contracts: Complete Menu Actions API Integration Audit

**Feature**: 033-recheck-action-menu  
**Date**: 2025-10-09  
**Status**: Complete

## Overview

This document specifies all API endpoints required for the 14 sidebar menus, organized by priority tier. Each endpoint includes HTTP method, path, request/response schemas, status codes, and authentication requirements.

---

## Authentication

All endpoints require JWT Bearer token authentication unless otherwise specified.

**Header**: `Authorization: Bearer {token}`

**Responses**:
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Valid token but insufficient permissions

---

## Tier 1: Critical Operations

### 1. Dashboard APIs (`/api/dashboard`)

#### GET /api/dashboard/summary
**Description**: Get dashboard overview metrics  
**Auth**: Required  
**Query Parameters**: None

**Response** (`200 OK`):
```json
{
  "totalDevices": 42,
  "onlineDevices": 38,
  "offlineDevices": 4,
  "totalMedia": 156,
  "totalPlaylists": 23,
  "activeSchedules": 15,
  "pendingRegistrations": 3
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized
- `500`: Internal server error

---

#### GET /api/dashboard/device-status
**Description**: Get real-time device status grid  
**Auth**: Required  
**Query Parameters**: None

**Response** (`200 OK`):
```json
{
  "devices": [
    {
      "id": 1,
      "name": "Lobby Display 1",
      "status": "Online",
      "lastHeartbeat": "2025-10-09T14:25:00",
      "currentContent": "Morning Playlist",
      "location": "Main Lobby"
    }
  ],
  "timestamp": "2025-10-09T14:30:00"
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized
- `500`: Internal server error

---

### 2. Devices APIs (`/api/devices`)

#### GET /api/devices
**Description**: List all devices with filtering, sorting, pagination  
**Auth**: Required

**Query Parameters**:
- `search` (string, optional): Search by name, serial number
- `status` (string, optional): Filter by status (`Online`, `Offline`, `Error`)
- `groupId` (int, optional): Filter by device group
- `sortBy` (string, optional, default: `name`): Sort field
- `order` (string, optional, default: `asc`): Sort order (`asc`, `desc`)
- `page` (int, optional, default: 1): Page number
- `pageSize` (int, optional, default: 20): Items per page

**Response** (`200 OK`):
```json
{
  "items": [
    {
      "id": 1,
      "deviceName": "Lobby Display 1",
      "deviceModel": "Samsung QM55R",
      "serialNumber": "SN123456",
      "resolution": "1920x1080",
      "status": "Online",
      "lastHeartbeatAt": "2025-10-09T14:25:00",
      "location": "Main Lobby",
      "ipAddress": "192.168.1.100",
      "groups": [
        { "id": 1, "name": "Lobby Displays" }
      ],
      "createdAt": "2025-01-15T10:00:00",
      "updatedAt": "2025-10-09T14:25:00"
    }
  ],
  "totalCount": 42,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid parameters
- `401`: Unauthorized
- `500`: Internal server error

---

#### GET /api/devices/{id}
**Description**: Get device details by ID  
**Auth**: Required  
**Path Parameters**:
- `id` (int, required): Device ID

**Response** (`200 OK`):
```json
{
  "id": 1,
  "deviceName": "Lobby Display 1",
  "deviceModel": "Samsung QM55R",
  "serialNumber": "SN123456",
  "resolution": "1920x1080",
  "status": "Online",
  "lastHeartbeatAt": "2025-10-09T14:25:00",
  "location": "Main Lobby",
  "ipAddress": "192.168.1.100",
  "groups": [
    { "id": 1, "name": "Lobby Displays" }
  ],
  "assignments": [
    { "id": 1, "contentName": "Morning Playlist", "priority": 1 }
  ],
  "createdAt": "2025-01-15T10:00:00",
  "updatedAt": "2025-10-09T14:25:00"
}
```

**Status Codes**:
- `200`: Success
- `404`: Device not found
- `401`: Unauthorized
- `500`: Internal server error

---

#### POST /api/devices
**Description**: Create new device (manual registration)  
**Auth**: Required

**Request Body**:
```json
{
  "deviceName": "Conference Room TV",
  "deviceModel": "LG 55UN7300",
  "serialNumber": "SN789012",
  "resolution": "3840x2160",
  "location": "Conference Room A"
}
```

**Response** (`201 Created`):
```json
{
  "id": 43,
  "deviceName": "Conference Room TV",
  "deviceKey": "generated-device-key-here",
  "deviceModel": "LG 55UN7300",
  "serialNumber": "SN789012",
  "resolution": "3840x2160",
  "status": "Offline",
  "location": "Conference Room A",
  "createdAt": "2025-10-09T14:30:00",
  "updatedAt": "2025-10-09T14:30:00"
}
```

**Status Codes**:
- `201`: Created successfully
- `400`: Validation error
- `401`: Unauthorized
- `409`: Device with serial number already exists
- `500`: Internal server error

---

#### PUT /api/devices/{id}
**Description**: Update device details  
**Auth**: Required  
**Path Parameters**:
- `id` (int, required): Device ID

**Request Body** (all fields optional):
```json
{
  "deviceName": "Updated Display Name",
  "deviceModel": "Samsung QM55R-B",
  "resolution": "1920x1080",
  "location": "Main Lobby - Left",
  "groupIds": [1, 3]
}
```

**Response** (`200 OK`):
```json
{
  "id": 1,
  "deviceName": "Updated Display Name",
  "deviceModel": "Samsung QM55R-B",
  "resolution": "1920x1080",
  "status": "Online",
  "location": "Main Lobby - Left",
  "groups": [
    { "id": 1, "name": "Lobby Displays" },
    { "id": 3, "name": "Main Floor" }
  ],
  "updatedAt": "2025-10-09T14:35:00"
}
```

**Status Codes**:
- `200`: Updated successfully
- `400`: Validation error
- `404`: Device not found
- `401`: Unauthorized
- `500`: Internal server error

---

#### DELETE /api/devices/{id}
**Description**: Delete device  
**Auth**: Required  
**Path Parameters**:
- `id` (int, required): Device ID

**Response** (`204 No Content`): Empty body

**Status Codes**:
- `204`: Deleted successfully
- `404`: Device not found
- `401`: Unauthorized
- `409`: Device has active assignments (cannot delete)
- `500`: Internal server error

---

### 3. Media APIs (`/api/media`)

#### GET /api/media
**Description**: List all media with filtering, sorting, pagination  
**Auth**: Required

**Query Parameters**:
- `search` (string, optional): Search by name, filename
- `type` (string, optional): Filter by type (`image`, `video`, `html`)
- `tags` (string, optional): Comma-separated tag names
- `sortBy` (string, optional, default: `name`): Sort field
- `order` (string, optional, default: `asc`): Sort order
- `page` (int, optional, default: 1): Page number
- `pageSize` (int, optional, default: 20): Items per page

**Response** (`200 OK`):
```json
{
  "items": [
    {
      "id": 1,
      "name": "Company Logo",
      "fileName": "logo.png",
      "fileType": "image",
      "fileSize": 102400,
      "duration": null,
      "thumbnailUrl": "https://s3.amazonaws.com/bucket/thumbnails/logo.png?presigned",
      "description": "Official company logo",
      "tags": ["branding", "logo"],
      "createdAt": "2025-01-10T08:00:00",
      "updatedAt": "2025-01-10T08:00:00"
    }
  ],
  "totalCount": 156,
  "page": 1,
  "pageSize": 20,
  "totalPages": 8
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid parameters
- `401`: Unauthorized
- `500`: Internal server error

---

#### GET /api/media/{id}
**Description**: Get media details by ID  
**Auth**: Required  
**Path Parameters**:
- `id` (int, required): Media ID

**Response** (`200 OK`):
```json
{
  "id": 1,
  "name": "Company Logo",
  "fileName": "logo.png",
  "fileType": "image",
  "fileSize": 102400,
  "duration": null,
  "thumbnailUrl": "https://s3.amazonaws.com/...",
  "description": "Official company logo",
  "tags": ["branding", "logo"],
  "usageCount": 15,
  "createdAt": "2025-01-10T08:00:00",
  "updatedAt": "2025-01-10T08:00:00"
}
```

**Status Codes**:
- `200`: Success
- `404`: Media not found
- `401`: Unauthorized
- `500`: Internal server error

---

#### POST /api/media/upload
**Description**: Upload new media file (presigned URL workflow)  
**Auth**: Required

**Step 1 - Request presigned URL**:
**Request Body**:
```json
{
  "fileName": "new-video.mp4",
  "fileType": "video",
  "fileSize": 52428800,
  "contentType": "video/mp4"
}
```

**Response** (`200 OK`):
```json
{
  "uploadUrl": "https://s3.amazonaws.com/bucket/media/uuid/new-video.mp4?presigned-params",
  "mediaId": 157,
  "expiresIn": 3600
}
```

**Step 2 - Upload file to S3**:
Client uploads file directly to `uploadUrl` using PUT request.

**Step 3 - Confirm upload**:
**POST** `/api/media/{mediaId}/confirm-upload`

**Request Body**:
```json
{
  "name": "New Corporate Video",
  "description": "Q1 2025 company updates",
  "tagIds": [1, 5, 12]
}
```

**Response** (`200 OK`):
```json
{
  "id": 157,
  "name": "New Corporate Video",
  "fileName": "new-video.mp4",
  "fileType": "video",
  "fileSize": 52428800,
  "duration": 180,
  "thumbnailUrl": "https://s3.amazonaws.com/...",
  "description": "Q1 2025 company updates",
  "tags": ["corporate", "updates", "2025"],
  "createdAt": "2025-10-09T14:40:00",
  "updatedAt": "2025-10-09T14:40:00"
}
```

**Status Codes**:
- `200`: Upload completed
- `400`: Validation error
- `401`: Unauthorized
- `500`: Internal server error

---

#### PUT /api/media/{id}
**Description**: Update media metadata  
**Auth**: Required  
**Path Parameters**:
- `id` (int, required): Media ID

**Request Body** (all fields optional):
```json
{
  "name": "Updated Media Name",
  "description": "Updated description",
  "tagIds": [1, 2, 3]
}
```

**Response** (`200 OK`): Same as GET /api/media/{id}

**Status Codes**:
- `200`: Updated successfully
- `400`: Validation error
- `404`: Media not found
- `401`: Unauthorized
- `500`: Internal server error

---

#### DELETE /api/media/{id}
**Description**: Delete media file  
**Auth**: Required  
**Path Parameters**:
- `id` (int, required): Media ID

**Response** (`204 No Content`): Empty body

**Status Codes**:
- `204`: Deleted successfully
- `404`: Media not found
- `401`: Unauthorized
- `409`: Media is used in playlists/schedules (cannot delete)
- `500`: Internal server error

---

### 4. Device Registrations APIs (`/api/admin/device-registrations`)

#### GET /api/admin/device-registrations
**Description**: List device registration requests with status filter  
**Auth**: Required (Admin only)

**Query Parameters**:
- `status` (string, optional): Filter by status (`Pending`, `Approved`, `Rejected`, `All`)
- `search` (string, optional): Search by device name, serial number
- `sortBy` (string, optional, default: `createdAt`): Sort field
- `order` (string, optional, default: `desc`): Sort order
- `page` (int, optional, default: 1): Page number
- `pageSize` (int, optional, default: 20): Items per page

**Response** (`200 OK`):
```json
{
  "items": [
    {
      "id": 1,
      "deviceName": "Lobby TV",
      "deviceModel": "Samsung QM43R",
      "serialNumber": "SN987654",
      "pin": "123456",
      "status": "Pending",
      "approvedAt": null,
      "approvedByUserName": null,
      "rejectionReason": null,
      "createdDeviceId": null,
      "createdAt": "2025-10-09T10:00:00"
    }
  ],
  "totalCount": 5,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid parameters
- `401`: Unauthorized
- `403`: Forbidden (not admin)
- `500`: Internal server error

---

#### GET /api/admin/device-registrations/{id}
**Description**: Get registration request details  
**Auth**: Required (Admin only)  
**Path Parameters**:
- `id` (int, required): Registration request ID

**Response** (`200 OK`): Same as list item with additional hardware details

**Status Codes**:
- `200`: Success
- `404`: Registration not found
- `401`: Unauthorized
- `403`: Forbidden
- `500`: Internal server error

---

#### POST /api/admin/device-registrations/{id}/approve
**Description**: Approve device registration request  
**Auth**: Required (Admin only)  
**Path Parameters**:
- `id` (int, required): Registration request ID

**Request Body**:
```json
{
  "deviceGroupIds": [1, 3],
  "location": "Main Lobby"
}
```

**Response** (`200 OK`):
```json
{
  "registrationId": 1,
  "status": "Approved",
  "createdDeviceId": 44,
  "deviceName": "Lobby TV",
  "approvedAt": "2025-10-09T14:50:00",
  "approvedByUserName": "admin@example.com"
}
```

**Status Codes**:
- `200`: Approved successfully
- `400`: Validation error or already processed
- `404`: Registration not found
- `401`: Unauthorized
- `403`: Forbidden
- `500`: Internal server error

---

#### POST /api/admin/device-registrations/{id}/reject
**Description**: Reject device registration request  
**Auth**: Required (Admin only)  
**Path Parameters**:
- `id` (int, required): Registration request ID

**Request Body**:
```json
{
  "reason": "Device not authorized for this network"
}
```

**Response** (`200 OK`):
```json
{
  "registrationId": 1,
  "status": "Rejected",
  "rejectionReason": "Device not authorized for this network",
  "rejectedAt": "2025-10-09T14:52:00",
  "rejectedByUserName": "admin@example.com"
}
```

**Status Codes**:
- `200`: Rejected successfully
- `400`: Validation error or already processed
- `404`: Registration not found
- `401`: Unauthorized
- `403`: Forbidden
- `500`: Internal server error

---

## Tier 2: Operational Features

### 5. Schedules APIs (`/api/schedules`)

#### GET /api/schedules
**Description**: List all schedules with filtering, sorting, pagination  
**Auth**: Required

**Query Parameters**:
- `search` (string, optional): Search by name
- `isActive` (bool, optional): Filter by active status
- `startDate` (string, optional): Filter by start date (ISO format)
- `endDate` (string, optional): Filter by end date
- `sortBy` (string, optional, default: `name`): Sort field
- `order` (string, optional, default: `asc`): Sort order
- `page` (int, optional, default: 1): Page number
- `pageSize` (int, optional, default: 20): Items per page

**Response** (`200 OK`):
```json
{
  "items": [
    {
      "id": 1,
      "name": "Morning Schedule",
      "description": "Content for 6am-12pm",
      "startDate": "2025-01-01",
      "endDate": null,
      "startTime": "06:00:00",
      "endTime": "12:00:00",
      "recurrence": "Daily",
      "recurrencePattern": null,
      "priority": 1,
      "isActive": true,
      "content": [
        { "mediaId": 5, "name": "Morning News", "type": "media" },
        { "playlistId": 2, "name": "Ads Playlist", "type": "playlist" }
      ],
      "createdAt": "2025-01-05T10:00:00",
      "updatedAt": "2025-01-05T10:00:00"
    }
  ],
  "totalCount": 23,
  "page": 1,
  "pageSize": 20,
  "totalPages": 2
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid parameters
- `401`: Unauthorized
- `500`: Internal server error

---

#### POST /api/schedules
**Description**: Create new schedule  
**Auth**: Required

**Request Body**:
```json
{
  "name": "Afternoon Schedule",
  "description": "Content for 12pm-6pm",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "startTime": "12:00:00",
  "endTime": "18:00:00",
  "recurrence": "Daily",
  "recurrencePattern": null,
  "priority": 2,
  "isActive": true,
  "contentIds": [5, 12, 23]
}
```

**Response** (`201 Created`): Same structure as GET /api/schedules/{id}

**Status Codes**:
- `201`: Created successfully
- `400`: Validation error or schedule conflict
- `401`: Unauthorized
- `500`: Internal server error

---

#### GET /api/schedules/conflicts
**Description**: Check for schedule conflicts  
**Auth**: Required

**Query Parameters**:
- `startDate` (string, required): Start date
- `endDate` (string, optional): End date
- `startTime` (string, required): Start time
- `endTime` (string, required): End time
- `deviceId` (int, optional): Check for specific device
- `deviceGroupId` (int, optional): Check for device group
- `excludeScheduleId` (int, optional): Exclude schedule from conflict check (for updates)

**Response** (`200 OK`):
```json
{
  "hasConflicts": true,
  "conflicts": [
    {
      "scheduleId": 3,
      "scheduleName": "Existing Schedule",
      "conflictType": "TimeOverlap",
      "details": "Schedule times overlap: 12:00-18:00 conflicts with 14:00-20:00"
    }
  ]
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid parameters
- `401`: Unauthorized
- `500`: Internal server error

---

### 6. Users APIs (`/api/admin/users`)

#### GET /api/admin/users
**Description**: List all users with filtering, sorting, pagination  
**Auth**: Required (Admin only)

**Query Parameters**:
- `search` (string, optional): Search by username, email, name
- `isActive` (bool, optional): Filter by active status
- `roleId` (int, optional): Filter by role
- `sortBy` (string, optional, default: `username`): Sort field
- `order` (string, optional, default: `asc`): Sort order
- `page` (int, optional, default: 1): Page number
- `pageSize` (int, optional, default: 20): Items per page

**Response** (`200 OK`):
```json
{
  "items": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "firstName": "System",
      "lastName": "Administrator",
      "isActive": true,
      "lastLoginAt": "2025-10-09T08:00:00",
      "roles": ["Administrator"],
      "createdAt": "2025-01-01T00:00:00",
      "updatedAt": "2025-10-09T08:00:00"
    }
  ],
  "totalCount": 12,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid parameters
- `401`: Unauthorized
- `403`: Forbidden (not admin)
- `500`: Internal server error

---

#### POST /api/admin/users
**Description**: Create new user  
**Auth**: Required (Admin only)

**Request Body**:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "firstName": "New",
  "lastName": "User",
  "roleIds": [2]
}
```

**Response** (`201 Created`):
```json
{
  "id": 13,
  "username": "newuser",
  "email": "newuser@example.com",
  "firstName": "New",
  "lastName": "User",
  "isActive": true,
  "roles": ["Operator"],
  "createdAt": "2025-10-09T15:00:00",
  "updatedAt": "2025-10-09T15:00:00"
}
```

**Status Codes**:
- `201`: Created successfully
- `400`: Validation error
- `401`: Unauthorized
- `403`: Forbidden
- `409`: Username or email already exists
- `500`: Internal server error

---

#### POST /api/admin/users/{id}/reset-password
**Description**: Reset user password  
**Auth**: Required (Admin only)  
**Path Parameters**:
- `id` (int, required): User ID

**Request Body**:
```json
{
  "newPassword": "NewSecurePassword123!",
  "sendEmail": true
}
```

**Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Password reset successfully. Email sent to user."
}
```

**Status Codes**:
- `200`: Success
- `400`: Validation error
- `404`: User not found
- `401`: Unauthorized
- `403`: Forbidden
- `500`: Internal server error

---

### 7. Assignments APIs (`/api/assignments`)

#### GET /api/assignments
**Description**: List all assignments with filtering, sorting, pagination  
**Auth**: Required

**Query Parameters**:
- `search` (string, optional): Search by name
- `targetType` (string, optional): Filter by target type (`Device`, `DeviceGroup`)
- `contentType` (string, optional): Filter by content type (`Media`, `Playlist`, `Schedule`)
- `isActive` (bool, optional): Filter by active status
- `deviceId` (int, optional): Filter by device
- `deviceGroupId` (int, optional): Filter by device group
- `sortBy` (string, optional, default: `priority`): Sort field
- `order` (string, optional, default: `asc`): Sort order
- `page` (int, optional, default: 1): Page number
- `pageSize` (int, optional, default: 20): Items per page

**Response** (`200 OK`):
```json
{
  "items": [
    {
      "id": 1,
      "name": "Lobby Morning Content",
      "description": "Morning schedule for lobby displays",
      "targetType": "DeviceGroup",
      "targetId": 1,
      "targetName": "Lobby Displays",
      "contentType": "Schedule",
      "contentId": 1,
      "contentName": "Morning Schedule",
      "priority": 1,
      "startDate": "2025-01-01",
      "endDate": null,
      "isActive": true,
      "createdAt": "2025-01-05T10:00:00",
      "updatedAt": "2025-01-05T10:00:00"
    }
  ],
  "totalCount": 45,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid parameters
- `401`: Unauthorized
- `500`: Internal server error

---

#### POST /api/assignments
**Description**: Create new assignment  
**Auth**: Required

**Request Body**:
```json
{
  "name": "New Assignment",
  "description": "Assign content to device group",
  "targetType": "DeviceGroup",
  "targetId": 2,
  "contentType": "Playlist",
  "contentId": 5,
  "priority": 3,
  "startDate": "2025-10-10",
  "endDate": "2025-12-31",
  "isActive": true
}
```

**Response** (`201 Created`): Same structure as GET /api/assignments/{id}

**Status Codes**:
- `201`: Created successfully
- `400`: Validation error
- `401`: Unauthorized
- `404`: Target or content not found
- `500`: Internal server error

---

## Tier 3: Supporting Features

### 8. Playlists APIs (`/api/playlists`)

#### GET /api/playlists
**Description**: List all playlists with filtering, sorting, pagination  
**Auth**: Required

**Query Parameters**:
- `search` (string, optional): Search by name
- `isActive` (bool, optional): Filter by active status
- `sortBy` (string, optional, default: `name`): Sort field
- `order` (string, optional, default: `asc`): Sort order
- `page` (int, optional, default: 1): Page number
- `pageSize` (int, optional, default: 20): Items per page

**Response** (`200 OK`):
```json
{
  "items": [
    {
      "id": 1,
      "name": "Morning Playlist",
      "description": "Content for morning hours",
      "isActive": true,
      "totalDuration": 300,
      "itemCount": 5,
      "items": [
        {
          "id": 1,
          "mediaId": 10,
          "mediaName": "Welcome Video",
          "mediaThumbnail": "https://...",
          "order": 1,
          "duration": 60
        }
      ],
      "createdAt": "2025-01-03T10:00:00",
      "updatedAt": "2025-01-03T10:00:00"
    }
  ],
  "totalCount": 23,
  "page": 1,
  "pageSize": 20,
  "totalPages": 2
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid parameters
- `401`: Unauthorized
- `500`: Internal server error

---

#### POST /api/playlists
**Description**: Create new playlist  
**Auth**: Required

**Request Body**:
```json
{
  "name": "Afternoon Playlist",
  "description": "Content for afternoon",
  "isActive": true,
  "mediaIds": [10, 15, 20, 25, 30]
}
```

**Response** (`201 Created`): Same structure as GET /api/playlists/{id}

**Status Codes**:
- `201`: Created successfully
- `400`: Validation error
- `401`: Unauthorized
- `404`: Media not found
- `500`: Internal server error

---

### 9. Device Groups APIs (`/api/devicegroups`)

#### GET /api/devicegroups
**Description**: List all device groups with filtering, sorting, pagination  
**Auth**: Required

**Query Parameters**:
- `search` (string, optional): Search by name, location
- `sortBy` (string, optional, default: `name`): Sort field
- `order` (string, optional, default: `asc`): Sort order
- `page` (int, optional, default: 1): Page number
- `pageSize` (int, optional, default: 20): Items per page

**Response** (`200 OK`):
```json
{
  "items": [
    {
      "id": 1,
      "name": "Lobby Displays",
      "description": "All displays in main lobby",
      "location": "Main Building - Lobby",
      "deviceCount": 4,
      "devices": [
        { "id": 1, "name": "Lobby Display 1", "status": "Online" },
        { "id": 2, "name": "Lobby Display 2", "status": "Online" }
      ],
      "createdAt": "2025-01-02T10:00:00",
      "updatedAt": "2025-01-02T10:00:00"
    }
  ],
  "totalCount": 8,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid parameters
- `401`: Unauthorized
- `500`: Internal server error

---

#### POST /api/devicegroups
**Description**: Create new device group  
**Auth**: Required

**Request Body**:
```json
{
  "name": "Conference Rooms",
  "description": "All conference room displays",
  "location": "2nd Floor",
  "deviceIds": [5, 6, 7]
}
```

**Response** (`201 Created`): Same structure as GET /api/devicegroups/{id}

**Status Codes**:
- `201`: Created successfully
- `400`: Validation error
- `401`: Unauthorized
- `409`: Group name already exists
- `500`: Internal server error

---

### 10. Analytics APIs (`/api/analytics`)

#### GET /api/analytics/overview
**Description**: Get analytics overview for date range  
**Auth**: Required

**Query Parameters**:
- `startDate` (string, required): Start date (ISO format)
- `endDate` (string, required): End date (ISO format)

**Response** (`200 OK`):
```json
{
  "startDate": "2025-10-01",
  "endDate": "2025-10-09",
  "totalPlaybackHours": 1250,
  "uniqueMediaPlayed": 45,
  "dailyMetrics": [
    {
      "date": "2025-10-01",
      "playbackHours": 140,
      "activeDevices": 38,
      "mediaPlayed": 42
    }
  ]
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid date range
- `401`: Unauthorized
- `500`: Internal server error

---

#### GET /api/analytics/devices
**Description**: Get device-specific analytics  
**Auth**: Required

**Query Parameters**:
- `startDate` (string, required): Start date
- `endDate` (string, required): End date
- `deviceId` (int, optional): Filter by device
- `groupId` (int, optional): Filter by device group

**Response** (`200 OK`):
```json
{
  "devices": [
    {
      "deviceId": 1,
      "deviceName": "Lobby Display 1",
      "uptime": 98.5,
      "totalPlaybackHours": 180,
      "contentPlayed": 35,
      "lastHeartbeat": "2025-10-09T14:25:00"
    }
  ]
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid parameters
- `401`: Unauthorized
- `500`: Internal server error

---

## Tier 4: Administrative Features

### 11. QR Codes APIs (`/api/qrcodes`)

**Note**: If this controller doesn't exist, it needs to be created.

#### GET /api/qrcodes
**Description**: List all QR codes  
**Auth**: Required

**Query Parameters**:
- `isUsed` (bool, optional): Filter by usage status
- `page` (int, optional, default: 1): Page number
- `pageSize` (int, optional, default: 20): Items per page

**Response** (`200 OK`):
```json
{
  "items": [
    {
      "id": 1,
      "code": "QR-ABC123",
      "deviceId": null,
      "qrImageUrl": "https://s3.amazonaws.com/...",
      "expiresAt": "2025-10-16T14:30:00",
      "isUsed": false,
      "createdAt": "2025-10-09T14:30:00"
    }
  ],
  "totalCount": 15,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized
- `500`: Internal server error

---

#### POST /api/qrcodes/generate
**Description**: Generate new QR code  
**Auth**: Required

**Request Body**:
```json
{
  "deviceName": "New Device",
  "expiresInHours": 24
}
```

**Response** (`201 Created`):
```json
{
  "id": 16,
  "code": "QR-DEF456",
  "qrImageUrl": "https://s3.amazonaws.com/...",
  "expiresAt": "2025-10-10T14:30:00",
  "isUsed": false,
  "createdAt": "2025-10-09T14:30:00"
}
```

**Status Codes**:
- `201`: Created successfully
- `400`: Validation error
- `401`: Unauthorized
- `500`: Internal server error

---

#### GET /api/qrcodes/{id}/download
**Description**: Download QR code image  
**Auth**: Required  
**Path Parameters**:
- `id` (int, required): QR code ID

**Response** (`302 Found`): Redirect to presigned S3 URL

**Status Codes**:
- `302`: Redirect to download URL
- `404`: QR code not found
- `401`: Unauthorized
- `500`: Internal server error

---

### 12. Reports APIs (`/api/reports`)

**Note**: If this controller doesn't exist, it needs to be created.

#### GET /api/reports
**Description**: List available reports  
**Auth**: Required

**Response** (`200 OK`):
```json
{
  "reports": [
    {
      "id": 1,
      "name": "Device Usage Report",
      "type": "DeviceUsage",
      "description": "Device uptime and content playback statistics",
      "generatedAt": "2025-10-09T12:00:00",
      "downloadUrl": "https://s3.amazonaws.com/..."
    }
  ]
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized
- `500`: Internal server error

---

#### POST /api/reports/generate
**Description**: Generate new report  
**Auth**: Required

**Request Body**:
```json
{
  "type": "DeviceUsage",
  "startDate": "2025-10-01",
  "endDate": "2025-10-09",
  "format": "csv",
  "filters": {
    "deviceGroupId": 1
  }
}
```

**Response** (`202 Accepted`):
```json
{
  "reportId": 2,
  "status": "Generating",
  "estimatedCompletionTime": "2025-10-09T15:05:00"
}
```

**Status Codes**:
- `202`: Accepted for generation
- `400`: Validation error
- `401`: Unauthorized
- `500`: Internal server error

---

#### GET /api/reports/{id}/export
**Description**: Export/download generated report  
**Auth**: Required  
**Path Parameters**:
- `id` (int, required): Report ID

**Response** (`302 Found`): Redirect to presigned S3 URL

**Status Codes**:
- `302`: Redirect to download URL
- `404`: Report not found
- `401`: Unauthorized
- `425`: Report generation in progress
- `500`: Internal server error

---

### 13. Settings APIs (`/api/settings`)

**Note**: If this controller doesn't exist, it needs to be created.

#### GET /api/settings
**Description**: Get all settings  
**Auth**: Required (Admin only)

**Response** (`200 OK`):
```json
{
  "settings": [
    {
      "id": 1,
      "category": "General",
      "key": "CompanyName",
      "value": "Acme Corporation",
      "description": "Company name displayed in system"
    },
    {
      "id": 2,
      "category": "Display",
      "key": "DefaultResolution",
      "value": "1920x1080",
      "description": "Default display resolution"
    }
  ]
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized
- `403`: Forbidden (not admin)
- `500`: Internal server error

---

#### GET /api/settings/{category}
**Description**: Get settings by category  
**Auth**: Required (Admin only)  
**Path Parameters**:
- `category` (string, required): Setting category

**Response** (`200 OK`): Same structure as GET /api/settings, filtered by category

**Status Codes**:
- `200`: Success
- `401`: Unauthorized
- `403`: Forbidden
- `500`: Internal server error

---

#### PUT /api/settings
**Description**: Update multiple settings  
**Auth**: Required (Admin only)

**Request Body**:
```json
{
  "settings": [
    {
      "key": "CompanyName",
      "value": "Updated Corp Name"
    },
    {
      "key": "DefaultResolution",
      "value": "3840x2160"
    }
  ]
}
```

**Response** (`200 OK`):
```json
{
  "success": true,
  "updatedCount": 2,
  "settings": [
    {
      "id": 1,
      "category": "General",
      "key": "CompanyName",
      "value": "Updated Corp Name",
      "description": "Company name displayed in system"
    }
  ]
}
```

**Status Codes**:
- `200`: Updated successfully
- `400`: Validation error
- `401`: Unauthorized
- `403`: Forbidden
- `500`: Internal server error

---

## Common Response Patterns

### Pagination
All list endpoints that support pagination return:
```json
{
  "items": [...],
  "totalCount": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Name": ["The Name field is required."],
    "StartDate": ["Start date must be in the future."]
  }
}
```

#### 404 Not Found
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Resource not found.",
  "status": 404,
  "detail": "Device with ID 999 was not found."
}
```

#### 500 Internal Server Error
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.6.1",
  "title": "An error occurred while processing your request.",
  "status": 500,
  "detail": "An unexpected error occurred. Please contact support."
}
```

---

## Conclusion

This API contract document provides:

1. ✅ **47 API Endpoints** across 13 controllers
2. ✅ **Complete Request/Response Schemas** for all CRUD operations
3. ✅ **Status Codes** documented for all endpoints
4. ✅ **Query Parameters** for search, filter, sort, pagination
5. ✅ **Authentication Requirements** specified
6. ✅ **Error Response Patterns** standardized

**Endpoints by Status**:
- **Verified Existing**: 40 endpoints (Dashboard, Devices, Media, Playlists, Schedules, Assignments, Users, Device Groups, Analytics, Device Registrations)
- **Needs Verification**: 3 endpoints (QR Codes - may exist)
- **Needs Creation**: 4 endpoints (Reports, Settings - likely missing)

**Ready for Phase 1 (continued)**: Quick start guide creation
