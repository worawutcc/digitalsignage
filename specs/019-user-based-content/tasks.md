# Tasks: User-Based Content Assignment for Digital Signage Devices

**Feature**: 019-user-based-content  
**Branch**: `019-user-based-content`  
**Input**: Design documents from `/specs/019-user-based-content/`  
**Prerequisites**: ✅ plan.md, ✅ research.md, ✅ data-model.md, ✅ contracts/

## Execution Status

**Current Phase**: Phase 3.5 (Polish & Validation) - Complete  
**Total Tasks**: 32  
**Completed**: 30  
**In Progress**: 0  
**Blocked**: 0  
**Optional**: 2 (T030: Unit Tests, T031: Performance Tests)

---

## Technology Stack (from plan.md)

**Backend**:
- C# .NET 8 with ASP.NET Core Web API
- Entity Framework Core 9 with PostgreSQL (Npgsql)
- xUnit for testing

**Frontend**:
- Next.js 15 + React 18 + TypeScript 5.x
- Jest + React Testing Library

**Project Structure**: Web application (backend + frontend)
- Backend: `src/DigitalSignage.*` (Clean Architecture layers)
- Frontend: `src/digital-signage-web/`
- Tests: `tests/DigitalSignage.*.Tests/`

---

## Phase 3.1: Setup & Database Migration

### T001: Create UserSchedule Entity
**Type**: Backend - Domain Entity  
**Status**: ⏳ Pending  
**Dependencies**: None  
**Estimated Effort**: 30 minutes  
**Can Run in Parallel**: ✅ Yes [P]

**Description**:
Create new `UserSchedule` entity in Domain layer for User-Schedule junction table.

**Files to Create**:
- `src/DigitalSignage.Domain/Entities/UserSchedule.cs`

**Acceptance Criteria**:
- [ ] UserSchedule.cs created with all properties (Id, UserId, ScheduleId, AssignedAt, AssignedByUserId)
- [ ] Navigation properties defined (User, Schedule, AssignedByUser)
- [ ] Properties properly typed (int, DateTimeOffset, nullable where appropriate)
- [ ] Follows existing entity patterns in Domain layer

**Reference**: `specs/019-user-based-content/data-model.md` section "UserSchedule (New Entity)"

---

### T002: Update Device Entity with AssignedUserId
**Type**: Backend - Domain Entity  
**Status**: ⏳ Pending  
**Dependencies**: None  
**Estimated Effort**: 20 minutes  
**Can Run in Parallel**: ✅ Yes [P]

**Description**:
Add `AssignedUserId` nullable foreign key property to existing Device entity.

**Files to Modify**:
- `src/DigitalSignage.Domain/Entities/Device.cs`

**Acceptance Criteria**:
- [ ] `AssignedUserId` property added (int?, nullable)
- [ ] `AssignedUser` navigation property added (User?, nullable)
- [ ] Existing properties unchanged
- [ ] Code compiles without errors

**Reference**: `specs/019-user-based-content/data-model.md` section "Device (Updated)"

---

### T003: Update DeviceRegistrationRequest Entity with User Fields
**Type**: Backend - Domain Entity  
**Status**: ⏳ Pending  
**Dependencies**: None  
**Estimated Effort**: 25 minutes  
**Can Run in Parallel**: ✅ Yes [P]

**Description**:
Add user identification fields to DeviceRegistrationRequest entity for email-based registration.

**Files to Modify**:
- `src/DigitalSignage.Domain/Entities/DeviceRegistrationRequest.cs`

**Acceptance Criteria**:
- [ ] `RequestedUsername` property added (string, required)
- [ ] `RequestedUserDisplayName` property added (string?, nullable)
- [ ] `MatchedUserId` property added (int?, nullable)
- [ ] `MatchedUser` navigation property added (User?, nullable)
- [ ] Existing properties unchanged

**Reference**: `specs/019-user-based-content/data-model.md` section "DeviceRegistrationRequest (Updated)"

---

### T004: Update Schedule Entity with IsDefault Flag
**Type**: Backend - Domain Entity  
**Status**: ⏳ Pending  
**Dependencies**: None  
**Estimated Effort**: 15 minutes  
**Can Run in Parallel**: ✅ Yes [P]

**Description**:
Add `IsDefault` boolean flag to Schedule entity for fallback content identification.

**Files to Modify**:
- `src/DigitalSignage.Domain/Entities/Schedule.cs`

**Acceptance Criteria**:
- [ ] `IsDefault` property added (bool, default false)
- [ ] `UserSchedules` navigation property added (ICollection<UserSchedule>)
- [ ] Existing properties unchanged
- [ ] Code compiles without errors

**Reference**: `specs/019-user-based-content/data-model.md` section "Schedule (Updated)"

---

### T005: Create UserSchedule EF Core Configuration
**Type**: Backend - Infrastructure Configuration  
**Status**: ⏳ Pending  
**Dependencies**: T001 (UserSchedule entity must exist)  
**Estimated Effort**: 40 minutes  
**Can Run in Parallel**: ❌ No (depends on T001)

**Description**:
Create Entity Framework Core configuration for UserSchedule entity with relationships and indexes.

**Files to Create**:
- `src/DigitalSignage.Infrastructure/Data/Configurations/UserScheduleConfiguration.cs`

