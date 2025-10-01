# Tasks: Admin User Permission Management

**Input**: Design documents from `/specs/015-admin-user-permission-management/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Implementation Overview
This feature implements Role-Based Access Control (RBAC) for digital signage device groups using Clean Architecture principles. Implementation follows TDD approach with permission entities, hierarchical inheritance, audit logging, and comprehensive API endpoints.

**Technology Stack**: C# .NET 8, ASP.NET Core Web API, Entity Framework Core 9, PostgreSQL, JWT Authentication
**Architecture**: Clean Architecture (Domain → Application → Infrastructure → Api)

## Phase 4.1: Setup & Domain Model

### T001 [P] ✅ Create UserPermissionLevel enum
Create `src/DigitalSignage.Domain/Enums/UserPermissionLevel.cs` with four-tier permission system (NoAccess=0, ViewOnly=1, ManageContent=2, FullControl=3)

### T002 [P] ✅ Create UserDeviceGroupPermission entity
Create `src/DigitalSignage.Domain/Entities/UserDeviceGroupPermission.cs` with UserId, DeviceGroupId, Permission, IsExplicit, CreatedAt, CreatedBy properties and navigation properties

### T003 [P] ✅ Create PermissionAuditLog entity
Create `src/DigitalSignage.Domain/Entities/PermissionAuditLog.cs` with immutable audit trail properties: PreviousPermission, NewPermission, Action, Reason, ChangedBy, ChangedAt, Context

### T004 [P] ✅ Create IPermissionRepository interface
Create `src/DigitalSignage.Domain/Interfaces/IPermissionRepository.cs` with CRUD methods for permissions and audit logs, plus hierarchy calculation methods

### T005 [P] ✅ Update User entity with navigation properties
Extend `src/DigitalSignage.Domain/Entities/User.cs` to include `ICollection<UserDeviceGroupPermission> DeviceGroupPermissions` navigation property

### T006 [P] ✅ Update DeviceGroup entity with navigation properties
Extend `src/DigitalSignage.Domain/Entities/DeviceGroup.cs` to include `ICollection<UserDeviceGroupPermission> UserPermissions` navigation property

## Phase 4.2: Application Layer DTOs & Contracts

### T007 [P] ✅ Create UserPermissionDto
Create `src/DigitalSignage.Application/DTOs/Permissions/UserPermissionDto.cs` with device group info, permission levels, inheritance flags, and creation metadata

### T008 [P] ✅ Create SetPermissionRequest DTO
Create `src/DigitalSignage.Application/DTOs/Permissions/SetPermissionRequest.cs` for permission update requests with deviceGroupId, permission, and reason

### T009 [P] ✅ Create PermissionAuditDto
Create `src/DigitalSignage.Application/DTOs/Permissions/PermissionAuditDto.cs` for audit log responses with user/group names, change details, and context

### T010 [P] ✅ Create IPermissionService interface
Create `src/DigitalSignage.Application/Services/IPermissionService.cs` with business logic methods for permission management, inheritance calculation, and audit queries

### T011 [P] ✅ Create PermissionMappingProfile
Create `src/DigitalSignage.Application/Mappings/PermissionMappingProfile.cs` AutoMapper configuration for entity-to-DTO mappings

## Phase 4.3: Contract Tests (TDD - MUST FAIL FIRST)

### T012 [P] ✅ Contract test Admin GET user permissions
Create `tests/DigitalSignage.Api.Tests/Controllers/AdminPermissionController_GetUserPermissions_Tests.cs` to validate GET /api/admin/users/{userId}/permissions endpoint contract

### T013 [P] ✅ Contract test Admin SET user permissions
Create `tests/DigitalSignage.Api.Tests/Controllers/AdminPermissionController_SetPermissions_Tests.cs` to validate POST /api/admin/users/{userId}/permissions endpoint contract

### T014 [P] ✅ Contract test Admin UPDATE permission
Create `tests/DigitalSignage.Api.Tests/Controllers/AdminPermissionController_UpdatePermission_Tests.cs` to validate PUT /api/admin/users/{userId}/permissions/{deviceGroupId} endpoint contract

### T015 [P] ✅ Contract test Admin DELETE permission
Create `tests/DigitalSignage.Api.Tests/Controllers/AdminPermissionController_DeletePermission_Tests.cs` to validate DELETE /api/admin/users/{userId}/permissions/{deviceGroupId} endpoint contract

### T016 [P] ✅ Contract test Admin audit log
Create `tests/DigitalSignage.Api.Tests/Controllers/AdminPermissionController_GetAuditLog_Tests.cs` to validate GET /api/admin/permissions/audit endpoint contract

### T017 [P] ✅ Contract test User accessible groups
Create `tests/DigitalSignage.Api.Tests/Controllers/UserPermissionController_GetAccessibleGroups_Tests.cs` to validate GET /api/user/accessible-device-groups endpoint contract

### T018 [P] ✅ Contract test User permissions
Create `tests/DigitalSignage.Api.Tests/Controllers/UserPermissionController_GetPermissions_Tests.cs` to validate GET /api/user/permissions endpoint contract

## Phase 4.4: Infrastructure Layer (Data Access)

### T019 [P] Create UserDeviceGroupPermissionConfiguration
Create `src/DigitalSignage.Infrastructure/Data/Configurations/UserDeviceGroupPermissionConfiguration.cs` with EF Core entity configuration, indexes, and relationships

### T020 [P] Create PermissionAuditLogConfiguration
Create `src/DigitalSignage.Infrastructure/Data/Configurations/PermissionAuditLogConfiguration.cs` with EF Core configuration for immutable audit entity

### T021 Update AppDbContext with new entities
Modify `src/DigitalSignage.Infrastructure/Data/AppDbContext.cs` to include UserDeviceGroupPermissions and PermissionAuditLogs DbSets with proper configurations

### T022 Create EF migration for permission tables
Generate and create migration file in `src/DigitalSignage.Infrastructure/Migrations/` for new permission and audit tables with proper indexes and constraints

### T023 [P] Create PermissionRepository implementation
Create `src/DigitalSignage.Infrastructure/Data/Repositories/PermissionRepository.cs` with EF Core implementation of IPermissionRepository including hierarchical queries

## Phase 4.5: Application Layer Business Logic

### T024 Create PermissionService implementation
Create `src/DigitalSignage.Application/Services/PermissionService.cs` with business logic for permission management, inheritance calculation, validation, and audit logging

### T025 [P] Add permission business logic unit tests
Create `tests/DigitalSignage.Application.Tests/Services/PermissionServiceTests.cs` with comprehensive unit tests for inheritance, validation, and audit scenarios

### T026 [P] Add repository unit tests
Create `tests/DigitalSignage.Infrastructure.Tests/Repositories/PermissionRepositoryTests.cs` with data access layer tests using InMemory database

## Phase 4.6: API Layer Controllers & Middleware

### T027 [P] Create AdminPermissionController
Create `src/DigitalSignage.Api/Controllers/AdminPermissionController.cs` with all admin endpoints: GET/POST/PUT/DELETE permissions, GET audit log with proper authorization

### T028 [P] Create UserPermissionController
Create `src/DigitalSignage.Api/Controllers/UserPermissionController.cs` with user endpoints: GET accessible groups, GET own permissions

### T029 [P] Create PermissionAuthorizationMiddleware
Create `src/DigitalSignage.Api/Middleware/PermissionAuthorizationMiddleware.cs` for permission-based endpoint authorization with JWT integration

### T030 [P] Create PermissionServiceExtensions
Create `src/DigitalSignage.Api/Extensions/PermissionServiceExtensions.cs` for DI registration of permission services and middleware configuration

### T031 Update Program.cs with permission services
Modify `src/DigitalSignage.Api/Program.cs` to register permission services, repositories, and middleware in the DI container

## Phase 4.7: Integration & Testing

### T032 Apply database migration
Run EF Core migration to create permission tables in development database and verify schema creation

### T033 [P] Integration test permission inheritance
Create `tests/DigitalSignage.Api.Tests/Integration/PermissionInheritanceTests.cs` to test hierarchical permission calculation end-to-end

### T034 [P] Integration test permission override
Create `tests/DigitalSignage.Api.Tests/Integration/PermissionOverrideTests.cs` to test explicit permission overriding inherited permissions

### T035 [P] Integration test audit trail
Create `tests/DigitalSignage.Api.Tests/Integration/AuditTrailTests.cs` to verify complete audit logging for all permission changes

### T036 [P] Integration test JWT authorization
Create `tests/DigitalSignage.Api.Tests/Integration/PermissionAuthorizationTests.cs` to test admin-only endpoints and user permission validation

### T037 Seed development data for testing
Create permission test data in development database: test users, device groups, and various permission scenarios for manual testing

### T038 Run quickstart validation scenarios
Execute all test scenarios from `quickstart.md` to validate complete functionality: admin grant/revoke, inheritance, user access, audit trail

## Dependencies

**Phase 4.1 Setup** → **Phase 4.2 DTOs** → **Phase 4.3 Contract Tests**
- T001-T006 can run in parallel (different files)
- T007-T011 can run in parallel (different files)
- Contract tests T012-T018 can run in parallel (different test files)

**Phase 4.4 Infrastructure** (after Domain entities exist)
- T019-T020 can run in parallel (different configuration files)
- T021 requires T001-T003 (entity definitions)
- T022 requires T021 (DbContext update)
- T023 requires T004 (interface definition)

**Phase 4.5 Application Logic** (after Infrastructure)
- T024 requires T010, T023 (interface and repository)
- T025-T026 can run in parallel (different test files)

**Phase 4.6 API Layer** (after Application layer)
- T027-T030 can run in parallel (different files)
- T031 requires T030 (service extensions)

**Phase 4.7 Integration** (after all implementation)
- T032 requires T022 (migration exists)
- T033-T036 can run in parallel (different integration test files)
- T037 requires T032 (database schema exists)
- T038 requires all previous tasks (full system operational)

## Parallel Execution Examples

### Phase 4.1 Domain Setup (Parallel)
```bash
# Can run simultaneously - different files
T001: Create UserPermissionLevel enum in Domain/Enums/
T002: Create UserDeviceGroupPermission entity in Domain/Entities/
T003: Create PermissionAuditLog entity in Domain/Entities/
T004: Create IPermissionRepository interface in Domain/Interfaces/
```

### Phase 4.3 Contract Tests (Parallel)
```bash
# All contract tests independent - can run together
T012: AdminPermissionController_GetUserPermissions_Tests.cs
T013: AdminPermissionController_SetPermissions_Tests.cs
T014: AdminPermissionController_UpdatePermission_Tests.cs
T015: AdminPermissionController_DeletePermission_Tests.cs
T016: AdminPermissionController_GetAuditLog_Tests.cs
T017: UserPermissionController_GetAccessibleGroups_Tests.cs
T018: UserPermissionController_GetPermissions_Tests.cs
```

### Phase 4.6 API Implementation (Parallel)
```bash
# Controllers and supporting files independent
T027: Create AdminPermissionController.cs
T028: Create UserPermissionController.cs
T029: Create PermissionAuthorizationMiddleware.cs
T030: Create PermissionServiceExtensions.cs
```

## Task Validation Checklist

### Contract Coverage ✅
- [x] All 7 API endpoints have contract tests (T012-T018)
- [x] Admin operations require proper authorization
- [x] User operations validate self-access only
- [x] Error scenarios covered (401, 403, 404, 400)

### Entity Coverage ✅
- [x] UserPermissionLevel enum with four-tier system (T001)
- [x] UserDeviceGroupPermission entity with relationships (T002)
- [x] PermissionAuditLog immutable audit entity (T003)
- [x] Repository interface for data access (T004)

### Architecture Compliance ✅
- [x] Clean Architecture layer separation maintained
- [x] Domain entities have no external dependencies
- [x] Application services isolated with interfaces
- [x] Infrastructure contains only data access logic
- [x] API layer handles only HTTP concerns

### TDD Compliance ✅
- [x] Contract tests written before implementation (T012-T018 before T027-T028)
- [x] Unit tests for business logic (T025-T026)
- [x] Integration tests for complete workflows (T033-T036)
- [x] Tests must fail before implementation begins

### Performance & Security ✅
- [x] Database indexes planned for performance (T019-T020)
- [x] Permission validation middleware (T029)
- [x] JWT integration for authentication (T036)
- [x] Audit trail for compliance (T035)

## Notes
- **TDD Critical**: Contract tests T012-T018 MUST fail before any controller implementation
- **Migration Safety**: Test T022 migration on development database before production
- **Parallel Execution**: Tasks marked [P] can run simultaneously on different files
- **Integration Order**: Complete phases sequentially, but tasks within phases can be parallel where marked
- **Validation Gate**: T038 quickstart scenarios must pass before feature completion