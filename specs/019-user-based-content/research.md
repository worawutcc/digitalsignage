# Research: User-Based Content Assignment

**Feature**: 019-user-based-content  
**Date**: 2025-10-02  
**Status**: Complete

## Research Questions

### 1. Database Schema Design for User-Content Relationships

**Question**: What's the best approach for modeling user-to-schedule assignments while maintaining flexibility and query performance?

**Decision**: Junction table (`UserSchedule`) with unique constraint on (UserId, ScheduleId)

**Rationale**:
- Clean many-to-many relationship between Users and Schedules
- Allows tracking assignment metadata (assigned by, assigned at)
- Enables efficient queries with proper indexes
- Follows existing pattern used for `DeviceGroupSchedule`
- Supports future extensions (e.g., priority per assignment, expiration dates)

**Alternatives Considered**:
- **Direct foreign key in Schedule**: Rejected - doesn't support one schedule to many users
- **JSON column in User table**: Rejected - difficult to query, no referential integrity
- **Separate ScheduleAssignment entity**: Rejected - unnecessary abstraction for current needs

**Implementation Notes**:
- Add unique index on (UserId, ScheduleId) to prevent duplicates
- Add index on UserId for efficient lookup
- Use ON DELETE CASCADE for cleanup when user or schedule deleted
- Store AssignedByUserId for audit trail

### 2. Priority-Based Content Delivery Strategy

**Question**: How to efficiently implement three-tier priority (User > Group > Default) without complex query logic?

**Decision**: Sequential query approach with early return

**Rationale**:
- Simple to understand and maintain
- Each tier is independent query with clear scope
- Early return prevents unnecessary database queries
- Aligns with YAGNI principle - no premature optimization
- Easy to debug and test each tier independently

**Alternatives Considered**:
- **Single complex query with COALESCE**: Rejected - difficult to read, harder to debug
- **Scoring system with single query**: Rejected - unnecessary complexity
- **Caching all three tiers**: Rejected - premature optimization

**Implementation Notes**:
```csharp
// Pseudo-code for priority logic
if (device.AssignedUserId.HasValue) {
    var userSchedules = QueryUserSchedules(device.AssignedUserId);
    if (userSchedules.Any()) return userSchedules;
}

if (device.DeviceGroupId.HasValue) {
    var groupSchedules = QueryGroupSchedules(device.DeviceGroupId);
    if (groupSchedules.Any()) return groupSchedules;
}

return QueryDefaultSchedules();
```

### 3. User Matching During Registration

**Question**: Should user matching be automatic, manual, or hybrid?

**Decision**: Hybrid approach - automatic matching with admin override

**Rationale**:
- Reduces admin workload for existing users (90% case)
- Provides safety net for mismatches or new users
- Supports flexibility for complex organizational structures
- Clear audit trail of who approved what

**Alternatives Considered**:
- **Fully automatic**: Rejected - no admin control, potential security issue
- **Fully manual**: Rejected - too much admin overhead for obvious matches
- **Fuzzy matching**: Rejected - too complex for MVP, potential false positives

**Implementation Notes**:
- Match on exact email address only (case-insensitive)
- Store both RequestedUsername and MatchedUserId
- Admin can confirm, change, or clear user assignment
- Log all matching decisions for audit

### 4. Backward Compatibility Strategy

**Question**: How to ensure existing devices continue working after adding user assignment?

**Decision**: Nullable foreign key with fallback behavior

**Rationale**:
- Existing devices have `AssignedUserId = NULL`
- NULL assignment triggers fallback to group/default schedules
- No migration needed for existing devices
- Gradual rollout possible - assign users over time

**Alternatives Considered**:
- **Mandatory user assignment**: Rejected - breaks existing devices
- **Separate device types**: Rejected - unnecessary complexity
- **Feature flag**: Rejected - adds runtime complexity

**Implementation Notes**:
```csharp
public int? AssignedUserId { get; set; }  // Nullable FK
```
- Devices with NULL continue using group/default logic
- Admin can assign users at any time
- No breaking changes to existing API

### 5. Schedule Assignment Replacement vs. Append

**Question**: Should new schedule assignments replace or append to existing assignments?

**Decision**: Replace (not append)

