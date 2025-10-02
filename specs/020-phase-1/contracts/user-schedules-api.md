# API Contracts: User Schedule Assignment

**Feature**: User Schedule Assignment UI (Phase 1)  
**Date**: 2025-10-02  
**Backend**: Feature 019 APIs (already implemented)

## Overview

This document defines the API contracts for user schedule assignment feature. All endpoints are **already implemented** in the backend (Feature 019). This frontend implementation will consume these existing APIs.

---

## Base Configuration

**Base URL**: `http://localhost:5100` (development)  
**Production URL**: `${NEXT_PUBLIC_API_URL}` (from environment)  
**Authentication**: JWT Bearer token in `Authorization` header  
**Content-Type**: `application/json`

---

## Endpoints

### 1. Get User's Assigned Schedules

**Endpoint**: `GET /api/admin/users/{userId}/schedules`

**Description**: Retrieve all schedules assigned to a specific user

**Authentication**: Required (Admin role)

**Path Parameters**:
```typescript
{
  userId: number // User ID
}
```

**Query Parameters**: None

**Response**: 200 OK
```typescript
{
  userId: number
  userName: string
  schedules: Array<{
    scheduleId: number
    scheduleName: string
    scheduleDescription: string | null
    isActive: boolean
    assignedAt: string // ISO 8601
    assignedBy: string
  }>
  totalCount: number
}
```

**Error Responses**:
- `401 Unauthorized` - No valid JWT token
- `403 Forbidden` - User lacks Admin role
- `404 Not Found` - User ID does not exist
- `500 Internal Server Error` - Server error

**Example**:
```typescript
GET /api/admin/users/123/schedules
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response:
{
  "userId": 123,
  "userName": "john.doe@company.com",
  "schedules": [
    {
      "scheduleId": 45,
      "scheduleName": "Morning News",
      "scheduleDescription": "News content for morning displays",
      "isActive": true,
      "assignedAt": "2025-10-01T10:30:00Z",
      "assignedBy": "admin@company.com"
    },
    {
      "scheduleId": 67,
      "scheduleName": "Afternoon Ads",
      "scheduleDescription": null,
      "isActive": true,
      "assignedAt": "2025-10-01T10:30:00Z",
      "assignedBy": "admin@company.com"
    }
  ],
  "totalCount": 2
}
```

---

### 2. Assign Schedules to User (REPLACE)

**Endpoint**: `POST /api/admin/users/{userId}/schedules`

**Description**: Assign schedules to user with **REPLACE semantics** (removes existing assignments)

**Authentication**: Required (Admin role)

**Path Parameters**:
```typescript
{
  userId: number // User ID
}
```

**Request Body**:
```typescript
{
  scheduleIds: number[] // Array of schedule IDs to assign (replaces ALL existing)
}
```

**Response**: 200 OK
```typescript
{
  userId: number
  assignedScheduleIds: number[]
  previousScheduleIds: number[] // What was replaced
  assignedAt: string // ISO 8601
  assignedBy: string
  message: string
}
```

**Error Responses**:
- `400 Bad Request` - Invalid request body or schedule IDs
- `401 Unauthorized` - No valid JWT token
- `403 Forbidden` - User lacks Admin role
- `404 Not Found` - User or schedule ID(s) not found
- `422 Unprocessable Entity` - Business rule violation (e.g., inactive schedule)
- `500 Internal Server Error` - Server error

**Example**:
```typescript
POST /api/admin/users/123/schedules
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "scheduleIds": [45, 67, 89]
}

Response:
{
  "userId": 123,
  "assignedScheduleIds": [45, 67, 89],
  "previousScheduleIds": [12, 34], // These were replaced
  "assignedAt": "2025-10-02T14:25:00Z",
  "assignedBy": "admin@company.com",
  "message": "Successfully assigned 3 schedules to user"
}
```

---

### 3. Remove All User Schedule Assignments

**Endpoint**: `DELETE /api/admin/users/{userId}/schedules`

**Description**: Remove all schedule assignments from a user

**Authentication**: Required (Admin role)

**Path Parameters**:
```typescript
{
  userId: number // User ID
}
```

**Request Body**: None

**Response**: 204 No Content

**Error Responses**:
- `401 Unauthorized` - No valid JWT token
- `403 Forbidden` - User lacks Admin role
- `404 Not Found` - User ID does not exist
- `500 Internal Server Error` - Server error

**Example**:
```typescript
DELETE /api/admin/users/123/schedules
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response: 204 No Content
```

---

### 4. Get Users Assigned to Schedule

**Endpoint**: `GET /api/admin/schedules/{scheduleId}/users`

**Description**: Retrieve all users who have this schedule assigned (reverse lookup)

**Authentication**: Required (Admin role)

**Path Parameters**:
```typescript
{
  scheduleId: number // Schedule ID
}
```

