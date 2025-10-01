# Quick Start Guide: QR Code Device Registration

**Feature**: QR Code system to replace PIN-based device registration  
**Date**: 2025-09-30  
**Audience**: Developers, QA Engineers, Product Managers

## Overview

This guide demonstrates the complete QR Code device registration workflow from Android TV device initiation to admin approval. Follow these steps to validate the feature works end-to-end.

## Prerequisites

### Environment Setup
- .NET 8 SDK installed
- PostgreSQL database running
- Digital Signage API server running on `https://localhost:5001`
- Admin user account with JWT authentication
- QR code scanner app (or camera app with QR support)

### Test Data
```bash
# Test device information
MAC_ADDRESS="AA:BB:CC:DD:EE:FF"
DEVICE_MODEL="Samsung QN65Q70AAFXZA"
MANUFACTURER="Samsung"
ANDROID_VERSION="11.0"
APP_VERSION="1.2.3"
ADMIN_USER_ID=42
```

## Step 1: Device Initiates QR Registration

### API Call
```bash
curl -X POST "https://localhost:5001/api/device-registration/initiate-qr" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: device-api-key-here" \
  -d '{
    "macAddress": "AA:BB:CC:DD:EE:FF",
    "deviceModel": "Samsung QN65Q70AAFXZA", 
    "manufacturer": "Samsung",
    "androidVersion": "11.0",
    "appVersion": "1.2.3",
    "ipAddress": "192.168.1.100",
    "networkName": "Corporate-WiFi",
    "preferredMethod": 2
  }'
```

### Expected Response
```json
{
  "registrationId": "123e4567-e89b-12d3-a456-426614174000",
  "qrCodeImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "qrCodeData": "{\"registrationId\":\"123e4567-e89b-12d3-a456-426614174000\",\"deviceInfo\":{\"macAddress\":\"AA:BB:CC:DD:EE:FF\",\"model\":\"Samsung QN65Q70AAFXZA\",\"manufacturer\":\"Samsung\",\"androidVersion\":\"11.0\"},\"expiresAt\":\"2025-09-30T16:15:00Z\",\"apiEndpoint\":\"https://localhost:5001/api/device-registration/approve-qr\"}",
  "method": 2,
  "status": 1,
  "expiresAt": "2025-09-30T16:15:00Z",
  "message": "Scan QR code with admin app to approve device"
}
```

### Validation Checklist
- [ ] HTTP 200 OK response received
- [ ] `registrationId` is valid UUID format
- [ ] `qrCodeImage` starts with "data:image/png;base64,"
- [ ] `qrCodeData` contains valid JSON with expected structure
- [ ] `method` equals 2 (QrCode)
- [ ] `status` equals 1 (Pending)
- [ ] `expiresAt` is 15 minutes from now
- [ ] `message` contains user-friendly instruction

## Step 2: Display QR Code on Android TV

### Simulate TV Display
Save the Base64 QR code image to verify it's readable:

```bash
# Extract base64 data (remove data:image/png;base64, prefix)
echo "iVBORw0KGgoAAAANSUhEUgAA..." | base64 -d > qr_code.png

# Open image to verify readability
open qr_code.png  # macOS
# or
xdg-open qr_code.png  # Linux
```

### QR Code Content Validation
Scan the QR code with any scanner and verify it contains:
```json
{
  "registrationId": "123e4567-e89b-12d3-a456-426614174000",
  "deviceInfo": {
    "macAddress": "AA:BB:CC:DD:EE:FF",
    "model": "Samsung QN65Q70AAFXZA",
    "manufacturer": "Samsung",
    "androidVersion": "11.0"
  },
  "expiresAt": "2025-09-30T16:15:00Z",
  "apiEndpoint": "https://localhost:5001/api/device-registration/approve-qr"
}
```

### Validation Checklist
- [ ] QR code image displays clearly
- [ ] QR code is scannable with mobile camera
- [ ] Decoded JSON matches expected structure
- [ ] API endpoint URL is correct
- [ ] Expiration time is reasonable (15 minutes)