**Rationale**:
- Simpler mental model for admins - "this user sees these schedules"
- Prevents accumulation of stale assignments
- Easier to audit - current state is complete state
- Matches expectation set by UI (select schedules = these are the schedules)

**Alternatives Considered**:
- **Append mode**: Rejected - requires explicit "remove" workflow, more complexity
- **Explicit add/remove operations**: Rejected - more API complexity, harder to use
- **Versioning system**: Rejected - overkill for current needs

**Implementation Notes**:
```csharp
// Remove all existing assignments
_context.UserSchedules.RemoveRange(
    _context.UserSchedules.Where(us => us.UserId == userId)
);

// Add new assignments
foreach (var scheduleId in request.ScheduleIds) {
    _context.UserSchedules.Add(new UserSchedule { ... });
}
```

### 6. Performance Optimization for Large Scale

**Question**: How to handle 10,000+ users and 1000+ devices efficiently?

**Decision**: Database indexes + query optimization, evaluate caching later

**Rationale**:
- Start with proper indexes (80% of performance gains)
- EF Core query optimization with Include/ThenInclude
- Caching adds complexity - only add if proven necessary
- PostgreSQL can handle this scale with proper indexes

**Alternatives Considered**:
- **Redis caching layer**: Rejected - premature optimization
- **Pre-computed schedule assignments**: Rejected - stale data issues
- **Event sourcing**: Rejected - massive complexity increase

**Implementation Notes**:
- Index on `Devices.AssignedUserId`
- Index on `UserSchedules(UserId, ScheduleId)` (unique)
- Index on `Schedules.IsDefault`
- Use `.AsNoTracking()` for read-only queries
- Eager load related entities to prevent N+1 queries

**Monitoring Strategy**:
- Log query execution times
- Alert if content requests exceed 2s
- Database query analysis in staging before production
- Add caching if p95 latency exceeds threshold

### 7. Entity Framework Core Migration Strategy

**Question**: How to structure the migration to minimize downtime and risk?

**Decision**: Single migration with backward-compatible changes

**Rationale**:
- All changes are additive (new columns, new table)
- Nullable foreign keys prevent breaking existing data
- Can be applied during maintenance window
- Rollback plan: revert migration if issues found

**Alternatives Considered**:
- **Multiple migrations**: Rejected - more deployment complexity
- **Blue-green deployment**: Rejected - overkill for additive changes
- **Manual SQL scripts**: Rejected - loses EF Core migration tracking

**Implementation Notes**:
```csharp
// Migration includes:
// 1. ALTER TABLE Devices ADD AssignedUserId INT NULL
// 2. ALTER TABLE DeviceRegistrationRequests ADD RequestedUsername, MatchedUserId
// 3. ALTER TABLE Schedules ADD IsDefault BIT DEFAULT 0
// 4. CREATE TABLE UserSchedules
// 5. CREATE INDEXES
// 6. ADD FOREIGN KEY CONSTRAINTS
```

**Rollback Plan**:
```bash
# If issues found, rollback migration
dotnet ef database update [PreviousMigration]
```

### 8. API Versioning Considerations

**Question**: Do we need API versioning for these changes?

**Decision**: No versioning needed - backward compatible

**Rationale**:
- New endpoints don't break existing ones
- Updated endpoints add optional fields only
- Device registration schema extended (not changed)
- Existing devices continue to work without changes

**Alternatives Considered**:
- **v2 API endpoints**: Rejected - no breaking changes to warrant v2
- **Feature toggle**: Rejected - unnecessary for additive changes
- **Separate microservice**: Rejected - monolith is appropriate for current scale

**Implementation Notes**:
- `DeviceRegistrationRequestDto` adds optional `RequestedUsername`
- `ApproveRegistrationRequest` adds optional `AssignedUserId`
- All new endpoints follow existing auth patterns
- Swagger documentation updated with new endpoints

### 9. Security and Authorization

**Question**: What authorization rules apply to new endpoints?

**Decision**: Role-based access control following existing patterns

**Rationale**:
- Reuse existing RBAC system (Admin, DeviceManager, ContentManager)
- Principle of least privilege
- Audit logging for all sensitive operations

