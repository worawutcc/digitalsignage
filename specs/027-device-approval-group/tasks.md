# Tasks: Device Approval + Group Management Enhancement

**Input**: Design documents from `/specs/027-device-approval-group/`  
**Prerequisites**: plan.md, research.md, data-model.md, contracts/  
**Integration Approach**: Enhance existing entities rather than create new tables

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Tech stack: C# .NET 8, Entity Framework Core 9, Next.js 15, PostgreSQL
   → Structure: Clean Architecture (Api/Application/Domain/Infrastructure + Next.js frontend)
2. Load design documents:
   → data-model.md: Integration with existing DeviceGroup, DeviceApproval, PlaylistAssignment
   → contracts/: DeviceApprovalContractTests.cs, DeviceGroupContractTests.cs, api-contracts.md
   → research.md: Technical decisions for existing entity enhancement
3. Generate tasks by category:
   → Setup: Dependencies verification, linting configuration
   → Tests: Contract tests for enhanced endpoints, integration tests
   → Core: Service enhancements, DTO updates, controller extensions
   → Integration: Enhanced repositories, WebSocket notifications
   → Polish: Unit tests, performance validation, documentation
4. Apply integration rules:
   → Enhance existing controllers instead of creating new ones
   → Extend existing services rather than build from scratch
   → Build upon existing DeviceGroup hierarchical structure
   → Leverage existing DeviceApproval workflow
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions
- Focus on **enhancement** and **integration** with existing components

## Phase 3.1: Setup & Validation
- [x] T001 Verify existing entities in src/DigitalSignage.Domain/Entities/ (DeviceGroup, Device, DeviceApproval, PlaylistAssignment)
- [x] T002 [P] Update NuGet packages for SignalR and bulk operations support in src/DigitalSignage.Api/DigitalSignage.Api.csproj
- [x] T003 [P] Configure enhanced linting rules for integration patterns in .editorconfig

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T004 [P] Contract test bulk device approval POST /api/v1/admin/device-registration/bulk-approve in tests/DigitalSignage.Api.Tests/Controllers/AdminDeviceRegistrationBulkContractTests.cs
- [x] T005 [P] Contract test enhanced device groups GET /api/v1/admin/device-groups with hierarchy in tests/DigitalSignage.Api.Tests/Controllers/DeviceGroupControllerHierarchyContractTests.cs  
- [x] T006 [P] Contract test group content assignment POST /api/v1/admin/device-groups/{id}/content in tests/DigitalSignage.Api.Tests/Controllers/DeviceGroupContentAssignmentContractTests.cs
- [x] T007 [P] Integration test device approval workflow with group assignment in tests/DigitalSignage.Application.Tests/Services/DeviceApprovalServiceIntegrationTests.cs
- [x] T008 [P] Integration test hierarchical group content inheritance in tests/DigitalSignage.Application.Tests/Services/DeviceGroupServiceIntegrationTests.cs

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Backend API Enhancements
- [x] T009 [P] Enhanced DeviceApprovalDto with group assignment in src/DigitalSignage.Application/DTOs/AdminDeviceRegistration/DeviceApprovalResponseDto.cs
- [x] T010 [P] Enhanced DeviceGroupDto with content assignments in src/DigitalSignage.Application/DTOs/DeviceGroup/DeviceGroupDtos.cs
- [x] T011 [P] BulkDeviceApprovalRequest DTO in src/DigitalSignage.Application/DTOs/AdminDeviceRegistration/BulkDeviceApprovalRequestDto.cs
- [ ] T012 Enhance IDeviceApprovalService interface with bulk operations in src/DigitalSignage.Application/Interfaces/IDeviceApprovalService.cs
- [ ] T013 Enhance DeviceApprovalService with bulk approval logic in src/DigitalSignage.Application/Services/DeviceApprovalService.cs
- [ ] T014 [P] Enhance IDeviceGroupService interface with content assignment in src/DigitalSignage.Application/Interfaces/IDeviceGroupService.cs
- [ ] T015 [P] Enhance DeviceGroupService with hierarchical content distribution in src/DigitalSignage.Application/Services/DeviceGroupService.cs
- [ ] T016 Extend AdminDeviceRegistrationController with bulk operations in src/DigitalSignage.Api/Controllers/AdminDeviceRegistrationController.cs
- [ ] T017 Enhance DeviceGroupController with content assignment endpoints in src/DigitalSignage.Api/Controllers/DeviceGroupController.cs

### Repository Pattern Extensions  
- [ ] T018 [P] Enhance IDeviceApprovalRepository with bulk queries in src/DigitalSignage.Infrastructure/Repositories/Interfaces/IDeviceApprovalRepository.cs
- [ ] T019 [P] Enhance DeviceApprovalRepository with bulk operations in src/DigitalSignage.Infrastructure/Repositories/DeviceApprovalRepository.cs
- [ ] T020 [P] Enhance IDeviceGroupRepository with hierarchy queries in src/DigitalSignage.Infrastructure/Repositories/Interfaces/IDeviceGroupRepository.cs
- [ ] T021 Enhance DeviceGroupRepository with content assignment queries in src/DigitalSignage.Infrastructure/Repositories/DeviceGroupRepository.cs

## Phase 3.4: Integration & Real-time Features
- [ ] T022 [P] DeviceApprovalHub for SignalR notifications in src/DigitalSignage.Api/Hubs/DeviceApprovalHub.cs
- [ ] T023 [P] DeviceGroupHub for group change notifications in src/DigitalSignage.Api/Hubs/DeviceGroupHub.cs
- [ ] T024 Integrate SignalR hubs in existing Program.cs configuration in src/DigitalSignage.Api/Program.cs
- [ ] T025 [P] Enhanced audit logging in DeviceApprovalService in src/DigitalSignage.Application/Services/DeviceApprovalService.cs
- [ ] T026 Background service for group content synchronization in src/DigitalSignage.Infrastructure/Services/GroupContentSyncService.cs