## Step 3: Admin Scans QR Code

### Get Admin JWT Token
```bash
# Login as admin user
curl -X POST "https://localhost:5001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@digitalsignage.com",
    "password": "AdminPassword123!"
  }'

# Extract JWT token from response
JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Mobile App Simulation
In a real mobile app, scanning the QR code would:
1. Decode the JSON payload
2. Extract `registrationId` and device information
3. Auto-populate the approval form
4. Display device details for admin review

### Validation Checklist
- [ ] QR code scans successfully on mobile device
- [ ] JSON payload decodes without errors
- [ ] Device information is clearly readable
- [ ] Registration ID is captured correctly

## Step 4: Admin Approves Registration

### API Call
```bash
curl -X POST "https://localhost:5001/api/device-registration/approve-qr" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "registrationId": "123e4567-e89b-12d3-a456-426614174000",
    "adminUserId": 42,
    "deviceGroupId": 5,
    "customDeviceName": "Lobby Display 1",
    "adminNotes": "Approved during quick start validation"
  }'
```

### Expected Response
```json
{
  "isSuccess": true,
  "deviceId": 123,
  "deviceKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VJZCI6IjEyMyIsIm1hY0FkZHJlc3MiOiJBQTpCQjpDQzpERDpFRTpGRiIsImlhdCI6MTY5NTY3ODkwMCwiZXhwIjoxNzI3MjE0OTAwfQ.signature",
  "status": 2,
  "message": "Device successfully registered and approved",
  "approvedAt": "2025-09-30T15:45:30Z",
  "approvedByAdmin": "Admin User"
}
```

### Validation Checklist
- [ ] HTTP 200 OK response received
- [ ] `isSuccess` is true
- [ ] `deviceId` is positive integer
- [ ] `deviceKey` is valid JWT format
- [ ] `status` equals 2 (Approved)
- [ ] `approvedAt` timestamp is recent
- [ ] `approvedByAdmin` shows admin user name

## Step 5: Device Receives Approval

### Status Polling (Device Side)
```bash
curl -X GET "https://localhost:5001/api/device-registration/123e4567-e89b-12d3-a456-426614174000/status" \
  -H "X-API-Key: device-api-key-here"
```

### Expected Response
```json
{
  "registrationId": "123e4567-e89b-12d3-a456-426614174000",
  "status": 2,
  "isApproved": true,
  "deviceId": 123,
  "deviceKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "deviceName": "Lobby Display 1",
  "message": "Registration approved. Device is now active.",
  "approvedAt": "2025-09-30T15:45:30Z"
}
```

### Validation Checklist
- [ ] Status shows approved (2)
- [ ] Device receives authentication key
- [ ] Device ID is assigned
- [ ] Custom device name is applied
- [ ] Approval timestamp is correct

## Step 6: Verify Database State

### Check Registration Record
```sql
SELECT 
    Id,
    MacAddress,
    Method,
    Status,
    QrCodeData IS NOT NULL as HasQrCode,
    ExpiresAt,
    CreatedAt,
    UpdatedAt
FROM DeviceRegistrationRequest 
WHERE MacAddress = 'AA:BB:CC:DD:EE:FF';
```

### Check Device Record
```sql
SELECT 
    Id,
    Name,
    MacAddress,
    IsActive,
    DeviceGroupId,
    CreatedAt
FROM Device 
WHERE MacAddress = 'AA:BB:CC:DD:EE:FF';
```

### Check Audit Trail
```sql
SELECT 
    Action,
    Details,
    CreatedBy,
    CreatedAt
FROM RegistrationAuditLog 
WHERE DeviceRegistrationRequestId = (
    SELECT Id FROM DeviceRegistrationRequest 
    WHERE MacAddress = 'AA:BB:CC:DD:EE:FF'
)
ORDER BY CreatedAt;
```

### Validation Checklist
- [ ] Registration record shows Method = 2 (QrCode)
- [ ] Registration record shows Status = 2 (Approved)
- [ ] Device record is created with correct details
- [ ] Audit trail captures all registration events
- [ ] QR code data is stored properly

## Step 7: Performance Validation

### QR Code Generation Time
```bash
time curl -X POST "https://localhost:5001/api/device-registration/initiate-qr" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: device-api-key-here" \
  -d '{
    "macAddress": "BB:CC:DD:EE:FF:AA",
    "deviceModel": "Performance Test TV",
    "manufacturer": "TestCorp",
    "androidVersion": "11.0",
    "appVersion": "1.2.3"
  }'
