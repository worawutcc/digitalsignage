# API Contracts: Enhanced Backoffice Admin UI

## Authentication & Authorization Endpoints

### POST /api/auth/login
Enhanced login with RBAC support

**Request:**
```json
{
  "username": "admin@example.com",
  "password": "securePassword123",
  "rememberMe": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "username": "admin@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": {
        "id": "role-admin",
        "name": "Administrator",
        "level": 2
      },
      "permissions": [
        {
          "resource": "devices",
          "actions": ["read", "write", "delete"]
        },
        {
          "resource": "media",
          "actions": ["read", "write", "delete"]
        }
      ]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600
  }
}
```

### GET /api/auth/permissions
Get current user's permissions

**Response:**
```json
{
  "success": true,
  "data": {
    "permissions": [
      {
        "id": "perm-1",
        "resource": "devices",
        "action": "read",
        "conditions": null
      },
      {
        "id": "perm-2", 
        "resource": "devices",
        "action": "write",
        "conditions": {
          "ownedOnly": false
        }
      }
    ]
  }
}
```

## Device Management Endpoints

### GET /api/devices
Enhanced device listing with filters, pagination, and real-time status

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20, max: 100)
- `search`: string
- `status`: string[] (online, offline, error)
- `type`: string[] (android_tv, web_display, etc.)
- `location`: string[]
- `group`: string[]
- `lastSeen`: string (ISO date range: "2024-01-01,2024-01-31")
- `sort`: string (name, status, lastSeen, location)
- `order`: string (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "device-123",
      "name": "Lobby Display 1",
      "type": "android_tv",
      "status": {
        "online": true,
        "lastSeen": "2024-01-15T10:30:00Z",
        "uptime": 86400,
        "performance": {
          "cpuUsage": 45.2,
          "memoryUsage": 62.1,
          "storageUsage": 23.8
        },
        "alerts": []
      },
      "location": {
        "building": "Main Office",
        "floor": "1st Floor", 
        "room": "Lobby"
      },
      "configuration": {
        "resolution": {
          "width": 1920,
          "height": 1080
        },
        "orientation": "landscape",
        "volume": 75,
        "brightness": 80,
        "timezone": "Asia/Bangkok"
      },
      "groups": [
        {
          "id": "group-1",
          "name": "Lobby Displays"
        }
      ],
      "assignedContent": [
        {
          "scheduleId": "schedule-1",
          "scheduleName": "Morning Announcements",
          "priority": 1,
          "nextUpdate": "2024-01-15T11:00:00Z"
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### POST /api/devices/bulk-action
Bulk operations on multiple devices

**Request:**
```json
{
  "action": "update_configuration",
  "deviceIds": ["device-1", "device-2", "device-3"],
  "parameters": {
    "configuration": {
      "volume": 80,
      "brightness": 90
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "operationId": "bulk-op-123",
    "totalDevices": 3,
    "processed": 3,
    "successful": 2,
    "failed": 1,
    "results": [
      {
        "deviceId": "device-1",
        "success": true
      },
      {
        "deviceId": "device-2", 
        "success": true
      },
      {
        "deviceId": "device-3",
        "success": false,
        "error": "Device offline"
      }
    ]
  }
}
```

### GET /api/devices/{id}/status
Real-time device status

**Response:**
```json
{
  "success": true,
  "data": {
    "online": true,
    "lastHeartbeat": "2024-01-15T10:30:00Z",
    "uptime": 86400,
    "performance": {
      "cpuUsage": 45.2,
      "memoryUsage": 62.1,
      "storageUsage": 23.8,
      "networkLatency": 25.4
    },
    "currentContent": {
      "scheduleId": "schedule-1",
      "mediaId": "media-456",
      "startedAt": "2024-01-15T10:00:00Z",
      "duration": 30
    },
    "alerts": [
      {
        "id": "alert-1",
        "type": "warning",
        "message": "High CPU usage detected",
        "timestamp": "2024-01-15T10:25:00Z"
      }
    ]
  }
}
```

## Media Management Endpoints

### GET /api/media
Enhanced media library with metadata and thumbnails

**Query Parameters:**
- `page`, `limit`, `search`, `sort`, `order` (same as devices)
- `type`: string[] (image, video, html)
- `size`: string (range: "0,1048576" for 0-1MB)
- `createdAt`: string (ISO date range)
- `tags`: string[]
- `folder`: string (folder ID)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "media-123",
      "filename": "promotional-video.mp4",
      "originalName": "Company Promo 2024.mp4",
      "mimeType": "video/mp4",
      "size": 15728640,
      "duration": 120,
      "dimensions": {
        "width": 1920,
        "height": 1080
      },
      "s3Key": "media/abc123/promotional-video.mp4",
      "s3Bucket": "digital-signage-media",
      "presignedUrl": "https://s3.amazonaws.com/...",
      "thumbnail": "https://s3.amazonaws.com/.../thumbnail.jpg",
      "metadata": {
        "codec": "h264",
        "bitrate": 2500000,
        "framerate": 30
      },
      "tags": ["promotional", "company", "2024"],
      "folder": {
        "id": "folder-1",
        "name": "Promotional Content",
        "path": "/promotional"
      },
      "createdAt": "2024-01-15T08:00:00Z",
      "updatedAt": "2024-01-15T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 89,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### POST /api/media/upload
Media upload with progress tracking

**Request:** (multipart/form-data)
- `file`: File
- `folder`: string (optional)
- `tags`: string[] (optional)
- `metadata`: object (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadId": "upload-123",
    "mediaId": "media-456",
    "presignedUrl": "https://s3.amazonaws.com/...",
    "fields": {
      "key": "media/xyz789/filename.jpg",
      "AWSAccessKeyId": "...",
      "policy": "...",
      "signature": "..."
    }
  }
}
```

### GET /api/media/folders
Media folder structure

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "folder-1",
      "name": "Promotional Content",
      "parentId": null,
      "path": "/promotional",
      "mediaCount": 25,
      "children": [
        {
          "id": "folder-2",
          "name": "2024 Campaign",
          "parentId": "folder-1",
          "path": "/promotional/2024-campaign",
          "mediaCount": 12,
          "children": []
        }
      ]
    }
  ]
}
```

## Schedule Management Endpoints

### GET /api/schedules
Enhanced schedule listing with conflict detection

**Query Parameters:**
- `page`, `limit`, `search`, `sort`, `order` (standard)
- `status`: string[] (active, inactive, expired, draft)
- `dateRange`: string ("2024-01-01,2024-01-31")
- `priority`: string (range: "1,10")
- `devices`: string[] (device IDs)
- `createdBy`: string[] (user IDs)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "schedule-123",
      "name": "Morning Announcements",
      "description": "Daily morning company announcements",
      "priority": 5,
      "status": "active",
      "startDate": "2024-01-15T00:00:00Z",
      "endDate": "2024-12-31T23:59:59Z",
      "timeSlots": [
        {
          "id": "slot-1",
          "startTime": "09:00",
          "endTime": "09:30",
          "daysOfWeek": [1, 2, 3, 4, 5],
          "timezone": "Asia/Bangkok"
        }
      ],
      "recurrence": {
        "type": "daily",
        "interval": 1,
        "endType": "never"
      },
      "targetDevices": [
        {
          "id": "device-1",
          "name": "Lobby Display 1",
          "type": "specific"
        },
        {
          "groupId": "group-1",
          "name": "All Lobby Displays",
          "type": "group"
        }
      ],
      "content": [
        {
          "id": "content-1",
          "mediaId": "media-123",
          "mediaName": "Welcome Message",
          "order": 1,
          "duration": 15,
          "transition": "fade"
        },
        {
          "id": "content-2",
          "mediaId": "media-456",
          "mediaName": "Company News",
          "order": 2,
          "duration": 15,
          "transition": "slide"
        }
      ],
      "conflicts": [],
      "createdBy": {
        "id": "user-1",
        "name": "John Doe"
      },
      "createdAt": "2024-01-10T00:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### GET /api/schedules/calendar
Calendar view data with conflict visualization

**Query Parameters:**
- `start`: string (ISO date)
- `end`: string (ISO date)
- `devices`: string[] (optional filter)
- `view`: string (month, week, day)

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "schedule-123",
        "title": "Morning Announcements",
        "start": "2024-01-15T09:00:00Z",
        "end": "2024-01-15T09:30:00Z",
        "color": "#3b82f6",
        "priority": 5,
        "devices": ["device-1", "device-2"],
        "conflicts": []
      }
    ],
    "conflicts": [
      {
        "id": "conflict-1",
        "type": "overlap",
        "schedules": ["schedule-123", "schedule-456"],
        "devices": ["device-1"],
        "timeRange": {
          "start": "2024-01-15T09:15:00Z",
          "end": "2024-01-15T09:30:00Z"
        },
        "severity": "warning"
      }
    ]
  }
}
```

### POST /api/schedules/validate
Validate schedule for conflicts before saving

**Request:**
```json
{
  "name": "New Schedule",
  "startDate": "2024-01-20T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z",
  "timeSlots": [
    {
      "startTime": "10:00",
      "endTime": "10:30",
      "daysOfWeek": [1, 2, 3, 4, 5],
      "timezone": "Asia/Bangkok"
    }
  ],
  "targetDevices": [
    {
      "id": "device-1",
      "type": "specific"
    }
  ],
  "priority": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "conflicts": [
      {
        "type": "overlap",
        "existingSchedule": {
          "id": "schedule-456",
          "name": "Existing Schedule"
        },
        "device": "device-1",
        "timeRange": {
          "start": "10:15",
          "end": "10:30"
        },
        "severity": "error",
        "suggestion": "Adjust time slot or increase priority"
      }
    ],
    "warnings": [
      {
        "type": "device_offline",
        "device": "device-1",
        "message": "Target device has been offline for 2 hours"
      }
    ]
  }
}
```

## User & Permission Management Endpoints

### GET /api/users
User management with role filtering

**Query Parameters:**
- `page`, `limit`, `search`, `sort`, `order`
- `role`: string[] (role IDs)
- `status`: string[] (active, inactive, pending)
- `lastLogin`: string (date range)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-123",
      "username": "john.doe",
      "email": "john.doe@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": {
        "id": "role-2",
        "name": "Content Manager",
        "level": 3
      },
      "isActive": true,
      "lastLoginAt": "2024-01-15T09:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T08:00:00Z"
    }
  ]
}
```

