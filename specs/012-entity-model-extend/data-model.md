# Data Model: BaseEntity Extension and DateTime Standardization

**Feature**: Entity Model Base Entity Extension  
**Date**: 29 September 2025  
**Dependencies**: research.md

## BaseEntity Design

### Abstract Base Class
```csharp
namespace DigitalSignage.Domain.Entities;

/// <summary>
/// Base entity providing common audit trail fields for all domain entities
/// </summary>
public abstract class BaseEntity
{
    /// <summary>
    /// When the entity was created (UTC)
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// User ID who created the entity (-1 for system)
    /// </summary>
    public int CreatedBy { get; set; }
    
    /// <summary>
    /// When the entity was last updated (UTC)
    /// </summary>
    public DateTime UpdatedAt { get; set; }
    
    /// <summary>
    /// User ID who last updated the entity (-1 for system)
    /// </summary>
    public int UpdatedBy { get; set; }
}
```

### Audit Interface (Optional)
```csharp
namespace DigitalSignage.Domain.Common;

/// <summary>
/// Marker interface for entities that support audit trails
/// </summary>
public interface IAuditableEntity
{
    DateTime CreatedAt { get; set; }
    int CreatedBy { get; set; }
    DateTime UpdatedAt { get; set; }
    int UpdatedBy { get; set; }
}
```

## Entity Updates

### Entities Requiring BaseEntity Inheritance

#### Primary Entities (Already have partial audit fields)
- **User**: Replace existing CreatedAt, UpdatedAt with BaseEntity
- **Device**: Replace existing CreatedAt with BaseEntity  
- **Media**: Replace existing CreatedAt with BaseEntity
- **Schedule**: Replace existing CreatedAt with BaseEntity
- **DeviceGroup**: Replace existing CreatedAt with BaseEntity
- **Playlist**: Replace existing CreatedAt, UpdatedAt with BaseEntity
- **Scene**: Replace existing CreatedAt, UpdatedAt with BaseEntity

#### Registration Entities (Have domain-specific audit fields)
- **DeviceRegistrationRequest**: Replace CreatedAt with BaseEntity
- **DeviceApproval**: Replace ApprovedAt with BaseEntity (map to CreatedAt)
- **RegistrationAuditLog**: Replace CreatedAt with BaseEntity

#### Service Entities (Partial audit)
- **PlaybackState**: Replace LastUpdated with BaseEntity.UpdatedAt
- **ServiceInstance**: Replace LastHeartbeat with BaseEntity.UpdatedAt
- **HealthCheckResult**: Replace CheckedAt with BaseEntity.CreatedAt

#### Entities Without Audit Fields (New BaseEntity inheritance)
- **ScheduleMedia**: Add BaseEntity inheritance
- **PlaylistItem**: Add BaseEntity inheritance  
- **PlaylistAssignment**: Add BaseEntity inheritance
- **SceneItem**: Add BaseEntity inheritance
- **Service**: Add BaseEntity inheritance
- **RefreshToken**: Special case - keep ExpiresAt, add BaseEntity

### Field Mapping Strategy

| Current Field | New BaseEntity Field | Migration Notes |
|---------------|---------------------|-----------------|
| CreatedAt | CreatedAt | Direct mapping |
| UpdatedAt | UpdatedAt | Direct mapping |
| ApprovedAt | CreatedAt | Domain context preserved |
| LastUpdated | UpdatedAt | Semantic mapping |
| LastHeartbeat | UpdatedAt | Service-specific context |
| CheckedAt | CreatedAt | Immutable check records |

## Database Schema Changes

### New Audit Columns (Applied to all entities)
```sql
-- Common audit fields added to each entity table
ALTER TABLE Users ADD COLUMN created_by INTEGER NOT NULL DEFAULT -1;
ALTER TABLE Users ADD COLUMN updated_by INTEGER NOT NULL DEFAULT -1;
-- (UpdatedAt already exists, CreatedAt exists)

ALTER TABLE Devices ADD COLUMN created_by INTEGER NOT NULL DEFAULT -1;
ALTER TABLE Devices ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE Devices ADD COLUMN updated_by INTEGER NOT NULL DEFAULT -1;
-- (CreatedAt already exists)

-- Similar pattern for all entities...
```