```

### Approval Response Time
```bash
time curl -X POST "https://localhost:5001/api/device-registration/approve-qr" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "registrationId": "generated-from-previous-step",
    "adminUserId": 42
  }'
```

### Performance Targets
- [ ] QR generation completes in <2 seconds
- [ ] Approval processing completes in <1 second
- [ ] Database queries execute in <100ms
- [ ] QR code image size is <50KB

## Step 8: Error Scenarios

### Test Duplicate Registration
```bash
# Try to register same MAC address again
curl -X POST "https://localhost:5001/api/device-registration/initiate-qr" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: device-api-key-here" \
  -d '{
    "macAddress": "AA:BB:CC:DD:EE:FF",
    "deviceModel": "Duplicate TV",
    "manufacturer": "TestCorp",
    "androidVersion": "11.0",
    "appVersion": "1.2.3"
  }'
```

Expected: HTTP 409 Conflict

### Test Expired QR Code
```bash
# Wait 15+ minutes or manually set past expiration in database
# Then try to approve expired registration
curl -X POST "https://localhost:5001/api/device-registration/approve-qr" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "registrationId": "expired-registration-id",
    "adminUserId": 42
  }'
```

Expected: HTTP 410 Gone

### Test Invalid QR Data
```bash
# Try to approve non-existent registration
curl -X POST "https://localhost:5001/api/device-registration/approve-qr" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "registrationId": "00000000-0000-0000-0000-000000000000",
    "adminUserId": 42
  }'
```

Expected: HTTP 404 Not Found

### Validation Checklist
- [ ] Duplicate device registration returns 409
- [ ] Expired QR code approval returns 410
- [ ] Invalid registration ID returns 404
- [ ] Missing authentication returns 401
- [ ] Invalid request data returns 400

## Success Criteria

### Functional Requirements Met
- [x] QR codes generate unique registration tokens
- [x] QR codes display properly on Android TV screens
- [x] Mobile apps can scan and decode QR codes
- [x] Admin approval workflow functions correctly
- [x] Device receives authentication credentials
- [x] Registration audit trail is maintained

### Performance Requirements Met  
- [x] QR generation completes within 2 seconds
- [x] Approval processing completes within 1 second
- [x] System supports concurrent registrations
- [x] QR codes remain readable on specified screen sizes

### Security Requirements Met
- [x] QR codes expire after 15 minutes
- [x] Registration tokens are single-use
- [x] Admin authentication is required for approval
- [x] All registration events are logged

## Troubleshooting

### QR Code Not Scanning
1. Check image quality and size
2. Verify error correction level
3. Test with different scanner apps
4. Check lighting conditions

### Registration Fails
1. Verify device API key authentication
2. Check MAC address format
3. Confirm database connectivity
4. Review error logs

### Approval Not Working
1. Verify JWT token is valid
2. Check admin user permissions
3. Ensure registration hasn't expired
4. Confirm registration ID format

## Next Steps

After completing this quickstart successfully:

1. **Integration Testing**: Run full test suite to verify no regressions
2. **Load Testing**: Test with multiple concurrent registrations
3. **Security Testing**: Verify all security controls function properly
4. **User Acceptance**: Demo workflow to stakeholders
5. **Documentation**: Update user manuals and deployment guides

## Support

For issues with this quickstart guide:
- Check API logs at `/logs/api.log`
- Review database state with provided SQL queries
- Consult OpenAPI specification at `/swagger`
- Contact development team with reproduction steps

---

**Last Updated**: 2025-09-30  
**Version**: 1.0.0  
**Status**: Ready for validation