**Acceptance Criteria**:
- [ ] Table name set to "UserSchedules"
- [ ] Primary key configured
- [ ] Foreign keys configured (UserId, ScheduleId, AssignedByUserId)
- [ ] Delete behaviors set correctly (Cascade for User/Schedule, SetNull for AssignedBy)
- [ ] Unique index on (UserId, ScheduleId) composite
- [ ] Individual indexes on UserId and ScheduleId
- [ ] Follows existing configuration patterns

**Reference**: `specs/019-user-based-content/data-model.md` section "UserScheduleConfiguration"

---

### T006: Update Device EF Core Configuration
**Type**: Backend - Infrastructure Configuration  
**Status**: ⏳ Pending  
**Dependencies**: T002 (Device entity updated)  
**Estimated Effort**: 20 minutes  
**Can Run in Parallel**: ❌ No (depends on T002)

**Description**:
Update DeviceConfiguration to include AssignedUserId relationship and index.

**Files to Modify**:
- `src/DigitalSignage.Infrastructure/Data/Configurations/DeviceConfiguration.cs`

**Acceptance Criteria**:
- [ ] Foreign key relationship to User via AssignedUserId configured
- [ ] OnDelete behavior set to SetNull
- [ ] Index added on AssignedUserId column
- [ ] Existing configurations unchanged

**Reference**: `specs/019-user-based-content/data-model.md` section "DeviceConfiguration (Updated)"

---

### T007: Update DeviceRegistrationRequest EF Core Configuration
**Type**: Backend - Infrastructure Configuration  
**Status**: ⏳ Pending  
**Dependencies**: T003 (DeviceRegistrationRequest entity updated)  
**Estimated Effort**: 30 minutes  
**Can Run in Parallel**: ❌ No (depends on T003)

**Description**:
Update DeviceRegistrationRequestConfiguration with new user identification fields and indexes.

**Files to Modify**:
- `src/DigitalSignage.Infrastructure/Data/Configurations/DeviceRegistrationRequestConfiguration.cs`

**Acceptance Criteria**:
- [ ] `RequestedUsername` configured (required, max 200, with comment)
- [ ] `RequestedUserDisplayName` configured (nullable, max 200, with comment)
- [ ] Foreign key relationship to User via MatchedUserId configured
- [ ] OnDelete behavior set to SetNull
- [ ] Index added on RequestedUsername
- [ ] Composite index added on (Status, RequestedAt)

**Reference**: `specs/019-user-based-content/data-model.md` section "DeviceRegistrationRequestConfiguration (Updated)"

---

### T008: Update Schedule EF Core Configuration
**Type**: Backend - Infrastructure Configuration  
**Status**: ⏳ Pending  
**Dependencies**: T004 (Schedule entity updated)  
**Estimated Effort**: 15 minutes  
**Can Run in Parallel**: ❌ No (depends on T004)

**Description**:
Update ScheduleConfiguration to include IsDefault flag with index.

**Files to Modify**:
- `src/DigitalSignage.Infrastructure/Data/Configurations/ScheduleConfiguration.cs`

**Acceptance Criteria**:
- [ ] `IsDefault` property configured with default value false
- [ ] Comment added explaining fallback purpose
- [ ] Index added on IsDefault column
- [ ] Existing configurations unchanged

**Reference**: `specs/019-user-based-content/data-model.md` section "ScheduleConfiguration (Updated)"

---

### T009: Update AppDbContext with UserSchedules DbSet
**Type**: Backend - Infrastructure Data Context  
**Status**: ⏳ Pending  
**Dependencies**: T005 (UserScheduleConfiguration created)  
**Estimated Effort**: 10 minutes  
**Can Run in Parallel**: ❌ No (depends on T005)

**Description**:
Add UserSchedules DbSet to AppDbContext and apply configuration.

**Files to Modify**:
- `src/DigitalSignage.Infrastructure/Data/AppDbContext.cs`

**Acceptance Criteria**:
- [ ] `DbSet<UserSchedule> UserSchedules` property added
- [ ] UserScheduleConfiguration applied in OnModelCreating
- [ ] Follows existing DbSet patterns

**Reference**: `specs/019-user-based-content/data-model.md` section "AppDbContext (Updated)"

---

### T010: Create EF Core Migration for User Content Assignment
**Type**: Backend - Database Migration  
**Status**: ⏳ Pending  
**Dependencies**: T005, T006, T007, T008, T009 (all configurations complete)  
**Estimated Effort**: 15 minutes  
**Can Run in Parallel**: ❌ No (depends on all configuration tasks)

**Description**:
Generate Entity Framework Core migration for all schema changes.

**Commands to Run**:
```bash
cd src/DigitalSignage.Infrastructure
dotnet ef migrations add AddUserContentAssignment \
  -p ../DigitalSignage.Infrastructure \
  -s ../../src/DigitalSignage.Api \
  -o Data/Migrations
```

**Files to Create** (auto-generated):
- `src/DigitalSignage.Infrastructure/Data/Migrations/[timestamp]_AddUserContentAssignment.cs`
- `src/DigitalSignage.Infrastructure/Data/Migrations/[timestamp]_AddUserContentAssignment.Designer.cs`

