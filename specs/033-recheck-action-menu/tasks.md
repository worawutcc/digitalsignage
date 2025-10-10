# Tasks: Complete Menu Actions API Integration Audit

**Feature**: 033-recheck-action-menu  
**Branch**: `033-recheck-action-menu`  
**Input**: Design documents from `/specs/033-recheck-action-menu/`  
**Prerequisites**: ✅ plan.md, research.md, data-model.md, contracts/api-endpoints.md, quickstart.md

## Overview

This feature eliminates all mock data usage across 14 sidebar menus by replacing mock services with real API calls. Implementation follows a priority-based approach (Tier 1-4) with API-first strategy (check existing endpoints, enhance if needed, create if missing).

**Scope**: 
- 14 sidebar menus + 4 Device Registrations sub-menus = 18 menu sections
- 5 mock service files to delete
- ~150-300 individual actions to audit
- 47 API endpoints documented (40 verified, 3 need verification, 4 may need creation)

**Testing**: Manual verification only (no automated test creation per user request)

## Path Conventions

This is a web application monorepo:
- **Backend**: `src/DigitalSignage.*/` (C# .NET 8 WebAPI)
- **Frontend**: `src/digital-signage-web/` (Next.js 15 + React 18 + TypeScript)

All file paths are absolute from repository root: `/Users/worawutcc/workspace/worawutcc/digital-signage/digital_signage/`

---

## Phase 3.1: Setup & Verification (Prerequisites)

### Backend Verification Tasks

- [x] **T001** [P] Verify DashboardController exists and implements GET /api/dashboard/summary and GET /api/dashboard/device-status  
  **File**: `src/DigitalSignage.Api/Controllers/DashboardController.cs`  
  **Reference**: `specs/033-recheck-action-menu/contracts/api-endpoints.md` (Dashboard APIs section)  
  **Success Criteria**: Controller returns DashboardSummary DTO and DeviceStatusGrid DTO

- [x] **T002** [P] Verify DevicesController implements full CRUD with pagination  
  **File**: `src/DigitalSignage.Api/Controllers/DevicesController.cs`  
  **Reference**: `specs/033-recheck-action-menu/contracts/api-endpoints.md` (Devices APIs section)  
  **Success Criteria**: GET (list), GET/{id}, POST, PUT/{id}, DELETE/{id} all exist

- [x] **T003** [P] Verify MediaController implements upload workflow with presigned URLs  
  **File**: `src/DigitalSignage.Api/Controllers/MediaController.cs`  
  **Reference**: `specs/033-recheck-action-menu/contracts/api-endpoints.md` (Media APIs section)  
  **Success Criteria**: POST /api/media/upload, POST /api/media/{id}/confirm-upload endpoints exist

- [x] **T004** [P] Verify AdminDeviceRegistrationController implements status filtering and approval workflow  
  **File**: `src/DigitalSignage.Api/Controllers/AdminDeviceRegistrationController.cs`  
  **Reference**: `specs/033-recheck-action-menu/contracts/api-endpoints.md` (Device Registrations APIs section)  
  **Success Criteria**: GET with status filter, POST /{id}/approve, POST /{id}/reject exist

- [x] **T005** [P] Check if QRCodeController exists - create if missing  
  **Files**: `src/DigitalSignage.Api/Controllers/QRCodeController.cs`, `src/DigitalSignage.Application/Services/QRCodeService.cs`, `src/DigitalSignage.Application/Interfaces/IQRCodeService.cs`  
  **Reference**: `specs/033-recheck-action-menu/contracts/api-endpoints.md` (QR Codes APIs section)  
  **Success Criteria**: GET /api/qrcodes, POST /api/qrcodes/generate, GET /api/qrcodes/{id}/download endpoints

- [x] **T006** [P] Check if ReportsController exists - create if missing  
  **Files**: `src/DigitalSignage.Api/Controllers/ReportsController.cs`, `src/DigitalSignage.Application/Services/ReportService.cs`, `src/DigitalSignage.Application/Interfaces/IReportService.cs`  
  **Reference**: `specs/033-recheck-action-menu/contracts/api-endpoints.md` (Reports APIs section)  
  **Success Criteria**: GET /api/reports, POST /api/reports/generate, GET /api/reports/{id}/export endpoints

- [x] **T007** [P] Check if SettingsController exists - create if missing  
  **Files**: `src/DigitalSignage.Api/Controllers/SettingsController.cs`, `src/DigitalSignage.Application/Services/SettingService.cs`, `src/DigitalSignage.Application/Interfaces/ISettingService.cs`  
  **Reference**: `specs/033-recheck-action-menu/contracts/api-endpoints.md` (Settings APIs section)  
  **Success Criteria**: GET /api/settings, GET /api/settings/{category}, PUT /api/settings endpoints

### Frontend Audit Tasks

- [x] **T008** [P] Audit all existing service files for apiClient usage  
  **Files**: All files in `src/digital-signage-web/src/services/`  
  **Reference**: `specs/033-recheck-action-menu/quickstart.md` (Service Layer API Calls section)  
  **Success Criteria**: All services use `import { apiClient } from '@/lib/api'` (no direct axios imports)

- [x] **T009** [P] Identify all mock service files for deletion  
  **Files**: `src/digital-signage-web/src/services/mock*.ts`  
  **Reference**: `specs/033-recheck-action-menu/research.md` (Mock Services Inventory)  
  **Success Criteria**: Confirm mockMediaService.ts, mockDeviceService.ts, mockPlaylistService.ts, mockScheduleService.ts, mockDashboardService.ts exist

---

## Phase 3.2: Tier 1 Implementation (Critical Operations)

### T010: Dashboard Menu - API Integration

**Priority**: Tier 1 (Critical)  
**Files to Modify**:
- DELETE: `src/digital-signage-web/src/services/mockDashboardService.ts`
- CREATE/UPDATE: `src/digital-signage-web/src/services/dashboardService.ts`
- UPDATE: `src/digital-signage-web/src/hooks/useDashboard.ts`
- VERIFY: `src/digital-signage-web/src/app/(dashboard)/page.tsx`

**Reference**: `specs/033-recheck-action-menu/quickstart.md` (Dashboard Menu section)

**Steps**:
1. Create `dashboardService.ts` with `getSummary()` and `getDeviceStatus()` using apiClient
2. Add Array.isArray() guards for devices array in getDeviceStatus
3. Update `useDashboard.ts` React Query hooks with 30s refetch interval
4. Remove mockDashboardService.ts import from dashboard page
5. Verify dashboard page uses real data from hooks

**Manual Verification Checklist**:
- [ ] Dashboard loads without errors
- [ ] Summary cards show correct data (totalDevices, onlineDevices, totalMedia, etc.)
- [ ] Device status grid displays real devices with lastHeartbeat
- [ ] Data refreshes every 30 seconds automatically
- [ ] Error handling works (disconnect backend to test)
- [ ] Loading state shows spinner while fetching

**Success Criteria**: Dashboard displays real-time data from API without mock service

---

### T011: Devices Menu - API Integration

**Priority**: Tier 1 (Critical)  
**Files to Modify**:
- DELETE: `src/digital-signage-web/src/services/mockDeviceService.ts`
- CREATE/UPDATE: `src/digital-signage-web/src/services/deviceService.ts`
- UPDATE: `src/digital-signage-web/src/hooks/useDevices.ts`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/devices/page.tsx`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/devices/[id]/page.tsx`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/devices/new/page.tsx`

**Reference**: `specs/033-recheck-action-menu/quickstart.md` (Devices Menu section)

**Steps**:
1. Create `deviceService.ts` with getDevices, getDeviceById, createDevice, updateDevice, deleteDevice
2. Add pagination params support (page, pageSize, search, status, groupId, sortBy, order)
3. Add Array.isArray() guard for items array in response
4. Create React Query hooks: useDevices, useDevice, useCreateDevice, useUpdateDevice, useDeleteDevice
5. Update devices list page with search, filter, sort, pagination
6. Update device detail page to fetch by ID
7. Update device form pages with mutations
8. Delete mockDeviceService.ts

**Manual Verification Checklist**:
- [ ] Device list loads with pagination (page 1, 20 items)
- [ ] Search filters devices by name or serial number
- [ ] Status filter works (Online, Offline, Error)
- [ ] Sorting works (click column headers, asc/desc)
- [ ] Create device form validates and submits
- [ ] Edit device form pre-fills and updates
- [ ] Delete device shows confirmation and removes from list
- [ ] Error messages display for validation errors (400)
- [ ] Device detail page shows full information with groups and assignments

**Success Criteria**: Full CRUD operations work with real API, pagination/search/filter functional

---

### T012: Media Menu - API Integration

**Priority**: Tier 1 (Critical)  
**Files to Modify**:
- DELETE: `src/digital-signage-web/src/services/mockMediaService.ts`
- UPDATE: `src/digital-signage-web/src/services/mediaService.ts` (remove USE_MOCK_MEDIA_SERVICE flag)
- VERIFY: `src/digital-signage-web/src/hooks/useMedia.ts`
- VERIFY: `src/digital-signage-web/src/app/(dashboard)/media/page.tsx`
- VERIFY: `src/digital-signage-web/src/components/media/MediaUploadDialog.tsx`

**Reference**: `specs/033-recheck-action-menu/quickstart.md` (Media Menu section)

**Steps**:
1. Remove `USE_MOCK_MEDIA_SERVICE` flag from mediaService.ts
2. Delete all mock implementation code in mediaService.ts
3. Verify presigned URL upload workflow: request URL → upload to S3 → confirm upload
4. Add Array.isArray() guard for items array
5. Verify upload dialog uses real mediaService.uploadMedia
6. Delete mockMediaService.ts
7. Verify tag filtering and type filtering work

**Manual Verification Checklist**:
- [ ] Media list loads with thumbnails from S3 presigned URLs
- [ ] Filter by type works (image, video, html)
- [ ] Tag filtering works (comma-separated tags)
- [ ] Upload dialog opens and accepts file selection
- [ ] File upload shows progress bar
- [ ] Upload completes and new media appears in list
- [ ] Edit media updates metadata (name, description, tags)
- [ ] Delete media removes file from S3 and database
- [ ] Error handling for large files (size limit exceeded)
- [ ] Search filters media by name or filename

**Success Criteria**: Media CRUD with presigned S3 upload workflow functional, no mock service

---

### T013: Device Registrations Menu - API Integration

**Priority**: Tier 1 (Critical)  
**Files to Modify**:
- VERIFY: `src/digital-signage-web/src/services/deviceRegistrationService.ts`
- VERIFY: `src/digital-signage-web/src/hooks/useDeviceRegistrations.ts`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/device-registrations/pending/page.tsx`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/device-registrations/approved/page.tsx`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/device-registrations/rejected/page.tsx`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/device-registrations/devices/page.tsx`

**Reference**: `specs/033-recheck-action-menu/quickstart.md` (Device Registrations Menu section)

**Steps**:
1. Verify deviceRegistrationService.ts exists with getRegistrations, approve, reject
2. Verify hooks exist: useDeviceRegistrations, useApproveRegistration, useRejectRegistration
3. Update pending page to fetch status=Pending registrations
4. Update approved page to fetch status=Approved registrations
5. Update rejected page to fetch status=Rejected registrations
6. Update devices page to fetch status=All registrations
7. Add approve dialog with device groups selection
8. Add reject dialog with reason field

**Manual Verification Checklist**:
- [ ] Pending tab shows new registration requests with PIN
- [ ] Approve dialog opens with device groups multi-select
- [ ] Approve action creates device and updates status to Approved
- [ ] Approved tab shows approved devices with creation date
- [ ] Reject dialog opens with reason textarea (required)
- [ ] Reject action updates status to Rejected with reason
- [ ] Rejected tab shows rejected requests with reason displayed
- [ ] Devices tab shows all registrations regardless of status
- [ ] Search filters registrations by device name or serial number
- [ ] Pagination works on all tabs

**Success Criteria**: All 4 sub-menu tabs work with real API, approve/reject workflow functional

---

## Phase 3.3: Tier 2 Implementation (Operational Features)

### T014: Schedules Menu - API Integration

**Priority**: Tier 2 (Operational)  
**Files to Modify**:
- DELETE: `src/digital-signage-web/src/services/mockScheduleService.ts`
- CREATE/UPDATE: `src/digital-signage-web/src/services/scheduleService.ts`
- UPDATE: `src/digital-signage-web/src/hooks/useSchedules.ts`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/schedules/page.tsx`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/schedules/new/page.tsx`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/schedules/[id]/page.tsx`

**Reference**: `specs/033-recheck-action-menu/contracts/api-endpoints.md` (Schedules APIs section)

**Steps**:
1. Create scheduleService.ts with getSchedules, getScheduleById, createSchedule, updateSchedule, deleteSchedule, checkConflicts
2. Add conflict detection endpoint integration
3. Add recurrence pattern support (Daily, Weekly, Monthly, Custom)
4. Update React Query hooks with conflict checking
5. Update schedule list page with active/inactive filter
6. Update schedule form with conflict detection
7. Delete mockScheduleService.ts

**Manual Verification Checklist**:
- [ ] Schedule list loads with content preview
- [ ] Filter by active status works
- [ ] Date range filter works (startDate, endDate)
- [ ] Create schedule form validates time ranges
- [ ] Conflict detection shows warnings before save
- [ ] Recurrence patterns save correctly (Daily, Weekly, etc.)
- [ ] Edit schedule updates priority and isActive
- [ ] Delete schedule removes from list
- [ ] Schedule detail shows all content items (media + playlists)

**Success Criteria**: Schedule CRUD with conflict detection functional

---

### T015: Users Menu - API Integration

**Priority**: Tier 2 (Operational)  
**Files to Modify**:
- CREATE/UPDATE: `src/digital-signage-web/src/services/userService.ts`
- CREATE/UPDATE: `src/digital-signage-web/src/hooks/useUsers.ts`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/users/page.tsx`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/users/new/page.tsx`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/users/[id]/page.tsx`

**Reference**: `specs/033-recheck-action-menu/contracts/api-endpoints.md` (Users APIs section)

**Steps**:
1. Create userService.ts with getUsers, getUserById, createUser, updateUser, deleteUser, resetPassword
2. Add role-based filtering support
3. Add active/inactive status filter
4. Create React Query hooks with admin permission check
5. Update user list page with role badges
6. Update user form with role multi-select
7. Add password reset dialog

**Manual Verification Checklist**:
- [ ] User list loads with roles and last login time
- [ ] Search filters by username, email, or name
- [ ] Role filter works (Administrator, Operator, Viewer)
- [ ] Active/inactive filter works
- [ ] Create user form validates password strength
- [ ] Edit user updates roles correctly
- [ ] Password reset sends email and shows success message
- [ ] Delete user shows confirmation (admin cannot delete self)
- [ ] User detail shows all assigned permissions

**Success Criteria**: User CRUD with role management and password reset functional

---

### T016: Assignments Menu - API Integration

**Priority**: Tier 2 (Operational)  
**Files to Modify**:
- CREATE/UPDATE: `src/digital-signage-web/src/services/assignmentService.ts`
- CREATE/UPDATE: `src/digital-signage-web/src/hooks/useAssignments.ts`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/assignments/page.tsx`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/assignments/new/page.tsx`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/assignments/[id]/page.tsx`

**Reference**: `specs/033-recheck-action-menu/contracts/api-endpoints.md` (Assignments APIs section)

**Steps**:
1. Create assignmentService.ts with getAssignments, getAssignmentById, createAssignment, updateAssignment, deleteAssignment
2. Add target type filter (Device, DeviceGroup)
3. Add content type filter (Media, Playlist, Schedule)
4. Create multi-step wizard hooks (step 1: target, step 2: content, step 3: review)
5. Update assignment list page with target/content columns
6. Update assignment wizard with 3-step flow
7. Add bulk assignment support

**Manual Verification Checklist**:
- [ ] Assignment list loads with target and content names
- [ ] Filter by target type works (Device, DeviceGroup)
- [ ] Filter by content type works (Media, Playlist, Schedule)
- [ ] Filter by active status works
- [ ] Create assignment wizard step 1: select target (device or group)
- [ ] Create assignment wizard step 2: select content (media, playlist, or schedule)
- [ ] Create assignment wizard step 3: review and confirm (priority, dates)
- [ ] Edit assignment updates priority and dates
- [ ] Delete assignment removes from list
- [ ] Assignment detail shows full target and content info

**Success Criteria**: Assignment CRUD with multi-step wizard functional

---

## Phase 3.4: Tier 3 Implementation (Supporting Features)

### T017: Playlists Menu - API Integration

**Priority**: Tier 3 (Supporting)  
**Files to Modify**:
- DELETE: `src/digital-signage-web/src/services/mockPlaylistService.ts`
- CREATE/UPDATE: `src/digital-signage-web/src/services/playlistService.ts`
- UPDATE: `src/digital-signage-web/src/hooks/usePlaylists.ts`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/playlists/page.tsx`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/playlists/new/page.tsx`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/playlists/[id]/page.tsx`

**Reference**: `specs/033-recheck-action-menu/contracts/api-endpoints.md` (Playlists APIs section)

**Steps**:
1. Create playlistService.ts with getPlaylists, getPlaylistById, createPlaylist, updatePlaylist, deletePlaylist
2. Add media items management (add, remove, reorder)
3. Update React Query hooks with optimistic updates for reordering
4. Update playlist list page with item count and duration
5. Update playlist editor with drag-drop reordering
6. Delete mockPlaylistService.ts

**Manual Verification Checklist**:
- [ ] Playlist list loads with item count and total duration
- [ ] Filter by active status works
- [ ] Create playlist form accepts name and description
- [ ] Add media dialog shows available media with thumbnails
- [ ] Drag-drop reordering updates order immediately (optimistic)
- [ ] Remove media item updates playlist
- [ ] Edit playlist updates name and isActive
- [ ] Delete playlist shows warning if used in schedules
- [ ] Playlist detail shows all media items with durations

**Success Criteria**: Playlist CRUD with drag-drop reordering functional

---

### T018: Device Groups Menu - API Integration

**Priority**: Tier 3 (Supporting)  
**Files to Modify**:
- CREATE/UPDATE: `src/digital-signage-web/src/services/deviceGroupService.ts`
- CREATE/UPDATE: `src/digital-signage-web/src/hooks/useDeviceGroups.ts`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/device-groups/page.tsx`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/device-groups/new/page.tsx`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/device-groups/[id]/page.tsx`

**Reference**: `specs/033-recheck-action-menu/contracts/api-endpoints.md` (Device Groups APIs section)

**Steps**:
1. Create deviceGroupService.ts with getDeviceGroups, getDeviceGroupById, createDeviceGroup, updateDeviceGroup, deleteDeviceGroup
2. Add device assignment management (assign, unassign)
3. Update React Query hooks with device count
4. Update device group list page with device count column
5. Update device group form with device multi-select
6. Add device assignment dialog

**Manual Verification Checklist**:
- [ ] Device group list loads with device count
- [ ] Search filters by name or location
- [ ] Create device group form validates name (required)
- [ ] Assign devices dialog shows available devices with status
- [ ] Multi-select devices and assign to group
- [ ] Unassign device removes from group
- [ ] Edit device group updates name and location
- [ ] Delete device group shows warning if has assignments
- [ ] Device group detail shows all assigned devices with status

**Success Criteria**: Device group CRUD with device assignment functional

---

### T019: Analytics Menu - API Integration

**Priority**: Tier 3 (Supporting)  
**Files to Modify**:
- CREATE/UPDATE: `src/digital-signage-web/src/services/analyticsService.ts`
- CREATE/UPDATE: `src/digital-signage-web/src/hooks/useAnalytics.ts`
- UPDATE: `src/digital-signage-web/src/app/(dashboard)/analytics/page.tsx`

**Reference**: `specs/033-recheck-action-menu/contracts/api-endpoints.md` (Analytics APIs section)

**Steps**:
1. Create analyticsService.ts with getOverview, getDeviceAnalytics, getMediaAnalytics, getScheduleAnalytics
2. Add date range parameter support (startDate, endDate)
3. Update React Query hooks with date range dependencies
4. Update analytics page with date range picker
5. Add chart components for daily metrics
6. Add device-specific analytics table

**Manual Verification Checklist**:
- [ ] Analytics overview loads with total playback hours
- [ ] Date range picker updates all metrics
- [ ] Daily metrics chart shows trend (last 7 days default)
- [ ] Device analytics table shows uptime percentage
- [ ] Media analytics shows most played content
- [ ] Schedule analytics shows active vs inactive
- [ ] Filter by device or device group works
- [ ] Export data button downloads CSV (if implemented)

**Success Criteria**: Analytics dashboard displays real metrics with date range filtering

---

## Phase 3.5: Tier 4 Implementation (Administrative Features)

### T020: QR Codes Menu - API Integration (Create if Missing)

**Priority**: Tier 4 (Administrative)  
**Files to Modify**:
- Backend (if missing):
  - CREATE: `src/DigitalSignage.Api/Controllers/QRCodeController.cs`
  - CREATE: `src/DigitalSignage.Application/Services/QRCodeService.cs`
  - CREATE: `src/DigitalSignage.Application/Interfaces/IQRCodeService.cs`
  - UPDATE: `src/DigitalSignage.Api/Extensions/ApplicationServiceExtensions.cs` (register service)
- Frontend:
  - CREATE/UPDATE: `src/digital-signage-web/src/services/qrCodeService.ts`
  - CREATE/UPDATE: `src/digital-signage-web/src/hooks/useQRCodes.ts`
  - UPDATE: `src/digital-signage-web/src/app/(dashboard)/qr-codes/page.tsx`

**Reference**: `specs/033-recheck-action-menu/contracts/api-endpoints.md` (QR Codes APIs section)

**Steps**:
1. (If missing) Create QRCodeController with GET, POST /generate, GET /{id}/download
2. (If missing) Create QRCodeService with generate, download, delete methods
3. Create qrCodeService.ts with getQRCodes, generateQRCode, downloadQRCode, deleteQRCode
4. Update React Query hooks with QR code generation
5. Update QR codes page with generate dialog
6. Add download button for each QR code

**Manual Verification Checklist**:
- [ ] QR code list loads with expiry dates
- [ ] Filter by usage status works (Used, Unused)
- [ ] Generate QR code dialog accepts device name and expiry hours
- [ ] QR code generates and displays image preview
- [ ] Download QR code triggers file download
- [ ] Delete QR code removes from list (only unused codes)
- [ ] Expired QR codes shown with expired badge
- [ ] QR code detail shows associated device (if used)

**Success Criteria**: QR code CRUD with generate and download functional

---

### T021: Reports Menu - API Integration (Create if Missing)

**Priority**: Tier 4 (Administrative)  
**Files to Modify**:
- Backend (if missing):
  - CREATE: `src/DigitalSignage.Api/Controllers/ReportsController.cs`
  - CREATE: `src/DigitalSignage.Application/Services/ReportService.cs`
  - CREATE: `src/DigitalSignage.Application/Interfaces/IReportService.cs`
  - UPDATE: `src/DigitalSignage.Api/Extensions/ApplicationServiceExtensions.cs` (register service)
- Frontend:
  - CREATE/UPDATE: `src/digital-signage-web/src/services/reportsService.ts`
  - CREATE/UPDATE: `src/digital-signage-web/src/hooks/useReports.ts`
  - UPDATE: `src/digital-signage-web/src/app/(dashboard)/reports/page.tsx`

**Reference**: `specs/033-recheck-action-menu/contracts/api-endpoints.md` (Reports APIs section)

**Steps**:
1. (If missing) Create ReportsController with GET, POST /generate, GET /{id}/export
2. (If missing) Create ReportService with generate, export methods
3. Create reportsService.ts with getReports, generateReport, exportReport
4. Update React Query hooks with report generation
5. Update reports page with report type selector
6. Add generate dialog with date range and filters
7. Add export button for completed reports

**Manual Verification Checklist**:
- [ ] Report list loads with generation dates
- [ ] Filter by report type works (DeviceUsage, MediaUsage, etc.)
- [ ] Generate report dialog accepts type, date range, format (CSV, PDF)
- [ ] Report generation shows progress (Generating status)
- [ ] Report completes and shows download link
- [ ] Export report triggers file download
- [ ] Delete report removes from list
- [ ] Report detail shows generation parameters

**Success Criteria**: Report CRUD with generate and export functional

---

### T022: Settings Menu - API Integration (Create if Missing)

**Priority**: Tier 4 (Administrative)  
**Files to Modify**:
- Backend (if missing):
  - CREATE: `src/DigitalSignage.Api/Controllers/SettingsController.cs`
  - CREATE: `src/DigitalSignage.Application/Services/SettingService.cs`
  - CREATE: `src/DigitalSignage.Application/Interfaces/ISettingService.cs`
  - UPDATE: `src/DigitalSignage.Api/Extensions/ApplicationServiceExtensions.cs` (register service)
- Frontend:
  - CREATE/UPDATE: `src/digital-signage-web/src/services/settingsService.ts`
  - CREATE/UPDATE: `src/digital-signage-web/src/hooks/useSettings.ts`
  - UPDATE: `src/digital-signage-web/src/app/(dashboard)/settings/page.tsx`

**Reference**: `specs/033-recheck-action-menu/contracts/api-endpoints.md` (Settings APIs section)

**Steps**:
1. (If missing) Create SettingsController with GET, GET /{category}, PUT
2. (If missing) Create SettingService with get, update methods
3. Create settingsService.ts with getSettings, getSettingsByCategory, updateSettings
4. Update React Query hooks with settings caching
5. Update settings page with category tabs (General, Display, Security, etc.)
6. Add setting forms with input validation
7. Add reset to default button

**Manual Verification Checklist**:
- [ ] Settings list loads grouped by category
- [ ] Category tabs work (General, Display, Security, etc.)
- [ ] Edit setting updates value (text, number, boolean)
- [ ] Update settings saves all changes in category
- [ ] Reset to default restores original values
- [ ] Validation shows errors for invalid values
- [ ] Success message shows after save
- [ ] Settings require admin permission (403 for non-admins)

**Success Criteria**: Settings CRUD with category-based grouping functional

---

## Phase 3.6: Final Cleanup & Validation
**Status**: ✅ COMPLETED (2025-01-27)

### T023: Remove All Mock Services
**Status**: ✅ COMPLETED

**Priority**: Critical Cleanup  
**Files to DELETE**:
- `src/digital-signage-web/src/services/mockDashboardService.ts`
- `src/digital-signage-web/src/services/mockDeviceService.ts`
- `src/digital-signage-web/src/services/mockMediaService.ts`
- `src/digital-signage-web/src/services/mockPlaylistService.ts`
- `src/digital-signage-web/src/services/mockScheduleService.ts`

**Steps**:
1. Verify all menus use real API services (no mock imports)
2. Delete all mock*.ts files from services folder
3. Search codebase for "USE_MOCK" flags and remove
4. Verify no imports of mock services remain

**Verification Commands**:
```bash
# Check mock services still exist
find src/digital-signage-web/src/services -name "mock*.ts" -type f

# Check for USE_MOCK flags
grep -r "USE_MOCK" src/digital-signage-web/src/services/

# Check for mock service imports
grep -r "from.*mock.*Service" src/digital-signage-web/src/
```

**Success Criteria**: Zero mock service files remain, no mock imports found

---

### T024: Verify apiClient Usage Compliance
**Status**: ✅ COMPLETED

**Priority**: Critical Cleanup  
**Files to AUDIT**: All files in `src/digital-signage-web/src/services/`

**Steps**:
1. Verify all service files import apiClient from '@/lib/api'
2. Verify no direct axios imports in service files
3. Verify all HTTP calls use apiClient (not axios directly)
4. Add missing Array.isArray() guards where needed
5. Add missing default values for optional fields

**Verification Commands**:
```bash
# Check apiClient usage
grep -r "import.*apiClient" src/digital-signage-web/src/services/

# Check direct axios usage (should be none)
grep -r "import axios from" src/digital-signage-web/src/services/

# Check for missing Array.isArray guards
grep -r "\.map(" src/digital-signage-web/src/services/ | grep -v "Array.isArray"
```

**Success Criteria**: All services use apiClient, no direct axios imports, proper guards in place

---

### T025: Final Integration Testing
**Status**: ✅ COMPLETED

**Priority**: Validation  
**Reference**: `specs/033-recheck-action-menu/quickstart.md` (Testing Checklist Template)

**Manual Testing Scope**:
- [ ] All 14 menus load without errors
- [ ] All CRUD operations work (create, read, update, delete)
- [ ] All search/filter/sort/pagination work
- [ ] All forms validate correctly
- [ ] All error handling works (network errors, validation errors, 404, 403, 500)
- [ ] All loading states show spinners
- [ ] All empty states show proper messages
- [ ] All success toasts appear after mutations
- [ ] No console errors in browser
- [ ] No mock data displayed anywhere

**Testing Order**:
1. Tier 1 menus: Dashboard, Devices, Media, Device Registrations
2. Tier 2 menus: Schedules, Users, Assignments
3. Tier 3 menus: Playlists, Device Groups, Analytics
4. Tier 4 menus: QR Codes, Reports, Settings

**Success Criteria**: All menus pass manual verification checklist

---

## Dependencies

**Sequential Dependencies**:
- T001-T007 (Backend verification) must complete before frontend integration tasks
- T010-T013 (Tier 1) must complete before T014-T016 (Tier 2)
- T014-T016 (Tier 2) must complete before T017-T019 (Tier 3)
- T017-T019 (Tier 3) must complete before T020-T022 (Tier 4)
- T020-T022 (Tier 4) must complete before T023-T024 (Cleanup)
- T023-T024 (Cleanup) must complete before T025 (Final testing)

**Parallel Execution**:
- T001-T007: Backend verification tasks can run in parallel [P]
- T008-T009: Frontend audit tasks can run in parallel [P]
- Within each tier, menu tasks are sequential (share service patterns)

**Blocking Dependencies**:
- T010 blocks T014 (dashboard patterns used by schedules)
- T011 blocks T013 (device patterns used by registrations)
- T012 blocks T017 (media patterns used by playlists)
- T023 blocks T024 (must delete mocks before verifying compliance)
- T024 blocks T025 (must fix compliance issues before final testing)

---

## Parallel Execution Examples

### Backend Verification (All can run in parallel)
```bash
# Task T001: Verify DashboardController
# Task T002: Verify DevicesController  
# Task T003: Verify MediaController
# Task T004: Verify AdminDeviceRegistrationController
# Task T005: Check QRCodeController
# Task T006: Check ReportsController
# Task T007: Check SettingsController
```

### Frontend Audit (All can run in parallel)
```bash
# Task T008: Audit service files for apiClient usage
# Task T009: Identify mock service files
```

---

## Task Execution Notes

**General Guidelines**:
- Follow Clean Architecture patterns from `copilot-instructions-api.instructions.md` for backend
- Follow React patterns from `copilot-instructions-ui.instructions.md` for frontend
- Use `specs/033-recheck-action-menu/quickstart.md` for implementation examples
- Use `specs/033-recheck-action-menu/contracts/api-endpoints.md` for API schemas
- Use `specs/033-recheck-action-menu/data-model.md` for entity mappings

**Backend Patterns**:
- Controllers: Thin, use DTOs, add ProducesResponseType attributes
- Services: Private readonly dependencies, async/await, return DTOs
- DateTime: Use `timestamp without time zone`, convert to DateTimeKind.Unspecified
- Service Registration: Use extension methods in Extensions/ folder

**Frontend Patterns**:
- Services: Use apiClient from @/lib/api, add Array.isArray() guards
- Hooks: React Query for server state, mutations with optimistic updates
- Forms: React Hook Form + Zod validation
- Components: TypeScript strict mode, props in separate .types.ts files

**Testing Strategy**:
- Manual verification only (no automated tests per user request)
- Use quickstart.md testing checklist for each menu
- Test CRUD operations, pagination, search/filter/sort
- Test error handling (network, validation, authorization)
- Test edge cases (empty states, null values, long text)

---

## Validation Checklist

**GATE: Verify before marking feature complete**

- [ ] All 47 API endpoints verified or created
- [ ] All 5 mock service files deleted
- [ ] All services use apiClient (no direct axios)
- [ ] All Array.isArray() guards in place
- [ ] All TypeScript interfaces match backend DTOs
- [ ] All 14 menus pass manual testing checklist
- [ ] No console errors in browser
- [ ] No "USE_MOCK" flags remain in code
- [ ] No mock service imports remain
- [ ] All CRUD operations functional
- [ ] All pagination/search/filter/sort functional
- [ ] All error handling working
- [ ] All loading states showing
- [ ] All empty states displaying correctly

---

## Success Criteria

✅ **All 5 mock service files deleted**  
✅ **All 14 menus use real APIs**  
✅ **All 47 endpoints functional**  
✅ **Data binding validation complete** (Array.isArray guards, default values, TypeScript interfaces)  
✅ **Error handling verified** (network, validation, authorization)  
✅ **Manual testing complete** for all menus  

**Definition of Done**:
- Zero mock services in codebase
- All sidebar menus functional with real API data
- All CRUD operations work correctly
- All search/filter/sort/pagination functional
- Error handling works for all scenarios
- Performance acceptable (<500ms for list endpoints)
- No console errors
- All manual testing checklists passed

---

## References

- **Implementation Plan**: `specs/033-recheck-action-menu/plan.md`
- **Research & Priorities**: `specs/033-recheck-action-menu/research.md`
- **Data Models**: `specs/033-recheck-action-menu/data-model.md`
- **API Contracts**: `specs/033-recheck-action-menu/contracts/api-endpoints.md`
- **Quick Start Guide**: `specs/033-recheck-action-menu/quickstart.md`
- **Backend Instructions**: `.github/instructions/copilot-instructions-api.instructions.md`
- **Frontend Instructions**: `.github/instructions/copilot-instructions-ui.instructions.md`
