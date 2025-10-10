# Phase 3.1: Backend Verification Status

**Feature**: 033-recheck-action-menu  
**Date**: 2025-10-09  
**Status**: In Progress

## Overview

This document tracks the backend controller verification status for Phase 3.1 (Tasks T001-T009). Each controller is checked against the contract specifications in `specs/033-recheck-action-menu/contracts/api-endpoints.md`.

---

## Controller Verification Summary

### ✅ T001: DashboardController - COMPLETE

**File**: `src/DigitalSignage.Api/Controllers/DashboardController.cs`  
**Status**: ✅ Enhanced and Complete  
**Actions Taken**:
- Added `GET /api/dashboard/summary` endpoint
- Added `GET /api/dashboard/device-status` endpoint
- Created `DeviceStatusGridDto` and `DeviceStatusItemDto`
- Updated `IDashboardService` interface with `GetDeviceStatusAsync()` method
- Implemented `DashboardService.GetDeviceStatusAsync()` method

**Contract Compliance**:
- ✅ GET `/api/dashboard/summary` - Returns dashboard metrics (totalDevices, onlineDevices, etc.)
- ✅ GET `/api/dashboard/device-status` - Returns real-time device status grid

**Implementation Details**:
- Uses `DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)` for PostgreSQL datetime compatibility
- Queries devices with active assignments using priority-based selection
- Filters out deactivated devices (`DeactivatedAt == null`)
- Returns assignment type formatted as "Schedule #1", "Playlist #2", etc.

---

### ✅ T002: DevicesController - COMPLETE

**File**: `src/DigitalSignage.Api/Controllers/DevicesController.cs`  
**Status**: ✅ Verified Complete (No changes needed)

**Contract Compliance**:
- ✅ GET `/api/devices` - List with filtering, sorting, pagination
- ✅ GET `/api/devices/{id}` - Get device details
- ✅ POST `/api/devices` - Create device
- ✅ PUT `/api/devices/{id}` - Update device
- ✅ DELETE `/api/devices/{id}` - Soft delete device

**Notes**: Full CRUD implementation with `DeviceFilterDto` for advanced filtering.

---

### ⚠️ T003: MediaController - NEEDS ALIGNMENT

**File**: `src/DigitalSignage.Api/Controllers/MediaController.cs`  
**Status**: ⚠️ Functional but endpoint mismatch

**Contract vs Implementation**:

| Contract Endpoint | Controller Endpoint | Status |
|-------------------|---------------------|--------|
| GET `/api/media` | GET `/api/media` | ✅ Match |
| GET `/api/media/{id}` | GET `/api/media/{id}` | ✅ Match |
| POST `/api/media/upload` (Step 1) | POST `/api/media/upload-request` | ⚠️ Mismatch |
| POST `/api/media/{id}/confirm-upload` (Step 3) | POST `/api/media/complete-upload` | ⚠️ Mismatch |
| PUT `/api/media/{id}` | PUT `/api/media/{id}` | ✅ Match |
| DELETE `/api/media/{id}` | DELETE `/api/media/{id}` | ✅ Match |

**Additional Endpoints** (not in contract but implemented):
- GET `/api/media/type/{type}` - Get media by type
- GET `/api/media/search` - Search media
- POST `/api/media` - Create media record
- POST `/api/media/upload` - Direct file upload (legacy, 100MB limit)
- GET `/api/media/upload-status/{uploadRequestId}` - Get upload status
- GET `/api/media/{mediaId}/optimal-for-device/{deviceId}` - Device-optimized variants

**Recommendation**:
1. **Option A (Minimal Impact)**: Update frontend to use existing endpoints (`/upload-request` and `/complete-upload`)
2. **Option B (Contract Compliance)**: Add route aliases to support both patterns
3. **Option C (Breaking Change)**: Rename controller endpoints to match contract

**Decision**: Defer to Phase 3.2 (Frontend Integration) - verify which pattern frontend currently uses.

---

### ⚠️ T004: AdminDeviceRegistrationController - NEEDS ALIGNMENT

**File**: `src/DigitalSignage.Api/Controllers/AdminDeviceRegistrationController.cs`  
**Status**: ⚠️ Functional but route/pattern mismatch

**Contract vs Implementation**:

| Contract Endpoint | Controller Endpoint | Status |
|-------------------|---------------------|--------|
| GET `/api/admin/device-registrations` | GET `/api/admin/device-registration/pending` | ⚠️ Different |
| GET `/api/admin/device-registrations/{id}` | (Not implemented) | ❌ Missing |
| POST `/api/admin/device-registrations/{id}/approve` | POST `/api/admin/device-registration/approve` | ⚠️ Different |
| POST `/api/admin/device-registrations/{id}/reject` | POST `/api/admin/device-registration/reject` | ⚠️ Different |

