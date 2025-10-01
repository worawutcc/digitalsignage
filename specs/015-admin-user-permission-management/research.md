# Research: Admin User Permission Management

## Decision Log

### D1: Four-Tier Permission System Design
**Decision**: Implement NoAccess(0), ViewOnly(1), ManageContent(2), FullControl(3) as integer enum
**Rationale**: 
- Numeric ordering enables hierarchical comparison (ManageContent > ViewOnly)
- Maps cleanly to database integer storage for performance
- Extensible design allows future permission levels between existing ones
- Standard RBAC pattern used in enterprise systems

**Alternatives Considered**:
- String-based permissions: Rejected due to comparison complexity and storage overhead
- Bitflag permissions: Rejected due to inheritance calculation complexity
- Role-based only: Rejected due to inflexibility for device-specific access

### D2: Hierarchical Permission Inheritance Strategy
**Decision**: Parent permissions automatically apply to child device groups with explicit override capability
**Rationale**:
- Reduces admin overhead for large hierarchical structures
- Follows principle of least surprise (enterprise users expect inheritance)
- Explicit override provides necessary flexibility for exceptions
- Supports common pattern of department-level permissions with team-level exceptions

**Alternatives Considered**:
- Explicit-only permissions: Rejected due to administrative overhead
- Single-level permissions: Rejected due to hierarchy management complexity
- Role-based inheritance: Rejected due to inflexibility across device hierarchies

### D3: Audit Log Implementation
**Decision**: Immutable PermissionAuditLog table with before/after values, admin identity, and reason tracking
**Rationale**:
- Compliance requirement for enterprise deployments
- Debugging and security investigation capability
- Change tracking with accountability (who, what, when, why)
- Append-only design ensures tamper-proof audit trail

**Alternatives Considered**:
- Event sourcing: Rejected due to implementation complexity for permission use case
- External audit service: Rejected due to dependency and latency concerns
- Application logging only: Rejected due to lack of structured queryability

### D4: Performance Optimization Strategy
**Decision**: In-memory caching of effective user permissions with hierarchical pre-calculation
**Rationale**:
- Permission validation is hot path for every API request
- Hierarchical calculation expensive for deep device trees
- Cache invalidation manageable for permission change events
- Redis/Memory cache provides sub-millisecond lookup times

**Alternatives Considered**:
- Database materialized views: Rejected due to PostgreSQL migration complexity
- Real-time calculation: Rejected due to performance impact on API requests
- File-based caching: Rejected due to distributed deployment requirements

### D5: Database Schema Design
**Decision**: UserDeviceGroupPermissions table with composite unique constraint and separate audit table
**Rationale**:
- Normalized design avoids permission duplication
- Composite key ensures one permission per user-group pair
- Separate audit table optimizes query performance for permission lookups
- Foreign key constraints ensure referential integrity

**Alternatives Considered**:
- Single permissions table with audit columns: Rejected due to performance impact
- User table extension: Rejected due to serialization complexity
- JSON column permissions: Rejected due to query and indexing limitations

## Best Practices Research

### Entity Framework Core Optimization
**Findings**:
- Use `HasIndex()` for composite keys on (UserId, DeviceGroupId) lookups
- Configure cascade deletes carefully for permission cleanup
- Use `IQueryable` projection for permission DTOs to avoid N+1 queries
- Consider `IgnoreQueryFilters()` for admin permission management

**Implementation Guidelines**:
- Implement `IEntityTypeConfiguration<T>` for clean entity configuration
- Use `TimeStamp` columns for optimistic concurrency on permission changes
- Configure JSON serialization settings for audit log structured data

### ASP.NET Core Authorization Integration
**Findings**:
- Custom `IAuthorizationRequirement` for device-group-specific permissions
- Permission-based middleware for controller action authorization
- Claims-based approach for JWT token permission embedding (with cache fallback)
- Resource-based authorization for device-specific operations

**Implementation Guidelines**:
- Implement `AuthorizationHandler<PermissionRequirement, DeviceGroup>`
- Use `[Authorize(Policy = "DeviceGroupAccess")]` on controllers
- Cache user permissions in JWT claims with expiration handling
- Provide fallback to database when claims outdated

### Audit Trail Compliance Patterns
**Findings**:
- ISO 27001 requires who, what, when, where, why for access control changes
- Immutable append-only audit design with retention policies
- Structured logging integration for operational monitoring
- Export capabilities for compliance reporting

**Implementation Guidelines**:
- Include client IP, user agent, and session context in audit logs
- Implement audit log retention with automated archival
- Provide audit trail query APIs for compliance officers
- Integration with log4net for operational audit event correlation

## Integration Analysis

### JWT Authentication System (009-authentication-system)
**Current State**: JWT-based authentication with admin role support
**Integration Points**:
- Extend JWT claims to include effective permissions summary
- Permission validation middleware integrates with existing auth pipeline
- Admin role checking reused for permission management operations
- Token refresh triggers permission cache invalidation

**Migration Strategy**:
- Phase 1: Add permission tables, maintain existing auth behavior
- Phase 2: Integrate permission middleware for new endpoints
- Phase 3: Gradually migrate existing endpoints to permission-based auth

### Hierarchical Device Groups (014-basic-hierarchy)
**Current State**: Parent-child device group relationships with navigation properties
**Integration Points**:
- Permission inheritance follows existing device group hierarchy
- Device group deletion must cascade permission cleanup
- Group restructuring triggers permission recalculation
- Query optimization for permission-filtered device group lists

**Implementation Considerations**:
- Use existing `DeviceGroup.Parent` and `DeviceGroup.Children` properties
- Implement recursive CTE queries for permission inheritance calculation
- Cache device group tree structure for permission calculation performance

### QR Code Registration System (013-qr-code-system)
**Current State**: QR-based device registration with user creation
**Integration Points**:
- New users start with NoAccess to all device groups
- Admin approval workflow triggers permission assignment
- User registration includes email field for permission notifications
- Self-service permission requests through QR registration context

**Enhancement Opportunities**:
- QR registration can include suggested device group context
- Permission pre-approval for specific registration scenarios
- Automated permission assignment based on registration metadata