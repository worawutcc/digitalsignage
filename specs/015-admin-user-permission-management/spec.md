# Admin User Permission Management

## Overview
Implement comprehensive admin control over user permissions for device groups in the digital signage system. This feature extends the existing JWT authentication and hierarchical device group structure to provide granular Role-Based Access Control (RBAC) with a four-tier permission system.

## Business Requirements

### User Stories
- **As an admin**, I want to assign specific permission levels to users for device groups so that I can control what each user can do with different sets of devices
- **As an admin**, I want to view and modify user permissions across the device hierarchy so that I can maintain proper access control
- **As an admin**, I want to see an audit trail of permission changes so that I can maintain compliance and track who made what changes
- **As a user**, I want to see only the device groups I have access to so that I don't see irrelevant content
- **As a user**, I want my permissions to be inherited hierarchically so that if I have access to a parent group, I automatically get access to child groups

### Business Rules
1. **Four-Tier Permission System**: NoAccess, ViewOnly, ManageContent, FullControl
2. **Hierarchical Inheritance**: Permissions granted on parent groups automatically apply to child groups
3. **Explicit Override**: Child-level permissions can override inherited parent permissions
4. **Admin Full Access**: Users with admin role have FullControl on all device groups
5. **Audit Trail**: All permission changes must be logged with timestamp, admin user, and reason
6. **Default Access**: New users start with NoAccess to all device groups unless explicitly granted

## Technical Requirements

### Permission Levels
```csharp
public enum UserPermissionLevel
{
    NoAccess = 0,      // Cannot see or interact with device group
    ViewOnly = 1,      // Can view devices and their content/schedules (read-only)
    ManageContent = 2, // Can upload media, create schedules, manage content
    FullControl = 3    // Can modify device settings, manage users, delete content
}
```

### Core Entities

#### UserDeviceGroupPermission
- Links User to DeviceGroup with specific permission level
- Tracks inheritance vs explicit assignment
- Supports permission override at any hierarchy level

#### PermissionAuditLog
- Comprehensive audit trail for all permission changes
- Tracks who made changes, when, what changed, and why
- Immutable record for compliance

### API Requirements

#### Admin Endpoints
```
POST   /api/admin/users/{userId}/permissions          # Set user permissions for device groups
GET    /api/admin/users/{userId}/permissions          # Get user permissions (effective + explicit)
PUT    /api/admin/users/{userId}/permissions/{groupId} # Update specific permission
DELETE /api/admin/users/{userId}/permissions/{groupId} # Remove explicit permission (revert to inherited)
GET    /api/admin/permissions/audit                   # Get permission change audit log
```

#### User Endpoints  
```
GET /api/user/accessible-device-groups  # Get device groups user has access to
GET /api/user/permissions               # Get current user's effective permissions
```

### Integration Points

#### Authentication System (009-authentication-system)
- Extend JWT authentication to include permission validation
- Add permission-based middleware for API endpoints
- Integrate with existing admin role checking

#### Hierarchical Device Groups (014-basic-hierarchy)
- Build upon existing DeviceGroup hierarchy
- Implement permission inheritance through parent-child relationships
- Ensure compatibility with existing device management

#### QR Code Registration (013-qr-code-system)
- New users created through QR registration start with NoAccess
- Admin must explicitly grant permissions after user creation

## Database Schema

### UserDeviceGroupPermission Table
```sql
CREATE TABLE UserDeviceGroupPermissions (
    Id SERIAL PRIMARY KEY,
    UserId INT NOT NULL REFERENCES Users(Id),
    DeviceGroupId INT NOT NULL REFERENCES DeviceGroups(Id),
    Permission INT NOT NULL, -- UserPermissionLevel enum
    IsExplicit BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CreatedBy INT NOT NULL REFERENCES Users(Id),
    UNIQUE(UserId, DeviceGroupId)
);
```

### PermissionAuditLog Table
```sql
CREATE TABLE PermissionAuditLogs (
    Id SERIAL PRIMARY KEY,
    UserId INT NOT NULL REFERENCES Users(Id),
    DeviceGroupId INT NOT NULL REFERENCES DeviceGroups(Id),
    PreviousPermission INT, -- NULL for new permissions
    NewPermission INT,      -- NULL for deleted permissions
    Action VARCHAR(50) NOT NULL, -- 'GRANTED', 'MODIFIED', 'REVOKED'
    Reason TEXT,
    ChangedBy INT NOT NULL REFERENCES Users(Id),
    ChangedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Security Considerations

### Authorization Rules
1. **Admin Only**: Only users with admin role can modify permissions
2. **Self-Service**: Regular users can only view their own permissions
3. **Audit Security**: Audit logs are read-only and cannot be modified
4. **Permission Validation**: All API endpoints validate user permissions before allowing actions

### Data Protection
- Sensitive permission data must be protected from unauthorized access
- Audit logs must be immutable and tamper-proof
- Permission changes require admin authentication with JWT validation

## Performance Considerations

### Caching Strategy
- Cache effective user permissions to avoid recursive hierarchy calculations
- Invalidate cache when permission or hierarchy changes occur
- Use Redis or in-memory caching for frequently accessed permissions

### Database Optimization
- Index on (UserId, DeviceGroupId) for permission lookups
- Index on DeviceGroupId for hierarchy traversal
- Partitioning audit logs by date for large-scale deployments

## Testing Strategy

### Unit Tests
- Permission calculation logic (inheritance, overrides)
- UserPermissionLevel enum operations
- Repository methods for CRUD operations

### Integration Tests
- API endpoints with various permission scenarios
- Database constraint validation
- Authentication middleware integration

### User Acceptance Tests
- Admin permission management workflows
- User access validation scenarios
- Audit trail verification

## Migration Strategy

### Database Migration
1. Create new tables (UserDeviceGroupPermissions, PermissionAuditLogs)
2. Populate default NoAccess permissions for existing users
3. Grant FullControl to existing admin users
4. Create necessary indexes and constraints

### Existing User Impact
- Existing users maintain their current access through admin role
- New permission system runs parallel to existing authentication
- Gradual migration of access control to new RBAC system

## Success Criteria

### Functional Requirements
- ✅ Admins can assign four-tier permissions to users for device groups
- ✅ Permissions inherit hierarchically through device group structure
- ✅ Users see only device groups they have access to
- ✅ Complete audit trail of all permission changes
- ✅ API endpoints protect resources based on user permissions

### Performance Requirements
- Permission validation < 100ms for typical user requests
- Support 1000+ concurrent users with cached permissions
- Audit log retention for 2+ years without performance degradation

### Security Requirements
- All permission changes require admin authentication
- Audit logs are tamper-proof and immutable
- No unauthorized access to protected device groups or content

## Dependencies

### Prerequisites
- 009-authentication-system: JWT authentication with admin roles
- 014-basic-hierarchy: Hierarchical device group structure
- 013-qr-code-system: User registration and management

### Technology Stack
- C# .NET 8 with ASP.NET Core Web API
- Entity Framework Core 9 with PostgreSQL
- JWT Bearer Authentication
- log4net for audit logging
- AutoMapper for DTO mapping

## Future Enhancements

### Phase 2 Features
- **Role Templates**: Predefined permission sets for common user types
- **Bulk Permission Management**: Assign permissions to multiple users simultaneously
- **Time-based Permissions**: Temporary access with automatic expiration
- **Advanced Audit**: Detailed reporting and analytics on permission usage

### Integration Opportunities
- **Single Sign-On (SSO)**: Integration with enterprise identity providers
- **API Rate Limiting**: Permission-based API quotas and throttling
- **Content Approval Workflow**: Permission-based content review process