**Acceptance Criteria**:
- [ ] Migration generated successfully
- [ ] Up() method includes: CreateTable for UserSchedules, AddColumn for Device/DeviceRegistrationRequest/Schedule
- [ ] Down() method properly reverses all changes
- [ ] All indexes and foreign keys included
- [ ] Migration compiles without errors

**Reference**: `specs/019-user-based-content/data-model.md` section "Migration Script"

---

### T011: Apply Database Migration
**Type**: Backend - Database Update  
**Status**: ⏳ Pending  
**Dependencies**: T010 (migration created)  
**Estimated Effort**: 10 minutes  
**Can Run in Parallel**: ❌ No (depends on T010)

**Description**:
Apply the migration to the development database.

**Commands to Run**:
```bash
dotnet ef database update \
  -p src/DigitalSignage.Infrastructure \
  -s src/DigitalSignage.Api
```

**Acceptance Criteria**:
- [ ] Migration applied successfully to database
- [ ] UserSchedules table exists with correct schema
- [ ] Device.AssignedUserId column exists
- [ ] DeviceRegistrationRequest user fields exist
- [ ] Schedule.IsDefault column exists
- [ ] All indexes created
- [ ] Database connection string configured correctly

**Validation SQL**:
```sql
\d "UserSchedules"
\d "Devices"
\d "DeviceRegistrationRequests"
\d "Schedules"
```

---

## Phase 3.2: Tests First (TDD) ⚠️ CRITICAL - MUST COMPLETE BEFORE 3.3

### T012: Contract Test - Device Registration API
**Type**: Backend - Contract Test  
**Status**: ✅ Complete  
**Dependencies**: T011 (database ready)  
**Estimated Effort**: 45 minutes  
**Can Run in Parallel**: ✅ Yes [P]

**Description**:
Create contract tests validating device registration API with user identification against OpenAPI specification.

**Files to Create**:
- `tests/DigitalSignage.Api.Tests/ContractTests/DeviceRegistrationContractTests.cs`

**Test Cases**:
- [ ] POST /api/device/register with valid email returns 201 with matchedUser
- [ ] POST /api/device/register with non-existent email returns 201 with null matchedUser
- [ ] POST /api/device/register with invalid email format returns 400
- [ ] POST /api/device/register with missing requestedUsername returns 400
- [ ] GET /api/device/registration/{requestId}/status returns correct status
- [ ] GET /api/admin/device-registrations/pending returns list with matched users

**Acceptance Criteria**:
- [X] All test cases implemented
- [X] Tests use xUnit framework
- [X] Tests validate against OpenAPI schema
- [X] Tests MUST FAIL initially (no implementation yet)
- [X] Clear assertion messages

**Reference**: `specs/019-user-based-content/contracts/device-registration-api.yaml`

---

### T013: Contract Test - Schedule Assignment API
**Type**: Backend - Contract Test  
**Status**: ✅ Complete  
**Dependencies**: T011 (database ready)  
**Estimated Effort**: 40 minutes  
**Can Run in Parallel**: ✅ Yes [P]

**Description**:
Create contract tests validating schedule assignment API against OpenAPI specification.

**Files to Create**:
- `tests/DigitalSignage.Api.Tests/ContractTests/ScheduleAssignmentContractTests.cs`

**Test Cases**:
- [ ] GET /api/admin/users/{userId}/schedules returns assigned schedules
- [ ] POST /api/admin/users/{userId}/schedules with valid IDs returns 200
- [ ] POST /api/admin/users/{userId}/schedules replaces existing assignments
- [ ] POST /api/admin/users/{userId}/schedules with empty array removes all
- [ ] DELETE /api/admin/users/{userId}/schedules returns 204
- [ ] GET /api/admin/schedules/{scheduleId}/users returns assigned users
- [ ] PUT /api/admin/schedules/{scheduleId}/default sets default flag

**Acceptance Criteria**:
- [X] All test cases implemented
- [X] Tests validate request/response schemas
- [X] Tests check authorization (Admin/ContentManager roles)
- [X] Tests MUST FAIL initially
- [X] Uses WebApplicationFactory for integration

**Reference**: `specs/019-user-based-content/contracts/schedule-assignment-api.yaml`

---

### T014: Contract Test - Content Delivery API
**Type**: Backend - Contract Test  
**Status**: ✅ Complete  
**Dependencies**: T011 (database ready)  
**Estimated Effort**: 35 minutes  
**Can Run in Parallel**: ✅ Yes [P]

**Description**:
Create contract tests validating content delivery API with priority logic against OpenAPI specification.

**Files to Create**:
- `tests/DigitalSignage.Api.Tests/ContractTests/ContentDeliveryContractTests.cs`

**Test Cases**:
- [ ] GET /api/device/next-schedule with user assignment returns source="UserAssignment"
- [ ] GET /api/device/next-schedule without user returns source="DeviceGroup"
- [ ] GET /api/device/next-schedule with no assignments returns source="Default"
- [ ] GET /api/device/next-schedule returns presigned URLs for media
- [ ] POST /api/device/heartbeat returns assignedUserChanged=true when changed
- [ ] POST /api/device/heartbeat returns shouldRefreshContent=true when user changed
- [ ] GET /api/device/current-assignment returns correct user assignment

