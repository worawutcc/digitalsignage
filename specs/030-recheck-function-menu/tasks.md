# Tasks: Complete API Integration Audit and Fix for All Menu Functions

**Input**: Design documents from `/specs/030-recheck-function-menu/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Execution Flow (main)
```
1. Load plan.md from feature directory ✅
   → Tech stack: Next.js 15 + React 18 (frontend), .NET 8 Web API (backend)
   → Libraries: React Query, Redux Toolkit, Tailwind CSS 4, EF Core 9, PostgreSQL
   → Structure: Web app (frontend + backend)
2. Load optional design documents ✅
   → data-model.md: 15+ entities (Playlist, Schedule, Device, Media, User, etc.)
   → contracts/: playlist-api.md with 13 endpoints
   → research.md: Audit strategy, integration patterns, 4 key decisions
   → quickstart.md: Manual validation checklist
3. Generate tasks by category:
   → Audit: UI inventory, frontend code review, backend API check, gap analysis
   → Backend Fixes: Missing/broken endpoints, service methods, DTOs
   → Frontend Fixes: Service layer apiClient usage, React Query hooks, UI wiring
   → Validation: Manual testing per quickstart.md
4. Apply task rules:
   → Different files/endpoints = mark [P] for parallel
   → Same file = sequential (no [P])
   → Audit before fixes (identify work first)
   → No test generation per user specification ("skip test phase")
5. Number tasks sequentially (T001, T002...)
6. Phase-based approach: Complete Phase 1 (Playlists) before moving to Phase 2
7. Manual validation replaces automated tests
8. Validate task completeness:
   → All UI actions audited?
   → All broken integrations identified?
   → All fixes have validation steps?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions
- Focus on functional integration, not test coverage

## Path Conventions (Web App Structure)
```
Backend:
- Controllers: src/DigitalSignage.Api/Controllers/
- Services: src/DigitalSignage.Application/Services/
- DTOs: src/DigitalSignage.Application/DTOs/
- Domain: src/DigitalSignage.Domain/Entities/

Frontend:
- Pages: src/digital-signage-web/src/app/{menu}/
- Services: src/digital-signage-web/src/services/
- Hooks: src/digital-signage-web/src/features/{menu}/hooks/
- Components: src/digital-signage-web/src/features/{menu}/components/
- Types: src/digital-signage-web/src/types/
```

---

# 🎯 PHASE 1: PLAYLISTS MENU (Priority: HIGH)

## Phase 1.1: Audit & Discovery

### T001 - Audit Playlists UI Components
**Description**: Inventory all user-facing actions and data displays in playlists page
**Files to Review**:
- `src/digital-signage-web/src/app/playlists/page.tsx`
- `src/digital-signage-web/src/features/playlists/components/*.tsx`

**Checklist**:
- [ ] List all buttons (Create, Edit, Delete, Duplicate, Activate/Deactivate)
- [ ] List all forms (Create playlist, Edit playlist)
- [ ] List all filters (Search, Active Only, Template filter)
- [ ] List all data displays (Playlist cards, Assignment summary, Statistics)
- [ ] Document expected API calls for each action
- [ ] Identify mock data or placeholder components

**Output**: Document in `specs/030-recheck-function-menu/audit-phase1-ui.md`

---

### T002 - Audit Playlists Frontend Services
**Description**: Verify playlistService.ts uses apiClient correctly
**Files to Review**:
- `src/digital-signage-web/src/services/playlistService.ts`
- `src/digital-signage-web/src/lib/api.ts`

**Checklist**:
- [ ] Check import statement: Must use `import { apiClient } from '@/lib/api'`
- [ ] Verify NO direct axios imports: `import axios from 'axios'` is forbidden
- [ ] List all service methods (getAll, getById, create, update, delete, etc.)
- [ ] Identify methods with stub/mock data
- [ ] Document missing service methods needed by UI

**Output**: Document in `specs/030-recheck-function-menu/audit-phase1-frontend-services.md`

---

### T003 - Audit Playlists React Query Hooks
**Description**: Check hooks for mock data and API integration
**Files to Review**:
- `src/digital-signage-web/src/features/playlists/hooks/usePlaylists.ts`
- `src/digital-signage-web/src/features/playlists/hooks/usePlaylistAssignmentSummary.ts`
- Other playlist-related hooks in the same directory

