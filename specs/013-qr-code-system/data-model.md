# Data Model: QR Code Device Registration System

**Date**: 2025-09-30  
**Feature**: QR Code system data structures and relationships

## Entity Model Changes

### Updated: DeviceRegistrationRequest
**Purpose**: Extended to support QR Code registration method  
**Changes**: Added fields for QR Code support while maintaining PIN compatibility

```csharp
public class DeviceRegistrationRequest : BaseEntity
{
    // Existing fields (unchanged)
    public int Id { get; set; }
    public string MacAddress { get; set; } = string.Empty;
    public string Pin { get; set; } = string.Empty; // Still required for PIN method
    public string DeviceModel { get; set; } = string.Empty;
    public string Manufacturer { get; set; } = string.Empty;
    public string AndroidVersion { get; set; } = string.Empty;
    public string AppVersion { get; set; } = string.Empty;
    public string? IpAddress { get; set; }
    public string NetworkName { get; set; } = string.Empty;
    public string HardwareSpecs { get; set; } = "{}";
    public RegistrationStatus Status { get; set; } = RegistrationStatus.Pending;
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? LastPolledAt { get; set; }
    
    // NEW FIELDS for QR Code support
    public RegistrationMethod Method { get; set; } = RegistrationMethod.Pin;
    public string? QrCodeData { get; set; } // Base64 encoded QR image
    public string? QrCodePayload { get; set; } // JSON payload for QR content
    
    // Navigation properties (unchanged)
    public DeviceApproval? Approval { get; set; }
    public List<RegistrationAuditLog> AuditLogs { get; set; } = new();
}
```

**Field Specifications**:
- `Method`: Enum indicating PIN, QrCode, or QrCodePin registration
- `QrCodeData`: Base64 PNG image (max 10KB, nullable for PIN registrations)
- `QrCodePayload`: JSON string containing registration metadata (max 2KB)

### New: RegistrationMethod Enum
**Purpose**: Distinguish between registration approaches

```csharp
public enum RegistrationMethod
{
    Pin = 1,        // Traditional PIN-based registration
    QrCode = 2,     // Pure QR Code registration  
    QrCodePin = 3,  // Hybrid QR + PIN verification
    PreApproved = 4 // Admin pre-approved via MAC whitelist
}
```

### New: QrCodeRegistrationData (Value Object)
**Purpose**: Structured data for QR Code payload

```csharp
public class QrCodeRegistrationData
{
    public Guid RegistrationId { get; set; }
    public DeviceInfo DeviceInfo { get; set; } = new();
    public DateTimeOffset ExpiresAt { get; set; }
    public string ApiEndpoint { get; set; } = string.Empty;
    public string? ValidationToken { get; set; }
}

public class DeviceInfo
{
    public string MacAddress { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string Manufacturer { get; set; } = string.Empty;
    public string AndroidVersion { get; set; } = string.Empty;
    public string? IpAddress { get; set; }
}
```

## Database Migration

### Migration: AddQrCodeSupport
**Up Script**:
```sql
-- Add new columns to DeviceRegistrationRequest
ALTER TABLE DeviceRegistrationRequest 
ADD COLUMN Method INTEGER NOT NULL DEFAULT 1;

ALTER TABLE DeviceRegistrationRequest 
ADD COLUMN QrCodeData TEXT NULL;

ALTER TABLE DeviceRegistrationRequest 
ADD COLUMN QrCodePayload TEXT NULL;

-- Add check constraint for QR Code data consistency
ALTER TABLE DeviceRegistrationRequest 
ADD CONSTRAINT CK_QrCode_Data_Consistency 
CHECK (
    (Method = 1 AND QrCodeData IS NULL AND QrCodePayload IS NULL) OR  -- PIN method
    (Method IN (2,3) AND QrCodeData IS NOT NULL AND QrCodePayload IS NOT NULL) OR  -- QR methods
    (Method = 4)  -- PreApproved (flexible)
);

-- Add index for QR Code lookups
CREATE INDEX IX_DeviceRegistrationRequest_Method_Status 
ON DeviceRegistrationRequest (Method, Status) 
WHERE Status IN (1, 2); -- Pending, Approved

-- Add index for expiration cleanup
CREATE INDEX IX_DeviceRegistrationRequest_ExpiresAt_Method 
ON DeviceRegistrationRequest (ExpiresAt, Method) 
WHERE Status = 1; -- Pending only
```

**Down Script**:
```sql
DROP INDEX IF EXISTS IX_DeviceRegistrationRequest_ExpiresAt_Method;
DROP INDEX IF EXISTS IX_DeviceRegistrationRequest_Method_Status;
ALTER TABLE DeviceRegistrationRequest DROP CONSTRAINT IF EXISTS CK_QrCode_Data_Consistency;
ALTER TABLE DeviceRegistrationRequest DROP COLUMN IF EXISTS QrCodePayload;
ALTER TABLE DeviceRegistrationRequest DROP COLUMN IF EXISTS QrCodeData;
ALTER TABLE DeviceRegistrationRequest DROP COLUMN IF EXISTS Method;
```

## Entity Framework Configuration