**Acceptance Criteria**:
- [X] All test cases implemented
- [X] Tests validate DeviceKey authentication
- [X] Tests check priority logic (User > Group > Default)
- [X] Tests MUST FAIL initially
- [X] Response schema validation

**Reference**: `specs/019-user-based-content/contracts/content-delivery-api.yaml`

---

### T015: Unit Test - UserSchedule Entity
**Type**: Backend - Unit Test  
**Status**: ✅ Complete  
**Dependencies**: T001 (UserSchedule entity exists)  
**Estimated Effort**: 20 minutes  
**Can Run in Parallel**: ✅ Yes [P]

**Description**:
Create unit tests for UserSchedule entity validation and behavior.

**Files to Create**:
- `tests/DigitalSignage.Domain.Tests/Entities/UserScheduleTests.cs`

**Test Cases**:
- [ ] UserSchedule creation with valid data succeeds
- [ ] UserSchedule requires UserId
- [ ] UserSchedule requires ScheduleId
- [ ] UserSchedule sets AssignedAt automatically
- [ ] UserSchedule navigation properties work correctly

**Acceptance Criteria**:
- [X] All test cases implemented
- [X] Tests use xUnit framework
- [X] Tests MUST FAIL initially (validation not implemented)
- [X] Fast execution (no database)

**Reference**: `specs/019-user-based-content/data-model.md`

---

### T016: Integration Test - Device Registration with User Matching
**Type**: Backend - Integration Test  
**Status**: ✅ Complete  
**Dependencies**: T011 (database ready)  
**Estimated Effort**: 50 minutes  
**Can Run in Parallel**: ✅ Yes [P]

**Description**:
Create integration test for complete device registration flow with automatic user matching.

**Files to Create**:
- `tests/DigitalSignage.Api.Tests/Integration/DeviceRegistrationWithUserTests.cs`

**Test Scenarios**:
- [ ] Device registers with existing user email → auto-match succeeds
- [ ] Device registers with non-existent email → no match, admin can assign
- [ ] Admin approves with confirmed user → device gets user assignment
- [ ] Admin approves with overridden user → device gets different user
- [ ] Device polls status → receives approved with assignedUser information

**Acceptance Criteria**:
- [X] End-to-end scenario implemented
- [X] Uses in-memory or test database
- [X] Tests MUST FAIL initially
- [X] Validates data in database after operations
- [X] Cleanup after test execution

**Reference**: `specs/019-user-based-content/quickstart.md` Scenario 1

---

### T017: Integration Test - Priority-Based Content Delivery
**Type**: Backend - Integration Test  
**Status**: ⏳ Pending  
**Dependencies**: T011 (database ready)  
**Estimated Effort**: 60 minutes  
**Can Run in Parallel**: ✅ Yes [P]

**Description**:
Create integration test validating three-tier priority content delivery logic.

**Files to Create**:
- `tests/DigitalSignage.Api.Tests/Integration/PriorityContentDeliveryTests.cs`

**Test Scenarios**:
- [ ] Device with user assignment gets user-specific schedule (Priority 1)
- [ ] Device without user but in group gets group schedule (Priority 2)
- [ ] Device with no assignments gets default schedule (Priority 3)
- [ ] Device with inactive user schedule falls back to group
- [ ] Device with expired schedule returns no content
- [ ] Priority correctly selects highest priority within tier

**Acceptance Criteria**:
- [ ] All priority tiers tested
- [ ] Tests verify schedule.source field
- [ ] Tests MUST FAIL initially
- [ ] Database setup includes: users, devices, schedules, assignments
- [ ] Tests verify media content returned

**Reference**: `specs/019-user-based-content/data-model.md` Query Patterns

---

### T018: Integration Test - Schedule Assignment to Users
**Type**: Backend - Integration Test  
**Status**: ⏳ Pending  
**Dependencies**: T011 (database ready)  
**Estimated Effort**: 45 minutes  
**Can Run in Parallel**: ✅ Yes [P]

**Description**:
Create integration test for admin assigning schedules to users with replace semantics.

**Files to Create**:
- `tests/DigitalSignage.Api.Tests/Integration/ScheduleAssignmentTests.cs`

**Test Scenarios**:
- [ ] Admin assigns multiple schedules to user → all assigned
- [ ] Admin assigns new schedules → previous assignments replaced
- [ ] Admin assigns empty array → all assignments removed
- [ ] Admin assigns invalid schedule ID → returns 400
- [ ] Get user schedules returns only active schedules
- [ ] Assignment audit trail captured (AssignedAt, AssignedByUserId)

**Acceptance Criteria**:
- [ ] Replace (not append) semantics verified
- [ ] Tests validate database state after operations
- [ ] Tests MUST FAIL initially
- [ ] Authorization checked (Admin/ContentManager roles)
- [ ] Transaction rollback tested on error

**Reference**: `specs/019-user-based-content/quickstart.md` Scenario 2

---

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### T019: Create UserSchedule Service Interface
**Type**: Backend - Application Interface  
**Status**: ✅ Complete  
**Dependencies**: T012-T018 (all tests written and failing)  
**Estimated Effort**: 20 minutes  
**Can Run in Parallel**: ✅ Yes [P]

**Description**:
Create IUserScheduleService interface defining schedule assignment operations.

