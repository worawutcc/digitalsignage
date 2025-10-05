# Data Model: Device Approval + Group Management System

**Feature**: Device Approval + Group Management System  
**Date**: 2025-01-27  
**Status**: Phase 1 Design

## Integration with Existing Schema

**Important**: This feature **integrates** with existing database schema rather than creating new tables.

### Existing Tables Analysis:
- ✅ **DeviceRegistrationRequests** - Already exists with approval workflow
- ✅ **DeviceApprovals** - Already exists with admin approval/rejection
- ✅ **DeviceGroups** - Already exists with hierarchical structure  
- ✅ **Devices** - Already exists with group relationships
- ✅ **Users** - Already exists with RBAC permissions

## Entity Integration Plan

### 1. DeviceGroup (Existing Entity - Enhancement)

**Current State**: Already implemented with hierarchical parent/child structure

```csharp
public class DeviceGroup : BaseEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;           // Max 200 chars
    public string Description { get; set; } = string.Empty;    // Max 1000 chars  
    public bool IsActive { get; set; } = true;                // Soft delete support
    
    // Hierarchical structure (existing)
    public int? ParentGroupId { get; set; }
    public DeviceGroup? ParentGroup { get; set; }
    public ICollection<DeviceGroup> ChildGroups { get; set; } = new List<DeviceGroup>();
    
    // User management (existing)
    public int? CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }
    
    // Navigation Properties (existing)
    public ICollection<Device> Devices { get; set; } = new List<Device>();
    public ICollection<PlaylistAssignment> PlaylistAssignments { get; set; } = new List<PlaylistAssignment>();
    public ICollection<UserDeviceGroupPermission> UserPermissions { get; set; } = new List<UserDeviceGroupPermission>();
}
```

**Enhancement Needed**: Add content assignment capabilities

### 2. Device-Group Relationship (Existing - Direct Relationship)

**Current State**: Devices already have direct relationship to DeviceGroup via `DeviceGroupId`

```csharp
public class Device : BaseEntity
{
    // Existing group relationship
    public int? DeviceGroupId { get; set; }
    public DeviceGroup? DeviceGroup { get; set; }
    
    // Existing approval tracking
    public DeviceStatus Status { get; set; }  // Pending, Registered, Active, etc.
    public int? ManagedByUserId { get; set; }
    public User? ManagedByUser { get; set; }
}
```

**Enhancement Needed**: 
- **Option 1**: Keep simple 1:many relationship (Device belongs to one group)
- **Option 2**: Create `DeviceGroupMembership` for many:many if multi-group support needed

### 3. Content Assignment (Existing - PlaylistAssignment Integration)

**Current State**: Groups already have content assignment via `PlaylistAssignment`

```csharp
public class PlaylistAssignment : BaseEntity
{
    public int Id { get; set; }
    public int PlaylistId { get; set; }
    public int DeviceId { get; set; }                        // Direct device assignment
    public int? DeviceGroupId { get; set; }                  // Group-level assignment (existing!)
    public int Priority { get; set; }
    public DateTime AssignedAt { get; set; }
    public int? AssignedByUserId { get; set; }
    
    // Navigation Properties
    public Playlist Playlist { get; set; } = null!;
    public Device? Device { get; set; }
    public DeviceGroup? DeviceGroup { get; set; }
    public User? AssignedByUser { get; set; }
}
```

**Enhancement Needed**: 
- **Extend existing PlaylistAssignment** for group-level content distribution
- **Add Media-level assignments** if direct media assignment to groups is needed

### 4. DeviceRegistrationRequest (Existing - Already Complete)

**Current State**: Full approval workflow already implemented

```csharp
public class DeviceRegistrationRequest : BaseEntity
{
    public int Id { get; set; }
    public Guid RegistrationId { get; set; }                 // Public identifier
    public string MacAddress { get; set; } = string.Empty;
    public string Pin { get; set; } = string.Empty;
    public RegistrationStatus Status { get; set; } = RegistrationStatus.Pending;
    
    // User matching (Feature 019)
    public int? MatchedUserId { get; set; }
    public User? MatchedUser { get; set; }
    
    // Approval tracking
    public int? ApprovedDeviceId { get; set; }
    public Device? ApprovedDevice { get; set; }
    
    // Navigation Properties
    public DeviceApproval? DeviceApproval { get; set; }      // 1:1 relationship
    public ICollection<RegistrationAuditLog> AuditLogs { get; set; }
}
```

**Enhancement Needed**: None - approval workflow is complete

### 5. DeviceApproval (Existing - Already Complete)

**Current State**: Full approval workflow with admin decision tracking