**Checklist**:
- [ ] Check each hook's queryFn - does it call the service?
- [ ] Identify hooks returning hardcoded/mock data
- [ ] Verify React Query config (queryKey, refetchInterval)
- [ ] Check mutation hooks for create/update/delete
- [ ] Document missing hooks needed by UI

**Output**: Document in `specs/030-recheck-function-menu/audit-phase1-hooks.md`

---

### T004 - Audit Playlists Backend API
**Description**: List existing API endpoints in PlaylistController
**Files to Review**:
- `src/DigitalSignage.Api/Controllers/PlaylistController.cs`
- `src/DigitalSignage.Application/Services/PlaylistService.cs`
- `src/DigitalSignage.Application/Interfaces/IPlaylistService.cs`

**Checklist**:
- [ ] List all existing controller endpoints (GET, POST, PUT, DELETE, etc.)
- [ ] Verify ProducesResponseType attributes on each endpoint
- [ ] Check service methods exist for each endpoint
- [ ] Compare against contracts/playlist-api.md specification
- [ ] Identify missing endpoints from spec

**Output**: Document in `specs/030-recheck-function-menu/audit-phase1-backend.md`

---

### T005 - Gap Analysis: Playlists Integration
**Description**: Compare UI needs vs available APIs, document all gaps
**Dependencies**: T001, T002, T003, T004

**Checklist**:
- [ ] Match each UI action to backend endpoint
- [ ] Identify UI features with no API call
- [ ] Identify APIs that exist but aren't wired in frontend
- [ ] Document type mismatches (frontend types vs backend DTOs)
- [ ] Prioritize fixes (critical → nice-to-have)

**Output**: Document in `specs/030-recheck-function-menu/gap-analysis-phase1.md`

---

## Phase 1.2: Backend Fixes (if needed)

### T006 [P] - Verify/Create GET /api/playlist endpoint
**Description**: Ensure list all playlists endpoint exists with pagination and filtering
**File**: `src/DigitalSignage.Api/Controllers/PlaylistController.cs`

**Requirements**:
- Query parameters: search, isActive, isTemplate, skip, take
- Returns paginated PlaylistDto list
- ProducesResponseType(200), (401), (500)
- Calls PlaylistService.GetAllAsync

**Validation**: Call endpoint in Swagger, verify response matches contract

---

### T007 [P] - Verify/Create POST /api/playlist endpoint
**Description**: Ensure create playlist endpoint exists
**File**: `src/DigitalSignage.Api/Controllers/PlaylistController.cs`

**Requirements**:
- Accepts CreatePlaylistRequest body
- Returns 201 Created with PlaylistDto
- ProducesResponseType(201), (400), (401), (500)
- Calls PlaylistService.CreateAsync

**Validation**: Create test playlist via Swagger

---

### T008 [P] - Verify/Create PUT /api/playlist/{id} endpoint
**Description**: Ensure update playlist endpoint exists
**File**: `src/DigitalSignage.Api/Controllers/PlaylistController.cs`

**Requirements**:
- Path parameter: id
- Accepts UpdatePlaylistRequest body
- Returns 200 OK with updated PlaylistDto
- ProducesResponseType(200), (400), (404), (401), (500)

**Validation**: Update test playlist via Swagger

---

### T009 [P] - Verify/Create DELETE /api/playlist/{id} endpoint
**Description**: Ensure delete playlist endpoint exists
**File**: `src/DigitalSignage.Api/Controllers/PlaylistController.cs`

**Requirements**:
- Path parameter: id
- Returns 204 No Content on success
- Returns 409 Conflict if has active assignments
- ProducesResponseType(204), (404), (409), (401), (500)

**Validation**: Delete test playlist via Swagger

---

### T010 [P] - Create POST /api/playlist/{id}/duplicate endpoint
**Description**: Create playlist duplication endpoint
**File**: `src/DigitalSignage.Api/Controllers/PlaylistController.cs`

**Requirements**:
- Path parameter: id
- Optional body: { newName: string }
- Returns 201 Created with new PlaylistDto
- Copies playlist items to new playlist
- Service method: PlaylistService.DuplicateAsync

**Validation**: Duplicate playlist via Swagger, verify items copied

