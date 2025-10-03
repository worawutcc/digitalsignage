# Tasks: Device Registration Management UI

**LAST UPDATED**: 2025-10-03 - Major progress completed including domain models, migrations, frontend services, hooks, API client, and comprehensive test suites.

## ✅ COMPLETED HIGHLIGHTS

### Backend Infrastructure (✅ Complete)
- ✅ **Entity Framework Migration**: New Android TV Device Management migration with DeviceConfiguration, DeviceStatusLog, and RegistrationRecord tables
- ✅ **Domain Models**: DeviceConfiguration, DeviceStatusLog, RegistrationRecord entities with proper relationships
- ✅ **Database Configuration**: Entity configurations with PostgreSQL datetime handling and proper foreign keys
- ✅ **SignalR Integration**: Device notification service with real-time event broadcasting

### Frontend Foundation (✅ Complete)  
- ✅ **API Client**: Comprehensive deviceApi.ts with all CRUD operations, registration workflow, and real-time features
- ✅ **React Query Hooks**: useDevice.ts with device management, configuration, status monitoring, and bulk operations hooks
- ✅ **TypeScript Types**: Complete API response and request type definitions
- ✅ **Android TV Utils**: Utility library with device status management, formatting, and validation helpers

### Test Coverage (✅ Complete)
- ✅ **Integration Tests**: AndroidTVDeviceIntegrationTests with endpoint validation and authentication testing
- ✅ **Unit Tests**: Service layer tests for AndroidTVDeviceManagementService and AndroidTVStatusManagementService  
- ✅ **SignalR Tests**: RealtimeEventBroadcaster tests with comprehensive event broadcasting coverage
- ✅ **Test Infrastructure**: TestAuthenticationHandler for integration test authentication

### Application Services & DTOs (✅ Complete - T029-T035)
- ✅ **Device Services**: IDeviceService, IDeviceConfigurationService, IDeviceMonitoringService, IBulkOperationsService with full implementations
- ✅ **Device DTOs**: Complete set of registration, update, response, and configuration DTOs
- ✅ **FluentValidation**: Comprehensive validators for all device operations with proper validation rules

