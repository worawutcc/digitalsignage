# Quickstart: Enhanced Device Registration Testing

**Date**: 2024-12-19  
**Feature**: 028-enhanced-device-registration

## Prerequisites

1. **Development Environment**: Digital Signage API running on localhost:5000
2. **Database**: PostgreSQL with EF Core migrations applied
3. **AWS Services**: S3 bucket and CloudFront configured
4. **Testing Tools**: Postman/curl, JWT token for admin endpoints

## Test Scenario 1: Android TV Registration with Hardware Info

### Step 1: Register Android TV Device
```bash
curl -X POST http://localhost:5000/api/device/register \
  -H "Content-Type: application/json" \
  -d '{
    "deviceName": "LG OLED TV - Living Room",
    "pin": "123456",
    "macAddress": "AA:BB:CC:DD:EE:FF",
    "hardwareInfo": {
      "displayWidth": 3840,
      "displayHeight": 2160,
      "refreshRate": 60.0,
      "physicalWidth": 55.0,
      "physicalHeight": 31.0,
      "densityDpi": 160,
      "manufacturer": "LG",
      "model": "OLED55C1PUB",
      "androidVersion": "11",
      "apiLevel": 30,
      "buildFingerprint": "LGE/awaken_tv/awaken:11/RKQ1.200928.002/123456789:user/release-keys",
      "supportedFormats": ["MP4", "WebM", "AV1", "JPEG", "PNG", "WebP"],
      "codecCapabilities": {
        "video": ["H.264", "H.265", "AV1", "VP9"],
        "audio": ["AAC", "Dolby Digital", "DTS"]
      },
      "additionalSpecs": {
        "hdrSupport": ["HDR10", "Dolby Vision"],
        "audioChannels": "7.1",
        "networkCapabilities": ["Ethernet", "WiFi", "Bluetooth"]
      }
    }
  }'
```

**Expected Response** (201 Created):
```json
{
  "id": 1,
  "deviceName": "LG OLED TV - Living Room",
  "pin": "123456",
  "status": "Pending",
  "hasHardwareInfo": true,
  "hardwareDetectionJobId": 1,
  "createdAt": "2024-12-19T10:00:00Z"
}
```

### Step 2: Monitor Hardware Detection Progress
```bash
curl -X GET "http://localhost:5000/api/admin/hardware-detection/status?registrationRequestId=1" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Expected Response** (200 OK):
```json
[
  {
    "id": 1,
    "deviceRegistrationRequestId": 1,
    "status": "Processing",
    "startedAt": "2024-12-19T10:00:05Z",
    "completedAt": null,
    "errorMessage": null,
    "retryCount": 0,
    "profileCreated": false,
    "deviceHardwareProfileId": null
  }
]
```

### Step 3: Approve Device Registration
```bash
# Admin approves the device through existing approval workflow
curl -X POST http://localhost:5000/api/admin/device/approve \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "registrationRequestId": 1,
    "approved": true
  }'
```

### Step 4: Verify Hardware Profile Created
```bash
# Wait for hardware detection to complete, then check profile
curl -X GET http://localhost:5000/api/device/1/hardware-profile \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "deviceId": 1,
  "displayWidth": 3840,
  "displayHeight": 2160,
  "refreshRate": 60.0,
  "physicalWidth": 55.0,
  "physicalHeight": 31.0,
  "densityDpi": 160,
  "manufacturer": "LG",
  "model": "OLED55C1PUB",
  "androidVersion": "11",
  "apiLevel": 30,
  "buildFingerprint": "LGE/awaken_tv/awaken:11/RKQ1.200928.002/123456789:user/release-keys",
  "supportedFormats": ["MP4", "WebM", "AV1", "JPEG", "PNG", "WebP"],
  "codecCapabilities": {
    "video": ["H.264", "H.265", "AV1", "VP9"],
    "audio": ["AAC", "Dolby Digital", "DTS"]
  },
  "additionalSpecs": {
    "hdrSupport": ["HDR10", "Dolby Vision"],
    "audioChannels": "7.1",
    "networkCapabilities": ["Ethernet", "WiFi", "Bluetooth"]
  },
  "detectedAt": "2024-12-19T10:00:10Z",
  "isAutoDetected": true,
  "detectionSource": "system"
}
```

## Test Scenario 2: Legacy Device Registration (Backward Compatibility)

### Step 1: Register Legacy Device
```bash
curl -X POST http://localhost:5000/api/device/register \
  -H "Content-Type: application/json" \
  -d '{
    "deviceName": "Generic Android TV",
    "pin": "654321",
    "macAddress": "FF:EE:DD:CC:BB:AA"
  }'
```

**Expected Response** (201 Created):
```json
{
  "id": 2,
  "deviceName": "Generic Android TV",
  "pin": "654321",
  "status": "Pending", 
  "hasHardwareInfo": false,
  "hardwareDetectionJobId": null,
  "createdAt": "2024-12-19T10:05:00Z"
}
```

### Step 2: Verify Default Profile Created After Approval
```bash
# After admin approval
curl -X GET http://localhost:5000/api/device/2/hardware-profile \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Expected Response** (200 OK):
```json
{
  "id": 2,
  "deviceId": 2,
  "displayWidth": 1920,
  "displayHeight": 1080,
  "refreshRate": 60.0,
  "physicalWidth": 0.0,
  "physicalHeight": 0.0,
  "densityDpi": 160,
  "manufacturer": "Unknown",
  "model": "Generic Android TV",
  "androidVersion": "Unknown",
  "apiLevel": 21,
  "buildFingerprint": "",
  "supportedFormats": ["MP4", "JPEG"],
  "codecCapabilities": {"video": ["H.264"], "audio": ["AAC"]},
  "additionalSpecs": {},
  "detectedAt": "2024-12-19T10:05:30Z",
  "isAutoDetected": false,
  "detectionSource": "default"
}
```

