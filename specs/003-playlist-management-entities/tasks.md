# Tasks: Playlist Management Entities

**Input**: Design documents from `/specs/003-playlist-management-entities/`
**Prerequisites**: spec.md (available), existing .NET 8 project structure with Domain/Application/Infrastructure layers

## Execution Flow (main)
```
1. Load spec.md from feature directory
   → Extract: 6 key entities (Playlist, PlaylistItem, Scene, SceneItem, PlaylistAssignment, PlaybackState)
   → Extract: 20 functional requirements across playlist and scene management
2. No additional design documents found:
   → No plan.md: Using existing project structure and spec requirements
   → No contracts/: Generate based on API patterns from copilot instructions
   → No data-model.md: Using entities from spec.md
3. Generate tasks by category:
   → Setup: New enums and base configurations
   → Tests: Entity validation, business logic, integration scenarios
   → Core: Domain entities, application services, DTOs
   → Integration: EF Core configurations, database migrations
   → Polish: Unit tests, validation, documentation updates
4. Apply task rules:
   → Different files = mark [P] for parallel execution
   → Same file = sequential (no [P])
   → Tests before implementation (TDD approach)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph based on entity relationships
7. Create parallel execution examples for independent files
8. Validate task completeness against 20 functional requirements
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Setup
- [ ] T001 Create PlaylistStatus enum in `src/DigitalSignage.Domain/Enums/PlaylistStatus.cs`
- [ ] T002 [P] Create SceneLayoutType enum in `src/DigitalSignage.Domain/Enums/SceneLayoutType.cs`
- [ ] T003 [P] Create TransitionEffect enum in `src/DigitalSignage.Domain/Enums/TransitionEffect.cs`
- [ ] T004 [P] Create PlaybackStatus enum in `src/DigitalSignage.Domain/Enums/PlaybackStatus.cs`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T005 [P] Entity validation tests for Playlist in `tests/DigitalSignage.Domain.Tests/Entities/PlaylistTests.cs`
- [ ] T006 [P] Entity validation tests for PlaylistItem in `tests/DigitalSignage.Domain.Tests/Entities/PlaylistItemTests.cs`
- [ ] T007 [P] Entity validation tests for Scene in `tests/DigitalSignage.Domain.Tests/Entities/SceneTests.cs`
- [ ] T008 [P] Entity validation tests for SceneItem in `tests/DigitalSignage.Domain.Tests/Entities/SceneItemTests.cs`
- [ ] T009 [P] Entity validation tests for PlaylistAssignment in `tests/DigitalSignage.Domain.Tests/Entities/PlaylistAssignmentTests.cs`
- [ ] T010 [P] Entity validation tests for PlaybackState in `tests/DigitalSignage.Domain.Tests/Entities/PlaybackStateTests.cs`
- [ ] T011 [P] Integration test playlist creation workflow in `tests/DigitalSignage.Application.Tests/Services/PlaylistServiceIntegrationTests.cs`
- [ ] T012 [P] Integration test scene management workflow in `tests/DigitalSignage.Application.Tests/Services/SceneServiceIntegrationTests.cs`

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T013 [P] Playlist entity in `src/DigitalSignage.Domain/Entities/Playlist.cs`
- [ ] T014 [P] PlaylistItem entity in `src/DigitalSignage.Domain/Entities/PlaylistItem.cs`
- [ ] T015 [P] Scene entity in `src/DigitalSignage.Domain/Entities/Scene.cs`
- [ ] T016 [P] SceneItem entity in `src/DigitalSignage.Domain/Entities/SceneItem.cs`
- [ ] T017 [P] PlaylistAssignment entity in `src/DigitalSignage.Domain/Entities/PlaylistAssignment.cs`
- [ ] T018 [P] PlaybackState entity in `src/DigitalSignage.Domain/Entities/PlaybackState.cs`
- [ ] T019 [P] PlaylistDto in `src/DigitalSignage.Application/DTOs/PlaylistDto.cs`
- [ ] T020 [P] CreatePlaylistRequest DTO in `src/DigitalSignage.Application/DTOs/CreatePlaylistRequest.cs`
- [ ] T021 [P] SceneDto in `src/DigitalSignage.Application/DTOs/SceneDto.cs`
- [ ] T022 [P] CreateSceneRequest DTO in `src/DigitalSignage.Application/DTOs/CreateSceneRequest.cs`
- [ ] T023 [P] IPlaylistService interface in `src/DigitalSignage.Application/Interfaces/IPlaylistService.cs`
- [ ] T024 [P] ISceneService interface in `src/DigitalSignage.Application/Interfaces/ISceneService.cs`
- [ ] T025 PlaylistService implementation in `src/DigitalSignage.Application/Services/PlaylistService.cs`
- [ ] T026 SceneService implementation in `src/DigitalSignage.Application/Services/SceneService.cs`

## Phase 3.4: Integration
- [ ] T027 [P] Playlist EF Core configuration in `src/DigitalSignage.Infrastructure/Data/Configurations/PlaylistConfiguration.cs`
- [ ] T028 [P] PlaylistItem EF Core configuration in `src/DigitalSignage.Infrastructure/Data/Configurations/PlaylistItemConfiguration.cs`
- [ ] T029 [P] Scene EF Core configuration in `src/DigitalSignage.Infrastructure/Data/Configurations/SceneConfiguration.cs`
- [ ] T030 [P] SceneItem EF Core configuration in `src/DigitalSignage.Infrastructure/Data/Configurations/SceneItemConfiguration.cs`
- [ ] T031 [P] PlaylistAssignment EF Core configuration in `src/DigitalSignage.Infrastructure/Data/Configurations/PlaylistAssignmentConfiguration.cs`
- [ ] T032 [P] PlaybackState EF Core configuration in `src/DigitalSignage.Infrastructure/Data/Configurations/PlaybackStateConfiguration.cs`
- [ ] T033 Update AppDbContext with new entities in `src/DigitalSignage.Infrastructure/Data/AppDbContext.cs`
- [ ] T034 Create database migration for playlist entities
- [ ] T035 [P] PlaylistController in `src/DigitalSignage.Api/Controllers/PlaylistController.cs`
- [ ] T036 [P] SceneController in `src/DigitalSignage.Api/Controllers/SceneController.cs`
- [ ] T037 Register services in DI container in `src/DigitalSignage.Api/Program.cs`

## Phase 3.5: Polish
- [ ] T038 [P] Unit tests for PlaylistService in `tests/DigitalSignage.Application.Tests/Services/PlaylistServiceTests.cs`
- [ ] T039 [P] Unit tests for SceneService in `tests/DigitalSignage.Application.Tests/Services/SceneServiceTests.cs`
- [ ] T040 [P] API controller tests for PlaylistController in `tests/DigitalSignage.Api.Tests/Controllers/PlaylistControllerTests.cs`
- [ ] T041 [P] API controller tests for SceneController in `tests/DigitalSignage.Api.Tests/Controllers/SceneControllerTests.cs`
- [ ] T042 [P] Performance tests for playlist operations (<200ms for CRUD)
- [ ] T043 [P] Update copilot instructions with playlist API endpoints in `.github/copilot-instructions.md`
- [ ] T044 [P] Validation for playlist business rules (non-empty playlists, valid durations)
- [ ] T045 End-to-end testing of complete playlist workflow

## Dependencies
- Setup (T001-T004) before tests and implementation
- Tests (T005-T012) before implementation (T013-T026)
- T013 (Playlist entity) blocks T025 (PlaylistService) and T027 (PlaylistConfiguration)
- T014 (PlaylistItem entity) blocks T025 (PlaylistService) and T028 (PlaylistItemConfiguration)  
- T015 (Scene entity) blocks T026 (SceneService) and T029 (SceneConfiguration)
- T016 (SceneItem entity) blocks T026 (SceneService) and T030 (SceneItemConfiguration)
- T017 (PlaylistAssignment entity) blocks T031 (PlaylistAssignmentConfiguration)
- T018 (PlaybackState entity) blocks T032 (PlaybackStateConfiguration)
- T033 (AppDbContext update) depends on all entity configurations (T027-T032)
- T034 (database migration) depends on T033 (AppDbContext update)
- T035-T036 (Controllers) depend on T025-T026 (Services)
- T037 (DI registration) depends on T025-T026 (Services)
- Implementation before polish (T038-T045)

## Parallel Example
```
# Launch T005-T010 together (entity tests):
Task: "Entity validation tests for Playlist in tests/DigitalSignage.Domain.Tests/Entities/PlaylistTests.cs"
Task: "Entity validation tests for PlaylistItem in tests/DigitalSignage.Domain.Tests/Entities/PlaylistItemTests.cs"
Task: "Entity validation tests for Scene in tests/DigitalSignage.Domain.Tests/Entities/SceneTests.cs"
Task: "Entity validation tests for SceneItem in tests/DigitalSignage.Domain.Tests/Entities/SceneItemTests.cs"
Task: "Entity validation tests for PlaylistAssignment in tests/DigitalSignage.Domain.Tests/Entities/PlaylistAssignmentTests.cs"
Task: "Entity validation tests for PlaybackState in tests/DigitalSignage.Domain.Tests/Entities/PlaybackStateTests.cs"