### GET /api/roles
Available roles and permissions

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "role-1",
      "name": "Super Administrator",
      "description": "Full system access",
      "level": 1,
      "permissions": [
        {
          "id": "perm-1",
          "resource": "*",
          "action": "*"
        }
      ],
      "userCount": 2,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "role-2",
      "name": "Content Manager",
      "description": "Manage media and schedules",
      "level": 3,
      "permissions": [
        {
          "id": "perm-2",
          "resource": "media",
          "action": "read"
        },
        {
          "id": "perm-3",
          "resource": "media",
          "action": "write"
        },
        {
          "id": "perm-4",
          "resource": "schedules",
          "action": "read"
        }
      ],
      "userCount": 8,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Analytics & Monitoring Endpoints

### GET /api/analytics/dashboard
Dashboard overview statistics

**Query Parameters:**
- `period`: string (24h, 7d, 30d, 90d, 1y)
- `timezone`: string (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalDevices": 156,
      "onlineDevices": 142,
      "offlineDevices": 14,
      "activeSchedules": 23,
      "totalMedia": 1247,
      "storageUsed": "45.2 GB"
    },
    "trends": {
      "deviceUptime": [
        {
          "date": "2024-01-14",
          "percentage": 95.2
        },
        {
          "date": "2024-01-15", 
          "percentage": 97.1
        }
      ],
      "contentDelivery": [
        {
          "date": "2024-01-14",
          "successful": 1456,
          "failed": 23
        },
        {
          "date": "2024-01-15",
          "successful": 1678,
          "failed": 12
        }
      ]
    },
    "alerts": [
      {
        "id": "alert-1",
        "type": "warning",
        "title": "High Storage Usage",
        "message": "S3 bucket usage is at 89% capacity",
        "timestamp": "2024-01-15T10:00:00Z",
        "severity": "medium"
      }
    ]
  }
}
```

## WebSocket Events

### Real-time Event Contracts

**Device Status Update:**
```json
{
  "type": "device_status_changed",
  "payload": {
    "deviceId": "device-123",
    "status": {
      "online": false,
      "lastSeen": "2024-01-15T10:30:00Z",
      "reason": "connection_timeout"
    }
  },
  "timestamp": "2024-01-15T10:30:15Z"
}
```

**Schedule Update:**
```json
{
  "type": "schedule_updated",
  "payload": {
    "scheduleId": "schedule-123",
    "action": "created",
    "affectedDevices": ["device-1", "device-2"],
    "nextExecution": "2024-01-15T11:00:00Z"
  },
  "timestamp": "2024-01-15T10:35:00Z",
  "userId": "user-456"
}
```

**System Alert:**
```json
{
  "type": "system_alert",
  "payload": {
    "id": "alert-789",
    "type": "error",
    "title": "Media Upload Failed",
    "message": "Failed to upload media file: insufficient storage",
    "severity": "high",
    "actionRequired": true
  },
  "timestamp": "2024-01-15T10:40:00Z"
}
```

These API contracts provide comprehensive coverage for all admin UI features with proper error handling, pagination, filtering, and real-time updates through WebSocket events.