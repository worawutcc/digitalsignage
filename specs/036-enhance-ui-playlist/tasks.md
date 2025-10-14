# Tasks: Enhanced UI Playlist Management

**Input**: Design documents from `/specs/036-enhance- [X] T039: Implement PlaylistForm with react-hook-form validationui-playlist/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Found: Digital Signage web app (Next.js 15 + C# .NET 8 API)
   → Tech stack: TypeScript 5.x, React 18, Tailwind CSS 4, EF Core 9, PostgreSQL
2. Load optional design documents:
   → data-model.md: Extract entities → Playlist, PlaylistMedia, DevicePlaylist, PlaylistAnalytics
   → contracts/: 10 API endpoints → enhanced playlist CRUD + bulk operations + analytics  
   → research.md: Extract decisions → @dnd-kit, React Query, SignalR integration
3. Generate tasks by category:
   → Setup: Dependencies, TypeScript types, API endpoints
   → Core: Enhanced entities, DTOs, services, UI components
   → Integration: SignalR events, API integration, drag-drop
   → Polish: Performance optimizations, responsive design
4. Apply task rules:
   → Frontend/Backend separation = parallel where possible [P]
   → Sequential for shared files (same controller, same service)
   → User requested: SKIP TESTING PHASE per requirements
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness: All contracts implemented, all entities created
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions
- **NOTE**: Testing phase skipped per user requirement "ไม่ต้อง ทำเทส (skip phase test)"

## Path Conventions
- **Backend**: `src/DigitalSignage.*/**` (C# .NET 8 API)
- **Frontend**: `src/digital-signage-web/src/**` (Next.js 15)
- **Migrations**: Entity Framework Core migrations via CLI
- Follow existing Digital Signage clean architecture patterns

## Phase 3.1: Setup & Dependencies
- [X] T001 [P] Install frontend dependencies (@dnd-kit/core, @dnd-kit/sortable, react-intersection-observer) in src/digital-signage-web/package.json
- [X] T002 [P] Create TypeScript interfaces for playlist types in src/digital-signage-web/src/types/playlist.ts
- [X] T003 [P] Create playlist feature folder structure in src/digital-signage-web/src/features/playlists/
- [X] T004 [P] Add PlaylistStatus enum to src/DigitalSignage.Domain/Enums/PlaylistStatus.cs

## Phase 3.2: Backend Domain & Data Layer
- [X] T005 [P] Enhance Playlist entity with UI properties in src/DigitalSignage.Domain/Entities/Playlist.cs
- [X] T006 [P] Create DevicePlaylist entity in src/DigitalSignage.Domain/Entities/DevicePlaylist.cs  
- [X] T007 [P] Create PlaylistAnalytics entity in src/DigitalSignage.Domain/Entities/PlaylistAnalytics.cs
- [X] T008 [P] Enhanced existing PlaylistConfiguration (PlaylistMedia is already PlaylistItem)
- [X] T009 [P] Create DevicePlaylist entity configuration in src/DigitalSignage.Infrastructure/Data/Configurations/DevicePlaylistConfiguration.cs
- [X] T010 [P] Create PlaylistAnalytics entity configuration in src/DigitalSignage.Infrastructure/Data/Configurations/PlaylistAnalyticsConfiguration.cs
- [X] T011 Update AppDbContext with new DbSets in src/DigitalSignage.Infrastructure/Data/AppDbContext.cs
- [X] T012 Create EF migration for enhanced playlist schema using dotnet ef migrations add EnhancePlaylistManagement

## Phase 3.3: Backend DTOs & Services
- [X] T013 [P] Enhanced existing PlaylistDto with new UI properties
- [X] T014 [P] PlaylistMediaDto functionality exists as PlaylistItemDto (enhanced)
- [X] T015 [P] Enhanced existing CreatePlaylistRequest DTO with IsTemplate property
- [X] T016 [P] Create UpdatePlaylistOrderRequest DTO in src/DigitalSignage.Application/DTOs/UpdatePlaylistOrderRequest.cs
- [X] T017 [P] Create BulkPlaylistActionRequest DTO in src/DigitalSignage.Application/DTOs/BulkPlaylistActionRequest.cs
- [X] T018 [P] Enhanced existing IPlaylistService interface with new methods
- [X] T019 Enhanced existing PlaylistService implementation with new methods
- [X] T020 [P] Create IPlaylistRepository interfaces in src/DigitalSignage.Domain/Interfaces/IPlaylistRepositories.cs
- [X] T021 Create PlaylistRepository implementations in src/DigitalSignage.Infrastructure/Repositories/PlaylistRepositories.cs

## Phase 3.4: Backend API Controllers
- [X] T022 Enhanced existing PlaylistController GET endpoints (already comprehensive)
- [X] T023 POST/PUT endpoints already exist in PlaylistController
- [X] T024 Add PlaylistController reorder endpoint (PATCH /api/playlist/{id}/reorder) in src/DigitalSignage.Api/Controllers/PlaylistController.cs
- [X] T025 Duplicate endpoint already exists (POST /api/playlist/{id}/duplicate) 
- [X] T026 Add PlaylistController bulk-action endpoint (POST /api/playlist/bulk-action) in src/DigitalSignage.Api/Controllers/PlaylistController.cs
- [X] T027 Add PlaylistController device assignment endpoints in src/DigitalSignage.Api/Controllers/PlaylistController.cs
- [X] T028 Add PlaylistController analytics endpoint (GET /api/playlist/{id}/analytics) in src/DigitalSignage.Api/Controllers/PlaylistController.cs

## Phase 3.5: Frontend API Services
- [X] T029 [P] Enhanced playlist API service in src/digital-signage-web/src/features/playlists/services/playlistService.ts
- [X] T030 [P] Create playlist hooks with React Query in src/digital-signage-web/src/features/playlists/hooks/usePlaylistQueries.ts
- [X] T031 [P] Create playlist mutations hooks in src/digital-signage-web/src/features/playlists/hooks/usePlaylistMutations.ts
- [X] T032 [P] Enhanced hooks index exports in src/digital-signage-web/src/features/playlists/hooks/index.ts

## Phase 3.6: Frontend Core Components  
- [X] T033 [P] Create PlaylistCard component in src/digital-signage-web/src/features/playlists/components/PlaylistCard.tsx
- [X] T034 [P] Create PlaylistGrid component in src/digital-signage-web/src/features/playlists/components/PlaylistGrid.tsx
- [X] T035 [P] Create PlaylistFilters component in src/digital-signage-web/src/features/playlists/components/PlaylistFilters.tsx
- [X] T036 [P] Create PlaylistSearch component in src/digital-signage-web/src/features/playlists/components/PlaylistSearch.tsx
- [X] T037 [P] Create BulkActionsToolbar component in src/digital-signage-web/src/features/playlists/components/BulkActionsToolbar.tsx

## Phase 3.7: Frontend Playlist Editor
- [X] T038: Create PlaylistEditor component with tabbed interface
- [ ] T039 [P] Create MediaPicker component with thumbnails in src/digital-signage-web/src/features/playlists/components/MediaPicker.tsx
- [X] T040: Build MediaPicker with search, filters, and selection
- [X] T041: Create DragDropMediaList with @dnd-kit integration
- [X] T042: Develop PlaylistSettings with advanced configuration options

## Phase 3.8: Frontend Pages & Routing
- [X] T043 Create playlists list page in src/digital-signage-web/src/app/(dashboard)/playlists/page.tsx
- [X] T044 Create playlist detail/edit page in src/digital-signage-web/src/app/(dashboard)/playlists/[id]/page.tsx
- [X] T045 Create new playlist page in src/digital-signage-web/src/app/(dashboard)/playlists/create/page.tsx (updated path)
- [X] T046 [P] Create playlist analytics page in src/digital-signage-web/src/app/(dashboard)/playlists/[id]/analytics/page.tsx

## Phase 3.9: Real-time Integration & SignalR
- [X] T047 [P] Extend SignalR PlaylistHub with playlist events in src/DigitalSignage.Api/Hubs/PlaylistHub.cs
- [X] T048 [P] Create frontend SignalR playlist client in src/digital-signage-web/src/lib/signalr/playlistHub.ts
- [X] T049 [P] Add real-time playlist updates hook in src/digital-signage-web/src/features/playlists/hooks/useRealtimePlaylist.ts

## Phase 3.10: Device Assignment Features
- [X] T050 [P] Create DeviceSelector component in src/digital-signage-web/src/features/playlists/components/DeviceSelector.tsx
- [X] T051 [P] Create DeviceAssignmentModal component in src/digital-signage-web/src/features/playlists/components/DeviceAssignmentModal.tsx
- [X] T052 [P] Create device assignment API service methods in src/digital-signage-web/src/services/deviceAssignmentService.ts

## Phase 3.11: Analytics & Reporting
- [X] T053 [P] Create PlaylistAnalytics component with charts in src/digital-signage-web/src/features/playlists/components/PlaylistAnalytics.tsx  
- [X] T054 [P] Create analytics API service in src/digital-signage-web/src/services/analyticsService.ts
- [X] T055 [P] Create analytics hooks in src/digital-signage-web/src/features/playlists/hooks/usePlaylistAnalytics.ts

## Phase 3.12: Service Registration & Configuration
- [ ] T056 Register playlist services in DI container in src/DigitalSignage.Api/Extensions/ApplicationServiceExtensions.cs
- [ ] T057 [P] Configure AutoMapper profiles for playlist DTOs in src/DigitalSignage.Application/Mappings/PlaylistMappingProfile.cs
- [ ] T058 Apply database migration using dotnet ef database update

## Phase 3.13: Polish & Performance
- [ ] T059 [P] Add virtual scrolling for large playlist lists in src/digital-signage-web/src/features/playlists/components/VirtualPlaylistGrid.tsx
- [ ] T060 [P] Implement lazy loading for media thumbnails in src/digital-signage-web/src/features/playlists/components/LazyMediaThumbnail.tsx
- [ ] T061 [P] Add optimistic updates for drag-drop operations in src/digital-signage-web/src/features/playlists/hooks/useOptimisticReorder.ts
- [ ] T062 [P] Add responsive breakpoints for mobile/tablet in src/digital-signage-web/src/features/playlists/components/ResponsivePlaylistLayout.tsx
- [ ] T063 [P] Add keyboard shortcuts for playlist operations in src/digital-signage-web/src/features/playlists/hooks/usePlaylistKeyboard.ts

## Dependencies
### Critical Path Dependencies:
- T004 (enum) → T005-T007 (entities)
- T005-T007 (entities) → T008-T010 (configurations)  
- T011 (DbContext) → T012 (migration)
- T012 (migration) → T058 (apply migration)
- T018 (interface) → T019 (service implementation)
- T020 (repository interface) → T021 (repository implementation)
- T019, T021 (services) → T022-T028 (controllers)
- T029 (API service) → T030-T032 (hooks)
- T002 (types) → T033-T037 (components)
- T040 (drag-drop) requires T001 (@dnd-kit dependencies)

### Parallel Execution Groups:
**Group A - Backend Entities [P]**: T005, T006, T007
**Group B - EF Configurations [P]**: T008, T009, T010  
**Group C - DTOs [P]**: T013, T014, T015, T016, T017
**Group D - Frontend Services [P]**: T029, T030, T031, T032
**Group E - UI Components [P]**: T033, T034, T035, T036, T037
**Group F - Analytics [P]**: T053, T054, T055

## Parallel Example
```bash
# Launch Group A together (Backend Entities):
# Task T005: "Enhance Playlist entity with UI properties in src/DigitalSignage.Domain/Entities/Playlist.cs"
# Task T006: "Create DevicePlaylist entity in src/DigitalSignage.Domain/Entities/DevicePlaylist.cs"  
# Task T007: "Create PlaylistAnalytics entity in src/DigitalSignage.Domain/Entities/PlaylistAnalytics.cs"

# Launch Group E together (UI Components):
# Task T033: "Create PlaylistCard component in src/digital-signage-web/src/features/playlists/components/PlaylistCard.tsx"
# Task T034: "Create PlaylistGrid component in src/digital-signage-web/src/features/playlists/components/PlaylistGrid.tsx"
# Task T035: "Create PlaylistFilters component in src/digital-signage-web/src/features/playlists/components/PlaylistFilters.tsx"
```

## Notes
- **Testing Skipped**: Per user requirement "ไม่ต้อง ทำเทส (skip phase test)" - no test tasks included
- **API Guidelines**: Follow copilot-instructions-api.instructions.md for all backend changes
- **UI Guidelines**: Follow copilot-instructions-ui.instructions.md for all frontend development
- **DateTime Patterns**: Use PostgreSQL "timestamp without time zone" with DateTime.SpecifyKind pattern
- **[P] tasks**: Different files, no dependencies - can run simultaneously
- **Sequential tasks**: Same file modifications must be done in order
- **Commit Strategy**: Commit after completing each task or logical group
- **Migration**: T012 creates migration, T058 applies it to database

## Task Generation Rules Applied

1. **From Contracts**: 10 API endpoints → T022-T028 controller tasks
2. **From Data Model**: 4 entities → T005-T007 (entities) + T008-T010 (configurations)  
3. **From User Stories**: Playlist CRUD, drag-drop, bulk operations, device assignment → T033-T063 UI tasks
4. **Ordering**: Setup → Backend → Frontend → Integration → Polish
5. **Dependencies**: Entities before services, services before controllers, API before UI

## Validation Checklist
- [✓] All contracts have corresponding controller implementations (T022-T028)
- [✓] All entities have model tasks (T005-T007) and configurations (T008-T010)  
- [✓] Testing phase skipped per user requirement
- [✓] Parallel tasks are truly independent (different files)
- [✓] Each task specifies exact file path
- [✓] No task modifies same file as another [P] task
- [✓] Backend follows copilot-instructions-api.instructions.md
- [✓] Frontend follows copilot-instructions-ui.instructions.md