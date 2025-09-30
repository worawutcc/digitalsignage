# QR Code Registration System API

## Overview

The QR Code Registration System provides a streamlined workflow for Android TV devices to self-register with the Digital Signage system using QR codes. This system enables enterprise deployment scenarios where devices can be pre-configured and approved through a PIN-based workflow.

## Architecture

```
Android TV Device → QR Code Scan → Registration Request → Admin Approval → Device Provisioned
```

## API Endpoints

### 1. Initiate QR Code Registration

**Endpoint:** `POST /api/device-registration/initiate-qr`

**Description:** Initiates the QR code registration process for a device.

**Request Body:**
```json
{
  "macAddress": "aa:bb:cc:dd:ee:ff",
  "deviceModel": "NVIDIA Shield TV",
  "manufacturer": "NVIDIA",
  "androidVersion": "11.0",
  "ipAddress": "192.168.1.100"
}
```

**Response (200 OK):**
```json
{
  "registrationId": "123e4567-e89b-12d3-a456-426614174000",
  "qrCodeData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "expiresAt": "2024-01-15T10:30:00Z",
  "message": "QR code generated successfully. Code expires in 10 minutes."
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Device already registered
- `500 Internal Server Error`: Server error

### 2. Approve QR Code Registration

**Endpoint:** `POST /api/device-registration/approve-qr`

**Description:** Approves a QR code registration request (Admin only).

**Authentication:** Required - JWT Bearer token with Admin role

**Request Body:**
```json
{
  "registrationId": "123e4567-e89b-12d3-a456-426614174000",
  "approved": true,
  "comments": "Approved for conference room display"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Device registration approved successfully",
  "deviceId": "456e7890-e89b-12d3-a456-426614174111"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid registration ID or request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions (Admin role required)
- `404 Not Found`: Registration request not found
- `410 Gone`: Registration request expired
- `500 Internal Server Error`: Server error

### 3. Get Registration Status

**Endpoint:** `GET /api/device-registration/{registrationId}/status`

**Description:** Gets the current status of a registration request.

**Response (200 OK):**
```json
{
  "registrationId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "Pending",
  "createdAt": "2024-01-15T10:20:00Z",
  "expiresAt": "2024-01-15T10:30:00Z",
  "deviceInfo": {
    "macAddress": "aa:bb:cc:dd:ee:ff",
    "model": "NVIDIA Shield TV",
    "manufacturer": "NVIDIA",
    "androidVersion": "11.0",
    "ipAddress": "192.168.1.100"
  },
  "approvalInfo": null
}
```

**Status Values:**
- `Pending`: Waiting for admin approval
- `Approved`: Registration approved, device can proceed
- `Rejected`: Registration rejected by admin
- `Expired`: Registration request expired

**Error Responses:**
- `404 Not Found`: Registration ID not found
- `500 Internal Server Error`: Server error

## QR Code Data Format

The QR code contains JSON data with the following structure:

```json
{
  "registrationId": "123e4567-e89b-12d3-a456-426614174000",
  "deviceInfo": {
    "macAddress": "aa:bb:cc:dd:ee:ff",
    "model": "NVIDIA Shield TV",
    "manufacturer": "NVIDIA",
    "androidVersion": "11.0",
    "ipAddress": "192.168.1.100"
  },
  "expiresAt": "2024-01-15T10:30:00Z",
  "apiEndpoint": "http://172.31.20.11:8089",
  "validationToken": "base64-encoded-security-token"
}
```

## Configuration

### QR Code Settings

```json
{
  "QrCode": {
    "ExpirationMinutes": "15",
    "ImageSize": "300",
    "ErrorCorrectionLevel": "M"
  }
}
```

### Device Registration Settings

```json
{
  "DeviceRegistration": {
    "SelfRegistrationEnabled": true,
    "RequireAdminApproval": true,
    "PinExpiryMinutes": 10,
    "QrCodeExpiryMinutes": 15,
    "MaxPendingDevices": 50
  }
}
```

## Security Features

### Authentication & Authorization
- **Admin Approval**: QR code approval requires Admin role
- **JWT Bearer Authentication**: Secure token-based authentication
- **Validation Tokens**: Each QR code includes a cryptographically secure validation token

### Data Validation
- **Input Validation**: All requests validated using Data Annotations
- **MAC Address Format**: Validated against standard MAC address patterns
- **Expiration Checks**: QR codes automatically expire after configured time
- **Device Uniqueness**: Prevents duplicate registrations

### Audit Logging
- All registration activities are logged
- Admin approval/rejection actions tracked
- Security events logged for monitoring

## Error Handling

### Common Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed",
    "details": {
      "macAddress": ["MAC address format is invalid"]
    }
  }
}
```

### Error Codes
- `VALIDATION_FAILED`: Input validation errors
- `DEVICE_ALREADY_REGISTERED`: Device with MAC address already exists
- `REGISTRATION_EXPIRED`: QR code registration expired
- `REGISTRATION_NOT_FOUND`: Registration ID not found
- `UNAUTHORIZED_ACCESS`: Authentication required
- `INSUFFICIENT_PERMISSIONS`: Admin role required

## Usage Examples

### 1. Device Self-Registration Flow

```bash
# 1. Device initiates QR registration
curl -X POST http://172.31.20.11:8089/api/device-registration/initiate-qr \
  -H "Content-Type: application/json" \
  -d '{
    "macAddress": "aa:bb:cc:dd:ee:ff",
    "deviceModel": "NVIDIA Shield TV",
    "manufacturer": "NVIDIA",
    "androidVersion": "11.0",
    "ipAddress": "192.168.1.100"
  }'

# 2. Admin approves registration
curl -X POST http://172.31.20.11:8089/api/device-registration/approve-qr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "registrationId": "123e4567-e89b-12d3-a456-426614174000",
    "approved": true,
    "comments": "Approved for conference room display"
  }'

# 3. Device checks status
curl -X GET http://172.31.20.11:8089/api/device-registration/123e4567-e89b-12d3-a456-426614174000/status
```

### 2. Admin Dashboard Integration

```javascript
// Get pending registrations
const pendingRegistrations = await fetch('/api/device-registration/pending')
  .then(response => response.json());

// Approve registration
const approveRegistration = async (registrationId, comments) => {
  const response = await fetch('/api/device-registration/approve-qr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      registrationId,
      approved: true,
      comments
    })
  });
  
  return response.json();
};
```

## Performance Considerations

### QR Code Generation
- QR codes are generated server-side for security
- Image data returned as base64 data URIs
- Default image size: 300x300 pixels
- Error correction level: M (Medium, ~15% recovery)

### Caching Strategy
- QR code data cached during validity period
- Registration status cached for quick lookups
- Device info cached to prevent duplicate registrations

### Rate Limiting
- Registration requests limited per IP address
- Admin approval actions logged and monitored
- Expired registrations automatically cleaned up

## Monitoring & Logging

### Key Metrics
- QR code generation success rate
- Registration approval/rejection ratios
- Average time from registration to approval
- Expired registration cleanup frequency

### Log Levels
- **Debug**: QR code generation details, validation steps
- **Information**: Registration lifecycle events, approvals
- **Warning**: Expired registrations, validation failures  
- **Error**: System errors, security violations

### Health Checks
- QR code generation service health
- Database connectivity for registrations  
- Configuration validation
- External service dependencies