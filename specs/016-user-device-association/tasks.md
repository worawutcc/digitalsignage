# Tasks: User-Device Association

**Input**: Design documents from `/specs/016-user-device-association/`  
**Prerequisites**: plan.md (required), spec.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Extract: C# .NET 8, ASP.NET Core Web API, Entity Framework Core 9, PostgreSQL
   → Tech stack: Clean Architecture with JWT authentication
2. Load spec.md requirements:
   → FR-001 to FR-012: User-device association CRUD operations
   → Key entities: User, Device, UserDeviceAssociation
3. Generate tasks by category:
   → Setup: Entity model and DTOs
   → Tests: Contract tests, integration tests  
   → Core: Services, repositories, controllers
   → Integration: API endpoints, validation
   → Polish: Audit logging, performance optimization
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Clean Architecture**: `src/DigitalSignage.Domain/`, `src/DigitalSignage.Application/`, `src/DigitalSignage.Infrastructure/`, `src/DigitalSignage.Api/`
- **Tests**: `tests/DigitalSignage.Domain.Tests/`, `tests/DigitalSignage.Application.Tests/`, `tests/DigitalSignage.Infrastructure.Tests/`, `tests/DigitalSignage.Api.Tests/`

## Phase 3.1: Setup & Domain Models
 - [X] T001 [P] Create UserDeviceAssociation entity in src/DigitalSignage.Domain/Entities/UserDeviceAssociation.cs
 - [X] T002 [P] Create UserDeviceAssociationDto in src/DigitalSignage.Application/DTOs/UserDeviceAssociationDto.cs
 - [X] T003 [P] Create CreateUserDeviceAssociationRequest DTO in src/DigitalSignage.Application/DTOs/CreateUserDeviceAssociationRequest.cs
 - [X] T004 [P] Create UpdateUserDeviceAssociationRequest DTO in src/DigitalSignage.Application/DTOs/UpdateUserDeviceAssociationRequest.cs

## Phase 3.2: Entity Framework Configuration
 - [X] T005 Configure UserDeviceAssociation entity mapping in src/DigitalSignage.Infrastructure/Data/Configurations/UserDeviceAssociationConfiguration.cs
 - [X] T006 Add UserDeviceAssociation DbSet to AppDbContext in src/DigitalSignage.Infrastructure/Data/AppDbContext.cs
 - [X] T007 Create and apply EF Core migration for UserDeviceAssociation table

## Phase 3.3: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.4
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
 - [X] T008 [P] Unit test UserDeviceAssociation entity validation in tests/DigitalSignage.Domain.Tests/Entities/UserDeviceAssociationTests.cs
 - [X] T009 [P] Contract test POST /api/user-device-associations in tests/DigitalSignage.Api.Tests/Controllers/UserDeviceAssociationControllerTests.cs
 - [X] T010 [P] Contract test GET /api/user-device-associations in tests/DigitalSignage.Api.Tests/Controllers/UserDeviceAssociationControllerTests.cs  
 - [X] T011 [P] Contract test GET /api/user-device-associations/{id} in tests/DigitalSignage.Api.Tests/Controllers/UserDeviceAssociationControllerTests.cs
 - [X] T012 [P] Contract test PUT /api/user-device-associations/{id} in tests/DigitalSignage.Api.Tests/Controllers/UserDeviceAssociationControllerTests.cs
 - [X] T013 [P] Contract test DELETE /api/user-device-associations/{id} in tests/DigitalSignage.Api.Tests/Controllers/UserDeviceAssociationControllerTests.cs
 - [X] T014 [P] Integration test user association creation workflow in tests/DigitalSignage.Api.Tests/Integration/UserDeviceAssociationIntegrationTests.cs
 - [X] T015 [P] Integration test bulk association operations in tests/DigitalSignage.Api.Tests/Integration/BulkAssociationTests.cs
 - [X] T016 [P] Service unit tests for UserDeviceAssociationService in tests/DigitalSignage.Application.Tests/Services/UserDeviceAssociationServiceTests.cs

## Phase 3.4: Repository Layer (ONLY after tests are failing)  
 - [X] T017 [P] Create IUserDeviceAssociationRepository interface in src/DigitalSignage.Domain/Interfaces/IUserDeviceAssociationRepository.cs
 - [X] T018 Implement UserDeviceAssociationRepository in src/DigitalSignage.Infrastructure/Data/Repositories/UserDeviceAssociationRepository.cs

## Phase 3.5: Application Services
 - [X] T019 [P] Create IUserDeviceAssociationService interface in src/DigitalSignage.Application/Interfaces/IUserDeviceAssociationService.cs
 - [X] T020 Implement UserDeviceAssociationService in src/DigitalSignage.Application/Services/UserDeviceAssociationService.cs
 - [X] T021 Add AutoMapper profile for UserDeviceAssociation mappings in src/DigitalSignage.Application/Mappings/UserDeviceAssociationProfile.cs

