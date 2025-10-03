# Android TV Device Management API Documentation

## Overview

The Android TV Device Management API provides comprehensive endpoints for managing Android TV devices in a digital signage system. This includes device lifecycle management, configuration templates, real-time status monitoring, and alert handling.

## Base URL
- **Development**: `http://localhost:5100`
- **Production**: `https://api.digitalsignage.com`

## Authentication

All endpoints require JWT Bearer token authentication unless otherwise specified.

```http
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Device Management (`/api/androidtv/devices`)

#### Get All Devices
```http
GET /api/androidtv/devices
```

**Query Parameters:**
- `pageNumber` (int, optional): Page number for pagination (default: 1)
- `pageSize` (int, optional): Number of items per page (default: 10)
- `status` (string, optional): Filter by device status (Online, Offline, Maintenance, Error)
- `location` (string, optional): Filter by device location
- `deviceGroupId` (int, optional): Filter by device group

**Response:**
```json
{
  "devices": [
    {
      "id": 1,
      "name": "Conference Room A TV",
      "deviceKey": "conf-room-a-001",
      "location": "Conference Room A",
      "status": "Online",
      "lastHeartbeat": "2025-10-03T10:30:00Z",
      "resolution": "1920x1080",
      "deviceGroupId": 1,
      "createdAt": "2025-10-01T08:00:00Z",
      "updatedAt": "2025-10-03T10:30:00Z"
    }
  ],
  "totalCount": 25,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 3,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

#### Create Device
```http
POST /api/androidtv/devices
```

**Request Body:**
```json
{
  "name": "New Android TV",
  "location": "Conference Room B",
  "deviceKey": "conf-room-b-001",
  "resolution": "1920x1080",
  "deviceGroupId": 1
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "name": "New Android TV",
  "deviceKey": "conf-room-b-001",
  "location": "Conference Room B",
  "status": "Offline",
  "resolution": "1920x1080",
  "deviceGroupId": 1,
  "createdAt": "2025-10-03T11:00:00Z",
  "updatedAt": "2025-10-03T11:00:00Z"
}
```

#### Get Device by ID
```http
GET /api/androidtv/devices/{id}
```

**Response:** `200 OK` or `404 Not Found`

#### Update Device
```http
PUT /api/androidtv/devices/{id}
```

**Request Body:**
```json
{
  "name": "Updated Android TV Name",
  "location": "Updated Location",
  "deviceGroupId": 2
}
```

**Response:** `200 OK` with updated device data

#### Delete Device
```http
DELETE /api/androidtv/devices/{id}
```

**Response:** `204 No Content` or `404 Not Found`

#### Bulk Operations
```http
POST /api/androidtv/devices/bulk-operation
```

**Request Body:**
```json
{
  "deviceIds": [1, 2, 3],
  "operation": "Restart",
  "parameters": {
    "reason": "Scheduled maintenance"
  }
}
```

**Operations:**
- `Restart`: Restart selected devices
- `UpdateStatus`: Update device status
- `SetMaintenanceMode`: Enable/disable maintenance mode

### Configuration Management (`/api/androidtv/configuration`)

#### Get Configuration Templates
```http
GET /api/androidtv/configuration/templates
```

#### Create Configuration Template
```http
POST /api/androidtv/configuration/templates
```

**Request Body:**
```json
{
  "name": "Standard Office Configuration",
  "description": "Standard configuration for office environments",
  "configuration": {
    "displaySettings": {
      "brightness": 80,
      "contrast": 75,
      "orientation": "landscape"
    },
    "networkSettings": {
      "wifiEnabled": true,
      "ethernetEnabled": true
    },
    "appSettings": {
      "autoStart": true,
      "defaultApp": "digital-signage-player"
    }
  }
}
```

#### Deploy Configuration
```http
POST /api/androidtv/configuration/deploy
```

**Request Body:**
```json
{
  "templateId": 1,
  "deviceIds": [1, 2, 3],
  "scheduleDeployment": false,
  "deploymentTime": null
}
```

### Status Management (`/api/androidtv/status`)

#### Process Device Heartbeat
```http
POST /api/androidtv/status/heartbeat
```

**Note:** This endpoint allows anonymous access for device heartbeat reporting.

**Request Body:**
```json
{
  "deviceKey": "conf-room-a-001",
  "status": "Online",
  "ipAddress": "192.168.1.100",
  "systemInfo": {
    "cpuUsage": 45.2,
    "memoryUsage": 62.1,
    "diskUsage": 78.3,
    "temperature": 42
  },
  "timestamp": "2025-10-03T10:30:00Z"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Heartbeat processed successfully",
  "nextHeartbeatInterval": 30
}
```

#### Get Device Status
```http
GET /api/androidtv/status/devices/{id}
```

#### Get System Health
```http
GET /api/androidtv/status/system-health
```

**Response:**
```json
{
  "totalDevices": 25,
  "onlineDevices": 23,
  "offlineDevices": 1,
  "maintenanceDevices": 1,
  "activeAlerts": 3,
  "criticalAlerts": 1,
  "lastUpdated": "2025-10-03T10:35:00Z",
  "healthScore": 92
}
```

#### Set Maintenance Mode
```http
POST /api/androidtv/status/devices/{id}/maintenance
```

**Request Body:**
```json
{
  "isEnabled": true,
  "reason": "Scheduled maintenance",
  "duration": "02:00:00",
  "notifyUsers": true
}
```

### Alert Management

#### Get Device Alerts
```http
GET /api/androidtv/status/devices/{id}/alerts
```

**Query Parameters:**
- `severity` (string, optional): Filter by severity (Low, Medium, High, Critical)
- `status` (string, optional): Filter by status (Active, Acknowledged, Resolved)
- `pageNumber` (int, optional): Page number
- `pageSize` (int, optional): Items per page

#### Handle Alert
```http
POST /api/androidtv/status/alerts/{alertId}/handle
```

**Request Body:**
```json
{
  "action": "Acknowledge",
  "note": "Issue acknowledged, investigating",
  "assignTo": "admin@company.com"
}
```

**Actions:**
- `Acknowledge`: Mark alert as acknowledged
- `Resolve`: Mark alert as resolved
- `Escalate`: Escalate to higher priority

## Real-time Events (WebSocket)

Connect to `/ws/notifications` for real-time updates.

### Event Types

#### Device Events
- `device_updated`: Device information changed
- `device_deleted`: Device removed
- `device_status_changed`: Device status updated
- `device_restart_initiated`: Device restart triggered
- `maintenance_mode_changed`: Maintenance mode toggled

#### Configuration Events
- `configuration_template_created`: New template created
- `configuration_template_updated`: Template modified
- `configuration_deployed`: Configuration deployed to devices
- `configuration_backup_created`: Configuration backup created

#### Alert Events
- `device_alert_created`: New alert generated
- `device_alert_handled`: Alert acknowledged/resolved

### Event Format
```json
{
  "type": "device_status_changed",
  "payload": {
    "deviceId": "conf-room-a-001",
    "status": "Online",
    "previousStatus": "Offline",
    "timestamp": "2025-10-03T10:30:00Z"
  },
  "timestamp": "2025-10-03T10:30:00Z"
}
```

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "DEVICE_NOT_FOUND",
    "message": "The specified device was not found",
    "details": {
      "deviceId": 999,
      "timestamp": "2025-10-03T10:30:00Z"
    }
  }
}
```

### HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `204 No Content`: Request successful, no content returned
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict
- `500 Internal Server Error`: Server error

## Rate Limiting

- **General endpoints**: 1000 requests per hour per user
- **Heartbeat endpoint**: 120 requests per minute per device
- **Bulk operations**: 10 requests per minute per user

## SDK and Client Libraries

### cURL Examples

```bash
# Get all devices
curl -H "Authorization: Bearer $TOKEN" \
     "http://localhost:5100/api/androidtv/devices"

# Create a device
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Device","location":"Test Room","deviceKey":"test-001"}' \
     "http://localhost:5100/api/androidtv/devices"

# Process heartbeat
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"deviceKey":"test-001","status":"Online","timestamp":"2025-10-03T10:30:00Z"}' \
     "http://localhost:5100/api/androidtv/status/heartbeat"
```

### JavaScript/TypeScript Client

```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:5100',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get devices
const devices = await client.get('/api/androidtv/devices');

// Create device
const newDevice = await client.post('/api/androidtv/devices', {
  name: 'New Device',
  location: 'Conference Room',
  deviceKey: 'conf-001'
});
```

## Changelog

### Version 1.0.0 (2025-10-03)
- Initial release of Android TV Device Management API
- Device lifecycle management endpoints
- Configuration template system
- Real-time status monitoring
- Alert management system
- WebSocket real-time events
- Comprehensive authentication and authorization