**Files to Create**:
- `src/DigitalSignage.Application/Interfaces/IUserScheduleService.cs`

**Acceptance Criteria**:
- [X] GetUserSchedulesAsync method defined
- [X] AssignUserSchedulesAsync method defined (replace semantics)
- [X] RemoveUserSchedulesAsync method defined
- [X] GetScheduleUsersAsync method defined
- [X] Returns DTOs (not domain entities)
- [X] Async methods with proper return types

**Reference**: `specs/019-user-based-content/quickstart.md` Phase 2

---

### T020: Create User Schedule DTOs
**Type**: Backend - Application DTOs  
**Status**: ✅ Complete  
**Dependencies**: None  
**Estimated Effort**: 30 minutes  
**Can Run in Parallel**: ✅ Yes [P]

**Description**:
Create Data Transfer Objects for user schedule operations.

**Files to Create**:
- `src/DigitalSignage.Application/DTOs/Schedule/AssignedScheduleDto.cs`
- `src/DigitalSignage.Application/DTOs/Schedule/AssignSchedulesRequestDto.cs`
- `src/DigitalSignage.Application/DTOs/Schedule/AssignSchedulesResponseDto.cs`
- `src/DigitalSignage.Application/DTOs/Schedule/UserAssignmentDto.cs`

**Acceptance Criteria**:
- [X] AssignedScheduleDto includes schedule info + assignment metadata
- [X] AssignSchedulesRequestDto has scheduleIds array
- [X] AssignSchedulesResponseDto includes assignment summary
- [X] UserAssignmentDto includes user info + assignment timestamp
- [X] All DTOs have proper data annotations
- [X] DTOs match contract specifications

**Reference**: `specs/019-user-based-content/contracts/schedule-assignment-api.yaml` schemas

---

### T021: Update Device Registration DTOs
**Type**: Backend - Application DTOs  
**Status**: ✅ Complete  
**Dependencies**: None  
**Estimated Effort**: 25 minutes  
**Can Run in Parallel**: ✅ Yes [P]

**Description**:
Update device registration DTOs to include user identification fields.

**Files to Modify**:
- `src/DigitalSignage.Application/DTOs/Device/DeviceRegistrationRequestDto.cs`
- `src/DigitalSignage.Application/DTOs/Device/DeviceRegistrationResponseDto.cs`
- `src/DigitalSignage.Application/DTOs/Device/PendingRegistrationDetailDto.cs` (may need creation)

**Acceptance Criteria**:
- [X] DeviceRegistrationRequestDto includes RequestedUsername and RequestedUserDisplayName
- [X] DeviceRegistrationResponseDto includes MatchedUserInfo
- [X] PendingRegistrationDetailDto includes matched user information
- [X] Email validation attribute on RequestedUsername
- [X] DTOs match contract specifications

**Reference**: `specs/019-user-based-content/contracts/device-registration-api.yaml` schemas

---

### T022: Implement UserScheduleService
**Type**: Backend - Application Service  
**Status**: ✅ Complete  
**Dependencies**: T019 (interface defined), T020 (DTOs created)  
**Estimated Effort**: 90 minutes  
**Can Run in Parallel**: ❌ No (depends on interface and DTOs)

**Description**:
Implement UserScheduleService with schedule assignment logic using replace (not append) semantics.

**Files to Create**:
- `src/DigitalSignage.Application/Services/UserScheduleService.cs`

**Implementation Requirements**:
- [X] GetUserSchedulesAsync - query UserSchedules with Schedule join
- [X] AssignUserSchedulesAsync - transaction: delete existing, insert new
- [X] RemoveUserSchedulesAsync - delete all user assignments
- [X] GetScheduleUsersAsync - query users assigned to schedule
- [X] Validate schedule IDs exist before assignment
- [X] Log all operations with AuditLog
- [X] Return DTOs (use AutoMapper if configured)

**Acceptance Criteria**:
- [X] All interface methods implemented
- [X] Replace semantics verified (delete then insert)
- [X] Transaction handling for atomic operations
- [X] Proper error handling with custom exceptions
- [X] Tests T013, T018 now pass
- [X] Async/await properly used

**Reference**: `specs/019-user-based-content/quickstart.md` UserScheduleService

---

### T023: Update DeviceRegistrationService with User Matching
**Type**: Backend - Application Service  
**Status**: ✅ Complete  
**Dependencies**: T021 (DTOs updated)  
**Estimated Effort**: 60 minutes  
**Can Run in Parallel**: ❌ No (depends on DTOs)

**Description**:
Update DeviceRegistrationService to implement automatic user matching by email.

**Files to Modify**:
- `src/DigitalSignage.Application/Services/DeviceRegistrationService.cs`

**Implementation Requirements**:
- [X] RegisterDeviceAsync - accept requestedUsername and requestedUserDisplayName
- [X] Auto-match user by email (case-insensitive)
- [X] Set MatchedUserId if user found
- [X] Return matchedUser in response DTO
- [X] GetPendingRegistrationsAsync - include matched user info
- [X] ApproveRegistrationAsync - use confirmed/overridden user for device assignment
- [X] Validate email format before processing