## Phase 3.6: API Controllers
 - [X] T022 Create UserDeviceAssociationController with CRUD endpoints in src/DigitalSignage.Api/Controllers/UserDeviceAssociationController.cs
 - [X] T023 Add user-specific endpoint GET /api/users/{userId}/devices in existing UsersController
 - [X] T024 Add device-specific endpoint GET /api/devices/{deviceId}/users in existing DeviceController (if exists) or create DeviceController
 - [X] T025 Add bulk operations endpoint POST /api/user-device-associations/bulk in UserDeviceAssociationController

## Phase 3.7: Validation & Security
 - [X] T026 [P] Add FluentValidation validators for UserDeviceAssociation DTOs in src/DigitalSignage.Application/Validators/UserDeviceAssociationValidators.cs
 - [X] T027 [P] Implement authorization policies for user-device associations in src/DigitalSignage.Api/Authorization/UserDeviceAssociationPolicies.cs  
 - [X] T028 Add audit logging for association changes in UserDeviceAssociationService

## Phase 3.8: Integration & Service Registration
 - [X] T029 Register UserDeviceAssociationService and repository in DI container in src/DigitalSignage.Api/Extensions/ApplicationServiceExtensions.cs
 - [X] T030 Update existing User and Device navigation properties for associations
 - [X] T031 Add cascade delete handling for user/device deletion scenarios

## Phase 3.9: Search & Filtering
 - [X] T032 [P] Implement search functionality in UserDeviceAssociationRepository for filtering associations
 - [X] T033 Add search and pagination endpoints to UserDeviceAssociationController
 - [X] T034 [P] Create search request DTOs in src/DigitalSignage.Application/DTOs/SearchUserDeviceAssociationRequest.cs

## Phase 3.10: Polish & Performance
 - [X] T035 [P] Add performance indexes for UserDeviceAssociation queries  
 - [X] T036 [P] Add comprehensive logging throughout UserDeviceAssociation operations
 - [X] T037 [P] Create user documentation for association management in docs/user-device-associations.md
 - [X] T038 [P] Performance test association operations for response time requirements
 - [X] T039 Run integration test suite to verify all user scenarios
 - [X] T040 Update API documentation with new endpoints
 - [X] T035 [P] Add performance indexes for UserDeviceAssociation queries  
 - [X] T036 [P] Add comprehensive logging throughout UserDeviceAssociation operations
 - [X] T037 [P] Create user documentation for association management in docs/user-device-associations.md
 - [X] T038 [P] Performance test association operations for response time requirements
 - [X] T039 Run integration test suite to verify all user scenarios
 - [X] T040 Update API documentation with new endpoints

## Dependencies
- Domain models (T001-T004) before EF configuration (T005-T007)
- EF configuration (T005-T007) before tests (T008-T016)  
- Tests (T008-T016) before implementation (T017-T025)
- Repository (T017-T018) before services (T019-T021)
- Services (T019-T021) before controllers (T022-T025)
- Core implementation (T017-T025) before validation (T026-T028)
- All core features before integration (T029-T031)
- Basic functionality before search features (T032-T034)
- Everything before polish (T035-T040)

## Parallel Example
```
# Launch T001-T004 together (Domain models):
Task: "Create UserDeviceAssociation entity in src/DigitalSignage.Domain/Entities/UserDeviceAssociation.cs"
Task: "Create UserDeviceAssociationDto in src/DigitalSignage.Application/DTOs/UserDeviceAssociationDto.cs"  
Task: "Create CreateUserDeviceAssociationRequest DTO in src/DigitalSignage.Application/DTOs/CreateUserDeviceAssociationRequest.cs"
Task: "Create UpdateUserDeviceAssociationRequest DTO in src/DigitalSignage.Application/DTOs/UpdateUserDeviceAssociationRequest.cs"

# Launch T008-T016 together (Tests):
Task: "Unit test UserDeviceAssociation entity validation in tests/DigitalSignage.Domain.Tests/Entities/UserDeviceAssociationTests.cs"
Task: "Contract test POST /api/user-device-associations in tests/DigitalSignage.Api.Tests/Controllers/UserDeviceAssociationControllerTests.cs"
# ... (other test tasks)
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Follow Clean Architecture principles: Domain → Application → Infrastructure → API
- Maintain existing JWT authentication and RBAC patterns
- Consider shared device access scenarios (FR-007 clarification needed)
- Handle cascade deletion scenarios (FR-010 clarification needed)
- Implement search criteria per FR-011 (clarification needed)
- Define bulk operations scope per FR-012 (clarification needed)

## Task Generation Rules
*Applied during main() execution*

1. **From Spec Requirements**:
   - Each functional requirement → implementation task
   - Each entity → model creation task [P]
   - Each CRUD operation → endpoint task

2. **From Clean Architecture**:
   - Domain entities → Domain layer tasks [P]
   - Business logic → Application layer tasks
   - Data access → Infrastructure layer tasks  
   - API endpoints → API layer tasks

3. **From User Stories**:
   - Each acceptance scenario → integration test [P]
   - Edge cases → validation and error handling tasks

4. **Ordering**:
   - Setup → Tests → Domain → Application → Infrastructure → API → Polish
   - Dependencies block parallel execution
   - TDD: Tests before implementation

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All functional requirements have corresponding tasks
- [x] All entities have model tasks  
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Clean Architecture layer dependencies respected
- [x] Existing codebase patterns followed (.NET 8, EF Core 9, JWT auth)