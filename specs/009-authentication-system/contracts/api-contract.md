# Authentication API Contract

## Overview
This contract defines the REST API interface for user and device authentication in the Digital Signage system.

**Base URL**: `https://api.digitalsignage.com`  
**API Version**: v1  
**Content-Type**: `application/json`

## Authentication Endpoints

### 1. User Registration
```http
POST /api/auth/register
```

**Request Body**:
```json
{
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)",
  "fullName": "string (required, max 100 chars)",
  "role": "string (optional, default: User)",
  "phoneNumber": "string (optional)"
}
```

**Response**: `201 Created`
```json
{
  "userId": "integer",
  "email": "string",
  "fullName": "string",
  "role": "string",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors, email already exists
- `500 Internal Server Error`: Server error

### 2. User Login
```http
POST /api/auth/login
```

**Request Body**:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response**: `200 OK`
```json
{
  "accessToken": "string (JWT token)",
  "refreshToken": "string (UUID)",
  "expiresIn": 900,
  "tokenType": "Bearer",
  "user": {
    "userId": "integer",
    "email": "string",
    "fullName": "string",
    "role": "string"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: Invalid email/password
- `423 Locked`: Account locked due to failed attempts
- `500 Internal Server Error`: Server error

### 3. Device Authentication
```http
POST /api/auth/device-login
```

**Request Body**:
```json
{
  "deviceKey": "string (required, UUID format)",
  "deviceInfo": {
    "hardwareId": "string (optional)",
    "ipAddress": "string (optional)",
    "userAgent": "string (optional)"
  }
}
```

**Response**: `200 OK`
```json
{
  "accessToken": "string (JWT token)",
  "expiresIn": 3600,
  "tokenType": "Bearer",
  "device": {
    "deviceId": "integer",
    "deviceKey": "string",
    "name": "string",
    "isActive": true
  }
}
```

### 4. Refresh Token
```http
POST /api/auth/refresh
```

**Request Body**:
```json
{
  "refreshToken": "string (required, UUID format)"
}
```

**Response**: `200 OK`
```json
{
  "accessToken": "string (new JWT token)",
  "refreshToken": "string (new UUID)",
  "expiresIn": 900,
  "tokenType": "Bearer"
}
```

### 5. Logout
```http
POST /api/auth/logout
```

**Headers**: `Authorization: Bearer {accessToken}`

**Request Body**:
```json
{
  "refreshToken": "string (required)"
}
```

**Response**: `204 No Content`

## User Management Endpoints

### 6. Get Current User Profile
```http
GET /api/users/profile
```

**Headers**: `Authorization: Bearer {accessToken}`

**Response**: `200 OK`
```json
{
  "userId": "integer",
  "email": "string",
  "fullName": "string",
  "phoneNumber": "string",
  "role": "string",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "lastLoginAt": "2024-01-20T14:22:33Z"
}
```

### 7. Update User Profile
```http
PUT /api/users/profile
```

**Headers**: `Authorization: Bearer {accessToken}`

**Request Body**:
```json
{
  "fullName": "string (optional, max 100 chars)",
  "phoneNumber": "string (optional)"
}
```

**Response**: `200 OK`
```json
{
  "userId": "integer",
  "email": "string",
  "fullName": "string",
  "phoneNumber": "string",
  "role": "string",
  "isActive": true,
  "updatedAt": "2024-01-20T15:45:00Z"
}
```

### 8. Change Password
```http
POST /api/users/change-password
```

**Headers**: `Authorization: Bearer {accessToken}`

**Request Body**:
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 8 chars)"
}
```

**Response**: `204 No Content`

## Admin Endpoints (Admin Role Required)

### 9. List All Users
```http
GET /api/users?page=1&limit=20&search=email&role=Admin
```

**Headers**: `Authorization: Bearer {accessToken}`

**Query Parameters**:
- `page`: integer (optional, default: 1)
- `limit`: integer (optional, default: 20, max: 100)
- `search`: string (optional, searches email and fullName)
- `role`: string (optional, filters by role)

**Response**: `200 OK`
```json
{
  "users": [
    {
      "userId": "integer",
      "email": "string",
      "fullName": "string",
      "role": "string",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "lastLoginAt": "2024-01-20T14:22:33Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 95,
    "itemsPerPage": 20
  }
}
```

### 10. Deactivate User
```http
POST /api/users/{userId}/deactivate
```

**Headers**: `Authorization: Bearer {accessToken}`

**Response**: `204 No Content`

## Authentication Headers

### For User Endpoints
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### For Device Endpoints
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Error Response Format

All error responses follow this format:

```json
{
  "error": {
    "code": "string (error code)",
    "message": "string (human-readable message)",
    "details": "string (optional, additional context)",
    "timestamp": "2024-01-20T15:45:00Z"
  }
}
```

### Common Error Codes
- `INVALID_CREDENTIALS`: Wrong email/password
- `ACCOUNT_LOCKED`: Too many failed login attempts
- `TOKEN_EXPIRED`: JWT token has expired
- `TOKEN_INVALID`: JWT token is malformed or invalid
- `INSUFFICIENT_PERMISSIONS`: User lacks required role/permissions
- `EMAIL_ALREADY_EXISTS`: Registration with existing email
- `WEAK_PASSWORD`: Password doesn't meet complexity requirements

## Rate Limiting

- **Login Endpoints**: 5 requests per minute per IP
- **Registration**: 3 requests per hour per IP
- **Profile Updates**: 10 requests per minute per user
- **Admin Endpoints**: 100 requests per minute per admin user

Rate limit headers:
```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1642687500
```

## JWT Token Format

### User Token Claims
```json
{
  "sub": "123",
  "email": "user@example.com",
  "role": "Admin",
  "iat": 1642687200,
  "exp": 1642688100,
  "iss": "DigitalSignage.Api",
  "aud": "DigitalSignage.Client"
}
```

### Device Token Claims
```json
{
  "sub": "device:456",
  "deviceKey": "550e8400-e29b-41d4-a716-446655440000",
  "iat": 1642687200,
  "exp": 1642690800,
  "iss": "DigitalSignage.Api",
  "aud": "DigitalSignage.Device"
}
```