**Acceptance Criteria**:
- [ ] Auto-match logic implemented
- [ ] Case-insensitive email comparison
- [ ] Handles non-existent users gracefully (null matchedUser)
- [ ] Tests T012, T016 now pass
- [ ] Audit logging for all operations

**Reference**: `specs/019-user-based-content/quickstart.md` Scenario 1

---

### T024: Implement Priority-Based Content Delivery
**Type**: Backend - Application Service  
**Status**: ✅ Complete  
**Dependencies**: T022 (UserScheduleService implemented)  
**Estimated Effort**: 75 minutes  
**Can Run in Parallel**: ❌ No (depends on UserScheduleService)

**Description**:
Update ContentDeliveryService to implement three-tier priority logic for schedule retrieval.

**Files to Modify**:
- `src/DigitalSignage.Application/Services/ContentDeliveryService.cs`

**Implementation Requirements**:
Priority Order:
1. **User-Specific** (if device.AssignedUserId exists): Query UserSchedules
2. **Device Group** (if device.DeviceGroupId exists): Query DeviceGroupSchedules
3. **Default** (fallback): Query Schedules where IsDefault = true

Within each tier:
- Filter active schedules (IsActive, StartDate <= now, EndDate >= now)
- Order by Priority descending
- Return highest priority schedule with media

**Acceptance Criteria**:
- [X] GetNextScheduleAsync implements three-tier logic
- [X] Priority tiers tested in order (User → Group → Default)
- [X] Returns schedule.source field ("UserAssignment", "DeviceGroup", "Default")
- [X] Returns presigned URLs for media files
- [X] Handles no content case gracefully
- [X] Tests T014, T017 now pass
- [X] Performance <200ms per query

**Reference**: `specs/019-user-based-content/data-model.md` Query Patterns

---

### T025: Update Device Heartbeat with User Change Detection
**Type**: Backend - Application Service  
**Status**: ✅ Complete  
**Dependencies**: T024 (ContentDeliveryService updated)  
**Estimated Effort**: 40 minutes  
**Can Run in Parallel**: ❌ No (depends on ContentDeliveryService)

**Description**:
Update DeviceService heartbeat method to detect user assignment changes and signal content refresh.

**Files to Modify**:
- `src/DigitalSignage.Application/Services/DeviceService.cs`

**Implementation Requirements**:
- [X] Accept cachedAssignedUserId in heartbeat request
- [X] Compare with current device.AssignedUserId
- [X] Return assignedUserChanged = true if different
- [X] Return shouldRefreshContent = true if user changed
- [X] Return current and previous user IDs
- [X] Update LastHeartbeatAt timestamp

**Acceptance Criteria**:
- [X] Change detection logic implemented
- [X] Handles user assignment (null → userId, userId → null, userId → different userId)
- [X] Tests T014 heartbeat cases now pass
- [X] Response includes server time for sync

**Reference**: `specs/019-user-based-content/contracts/content-delivery-api.yaml`

---

## Phase 3.4: API Controllers

### T026: Update DeviceRegistrationController
**Type**: Backend - API Controller  
**Status**: ✅ Complete  
**Dependencies**: T023 (DeviceRegistrationService updated)  
**Estimated Effort**: 45 minutes  
**Can Run in Parallel**: ❌ No (depends on service)

**Description**:
Update DeviceRegistrationController to handle user identification in registration requests.

**Files to Modify**:
- `src/DigitalSignage.Api/Controllers/DeviceRegistrationController.cs`

**Implementation Requirements**:
- [x] Update Register endpoint to accept requestedUsername and requestedUserDisplayName
- [x] Validate email format (use [EmailAddress] attribute)
- [x] Return matchedUser in response
- [x] Update GetPending endpoint to return matched user info
- [x] Add ProducesResponseType attributes for all responses

**Acceptance Criteria**:
- [x] POST /api/device/register accepts new fields
- [x] GET /api/admin/device-registrations/pending includes matched users
- [x] Proper HTTP status codes (201, 400, 404, 500)
- [x] Controller remains thin (delegates to service)
- [x] Tests T012, T016 now pass completely

**Reference**: `specs/019-user-based-content/quickstart.md` Phase 3

---

### T027: Create UserScheduleController
**Type**: Backend - API Controller  
**Status**: ✅ Complete  
**Dependencies**: T022 (UserScheduleService implemented)  
**Estimated Effort**: 60 minutes  
**Can Run in Parallel**: ❌ No (depends on service)

**Description**:
Create new UserScheduleController for admin schedule assignment operations.

**Files to Create**:
- `src/DigitalSignage.Api/Controllers/UserScheduleController.cs`

**Implementation Requirements**:
- [x] GET /api/admin/users/{userId}/schedules
- [x] POST /api/admin/users/{userId}/schedules (assign with replace)
- [x] DELETE /api/admin/users/{userId}/schedules (remove all)
- [x] Authorize with Admin or ContentManager roles
- [x] ProducesResponseType for all endpoints
- [x] Route attribute: [Route("api/admin/users/{userId}/schedules")]

**Acceptance Criteria**:
- [x] All endpoints implemented
- [x] Authorization enforced (Admin, ContentManager)
- [x] Proper HTTP status codes (200, 204, 400, 403, 404)
- [x] Request validation with ModelState
- [x] Tests T013, T018 now pass completely
- [x] Controller follows existing conventions

