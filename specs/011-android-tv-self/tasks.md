# Tasks: Android TV Self-Registration with Admin Approval

**Input**: Design documents from `/specs/011-android-tv-self/`
**Prerequisites**: plan.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓), quickstart.md (✓)

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Extract: C# .NET 8, ASP.NET Core Web API, EF Core 8, PostgreSQL, Clean Architecture
2. Load design documents ✓:
   → data-model.md: 3 entities (DeviceRegistrationRequest, DeviceApproval, RegistrationAuditLog)
   → contracts/: 6 API endpoints across 2 controllers
   → research.md: PIN generation, security validation, performance targets
   → quickstart.md: 5 integration test scenarios
3. Generate tasks by category:
   → Setup: EF Core entities, repositories, service registration
   → Tests: 6 contract tests, 5 integration test scenarios
   → Core: 3 domain entities, 2 services, 2 controllers
   → Integration: DB migrations, JWT auth, audit logging
   → Polish: unit tests, performance validation, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel execution
   → Same file = sequential (no [P])
   → Tests before implementation (TDD approach)
5. Dependencies: Setup → Tests → Core → Integration → Polish
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
Based on Clean Architecture structure from plan.md:
- **Domain**: `src/DigitalSignage.Domain/`
- **Application**: `src/DigitalSignage.Application/`
- **Infrastructure**: `src/DigitalSignage.Infrastructure/`
- **API**: `src/DigitalSignage.Api/`
- **Tests**: `tests/`

## Phase 3.1: Setup
- [x] T001 Create domain enums in src/DigitalSignage.Domain/Enums/RegistrationStatus.cs and ApprovalAction.cs
- [x] T002 [P] Create PIN generation service interface in src/DigitalSignage.Application/Interfaces/IPinGenerationService.cs
- [x] T003 [P] Create device registration service interface in src/DigitalSignage.Application/Interfaces/IDeviceRegistrationService.cs
- [x] T004 [P] Create device registration repository interface in src/DigitalSignage.Domain/Interfaces/IDeviceRegistrationRepository.cs

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T005 [P] Contract test POST /v1/device-registration/register in tests/DigitalSignage.Api.Tests/Controllers/DeviceRegistrationControllerContractTests.cs
- [x] T006 [P] Contract test GET /v1/device-registration/status/{id} in tests/DigitalSignage.Api.Tests/Controllers/DeviceRegistrationStatusContractTests.cs
- [x] T007 [P] Contract test GET /v1/admin/device-registration/pending in tests/DigitalSignage.Api.Tests/Controllers/AdminDeviceRegistrationPendingContractTests.cs
- [x] T008 [P] Contract test POST /v1/admin/device-registration/{id}/approve in tests/DigitalSignage.Api.Tests/Controllers/AdminDeviceRegistrationApproveContractTests.cs
- [x] T009 [P] Contract test POST /v1/admin/device-registration/{id}/reject in tests/DigitalSignage.Api.Tests/Controllers/AdminDeviceRegistrationRejectContractTests.cs
- [x] T010 [P] Contract test POST /v1/admin/device-registration/bulk-approve in tests/DigitalSignage.Api.Tests/Controllers/AdminDeviceRegistrationBulkContractTests.cs
- [x] T011 [P] Integration test "Successful Registration Flow" in tests/DigitalSignage.Api.Tests/Integration/SuccessfulRegistrationFlowTests.cs
- [x] T012 [P] Integration test "Duplicate Registration" in tests/DigitalSignage.Api.Tests/Integration/DuplicateRegistrationTests.cs
- [x] T013 [P] Integration test "Device Rejection" in tests/DigitalSignage.Api.Tests/Integration/DeviceRejectionTests.cs
- [x] T014 [P] Integration test "Bulk Approval" in tests/DigitalSignage.Api.Tests/Integration/BulkApprovalTests.cs
- [x] T015 [P] Integration test "Error Handling" in tests/DigitalSignage.Api.Tests/Integration/ErrorHandlingTests.cs

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T016 [P] DeviceRegistrationRequest domain entity in src/DigitalSignage.Domain/Entities/DeviceRegistrationRequest.cs
- [x] T017 [P] DeviceApproval domain entity in src/DigitalSignage.Domain/Entities/DeviceApproval.cs
- [x] T018 [P] RegistrationAuditLog domain entity in src/DigitalSignage.Domain/Entities/RegistrationAuditLog.cs
- [ ] T019 [P] PIN generation service implementation in src/DigitalSignage.Application/Services/PinGenerationService.cs
- [ ] T020 Device registration service implementation in src/DigitalSignage.Application/Services/DeviceRegistrationService.cs
- [ ] T021 [P] Device registration DTOs in src/DigitalSignage.Application/DTOs/DeviceRegistration/
- [ ] T022 [P] Admin device registration DTOs in src/DigitalSignage.Application/DTOs/AdminDeviceRegistration/
- [ ] T023 Device registration repository implementation in src/DigitalSignage.Infrastructure/Repositories/DeviceRegistrationRepository.cs
- [ ] T024 DeviceRegistrationController endpoints in src/DigitalSignage.Api/Controllers/DeviceRegistrationController.cs
- [ ] T025 AdminDeviceRegistrationController endpoints in src/DigitalSignage.Api/Controllers/AdminDeviceRegistrationController.cs