---

### T011 [P] - Create PATCH /api/playlist/{id}/activate endpoint
**Description**: Create playlist activation endpoint
**File**: `src/DigitalSignage.Api/Controllers/PlaylistController.cs`

**Requirements**:
- Path parameter: id
- Sets IsActive = true
- Returns 200 OK with updated PlaylistDto
- Service method: PlaylistService.SetActiveAsync(id, true)

**Validation**: Activate playlist via Swagger

---

### T012 [P] - Create PATCH /api/playlist/{id}/deactivate endpoint
**Description**: Create playlist deactivation endpoint
**File**: `src/DigitalSignage.Api/Controllers/PlaylistController.cs`

**Requirements**:
- Path parameter: id
- Sets IsActive = false
- Returns 200 OK with updated PlaylistDto
- Service method: PlaylistService.SetActiveAsync(id, false)

**Validation**: Deactivate playlist via Swagger

---

### T013 - Verify GET /api/playlist/{id}/assignment-summary endpoint
**Description**: Confirm assignment summary endpoint works (recently implemented)
**File**: `src/DigitalSignage.Api/Controllers/PlaylistController.cs`

**Checklist**:
- [ ] Endpoint exists and returns PlaylistAssignmentSummaryDto
- [ ] Includes device and device group counts
- [ ] Includes assignment details with device/group names
- [ ] Test via Swagger

**Note**: This was recently completed, just verify it works

---

### T014 [P] - Create GET /api/playlist/{id}/items endpoint
**Description**: Create endpoint to get playlist items
**File**: `src/DigitalSignage.Api/Controllers/PlaylistController.cs`

**Requirements**:
- Path parameter: id
- Returns list of PlaylistItemDto with media details
- Include media thumbnails via presigned URLs
- Service method: PlaylistService.GetItemsAsync

**Validation**: Get playlist items via Swagger

---

### T015 [P] - Create POST /api/playlist/{id}/items endpoint
**Description**: Create endpoint to add item to playlist
**File**: `src/DigitalSignage.Api/Controllers/PlaylistController.cs`

**Requirements**:
- Path parameter: id
- Body: { mediaId, order, duration }
- Returns 201 Created with PlaylistItemDto
- Service method: PlaylistService.AddItemAsync

**Validation**: Add media to playlist via Swagger

---

### T016 [P] - Create DELETE /api/playlist/{playlistId}/items/{itemId} endpoint
**Description**: Create endpoint to remove item from playlist
**File**: `src/DigitalSignage.Api/Controllers/PlaylistController.cs`

**Requirements**:
- Path parameters: playlistId, itemId
- Returns 204 No Content
- Service method: PlaylistService.RemoveItemAsync

**Validation**: Remove item via Swagger

---

### T017 [P] - Create PATCH /api/playlist/{id}/items/reorder endpoint
**Description**: Create endpoint to reorder playlist items
**File**: `src/DigitalSignage.Api/Controllers/PlaylistController.cs`

**Requirements**:
- Path parameter: id
- Body: { itemOrders: [{ itemId, order }] }
- Updates order for multiple items
- Service method: PlaylistService.ReorderItemsAsync

**Validation**: Reorder items via Swagger

---

### T018 [P] - Create GET /api/playlist/statistics endpoint
**Description**: Create endpoint for playlist statistics
**File**: `src/DigitalSignage.Api/Controllers/PlaylistController.cs`

**Requirements**:
- Returns aggregated stats (total, active, templates, avg items)
- Service method: PlaylistService.GetStatisticsAsync
- Uses EF Core grouping queries

**Validation**: Get statistics via Swagger

---

### T019 - Implement PlaylistService Methods
**Description**: Add missing service methods identified in T006-T018
**File**: `src/DigitalSignage.Application/Services/PlaylistService.cs`
**Dependencies**: T006-T018 (know which methods are needed)

**Methods to Implement**:
- DuplicateAsync(id, newName)
- SetActiveAsync(id, isActive)
- GetItemsAsync(id)
- AddItemAsync(playlistId, request)
- RemoveItemAsync(playlistId, itemId)
- ReorderItemsAsync(playlistId, itemOrders)
- GetStatisticsAsync()