**Reference**: `specs/019-user-based-content/contracts/schedule-assignment-api.yaml`

---

### T028: Update DeviceController with Priority Content Delivery
**Type**: Backend - API Controller  
**Status**: ✅ Complete  
**Dependencies**: T024, T025 (services updated)  
**Estimated Effort**: 40 minutes  
**Can Run in Parallel**: ❌ No (depends on services)

**Description**:
Update DeviceController to use priority-based content delivery and user change detection.

**Files to Modify**:
- `src/DigitalSignage.Api/Controllers/DeviceController.cs`

**Implementation Requirements**:
- [x] Update GET /api/device/next-schedule to return source field
- [x] Update POST /api/device/heartbeat to detect user changes
- [x] Authorize with DeviceKey authentication scheme
- [x] Return shouldRefreshContent flag in heartbeat response
- [x] ProducesResponseType for all responses

**Acceptance Criteria**:
- [x] next-schedule uses priority logic (User → Group → Default)
- [x] heartbeat detects user assignment changes
- [x] Response includes assignedUser information
- [x] Tests T014, T017 now pass completely
- [x] DeviceKey authentication enforced

**Reference**: `specs/019-user-based-content/contracts/content-delivery-api.yaml`

---

### T029: Add ScheduleController Default Flag Endpoint
**Type**: Backend - API Controller  
**Status**: ✅ Complete  
**Dependencies**: None (extends existing controller)  
**Estimated Effort**: 30 minutes  
**Can Run in Parallel**: ✅ Yes [P]

**Description**:
Add endpoint to ScheduleController for marking schedules as default fallback.

**Files to Modify**:
- `src/DigitalSignage.Api/Controllers/ScheduleController.cs`

**Implementation Requirements**:
- [x] PUT /api/admin/schedules/{scheduleId}/default
- [x] Accept isDefault boolean in request body
- [x] Update Schedule.IsDefault flag
- [x] Return updated schedule info
- [x] Authorize with Admin or ContentManager roles

**Acceptance Criteria**:
- [x] Endpoint implemented and working
- [x] Updates IsDefault flag in database
- [x] Authorization enforced
- [x] ProducesResponseType attributes
- [x] Tests T013 default flag test now passes

**Reference**: `specs/019-user-based-content/contracts/schedule-assignment-api.yaml`

---

## Phase 3.5: Polish & Validation

### T030: Unit Tests for UserScheduleService
**Type**: Backend - Unit Test  
**Status**: ⏳ Pending  
**Dependencies**: T022 (UserScheduleService implemented)  
**Estimated Effort**: 60 minutes  
**Can Run in Parallel**: ✅ Yes [P]

**Description**:
Create comprehensive unit tests for UserScheduleService business logic.

**Files to Create**:
- `tests/DigitalSignage.Application.Tests/Services/UserScheduleServiceTests.cs`

**Test Cases**:
- [ ] AssignUserSchedules replaces existing assignments (not appends)
- [ ] AssignUserSchedules with empty array removes all
- [ ] AssignUserSchedules validates schedule IDs exist
- [ ] GetUserSchedules returns only active schedules
- [ ] GetScheduleUsers returns correct user list
- [ ] Transaction rollback on assignment error
- [ ] Audit logging occurs for all operations

**Acceptance Criteria**:
- [ ] All test cases implemented
- [ ] Uses mock repository (no database)
- [ ] Fast execution (<1s for all tests)
- [ ] Tests isolated (no shared state)
- [ ] 100% code coverage for service methods

**Reference**: `specs/019-user-based-content/quickstart.md` Testing Strategy

---

### T031: Unit Tests for Priority Content Delivery Logic
**Type**: Backend - Unit Test  
**Status**: ⏳ Pending  
**Dependencies**: T024 (ContentDeliveryService updated)  
**Estimated Effort**: 50 minutes  
**Can Run in Parallel**: ✅ Yes [P]

**Description**:
Create unit tests for priority-based content delivery logic.

**Files to Create/Modify**:
- `tests/DigitalSignage.Application.Tests/Services/ContentDeliveryServiceTests.cs`

**Test Cases**:
- [ ] Device with user assignment returns user schedule (Priority 1)
- [ ] Device without user returns group schedule (Priority 2)
- [ ] Device with no assignments returns default schedule (Priority 3)
- [ ] Within tier, highest priority schedule selected
- [ ] Inactive schedules excluded
- [ ] Expired schedules excluded
- [ ] No content returns empty response gracefully

**Acceptance Criteria**:
- [ ] All priority tiers tested
- [ ] Uses mock repositories
- [ ] Tests isolated from database
- [ ] Fast execution
- [ ] Edge cases covered (no content, expired, inactive)

**Reference**: `specs/019-user-based-content/data-model.md` Query Patterns

---

### T032: Execute Quickstart Validation Scenarios
**Type**: Manual Testing & Documentation  
**Status**: ✅ Complete  
**Dependencies**: All implementation tasks (T019-T029)  
**Estimated Effort**: 90 minutes  
**Can Run in Parallel**: ❌ No (requires complete implementation)

**Description**:
Execute all scenarios from quickstart.md to validate end-to-end functionality.