### DeviceRegistrationRequestConfiguration Updates
```csharp
public void Configure(EntityTypeBuilder<DeviceRegistrationRequest> builder)
{
    // Existing configuration...
    
    // QR Code specific configuration
    builder.Property(e => e.Method)
        .HasConversion<int>()
        .HasDefaultValue(RegistrationMethod.Pin);
        
    builder.Property(e => e.QrCodeData)
        .HasMaxLength(20000) // ~15KB Base64 = ~10KB image
        .IsRequired(false);
        
    builder.Property(e => e.QrCodePayload)
        .HasMaxLength(2000)
        .IsRequired(false);
    
    // Indexes
    builder.HasIndex(e => new { e.Method, e.Status })
        .HasDatabaseName("IX_DeviceRegistrationRequest_Method_Status")
        .HasFilter("[Status] IN (1, 2)");
        
    builder.HasIndex(e => new { e.ExpiresAt, e.Method })
        .HasDatabaseName("IX_DeviceRegistrationRequest_ExpiresAt_Method")
        .HasFilter("[Status] = 1");
}
```

## Validation Rules

### DeviceRegistrationRequest Validation
**Business Rules**:
1. PIN method: QrCodeData and QrCodePayload must be null
2. QR methods: QrCodeData and QrCodePayload must be present
3. QrCodeData must be valid Base64 PNG format
4. QrCodePayload must be valid JSON matching QrCodeRegistrationData schema
5. ExpiresAt must be between 5 minutes and 24 hours from creation
6. Method cannot be changed after creation

**Data Annotations**:
```csharp
[Required]
public RegistrationMethod Method { get; set; }

[MaxLength(20000)]
[Base64Image] // Custom validation attribute
public string? QrCodeData { get; set; }

[MaxLength(2000)]
[ValidJson] // Custom validation attribute  
public string? QrCodePayload { get; set; }
```

## State Transitions

### QR Code Registration Flow
```
Initial State: Status = Pending, Method = QrCode
├── QR Generated: QrCodeData populated, ExpiresAt set
├── Admin Scans: No state change, triggers approval workflow
├── Admin Approves: Status = Approved, Device created
├── Admin Rejects: Status = Rejected
└── Timeout: Status = Expired (background service)
```

### State Validation Rules
1. **Pending → Approved**: Only via admin approval
2. **Pending → Rejected**: Only via admin rejection  
3. **Pending → Expired**: Only via background expiration service
4. **Any → Cancelled**: Only by device request
5. **Final states** (Approved, Rejected, Expired, Cancelled): Immutable

## Query Patterns

### Find Pending QR Registrations
```csharp
var pendingQrRegistrations = await context.DeviceRegistrationRequests
    .Where(r => r.Method == RegistrationMethod.QrCode && 
                r.Status == RegistrationStatus.Pending &&
                r.ExpiresAt > DateTimeOffset.UtcNow)
    .OrderBy(r => r.CreatedAt)
    .ToListAsync();
```

### Cleanup Expired Registrations
```csharp
var expiredRegistrations = await context.DeviceRegistrationRequests
    .Where(r => r.Status == RegistrationStatus.Pending &&
                r.ExpiresAt <= DateTimeOffset.UtcNow)
    .ExecuteUpdateAsync(r => r.SetProperty(p => p.Status, RegistrationStatus.Expired));
```

### Find Registration by QR Payload
```csharp
var registration = await context.DeviceRegistrationRequests
    .Where(r => r.QrCodePayload.Contains(registrationId.ToString()) &&
                r.Status == RegistrationStatus.Pending &&
                r.ExpiresAt > DateTimeOffset.UtcNow)
    .FirstOrDefaultAsync();
```

## Performance Considerations

### Database Impact
- **New indexes**: Minimal impact, selective with WHERE clauses
- **Storage overhead**: ~12KB per QR registration vs ~1KB for PIN
- **Query performance**: Indexed methods maintain sub-100ms response times
- **Cleanup efficiency**: Batch expiration updates using ExecuteUpdateAsync

### Memory Usage
- **QR Code generation**: ~50MB peak during 100 concurrent generations
- **Base64 encoding**: ~33% size increase from PNG to Base64
- **JSON serialization**: Minimal overhead for structured payloads

### Scalability
- **Concurrent registrations**: Database handles 100+ simultaneous without locks
- **Expiration cleanup**: Background service processes batches of 1000
- **QR Code caching**: Optional Redis integration for high-volume scenarios

## Data Integrity

### Constraints
1. **Referential integrity**: Maintained through existing foreign keys
2. **Method consistency**: Check constraint ensures data/payload consistency
3. **Unique MAC addresses**: Existing constraint prevents duplicates
4. **Expiration bounds**: Application-level validation for reasonable timeframes

### Audit Trail
- **BaseEntity fields**: CreatedAt, UpdatedAt, CreatedBy, UpdatedBy maintained
- **RegistrationAuditLog**: Existing audit system captures QR registration events
- **Status changes**: All transitions logged with admin user and timestamp

## Migration Strategy

### Deployment Steps
1. **Deploy database migration**: Add new columns with defaults
2. **Deploy application code**: Backwards compatible, PIN method unchanged
3. **Enable QR features**: Feature flag activation after validation
4. **Monitor metrics**: Registration success rates and performance

### Rollback Plan
1. **Disable QR endpoints**: Feature flag deactivation
2. **Revert application**: Previous version remains compatible
3. **Clean up data**: Optional removal of QR-specific data
4. **Drop columns**: Only after confirming rollback success

This data model extends the existing system with minimal impact while providing comprehensive QR Code registration capabilities.