**Requirements**:
- Follow copilot-instructions-api.instructions.md patterns
- Use private readonly dependencies
- Return DTOs, not domain entities
- Async/await for all I/O
- Log operations with _logger

**Validation**: Backend compiles without errors

---

### T020 [P] - Create/Update Playlist DTOs
**Description**: Ensure all necessary DTOs exist and match contracts
**File**: `src/DigitalSignage.Application/DTOs/PlaylistDto.cs`

**DTOs Needed**:
- PlaylistDto (main entity)
- CreatePlaylistRequest
- UpdatePlaylistRequest
- PlaylistItemDto
- AddPlaylistItemRequest
- ReorderItemsRequest
- PlaylistStatisticsDto

**Validation**: TypeScript types should match these DTOs

---

## Phase 1.3: Frontend Fixes

### T021 - Fix playlistService.ts - Ensure apiClient Usage
**Description**: Update service to use configured apiClient
**File**: `src/digital-signage-web/src/services/playlistService.ts`
**Dependencies**: T006-T018 (backend endpoints ready)

**Requirements**:
- Import: `import { apiClient } from '@/lib/api'`
- Remove any direct axios imports
- Implement all methods matching backend endpoints:
  - getAll(params?) - with search, isActive, skip, take
  - getById(id)
  - create(data)
  - update(id, data)
  - delete(id)
  - duplicate(id, newName)
  - activate(id)
  - deactivate(id)
  - getAssignmentSummary(id)
  - getItems(id)
  - addItem(id, data)
  - removeItem(playlistId, itemId)
  - reorderItems(id, itemOrders)
  - getStatistics()

**Validation**: No TypeScript errors, service exports all methods

---

### T022 - Update Playlist TypeScript Types
**Description**: Ensure frontend types match backend DTOs
**File**: `src/digital-signage-web/src/types/playlist.ts`
**Dependencies**: T020 (DTOs finalized)

**Types to Verify/Create**:
- Playlist interface (matches PlaylistDto)
- CreatePlaylistRequest
- UpdatePlaylistRequest
- PlaylistItem interface
- AddPlaylistItemRequest
- ReorderItemsRequest
- PlaylistStatistics interface

**Validation**: Types compile, no any types

---

### T023 [P] - Create/Fix usePlaylists Hook
**Description**: React Query hook for fetching playlists list
**File**: `src/digital-signage-web/src/features/playlists/hooks/usePlaylists.ts`
**Dependencies**: T021 (service ready)

**Requirements**:
- Use useQuery with queryKey: ['playlists', params]
- Call PlaylistService.getAll(params)
- Support search and filter parameters
- Refetch interval: 30 seconds
- No mock data

**Validation**: Hook returns data from API, not hardcoded values

---

### T024 [P] - Create usePlaylistMutations Hook
**Description**: React Query mutations for create/update/delete
**File**: `src/digital-signage-web/src/features/playlists/hooks/usePlaylistMutations.ts`
**Dependencies**: T021 (service ready)

**Requirements**:
- useMutation for create, update, delete
- Invalidate ['playlists'] query on success
- Optimistic updates where appropriate
- Error handling with toast notifications

**Validation**: Mutations trigger API calls and update UI

---

### T025 [P] - Create usePlaylistItems Hook
**Description**: React Query hook for playlist items
**File**: `src/digital-signage-web/src/features/playlists/hooks/usePlaylistItems.ts`
**Dependencies**: T021 (service ready)

**Requirements**:
- useQuery for getItems
- useMutation for addItem, removeItem, reorderItems
- Invalidate ['playlist-items', id] on mutations

**Validation**: Items load and update via API

---

### T026 [P] - Create usePlaylistStatistics Hook
**Description**: React Query hook for statistics
**File**: `src/digital-signage-web/src/features/playlists/hooks/usePlaylistStatistics.ts`
**Dependencies**: T021 (service ready)

**Requirements**:
- useQuery with queryKey: ['playlist-statistics']
- Call PlaylistService.getStatistics()
- Refetch interval: 60 seconds

**Validation**: Statistics display real data

---

### T027 - Wire Playlist Create Form
**Description**: Connect create playlist form to API
**File**: `src/digital-signage-web/src/features/playlists/components/CreatePlaylistForm.tsx`
**Dependencies**: T024 (mutation hook ready)