## Phase 3.4: Integration
- [ ] T026 [P] EF Core entity configurations in src/DigitalSignage.Infrastructure/Data/Configurations/DeviceRegistrationRequestConfiguration.cs
- [ ] T027 [P] EF Core entity configurations in src/DigitalSignage.Infrastructure/Data/Configurations/DeviceApprovalConfiguration.cs
- [ ] T028 [P] EF Core entity configurations in src/DigitalSignage.Infrastructure/Data/Configurations/RegistrationAuditLogConfiguration.cs
- [ ] T029 Database migration for new entities in src/DigitalSignage.Infrastructure/Migrations/
- [ ] T030 Service registration extensions in src/DigitalSignage.Api/Extensions/DeviceRegistrationServiceExtensions.cs
- [ ] T031 Update AppDbContext with new DbSets in src/DigitalSignage.Infrastructure/Data/AppDbContext.cs
- [ ] T032 JWT authentication integration for admin endpoints
- [ ] T033 Audit logging middleware integration
- [ ] T034 Input validation and error handling standardization

## Phase 3.5: Polish
- [ ] T035 [P] Unit tests for PIN generation service in tests/DigitalSignage.Application.Tests/Services/PinGenerationServiceTests.cs
- [ ] T036 [P] Unit tests for device registration service in tests/DigitalSignage.Application.Tests/Services/DeviceRegistrationServiceTests.cs
- [ ] T037 [P] Unit tests for repository layer in tests/DigitalSignage.Infrastructure.Tests/Repositories/DeviceRegistrationRepositoryTests.cs
- [ ] T038 [P] Performance tests for concurrent registrations (<500ms, 1000+ concurrent)
- [ ] T039 [P] Unit tests for domain entity validation in tests/DigitalSignage.Domain.Tests/Entities/DeviceRegistrationRequestTests.cs
- [ ] T040 [P] Update API documentation in docs/ with new endpoints
- [ ] T041 Manual testing validation using specs/011-android-tv-self/quickstart.md
- [ ] T042 Security testing for JWT authentication and authorization
- [ ] T043 Database performance optimization and index validation

## Dependencies
```
Setup Phase (T001-T004):
- T001 blocks T016, T017, T018 (enums needed for entities)
- T002-T004 can run in parallel

Test Phase (T005-T015):
- All tests can run in parallel (different files)
- Must complete before any implementation tasks

Core Implementation (T016-T025):
- T016-T018 (entities) can run in parallel, block T020, T023
- T019 (PIN service) blocks T020 (registration service)
- T020 blocks T024, T025 (controllers need service)
- T021-T022 (DTOs) can run in parallel with entities
- T023 (repository) needs entities, blocks controllers

Integration Phase (T026-T034):
- T026-T028 (EF configs) can run in parallel, need entities
- T029 (migration) needs EF configs
- T030-T031 (service registration) can run in parallel
- T032-T034 sequential integration tasks

Polish Phase (T035-T043):
- T035-T039 (unit tests) can run in parallel
- T040-T043 can run in parallel
- All polish tasks need core implementation complete
```

## Parallel Example
```
# Launch Test Phase together (T005-T015):
Task: "Contract test POST /v1/device-registration/register in tests/DigitalSignage.Api.Tests/Controllers/DeviceRegistrationControllerContractTests.cs"
Task: "Contract test GET /v1/device-registration/status/{id} in tests/DigitalSignage.Api.Tests/Controllers/DeviceRegistrationStatusContractTests.cs"
Task: "Contract test GET /v1/admin/device-registration/pending in tests/DigitalSignage.Api.Tests/Controllers/AdminDeviceRegistrationPendingContractTests.cs"
Task: "Integration test Successful Registration Flow in tests/DigitalSignage.Api.Tests/Integration/SuccessfulRegistrationFlowTests.cs"
Task: "Integration test Duplicate Registration in tests/DigitalSignage.Api.Tests/Integration/DuplicateRegistrationTests.cs"

# Launch Entity Creation together (T016-T018):
Task: "DeviceRegistrationRequest domain entity in src/DigitalSignage.Domain/Entities/DeviceRegistrationRequest.cs"
Task: "DeviceApproval domain entity in src/DigitalSignage.Domain/Entities/DeviceApproval.cs" 
Task: "RegistrationAuditLog domain entity in src/DigitalSignage.Domain/Entities/RegistrationAuditLog.cs"

# Launch EF Configurations together (T026-T028):
Task: "EF Core entity configurations in src/DigitalSignage.Infrastructure/Data/Configurations/DeviceRegistrationRequestConfiguration.cs"
Task: "EF Core entity configurations in src/DigitalSignage.Infrastructure/Data/Configurations/DeviceApprovalConfiguration.cs"
Task: "EF Core entity configurations in src/DigitalSignage.Infrastructure/Data/Configurations/RegistrationAuditLogConfiguration.cs"
```

## Notes
- [P] tasks = different files, no dependencies between them
- Verify tests fail before implementing (TDD approach)
- Commit after each task completion
- Each contract test validates one API endpoint from device-registration-api.yaml
- Each integration test validates one scenario from quickstart.md
- Follow Clean Architecture principles throughout implementation
- Maintain consistency with existing codebase patterns

## Task Generation Rules
✅ **Contract Coverage**: 6 contract tests for 6 API endpoints  
✅ **Entity Coverage**: 3 tasks for 3 domain entities  
✅ **Service Coverage**: 2 services (PIN generation, device registration)  
✅ **Integration Coverage**: 5 test scenarios from quickstart.md  
✅ **Repository Coverage**: 1 repository for device registration operations  
✅ **Controller Coverage**: 2 controllers (device + admin endpoints)  
✅ **Database Coverage**: EF Core configurations + migration  
✅ **Authentication**: JWT integration for admin endpoints  
✅ **Performance**: Concurrent registration testing  
✅ **Documentation**: API docs update and manual testing guide  

## Success Criteria
- All contract tests pass against OpenAPI specification
- All integration scenarios from quickstart.md execute successfully  
- Performance targets met (<500ms registration, 1000+ concurrent devices)
- Security validation complete (JWT auth, audit logging)
- Clean Architecture principles maintained
- Database migrations apply cleanly
- Manual testing procedures validated