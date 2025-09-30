# Data Model: Admin User Permission Management

## Core Entities

### UserDeviceGroupPermission
**Purpose**: Links users to device groups with specific permission levels, supporting hierarchical inheritance and explicit overrides.

```csharp
public class UserDeviceGroupPermission
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    [Required]
    public int DeviceGroupId { get; set; }
    public DeviceGroup DeviceGroup { get; set; } = null!;
    
    [Required]
    public UserPermissionLevel Permission { get; set; }
    
    /// <summary>
    /// True if explicitly assigned, False if inherited from parent group
    /// </summary>
    [Required]
    public bool IsExplicit { get; set; } = true;
    
    [Required]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    
    [Required]
    public int CreatedBy { get; set; }
    public User CreatedByUser { get; set; } = null!;
}
```

**Validation Rules**:
- Composite unique constraint on (UserId, DeviceGroupId)
- UserId must reference existing User
- DeviceGroupId must reference existing DeviceGroup  
- CreatedBy must reference existing User with admin role
- Permission must be valid UserPermissionLevel enum value

**Relationships**:
- Many-to-One with User (both User and CreatedByUser)
- Many-to-One with DeviceGroup
- Indexes on (UserId, DeviceGroupId) for lookup performance

### PermissionAuditLog
**Purpose**: Immutable audit trail of all permission changes for compliance and security tracking.

```csharp
public class PermissionAuditLog
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    [Required]
    public int DeviceGroupId { get; set; }
    public DeviceGroup DeviceGroup { get; set; } = null!;
    
    /// <summary>
    /// Permission level before change (null for new permissions)
    /// </summary>
    public UserPermissionLevel? PreviousPermission { get; set; }
    
    /// <summary>
    /// Permission level after change (null for deleted permissions)
    /// </summary>
    public UserPermissionLevel? NewPermission { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Action { get; set; } = string.Empty; // GRANTED, MODIFIED, REVOKED
    
    [MaxLength(500)]
    public string? Reason { get; set; }
    
    [Required]
    public int ChangedBy { get; set; }
    public User ChangedByUser { get; set; } = null!;
    
    [Required]
    public DateTimeOffset ChangedAt { get; set; } = DateTimeOffset.UtcNow;
    
    /// <summary>
    /// Additional context (IP address, user agent, etc.)
    /// </summary>
    [MaxLength(1000)]
    public string? Context { get; set; }
}
```

**Validation Rules**:
- Action must be one of: "GRANTED", "MODIFIED", "REVOKED"
- Either PreviousPermission or NewPermission must have value (not both null)
- GRANTED: PreviousPermission = null, NewPermission = value
- MODIFIED: Both PreviousPermission and NewPermission have values
- REVOKED: PreviousPermission = value, NewPermission = null
- ChangedBy must reference existing User with admin role
- Immutable after creation (no updates allowed)

**Relationships**:
- Many-to-One with User (both User and ChangedByUser)
- Many-to-One with DeviceGroup
- Indexes on UserId, DeviceGroupId, ChangedAt for audit queries

### UserPermissionLevel (Enum)
**Purpose**: Four-tier permission system with hierarchical ordering for inheritance and comparison.

```csharp
public enum UserPermissionLevel
{
    /// <summary>
    /// Cannot see or interact with device group and its content
    /// </summary>
    NoAccess = 0,
    
    /// <summary>
    /// Can view devices, content, and schedules (read-only access)
    /// </summary>
    ViewOnly = 1,
    
    /// <summary>
    /// Can manage content: upload media, create schedules, modify playlists
    /// </summary>
    ManageContent = 2,
    
    /// <summary>
    /// Complete control: modify device settings, manage users, delete content
    /// </summary>
    FullControl = 3
}
```

**Permission Hierarchy**:
- FullControl > ManageContent > ViewOnly > NoAccess
- Higher levels include all lower level permissions
- Numeric comparison enables inheritance calculation

## Extended Entity Updates

### User Entity Extensions
**New Navigation Properties**:
```csharp
// Add to existing User entity
public ICollection<UserDeviceGroupPermission> DeviceGroupPermissions { get; set; } = new List<UserDeviceGroupPermission>();
```

