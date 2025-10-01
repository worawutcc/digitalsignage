# Tasks: Basic Hierarchy Device Grouping #### Phase 4.1: Setup & Domain Model
- [x] T001 Extend DeviceGroup entity with hierarchical properties in `src/DigitalSignage.Domain/Entities/DeviceGroup.cs`
- [x] T002 Create HierarchyPath value object in `src/DigitalSignage.Domain/ValueObjects/HierarchyPath.cs`
- [x] T003 Create hierarchy validation rules in `src/DigitalSignage.Domain/Services/HierarchyValidationRules.cs`
- [x] T004 Add hierarchy methods to IDeviceGroupRepository interface in `src/DigitalSignage.Domain/Interfaces/IDeviceGroupRepository.cs`m

**Input**: Design documents from `/specs/014-basic-hierarchy/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Found: C# .NET 8 with ASP.NET Core Web API + Entity Framework Core 9
   → Extract: Clean Architecture, PostgreSQL, xUnit testing
2. Load optional design documents:
   → data-model.md: DeviceGroup entity extension, HierarchyPath value object, migrations
   → contracts/: api-specification.yaml → 8 hierarchical endpoints  
   → research.md: Self-referencing FK, recursive queries, path computation
3. Generate tasks by category:
   → Setup: Entity extension, migration, EF configuration
   → Tests: Contract tests for all 8 endpoints, integration tests
   → Core: Repository methods, service layer, DTOs
   → Integration: Controller endpoints, validation, performance
   → Polish: Unit tests, optimization, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Tests before implementation (TDD)
   → Domain → Application → Infrastructure → API layer order
5. Total: 32 numbered tasks (T001-T032)
6. Dependencies: Migration → Tests → Repository → Service → Controller → Polish
7. Parallel execution: Tests [P], DTOs [P], Independent services [P]
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
- **Tests**: `tests/DigitalSignage.*.Tests/`

## Phase 4.1: Setup & Domain Model
- [x] T001 Extend DeviceGroup entity with hierarchical properties in `src/DigitalSignage.Domain/Entities/DeviceGroup.cs`
- [x] T002 [P] Create HierarchyPath value object in `src/DigitalSignage.Domain/ValueObjects/HierarchyPath.cs`
- [ ] T003 [P] Create HierarchyValidationRules in `src/DigitalSignage.Domain/Services/HierarchyValidationRules.cs`
- [ ] T004 Add hierarchy methods to IDeviceGroupRepository interface in `src/DigitalSignage.Domain/Interfaces/IDeviceGroupRepository.cs`

#### Phase 4.2: TDD Contract Tests (failing tests first)
- [x] T005 Create failing test for GET /api/devicegroup/tree endpoint that returns hierarchical structure
- [x] T006 Create failing test for POST /api/devicegroup endpoint with ParentGroupId parameter
- [x] T007 Create failing test for PUT /api/devicegroup/{id}/move endpoint for hierarchy changes
- [x] T008 Create failing test for GET /api/devicegroup/{id}/path endpoint returning breadcrumb path
- [x] T009 Create failing test for GET /api/devicegroup/{id}/children endpoint
- [x] T010 Create failing test for GET /api/devicegroup/{id}/descendants endpoint
- [x] T011 Create failing test for GET /api/devicegroup/{id}/ancestors endpoint
- [x] T012 Create failing test for GET /api/devicegroup/{id}/can-move-to/{parentId} validation endpoint
- [x] T013 Create failing test for GET /api/devicegroup/search?term={searchTerm} endpoint
- [x] T014 Create failing test for GET /api/devicegroup/roots endpoint for top-level groups

## Phase 4.3: Data Layer (ONLY after tests are failing)
- [x] T015 Create AddHierarchicalGrouping migration in `src/DigitalSignage.Infrastructure/Data/Migrations/`
- [x] T016 Update DeviceGroupConfiguration for EF Core in `src/DigitalSignage.Infrastructure/Data/Configurations/DeviceGroupConfiguration.cs`
- [x] T017 Implement hierarchical repository methods in `src/DigitalSignage.Infrastructure/Repositories/DeviceGroupRepository.cs`
- [x] T018 [P] Create database function for path computation in migration SQL
- [x] T019 [P] Add indexes for hierarchy performance in migration

## Phase 4.4: Application Layer
- [x] T020 Create IDeviceGroupService interface in `src/DigitalSignage.Application/Interfaces/IDeviceGroupService.cs`
- [x] T021 [P] Create DeviceGroupTreeDto in `src/DigitalSignage.Application/DTOs/DeviceGroup/DeviceGroupTreeDto.cs`
- [x] T022 [P] Create CreateDeviceGroupRequest DTO in `src/DigitalSignage.Application/DTOs/DeviceGroup/CreateDeviceGroupRequest.cs`
- [x] T023 [P] Create MoveDeviceGroupRequest DTO in `src/DigitalSignage.Application/DTOs/DeviceGroup/MoveDeviceGroupRequest.cs`
- [x] T024 [P] Create DeviceGroupBreadcrumbDto in `src/DigitalSignage.Application/DTOs/DeviceGroup/DeviceGroupBreadcrumbDto.cs`
- [x] T025 [P] Create DeviceGroupSearchResultDto in `src/DigitalSignage.Application/DTOs/DeviceGroup/DeviceGroupSearchResultDto.cs`
- [x] T026 Implement DeviceGroupService business logic in `src/DigitalSignage.Application/Services/DeviceGroupService.cs`
- [x] T027 Add circular reference validation logic in DeviceGroupService
- [x] T028 Add hierarchy depth validation in DeviceGroupService

## Phase 4.5: API Layer
- [x] T029 Create DeviceGroupController with basic CRUD endpoints in `src/DigitalSignage.Api/Controllers/DeviceGroupController.cs`
- [x] T030 [P] Add hierarchical query endpoints (tree, children, descendants, ancestors)
- [x] T031 [P] Add path and breadcrumb endpoints
- [x] T032 [P] Add move validation and move operation endpoints
- [x] T033 [P] Add search and root groups endpoints
- [x] T034 [P] Add comprehensive error handling and input validation

## Phase 4.6: Integration
- [ ] T033 Register IDeviceGroupService in dependency injection in `src/DigitalSignage.Api/Extensions/ApplicationServiceExtensions.cs`
- [ ] T034 [P] Add hierarchy-specific configuration validation in `src/DigitalSignage.Api/Extensions/ConfigurationExtensions.cs`
- [ ] T035 [P] Enhance logging for hierarchy operations in DeviceGroupService
- [ ] T036 [P] Add performance monitoring for tree operations

## Phase 4.7: Polish & Validation
- [ ] T037 [P] Unit tests for HierarchyValidationRules in `tests/DigitalSignage.Domain.Tests/Services/HierarchyValidationRulesTests.cs`
- [ ] T038 [P] Unit tests for HierarchyPath value object in `tests/DigitalSignage.Domain.Tests/ValueObjects/HierarchyPathTests.cs`
- [ ] T039 [P] Unit tests for DeviceGroupService in `tests/DigitalSignage.Application.Tests/Services/DeviceGroupServiceTests.cs`
- [ ] T040 [P] Performance tests for tree operations (<100ms requirement) in `tests/DigitalSignage.Infrastructure.Tests/Performance/HierarchyPerformanceTests.cs`
- [ ] T041 [P] Integration tests for path computation function in `tests/DigitalSignage.Infrastructure.Tests/Data/PathComputationTests.cs`
- [ ] T042 Update API documentation in `docs/` with hierarchy endpoints
- [ ] T043 Run end-to-end validation using quickstart.md scenarios

## Dependencies

### Critical Path Dependencies
- **Domain Setup** (T001-T004) → **Tests** (T005-T014) → **Data Layer** (T015-T019)
- **Data Layer** → **Application Layer** (T020-T028) → **API Layer** (T029-T032)
- **API Layer** → **Integration** (T033-T036) → **Polish** (T037-T043)

### Specific Dependencies
- T001 (DeviceGroup entity) blocks T002, T015, T021
- T015 (Migration) blocks T017, T018, T019
- T017 (Repository) blocks T026 (Service)
- T020 (Service interface) blocks T026 (Service implementation)
- T021-T025 (DTOs) block T026 (Service) and T029 (Controller)
- T026 (Service) blocks T029 (Controller)
- T029-T031 (Controller) block T033 (DI registration)

### TDD Requirements
- Tests T005-T014 MUST be completed and failing before starting T015
- All contract tests must validate request/response schemas match OpenAPI spec
- Integration tests must cover circular reference prevention and performance requirements

## Parallel Execution Examples

### Phase 4.1 Setup (can run T002-T003 in parallel)
```bash
# Launch T002 and T003 together after T001 completes:
Task: "Create HierarchyPath value object in src/DigitalSignage.Domain/ValueObjects/HierarchyPath.cs"
Task: "Create HierarchyValidationRules in src/DigitalSignage.Domain/Services/HierarchyValidationRules.cs"
```

### Phase 4.2 Contract Tests (T005-T012 can run in parallel)
```bash
# Launch all contract tests together:
Task: "Contract test GET /api/device-groups/tree in tests/DigitalSignage.Api.Tests/Contract/DeviceGroupTreeContractTests.cs"
Task: "Contract test GET /api/device-groups/{id}/children in tests/DigitalSignage.Api.Tests/Contract/DeviceGroupChildrenContractTests.cs"
Task: "Contract test POST /api/device-groups/{id}/children in tests/DigitalSignage.Api.Tests/Contract/DeviceGroupCreateChildContractTests.cs"
# ... (all other contract tests)
```

### Phase 4.4 DTO Creation (T021-T025 can run in parallel)
```bash
# Launch DTO creation tasks together:
Task: "Create DeviceGroupTreeDto in src/DigitalSignage.Application/DTOs/DeviceGroup/DeviceGroupTreeDto.cs"
Task: "Create CreateDeviceGroupRequest DTO in src/DigitalSignage.Application/DTOs/DeviceGroup/CreateDeviceGroupRequest.cs"
Task: "Create MoveDeviceGroupRequest DTO in src/DigitalSignage.Application/DTOs/DeviceGroup/MoveDeviceGroupRequest.cs"
Task: "Create DeviceGroupBreadcrumbDto in src/DigitalSignage.Application/DTOs/DeviceGroup/DeviceGroupBreadcrumbDto.cs"
Task: "Create DeviceGroupSearchResultDto in src/DigitalSignage.Application/DTOs/DeviceGroup/DeviceGroupSearchResultDto.cs"
```

### Phase 4.7 Testing (T037-T041 can run in parallel)
```bash
# Launch unit and performance tests together:
Task: "Unit tests for HierarchyValidationRules in tests/DigitalSignage.Domain.Tests/Services/HierarchyValidationRulesTests.cs"
Task: "Unit tests for HierarchyPath value object in tests/DigitalSignage.Domain.Tests/ValueObjects/HierarchyPathTests.cs"
Task: "Unit tests for DeviceGroupService in tests/DigitalSignage.Application.Tests/Services/DeviceGroupServiceTests.cs"
Task: "Performance tests for tree operations in tests/DigitalSignage.Infrastructure.Tests/Performance/HierarchyPerformanceTests.cs"
Task: "Integration tests for path computation function in tests/DigitalSignage.Infrastructure.Tests/Data/PathComputationTests.cs"
```

## Notes
- [P] tasks operate on different files with no shared dependencies
- Verify all contract tests fail before implementing repository methods
- Migration must be applied to database before running integration tests
- Performance tests must validate <100ms tree operations and <2s hierarchy loading
- Circular reference prevention is critical - must be thoroughly tested
- Path computation function must handle up to 10 levels of hierarchy depth

## Validation Checklist
- [ ] All 8 API endpoints have corresponding contract tests
- [ ] DeviceGroup entity extension includes all hierarchical properties
- [ ] Migration includes database function for path computation
- [ ] Repository implements all hierarchical query methods
- [ ] Service includes circular reference and depth validation
- [ ] Controller endpoints match OpenAPI specification exactly
- [ ] Performance requirements verified with automated tests
- [ ] Integration tests cover end-to-end hierarchy scenarios

## Task Generation Rules Applied
- Each contract endpoint → dedicated contract test task [P]
- DeviceGroup entity extension → single model task (shared file, not [P])
- Each DTO → separate creation task [P] (different files)
- Repository methods → single implementation task (shared file)
- Service interface vs implementation → separate tasks (different concerns)
- Controller endpoints → grouped by shared file (not [P] within controller)
- Unit tests → separate tasks [P] (different test files)
- Integration setup → sequential tasks (interdependent)
- Polish tasks → parallel where possible [P]