## Phase 3.5: Frontend Integration (Next.js)
- [ ] T027 [P] Enhanced DeviceApproval types in src/digital-signage-web/src/types/device.ts
- [ ] T028 [P] Enhanced DeviceGroup types with content assignments in src/digital-signage-web/src/types/deviceGroup.ts
- [ ] T029 [P] Bulk approval service in src/digital-signage-web/src/services/deviceApprovalService.ts
- [ ] T030 [P] Enhanced device group service with content management in src/digital-signage-web/src/services/deviceGroupService.ts
- [ ] T031 Bulk device approval component in src/digital-signage-web/src/features/devices/components/BulkApprovalModal.tsx
- [ ] T032 [P] Enhanced device group management component in src/digital-signage-web/src/features/device-groups/components/DeviceGroupManager.tsx
- [ ] T033 [P] Group content assignment component in src/digital-signage-web/src/features/device-groups/components/GroupContentAssignment.tsx
- [ ] T034 [P] SignalR hooks for real-time updates in src/digital-signage-web/src/hooks/useSignalR.ts
- [ ] T035 Enhanced admin dashboard with bulk operations in src/digital-signage-web/src/app/admin/devices/page.tsx

## Phase 3.6: Polish & Performance
- [ ] T036 [P] Unit tests for bulk approval logic in tests/DigitalSignage.Application.Tests/Services/DeviceApprovalServiceTests.cs
- [ ] T037 [P] Unit tests for group content inheritance in tests/DigitalSignage.Application.Tests/Services/DeviceGroupServiceTests.cs
- [ ] T038 [P] Performance tests for bulk operations (<500ms for 100 devices) in tests/DigitalSignage.Api.Tests/Performance/BulkOperationsPerformanceTests.cs
- [ ] T039 [P] Frontend unit tests for bulk approval component in src/digital-signage-web/tests/components/BulkApprovalModal.test.tsx
- [ ] T040 [P] Update API documentation in docs/api/device-approval-group-api.md
- [ ] T041 Database migration for any schema enhancements in src/DigitalSignage.Infrastructure/Migrations/
- [ ] T042 End-to-end testing scenarios per quickstart.md in tests/e2e/device-approval-group.spec.ts

## Dependencies
```
Setup (T001-T003) → Tests (T004-T008) → Core Implementation (T009-T021) → Integration (T022-T026) → Frontend (T027-T035) → Polish (T036-T042)

Key Blocking Dependencies:
- T001 (entity verification) blocks T004-T008 (contract tests need existing entities)
- T004-T008 (failing tests) MUST complete before T009-T021 (implementation)
- T012-T013 (service enhancements) block T016 (controller extensions)
- T018-T021 (repository enhancements) block T013, T015 (service implementations)
- T022-T024 (SignalR hubs) block T034 (frontend SignalR hooks)
- T009-T011 (DTOs) block T029-T030 (frontend services)
```

## Parallel Execution Examples
```bash
# Phase 3.2 - Contract Tests (all can run in parallel)
Task: "Contract test bulk device approval POST /api/v1/admin/device-registration/bulk-approve"
Task: "Contract test enhanced device groups GET /api/v1/admin/device-groups with hierarchy" 
Task: "Contract test group content assignment POST /api/v1/admin/device-groups/{id}/content"
Task: "Integration test device approval workflow with group assignment"
Task: "Integration test hierarchical group content inheritance"

# Phase 3.3 - DTOs (different files, can run in parallel)
Task: "Enhanced DeviceApprovalDto with group assignment in src/DigitalSignage.Application/DTOs/DeviceApprovalDto.cs"
Task: "Enhanced DeviceGroupDto with content assignments in src/DigitalSignage.Application/DTOs/DeviceGroupDto.cs"
Task: "BulkDeviceApprovalRequest DTO in src/DigitalSignage.Application/DTOs/BulkDeviceApprovalRequest.cs"

# Phase 3.5 - Frontend Types (different files, can run in parallel)  
Task: "Enhanced DeviceApproval types in src/digital-signage-web/src/types/device.ts"
Task: "Enhanced DeviceGroup types with content assignments in src/digital-signage-web/src/types/deviceGroup.ts"
```

## Integration Strategy Notes
- **Existing Entity Leverage**: Build upon DeviceGroup hierarchical structure, DeviceApproval workflow, PlaylistAssignment content distribution
- **No New Tables Required**: All functionality achieved through existing schema enhancement
- **API Extension Pattern**: Extend existing AdminDeviceRegistrationController and DeviceGroupController rather than create new controllers  
- **Service Enhancement**: Enhance existing DeviceApprovalService and DeviceGroupService with bulk operations and content management
- **Frontend Integration**: Build upon existing admin dashboard structure with enhanced components for bulk operations

## Validation Checklist
- [x] All contract tests defined (T004-T008)
- [x] All existing entities validated before implementation (T001)
- [x] Enhanced services for existing workflows (T013, T015)
- [x] Extended existing controllers (T016, T017)
- [x] Real-time notifications integrated (T022-T024)
- [x] Frontend components enhance existing admin dashboard (T031-T035)
- [x] Performance requirements addressed (<500ms bulk operations)
- [x] Integration approach prioritizes existing infrastructure enhancement