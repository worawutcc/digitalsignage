# Tasks: QR Code Device Registration System

**Input**: Design - [x] T010 [S] Create IQrCodeService interface in `src/DigitalSignage.Domain/Interfaces/IQrCodeService.cs`ocuments from `/specs/013-qr-code-system/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Tech stack: C# .NET 8 with ASP.NET Core Web API, Entity Framework Core 9
   → Libraries: QRCoder, JWT Bearer Authentication, PostgreSQL (Npgsql)
   → Structure: Clean Architecture (Domain/Application/Infrastructure/Api)
2. Load optional design documents:
   → data-model.md: RegistrationMethod enum, QrCodeRegistrationData value object, DeviceRegistrationRequest updates
   → contracts/: api-specification.yaml → 2 endpoints, QrCodeRegistrationContractTests.cs
   → research.md: QRCoder library, JSON payload structure, performance requirements
3. Generate tasks by category:
   → Setup: QRCoder package, enum, value objects
   → Tests: contract tests for 2 endpoints, integration tests
   → Core: entity updates, DTOs, services, repositories
   → Integration: controller endpoints, EF migration, service registration
   → Polish: unit tests, performance validation, cleanup
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Entity Framework migration = sequential dependency
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph based on Clean Architecture layers
7. Create parallel execution examples for independent files
8. Validate task completeness: All contracts tested, entities implemented, endpoints working
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Domain Layer**: `src/DigitalSignage.Domain/`
- **Application Layer**: `src/DigitalSignage.Application/`
- **Infrastructure Layer**: `src/DigitalSignage.Infrastructure/`
- **API Layer**: `src/DigitalSignage.Api/`
- **Tests**: `tests/DigitalSignage.*.Tests/`

## Phase 3.1: Setup
- [x] T001 Add QRCoder NuGet package to DigitalSignage.Infrastructure project
- [x] T002 [P] Create RegistrationMethod enum in `src/DigitalSignage.Domain/Enums/RegistrationMethod.cs`
- [x] T003 [P] Create QrCodeRegistrationData value object in `src/DigitalSignage.Domain/ValueObjects/QrCodeRegistrationData.cs`
- [x] T004 [P] Create DeviceInfo value object in `src/DigitalSignage.Domain/ValueObjects/DeviceInfo.cs`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T005 [P] Contract test POST /api/device-registration/initiate-qr in `tests/DigitalSignage.Api.Tests/Contracts/InitiateQrRegistrationContractTests.cs`
- [ ] T006 [P] Contract test POST /api/device-registration/approve-qr in `tests/DigitalSignage.Api.Tests/Contracts/ApproveQrRegistrationContractTests.cs`
- [x] T007 [P] Integration test QR registration workflow in `tests/DigitalSignage.Api.Tests/Integration/QrRegistrationWorkflowTests.cs`
- [x] T008 [P] Unit test QR code generation service in `tests/DigitalSignage.Application.Tests/Services/QrCodeServiceTests.cs`
- [x] T009 [P] Unit test device registration service QR methods in `tests/DigitalSignage.Application.Tests/Services/DeviceRegistrationServiceQrTests.cs`

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T010 Update DeviceRegistrationRequest entity with QR fields in `src/DigitalSignage.Domain/Entities/DeviceRegistrationRequest.cs`
- [x] T011 [P] Create InitiateQrRegistrationRequestDto in `src/DigitalSignage.Application/DTOs/DeviceRegistration/InitiateQrRegistrationRequestDto.cs`
- [x] T012 [P] Create InitiateQrRegistrationResponseDto in `src/DigitalSignage.Application/DTOs/DeviceRegistration/InitiateQrRegistrationResponseDto.cs`
- [x] T013 [P] Create ApproveQrRegistrationRequestDto in `src/DigitalSignage.Application/DTOs/DeviceRegistration/ApproveQrRegistrationRequestDto.cs`
- [x] T014 [P] Create ApproveQrRegistrationResponseDto in `src/DigitalSignage.Application/DTOs/DeviceRegistration/ApproveQrRegistrationResponseDto.cs`
- [x] T015 [S] Implement QrCodeService in `src/DigitalSignage.Infrastructure/Services/QrCodeService.cs`
- [x] T016 [S] Add InitiateQrRegistrationAsync method to DeviceRegistrationService
- [x] T017 Extend IDeviceRegistrationService with QR methods in `src/DigitalSignage.Application/Interfaces/IDeviceRegistrationService.cs`
- [x] T018 Implement QR methods in DeviceRegistrationService in `src/DigitalSignage.Application/Services/DeviceRegistrationService.cs`

## Phase 3.4: Data Layer
- [x] T019 Create Entity Framework migration AddQrCodeSupport in `src/DigitalSignage.Infrastructure/Data/Migrations/`
- [x] T020 Update DeviceRegistrationRequestConfiguration for QR fields in `src/DigitalSignage.Infrastructure/Data/Configurations/DeviceRegistrationRequestConfiguration.cs`
- [x] T021 Apply database migration and verify schema changes

## Phase 3.5: API Layer
- [x] T022 Add InitiateQrRegistration endpoint to DeviceRegistrationController in `src/DigitalSignage.Api/Controllers/DeviceRegistrationController.cs`
- [x] T023 Add ApproveQrRegistration endpoint to DeviceRegistrationController in `src/DigitalSignage.Api/Controllers/DeviceRegistrationController.cs`
- [x] T024 Update DeviceRegistrationController using statements for new DTOs
- [x] T025 Add ProducesResponseType attributes for OpenAPI documentation

## Phase 3.6: Integration
- [ ] T026 Register IQrCodeService in DI container in `src/DigitalSignage.Infrastructure/Extensions/InfrastructureServiceExtensions.cs`
- [ ] T027 Update AutoMapper profile for QR DTOs in `src/DigitalSignage.Application/Mappings/DeviceRegistrationMappingProfile.cs`
- [ ] T028 Add QR code validation attributes in `src/DigitalSignage.Application/Validators/QrCodeValidationAttributes.cs`
- [ ] T029 Update OpenAPI documentation with QR endpoints in Swagger configuration

## Phase 3.7: Polish
- [ ] T030 [P] Unit tests for QR validation attributes in `tests/DigitalSignage.Application.Tests/Validators/QrCodeValidationTests.cs`
- [ ] T031 [P] Unit tests for AutoMapper QR profiles in `tests/DigitalSignage.Application.Tests/Mappings/QrMappingTests.cs`
- [ ] T032 [P] Performance test QR generation meets <2s requirement in `tests/DigitalSignage.Infrastructure.Tests/Performance/QrCodePerformanceTests.cs`
- [ ] T033 [P] Performance test approval workflow meets <3s requirement in `tests/DigitalSignage.Api.Tests/Performance/QrApprovalPerformanceTests.cs`
- [ ] T034 Integration test concurrent QR registrations (100 devices) in `tests/DigitalSignage.Api.Tests/Load/ConcurrentQrRegistrationTests.cs`
- [ ] T035 [P] Update repository documentation for QR endpoints in `README.md`
- [ ] T036 Run quickstart.md validation steps to verify end-to-end workflow
- [ ] T037 Clean up any temporary test data and verify database state

## Dependencies

### Setup Dependencies
- T001 (QRCoder package) must complete before T016 (QrCodeService implementation)
- T002-T004 (Domain objects) must complete before T011-T014 (DTOs)

### Test-First Dependencies  
- T005-T009 (All tests) must complete and FAIL before T010-T018 (Core implementation)
- T008 (QrCodeService tests) requires T015 (IQrCodeService interface) to be stubbed

### Layer Dependencies (Clean Architecture)
- T010 (Domain entity) before T011-T014 (Application DTOs)
- T015-T016 (Service interface/implementation) before T017-T018 (Service extension)
- T017-T018 (Application services) before T022-T023 (API controllers)
- T019-T021 (Database migration) before T022-T023 (API endpoints that use database)

### Integration Dependencies
- T016 (QrCodeService) before T026 (DI registration)
- T011-T014 (DTOs) before T027 (AutoMapper profile)
- T022-T023 (Controllers) before T025 (OpenAPI documentation)

### Polish Dependencies
- T030-T034 (Additional tests) require corresponding implementations to be complete
- T036 (Quickstart validation) requires all implementation tasks complete
- T037 (Cleanup) must be last

## Parallel Execution Examples

### Phase 3.1 Setup (After T001)
```bash
# Tasks T002-T004 can run in parallel (different files):
Task: "Create RegistrationMethod enum in src/DigitalSignage.Domain/Enums/RegistrationMethod.cs"
Task: "Create QrCodeRegistrationData value object in src/DigitalSignage.Domain/ValueObjects/QrCodeRegistrationData.cs"  
Task: "Create DeviceInfo value object in src/DigitalSignage.Domain/ValueObjects/DeviceInfo.cs"
```

### Phase 3.2 Contract Tests (All parallel)
```bash
# Tasks T005-T009 can run in parallel (different test files):
Task: "Contract test POST /api/device-registration/initiate-qr in tests/DigitalSignage.Api.Tests/Contracts/InitiateQrRegistrationContractTests.cs"
Task: "Contract test POST /api/device-registration/approve-qr in tests/DigitalSignage.Api.Tests/Contracts/ApproveQrRegistrationContractTests.cs"
Task: "Integration test QR registration workflow in tests/DigitalSignage.Api.Tests/Integration/QrRegistrationWorkflowTests.cs"
Task: "Unit test QR code generation service in tests/DigitalSignage.Infrastructure.Tests/Services/QrCodeServiceTests.cs"
Task: "Unit test device registration service QR methods in tests/DigitalSignage.Application.Tests/Services/DeviceRegistrationServiceQrTests.cs"
```

### Phase 3.3 DTOs Creation (After T010)
```bash
# Tasks T011-T014 can run in parallel (different DTO files):
Task: "Create InitiateQrRegistrationRequestDto in src/DigitalSignage.Application/DTOs/DeviceRegistration/InitiateQrRegistrationRequestDto.cs"
Task: "Create InitiateQrRegistrationResponseDto in src/DigitalSignage.Application/DTOs/DeviceRegistration/InitiateQrRegistrationResponseDto.cs"
Task: "Create ApproveQrRegistrationRequestDto in src/DigitalSignage.Application/DTOs/DeviceRegistration/ApproveQrRegistrationRequestDto.cs"
Task: "Create ApproveQrRegistrationResponseDto in src/DigitalSignage.Application/DTOs/DeviceRegistration/ApproveQrRegistrationResponseDto.cs"
```

### Phase 3.3 Service Layer (After T015 interface)
```bash
# Tasks T015-T016 can run in parallel (interface and implementation):
Task: "Create IQrCodeService interface in src/DigitalSignage.Application/Interfaces/IQrCodeService.cs"
Task: "Implement QrCodeService using QRCoder in src/DigitalSignage.Infrastructure/Services/QrCodeService.cs"
```

### Phase 3.7 Polish Tests
```bash
# Tasks T030-T033 can run in parallel (different test files):
Task: "Unit tests for QR validation attributes in tests/DigitalSignage.Application.Tests/Validators/QrCodeValidationTests.cs"
Task: "Unit tests for AutoMapper QR profiles in tests/DigitalSignage.Application.Tests/Mappings/QrMappingTests.cs"
Task: "Performance test QR generation <2s in tests/DigitalSignage.Infrastructure.Tests/Performance/QrCodePerformanceTests.cs"
Task: "Performance test approval workflow <3s in tests/DigitalSignage.Api.Tests/Performance/QrApprovalPerformanceTests.cs"
```

## Task Validation Checklist

### Contract Coverage
- [x] POST /api/device-registration/initiate-qr (T005)
- [x] POST /api/device-registration/approve-qr (T006)
- [x] Integration workflow test (T007)

### Entity Coverage  
- [x] RegistrationMethod enum (T002)
- [x] QrCodeRegistrationData value object (T003)
- [x] DeviceRegistrationRequest entity updates (T010)

### Service Coverage
- [x] IQrCodeService interface (T015) 
- [x] QrCodeService implementation (T016)
- [x] DeviceRegistrationService QR methods (T017-T018)

### API Coverage
- [x] InitiateQrRegistration endpoint (T022)
- [x] ApproveQrRegistration endpoint (T023)
- [x] OpenAPI documentation (T025, T029)

### Data Coverage
- [x] Entity Framework migration (T019)
- [x] EF configuration updates (T020)
- [x] Database schema validation (T021)

### Performance Coverage
- [x] QR generation <2s (T032)
- [x] Approval workflow <3s (T033) 
- [x] Concurrent registrations support (T034)

## Notes
- **[P] tasks**: Different files, no dependencies, can run simultaneously
- **TDD Requirement**: Tests T005-T009 MUST fail before implementing T010-T025
- **Clean Architecture**: Respect layer dependencies (Domain → Application → Infrastructure → API)
- **Migration Timing**: Database changes (T019-T021) before API endpoints (T022-T023)
- **Commit Strategy**: Commit after each completed task for better rollback capability
- **Performance Validation**: T032-T034 verify non-functional requirements from specification

## Risk Mitigation
- **QR Code Library**: T001 validates QRCoder package compatibility early
- **Database Schema**: T019-T021 handle migration carefully with rollback plan
- **Performance**: T032-T034 validate requirements before final delivery
- **Integration**: T007 and T036 provide end-to-end validation at different stages