```csharp
public class DeviceApproval : BaseEntity
{
    public int Id { get; set; }
    public int DeviceRegistrationRequestId { get; set; }     // 1:1 with registration
    public int ApprovedByUserId { get; set; }                // Admin who made decision
    public ApprovalStatus Status { get; set; }              // Approved/Rejected
    
    // Admin assignment fields
    public string DeviceName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int? DeviceGroupId { get; set; }                  // Group assignment during approval
    public int? InitialScheduleId { get; set; }             // Initial content assignment
    public string Notes { get; set; } = string.Empty;       // Admin notes
    public string? DeviceKey { get; set; }                  // Generated key for approved devices
    
    // Navigation Properties
    public DeviceRegistrationRequest DeviceRegistrationRequest { get; set; } = null!;
    public User ApprovedByUser { get; set; } = null!;
    public DeviceGroup? DeviceGroup { get; set; }
    public Schedule? InitialSchedule { get; set; }
}
```

**Enhancement Needed**: None - approval workflow is complete with group assignment

## Entity Relationships (Existing Schema)

```
DeviceRegistrationRequest 1 ──────→ 1 DeviceApproval (approval decision)
DeviceApproval 1 ──────→ 1 Device (creates approved device)
Device N ──────→ 1 DeviceGroup (simple group membership)
DeviceGroup 1 ──────→ N PlaylistAssignment (content distribution)
DeviceGroup 1 ──────→ 1 DeviceGroup (hierarchical parent/child)
User 1 ──────→ N DeviceApproval (as ApprovedByUser)
User 1 ──────→ N DeviceGroup (as CreatedByUser)
User 1 ──────→ N PlaylistAssignment (as AssignedByUser)
```

**Key Integration Points**:
- ✅ **Device Approval**: Complete workflow via `DeviceApproval` entity
- ✅ **Group Management**: Hierarchical structure via `DeviceGroup` entity  
- ✅ **Content Assignment**: Via `PlaylistAssignment` with `DeviceGroupId`
- ✅ **User Management**: RBAC via `UserDeviceGroupPermission`

## Database Schema Changes

### ✅ No New Tables Required

**All required functionality exists in current schema:**

```sql
-- ✅ DeviceGroups - Already exists with hierarchical structure
SELECT * FROM DeviceGroups WHERE IsActive = TRUE;

-- ✅ DeviceApprovals - Already exists with full approval workflow
SELECT * FROM DeviceApprovals WHERE Status = 'Approved';

-- ✅ DeviceRegistrationRequests - Already exists with complete fields
SELECT * FROM DeviceRegistrationRequests WHERE Status = 'Pending';

-- ✅ Devices - Already exists with group relationship
SELECT * FROM Devices d JOIN DeviceGroups dg ON d.DeviceGroupId = dg.Id;

-- ✅ PlaylistAssignments - Already supports group-level content assignment
SELECT * FROM PlaylistAssignments WHERE DeviceGroupId IS NOT NULL;
```

### Optional Enhancements (If Needed)

**Option 1**: Add bulk operations support
```sql
-- Add bulk approval tracking (optional)
ALTER TABLE DeviceApprovals 
ADD COLUMN BulkApprovalId UUID DEFAULT NULL,
ADD COLUMN ProcessedInBatch BOOLEAN DEFAULT FALSE;
```

**Option 2**: Add direct Media-to-Group assignment (if playlist is not sufficient)
```sql
-- Only if direct media assignment to groups is needed
CREATE TABLE GroupMediaAssignments (
    Id SERIAL PRIMARY KEY,
    DeviceGroupId INTEGER NOT NULL REFERENCES DeviceGroups(Id),
    MediaId INTEGER NOT NULL REFERENCES Medias(Id),
    Priority INTEGER NOT NULL DEFAULT 1,
    AssignedAt TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC'),
    AssignedByUserId INTEGER REFERENCES Users(Id),
    IsActive BOOLEAN DEFAULT TRUE
);
```

### ✅ Existing Indexes (Already Optimized)

```sql
-- ✅ Device approval indexes (already exist)
CREATE INDEX IX_DeviceApprovals_Status ON DeviceApprovals(Status);
CREATE INDEX IX_DeviceApprovals_ApprovedByUserId ON DeviceApprovals(ApprovedByUserId);
CREATE INDEX IX_DeviceApprovals_DeviceRegistrationRequestId ON DeviceApprovals(DeviceRegistrationRequestId);

-- ✅ Device group indexes (already exist)  
CREATE INDEX IX_DeviceGroups_IsActive ON DeviceGroups(IsActive);
CREATE INDEX IX_DeviceGroups_CreatedByUserId ON DeviceGroups(CreatedByUserId);
CREATE INDEX IX_DeviceGroups_ParentGroupId ON DeviceGroups(ParentGroupId);

-- ✅ Device indexes (already exist)
CREATE INDEX IX_Devices_DeviceGroupId ON Devices(DeviceGroupId);
CREATE INDEX IX_Devices_Status ON Devices(Status);

-- ✅ Registration request indexes (already exist)
CREATE INDEX IX_DeviceRegistrationRequests_Status ON DeviceRegistrationRequests(Status);
CREATE INDEX IX_DeviceRegistrationRequests_MacAddress ON DeviceRegistrationRequests(MacAddress);

-- ✅ Playlist assignment indexes (already exist)
CREATE INDEX IX_PlaylistAssignments_DeviceGroupId ON PlaylistAssignments(DeviceGroupId);
CREATE INDEX IX_PlaylistAssignments_DeviceId ON PlaylistAssignments(DeviceId);
```

