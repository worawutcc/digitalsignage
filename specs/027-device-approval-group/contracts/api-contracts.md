# API Contracts: Device Approval + Group Management Enhancement

**Feature**: Device Approval + Group Management Enhancement  
**Date**: 2025-01-27  
**API Version**: v1  
**Integration**: Extends      "name": "Marketing Displays",
      "description": "Displays for marketing content in lobby areas",
      "isActive": true,
      "parentGroupId": null,
      "createdByUserId": 5,
      "createdAt": "2025-01-20T09:00:00Z",
      "updatedAt": "2025-01-27T10:30:00Z",
      "deviceCount": 1,
      "childGroups": [],
      "devices": [
        {
          "id": 42,
          "name": "Reception Display Main",
          "deviceGroupId": 1,
          "status": "Registered"
        }
      ]DeviceRegistrationController and DeviceGroup management

## Enhanced Device Approval API Contracts

### 1. Get Pending Device Registrations (Enhanced)

**Endpoint**: `GET /api/v1/admin/device-registration/pending`  
**Purpose**: Enhanced existing endpoint with improved filtering and bulk selection support  
**Extends**: Existing AdminDeviceRegistrationController.GetPendingRegistrations()

**Request Headers**:
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Query Parameters**:
```
?page=1&pageSize=20&search=samsung&deviceModel=TV&status=Pending
```

**Response 200 OK** (Enhanced with existing DeviceRegistrationRequest fields):
```json
{
  "registrations": [
    {
      "id": 42,
      "registrationId": "550e8400-e29b-41d4-a716-446655440000",
      "macAddress": "00:1B:44:11:3A:B7",
      "deviceModel": "Android TV Box",
      "manufacturer": "Samsung",
      "pin": "A1B2C3",
      "status": "Pending",
      "createdAt": "2025-01-27T10:30:00Z",
      "expiresAt": "2025-01-27T11:00:00Z",
      "matchedUserId": 123,
      "matchedUser": {
        "id": 123,
        "email": "john.doe@company.com",
        "displayName": "John Doe"
      },
      "existingApproval": null
    }
  ],
  "totalCount": 5,
  "hasMore": false
}
```

### 2. Approve Device Registration (Enhanced)

**Endpoint**: `POST /api/v1/admin/device-registration/{id}/approve`  
**Purpose**: Enhanced existing approval endpoint with streamlined group assignment  
**Extends**: Existing AdminDeviceRegistrationController.ApproveDevice()

**Request Headers**:
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Path Parameters**:
```
id: integer (DeviceRegistrationRequest.Id)
```

**Request Body** (Uses existing DeviceApproval fields):
```json
{
  "deviceName": "Reception Display Main",
  "location": "Building A - Main Lobby", 
  "deviceGroupId": 1,
  "initialScheduleId": 5,
  "notes": "Approved for lobby deployment"
}
```

**Response 200 OK** (Uses existing DeviceApproval response):
```json
{
  "success": true,
  "deviceId": 42,
  "deviceKey": "dev_a1b2c3d4e5f6...",
  "approvalId": 15,
  "status": "Approved",
  "approvedAt": "2025-01-27T10:35:00Z",
  "message": "Device registration approved successfully"
}
```

### 3. Reject Device Registration (Enhanced)

**Endpoint**: `POST /api/v1/admin/device-registration/{id}/reject`  
**Purpose**: Enhanced existing rejection with improved validation  
**Extends**: Existing AdminDeviceRegistrationController.RejectDevice()

**Path Parameters**:
```
id: integer (DeviceRegistrationRequest.Id)
```

**Request Body** (Uses existing DeviceApproval fields):
```json
{
  "reason": "Device not compatible with corporate security policy",
  "notes": "Requires upgraded firmware version"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "status": "Rejected",
  "rejectedAt": "2025-01-27T10:40:00Z",
  "message": "Device registration rejected: Device not compatible with corporate security policy"
}
```

### 4. Bulk Approve Devices (New Feature)

**Endpoint**: `POST /api/v1/admin/device-registration/bulk-approve`  
**Purpose**: New bulk approval capability extending existing approval workflow  
**Integration**: Creates multiple DeviceApproval records in single transaction