### DeviceGroup Entity Extensions
**New Navigation Properties**:
```csharp
// Add to existing DeviceGroup entity  
public ICollection<UserDeviceGroupPermission> UserPermissions { get; set; } = new List<UserDeviceGroupPermission>();
```

## Database Schema

### UserDeviceGroupPermissions Table
```sql
CREATE TABLE UserDeviceGroupPermissions (
    Id SERIAL PRIMARY KEY,
    UserId INTEGER NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    DeviceGroupId INTEGER NOT NULL REFERENCES DeviceGroups(Id) ON DELETE CASCADE,
    Permission INTEGER NOT NULL CHECK (Permission >= 0 AND Permission <= 3),
    IsExplicit BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CreatedBy INTEGER NOT NULL REFERENCES Users(Id),
    
    CONSTRAINT UQ_UserDeviceGroupPermissions_UserId_DeviceGroupId 
        UNIQUE (UserId, DeviceGroupId),
    CONSTRAINT CK_UserDeviceGroupPermissions_Permission 
        CHECK (Permission IN (0, 1, 2, 3))
);

-- Performance indexes
CREATE INDEX IX_UserDeviceGroupPermissions_UserId 
    ON UserDeviceGroupPermissions (UserId);
CREATE INDEX IX_UserDeviceGroupPermissions_DeviceGroupId 
    ON UserDeviceGroupPermissions (DeviceGroupId);
CREATE INDEX IX_UserDeviceGroupPermissions_UserId_DeviceGroupId 
    ON UserDeviceGroupPermissions (UserId, DeviceGroupId);
```

### PermissionAuditLogs Table
```sql
CREATE TABLE PermissionAuditLogs (
    Id SERIAL PRIMARY KEY,
    UserId INTEGER NOT NULL REFERENCES Users(Id),
    DeviceGroupId INTEGER NOT NULL REFERENCES DeviceGroups(Id),
    PreviousPermission INTEGER CHECK (PreviousPermission >= 0 AND PreviousPermission <= 3),
    NewPermission INTEGER CHECK (NewPermission >= 0 AND NewPermission <= 3),
    Action VARCHAR(50) NOT NULL CHECK (Action IN ('GRANTED', 'MODIFIED', 'REVOKED')),
    Reason VARCHAR(500),
    ChangedBy INTEGER NOT NULL REFERENCES Users(Id),
    ChangedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    Context VARCHAR(1000),
    
    CONSTRAINT CK_PermissionAuditLogs_HasPermissionValue 
        CHECK (PreviousPermission IS NOT NULL OR NewPermission IS NOT NULL),
    CONSTRAINT CK_PermissionAuditLogs_ActionConsistency 
        CHECK (
            (Action = 'GRANTED' AND PreviousPermission IS NULL AND NewPermission IS NOT NULL) OR
            (Action = 'MODIFIED' AND PreviousPermission IS NOT NULL AND NewPermission IS NOT NULL) OR
            (Action = 'REVOKED' AND PreviousPermission IS NOT NULL AND NewPermission IS NULL)
        )
);

-- Audit query indexes
CREATE INDEX IX_PermissionAuditLogs_UserId 
    ON PermissionAuditLogs (UserId);
CREATE INDEX IX_PermissionAuditLogs_DeviceGroupId 
    ON PermissionAuditLogs (DeviceGroupId);
CREATE INDEX IX_PermissionAuditLogs_ChangedAt 
    ON PermissionAuditLogs (ChangedAt DESC);
CREATE INDEX IX_PermissionAuditLogs_ChangedBy 
    ON PermissionAuditLogs (ChangedBy);
```

## Entity Framework Configuration