**Implementation Notes**:
```csharp
// Device approval - Admin or DeviceManager only
[Authorize(Roles = "Admin,DeviceManager")]
POST /api/device/approve-registration

// Schedule assignment - Admin or ContentManager
[Authorize(Roles = "Admin,ContentManager")]
POST /api/schedule/assign-to-user

// User assignment changes - Admin or DeviceManager
[Authorize(Roles = "Admin,DeviceManager")]
POST /api/device/{id}/assign-user

// Content delivery - Device authentication only
[Authorize(AuthenticationSchemes = "DeviceKey")]
GET /api/device/schedules
```

### 10. Testing Strategy

**Question**: What test coverage is needed for this feature?

**Decision**: Multi-layered testing approach

**Rationale**:
- Unit tests for business logic (priority resolution, user matching)
- Integration tests for API endpoints and database operations
- Contract tests for DTOs and data models
- End-to-end scenarios for user workflows

**Test Categories**:

1. **Unit Tests** (DigitalSignage.Application.Tests):
   - `DeviceService.ApproveRegistrationAsync` with user matching
   - `ScheduleService.GetSchedulesForDeviceAsync` priority logic
   - `ScheduleService.AssignSchedulesToUserAsync` validation

2. **Integration Tests** (DigitalSignage.Api.Tests):
   - Device registration with user email
   - Admin approval with user assignment
   - Schedule-to-user assignment
   - Content retrieval for all three priority tiers
   - Backward compatibility (devices without assigned user)

3. **Contract Tests**:
   - DTO validation (email format, required fields)
   - Response schema validation
   - Database constraint validation

4. **Scenario Tests**:
   - Complete registration → approval → assignment → delivery flow
   - User matching: existing vs. new user
   - Priority fallback behavior
   - Edge cases (expired registration, duplicate assignments)

**Implementation Notes**:
- TDD approach: write tests first
- Use InMemoryDatabase for fast unit tests
- Use TestContainers for PostgreSQL integration tests
- Mock external dependencies (S3, SignalR)

---

## Technology Stack Decisions

### Backend Framework
**Selected**: ASP.NET Core 8 Web API with Entity Framework Core 9

**Rationale**: Already established in project, mature, excellent performance

### Database
**Selected**: PostgreSQL with Npgsql provider

**Rationale**: Already in use, excellent support for complex queries, good performance at scale

### Frontend Framework
**Selected**: Next.js 15 with React 18 and TypeScript

**Rationale**: Already in use for admin interface, server-side rendering for better performance

### Authentication
**Selected**: JWT Bearer tokens (existing pattern)

**Rationale**: Stateless, scalable, already implemented for admin and device auth

---

## Dependencies Analysis

### New NuGet Packages
- None required - all dependencies already in project

### New npm Packages (Frontend)
- None required - React Hook Form and Zod already available

### External Services
- None required - uses existing AWS S3, PostgreSQL, and SignalR

---

## Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Priority query performance at scale | Medium | High | Add indexes, monitor query times, caching if needed |
| User matching false positives | Low | Medium | Admin review and override capability |
| Migration failure | Low | High | Test in staging, rollback plan ready |
| Backward compatibility issues | Low | High | Nullable FKs, extensive testing with existing devices |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Admin adoption (manual user assignment) | Medium | Medium | Clear UI, batch assignment tools in future |
| User confusion (email entry on TV) | Low | Low | Clear instructions, optional field |
| Content not assigned (user has no schedules) | Medium | Low | Fallback to group/default, admin warnings |

---

## Open Questions Resolved

1. **Q**: What happens if user is deactivated?  
   **A**: Device continues to work, falls back to group/default schedules

2. **Q**: Can multiple devices use same user?  
   **A**: Yes, all receive same user-specific schedules

3. **Q**: What if email entered incorrectly?  
   **A**: No auto-match, admin can manually select correct user

4. **Q**: Do we need user login on device?  
   **A**: No - passive assignment is sufficient for MVP

5. **Q**: How to handle timezone differences?  
   **A**: Server-side UTC + schedule time ranges (existing pattern)

---

## Research Complete

All unknowns resolved. Ready for Phase 1: Design & Contracts.

**Status**: ✅ COMPLETE  
**Next Phase**: Phase 1 - Generate data-model.md and API contracts