**Request Body**:
```json
{
  "registrationIds": [42, 43, 44],
  "defaultDeviceGroupId": 2,
  "defaultLocation": "Conference Floor",
  "notes": "Bulk approved for conference room deployment"
} 
      "pin": "D4E5F6",
      "location": "Conference Room B",
      "deviceGroupId": 2,
      "notes": "Conference room deployment"
    }
  ]
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "successCount": 2,
  "failureCount": 0,
  "totalCount": 2,
  "results": [
    {
      "registrationId": 42,
      "success": true,
      "deviceId": 101,
      "deviceKey": "dev_a1b2c3d4e5f6...",
      "status": "Approved",
      "deviceName": "Conference Room A Display"
    },
    {
      "registrationId": 43,
      "success": true,
      "deviceId": 102,
      "deviceKey": "dev_b2c3d4e5f6g7...", 
      "status": "Approved",
      "deviceName": "Conference Room B Display"
    }
  ],
  "processedAt": "2025-01-27T10:45:00Z",
  "processedByUserId": 5
}
```

## Enhanced Device Group Management API Contracts

### 5. Get All Device Groups (Enhanced)

**Endpoint**: `GET /api/v1/admin/device-groups`  
**Purpose**: Enhanced existing DeviceGroup queries with hierarchical structure support  
**Integration**: Uses existing DeviceGroup entity with ParentGroupId relationships

**Query Parameters**:
- `includeInactive=false` (optional): Include IsActive=false groups
- `includeHierarchy=true` (optional): Include parent/child relationships  
- `includeDevices=false` (optional): Include Device.DeviceGroupId relationships

**Response 200 OK** (Uses existing DeviceGroup structure):
```json
{
  "groups": [
    {
      "id": 1,
      "name": "Lobby Displays",
      "description": "All displays in building lobby areas",
      "deviceCount": 3,
      "isActive": true,
      "createdAt": "2025-01-20T09:00:00Z",
      "updatedAt": "2025-01-27T10:30:00Z",
      "devices": [
        {
          "id": 42,
          "name": "Reception Display Main",
          "macAddress": "00:1B:44:11:3A:B7",
          "status": "Online",
          "lastHeartbeat": "2025-01-27T10:45:00Z"
        }
      ]
    }
  ],
  "totalCount": 5
}
```

### 6. Create Device Group (Enhanced)

**Endpoint**: `POST /api/v1/admin/device-groups`  
**Purpose**: Enhanced existing DeviceGroup creation with hierarchy support  
**Integration**: Uses existing DeviceGroup entity creation workflow

**Request Body** (Uses existing DeviceGroup fields):
```json
{
  "name": "Conference Room Displays",
  "description": "Digital signage displays in all conference rooms",
  "parentGroupId": null
}
```

**Response 201 Created**:
```json
{
  "id": 6,
  "name": "Conference Room Displays", 
  "description": "Digital signage displays in all conference rooms",
  "parentGroupId": null,
  "isActive": true,
  "createdByUserId": 5,
  "deviceCount": 0,
  "createdAt": "2025-01-27T10:50:00Z",
  "updatedAt": "2025-01-27T10:50:00Z"
}
```

### 7. Update Device Group

**Endpoint**: `PUT /api/v1/admin/device-groups/{id}`  
**Purpose**: Update device group name and description

**Request Headers**:
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Conference & Meeting Room Displays",
  "description": "Digital signage displays in conference rooms and meeting spaces"
}
```

**Response 200 OK**:
```json
{
  "id": 6,
  "name": "Conference & Meeting Room Displays", 
  "description": "Digital signage displays in conference rooms and meeting spaces",
  "deviceCount": 2,
  "isActive": true,
  "createdAt": "2025-01-27T10:50:00Z",
  "updatedAt": "2025-01-27T11:00:00Z"
}
```

### 8. Delete Device Group

**Endpoint**: `DELETE /api/v1/admin/device-groups/{id}`  
**Purpose**: Delete an empty device group

**Request Headers**:
```
Authorization: Bearer {jwt_token}
```

**Response 204 No Content**: (Empty body)

**Response 400 Bad Request**:
```json
{
  "error": "Cannot delete group with assigned devices",
  "details": "Group has 3 active devices. Remove all devices before deletion."
}
```

### 9. Assign Device to Group

**Endpoint**: `POST /api/v1/admin/device-groups/{groupId}/devices/{deviceId}`  
**Purpose**: Assign a device to a device group

**Request Headers**:
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "notes": "Added for Q1 marketing campaign content"
}
```

**Response 200 OK**:
```json
{
  "deviceGroupId": 1,
  "deviceId": 42,
  "assignedAt": "2025-01-27T11:00:00Z",
  "assignedBy": "admin@company.com",
  "status": "Assigned"
}
```

### 10. Remove Device from Group

