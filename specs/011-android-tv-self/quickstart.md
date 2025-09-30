# Quickstart: Android TV Self-Registration

**Date**: 2025-09-29  
**Feature**: 011-android-tv-self  

## Overview
This quickstart guide demonstrates the complete Android TV self-registration workflow from device registration through admin approval to device activation.

## Prerequisites

### System Requirements
- .NET 8 SDK installed
- PostgreSQL database running
- Digital Signage API running on localhost:5000
- Postman or curl for API testing
- Admin user account with JWT token

### Test Data Setup
```sql
-- Insert test admin user (if not exists)
INSERT INTO Users (Email, Name, Role, CreatedAt, IsActive) 
VALUES ('admin@test.com', 'Test Admin', 'Admin', NOW(), true);

-- Insert test device group (if not exists)
INSERT INTO DeviceGroups (Name, Description, CreatedAt) 
VALUES ('Test Group', 'Test device group for registration', NOW());
```

### Environment Variables
```bash
export API_BASE_URL="http://localhost:5000"
export ADMIN_JWT_TOKEN="your-admin-jwt-token-here"
```

## Test Scenario 1: Successful Registration Flow

### Step 1: Device Self-Registration
Simulate an Android TV device registering itself:

```bash
curl -X POST $API_BASE_URL/v1/device-registration/register \
  -H "Content-Type: application/json" \
  -d '{
    "macAddress": "AA:BB:CC:DD:EE:FF",
    "deviceModel": "Samsung QN65Q70AAFXZA", 
    "manufacturer": "Samsung",
    "androidVersion": "11",
    "appVersion": "1.2.0",
    "ipAddress": "192.168.1.150",
    "networkName": "Office-WiFi-5G",
    "hardwareSpecs": {
      "ram": "4GB",
      "storage": "32GB",
      "resolution": "3840x2160",
      "processor": "ARM Cortex-A78"
    }
  }'
```

**Expected Response** (HTTP 201):
```json
{
  "registrationId": "123e4567-e89b-12d3-a456-426614174000",
  "pin": "A1B2C3", 
  "status": "pending",
  "message": "Device registered. Waiting for admin approval.",
  "expiresAt": "2025-09-29T11:30:00Z",
  "pollInterval": 10
}
```

**Validation Checklist**:
- ✅ Returns 201 Created status
- ✅ Includes valid UUID for registrationId
- ✅ PIN is 6 characters, alphanumeric
- ✅ Status is "pending"
- ✅ ExpiresAt is ~1 hour from now
- ✅ PollInterval is reasonable (5-300 seconds)

### Step 2: Device Status Polling
Simulate the Android TV polling for approval status:

```bash
# Save registrationId from Step 1 response
REGISTRATION_ID="123e4567-e89b-12d3-a456-426614174000"

curl -X GET $API_BASE_URL/v1/device-registration/status/$REGISTRATION_ID
```

**Expected Response** (HTTP 200):
```json
{
  "registrationId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "pending"
}
```

**Validation Checklist**:
- ✅ Returns 200 OK status
- ✅ Status remains "pending" before approval
- ✅ No deviceKey or deviceId present yet

### Step 3: Admin Views Pending Registrations
Admin checks for pending device registrations:

```bash
curl -X GET $API_BASE_URL/v1/admin/device-registration/pending \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response** (HTTP 200):
```json
{
  "registrations": [
    {
      "registrationId": "123e4567-e89b-12d3-a456-426614174000",
      "pin": "A1B2C3",
      "macAddress": "AA:BB:CC:DD:EE:FF",
      "deviceModel": "Samsung QN65Q70AAFXZA",
      "manufacturer": "Samsung",
      "androidVersion": "11",
      "appVersion": "1.2.0", 
      "ipAddress": "192.168.1.150",
      "networkName": "Office-WiFi-5G",
      "hardwareSpecs": {
        "ram": "4GB",
        "storage": "32GB",
        "resolution": "3840x2160"
      },
      "createdAt": "2025-09-29T10:30:00Z",
      "expiresAt": "2025-09-29T11:30:00Z",
      "lastPolledAt": "2025-09-29T10:35:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

**Validation Checklist**:
- ✅ Returns 200 OK status
- ✅ Contains our registered device
- ✅ All device information is preserved
- ✅ PIN matches expected value
- ✅ Timestamps are reasonable
- ✅ Pagination info is correct

### Step 4: Admin Approves Device
Admin approves the device registration:

```bash
curl -X POST $API_BASE_URL/v1/admin/device-registration/$REGISTRATION_ID/approve \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceName": "Reception Display Main",
    "pin": "A1B2C3",
    "location": "Building A - Main Lobby",
    "deviceGroupId": 1,
    "tags": {
      "department": "marketing",
      "priority": "high"
    },
    "notes": "Approved for lobby deployment"
  }'
```

**Expected Response** (HTTP 200):
```json
{
  "registrationId": "123e4567-e89b-12d3-a456-426614174000",
  "deviceId": 42,
  "deviceKey": "dev_xyz789_secure_key_here",
  "status": "approved",
  "message": "Device approved successfully"
}
```

**Validation Checklist**:
- ✅ Returns 200 OK status
- ✅ Status is "approved"
- ✅ DeviceId is assigned (positive integer)
- ✅ DeviceKey is generated (secure string)
- ✅ Success message included

### Step 5: Device Receives Approval
Device polls again and receives approval:

```bash
curl -X GET $API_BASE_URL/v1/device-registration/status/$REGISTRATION_ID
```

**Expected Response** (HTTP 200):
```json
{
  "registrationId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "approved",
  "deviceKey": "dev_xyz789_secure_key_here",
  "deviceId": 42,
  "message": "Device approved and ready for use",
  "configuration": {
    "name": "Reception Display Main",
    "pollInterval": 30,
    "scheduleCheckInterval": 300,
    "heartbeatInterval": 60
  }
}
```

**Validation Checklist**:
- ✅ Returns 200 OK status
- ✅ Status is "approved"
- ✅ DeviceKey and deviceId are provided
- ✅ Configuration includes operational parameters
- ✅ Device name matches admin input

## Test Scenario 2: Duplicate Registration

### Step 6: Attempt Duplicate Registration
Try to register the same MAC address again:

```bash
curl -X POST $API_BASE_URL/v1/device-registration/register \
  -H "Content-Type: application/json" \
  -d '{
    "macAddress": "AA:BB:CC:DD:EE:FF",
    "deviceModel": "Samsung QN65Q70AAFXZA",
    "manufacturer": "Samsung", 
    "androidVersion": "11",
    "appVersion": "1.2.0",
    "ipAddress": "192.168.1.151",
    "networkName": "Office-WiFi-5G"
  }'
```

**Expected Response** (HTTP 409):
```json
{
  "error": "DEVICE_ALREADY_REGISTERED",
  "message": "A device with this MAC address is already registered or pending approval",
  "details": {
    "macAddress": "AA:BB:CC:DD:EE:FF",
    "existingStatus": "approved"
  },
  "traceId": "uuid-here"
}
```

**Validation Checklist**:
- ✅ Returns 409 Conflict status
- ✅ Clear error message about duplicate
- ✅ Includes relevant details
- ✅ Provides trace ID for debugging

## Test Scenario 3: Device Rejection

### Step 7: Register Another Device
Register a second device for rejection testing:

```bash
curl -X POST $API_BASE_URL/v1/device-registration/register \
  -H "Content-Type: application/json" \
  -d '{
    "macAddress": "BB:CC:DD:EE:FF:AA",
    "deviceModel": "LG OLED55C1PUB",
    "manufacturer": "LG",
    "androidVersion": "10", 
    "appVersion": "1.2.0",
    "ipAddress": "192.168.1.152",
    "networkName": "Office-WiFi-5G"
  }'
```

**Expected Response** (HTTP 201):
```json
{
  "registrationId": "456e7890-e89b-12d3-a456-426614174111",
  "pin": "X9Y8Z7",
  "status": "pending",
  "message": "Device registered. Waiting for admin approval.",
  "expiresAt": "2025-09-29T11:35:00Z",
  "pollInterval": 10
}
```

### Step 8: Admin Rejects Device
Admin rejects the device registration:

```bash
REGISTRATION_ID_2="456e7890-e89b-12d3-a456-426614174111"

curl -X POST $API_BASE_URL/v1/admin/device-registration/$REGISTRATION_ID_2/reject \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pin": "X9Y8Z7",
    "reason": "Unauthorized device from external network",
    "notes": "Device not on approved hardware list"
  }'
```

**Expected Response** (HTTP 200):
```json
{
  "registrationId": "456e7890-e89b-12d3-a456-426614174111",
  "status": "rejected",
  "message": "Device registration rejected"
}
```

### Step 9: Device Receives Rejection
Device polls and receives rejection:

```bash
curl -X GET $API_BASE_URL/v1/device-registration/status/$REGISTRATION_ID_2
```

**Expected Response** (HTTP 200):
```json
{
  "registrationId": "456e7890-e89b-12d3-a456-426614174111",
  "status": "rejected"
}
```

**Validation Checklist**:
- ✅ Returns 200 OK status
- ✅ Status is "rejected" 
- ✅ No device credentials provided
- ✅ Device understands it was denied

## Test Scenario 4: Bulk Approval

### Step 10: Register Multiple Devices
Register several devices for bulk approval:

```bash
# Device 1
curl -X POST $API_BASE_URL/v1/device-registration/register \
  -H "Content-Type: application/json" \
  -d '{
    "macAddress": "CC:DD:EE:FF:AA:BB",
    "deviceModel": "Samsung Smart TV",
    "manufacturer": "Samsung",
    "androidVersion": "11",
    "appVersion": "1.2.0",
    "ipAddress": "192.168.1.153",
    "networkName": "Office-WiFi-5G"
  }'

# Device 2  
curl -X POST $API_BASE_URL/v1/device-registration/register \
  -H "Content-Type: application/json" \
  -d '{
    "macAddress": "DD:EE:FF:AA:BB:CC",
    "deviceModel": "LG Smart TV",
    "manufacturer": "LG", 
    "androidVersion": "10",
    "appVersion": "1.2.0",
    "ipAddress": "192.168.1.154",
    "networkName": "Office-WiFi-5G"
  }'
```

### Step 11: Bulk Approve Devices
Admin bulk approves multiple devices:

```bash
curl -X POST $API_BASE_URL/v1/admin/device-registration/bulk-approve \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approvals": [
      {
        "registrationId": "registration-id-1",
        "deviceName": "Conference Room A Display",
        "pin": "pin-from-device-1",
        "location": "Conference Room A",
        "deviceGroupId": 1
      },
      {
        "registrationId": "registration-id-2", 
        "deviceName": "Conference Room B Display",
        "pin": "pin-from-device-2",
        "location": "Conference Room B",
        "deviceGroupId": 1
      }
    ]
  }'
```

**Expected Response** (HTTP 200):
```json
{
  "totalRequests": 2,
  "successful": 2,
  "failed": 0,
  "results": [
    {
      "registrationId": "registration-id-1",
      "status": "approved",
      "deviceId": 43,
      "deviceKey": "dev_bulk1_key_here"
    },
    {
      "registrationId": "registration-id-2",
      "status": "approved", 
      "deviceId": 44,
      "deviceKey": "dev_bulk2_key_here"
    }
  ]
}
```

**Validation Checklist**:
- ✅ Returns 200 OK status
- ✅ Correct counts (total, successful, failed)
- ✅ All devices approved successfully
- ✅ Each result has device ID and key
- ✅ Status correctly reflects outcomes

## Test Scenario 5: Error Handling

### Step 12: Invalid MAC Address Format
Test validation with malformed MAC address:

```bash
curl -X POST $API_BASE_URL/v1/device-registration/register \
  -H "Content-Type: application/json" \
  -d '{
    "macAddress": "INVALID-MAC",
    "deviceModel": "Test Device",
    "manufacturer": "Test",
    "androidVersion": "11", 
    "appVersion": "1.2.0",
    "ipAddress": "192.168.1.155",
    "networkName": "Office-WiFi-5G"
  }'
```

**Expected Response** (HTTP 400):
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid MAC address format",
  "details": {
    "field": "macAddress",
    "value": "INVALID-MAC",
    "expected": "AA:BB:CC:DD:EE:FF format"
  },
  "traceId": "uuid-here"
}
```

### Step 13: Unauthorized Admin Access
Test admin endpoints without authentication:

```bash
curl -X GET $API_BASE_URL/v1/admin/device-registration/pending
```

**Expected Response** (HTTP 401):
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required",
  "traceId": "uuid-here"
}
```

### Step 14: PIN Expiration
Test expired registration status:

```bash
# Wait for PIN to expire (or modify database to set expiresAt in past)
# Then poll status
curl -X GET $API_BASE_URL/v1/device-registration/status/expired-registration-id
```

**Expected Response** (HTTP 404):
```json
{
  "error": "REGISTRATION_NOT_FOUND",
  "message": "Registration not found or expired",
  "traceId": "uuid-here"
}
```

## Performance Validation

### Step 15: Load Testing
Test concurrent registrations (requires load testing tool):

```bash
# Example using Apache Bench
ab -n 100 -c 10 -p registration-payload.json -T application/json \
   $API_BASE_URL/v1/device-registration/register
```

**Performance Targets**:
- ✅ <500ms response time for registration
- ✅ <200ms response time for status polling
- ✅ Support 1000+ concurrent registrations
- ✅ <100ms response time for admin queries

## Success Criteria

### Functional Requirements Met
- ✅ Devices can self-register with device information
- ✅ Unique PIN codes generated and displayed
- ✅ Admin dashboard shows pending registrations
- ✅ Admin can approve/reject with metadata
- ✅ Devices receive approval notification
- ✅ Bulk approval workflow functional
- ✅ Security validation and error handling
- ✅ Audit logging for all operations

### Technical Requirements Met
- ✅ RESTful API following OpenAPI spec
- ✅ JWT authentication for admin endpoints
- ✅ Database persistence with EF Core
- ✅ Clean Architecture integration
- ✅ Comprehensive error handling
- ✅ Input validation and sanitization
- ✅ Performance targets achieved

### Integration Requirements Met
- ✅ Extends existing authentication system
- ✅ Integrates with device management
- ✅ Maintains audit trail
- ✅ Follows established API patterns
- ✅ Database migrations applied cleanly
- ✅ Test coverage comprehensive

## Troubleshooting

### Common Issues
1. **JWT Token Expired**: Refresh admin token and retry
2. **Database Connection**: Verify PostgreSQL is running
3. **Network Validation**: Check IP range configuration
4. **PIN Mismatch**: Ensure PIN from device screen matches request
5. **Duplicate MAC**: Check for existing device registrations

### Debug Commands
```bash
# Check database for registrations
psql -d digitalsignage -c "SELECT * FROM DeviceRegistrationRequests;"

# Check audit logs
psql -d digitalsignage -c "SELECT * FROM RegistrationAuditLogs ORDER BY CreatedAt DESC LIMIT 10;"

# Verify JWT token
curl -X GET $API_BASE_URL/v1/auth/verify \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN"
```

This quickstart validates the complete Android TV self-registration workflow and ensures all functional and technical requirements are met.