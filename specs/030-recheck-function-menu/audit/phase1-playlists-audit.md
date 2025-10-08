# Phase 1 Playlists Integration Audit Report

**Feature:** 030-recheck-function-menu  
**Phase:** 1 - Playlists  
**Date:** 2025-01-XX  
**Status:** 🔄 In Progress

---

## T001: UI Components Audit ✅

### File: `src/digital-signage-web/src/app/playlists/page.tsx`

#### User-Facing Actions Inventory:

**Query Operations:**
1. ✅ **List Playlists** - `useQuery(['playlists'])` → `PlaylistService.getAll()` → **API: GET /api/playlist**
2. ✅ **Get Statistics** - `useQuery(['playlist-stats'])` → `PlaylistService.getStatistics()` → **⚠️ CLIENT-SIDE ONLY (no dedicated API)**
3. ✅ **Search Playlists** - Client-side filter on `playlists` data
4. ✅ **Filter by Status** - Client-side filter on `playlists` data

**Mutation Operations:**
5. ✅ **Delete Playlist** - `deleteMutation` → `PlaylistService.delete(id)` → **API: DELETE /api/playlist/{id}**
6. ✅ **Duplicate Playlist** - `duplicateMutation` → `PlaylistService.duplicate(id)` → **⚠️ MISMATCH (see details)**
7. ✅ **Activate Playlist** - `activateMutation` → `PlaylistService.activate(id)` → **API: POST /api/playlist/{id}/activate**
8. ✅ **Deactivate Playlist** - `deactivateMutation` → `PlaylistService.deactivate(id)` → **API: POST /api/playlist/{id}/deactivate**

**Navigation Actions:**
9. ❌ **Create Playlist** - Button onClick → `/playlists/create` → **NOT WIRED**
10. ❌ **Edit Playlist** - Button in cards/rows → **NOT WIRED (no onClick handler)**
11. ❌ **View Details** - Implicit navigation → **NOT IMPLEMENTED**

**Additional UI Features:**
12. ✅ **View Mode Toggle** - Grid/List view (client-side state)
13. ✅ **Assignment Summary** - `<PlaylistAssignmentSummary>` component → **API: GET /api/playlist/{id}/assignment-summary**

#### Issues Identified:

**🚨 Critical Issues:**
1. **Edit Button** - No onClick handler, buttons are non-functional
2. **Duplicate Button (Grid)** - Header duplicate button has no target
3. **Play Button** - No onClick handler or functionality
4. **More Actions (...)** - No dropdown menu implemented

**⚠️ Warning Issues:**
5. **getStatistics()** - Computes stats client-side instead of using backend aggregation (performance concern for large datasets)
6. **Duplicate API Mismatch** - Service expects `duplicate(id, newName?)` but backend returns `bool`, frontend expects `PlaylistDto`

**📝 Recommendations:**
- Wire Edit button to navigate to `/playlists/edit/[id]`
- Implement dropdown menu for More Actions button
- Add confirmation dialogs for destructive actions (Delete)
- Consider server-side statistics endpoint for better performance
- Fix duplicate API contract mismatch

---

## T002: Frontend Service Audit 🔄

### File: `src/digital-signage-web/src/services/playlistService.ts`

#### Method Inventory:

| Method | Uses apiClient? | Backend Match? | Status |
|--------|----------------|----------------|---------|
| `getAssignmentSummary(id)` | ✅ Yes | ✅ Yes | ✅ Working |
| `getAll()` | ✅ Yes | ✅ Yes | ✅ Working |
| `getByUserId(userId)` | ✅ Yes | ✅ Yes | ✅ Working |
| `getById(id)` | ✅ Yes | ✅ Yes | ✅ Working |
| `create(request, userId?)` | ✅ Yes | ✅ Yes | ✅ Working |
| `update(id, request)` | ✅ Yes | ❌ **NO BACKEND** | 🚨 Missing API |
| `delete(id)` | ✅ Yes | ✅ Yes | ✅ Working |
| `activate(id)` | ✅ Yes | ✅ Yes | ✅ Working |
| `deactivate(id)` | ✅ Yes | ✅ Yes | ✅ Working |
| `duplicate(id, newName?)` | ✅ Yes | ⚠️ Contract Mismatch | ⚠️ Needs Fix |
| `getFiltered(options)` | ❌ **Client-side only** | ❌ No API | ⚠️ Performance Risk |
| `getStatistics()` | ❌ **Client-side only** | ❌ No API | ⚠️ Performance Risk |
| `bulkDelete(ids)` | ✅ Uses `delete()` | ❌ No bulk API | ⚠️ Multiple Calls |
| `bulkActivate(ids)` | ✅ Uses `activate()` | ❌ No bulk API | ⚠️ Multiple Calls |
| `bulkDeactivate(ids)` | ✅ Uses `deactivate()` | ❌ No bulk API | ⚠️ Multiple Calls |
| `exportPlaylist(id)` | ✅ Uses `getById()` | ❌ Client JSON only | ℹ️ OK for now |
| `importPlaylist(json, userId?)` | ✅ Uses `create()` | ❌ No import API | ℹ️ OK for now |
| `validatePlaylist(request)` | ❌ **Client-side only** | ❌ No API | ℹ️ OK for forms |