**Requirements**:
- Use React Hook Form + Zod validation
- Use createMutation from usePlaylistMutations
- Handle loading state during submission
- Show success/error toasts
- Close modal on success
- Reset form after creation

**Validation**: Form submits to API, new playlist appears in list

---

### T028 - Wire Playlist Edit Form
**Description**: Connect edit playlist form to API
**File**: `src/digital-signage-web/src/features/playlists/components/EditPlaylistForm.tsx`
**Dependencies**: T023, T024 (query and mutation hooks ready)

**Requirements**:
- Load existing playlist data via useQuery
- Pre-fill form with current values
- Use updateMutation from usePlaylistMutations
- Handle loading states (fetch + submit)
- Show success/error toasts

**Validation**: Form loads data, saves changes to API

---

### T029 - Wire Playlist Delete Action
**Description**: Connect delete button to API with confirmation
**File**: `src/digital-signage-web/src/features/playlists/components/PlaylistCard.tsx` or similar
**Dependencies**: T024 (mutation hook ready)

**Requirements**:
- Show confirmation dialog before delete
- Use deleteMutation from usePlaylistMutations
- Handle 409 Conflict (has assignments) gracefully
- Show success/error toasts
- Remove from list on success

**Validation**: Delete button calls API after confirmation

---

### T030 - Wire Playlist Duplicate Action
**Description**: Connect duplicate button to API
**File**: `src/digital-signage-web/src/features/playlists/components/PlaylistCard.tsx` or similar
**Dependencies**: T021 (service ready)

**Requirements**:
- Optional: Prompt for new name
- Call PlaylistService.duplicate(id, newName)
- Add new playlist to cache
- Show success toast

**Validation**: Duplicate creates new playlist via API

---

### T031 - Wire Activate/Deactivate Toggle
**Description**: Connect toggle switch to API
**File**: `src/digital-signage-web/src/features/playlists/components/PlaylistCard.tsx` or similar
**Dependencies**: T021 (service ready)

**Requirements**:
- Call activate or deactivate based on current state
- Optimistic update (toggle immediately)
- Revert on API error
- Show error toast on failure

**Validation**: Toggle calls API and persists after refresh

---

### T032 - Wire Search and Filter Controls
**Description**: Connect search input and filters to API query
**File**: `src/digital-signage-web/src/app/playlists/page.tsx`
**Dependencies**: T023 (query hook with params ready)

**Requirements**:
- Debounce search input (300ms)
- Update query parameters on filter change
- Pass params to usePlaylists hook
- Show loading state during refetch

**Validation**: Search and filters fetch new data from API

---

### T033 - Verify Assignment Summary Integration
**Description**: Confirm assignment summary component works
**File**: `src/digital-signage-web/src/features/playlists/components/PlaylistAssignmentSummary.tsx`

**Checklist**:
- [ ] Component uses usePlaylistAssignmentSummary hook
- [ ] Hook calls PlaylistService.getAssignmentSummary
- [ ] Service uses apiClient (not direct axios)
- [ ] Data displays correctly (counts, assignment list)
- [ ] Test with real playlist that has assignments

**Note**: This was recently completed, verify it works end-to-end

---

### T034 - Add Playlist Statistics Widget
**Description**: Create statistics card on playlists page
**File**: `src/digital-signage-web/src/features/playlists/components/PlaylistStatistics.tsx`
**Dependencies**: T026 (statistics hook ready)

**Requirements**:
- Use usePlaylistStatistics hook
- Display: total, active, templates, avg items
- Card layout with icons
- Loading skeleton

**Validation**: Statistics display real data from API

---

## Phase 1.4: Validation & Testing

### T035 - Manual Testing: Playlists CRUD
**Description**: Execute validation steps from quickstart.md for playlists
**Dependencies**: T027-T034 (all integrations wired)

**Test Scenarios** (from quickstart.md):
- [ ] Test 1.1: View All Playlists - verify API call, data loads
- [ ] Test 1.2: Create Playlist - form submits, POST request, success
- [ ] Test 1.3: Edit Playlist - form loads data, PUT request, updates
- [ ] Test 1.4: Delete Playlist - confirmation, DELETE request, removal
- [ ] Test 1.5: Duplicate Playlist - POST duplicate endpoint, copy appears
- [ ] Test 1.6: Activate/Deactivate - PATCH request, state persists
- [ ] Test 1.7: Search/Filter - query params sent, results update
- [ ] Test 1.8: Assignment Summary - GET request, statistics display