**Query Parameters**:
```typescript
{
  page?: number      // Page number (default: 0)
  limit?: number     // Items per page (default: 50, max: 100)
  search?: string    // Search by user name or email
}
```

**Response**: 200 OK
```typescript
{
  scheduleId: number
  scheduleName: string
  users: Array<{
    id: number
    name: string
    email: string
    assignedAt: string // ISO 8601
    deviceCount: number
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

**Error Responses**:
- `401 Unauthorized` - No valid JWT token
- `403 Forbidden` - User lacks Admin role
- `404 Not Found` - Schedule ID does not exist
- `500 Internal Server Error` - Server error

**Example**:
```typescript
GET /api/admin/schedules/45/users?page=0&limit=50
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response:
{
  "scheduleId": 45,
  "scheduleName": "Morning News",
  "users": [
    {
      "id": 123,
      "name": "John Doe",
      "email": "john.doe@company.com",
      "assignedAt": "2025-10-01T10:30:00Z",
      "deviceCount": 3
    },
    {
      "id": 456,
      "name": "Jane Smith",
      "email": "jane.smith@company.com",
      "assignedAt": "2025-09-28T15:20:00Z",
      "deviceCount": 2
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 50,
    "total": 2,
    "totalPages": 1
  }
}
```

---

### 5. Set Schedule as Default

**Endpoint**: `PUT /api/admin/schedules/{scheduleId}/default`

**Description**: Mark a schedule as default (fallback content) or remove default flag

**Authentication**: Required (Admin role)

**Path Parameters**:
```typescript
{
  scheduleId: number // Schedule ID
}
```

**Request Body**:
```typescript
{
  isDefault: boolean // true to set as default, false to remove
}
```

**Response**: 200 OK
```typescript
{
  scheduleId: number
  scheduleName: string
  isDefault: boolean
  updatedAt: string // ISO 8601
  updatedBy: string
  message: string
}
```

**Error Responses**:
- `400 Bad Request` - Invalid request body
- `401 Unauthorized` - No valid JWT token
- `403 Forbidden` - User lacks Admin role
- `404 Not Found` - Schedule ID does not exist
- `500 Internal Server Error` - Server error

**Example**:
```typescript
PUT /api/admin/schedules/45/default
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "isDefault": true
}

