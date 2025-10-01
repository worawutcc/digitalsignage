# Data Model: Android TV Self-Registration

**Date**: 2025-09-29  
**Feature**: 011-android-tv-self  

## Entity Definitions

### DeviceRegistrationRequest
Represents a device's initial request to join the digital signage network.

**Fields**:
- `Id` (int): Primary key, auto-increment
- `MacAddress` (string, 17): Device MAC address (AA:BB:CC:DD:EE:FF format)
- `Pin` (string, 6): Generated PIN code for verification
- `DeviceModel` (string, 100): Device model name (e.g., "Samsung QN65Q70AAFXZA")
- `Manufacturer` (string, 50): Device manufacturer
- `AndroidVersion` (string, 20): Android OS version
- `AppVersion` (string, 20): Digital Signage app version
- `IpAddress` (string, 45): Device IP address (IPv4/IPv6)
- `NetworkName` (string, 100): WiFi network SSID
- `HardwareSpecs` (JSON): Hardware specifications (RAM, storage, resolution)
- `Status` (enum): Current registration status
- `CreatedAt` (DateTimeOffset): Registration timestamp
- `ExpiresAt` (DateTimeOffset): PIN expiration timestamp
- `LastPolledAt` (DateTimeOffset): Last status poll from device

**Relationships**:
- One-to-Zero-or-One → `DeviceApproval`
- One-to-Many → `AuditLog` entries

**Validation Rules**:
- MAC address must be unique and valid format
- PIN must be 6 characters, alphanumeric excluding confusing chars
- Status transitions: Pending → Approved/Rejected → Expired
- Expires within 1-24 hours of creation (configurable)

**Indexes**:
- Unique: MacAddress
- Non-unique: Status, CreatedAt, ExpiresAt
- Composite: (Status, ExpiresAt) for cleanup queries

### DeviceApproval
Represents an administrator's decision on a device registration request.

**Fields**:
- `Id` (int): Primary key, auto-increment
- `DeviceRegistrationRequestId` (int): Foreign key to registration request
- `ApprovedByUserId` (int): Foreign key to approving admin user
- `Status` (enum): Approved or Rejected
- `DeviceName` (string, 100): Admin-assigned friendly name
- `Location` (string, 200): Physical location description
- `DeviceGroupId` (int?): Optional assignment to device group
- `ZoneId` (int?): Optional zone assignment
- `InitialScheduleId` (int?): Initial content schedule assignment
- `Tags` (JSON): Metadata tags for organization
- `Notes` (string, 500): Admin notes about the decision
- `ApprovedAt` (DateTimeOffset): Decision timestamp
- `DeviceKey` (string, 255): Generated secure device key (if approved)

**Relationships**:
- Many-to-One → `DeviceRegistrationRequest`
- Many-to-One → `User` (approving admin)
- Many-to-One → `DeviceGroup` (optional)
- Many-to-One → `Zone` (optional)
- Many-to-One → `Schedule` (optional)

**Validation Rules**:
- DeviceName required for approved devices
- DeviceKey generated only for approved status
- ApprovedByUserId must reference existing admin user
- Location recommended for approved devices

**Indexes**:
- Non-unique: DeviceRegistrationRequestId, ApprovedByUserId, Status
- Unique: DeviceKey (when not null)

### RegistrationAuditLog
Comprehensive audit trail for device registration activities.

**Fields**:
- `Id` (long): Primary key, auto-increment
- `DeviceRegistrationRequestId` (int): Foreign key to registration request
- `UserId` (int?): User ID if action performed by user
- `Action` (enum): Type of action performed
- `Details` (JSON): Action-specific details and context
- `IpAddress` (string, 45): Source IP address of action
- `UserAgent` (string, 500): User agent for web actions
- `Result` (enum): Success, Failure, Warning
- `ErrorMessage` (string, 1000): Error details if applicable
- `CreatedAt` (DateTimeOffset): Action timestamp

**Relationships**:
- Many-to-One → `DeviceRegistrationRequest`
- Many-to-One → `User` (optional)

**Validation Rules**:
- Action must be valid enum value
- Details stored as structured JSON
- CreatedAt automatically set on creation
- Result required for all actions

**Indexes**:
- Non-unique: DeviceRegistrationRequestId, UserId, Action, CreatedAt
- Composite: (CreatedAt, Action) for reporting queries

## Enumerations

### RegistrationStatus
```csharp
public enum RegistrationStatus
{
    Pending = 1,        // Awaiting admin approval
    Approved = 2,       // Admin approved, device active
    Rejected = 3,       // Admin rejected registration
    Expired = 4,        // PIN expired before approval
    Cancelled = 5       // Registration cancelled by device
}
```

### ApprovalStatus
```csharp
public enum ApprovalStatus
{
    Approved = 1,       // Device approved for network
    Rejected = 2        // Device rejected, access denied
}
```