**Tools**: Browser DevTools Network tab, Visual verification

**Output**: Document results in `specs/030-recheck-function-menu/validation-phase1-results.md`

---

### T036 - Error Handling Verification
**Description**: Test error scenarios for all playlist operations
**Dependencies**: T035 (basic testing complete)

**Test Scenarios**:
- [ ] Test 401 Unauthorized: Remove JWT token, verify redirect to login
- [ ] Test 404 Not Found: Access non-existent playlist ID
- [ ] Test 400 Bad Request: Submit invalid form data
- [ ] Test 409 Conflict: Delete playlist with active assignments
- [ ] Test Network Error: Disable API, verify error messages

**Validation**: All errors handled gracefully with user-friendly messages

---

### T037 - React Query Cache Validation
**Description**: Verify cache invalidation and optimistic updates
**Dependencies**: T035 (basic testing complete)

**Test Scenarios**:
- [ ] Create playlist: List updates without manual refresh
- [ ] Edit playlist: Changes appear immediately (optimistic)
- [ ] Delete playlist: Removed from list instantly
- [ ] Toggle active: Reverts on API error

**Tools**: React Query DevTools

**Validation**: Cache behavior matches expectations

---

### T038 - Type Safety Audit
**Description**: Verify no TypeScript errors across playlist features
**Dependencies**: T022 (types updated)

**Checklist**:
- [ ] Run `npm run type-check` in frontend directory
- [ ] No `any` types in playlist code
- [ ] All service methods fully typed
- [ ] All component props typed
- [ ] All hook return values typed

**Validation**: Zero TypeScript errors related to playlists

---

### T039 - Phase 1 Completion Checklist
**Description**: Final verification before moving to Phase 2
**Dependencies**: T001-T038

**Checklist** (from spec.md):
- [ ] All playlists load from API ✅
- [ ] Create playlist works ✅
- [ ] Edit playlist loads and saves ✅
- [ ] Delete playlist with confirmation ✅
- [ ] Duplicate creates copy ✅
- [ ] Activate/deactivate toggle works ✅
- [ ] Search/filter sends query params ✅
- [ ] Assignment summary displays ✅
- [ ] Statistics card shows real data ✅
- [ ] No console errors ✅
- [ ] No 404/500 errors in normal operation ✅
- [ ] Data persists after refresh ✅

**Output**: Sign-off document for Phase 1 completion

---

### T040 - Git Commit: Phase 1 Complete
**Description**: Commit all Phase 1 changes
**Dependencies**: T039 (checklist passed)

**Commit Message**:
```
feat(playlists): Complete Phase 1 API integration audit and fixes

- Audited all playlist UI components and identified gaps
- Fixed backend endpoints: duplicate, activate/deactivate, items, statistics
- Updated frontend service to use apiClient consistently
- Wired all React Query hooks for CRUD operations
- Connected all UI actions to backend APIs
- Validated all functionality per quickstart.md checklist

All 8 acceptance scenarios from spec.md now passing.
Playlists menu fully functional with complete API integration.

Ref: specs/030-recheck-function-menu/spec.md Phase 1
```

---

# 📊 PHASE SUMMARY: Phase 1 (Playlists)

## Task Count: 40 tasks total
- **Audit & Discovery**: 5 tasks (T001-T005)
- **Backend Fixes**: 15 tasks (T006-T020)
  - 13 can run in parallel [P]
  - 2 sequential (service implementation, DTOs)
- **Frontend Fixes**: 14 tasks (T021-T034)
  - 5 can run in parallel [P] (hooks)
  - 9 sequential (service, types, UI wiring)
- **Validation**: 6 tasks (T035-T040)

## Estimated Duration
- **Audit**: 4-6 hours (thorough code review)
- **Backend**: 8-12 hours (endpoint creation + testing)
- **Frontend**: 10-15 hours (service layer + UI wiring)
- **Validation**: 3-5 hours (manual testing)
- **Total**: 25-38 hours for Phase 1

