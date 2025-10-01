# Tasks: Digital Signage .NET 8 Project Structure Setup

**Input**: Design documents from `/specs/002-setup-project-structure/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Found: .NET 8 Clean Architecture with ASP.NET Core Web API
   → Extract: C# .NET 8, EF Core 8, PostgreSQL/SQL Server, xUnit, Docker, AWS S3
2. Load optional design documents:
   → data-model.md: Extracted 7 entities → model tasks
   → contracts/: Found 6 contract operations → contract test tasks
   → quickstart.md: Found 4 validation tests → integration test tasks
3. Generate tasks by category:
   → Setup: .NET solution, project structure, dependencies
   → Tests: contract tests, validation tests
   → Core: project files, configurations, Docker setup
   → Integration: database, logging, AWS S3, health checks
   → Polish: build pipeline, documentation updates
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. SUCCESS: 25 tasks ready for execution
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
Based on plan.md structure: Clean Architecture with `src/` and `tests/` directories
- `src/DigitalSignage.Api/` - Web API project
- `src/DigitalSignage.Application/` - Business logic
- `src/DigitalSignage.Domain/` - Core entities
- `src/DigitalSignage.Infrastructure/` - Data access and external services

## Phase 3.1: Setup
- [ ] T001 Create solution structure with DigitalSignage.sln at repository root
- [ ] T002 [P] Create DigitalSignage.Api project in src/DigitalSignage.Api/
- [ ] T003 [P] Create DigitalSignage.Application project in src/DigitalSignage.Application/
- [ ] T004 [P] Create DigitalSignage.Domain project in src/DigitalSignage.Domain/
- [ ] T005 [P] Create DigitalSignage.Infrastructure project in src/DigitalSignage.Infrastructure/
- [ ] T006 Configure project references per clean architecture dependencies
- [ ] T007 [P] Add NuGet packages to Api project (ASP.NET Core, log4net, AWS SDK)
- [ ] T008 [P] Add NuGet packages to Infrastructure project (EF Core, Npgsql, SQL Server)

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T009 [P] Contract test CreateSolution operation in tests/DigitalSignage.Infrastructure.Tests/ContractTests/SolutionCreationTests.cs
- [ ] T010 [P] Contract test ConfigureProject operation in tests/DigitalSignage.Infrastructure.Tests/ContractTests/ProjectConfigurationTests.cs
- [ ] T011 [P] Contract test SetupDatabase operation in tests/DigitalSignage.Infrastructure.Tests/ContractTests/DatabaseSetupTests.cs
- [ ] T012 [P] Contract test SetupTesting operation in tests/DigitalSignage.Infrastructure.Tests/ContractTests/TestSetupTests.cs
- [ ] T013 [P] Contract test SetupDocker operation in tests/DigitalSignage.Infrastructure.Tests/ContractTests/DockerSetupTests.cs
- [ ] T014 [P] Contract test ConfigureS3 operation in tests/DigitalSignage.Infrastructure.Tests/ContractTests/S3ConfigurationTests.cs
- [ ] T015 [P] Integration test solution builds successfully in tests/DigitalSignage.Api.Tests/Integration/SolutionBuildTests.cs
- [ ] T016 [P] Integration test project references work in tests/DigitalSignage.Api.Tests/Integration/ProjectReferenceTests.cs
- [ ] T017 [P] Integration test clean architecture dependencies in tests/DigitalSignage.Api.Tests/Integration/ArchitectureTests.cs

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T018 [P] Create test projects structure (Api.Tests, Application.Tests, Domain.Tests, Infrastructure.Tests)
- [ ] T019 [P] Configure test database providers (InMemory, SQLite) in tests/DigitalSignage.Infrastructure.Tests/
- [ ] T020 Configure appsettings.json files for Development, Staging, Production in src/DigitalSignage.Api/
- [ ] T021 Setup dependency injection container in src/DigitalSignage.Api/Program.cs
- [ ] T022 [P] Create folder structure for Api project (Controllers/, Middleware/, Filters/)
- [ ] T023 [P] Create folder structure for Application project (Services/, DTOs/, Validators/)
- [ ] T024 [P] Create folder structure for Domain project (Entities/, Interfaces/, Enums/)
- [ ] T025 [P] Create folder structure for Infrastructure project (Data/, Repositories/, Services/)

## Phase 3.4: Integration
- [ ] T026 Setup Entity Framework DbContext in src/DigitalSignage.Infrastructure/Data/AppDbContext.cs
- [ ] T027 Configure database providers (PostgreSQL/SQL Server) in src/DigitalSignage.Infrastructure/Data/
- [ ] T028 Setup log4net configuration in src/DigitalSignage.Api/log4net.config
- [ ] T029 Configure health check endpoints in src/DigitalSignage.Api/Program.cs
- [ ] T030 Setup AWS S3 service integration in src/DigitalSignage.Infrastructure/Services/S3FileUploadService.cs

## Phase 3.5: Docker & Deployment
- [ ] T031 [P] Create Dockerfile with multi-stage build in docker/Dockerfile
- [ ] T032 [P] Create docker-compose.yml for development in docker/docker-compose.yml
- [ ] T033 [P] Create docker-compose.prod.yml for production in docker/docker-compose.prod.yml
- [ ] T034 Configure Docker health checks and environment variables

## Phase 3.6: Build Pipeline
- [ ] T035 [P] Create GitHub Actions build workflow in .github/workflows/build.yml
- [ ] T036 [P] Create GitHub Actions deployment workflow in .github/workflows/deploy.yml
- [ ] T037 Configure MSBuild targets for different environments

## Phase 3.7: Polish
- [ ] T038 [P] Run quickstart validation tests (solution builds, references work, tests pass)
- [ ] T039 [P] Update project documentation in README.md
- [ ] T040 [P] Create developer onboarding guide
- [ ] T041 Verify all validation criteria from quickstart.md are met
- [ ] T042 Clean up placeholder files and ensure project structure is production-ready

## Dependencies
- Setup (T001-T008) before Tests (T009-T017)
- Tests (T009-T017) before Implementation (T018-T025)
- Core structure (T018-T025) before Integration (T026-T030)
- Integration (T026-T030) before Docker (T031-T034)
- Core setup before Build Pipeline (T035-T037)
- All implementation before Polish (T038-T042)

## Parallel Example
```
# Launch T002-T005 together (create projects):
Task: "Create DigitalSignage.Api project in src/DigitalSignage.Api/"
Task: "Create DigitalSignage.Application project in src/DigitalSignage.Application/"
Task: "Create DigitalSignage.Domain project in src/DigitalSignage.Domain/"
Task: "Create DigitalSignage.Infrastructure project in src/DigitalSignage.Infrastructure/"