### AuditAction
```csharp
public enum AuditAction
{
    RegistrationRequested = 1,      // Device initiated registration
    PinGenerated = 2,              // System generated PIN
    StatusPolled = 3,              // Device polled for status
    AdminViewed = 4,               // Admin viewed registration
    AdminApproved = 5,             // Admin approved device
    AdminRejected = 6,             // Admin rejected device
    DeviceActivated = 7,           // Device received approval
    RegistrationExpired = 8,       // PIN expired
    RegistrationCancelled = 9,     // Device cancelled registration
    SecurityViolation = 10         // Security check failed
}
```

### AuditResult
```csharp
public enum AuditResult
{
    Success = 1,        // Action completed successfully
    Failure = 2,        // Action failed with error
    Warning = 3         // Action completed with warnings
}
```

## State Transitions

### DeviceRegistrationRequest Status Flow
```
Pending → Approved (admin approval)
Pending → Rejected (admin rejection)  
Pending → Expired (PIN timeout)
Pending → Cancelled (device cancellation)

[Terminal states: Approved, Rejected, Expired, Cancelled]
```

### Business Rules
1. **PIN Uniqueness**: Each generated PIN must be unique across active registrations
2. **MAC Address Uniqueness**: Only one active registration per MAC address
3. **Expiration Cleanup**: Expired registrations automatically cleaned up after 7 days
4. **Approval Workflow**: Only admin users can approve/reject registrations
5. **Device Activation**: Approved devices automatically created in main Device table
6. **Audit Completeness**: All state changes must generate audit log entries

## Database Migration Strategy

### New Tables
- `DeviceRegistrationRequests`
- `DeviceApprovals` 
- `RegistrationAuditLogs`

### Modified Tables
- `Devices`: Add `RegisteredFromRequestId` (nullable foreign key)
- `Users`: No changes (reuse existing admin users)

### Constraints
- Foreign key: `DeviceApprovals.DeviceRegistrationRequestId → DeviceRegistrationRequests.Id`
- Foreign key: `DeviceApprovals.ApprovedByUserId → Users.Id`
- Foreign key: `RegistrationAuditLogs.DeviceRegistrationRequestId → DeviceRegistrationRequests.Id`
- Unique constraint: `DeviceRegistrationRequests.MacAddress` (where Status = Pending)
- Unique constraint: `DeviceApprovals.DeviceKey` (where Status = Approved)

### Indexes for Performance
- Index: `DeviceRegistrationRequests(Status, ExpiresAt)` for cleanup
- Index: `DeviceRegistrationRequests(MacAddress)` for duplicate prevention
- Index: `RegistrationAuditLogs(CreatedAt)` for reporting
- Index: `DeviceApprovals(DeviceKey)` for device authentication

## JSON Schema Definitions

### HardwareSpecs JSON Structure
```json
{
  "ram": "4GB",
  "storage": "32GB", 
  "resolution": "3840x2160",
  "processor": "ARM Cortex-A78",
  "networkCapabilities": ["WiFi 6", "Ethernet"],
  "displayOutputs": ["HDMI 2.1"],
  "audioOutputs": ["HDMI Audio", "Bluetooth"]
}
```

### Tags JSON Structure
```json
{
  "department": "marketing",
  "building": "headquarters", 
  "floor": "2",
  "room": "conference-a",
  "priority": "high",
  "maintenance_window": "weekends"
}
```

### AuditDetails JSON Structure
```json
{
  "previousStatus": "Pending",
  "newStatus": "Approved",
  "adminNotes": "Approved for lobby deployment",
  "validationResults": {
    "networkCheck": "passed",
    "deviceFingerprint": "verified"
  },
  "additionalContext": {
    "requestSource": "device_app",
    "networkLocation": "corporate_wifi"
  }
}
```

## Performance Considerations

### Query Optimization
- Partition audit logs by month for historical queries
- Use covering indexes for dashboard queries
- Implement read replicas for reporting workloads
- Cache frequently accessed device group/zone data

### Storage Optimization
- Compress JSON fields for hardware specs and tags
- Archive completed registrations after 1 year
- Use appropriate data types (DateTimeOffset vs DateTime)
- Consider partitioning large audit tables

### Concurrency Handling
- Optimistic concurrency control for registration updates
- Database-level constraints for data integrity
- Retry logic for transient failures
- Connection pooling for high-volume scenarios

## Security Considerations

### Data Protection
- Encrypt device keys at rest
- Hash MAC addresses for privacy
- Sanitize JSON input to prevent injection
- Implement field-level encryption for sensitive data

### Access Control
- Admin-only access to approval endpoints
- Device-specific access to status polling
- Audit log access restricted to security team
- Rate limiting on registration endpoints

### Compliance
- GDPR-compliant data retention policies
- Audit log immutability for compliance
- Data anonymization for expired registrations
- Export capabilities for data subject requests

This data model provides a robust foundation for the Android TV self-registration feature while maintaining integration with the existing digital signage system architecture.