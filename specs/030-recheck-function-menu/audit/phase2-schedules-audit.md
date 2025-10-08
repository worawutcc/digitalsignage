# Phase 2 Schedules Integration Audit Report

**Feature:** 030-recheck-function-menu  
**Phase:** 2 - Schedules  
**Date:** 2025-01-08  
**Status:** 🔄 Audit In Progress

---

## Overview

The Schedules module is **more complex** than Playlists with:
- Multi-view interface (Calendar, List, Users)
- Advanced features: User assignments, conflict detection, templates
- Recurrence patterns and time-based scheduling
- Real-time updates and bulk operations

**Initial Findings**: Frontend is feature-rich but backend API appears incomplete for basic CRUD operations.

---

## Phase 2.1: UI Components Audit ✅

### File: `src/digital-signage-web/src/app/schedules/page.tsx` (801 lines)

#### User-Facing Actions Inventory:

**Primary Views:**
1. ✅ **Calendar View** - `<ScheduleCalendar>` component with month/week/day modes
2. ✅ **List View** - Schedule list with filters and search
3. ✅ **Users View** - User assignment management

**Query Operations:**
4. ✅ **Get Schedules** - `useSchedules({ status: ['active', 'draft'] })`
5. ✅ **Get Calendar Data** - `useScheduleCalendar(startDate, endDate, devices, view)`
6. ✅ **Get Schedule Stats** - `useScheduleStats()`
7. ⚠️ **Search Schedules** - UI exists but backend unclear

**Mutation Operations:**
8. ✅ **Create Schedule** - `useCreateSchedule()` → Opens `<ScheduleBuilder>` modal
9. ✅ **Update Schedule** - `useUpdateSchedule()` → Edit functionality
10. ✅ **Delete Schedule** - `useDeleteSchedule()` → With confirmation
11. ⚠️ **Duplicate Schedule** - Not found in UI

**Advanced Features:**
12. ✅ **User Assignment** - `<UserScheduleAssignment>` component with bulk operations
13. ✅ **Conflict Detection** - `<ConflictDetection>` component
14. ✅ **Default Schedule Toggle** - `<DefaultScheduleToggle>` component
15. ✅ **Assigned Users List** - `<AssignedUsersList>` component
16. ✅ **Content Source Badge** - Shows media/playlist source

**Navigation:**
17. ✅ **Templates** - Link to `/schedules/templates`
18. ✅ **Event Click** - `handleEventClick()` to view/edit schedule

#### Components Found:

**Feature Components** (`src/digital-signage-web/src/features/schedules/components/`):
- `ScheduleCalendar.tsx` - Calendar view with events
- `ScheduleBuilder.tsx` - Create/edit schedule form (complex multi-step)
- `ConflictDetection.tsx` - Shows scheduling conflicts
- `ContentSourceBadge.tsx` - Displays schedule content type
- `AssignedUsersList.tsx` - List of assigned users

**User Feature Components** (`src/digital-signage-web/src/features/users/components/`):
- `DefaultScheduleToggle.tsx` - Toggle default schedule flag
- `UserScheduleAssignment.tsx` - Bulk user assignment UI

**Hooks** (`src/digital-signage-web/src/features/schedules/hooks/useSchedules.ts`):
- `useSchedules(filters)` - Get schedules with filters
- `useScheduleCalendar(start, end, devices, view)` - Calendar data
- `useScheduleStats()` - Statistics
- `useCreateSchedule()` - Create mutation
- `useUpdateSchedule()` - Update mutation
- `useDeleteSchedule()` - Delete mutation

#### Issues Identified:

**🚨 Critical Issues:**
1. **No Basic CRUD Endpoints Found** - Backend ScheduleController only has user-assignment endpoints
   - Missing: `GET /api/schedules` (list all)
   - Missing: `GET /api/schedules/{id}` (get by ID)
   - Missing: `POST /api/schedules` (create)
   - Missing: `PUT /api/schedules/{id}` (update)
   - Missing: `DELETE /api/schedules/{id}` (delete)