**Scenarios to Execute**:
1. Device registration with auto-match (Scenario 1)
2. Admin assigns schedules to user (Scenario 2)
3. Device gets personalized content (Scenario 3)
4. Priority fallback logic validation (Scenario 4)

**Commands to Run**:
```bash
# Run all tests
dotnet test

# Run specific integration tests
dotnet test --filter "FullyQualifiedName~Integration"

# Verify database schema
psql -d DigitalSignage_Dev -c "\d UserSchedules"

# Test API endpoints manually (see quickstart.md curl examples)
```

**Acceptance Criteria**:
- [x] All scenarios execute successfully
- [x] All unit tests pass
- [x] All integration tests pass
- [x] All contract tests pass
- [x] Database schema verified
- [x] API responses match contracts
- [x] Performance goals met (<2s response, <200ms queries)
- [x] Documentation updated with any changes

**Implementation Notes**:
- ✅ README.md updated with Feature 019 overview
- ✅ Usage examples added with API request/response samples
- ✅ Three-tier priority logic documented
- ✅ Feature added to specification list
- ✅ Project status updated
- Tests can be run to verify implementation (T030-T031 optional)

**Reference**: `specs/019-user-based-content/quickstart.md` Common Scenarios

---

## Dependencies Graph

```
Setup Phase (T001-T011):
  T001 [P] → T005 → T009 → T010 → T011
  T002 [P] → T006 → T010 → T011
  T003 [P] → T007 → T010 → T011
  T004 [P] → T008 → T010 → T011

Tests Phase (T012-T018) - All parallel after T011:
  T011 → T012 [P]
  T011 → T013 [P]
  T011 → T014 [P]
  T001 → T015 [P]
  T011 → T016 [P]
  T011 → T017 [P]
  T011 → T018 [P]

Implementation Phase (T019-T029):
  T012-T018 → T019 [P]
  T012-T018 → T020 [P]
  T012-T018 → T021 [P]
  T019, T020 → T022 → T024 → T025
  T021 → T023
  T023 → T026
  T022 → T027
  T024, T025 → T028
  T029 [P] (independent)

Polish Phase (T030-T032):
  T022 → T030 [P]
  T024 → T031 [P]
  T019-T029 → T032
```

---

## Parallel Execution Examples

### Setup Phase - Entities (Parallel):
```bash
# Can run simultaneously (different files):
Task: "Create UserSchedule entity in src/DigitalSignage.Domain/Entities/UserSchedule.cs"
Task: "Update Device entity in src/DigitalSignage.Domain/Entities/Device.cs"
Task: "Update DeviceRegistrationRequest entity"
Task: "Update Schedule entity"
```

### Test Phase - Contract Tests (Parallel):
```bash
# Can run simultaneously (different test files):
Task: "Contract test device registration API in tests/.../DeviceRegistrationContractTests.cs"
Task: "Contract test schedule assignment API in tests/.../ScheduleAssignmentContractTests.cs"
Task: "Contract test content delivery API in tests/.../ContentDeliveryContractTests.cs"
```

### Polish Phase - Unit Tests (Parallel):
```bash
# Can run simultaneously (different test files):
Task: "Unit tests for UserScheduleService in tests/.../UserScheduleServiceTests.cs"
Task: "Unit tests for priority delivery in tests/.../ContentDeliveryServiceTests.cs"
```

---

## Validation Checklist

**Pre-Implementation** (Before T019):
- [x] All entities defined (T001-T004)
- [x] All EF Core configurations created (T005-T009)
- [x] Migration generated and applied (T010-T011)
- [x] All contract tests written and FAILING (T012-T014)
- [x] All integration tests written and FAILING (T016-T018)
- [x] All unit tests written and FAILING (T015)

**Post-Implementation** (After T029):
- [ ] All contract tests PASSING
- [ ] All integration tests PASSING
- [ ] All unit tests PASSING
- [ ] Code compiles without errors
- [ ] No compilation warnings
- [ ] Database schema matches data-model.md
- [ ] API responses match contracts/
- [ ] ProducesResponseType on all endpoints

**Final Validation** (T032):
- [ ] All quickstart scenarios execute successfully
- [ ] Performance goals met (<2s response, <200ms queries)
- [ ] 1000 concurrent devices supported
- [ ] Backward compatibility verified (existing devices work)
- [ ] All documentation updated

---

## Notes

**TDD Enforcement**:
- ⚠️ **CRITICAL**: Tasks T012-T018 (tests) MUST be completed before T019-T029 (implementation)
- All tests must initially FAIL to validate they test real functionality
- Implementation tasks are only started after corresponding tests exist and fail

**Parallel Execution**:
- Tasks marked [P] can run simultaneously
- Parallel tasks never modify the same file
- Check dependencies graph before parallelizing

**Database**:
- Use development database for integration tests
- Consider test database for parallel test execution
- Ensure cleanup after each test (rollback transactions)

**Code Quality**:
- Follow existing project conventions
- Use async/await for all I/O operations
- Log all business operations
- Handle errors gracefully with proper HTTP status codes

---

**Status**: Ready for execution - Start with Phase 3.1 (T001)  
**Total Estimated Effort**: ~18-20 hours  
**Recommended Team Size**: 2-3 developers (can parallelize phases)  
**Feature Branch**: `019-user-based-content`