## Test Scenario 3: Device-Optimized Content Delivery

### Step 1: Upload Media with Multi-Size Processing
```bash
# Upload image that triggers multi-size generation
curl -X POST http://localhost:5000/api/media/upload \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -F "file=@test-image-4k.jpg" \
  -F "name=Test 4K Image"
```

### Step 2: Request Optimized Content for Devices
```bash
# Get optimized content for 4K TV (Device ID 1)
curl -X GET "http://localhost:5000/api/device/1/optimized-content?mediaIds=1" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Expected Response** (200 OK):
```json
{
  "deviceId": 1,
  "optimizedMedia": [
    {
      "mediaId": 1,
      "originalUrl": "https://cdn.example.com/digitalsignage/19122024/image/original/test-image-4k.jpg",
      "optimizedVariants": [
        {
          "id": 1,
          "width": 3840,
          "height": 2160,
          "quality": "high",
          "fileSize": 2048000,
          "format": "jpg",
          "cloudFrontUrl": "https://cdn.example.com/digitalsignage/19122024/image/4K/test-image-4k.jpg",
          "targetResolution": "4K",
          "isOriginal": false
        },
        {
          "id": 2,
          "width": 1920,
          "height": 1080,
          "quality": "medium",
          "fileSize": 512000,
          "format": "jpg", 
          "cloudFrontUrl": "https://cdn.example.com/digitalsignage/19122024/image/HD/test-image-4k.jpg",
          "targetResolution": "HD",
          "isOriginal": false
        }
      ]
    }
  ]
}
```

```bash
# Get optimized content for legacy device (Device ID 2)
curl -X GET "http://localhost:5000/api/device/2/optimized-content?mediaIds=1" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Expected Response**: Should return HD variant as best match for legacy device.

## Test Scenario 4: Hardware Detection Failure Recovery

### Step 1: Simulate Hardware Detection Failure
```bash
# Register device with invalid hardware info to trigger processing error
curl -X POST http://localhost:5000/api/device/register \
  -H "Content-Type: application/json" \
  -d '{
    "deviceName": "Problematic Device",
    "pin": "999888",
    "macAddress": "11:22:33:44:55:66",
    "hardwareInfo": {
      "displayWidth": -1,
      "displayHeight": 0,
      "refreshRate": 300.0
    }
  }'
```

### Step 2: Check Detection Job Status
```bash
curl -X GET "http://localhost:5000/api/admin/hardware-detection/status?status=Failed" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

### Step 3: Retry Failed Detection
```bash
curl -X POST http://localhost:5000/api/admin/hardware-detection/1/retry \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

## Success Criteria Validation

### Functional Requirements Verification
- [ ] **FR-001**: Hardware information automatically collected during registration ✓
- [ ] **FR-002**: Device hardware profiles validated and stored ✓
- [ ] **FR-003**: Media variants generated for device resolutions ✓
- [ ] **FR-004**: Device-appropriate media served based on profiles ✓
- [ ] **FR-005**: Backward compatibility maintained for legacy devices ✓
- [ ] **FR-006**: Hardware information changes logged ✓
- [ ] **FR-007**: Hardware detection failures handled gracefully ✓
- [ ] **FR-008**: Manual override of hardware information supported ✓
- [ ] **FR-009**: Content delivery optimization updated with profile changes ✓

### Performance Validation
- [ ] Device registration completes in <2 seconds
- [ ] Hardware detection processes in background without blocking registration
- [ ] Multiple concurrent registrations handled correctly
- [ ] Media variant selection optimized for device capabilities

### Integration Testing
- [ ] SignalR notifications sent for hardware detection status changes
- [ ] Audit logs created for hardware profile operations
- [ ] AWS S3 folder structure follows enhanced pattern
- [ ] CloudFront URLs generated correctly for device-specific variants
- [ ] Existing device registration workflow unchanged

## Environment Reset

```bash
# Clean up test data
curl -X DELETE http://localhost:5000/api/admin/test-data/reset \
  -H "Authorization: Bearer {JWT_TOKEN}"

# Reset database to clean state for next test run
dotnet ef database update -- --environment Testing
```

## Expected Issues & Debugging

### Common Issues
1. **Hardware Detection Stuck**: Check background service logs and retry mechanism
2. **Missing Media Variants**: Verify S3FileUploadService configuration and folder structure
3. **Default Profile Not Created**: Check device approval workflow integration
4. **SignalR Not Working**: Verify hub configuration and client connections

### Debug Commands
```bash
# Check background job queue
curl -X GET http://localhost:5000/api/admin/jobs/status -H "Authorization: Bearer {JWT_TOKEN}"

# Verify S3 folder structure
aws s3 ls s3://your-bucket/digitalsignage/$(date +%d%m%Y)/ --recursive

# Check audit logs
curl -X GET http://localhost:5000/api/admin/audit-logs?entity=DeviceHardwareProfile -H "Authorization: Bearer {JWT_TOKEN}"
```