**Key Differences**:
1. **Route naming**: Contract uses plural `device-registrations`, controller uses singular `device-registration`
2. **Approval pattern**: Contract uses `{id}` path parameter, controller uses `pin` in request body
3. **List endpoint**: Controller only has `/pending`, contract has status filter query parameter
4. **Detail endpoint**: Controller missing GET `/{id}` endpoint

**Recommendation**:
1. Keep existing `/approve` and `/reject` endpoints (PIN-based workflow is working)
2. Add new endpoints to match contract for consistency:
   - GET `/api/admin/device-registrations` with `?status=` filter (alias to `/pending` when `status=Pending`)
   - GET `/api/admin/device-registrations/{id}` for detail view
   - Consider adding `/api/admin/device-registrations/{id}/approve` as alternate route

**Decision**: Defer to Phase 3.2 - verify frontend usage before making breaking changes.

---

### ❌ T005: QRCodeController - MISSING

**File**: (Not exists)  
**Status**: ❌ Controller missing (Service exists)

**Found**:
- ✅ `QrCodeService` exists in `src/DigitalSignage.Infrastructure/Services/QrCodeService.cs`

**Missing**:
- ❌ `QRCodeController` in `src/DigitalSignage.Api/Controllers/`

**Required Endpoints** (from contract):
- GET `/api/qr-codes` - List QR codes with pagination
- GET `/api/qr-codes/{id}` - Get QR code details
- POST `/api/qr-codes/generate` - Generate QR code
- GET `/api/qr-codes/{id}/download` - Download QR code image
- DELETE `/api/qr-codes/{id}` - Delete QR code

**Action Required**: Create `QRCodeController` with IQrCodeService injection.

---

### ✅ T006: ReportsController - EXISTS (Needs Verification)

**File**: `src/DigitalSignage.Api/Controllers/ReportsController.cs`  
**Status**: ⏳ Exists but not yet verified

**Required Endpoints** (from contract):
- GET `/api/reports` - List available reports
- POST `/api/reports/generate` - Generate report
- GET `/api/reports/{id}/export` - Export report (PDF/Excel)

**Action Required**: Verify endpoint implementation against contract.

---

### ❌ T007: SettingsController - MISSING

**File**: (Not exists)  
**Status**: ❌ Controller and Service missing

**Required Endpoints** (from contract):
- GET `/api/settings` - Get all system settings
- GET `/api/settings/{category}` - Get category settings
- PUT `/api/settings` - Update settings

**Missing Components**:
- ❌ `ISettingsService` interface
- ❌ `SettingsService` implementation
- ❌ `SettingsController`
- ❌ `Setting` entity (or configuration storage mechanism)

**Action Required**: 
1. Design settings storage approach (database table vs appsettings.json)
2. Create `Setting` entity if database approach
3. Create `ISettingsService` and `SettingsService`
4. Create `SettingsController`

---

### ⏳ T008: Frontend Service Audit - NOT STARTED

**Action Required**: Audit frontend service files in `src/digital-signage-web/src/lib/services/` for:
1. Direct `axios` usage (should use `apiClient` from `/lib/api.ts`)
2. Incorrect API endpoints (verify against contract)
3. Missing error handling patterns
4. Missing type safety with response DTOs

---

### ⏳ T009: Mock Service Identification - NOT STARTED

**Action Required**: Identify all mock service files for deletion:
1. Search for files with `mock` in name
2. Search for hardcoded data arrays in service files
3. Identify services returning static data instead of API calls
4. Create deletion checklist for Phase 3.6

---

## Next Steps

### Immediate (Phase 3.1 Completion):
1. ✅ Complete DashboardController enhancement - DONE
2. ✅ Verify DevicesController - DONE
3. ⏳ Verify MediaController endpoints and document alignment strategy
4. ⏳ Verify AdminDeviceRegistrationController and document differences
5. ❌ Create QRCodeController with required endpoints
6. ⏳ Verify ReportsController endpoints
7. ❌ Create SettingsController (including service layer)
8. ⏳ Audit frontend services for apiClient compliance (T008)
9. ⏳ Create mock service deletion checklist (T009)

### Phase 3.2 Dependencies:
- Media endpoint alignment decision based on frontend usage
- AdminDeviceRegistration endpoint strategy (keep PIN-based or migrate to ID-based)
- QRCodeController must be complete before frontend integration
- SettingsController must be complete before frontend integration

---

## Summary Statistics

**Controllers Verified**: 2/7 (29%)  
**Controllers Complete**: 2/7 (29%)  
**Controllers Need Enhancement**: 2/7 (29%)  
**Controllers Missing**: 2/7 (29%)  
**Frontend Audits**: 0/2 (0%)

**Overall Phase 3.1 Progress**: 22% (2/9 tasks complete)
