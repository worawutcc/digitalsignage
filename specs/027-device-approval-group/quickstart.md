# Quickstart Guide: Device Approval and Group Management API

This guide provides a quick overview of the Device Approval and Group Management API implementation.

## Overview

This feature extends the existing Digital Signage system with:
- **Device Approval Workflow**: Review and approve/reject device registration requests
- **Device Group Management**: Organize devices into logical groups for content targeting
- **Content Assignment**: Assign content to device groups with priority-based delivery
- **Real-time Updates**: Live notifications for approval status and group changes

## Technical Stack

- **Backend**: C# .NET 8, ASP.NET Core Web API, Entity Framework Core 9
- **Database**: PostgreSQL with new tables for groups and approvals
- **Frontend**: Next.js 15, TypeScript, React 18, Redux Toolkit
- **Real-time**: SignalR WebSocket connections for live updates
- **Authentication**: JWT Bearer tokens with RBAC authorization

## API Endpoints

### Device Approval Workflow
```
GET    /api/v1/admin/devices/pending           # Get pending registrations
POST   /api/v1/admin/devices/{id}/approve      # Approve device registration
POST   /api/v1/admin/devices/{id}/reject       # Reject device registration
POST   /api/v1/admin/devices/bulk-approve      # Bulk approve multiple devices
```

### Device Group Management
```
GET    /api/v1/admin/device-groups             # List all device groups
POST   /api/v1/admin/device-groups             # Create new device group
PUT    /api/v1/admin/device-groups/{id}        # Update device group
DELETE /api/v1/admin/device-groups/{id}        # Delete device group
```

### Device-Group Assignment
```
POST   /api/v1/admin/device-groups/{groupId}/devices/{deviceId}           # Assign device to group
DELETE /api/v1/admin/device-groups/{groupId}/devices/{deviceId}           # Remove device from group
POST   /api/v1/admin/device-groups/{groupId}/devices/bulk-assign          # Bulk assign devices
```

### Content-Group Assignment
```
GET    /api/v1/admin/device-groups/{groupId}/content      # Get group content assignments
POST   /api/v1/admin/device-groups/{groupId}/content      # Assign content to group
DELETE /api/v1/admin/device-groups/{groupId}/content/{id} # Remove content assignment
```

## Data Model

### Core Entities
- **DeviceGroup**: Container for organizing devices
- **DeviceGroupMembership**: Many-to-many relationship between devices and groups
- **GroupContentAssignment**: Content assigned to device groups with priority
- **DeviceRegistrationRequest**: Extended with approval workflow fields
- **Device**: Extended with group membership tracking

### Key Relationships
- Device ↔ DeviceGroup (many-to-many through DeviceGroupMembership)
- DeviceGroup ↔ Content (many-to-many through GroupContentAssignment)
- User → DeviceGroup (creator/modifier tracking)

## WebSocket Events

Real-time updates are delivered via SignalR:
```typescript
// Device approval events
"device-approval-status-changed"    // Device approved/rejected
"device-registration-received"      // New device registration

// Group management events  
"device-group-created"              // New group created
"device-group-updated"              // Group modified
"device-group-deleted"              // Group deleted
"device-assigned-to-group"          // Device added to group
"device-removed-from-group"         // Device removed from group
"content-assigned-to-group"         // Content assigned to group
```

## Frontend Implementation

### Key Components
- **DeviceApprovalPanel**: Review and approve pending device registrations
- **DeviceGroupManager**: CRUD operations for device groups
- **DeviceAssignmentModal**: Assign devices to groups with bulk operations  
- **GroupContentManager**: Assign content to groups with priority management

### State Management
- Redux slices for device approvals, device groups, and assignments
- Real-time state updates via WebSocket event handlers
- Optimistic updates with error rollback for better UX

## Authentication & Authorization

### Required Permissions
- **Device Approval**: `CanApproveDevices` permission
- **Group Management**: `CanManageDeviceGroups` permission
- **Content Assignment**: `CanAssignContent` permission

### Security Features
- JWT Bearer token authentication for all API endpoints
- Role-based access control (RBAC) for fine-grained permissions
- Audit logging for all approval and assignment operations
- Input validation and sanitization for all request data

