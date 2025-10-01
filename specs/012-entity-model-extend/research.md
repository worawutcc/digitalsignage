# Research: Entity Model Base Entity Extension and Date Column Standardization

**Feature**: BaseEntity Extension and DateTime Standardization  
**Date**: 29 September 2025  
**Status**: Complete

## Research Questions Resolved

### Q1: Which entities need BaseEntity inheritance?
**Decision**: All domain entities except value objects and enums  
**Rationale**: 
- Current system has 20+ entities with inconsistent audit fields
- User, Device, Media, Schedule, and others already have CreatedAt/UpdatedAt
- Consistency needed for compliance and troubleshooting
- BaseEntity provides single source of truth for audit requirements

**Entities to Update**:
- User.cs ✓ (has CreatedAt, UpdatedAt)
- Device.cs ✓ (has CreatedAt)  
- Media.cs ✓ (has CreatedAt)
- Schedule.cs ✓ (has CreatedAt)
- DeviceGroup.cs ✓ (has CreatedAt)
- Playlist.cs ✓ (has CreatedAt, UpdatedAt)
- Scene.cs ✓ (has CreatedAt, UpdatedAt)
- DeviceRegistrationRequest.cs ✓ (has CreatedAt)
- DeviceApproval.cs ✓ (has ApprovedAt)
- RegistrationAuditLog.cs ✓ (has CreatedAt)
- RefreshToken.cs ✓ (has CreatedAt, ExpiresAt)
- ScheduleMedia.cs (no audit fields - needs BaseEntity)
- PlaylistItem.cs (no audit fields - needs BaseEntity)
- PlaylistAssignment.cs (no audit fields - needs BaseEntity)
- SceneItem.cs (no audit fields - needs BaseEntity)
- PlaybackState.cs (has LastUpdated - convert to BaseEntity)
- Service.cs (no audit fields - needs BaseEntity)
- ServiceInstance.cs (has LastHeartbeat - partial audit)
- HealthCheckResult.cs (has CheckedAt - partial audit)

**Alternatives Considered**:
- Individual audit interfaces: Rejected due to code duplication
- Manual audit field management: Rejected due to inconsistency risk

### Q2: DateTime vs DateTimeOffset for audit fields?
**Decision**: DateTime without timezone (as requested)  
**Rationale**:
- User specifically requested "Datetime without timezone"
- Simpler for internal audit trails where timezone context is managed at application level
- Existing system uses DateTime consistently (User.CreatedAt, etc.)
- Application-level timezone handling in services/DTOs as needed

**Database Impact**:
- PostgreSQL: Will store as `timestamp without time zone`
- All timestamps stored in UTC by convention
- Display layer handles timezone conversion

**Alternatives Considered**:
- DateTimeOffset: Rejected per user requirement
- Unix timestamps: Rejected for readability

### Q3: System-generated audit trail handling?
**Decision**: Use system user ID (-1) for automated processes  
**Rationale**:
- Clear distinction between user actions and system actions
- Maintains audit trail completeness
- Existing pattern in refresh token cleanup and scheduled tasks

**Implementation**:
- CreatedBy = -1 for system processes
- CreatedBy = actual user ID for user actions
- Middleware captures current user context automatically

### Q4: Migration strategy for existing data?
**Decision**: Populate missing audit fields with migration timestamp and system user  
**Rationale**:
- Backward compatibility essential for production system
- Missing audit data better than null values
- Clear marker (migration timestamp) identifies legacy records

**Migration Approach**:
1. Add BaseEntity fields as nullable
2. Populate existing records with migration timestamp
3. Make fields non-nullable in subsequent migration
4. Preserve existing audit data where present

### Q5: EF Core configuration patterns?
**Decision**: Configure BaseEntity in OnModelCreating with common conventions  
**Rationale**:
- Central configuration reduces duplication
- Entity-specific configurations can override as needed
- Maintains existing configuration structure

**Configuration Strategy**:
```csharp
// In AppDbContext.OnModelCreating
modelBuilder.Entity<BaseEntity>(entity =>
{
    entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
    entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
    // Common audit field configurations
});
```

## Best Practices Research

### Entity Framework Core Inheritance
- **Abstract base classes**: Recommended for common fields
- **Table-per-hierarchy**: Not applicable (each entity has own table)
- **Shadow properties**: Avoid for audit fields (need C# access)

### Audit Trail Patterns
- **Automatic timestamping**: EF Core interceptors or SaveChanges override
- **User context injection**: Scoped service with current user info
- **System action identification**: Reserved user ID (-1) convention

### Migration Safety
- **Nullable-first approach**: Add fields as nullable, populate, then make required
- **Index considerations**: Add indexes for CreatedAt, UpdatedAt for query performance
- **Foreign key handling**: CreatedBy/UpdatedBy reference User table

## Technology Decisions

### Core Technologies (No Changes)
- **Entity Framework Core 8**: Continue using existing ORM
- **PostgreSQL**: Continue using existing database
- **xUnit**: Continue using existing test framework

### New Components Required
- **BaseEntity abstract class**: Domain layer foundation
- **IAuditableEntity interface**: Optional for explicit audit marking
- **AuditInterceptor**: EF Core interceptor for automatic population
- **Migration scripts**: Database schema updates

### Performance Considerations
- **Index strategy**: Add indexes on CreatedAt, CreatedBy for audit queries
- **Query impact**: Minimal (audit fields rarely in WHERE clauses)
- **Migration time**: Estimated 2-5 minutes for existing data population

## Risk Assessment
- **Low Risk**: Well-established patterns, incremental changes
- **Mitigation**: Comprehensive testing, staging environment validation
- **Rollback**: Database migration rollback procedures documented