**Input**: Design documents from `/specs/022-device-registration-management/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Extract: C# .NET 8 (API), Next.js 14 with TypeScript (Frontend)
   → Tech stack: ASP.NET Core, Entity Framework Core, NextUI, React Query
   → Structure: Web application (backend API + frontend web app)
2. Load optional design documents:
   → data-model.md: Device, DeviceConfiguration, DeviceStatus entities
   → contracts/: api-contract.yaml with 5 endpoint groups
   → research.md: Android TV workflow decisions
3. Generate tasks by category:
   → Setup: project init, dependencies, database migrations
   → Tests: contract tests, integration tests (TDD approach)
   → Core: models, services, controllers (backend), components (frontend)
   → Integration: SignalR, real-time updates, authentication
   → Polish: unit tests, performance validation, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph for backend and frontend
7. Create parallel execution examples
8. Validate task completeness: All contracts tested, entities modeled, endpoints implemented
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Backend files: `src/DigitalSignage.*/`
- Frontend files: `src/digital-signage-web/src/`
- Test files: `tests/` and `src/digital-signage-web/__tests__/`

## Phase 3.1: Setup and Dependencies
- [x] T001 Setup Entity Framework migrations for Device entities in `src/DigitalSignage.Infrastructure/Data/Migrations/`
- [x] T002 [P] Configure SignalR hubs for real-time device status in `src/DigitalSignage.Api/Hubs/DeviceStatusHub.cs`
- [x] T003 [P] Install and configure frontend dependencies (NextUI, React Query, Axios) in `src/digital-signage-web/package.json`
- [x] T004 [P] Setup frontend API client configuration in `src/digital-signage-web/src/lib/api.ts`
- [ ] T005 [P] Configure Tailwind CSS with design system in `src/digital-signage-web/tailwind.config.js`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Backend API Contract Tests
- [x] T006 [P] Contract test GET /api/devices with pagination in `tests/DigitalSignage.Api.Tests/Controllers/DevicesControllerTests.cs`
- [x] T007 [P] Contract test POST /api/devices device registration in `tests/DigitalSignage.Api.Tests/Controllers/DevicesControllerTests.cs`
- [x] T008 [P] Contract test GET /api/devices/{deviceId} device details in `tests/DigitalSignage.Api.Tests/Controllers/DevicesControllerTests.cs`
- [x] T009 [P] Contract test PUT /api/devices/{deviceId} device update in `tests/DigitalSignage.Api.Tests/Controllers/DevicesControllerTests.cs`
- [x] T010 [P] Contract test DELETE /api/devices/{deviceId} device deactivation in `tests/DigitalSignage.Api.Tests/Controllers/DevicesControllerTests.cs`
- [x] T011 [P] Contract test GET /api/devices/{deviceId}/configuration in `tests/DigitalSignage.Api.Tests/Controllers/DeviceConfigurationControllerTests.cs`
- [x] T012 [P] Contract test PUT /api/devices/{deviceId}/configuration in `tests/DigitalSignage.Api.Tests/Controllers/DeviceConfigurationControllerTests.cs`
- [x] T013 [P] Contract test GET /api/devices/{deviceId}/status history in `tests/DigitalSignage.Api.Tests/Controllers/DeviceStatusControllerTests.cs`
- [x] T014 [P] Contract test POST /api/devices/bulk operations in `tests/DigitalSignage.Api.Tests/Controllers/BulkOperationsControllerTests.cs`

### Backend Integration Tests
- [x] T015 [P] Integration test device registration workflow in `tests/DigitalSignage.Application.Tests/Services/DeviceRegistrationWorkflowTests.cs`
- [x] T016 [P] Integration test Android TV configuration management in `tests/DigitalSignage.Application.Tests/Services/AndroidTVConfigurationTests.cs`
- [x] T017 [P] Integration test device status monitoring and heartbeat in `tests/DigitalSignage.Application.Tests/Services/DeviceMonitoringTests.cs`
- [x] T018 [P] Integration test bulk device operations in `tests/DigitalSignage.Application.Tests/Services/BulkDeviceOperationsTests.cs`

### Frontend Component Tests
- [ ] T019 [P] Component test DeviceRegistrationForm validation in `src/digital-signage-web/__tests__/components/DeviceRegistrationForm.test.tsx`
- [ ] T020 [P] Component test DeviceList with pagination and filtering in `src/digital-signage-web/__tests__/components/DeviceList.test.tsx`
- [ ] T021 [P] Component test DeviceDetails configuration management in `src/digital-signage-web/__tests__/components/DeviceDetails.test.tsx`
- [ ] T022 [P] Component test DeviceStatusIndicator real-time updates in `src/digital-signage-web/__tests__/components/DeviceStatusIndicator.test.tsx`
- [ ] T023 [P] Component test BulkOperationsModal in `src/digital-signage-web/__tests__/components/BulkOperationsModal.test.tsx`

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Backend Domain Models
- [x] T024 [P] Device entity with Android TV fields in `src/DigitalSignage.Domain/Entities/Device.cs`
- [x] T025 [P] DeviceConfiguration entity for Android TV settings in `src/DigitalSignage.Domain/Entities/DeviceConfiguration.cs`
- [x] T026 [P] DeviceStatus enum and StatusLog entity in `src/DigitalSignage.Domain/Entities/DeviceStatusLog.cs`
- [x] T027 [P] RegistrationRecord entity for audit trail in `src/DigitalSignage.Domain/Entities/RegistrationRecord.cs`
- [x] T028 [P] DeviceStatus, DisplayOrientation, PowerManagement enums in `src/DigitalSignage.Domain/Enums/DeviceEnums.cs`

### Backend Application Services
- [x] T029 [P] IDeviceService interface and DeviceService implementation in `src/DigitalSignage.Application/Services/DeviceService.cs`
- [x] T030 [P] IDeviceConfigurationService for Android TV configuration in `src/DigitalSignage.Application/Services/DeviceConfigurationService.cs`
- [x] T031 [P] IDeviceMonitoringService for status tracking in `src/DigitalSignage.Application/Services/DeviceMonitoringService.cs`
- [x] T032 [P] IBulkOperationsService for batch operations in `src/DigitalSignage.Application/Services/BulkOperationsService.cs`

### Backend DTOs and Validators
- [x] T033 [P] Device DTOs (Registration, Update, Response) in `src/DigitalSignage.Application/DTOs/DeviceDTOs.cs`
- [x] T034 [P] DeviceConfiguration DTOs in `src/DigitalSignage.Application/DTOs/DeviceConfigurationDTOs.cs`
- [x] T035 [P] FluentValidation validators for device operations in `src/DigitalSignage.Application/Validators/DeviceValidators.cs`

### Backend API Controllers
- [x] T036 DevicesController GET /api/devices with filtering and pagination in `src/DigitalSignage.Api/Controllers/DevicesController.cs`
- [x] T037 DevicesController POST /api/devices device registration in `src/DigitalSignage.Api/Controllers/DevicesController.cs`
- [x] T038 DevicesController GET /api/devices/{deviceId} device details in `src/DigitalSignage.Api/Controllers/DevicesController.cs`
- [x] T039 DevicesController PUT and DELETE operations in `src/DigitalSignage.Api/Controllers/DevicesController.cs`
- [x] T040 [P] DeviceConfigurationController for Android TV settings in `src/DigitalSignage.Api/Controllers/DeviceConfigurationController.cs`
- [x] T041 [P] DeviceStatusController for status history in `src/DigitalSignage.Api/Controllers/DeviceStatusController.cs`
- [x] T042 [P] BulkOperationsController for batch operations in `src/DigitalSignage.Api/Controllers/BulkOperationsController.cs`

### Frontend Type Definitions
- [x] T043 [P] Device and DeviceConfiguration TypeScript interfaces in `src/digital-signage-web/src/types/device.ts`
- [x] T044 [P] API response and request types in `src/digital-signage-web/src/types/api.ts`
- [x] T045 [P] Form validation schemas with Zod in `src/digital-signage-web/src/schemas/deviceSchemas.ts`

### Frontend Services and Hooks
- [x] T046 [P] DeviceService API client methods in `src/digital-signage-web/src/services/deviceService.ts`
- [x] T047 [P] useDevices React Query hook with real-time updates in `src/digital-signage-web/src/hooks/useDevices.ts`
- [x] T048 [P] useDeviceConfiguration hook in `src/digital-signage-web/src/hooks/useDeviceConfiguration.ts`
- [x] T049 [P] useDeviceStatus hook for monitoring in `src/digital-signage-web/src/hooks/useDeviceStatus.ts`
- [x] T050 [P] useBulkOperations hook in `src/digital-signage-web/src/hooks/useBulkOperations.ts`

### Frontend Components
- [x] T051 [P] DeviceRegistrationForm with Android TV fields in `src/digital-signage-web/src/components/devices/DeviceRegistrationForm.tsx`
- [x] T052 [P] DeviceList with pagination and filtering in `src/digital-signage-web/src/components/devices/DeviceList.tsx`
- [x] T053 [P] DeviceCard component for list display in `src/digital-signage-web/src/components/devices/DeviceCard.tsx`
- [x] T054 [P] DeviceDetails with configuration tabs in `src/digital-signage-web/src/components/devices/DeviceDetails.tsx`
- [x] T055 [P] DeviceStatusIndicator with real-time updates in `src/digital-signage-web/src/components/devices/DeviceStatusIndicator.tsx`
- [x] T056 [P] AndroidTVConfigurationForm in `src/digital-signage-web/src/components/devices/AndroidTVConfigurationForm.tsx`
- [x] T057 [P] BulkOperationsModal component in `src/digital-signage-web/src/components/devices/BulkOperationsModal.tsx`

### Frontend Pages
- [x] T058 Device management page layout in `src/digital-signage-web/src/app/devices/page.tsx`
- [x] T059 Device details page with configuration in `src/digital-signage-web/src/app/devices/[deviceId]/page.tsx`
- [x] T060 Device registration page in `src/digital-signage-web/src/app/devices/register/page.tsx`

## Phase 3.4: Integration and Real-time Features
- [ ] T061 SignalR DeviceStatusHub implementation for real-time updates in `src/DigitalSignage.Api/Hubs/DeviceStatusHub.cs`
- [ ] T062 WebSocket client setup and connection management in `src/digital-signage-web/src/lib/websocket.ts`
- [ ] T063 Device heartbeat background service in `src/DigitalSignage.Api/Services/DeviceHeartbeatService.cs`
- [ ] T064 Entity Framework repository implementations in `src/DigitalSignage.Infrastructure/Repositories/DeviceRepository.cs`
- [ ] T065 Database seed data for device configurations in `src/DigitalSignage.Infrastructure/Data/Seed/DeviceSeedData.cs`
- [ ] T066 Authentication and authorization for device management in `src/DigitalSignage.Api/Authorization/DeviceManagementPolicy.cs`
- [ ] T067 Error handling middleware for device operations in `src/DigitalSignage.Api/Middleware/DeviceErrorHandlingMiddleware.cs`

## Phase 3.5: Polish and Optimization
- [ ] T068 [P] Unit tests for Device domain logic in `tests/DigitalSignage.Domain.Tests/Entities/DeviceTests.cs`
- [ ] T069 [P] Unit tests for DeviceService business logic in `tests/DigitalSignage.Application.Tests/Services/DeviceServiceUnitTests.cs`
- [x] T070 [P] Frontend unit tests for device utilities in `src/digital-signage-web/__tests__/utils/deviceUtils.test.ts`
- [ ] T071 [P] Performance tests for device list pagination (<500ms) in `tests/DigitalSignage.Api.Tests/Performance/DeviceListPerformanceTests.cs`
- [ ] T072 [P] E2E tests for device registration workflow in `src/digital-signage-web/__tests__/e2e/deviceRegistration.test.ts`
- [ ] T073 [P] Update API documentation with device endpoints in `docs/api/device-management.md`
- [ ] T074 Code cleanup and remove duplication across device services
- [ ] T075 Execute quickstart.md validation scenarios and fix issues

## Dependencies
**Critical Path Dependencies:**
- Setup (T001-T005) must complete before all other phases
- All tests (T006-T023) MUST complete and FAIL before implementation (T024-T067)
- Domain models (T024-T028) block application services (T029-T032)
- Application services block API controllers (T036-T042)
- Backend DTOs (T033-T035) needed for controllers (T036-T042)
- Frontend types (T043-T045) needed for services and components (T046-T057)
- API services (T046) blocks hooks (T047-T050)
- Components (T051-T057) needed for pages (T058-T060)
- Integration features (T061-T067) require core implementation complete
- Polish and testing (T068-T075) comes last

**File-level Dependencies:**
- T036-T039 all modify `DevicesController.cs` → must be sequential
- T047-T050 all import from T046 `deviceService.ts`
- T058-T060 pages depend on components T051-T057

## Parallel Execution Examples

### Phase 3.2: Test Generation (All Parallel)
```bash
# Backend Contract Tests - can run simultaneously
npx task "Contract test GET /api/devices with pagination in tests/DigitalSignage.Api.Tests/Controllers/DevicesControllerTests.cs"
npx task "Contract test POST /api/devices device registration in tests/DigitalSignage.Api.Tests/Controllers/DevicesControllerTests.cs"
npx task "Contract test GET /api/devices/{deviceId}/configuration in tests/DigitalSignage.Api.Tests/Controllers/DeviceConfigurationControllerTests.cs"