# Launch T009-T014 together (contract tests):
Task: "Contract test CreateSolution operation in tests/DigitalSignage.Infrastructure.Tests/ContractTests/SolutionCreationTests.cs"
Task: "Contract test ConfigureProject operation in tests/DigitalSignage.Infrastructure.Tests/ContractTests/ProjectConfigurationTests.cs"
Task: "Contract test SetupDatabase operation in tests/DigitalSignage.Infrastructure.Tests/ContractTests/DatabaseSetupTests.cs"
Task: "Contract test SetupTesting operation in tests/DigitalSignage.Infrastructure.Tests/ContractTests/TestSetupTests.cs"
Task: "Contract test SetupDocker operation in tests/DigitalSignage.Infrastructure.Tests/ContractTests/DockerSetupTests.cs"
Task: "Contract test ConfigureS3 operation in tests/DigitalSignage.Infrastructure.Tests/ContractTests/S3ConfigurationTests.cs"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Follow quickstart.md for validation steps
- Commit after each task or logical group
- Ensure clean architecture dependency rules are enforced

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - 6 contract operations → 6 contract test tasks [P] (T009-T014)
   - Each operation → corresponding implementation in setup tasks
   
2. **From Data Model**:
   - 7 entities (Solution, Project, Configuration, Database, Docker, Test, Build) → folder structure tasks [P]
   - Entity relationships → dependency injection and service registration tasks
   
3. **From Quickstart Guide**:
   - 4 validation tests → 4 integration test tasks [P] (T015-T017, T038)
   - Step-by-step commands → corresponding implementation tasks

4. **Ordering**:
   - Setup → Tests → Implementation → Integration → Docker → Build → Polish
   - Dependencies prevent parallel execution where files conflict

## Validation Checklist
*GATE: Checked before task execution*

- [x] All 6 contracts have corresponding test tasks (T009-T014)
- [x] All 7 data model entities represented in folder structure tasks
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks truly independent (different files, no shared resources)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Quickstart validation scenarios covered (T015-T017, T038)