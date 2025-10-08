# Schedule Endpoint Mapping Report

Date: 2025-10-08
Status: BACKEND ENHANCEMENTS PHASE 1 COMPLETE

## 1. Objective
Align frontend `scheduleService.ts` API calls with actual backend controller endpoints, adding missing minimal backend support where feasible (date-range) and neutralizing unsupported UI features with explicit placeholders.

## 2. Backend Controllers Reviewed
- `ScheduleController` (`/api/admin/schedules`)
  - Core CRUD: GET list, GET by id, POST, PUT, DELETE
  - Statistics: GET `/statistics`
  - Default flag: PUT `/{scheduleId}/default`
  - Phase 0 Added: GET `/date-range`
  - Phase 1 Added: GET `/search`, PATCH `/{id}/toggle-active`,
    POST `/{scheduleId}/media`, DELETE `/{scheduleId}/media/{mediaId}`,
    GET `/device/{deviceId}`
- `ScheduleConflictsController` (`/api/schedule-conflicts`)
  - GET `/api/schedule-conflicts`
  - POST `/api/schedule-conflicts/{conflictId}/resolve`
  - GET `/api/schedule-conflicts/{conflictId}/suggestions`
  - GET `/api/schedule-conflicts/{conflictId}/history`

## 3. Frontend Previous Usage (Problematic Paths)
The original `scheduleService.ts` used many endpoints under `/api/schedules/*` which did not exist in backend. Examples:
- `/api/schedules` (list)
- `/api/schedules/search`
- `/api/schedules/active`
- `/api/schedules/date-range`
- `/api/schedules/{id}/media`
- `/api/schedules/{id}/devices`
- `/api/schedules/templates/*`
- `/api/schedules/check-conflicts`
- `/api/schedules/preview`
- `/api/schedules/{id}/assign-users`
- `/api/schedules/{scheduleId}/assigned-users`
- `/api/schedules/user/{userId}`
- `/api/schedules/analytics/assignments`
- `/api/schedules/{id}/suggested-users`
- `/api/schedules/{id}/validate-assignment`

## 4. Mapping Summary
| UI (Old) | Backend Actual | Action | Notes |
|----------|----------------|--------|-------|
| GET /api/schedules | GET /api/admin/schedules | Updated path | | 
| GET /api/schedules/{id} | GET /api/admin/schedules/{id} | Updated path | |
| POST /api/schedules | POST /api/admin/schedules | Updated path | |
| PUT /api/schedules/{id} | PUT /api/admin/schedules/{id} | Updated path | |
| DELETE /api/schedules/{id} | DELETE /api/admin/schedules/{id} | Updated path | |
| GET /api/schedules/statistics | GET /api/admin/schedules/statistics | Updated path | |
| GET /api/schedules/date-range | (Missing) | Implemented | GET /api/admin/schedules/date-range |
| GET /api/schedules/search | (Missing) | Implemented | GET /api/admin/schedules/search |
| GET /api/schedules/active | (Missing) | Implemented (query) | Use search?isActive=true |
| GET /api/schedules/device/{deviceId} | (Missing) | Implemented | GET /api/admin/schedules/device/{deviceId} |
| POST /api/schedules/bulk-delete | (Missing) | Placeholder error | Consider future bulk operation |
| PATCH /api/schedules/{id}/toggle-active | (Missing) | Implemented | PATCH /api/admin/schedules/{id}/toggle-active |
| Media endpoints | (Missing) | Implemented (add/remove) | POST & DELETE media/{mediaId} |
| Device endpoints | (Missing) | Placeholder errors | Out of current backend scope |
| Templates endpoints | (Missing) | Placeholder errors | Not implemented backend side |
| Conflicts: /api/schedules/check-conflicts | (Missing) | Placeholder error | Could map to schedule-conflicts domain later |
| Preview | (Missing) | Placeholder error | Requires business logic backend |
| User assignment endpoints | (Missing) | Placeholder errors | Likely separate future controller |
| Analytics / suggested-users / validate-assignment | (Missing) | Placeholder errors | Planned advanced features |
| GET /api/schedule-conflicts | GET /api/schedule-conflicts | Kept | Works |
| POST /api/schedule-conflicts/{id}/resolve | Provided | Kept | Works |
| GET /api/schedule-conflicts/{id}/suggestions | Provided | Kept | Works |

## 5. Code Changes
### Backend
Added date-range endpoint in `ScheduleController`:
```csharp
[HttpGet("date-range")]
public async Task<ActionResult<IEnumerable<ScheduleDto>>> GetByDateRange(string startDate, string endDate)
```

### Frontend
Refactored all schedule paths in `scheduleService.ts` to use `/api/admin/schedules` where applicable. Added inline comments marking placeholder/not-supported sections to prevent silent 404 failures.

## 6. Outstanding Gaps (Potential Future Work)
| Feature | Current Handling | Recommended Next Step |
|---------|------------------|-----------------------|
| Search server-side | Implemented | Add paging, sorting next |
| Active filter | Implemented | Consider caching layer |
| Device filter | Implemented | Combine with paging in search |
| Media attach/remove | Implemented | Add bulk delete + reorder endpoint |
| Device attach/remove | Placeholder errors | Define device assignment endpoints |
| Templates | Placeholder errors | Add schedule templates domain + controller |
| Conflicts / preview | Placeholder errors | Model conflict engine & preview generation |
| User assignments | Placeholder errors | Add `UserScheduleAssignmentsController` |
| Analytics | Placeholder errors | Create analytics projection service |

## 7. Risk & Mitigation
- Client filtering may become inefficient with large dataset → Mitigation: implement paging + server search soon.
- Placeholders throw errors; UI must handle and hide features until backend ready.
- Date parsing: ensure frontend sends `YYYY-MM-DD` UTC; validation already added.

## 8. Next Recommended Steps
1. Add paging & sorting to `/api/admin/schedules/search` (page, pageSize, sortBy, sortDir).
2. Introduce bulk media delete & reorder endpoint (PUT `/api/admin/schedules/{id}/media/order`).
3. Split `scheduleService.ts` into smaller focused services (core, media, assignments, analytics).
4. Implement schedule templates, preview generation, and assignment analytics incrementally.
5. Introduce conflict pre-check endpoint to replace generic placeholder.

## 9. Validation Checklist
- [x] Backend builds after new endpoints
- [x] Frontend updated to use new search/device/media/toggle routes
- [x] Date range, search, device endpoints working
- [x] Unsupported advanced features still fail fast with clear messages

---
Prepared automatically by alignment task.