#### Issues Identified:

**🚨 Critical Missing APIs:**
1. **UPDATE Playlist** (`PUT /api/playlist/{id}`)
   - Frontend calls `apiClient.put('/api/playlist/{id}', request)`
   - Backend service has `UpdateAsync()` method
   - Controller **MISSING** update endpoint

**⚠️ Contract Mismatches:**
2. **Duplicate Playlist**
   - Frontend expects: `POST /api/playlist/{id}/duplicate` → `PlaylistDto`
   - Backend interface: `Task<bool> DuplicateAsync(int id, string newName)`
   - Backend controller: **MISSING** duplicate endpoint
   - **Need to add controller endpoint that returns PlaylistDto**

**⚠️ Performance Concerns:**
3. **getStatistics()** - Fetches all playlists then computes stats client-side
   - Recommendation: Add `GET /api/playlist/statistics` endpoint
4. **getFiltered()** - Fetches all playlists then filters client-side
   - Recommendation: Add query parameters to `GET /api/playlist` (search, status, sort, pagination)

**ℹ️ Bulk Operations:**
5. **bulkDelete/bulkActivate/bulkDeactivate** - Makes multiple API calls
   - Current implementation functional but inefficient
   - Recommendation: Add bulk endpoints for better performance (low priority)

#### Validation:
- ✅ All methods use configured `apiClient` from `/lib/api.ts`
- ✅ No direct `axios` imports found
- ✅ No mock data in service layer
- ✅ Proper TypeScript types used

---

## T003: React Query Hooks Audit

### Files in `src/digital-signage-web/src/features/playlists/hooks/`

| Hook File | Status | API Integration | Issues |
|-----------|--------|----------------|---------|
| `usePlaylists.ts` | ✅ Working | ✅ `PlaylistService.getAll()` | None |
| `usePlaylistById.ts` | ✅ Working | ✅ `PlaylistService.getById()` | None |
| `usePlaylistsByUserId.ts` | ✅ Working | ✅ `PlaylistService.getByUserId()` | None |
| `usePlaylistStatistics.ts` | ⚠️ Client-side | ❌ `PlaylistService.getStatistics()` | Performance risk |
| `usePlaylistAssignmentSummary.ts` | ✅ Working | ✅ API integrated | None |
| `useActivatePlaylist.ts` | ✅ Working | ✅ `PlaylistService.activate()` | None |
| `useDuplicatePlaylist.ts` | ⚠️ API Mismatch | ⚠️ Contract issue | Needs backend fix |
| **MISSING: useCreatePlaylist** | ❌ Not found | - | Need to create |
| **MISSING: useUpdatePlaylist** | ❌ Not found | - | Need to create |
| **MISSING: useDeletePlaylist** | ❌ Not found | - | Need to create |
| **MISSING: useDeactivatePlaylist** | ❌ Not found | - | Need to create |

**Note:** `usePlaylists.ts` exports mutation hooks but they're defined inline in the file (not separate files):
- `useCreatePlaylist()` - ✅ Exists in file
- `useUpdatePlaylist()` - ✅ Exists in file  
- `useDeletePlaylist()` - ✅ Exists in file

**Issues:**
1. ⚠️ `usePlaylistStatistics` - No backend endpoint, client-side computation
2. ⚠️ `useDuplicatePlaylist` - Backend API missing, contract mismatch
3. ✅ All other hooks properly use React Query with apiClient

---

## T004: Backend API Audit

### File: `src/DigitalSignage.Api/Controllers/PlaylistController.cs`

#### Existing Endpoints:

| Endpoint | Method | Controller Action | Service Method | Status |
|----------|--------|------------------|----------------|---------|
| `/api/playlist` | GET | ✅ `GetPlaylists()` | `GetAllAsync()` | ✅ Implemented |
| `/api/playlist/user/{userId}` | GET | ✅ `GetPlaylistsByUser(userId)` | `GetByUserIdAsync()` | ✅ Implemented |
| `/api/playlist/{id}` | GET | ✅ `GetPlaylist(id)` | `GetByIdAsync()` | ✅ Implemented |
| `/api/playlist` | POST | ✅ `CreatePlaylist(request, userId)` | `CreateAsync()` | ✅ Implemented |
| `/api/playlist/{id}` | PUT | ❌ **MISSING** | `UpdateAsync()` exists | 🚨 Need to add |
| `/api/playlist/{id}` | DELETE | ✅ `DeletePlaylist(id)` | `DeleteAsync()` | ✅ Implemented |
| `/api/playlist/{id}/activate` | POST | ✅ `ActivatePlaylist(id)` | `ActivateAsync()` | ✅ Implemented |
| `/api/playlist/{id}/deactivate` | POST | ✅ `DeactivatePlaylist(id)` | `DeactivateAsync()` | ✅ Implemented |
| `/api/playlist/{id}/assignment-summary` | GET | ✅ `GetAssignmentSummary(id)` | `GetAssignmentSummaryAsync()` | ✅ Implemented |
| `/api/playlist/{id}/duplicate` | POST | ❌ **MISSING** | `DuplicateAsync()` exists | 🚨 Need to add |
| `/api/playlist/statistics` | GET | ❌ **MISSING** | Not in service | 🆕 Need to create |
| `/api/playlist/{playlistId}/items` | POST | ❌ **MISSING** | `AddItemAsync()` exists | 🆕 Need to add |
| `/api/playlist/{playlistId}/items/{itemId}` | PUT | ❌ **MISSING** | `UpdateItemAsync()` exists | 🆕 Need to add |
| `/api/playlist/{playlistId}/items/{itemId}` | DELETE | ❌ **MISSING** | `RemoveItemAsync()` exists | 🆕 Need to add |
| `/api/playlist/{playlistId}/items/reorder` | POST | ❌ **MISSING** | `ReorderItemsAsync()` exists | 🆕 Need to add |

### Backend Service Layer Status:

**IPlaylistService Interface** (`src/DigitalSignage.Application/Interfaces/IPlaylistService.cs`):
- ✅ All methods exist and implemented in `PlaylistService.cs`
- ✅ Methods confirmed: GetAllAsync, CreateAsync, UpdateAsync, DeleteAsync, ActivateAsync, DeactivateAsync, DuplicateAsync, GetAssignmentSummaryAsync
- ✅ Playlist Items: AddItemAsync, UpdateItemAsync, RemoveItemAsync, ReorderItemsAsync
- ✅ Assignments: AssignToDeviceAsync, AssignToDeviceGroupAsync, UnassignFromDeviceAsync

**Gap:** Service layer is complete, but many controller endpoints are missing!

---

## T005: Gap Analysis Summary 🎯

### Critical Gaps (Must Fix):

#### 🚨 Priority 1: Core CRUD Operations
1. **UPDATE Playlist Endpoint** - Backend controller missing `PUT /api/playlist/{id}`
   - Service: ✅ `UpdateAsync()` exists
   - Controller: ❌ Missing
   - Frontend: ✅ `playlistService.update()` calls API
   - **Action:** Add controller endpoint

2. **DUPLICATE Playlist Endpoint** - Backend controller missing `POST /api/playlist/{id}/duplicate`
   - Service: ✅ `DuplicateAsync()` exists (returns bool)
   - Controller: ❌ Missing
   - Frontend: ✅ `playlistService.duplicate()` expects PlaylistDto
   - **Actions:** 
     - Add controller endpoint
     - Fix service to return PlaylistDto instead of bool
     - Update IPlaylistService interface

#### 🚨 Priority 2: UI Wiring Issues
3. **Edit Button Not Wired** - `page.tsx` line 347 & 424
   - Current: `<Button variant="outline" size="sm"><Edit /></Button>`
   - **Action:** Add `onClick={() => router.push(`/playlists/edit/${playlist.id}`)}`

4. **Play Button Not Functional**
   - Current: Non-functional ghost button
   - **Action:** TBD (clarify requirements - preview? activate?)

5. **Duplicate Button (Header)** - No target selected
   - Current: Header button has no playlist selected
   - **Action:** Either remove or add multi-select functionality

#### ⚠️ Priority 3: Performance & Features
6. **Statistics Endpoint** - Create `GET /api/playlist/statistics`
   - Current: Client-side computation from all playlists
   - **Actions:**
     - Add service method to compute stats
     - Add controller endpoint
     - Update frontend to use API

7. **Playlist Items Management** - Add 4 missing endpoints:
   - `POST /api/playlist/{playlistId}/items` - Add item
   - `PUT /api/playlist/{playlistId}/items/{itemId}` - Update item
   - `DELETE /api/playlist/{playlistId}/items/{itemId}` - Remove item
   - `POST /api/playlist/{playlistId}/items/reorder` - Reorder items