### UserDeviceGroupPermissionConfiguration
```csharp
public class UserDeviceGroupPermissionConfiguration : IEntityTypeConfiguration<UserDeviceGroupPermission>
{
    public void Configure(EntityTypeBuilder<UserDeviceGroupPermission> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.HasIndex(x => new { x.UserId, x.DeviceGroupId })
               .IsUnique()
               .HasDatabaseName("UQ_UserDeviceGroupPermissions_UserId_DeviceGroupId");
               
        builder.HasIndex(x => x.UserId)
               .HasDatabaseName("IX_UserDeviceGroupPermissions_UserId");
               
        builder.HasIndex(x => x.DeviceGroupId)
               .HasDatabaseName("IX_UserDeviceGroupPermissions_DeviceGroupId");

        builder.Property(x => x.Permission)
               .HasConversion<int>()
               .IsRequired();
               
        builder.Property(x => x.IsExplicit)
               .IsRequired()
               .HasDefaultValue(true);
               
        builder.Property(x => x.CreatedAt)
               .IsRequired()
               .HasDefaultValueSql("NOW()");

        // Relationships
        builder.HasOne(x => x.User)
               .WithMany(x => x.DeviceGroupPermissions)
               .HasForeignKey(x => x.UserId)
               .OnDelete(DeleteBehavior.Cascade);
               
        builder.HasOne(x => x.DeviceGroup)
               .WithMany(x => x.UserPermissions)
               .HasForeignKey(x => x.DeviceGroupId)
               .OnDelete(DeleteBehavior.Cascade);
               
        builder.HasOne(x => x.CreatedByUser)
               .WithMany()
               .HasForeignKey(x => x.CreatedBy)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
```

### PermissionAuditLogConfiguration
```csharp
public class PermissionAuditLogConfiguration : IEntityTypeConfiguration<PermissionAuditLog>
{
    public void Configure(EntityTypeBuilder<PermissionAuditLog> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.HasIndex(x => x.UserId)
               .HasDatabaseName("IX_PermissionAuditLogs_UserId");
               
        builder.HasIndex(x => x.DeviceGroupId)
               .HasDatabaseName("IX_PermissionAuditLogs_DeviceGroupId");
               
        builder.HasIndex(x => x.ChangedAt)
               .IsDescending()
               .HasDatabaseName("IX_PermissionAuditLogs_ChangedAt");

        builder.Property(x => x.PreviousPermission)
               .HasConversion<int?>();
               
        builder.Property(x => x.NewPermission)
               .HasConversion<int?>();
               
        builder.Property(x => x.Action)
               .IsRequired()
               .HasMaxLength(50);
               
        builder.Property(x => x.Reason)
               .HasMaxLength(500);
               
        builder.Property(x => x.Context)
               .HasMaxLength(1000);
               
        builder.Property(x => x.ChangedAt)
               .IsRequired()
               .HasDefaultValueSql("NOW()");

        // Immutable entity - prevent updates
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        // Relationships
        builder.HasOne(x => x.User)
               .WithMany()
               .HasForeignKey(x => x.UserId)
               .OnDelete(DeleteBehavior.Restrict);
               
        builder.HasOne(x => x.DeviceGroup)
               .WithMany()
               .HasForeignKey(x => x.DeviceGroupId)
               .OnDelete(DeleteBehavior.Restrict);
               
        builder.HasOne(x => x.ChangedByUser)
               .WithMany()
               .HasForeignKey(x => x.ChangedBy)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
```

## State Transitions

### Permission Lifecycle
```
[No Permission] ─── GRANT ───→ [Explicit Permission]
                                        │
                                        ├── MODIFY ──→ [Updated Permission]
                                        │
                                        └── REVOKE ──→ [No Permission]

[Inherited Permission] ─── OVERRIDE ───→ [Explicit Permission]
                                                 │
                                                 └── CLEAR ──→ [Inherited Permission]
```

### Audit Actions
- **GRANTED**: New explicit permission assigned to user-group pair
- **MODIFIED**: Existing permission level changed (explicit or inherited → explicit)  
- **REVOKED**: Explicit permission removed (reverts to inherited or no access)

## Performance Considerations

### Query Optimization
1. **Permission Lookup**: Use composite index on (UserId, DeviceGroupId)
2. **Hierarchy Traversal**: Cache device group tree structure
3. **Inheritance Calculation**: Implement recursive CTE for parent permission lookup
4. **Audit Queries**: Use time-based partitioning for large audit tables

### Caching Strategy
1. **User Permissions**: Cache effective permissions per user (5-minute TTL)
2. **Device Group Tree**: Cache hierarchy structure (1-hour TTL, invalidate on structure change)
3. **Permission Matrix**: Pre-calculate permission matrix for frequent lookups
4. **Audit Summary**: Cache recent audit activity for dashboard display