## Dependencies Flow
```
Audit (T001-T004) → Gap Analysis (T005) → Backend/Frontend Fixes (T006-T034) → Validation (T035-T039) → Commit (T040)
```

## Parallel Execution Opportunities
**Backend Endpoints** (T006-T018): Can create 13 endpoints in parallel
**Frontend Hooks** (T023-T026): Can create 4 hooks in parallel
**Service + Types** (T021, T022): Can work simultaneously if coordination exists

---

# 🚀 NEXT PHASES (Not Yet Detailed)

## Phase 2: Schedules Menu (Priority: HIGH)
- Similar task structure to Phase 1
- ~35-45 tasks estimated
- Complex multi-tab form handling
- Calendar integration
- Conflict detection validation

## Phase 3: Devices Menu (Priority: MEDIUM)
- Real-time status updates
- WebSocket/polling integration
- Device registration approval flow
- ~30-40 tasks estimated

## Phase 4: Media Menu (Priority: MEDIUM)
- S3 presigned URL flow
- Upload progress tracking
- Media assignment to schedules/playlists
- ~25-35 tasks estimated

## Phase 5: Users Menu (Priority: MEDIUM)
- User CRUD operations
- Device/schedule assignments
- Permission management
- ~20-30 tasks estimated

## Phase 6: QR Codes Menu (Priority: LOW)
- QR code generation
- Device provisioning flow
- ~15-20 tasks estimated

## Phase 7: Dashboard (Priority: LOW)
- Statistics aggregation
- Real-time device grid
- Analytics charts
- ~20-25 tasks estimated

**Total Estimated Tasks Across All Phases**: 140-175 tasks

---

# 🔧 EXECUTION GUIDELINES

## For Each Task
1. **Read the task description carefully**
2. **Check dependencies** - ensure prerequisite tasks complete
3. **Follow instruction files**:
   - Backend: `copilot-instructions-api.instructions.md`
   - Frontend: `copilot-instructions-ui.instructions.md`
4. **Validate using quickstart.md** - manual testing steps
5. **Commit after completion** with clear message

## Parallel Execution Example
```bash
# Backend endpoints (different files, no conflicts):
# Can be worked on simultaneously by multiple agents or sessions

Task T006: GET /api/playlist (PlaylistController.cs - GetAllPlaylists method)
Task T007: POST /api/playlist (PlaylistController.cs - CreatePlaylist method)
Task T008: PUT /api/playlist/{id} (PlaylistController.cs - UpdatePlaylist method)
Task T009: DELETE /api/playlist/{id} (PlaylistController.cs - DeletePlaylist method)

# These are all different methods in the same file but don't conflict
# Can add them all at once or in sequence
```

## Quality Gates
- **After Audit (T005)**: Review gap analysis before starting fixes
- **After Backend (T020)**: Run `dotnet build` - must compile
- **After Frontend (T034)**: Run `npm run type-check` - zero errors
- **After Validation (T039)**: All checklist items must pass

## Notes
- **No unit tests required** per user specification
- **Manual testing** replaces automated test suite
- **Focus on functional integration** not test coverage
- **Incremental commits** after each logical grouping
- **Use Swagger** for backend endpoint testing
- **Use Browser DevTools** for frontend API call verification

---

# 📝 TASK GENERATION RULES (Applied)

## Rules Used
1. ✅ Different files → marked [P] for parallel
2. ✅ Same file → sequential (no [P])
3. ✅ Audit before fixes (identify work first)
4. ✅ Backend endpoints before frontend integration
5. ✅ Service layer before UI components
6. ✅ Validation after all fixes
7. ✅ No test generation (per user "skip test phase")
8. ✅ Manual validation replaces automated tests

## Architecture Compliance
- ✅ Clean Architecture maintained (Domain → Application → Infrastructure → Api)
- ✅ Service layer uses apiClient only
- ✅ DTOs for all API responses
- ✅ React Query for server state
- ✅ Redux for global state
- ✅ Feature-based organization

## Phase-Based Approach
- ✅ Complete Phase 1 before Phase 2
- ✅ Each phase follows same pattern: Audit → Fix → Validate
- ✅ Git commit after each phase completion
- ✅ Can deploy phases independently

---

**Status**: Ready for execution - Start with T001  
**Next Command**: Begin Phase 1.1 Audit tasks (T001-T005)