# Frontend Component Tests - different files, parallel
npx task "Component test DeviceRegistrationForm validation in src/digital-signage-web/__tests__/components/DeviceRegistrationForm.test.tsx"
npx task "Component test DeviceList with pagination in src/digital-signage-web/__tests__/components/DeviceList.test.tsx"
```

### Phase 3.3: Model Creation (Parallel within Domain)
```bash
# Domain entities - separate files, can be parallel
npx task "Device entity with Android TV fields in src/DigitalSignage.Domain/Entities/Device.cs"
npx task "DeviceConfiguration entity in src/DigitalSignage.Domain/Entities/DeviceConfiguration.cs"
npx task "DeviceStatus enum in src/DigitalSignage.Domain/Enums/DeviceEnums.cs"

# Application services - separate files, parallel after domain complete
npx task "IDeviceService implementation in src/DigitalSignage.Application/Services/DeviceService.cs"
npx task "IDeviceConfigurationService in src/DigitalSignage.Application/Services/DeviceConfigurationService.cs"
```

## Notes
- **[P] tasks**: Different files, no shared dependencies - safe for parallel execution
- **Sequential tasks**: Same file modifications or direct dependencies - must run in order
- **Verify tests fail**: All T006-T023 must fail before starting T024+
- **Android TV focus**: Configuration forms and fields specific to Android TV workflow
- **Real-time updates**: SignalR/WebSocket integration for device status monitoring
- **Multi-tenant**: Organization-based device isolation throughout implementation

## Task Generation Rules Applied
1. **From Contracts**: api-contract.yaml → 9 contract test tasks (T006-T014)
2. **From Data Model**: 4 entities → 5 model creation tasks (T024-T028) 
3. **From User Stories**: 6 quickstart journeys → 5 integration test tasks (T015-T018, T072)
4. **TDD Ordering**: All tests (T006-T023) before implementation (T024+)
5. **Dependencies**: Domain → Application → API → Frontend layers
6. **Parallel Marking**: Different files and independent tasks marked [P]

## Validation Checklist ✅
- [x] All API contracts have corresponding tests (T006-T014)
- [x] All entities have model creation tasks (T024-T028)
- [x] All tests come before implementation (T006-T023 before T024+)
- [x] Parallel tasks are truly independent ([P] marked correctly)
- [x] Each task specifies exact file path
- [x] No [P] task modifies same file as another [P] task
- [x] Frontend and backend architectures properly separated
- [x] Android TV specific requirements addressed throughout