# Launch T013-T018 together (domain entities):
Task: "Playlist entity in src/DigitalSignage.Domain/Entities/Playlist.cs"
Task: "PlaylistItem entity in src/DigitalSignage.Domain/Entities/PlaylistItem.cs"
Task: "Scene entity in src/DigitalSignage.Domain/Entities/Scene.cs"
Task: "SceneItem entity in src/DigitalSignage.Domain/Entities/SceneItem.cs"
Task: "PlaylistAssignment entity in src/DigitalSignage.Domain/Entities/PlaylistAssignment.cs"
Task: "PlaybackState entity in src/DigitalSignage.Domain/Entities/PlaybackState.cs"

# Launch T027-T032 together (EF configurations):
Task: "Playlist EF Core configuration in src/DigitalSignage.Infrastructure/Data/Configurations/PlaylistConfiguration.cs"
Task: "PlaylistItem EF Core configuration in src/DigitalSignage.Infrastructure/Data/Configurations/PlaylistItemConfiguration.cs"
Task: "Scene EF Core configuration in src/DigitalSignage.Infrastructure/Data/Configurations/SceneConfiguration.cs"
Task: "SceneItem EF Core configuration in src/DigitalSignage.Infrastructure/Data/Configurations/SceneItemConfiguration.cs"
Task: "PlaylistAssignment EF Core configuration in src/DigitalSignage.Infrastructure/Data/Configurations/PlaylistAssignmentConfiguration.cs"
Task: "PlaybackState EF Core configuration in src/DigitalSignage.Infrastructure/Data/Configurations/PlaybackStateConfiguration.cs"
```

## Notes
- [P] tasks = different files, no dependencies between them
- Verify all entity tests fail before implementing entities (TDD)
- Each entity should have proper relationships with existing Media and Device entities
- Follow clean architecture principles: Domain → Application → Infrastructure → Api
- Commit after each task completion
- Ensure playlist entities integrate with existing scheduling system
- Scene management should support multiple layout types and positioning

## Task Generation Rules
*Applied during main() execution*

1. **From Spec Requirements**:
   - Each key entity (6 total) → domain model task + EF configuration + tests
   - Each service interface → service implementation task
   - Each controller → API endpoint implementation
   
2. **From Entity Relationships**:
   - Playlist ↔ PlaylistItem (one-to-many)
   - PlaylistItem → Media (many-to-one, existing)
   - Scene ↔ SceneItem (one-to-many)
   - SceneItem → Media (many-to-one, existing)
   - PlaylistAssignment → Playlist + Device (many-to-one each)
   - PlaybackState → Device + Playlist (many-to-one each)
   
3. **From User Scenarios**:
   - Playlist creation workflow → integration test + service methods
   - Scene management → integration test + service methods
   - Device assignment → assignment entity + service logic

4. **Ordering**:
   - Enums → Tests → Entities → DTOs → Services → EF Config → Migration → Controllers → Polish
   - Dependencies prevent parallel execution where entities share relationships

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All 6 key entities have corresponding model creation tasks
- [x] All entities have validation tests before implementation
- [x] All tests come before implementation (TDD approach)
- [x] Parallel tasks are truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Entity relationships properly handled in dependencies
- [x] Integration with existing Media and Device entities covered
- [x] All 20 functional requirements addressed through tasks
- [x] Clean architecture layers respected (Domain → Application → Infrastructure → Api)