**Endpoint**: `DELETE /api/v1/admin/device-groups/{groupId}/devices/{deviceId}`  
**Purpose**: Remove a device from a device group

**Request Headers**:
```
Authorization: Bearer {jwt_token}
```

**Response 204 No Content**: (Empty body)

### 11. Bulk Assign Devices to Group

**Endpoint**: `POST /api/v1/admin/device-groups/{groupId}/devices/bulk-assign`  
**Purpose**: Assign multiple devices to a group in a single operation

**Request Headers**:
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "deviceIds": [42, 43, 44],
  "notes": "Bulk assignment for marketing content rollout"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "successCount": 3,
  "failureCount": 0,
  "totalCount": 3,
  "results": [
    {
      "deviceId": 42,
      "success": true,
      "message": "Device assigned successfully"
    },
    {
      "deviceId": 43,
      "success": true,
      "message": "Device assigned successfully"
    },
    {
      "deviceId": 44,
      "success": true,
      "message": "Device assigned successfully"
    }
  ],
  "processedAt": "2025-01-27T11:05:00Z"
}
```

## Content Assignment API Contracts

### 12. Assign Content to Group

**Endpoint**: `POST /api/v1/admin/device-groups/{groupId}/content`  
**Purpose**: Assign media or schedule content to a device group

**Request Headers**:
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "contentType": "Media",
  "contentId": 15,
  "priority": 5,
  "notes": "Q1 marketing campaign content"
}
```

**Response 200 OK**:
```json
{
  "id": 100,
  "deviceGroupId": 1,
  "contentType": "Media",
  "contentId": 15,
  "priority": 5,
  "assignedAt": "2025-01-27T11:10:00Z",
  "assignedBy": "admin@company.com",
  "isActive": true
}
```

### 13. Get Group Content Assignments

**Endpoint**: `GET /api/v1/admin/device-groups/{groupId}/content`  
**Purpose**: Retrieve all content assignments for a device group

**Request Headers**:
```
Authorization: Bearer {jwt_token}
```

**Response 200 OK**:
```json
{
  "assignments": [
    {
      "id": 100,
      "contentType": "Media",
      "contentId": 15,
      "contentTitle": "Q1 Marketing Banner",
      "priority": 5,
      "assignedAt": "2025-01-27T11:10:00Z",
      "assignedBy": "admin@company.com",
      "isActive": true
    },
    {
      "id": 101,
      "contentType": "Schedule",
      "contentId": 8,
      "contentTitle": "Morning Announcements",
      "priority": 8,
      "assignedAt": "2025-01-26T14:30:00Z",
      "assignedBy": "admin@company.com",
      "isActive": true
    }
  ],
  "totalCount": 2
}
```

## Error Response Contracts

### Standard Error Response

**Response 400/401/403/404/500**:
```json
{
  "error": "Error type description",
  "message": "Detailed error message",
  "details": "Additional context or validation errors",
  "timestamp": "2025-01-27T11:15:00Z",
  "path": "/api/v1/admin/device-registration/approve"
}
```

### Validation Error Response

**Response 400 Bad Request**:
```json
{
  "error": "Validation failed",
  "message": "One or more validation errors occurred",
  "details": {
    "deviceName": ["Device name is required"],
    "pin": ["PIN must be exactly 6 characters"]
  },
  "timestamp": "2025-01-27T11:15:00Z",
  "path": "/api/v1/admin/device-registration/approve"
}
```

## WebSocket Real-time Events

### Device Registration Events

**Event**: `device-registration-created`
```json
{
  "event": "device-registration-created",
  "data": {
    "registrationId": "550e8400-e29b-41d4-a716-446655440000",
    "macAddress": "00:1B:44:11:3A:B7",
    "deviceModel": "Android TV Box",
    "requestedAt": "2025-01-27T10:30:00Z"
  }
}
```

**Event**: `device-registration-approved`
```json
{
  "event": "device-registration-approved", 
  "data": {
    "registrationId": "550e8400-e29b-41d4-a716-446655440000",
    "deviceId": 42,
    "approvedBy": "admin@company.com",
    "approvedAt": "2025-01-27T11:00:00Z"
  }
}
```

**Event**: `device-group-membership-changed`
```json
{
  "event": "device-group-membership-changed",
  "data": {
    "deviceId": 42,
    "deviceGroupId": 1,
    "action": "assigned",
    "assignedBy": "admin@company.com",
    "assignedAt": "2025-01-27T11:05:00Z"
  }
}
```

**Contract Status**: Complete - Ready for test generation