## Database Schema Changes

### New Tables
```sql
-- Device groups for organizing devices
CREATE TABLE DeviceGroups (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description VARCHAR(500),
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT NOW(),
    CreatedBy INT REFERENCES Users(Id),
    UpdatedAt TIMESTAMP DEFAULT NOW(),
    UpdatedBy INT REFERENCES Users(Id)
);

-- Many-to-many relationship between devices and groups
CREATE TABLE DeviceGroupMemberships (
    Id SERIAL PRIMARY KEY,
    DeviceGroupId INT REFERENCES DeviceGroups(Id),
    DeviceId INT REFERENCES Devices(Id),
    AssignedAt TIMESTAMP DEFAULT NOW(),
    AssignedBy INT REFERENCES Users(Id),
    Notes VARCHAR(500),
    Status VARCHAR(20) DEFAULT 'Assigned'
);

-- Content assignments to device groups
CREATE TABLE GroupContentAssignments (
    Id SERIAL PRIMARY KEY,
    DeviceGroupId INT REFERENCES DeviceGroups(Id),
    ContentType VARCHAR(50) NOT NULL,
    ContentId INT NOT NULL,
    Priority INT DEFAULT 1,
    AssignedAt TIMESTAMP DEFAULT NOW(),
    AssignedBy INT REFERENCES Users(Id),
    IsActive BOOLEAN DEFAULT TRUE,
    Notes VARCHAR(500)
);
```

### Extended Tables
```sql
-- Add approval workflow fields to device registrations
ALTER TABLE DeviceRegistrationRequests ADD COLUMN ApprovalStatus VARCHAR(20) DEFAULT 'Pending';
ALTER TABLE DeviceRegistrationRequests ADD COLUMN ApprovedBy INT REFERENCES Users(Id);
ALTER TABLE DeviceRegistrationRequests ADD COLUMN ApprovedAt TIMESTAMP;
ALTER TABLE DeviceRegistrationRequests ADD COLUMN RejectionReason VARCHAR(500);
ALTER TABLE DeviceRegistrationRequests ADD COLUMN ProcessedAt TIMESTAMP;

-- Add group assignment tracking to devices
ALTER TABLE Devices ADD COLUMN GroupCount INT DEFAULT 0;
ALTER TABLE Devices ADD COLUMN LastGroupAssignment TIMESTAMP;
```

## Testing Strategy

### Contract Tests
- API endpoint contract validation with expected request/response schemas
- Error response format validation
- Authentication and authorization contract testing

### Integration Tests
- End-to-end API workflow testing
- Database transaction and rollback testing
- WebSocket event delivery validation

### Unit Tests
- Service layer business logic testing
- Entity validation and relationship testing
- DTO mapping and transformation testing

## Development Workflow

1. **Database Migration**: Apply EF Core migrations for new schema
2. **Backend Services**: Implement service layer with business logic
3. **API Controllers**: Create REST endpoints with proper documentation
4. **WebSocket Hub**: Implement SignalR hub for real-time updates
5. **Frontend Components**: Build React components with TypeScript
6. **State Management**: Implement Redux slices and async thunks
7. **Integration**: Connect frontend to API with proper error handling
8. **Testing**: Validate functionality with automated tests

## Performance Considerations

- **Bulk Operations**: Optimized bulk device approval and assignment operations
- **Pagination**: Large device lists paginated for better performance
- **Caching**: Device group membership cached for faster content delivery queries
- **Indexing**: Database indexes on foreign keys and frequently queried columns
- **Connection Pooling**: Efficient database connection management

## Monitoring & Logging

- **Audit Logs**: All approval and assignment operations logged
- **Performance Metrics**: API response times and database query performance
- **Error Tracking**: Comprehensive error logging with context
- **Real-time Monitoring**: WebSocket connection status and event delivery tracking

## Next Steps

1. Execute implementation tasks following the data model and API contracts
2. Create database migrations for schema changes
3. Implement backend services and API controllers
4. Build frontend components with real-time updates
5. Add comprehensive test coverage
6. Deploy and validate functionality in staging environment