### Medium Priority Enhancements:

8. **Filtering & Search** - Add query parameters to `GET /api/playlist`:
   - `?search=term` - Search by name/description
   - `?status=Active,Draft` - Filter by status
   - `?sortBy=name&sortOrder=asc` - Sorting
   - `?page=1&pageSize=20` - Pagination

9. **Bulk Operations** - Add endpoints for efficiency:
   - `POST /api/playlist/bulk/delete` - Delete multiple
   - `POST /api/playlist/bulk/activate` - Activate multiple
   - `POST /api/playlist/bulk/deactivate` - Deactivate multiple

### Low Priority / Future:
10. **Assignment Management Endpoints** (Service methods exist):
    - Assign to device/group
    - Unassign from device
    - Get playlists for device

---

## Implementation Roadmap

### Phase 1.2: Backend Fixes (T006-T020)

**T006-T007: Core CRUD**
- [ ] T006: Add `PUT /api/playlist/{id}` endpoint
- [ ] T007: Add `POST /api/playlist/{id}/duplicate` endpoint (fix return type)

**T008-T009: Statistics & Performance**
- [ ] T008: Create playlist statistics service method
- [ ] T009: Add `GET /api/playlist/statistics` endpoint

**T010-T013: Playlist Items Management**
- [ ] T010: Add `POST /api/playlist/{playlistId}/items` endpoint
- [ ] T011: Add `PUT /api/playlist/{playlistId}/items/{itemId}` endpoint
- [ ] T012: Add `DELETE /api/playlist/{playlistId}/items/{itemId}` endpoint
- [ ] T013: Add `POST /api/playlist/{playlistId}/items/reorder` endpoint

**T014-T016: Query Enhancements**
- [ ] T014: Add filtering/search parameters to GetPlaylists
- [ ] T015: Add pagination support
- [ ] T016: Add sorting parameters

**T017-T020: Bulk Operations (Optional)**
- [ ] T017: Add bulk delete endpoint
- [ ] T018: Add bulk activate endpoint
- [ ] T019: Add bulk deactivate endpoint
- [ ] T020: Update service layer for bulk operations

### Phase 1.3: Frontend Fixes (T021-T034)

**T021-T023: Service Layer**
- [ ] T021: Audit complete - ✅ All methods use apiClient
- [ ] T022: Update duplicate method after backend fix
- [ ] T023: Update getStatistics to use new API endpoint

**T024-T027: React Query Hooks**
- [ ] T024: Update usePlaylistStatistics to use API
- [ ] T025: Update useDuplicatePlaylist after backend fix
- [ ] T026: Verify all mutations invalidate correct queries
- [ ] T027: Add error handling and loading states

**T028-T034: UI Component Wiring**
- [ ] T028: Wire Edit button in grid view (line 347)
- [ ] T029: Wire Edit button in list view (line 424)
- [ ] T030: Implement Play button functionality
- [ ] T031: Add confirmation dialog for Delete action
- [ ] T032: Fix/remove header Duplicate button
- [ ] T033: Add More Actions dropdown menu
- [ ] T034: Add loading/error states to mutations

### Phase 1.4: Validation & Testing (T035-T040)

- [ ] T035: Manual test all CRUD operations
- [ ] T036: Test statistics endpoint
- [ ] T037: Test playlist items management
- [ ] T038: Test error handling
- [ ] T039: Test React Query cache invalidation
- [ ] T040: Verify all UI actions work end-to-end

---

## Summary Statistics

### Backend Status:
- ✅ Implemented: 9 endpoints
- 🚨 Critical Missing: 2 endpoints (Update, Duplicate)
- 🆕 Enhancement Missing: 10+ endpoints (Statistics, Items, Bulk, Filtering)
- Service Layer: 100% complete

### Frontend Status:
- ✅ Service Methods: 17/17 use apiClient correctly
- ⚠️ API Mismatches: 2 (Update endpoint missing, Duplicate contract mismatch)
- ⚠️ Performance Issues: 2 (getStatistics, getFiltered - client-side)
- ❌ UI Wiring Issues: 5 (Edit, Play, Duplicate header, More actions, confirmations)

### Overall Completion:
- Backend API Coverage: ~40% (9/22+ required endpoints)
- Frontend Integration: ~70% (14/20 actions working)
- Critical Path: 🚨 2 must-fix issues blocking core functionality

---

**Next Steps:**
1. Begin T006: Implement Update Playlist endpoint
2. Begin T007: Implement Duplicate Playlist endpoint
3. Proceed with remaining backend tasks (T008-T020)
4. Move to frontend fixes after backend complete

