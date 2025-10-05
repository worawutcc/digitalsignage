# Tasks: เพิ่ม API endpoint และ service ที่ UI ยังขาด พร้อม input validation

**Input**: Design documents from `/specs/025-api-end-point/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
2. Load optional design documents: data-model.md, contracts/, research.md
3. Generate tasks by category: Setup, Core, Integration, Polish
4. Apply task rules: Tests before implementation (TDD), but skip actual test execution per requirements
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness
9. Return: SUCCESS (tasks ready for execution)
```

## Phase 3.1: Setup
- [ ] T001 Create/verify backend project structure for API endpoints and services (src/DigitalSignage.Api/, src/DigitalSignage.Application/, src/DigitalSignage.Domain/, src/DigitalSignage.Infrastructure/)
- [ ] T002 Ensure all dependencies are installed: ASP.NET Core Web API, Entity Framework Core, PostgreSQL, AWS SDK S3, log4net
- [ ] T003 [P] Configure linting and formatting tools (e.g., dotnet format, .editorconfig)

## Phase 3.2: Data Models & DTOs
- [ ] T004 [P] Implement Media entity, DTOs, and validation in src/DigitalSignage.Domain/Media.cs and src/DigitalSignage.Application/MediaDto.cs
- [ ] T005 [P] Implement Schedule entity, DTOs, and validation in src/DigitalSignage.Domain/Schedule.cs and src/DigitalSignage.Application/ScheduleDto.cs
- [ ] T006 [P] Implement Device entity, DTOs, and validation in src/DigitalSignage.Domain/Device.cs and src/DigitalSignage.Application/DeviceDto.cs
- [ ] T007 [P] Implement Playlist entity, DTOs, and validation in src/DigitalSignage.Domain/Playlist.cs and src/DigitalSignage.Application/PlaylistDto.cs
- [ ] T008 [P] Implement User entity, DTOs, and validation in src/DigitalSignage.Domain/User.cs and src/DigitalSignage.Application/UserDto.cs

## Phase 3.3: Service Layer
- [ ] T009 Implement MediaService CRUD and business logic in src/DigitalSignage.Application/MediaService.cs
- [ ] T010 Implement ScheduleService CRUD and business logic in src/DigitalSignage.Application/ScheduleService.cs
- [ ] T011 Implement DeviceService CRUD and business logic in src/DigitalSignage.Application/DeviceService.cs
- [ ] T012 Implement PlaylistService CRUD and business logic in src/DigitalSignage.Application/PlaylistService.cs
- [ ] T013 Implement UserService CRUD and business logic in src/DigitalSignage.Application/UserService.cs

## Phase 3.4: API Controllers & Endpoints
- [ ] T014 Implement MediaController endpoints per media.openapi.yaml in src/DigitalSignage.Api/Controllers/MediaController.cs
- [ ] T015 Implement ScheduleController endpoints per schedule.openapi.yaml in src/DigitalSignage.Api/Controllers/ScheduleController.cs
- [ ] T016 Implement DeviceController endpoints per device.openapi.yaml in src/DigitalSignage.Api/Controllers/DeviceController.cs
- [ ] T017 Implement PlaylistController endpoints per playlist.openapi.yaml in src/DigitalSignage.Api/Controllers/PlaylistController.cs
- [ ] T018 Implement DashboardController endpoints per dashboard.openapi.yaml in src/DigitalSignage.Api/Controllers/DashboardController.cs
- [ ] T019 Implement UserController endpoints per user.openapi.yaml in src/DigitalSignage.Api/Controllers/UserController.cs

## Phase 3.5: Integration & Registration
+ [x] T020 Integrate all new services into DI container via extension methods in src/DigitalSignage.Api/Extensions/ApplicationServiceExtensions.cs
+ [x] T021 Configure Entity Framework Core for new entities in src/DigitalSignage.Infrastructure/Data/AppDbContext.cs
+ [x] T022 Register and document all new endpoints for frontend integration

## Phase 3.6: Polish & Documentation
+ [x] T023 [P] Update OpenAPI/Swagger documentation for all new endpoints
+ [x] T024 [P] Add XML comments and ProducesResponseType attributes for all controllers
+ [x] T025 [P] Review and ensure input validation and error handling for all endpoints
+ [x] T026 [P] Update README and developer docs for new API endpoints and usage

## Parallel Execution Examples
- T004–T008 (entity/model/DTO creation) can run in parallel
- T023–T026 (documentation, polish) can run in parallel

## Dependency Notes
- Models/DTOs (T004–T008) must be completed before services (T009–T013)
- Services must be completed before controllers/endpoints (T014–T019)
- Integration (T020–T022) depends on all previous steps
- Polish/documentation (T023–T026) can run after all implementation

---