Response:
{
  "scheduleId": 45,
  "scheduleName": "Morning News",
  "isDefault": true,
  "updatedAt": "2025-10-02T14:30:00Z",
  "updatedBy": "admin@company.com",
  "message": "Schedule marked as default"
}
```

---

### 6. Get Schedules (for Selector)

**Endpoint**: `GET /api/admin/schedules`

**Description**: Get list of schedules for assignment selector

**Authentication**: Required (Admin role)

**Query Parameters**:
```typescript
{
  page?: number           // Page number (default: 0)
  limit?: number          // Items per page (default: 50, max: 100)
  search?: string         // Search by name or description
  isActive?: boolean      // Filter by active status
  isDefault?: boolean     // Filter by default flag
  sortBy?: string         // Sort field (name, createdAt, assignedUsersCount)
  sortOrder?: 'asc' | 'desc'  // Sort direction
}
```

**Response**: 200 OK
```typescript
{
  schedules: Array<{
    id: number
    name: string
    description: string | null
    isActive: boolean
    isDefault: boolean
    assignedUsersCount: number
    startDate: string
    endDate: string | null
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

**Example**:
```typescript
GET /api/admin/schedules?isActive=true&sortBy=name&sortOrder=asc
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response:
{
  "schedules": [
    {
      "id": 45,
      "name": "Afternoon Ads",
      "description": "Promotional content",
      "isActive": true,
      "isDefault": false,
      "assignedUsersCount": 15,
      "startDate": "2025-10-01",
      "endDate": null
    },
    {
      "id": 67,
      "name": "Morning News",
      "description": null,
      "isActive": true,
      "isDefault": true,
      "assignedUsersCount": 8,
      "startDate": "2025-09-15",
      "endDate": "2025-12-31"
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 50,
    "total": 2,
    "totalPages": 1
  }
}
```

---

## Error Response Format

All error responses follow this standard format:

```typescript
{
  statusCode: number      // HTTP status code
  message: string         // Human-readable error message
  errors?: Array<{        // Optional validation errors
    field: string
    message: string
  }>
  timestamp: string       // ISO 8601
  path: string           // API endpoint path
}
```

**Example**:
```json
{
  "statusCode": 422,
  "message": "Validation failed",
  "errors": [
    {
      "field": "scheduleIds",
      "message": "Cannot assign inactive schedules"
    }
  ],
  "timestamp": "2025-10-02T14:35:00Z",
  "path": "/api/admin/users/123/schedules"
}
```

---

## Rate Limiting

**Limits**: 
- 100 requests per minute per user
- 429 Too Many Requests response if exceeded

**Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696255800
```

---

## CORS Configuration

**Allowed Origins**: 
- `http://localhost:3000` (development)
- `${FRONTEND_URL}` (production - from environment)

**Allowed Methods**: `GET, POST, PUT, DELETE, OPTIONS`

**Allowed Headers**: `Authorization, Content-Type`

---

## Testing Endpoints

### Contract Test Checklist

Each endpoint requires contract tests verifying:

1. ✅ **Request Schema Validation**
   - Valid requests accepted
   - Invalid requests rejected with 400
   
2. ✅ **Response Schema Validation**
   - Response matches documented schema
   - All required fields present
   
3. ✅ **Authentication Validation**
   - Unauthorized requests return 401
   - Non-admin requests return 403
   
4. ✅ **Error Handling**
   - Not found returns 404
   - Validation errors return 422
   - Server errors return 500

5. ✅ **Business Rules**
   - REPLACE semantics enforced
   - Inactive schedules rejected
   - Maximum limits respected

---

## Integration Test Scenarios

### Scenario 1: Assign Schedules with Replace Warning

```typescript
// Test: User with existing assignments
describe('POST /api/admin/users/{userId}/schedules - Replace', () => {
  it('should replace existing assignments', async () => {
    // Given: User has schedules [12, 34]
    await assignSchedules(userId, [12, 34])
    
    // When: Assign new schedules [45, 67]
    const response = await POST(`/api/admin/users/${userId}/schedules`, {
      scheduleIds: [45, 67]
    })
    
    // Then: Previous assignments replaced
    expect(response.status).toBe(200)
    expect(response.data.assignedScheduleIds).toEqual([45, 67])
    expect(response.data.previousScheduleIds).toEqual([12, 34])
    
    // And: Only new schedules remain
    const current = await GET(`/api/admin/users/${userId}/schedules`)
    expect(current.data.schedules).toHaveLength(2)
    expect(current.data.schedules.map(s => s.scheduleId)).toEqual([45, 67])
  })
})
```

### Scenario 2: View Users for Schedule

```typescript
describe('GET /api/admin/schedules/{scheduleId}/users', () => {
  it('should return all assigned users', async () => {
    // Given: Schedule assigned to 2 users
    await assignSchedules(user1Id, [scheduleId])
    await assignSchedules(user2Id, [scheduleId])
    
    // When: Get users for schedule
    const response = await GET(`/api/admin/schedules/${scheduleId}/users`)
    
    // Then: Both users returned
    expect(response.status).toBe(200)
    expect(response.data.users).toHaveLength(2)
    expect(response.data.users.map(u => u.id)).toContain(user1Id)
    expect(response.data.users.map(u => u.id)).toContain(user2Id)
  })
})
```

### Scenario 3: Set Default Schedule

```typescript
describe('PUT /api/admin/schedules/{scheduleId}/default', () => {
  it('should mark schedule as default', async () => {
    // Given: Schedule is not default
    const schedule = await GET(`/api/admin/schedules/${scheduleId}`)
    expect(schedule.data.isDefault).toBe(false)
    
    // When: Set as default
    const response = await PUT(`/api/admin/schedules/${scheduleId}/default`, {
      isDefault: true
    })
    
    // Then: Schedule is now default
    expect(response.status).toBe(200)
    expect(response.data.isDefault).toBe(true)
    
    // And: Default flag persisted
    const updated = await GET(`/api/admin/schedules/${scheduleId}`)
    expect(updated.data.isDefault).toBe(true)
  })
})
```

---

## Client Implementation Reference

### Axios Client Setup

```typescript
// lib/api.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5100',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Auth interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Error interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### Service Layer Example

```typescript
// features/users/services/userScheduleService.ts
import { apiClient } from '@/lib/api'
import type { 
  UserSchedule, 
  AssignSchedulesRequest,
  AssignSchedulesResponse 
} from '../types'

export const userScheduleService = {
  getUserSchedules: async (userId: number): Promise<UserSchedule[]> => {
    const response = await apiClient.get(`/api/admin/users/${userId}/schedules`)
    return response.data.schedules
  },

  assignSchedules: async (
    userId: number, 
    scheduleIds: number[]
  ): Promise<AssignSchedulesResponse> => {
    const response = await apiClient.post(
      `/api/admin/users/${userId}/schedules`,
      { scheduleIds }
    )
    return response.data
  },

  removeAllSchedules: async (userId: number): Promise<void> => {
    await apiClient.delete(`/api/admin/users/${userId}/schedules`)
  },
}
```

---

## Summary

**Total Endpoints**: 6 (all already implemented in backend)

**Key Endpoints**:
1. Get user schedules (list view)
2. Assign schedules with REPLACE (mutation)
3. Remove all assignments (mutation)
4. Get users for schedule (reverse lookup)
5. Set default schedule (toggle mutation)
6. Get schedules for selector (filtered list)

**Authentication**: JWT Bearer required for all endpoints

**Status**: ✅ All backend APIs ready - Frontend integration only

**Next**: Create component contracts document