## Query Patterns (Using Existing Schema)

### Device Approval Queries

```sql
-- Get pending device registrations (existing)
SELECT drr.*, da.Status as ApprovalStatus 
FROM DeviceRegistrationRequests drr
LEFT JOIN DeviceApprovals da ON drr.Id = da.DeviceRegistrationRequestId
WHERE drr.Status = 'Pending' AND drr.ExpiresAt > NOW()
ORDER BY drr.CreatedAt ASC;

-- Bulk approve devices (existing workflow)
SELECT drr.*, da.DeviceName, da.DeviceKey
FROM DeviceRegistrationRequests drr
INNER JOIN DeviceApprovals da ON drr.Id = da.DeviceRegistrationRequestId
WHERE da.Status = 'Approved' AND da.CreatedAt >= @startTime;
```

### Device Group Management Queries

```sql
-- Get all devices in a group (existing relationship)
SELECT d.*, dg.Name as GroupName 
FROM Devices d 
INNER JOIN DeviceGroups dg ON d.DeviceGroupId = dg.Id
WHERE d.DeviceGroupId = @groupId AND dg.IsActive = TRUE;

-- Get hierarchical group structure (existing)
WITH RECURSIVE GroupHierarchy AS (
    SELECT Id, Name, ParentGroupId, 0 as Level, Name as Path
    FROM DeviceGroups WHERE ParentGroupId IS NULL
    UNION ALL
    SELECT dg.Id, dg.Name, dg.ParentGroupId, gh.Level + 1, 
           gh.Path || ' > ' || dg.Name
    FROM DeviceGroups dg
    INNER JOIN GroupHierarchy gh ON dg.ParentGroupId = gh.Id
)
SELECT * FROM GroupHierarchy ORDER BY Path;

-- Get group content assignments (existing via playlists)
SELECT pa.*, p.Name as PlaylistName, dg.Name as GroupName
FROM PlaylistAssignments pa
INNER JOIN Playlists p ON pa.PlaylistId = p.Id
INNER JOIN DeviceGroups dg ON pa.DeviceGroupId = dg.Id
WHERE pa.DeviceGroupId = @groupId AND pa.IsActive = TRUE
ORDER BY pa.Priority DESC;
```

### Performance Considerations (Existing Optimizations)

- ✅ Composite indexes already exist for common query patterns
- ✅ Soft deletes implemented with `IsActive` flags
- ✅ TIMESTAMP WITHOUT TIME ZONE consistently used
- ✅ Audit trails via `RegistrationAuditLog` and `PermissionAuditLog`

## Integration Approach Summary

### ✅ What Already Works
1. **Device Approval**: Complete workflow via `DeviceApproval` entity with admin decision tracking
2. **Device Groups**: Hierarchical structure with parent/child relationships  
3. **Content Assignment**: Group-level content via `PlaylistAssignment.DeviceGroupId`
4. **User Permissions**: RBAC via `UserDeviceGroupPermission`
5. **Audit Logging**: Comprehensive tracking via audit log tables

### 🔧 What Needs Enhancement
1. **API Layer**: Extend existing controllers for bulk operations
2. **Business Logic**: Add group-specific content assignment methods
3. **UI Components**: Build management interfaces for existing entities
4. **Real-time Updates**: WebSocket events for approval status changes

### 🚫 What We DON'T Need to Create
1. ❌ New database tables (all entities exist)
2. ❌ New approval workflow (already implemented)
3. ❌ New group structure (hierarchical groups exist)
4. ❌ New content assignment (playlist assignments exist)

## Integration Strategy

### Phase 1: API Enhancement
- Extend `AdminDeviceRegistrationController` for bulk operations
- Extend `DeviceGroupController` for hierarchical management
- Add group-level content assignment endpoints

### Phase 2: Service Layer Enhancement  
- Enhance `DeviceRegistrationService` for bulk approval workflows
- Enhance `DeviceGroupService` for content distribution
- Add real-time notification services

### Phase 3: UI Development
- Build device approval management interface
- Build group management interface with hierarchy view
- Build content assignment interface for groups

**Design Status**: Integration strategy complete - Focus on API/Service enhancements rather than new entities