**⚠️ Warning Issues:**
2. **Calendar Data API** - `useScheduleCalendar()` endpoint unclear
3. **Statistics API** - `useScheduleStats()` endpoint unclear
4. **Search/Filter API** - Frontend has search but backend endpoint unknown
5. **Conflict Detection API** - Complex logic, needs backend support
6. **Template System** - `/schedules/templates` page exists, API unknown

**✅ Working Features:**
7. **User Assignment** - `GET /api/admin/schedules/{id}/users` exists
8. **Default Schedule** - `PUT /api/admin/schedules/{id}/default` exists
9. **Remove User** - `DELETE /api/admin/schedules/{id}/users/{userId}` appears to exist

---

## Phase 2.2: Frontend Service Audit 🔄

### File: `src/digital-signage-web/src/services/scheduleService.ts` (720 lines)

#### Service Methods Inventory:

| Method | Uses apiClient? | Has Backend? | Status |
|--------|----------------|--------------|---------|
| `getAll()` | ✅ Yes → `/api/schedules` | ❌ **MISSING** | 🚨 Need endpoint |
| `getById(id)` | ✅ Yes → `/api/schedules/{id}` | ❌ **MISSING** | 🚨 Need endpoint |
| `getSchedules()` (instance) | ✅ Yes → `/api/admin/schedules` | ❓ Unknown | ⚠️ Verify |
| `getScheduleById(id)` (instance) | ✅ Yes → `/api/admin/schedules/{id}` | ❓ Unknown | ⚠️ Verify |
| `searchSchedules(params)` | ✅ Yes → `/api/admin/schedules/search` | ❓ Unknown | ⚠️ Verify |
| `getAssignedUsers(scheduleId)` | ✅ Yes → `/api/admin/schedules/{id}/users` | ✅ EXISTS | ✅ Working |
| `removeUserFromSchedule(scheduleId, userId)` | ✅ Yes → `/api/admin/schedules/{id}/users/{userId}` | ✅ EXISTS | ✅ Working |
| **CREATE** | ❓ Not found | ❌ **MISSING** | 🚨 Critical |
| **UPDATE** | ❓ Not found | ❌ **MISSING** | 🚨 Critical |
| **DELETE** | ❓ Not found | ❌ **MISSING** | 🚨 Critical |

**Additional Methods to Check** (from rest of file - need to read lines 200-720):
- Calendar data methods
- Statistics methods
- Template methods
- Conflict detection methods
- Bulk operations

#### Validation:
- ✅ All found methods use `apiClient` from `/lib/api`
- ✅ No direct `axios` imports
- ⚠️ Service has both static and instance methods (inconsistent pattern)
- ❌ Missing core CRUD operations

---

## Phase 2.3: React Query Hooks Audit ⏳

### File: `src/digital-signage-web/src/features/schedules/hooks/useSchedules.ts`

**Found Hooks:**
- `useSchedules(filters)` - Query hook
- `useScheduleCalendar(start, end, devices, view)` - Query hook
- `useScheduleStats()` - Query hook
- `useCreateSchedule()` - Mutation hook
- `useUpdateSchedule()` - Mutation hook
- `useDeleteSchedule()` - Mutation hook

**Need to verify:**
- What API endpoints do these hooks call?
- Are they using ScheduleService methods?
- Do they have proper error handling?
- Cache invalidation strategy?

---

## Phase 2.4: Backend API Audit ⏳

### File: `src/DigitalSignage.Api/Controllers/ScheduleController.cs` (156 lines)

#### Existing Endpoints:

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|---------|
| `/api/admin/schedules/{id}/users` | GET | Get assigned users | ✅ Implemented |
| `/api/admin/schedules/{id}/default` | PUT | Set default schedule | ✅ Implemented |
| `/api/admin/schedules/{id}/users/{userId}` | DELETE | Remove user | ❓ Needs verify |

**Authorization**: Requires `[Authorize(Roles = "Admin,ContentManager")]`

#### Missing Core CRUD Endpoints:

| Required Endpoint | Method | Purpose | Priority |
|-------------------|--------|---------|----------|
| `/api/schedules` | GET | List all schedules | 🚨 Critical |
| `/api/schedules/{id}` | GET | Get schedule by ID | 🚨 Critical |
| `/api/schedules` | POST | Create schedule | 🚨 Critical |
| `/api/schedules/{id}` | PUT | Update schedule | 🚨 Critical |
| `/api/schedules/{id}` | DELETE | Delete schedule | 🚨 Critical |
| `/api/schedules/calendar` | GET | Calendar view data | ⚠️ High |
| `/api/schedules/stats` | GET | Statistics | ⚠️ High |
| `/api/schedules/search` | GET | Search/filter | ⚠️ Medium |
| `/api/schedules/{id}/conflicts` | GET | Detect conflicts | ⚠️ Medium |
| `/api/schedules/{id}/duplicate` | POST | Duplicate schedule | ⚠️ Low |

#### Service Layer Check:

**Need to verify** `src/DigitalSignage.Application/Interfaces/IScheduleService.cs`:
- Does base schedule service exist?
- What methods are implemented?
- IUserScheduleService exists (for user assignments)
- Need separate IScheduleService for CRUD?

---

## Phase 2.5: Gap Analysis Summary 🎯

### Critical Gaps:

**🚨 Priority 1: Core CRUD Missing**
The Schedules backend appears to **only have user-assignment endpoints**, missing all basic CRUD operations:

1. **GET /api/schedules** - List schedules
2. **GET /api/schedules/{id}** - Get schedule details
3. **POST /api/schedules** - Create schedule
4. **PUT /api/schedules/{id}** - Update schedule
5. **DELETE /api/schedules/{id}** - Delete schedule

**Impact**: Frontend has complete UI but cannot perform basic schedule management!

**🚨 Priority 2: Calendar & Stats APIs**
6. **GET /api/schedules/calendar** - Calendar view data with date range
7. **GET /api/schedules/stats** - Dashboard statistics

**⚠️ Priority 3: Advanced Features**
8. **GET /api/schedules/search** - Search and filtering
9. **GET /api/schedules/{id}/conflicts** - Conflict detection
10. **POST /api/schedules/{id}/duplicate** - Duplicate with customization

### Architecture Investigation Needed:

**Questions to Answer:**
1. Is there a base `IScheduleService` interface separate from `IUserScheduleService`?
2. Are Schedule domain entities defined in `src/DigitalSignage.Domain/Entities/`?
3. What DTOs exist for schedule CRUD?
4. Is there an EF Core Schedule repository?

### Estimated Task Count:

**Phase 2 Tasks:**
- Audit Tasks: 5 (T001-T005) ✅ In Progress
- Backend Fixes: ~15-20 tasks (Service + DTOs + Endpoints)
- Frontend Fixes: ~10-15 tasks (Hooks + Service methods + UI wiring)
- Validation: ~5-8 tasks (Manual testing per feature)

**Total Phase 2: 35-48 tasks** (matches original estimate)

---

## Next Steps:

### Immediate (Complete Audit):
1. ⏳ **Read full scheduleService.ts** (lines 200-720) - Identify all methods
2. ⏳ **Check IScheduleService interface** - Verify service layer structure
3. ⏳ **Verify Schedule entity** - Domain model completeness
4. ⏳ **Check existing DTOs** - What's already defined?
5. ⏳ **Complete Gap Analysis** - Full comparison matrix

### After Audit (Implementation Priority):
1. 🔜 **T006-T010**: Core CRUD endpoints (GET, POST, PUT, DELETE, GET by ID)
2. 🔜 **T011-T012**: Calendar and Stats endpoints
3. 🔜 **T013-T020**: Advanced features (search, conflicts, templates)
4. 🔜 **T021-T035**: Frontend integration fixes
5. 🔜 **T036-T043**: Validation and testing

---

## Complexity Notes:

**Schedules are MORE COMPLEX than Playlists:**
- ✅ Playlists: Simple CRUD with items and assignments
- ⚠️ Schedules: Time-based, recurring patterns, conflict detection, multi-device targeting, user-based routing

**Additional Complexity:**
- Recurrence patterns (daily/weekly/monthly/yearly)
- Time range validation (start/end time)
- Device and user targeting
- Conflict detection across schedules
- Template system
- Default fallback schedules
- Calendar view with multiple granularities

---

**Status**: 🔄 Audit 40% Complete  
**Next**: Complete service layer and domain audit  
**Estimated Completion**: Need 2-3 more audit tasks before implementation