### Indexes for Audit Queries
```sql
-- Performance indexes for audit trail queries
CREATE INDEX idx_users_created_at ON Users(created_at);
CREATE INDEX idx_users_created_by ON Users(created_by);
CREATE INDEX idx_devices_created_at ON Devices(created_at);
CREATE INDEX idx_devices_created_by ON Devices(created_by);
-- Replicated across all audit-enabled entities
```

### Foreign Key Constraints
```sql
-- CreatedBy and UpdatedBy reference Users table
ALTER TABLE Devices ADD CONSTRAINT fk_devices_created_by 
    FOREIGN KEY (created_by) REFERENCES Users(id);
ALTER TABLE Devices ADD CONSTRAINT fk_devices_updated_by 
    FOREIGN KEY (updated_by) REFERENCES Users(id);
-- Replicated across all entities
```

## Entity Framework Configuration

### BaseEntity Configuration
```csharp
// In AppDbContext.OnModelCreating
modelBuilder.Entity<BaseEntity>(entity =>
{
    entity.Property(e => e.CreatedAt)
          .HasColumnType("timestamp without time zone")
          .HasDefaultValueSql("CURRENT_TIMESTAMP");
          
    entity.Property(e => e.UpdatedAt)
          .HasColumnType("timestamp without time zone")
          .HasDefaultValueSql("CURRENT_TIMESTAMP");
          
    entity.Property(e => e.CreatedBy)
          .HasDefaultValue(-1);
          
    entity.Property(e => e.UpdatedBy)
          .HasDefaultValue(-1);
});
```

### Entity-Specific Overrides
```csharp
// DeviceApproval: Map ApprovedAt to CreatedAt
modelBuilder.Entity<DeviceApproval>(entity =>
{
    entity.Property(e => e.CreatedAt).HasColumnName("approved_at");
    // Maintain existing column name for backward compatibility
});
```

## Validation Rules

### Business Rules (From Requirements)
- **FR-002**: CreatedAt must be populated automatically on entity creation
- **FR-003**: CreatedBy must be populated from current user context or -1 for system
- **FR-004**: UpdatedAt must be updated automatically on entity modification  
- **FR-005**: UpdatedBy must be populated from current user context or -1 for system
- **FR-006**: All audit fields use DateTime without timezone
- **FR-008**: Existing data preserved during migration

### Data Constraints
```csharp
public abstract class BaseEntity
{
    [Required]
    public DateTime CreatedAt { get; set; }
    
    [Required]
    public int CreatedBy { get; set; }
    
    [Required]
    public DateTime UpdatedAt { get; set; }
    
    [Required]
    public int UpdatedBy { get; set; }
}
```

## State Transitions

### Entity Lifecycle
1. **Creation**: CreatedAt = UTC now, CreatedBy = current user, UpdatedAt = UTC now, UpdatedBy = current user
2. **Update**: UpdatedAt = UTC now, UpdatedBy = current user (CreatedAt/CreatedBy unchanged)
3. **System Actions**: Use CreatedBy/UpdatedBy = -1 for automated processes

### Migration State
1. **Pre-migration**: Entities have inconsistent audit fields
2. **Migration**: Add BaseEntity fields, populate from existing data or defaults
3. **Post-migration**: All entities have consistent BaseEntity audit trail

## Relationships

### User References
- **CreatedBy** → Users.Id (foreign key)
- **UpdatedBy** → Users.Id (foreign key)  
- **System User**: ID = -1 (virtual user for system processes)

### Audit Trail Queries
```csharp
// Find all entities created by a user
var userCreatedEntities = context.Set<TEntity>()
    .Where(e => e.CreatedBy == userId);

// Find recently updated entities
var recentUpdates = context.Set<TEntity>()
    .Where(e => e.UpdatedAt >= DateTime.UtcNow.AddDays(-1));
```

## Performance Considerations

### Index Strategy
- Primary indexes on CreatedAt for temporal queries
- Secondary indexes on CreatedBy/UpdatedBy for user audit trails
- Composite indexes on high-query entities: (CreatedBy, CreatedAt)

### Query Optimization
- Audit fields included in projections only when needed
- Bulk operations handle audit field population efficiently
- Migration populates fields in batches to minimize lock time

## Migration Impact Analysis

### Data Volume Estimates
- ~20 entity types requiring BaseEntity inheritance
- Estimated 10k-100k total records across all entities
- Migration time: 2-5 minutes for audit field population

### Compatibility Considerations
- Existing API responses unchanged (DTOs handle field mapping)
- Database column additions are additive (no breaking changes)
- Entity constructors remain compatible with existing code