# Service File Domain Grouping

**Generated**: 2025-01-10  
**Total Service Files**: 31  
**Total API Calls**: 193  
**Total Backend Controllers**: 31

## Domain Organization

### 1. Authentication & User Management (Auth Domain)
**Service Files** (4):
- `api/authService.ts` → **AuthController.cs**
- `api/userService.ts` → **UsersController.cs**
- `api/userPermissionService.ts` → **UserPermissionController.cs**, **AdminPermissionController.cs**
- `userService.ts` → **UsersController.cs**

**API Patterns**: JWT auth, user CRUD, permission management

---

### 2. Content Management (Content Domain)
**Service Files** (8):
- `mediaService.ts` → **MediaController.cs**
- `enhancedMediaService.ts` → **MediaController.cs**
- `tagService.ts` → **MediaController.cs** (tags endpoints)
- `api/mediaApi.ts` → **MediaController.cs**
- `playlistService.ts` → **PlaylistController.cs**
- `sceneService.ts` → **SceneController.cs**
- `scheduleService.ts` → **ScheduleController.cs**
- `userScheduleService.ts` → **UserScheduleController.cs**

**Related Controllers**:
- BulkAssignmentController.cs
- OptimizedContentController.cs
- QRCodeController.cs

**API Patterns**: Media upload/download, playlist management, scheduling

---

### 3. Device Management (Devices Domain)
**Service Files** (7):
- `deviceService.ts` → **DeviceController.cs**, **DevicesController.cs**
- `deviceDetailService.ts` → **DeviceController.cs**
- `deviceGroupService.ts` → **DeviceGroupController.cs**
- `deviceHealthService.ts` → **DeviceStatusController.cs**
- `deviceHardwareProfileService.ts` → **DeviceHardwareProfileController.cs**
- `hardwareDetectionService.ts` → **HardwareDetectionAdminController.cs**
- `userDeviceAssociationService.ts` → **UserDeviceAssociationController.cs**

**Related Controllers**:
- AdminDeviceRegistrationController.cs
- DeviceRegistrationController.cs
- DeviceConfigurationController.cs
- BulkOperationsController.cs

**API Patterns**: Device provisioning, heartbeat, hardware detection, grouping

---

### 4. Analytics & Reporting (Analytics Domain)
**Service Files** (7):
- `analyticsService.ts` → **AnalyticsController.cs**
- `dashboardService.ts` → **DashboardController.cs**
- `reportsService.ts` → **ReportsController.cs**
- `conflictService.ts` → **ScheduleConflictsController.cs**
- `api/scheduleApi.ts` → **ScheduleController.cs** (analytics endpoints)
- `api/userApi.ts` → **UsersController.cs** (user analytics)
- `settingsService.ts` → **SettingsController.cs**

**Related Controllers**:
- AssignmentAnalyticsController.cs
- AssignmentController.cs

**API Patterns**: Statistics, charts, reports, conflict detection

---

### 5. API Helpers & Utilities (API Helpers Domain)
**Service Files** (4):
- `deviceApi.ts` → Multiple device controllers
- `bulkOperationService.ts` → **BulkOperationsController.cs**
- `optimizedContentService.ts` → **OptimizedContentController.cs**
- `qrCodeService.ts` → **QRCodeController.cs**

**Special**:
- `index.ts` → Service exports (no API calls)

**API Patterns**: Bulk operations, optimizations, QR code generation

---

## Service File Inventory

| # | Service File | Domain | Backend Controller(s) | Est. API Calls |
|---|--------------|--------|----------------------|----------------|
| 1 | api/authService.ts | Auth | AuthController | ~8 |
| 2 | api/userService.ts | Auth | UsersController | ~10 |
| 3 | api/userPermissionService.ts | Auth | UserPermissionController, AdminPermissionController | ~6 |
| 4 | userService.ts | Auth | UsersController | ~5 |
| 5 | mediaService.ts | Content | MediaController | ~15 |
| 6 | enhancedMediaService.ts | Content | MediaController | ~12 |
| 7 | tagService.ts | Content | MediaController | ~8 |
| 8 | api/mediaApi.ts | Content | MediaController | ~10 |
| 9 | playlistService.ts | Content | PlaylistController | ~10 |
| 10 | sceneService.ts | Content | SceneController | ~8 |
| 11 | scheduleService.ts | Content | ScheduleController | ~12 |
| 12 | userScheduleService.ts | Content | UserScheduleController | ~10 |
| 13 | deviceService.ts | Devices | DeviceController, DevicesController | ~15 |
| 14 | deviceDetailService.ts | Devices | DeviceController | ~8 |
| 15 | deviceGroupService.ts | Devices | DeviceGroupController | ~10 |
| 16 | deviceHealthService.ts | Devices | DeviceStatusController | ~6 |
| 17 | deviceHardwareProfileService.ts | Devices | DeviceHardwareProfileController | ~8 |
| 18 | hardwareDetectionService.ts | Devices | HardwareDetectionAdminController | ~6 |
| 19 | userDeviceAssociationService.ts | Devices | UserDeviceAssociationController | ~8 |
| 20 | analyticsService.ts | Analytics | AnalyticsController | ~10 |
| 21 | dashboardService.ts | Analytics | DashboardController | ~8 |
| 22 | reportsService.ts | Analytics | ReportsController | ~10 |
| 23 | conflictService.ts | Analytics | ScheduleConflictsController | ~6 |
| 24 | api/scheduleApi.ts | Analytics | ScheduleController | ~8 |
| 25 | api/userApi.ts | Analytics | UsersController | ~5 |
| 26 | settingsService.ts | Analytics | SettingsController | ~6 |
| 27 | deviceApi.ts | API Helpers | Multiple Device Controllers | ~12 |
| 28 | bulkOperationService.ts | API Helpers | BulkOperationsController | ~8 |
| 29 | optimizedContentService.ts | API Helpers | OptimizedContentController | ~6 |
| 30 | qrCodeService.ts | API Helpers | QRCodeController | ~4 |
| 31 | index.ts | N/A | N/A | 0 (exports only) |

**Total Estimated API Calls**: 193 (verified by grep)

---

## Audit Execution Order

### Phase 3.3: Auth Domain (T009-T012)
1. api/authService.ts
2. api/userService.ts
3. api/userPermissionService.ts
4. userService.ts

### Phase 3.4: Content Domain (T013-T020)
1. mediaService.ts
2. enhancedMediaService.ts
3. tagService.ts
4. api/mediaApi.ts
5. playlistService.ts
6. sceneService.ts
7. scheduleService.ts
8. userScheduleService.ts

### Phase 3.5: Devices Domain (T021-T027)
1. deviceService.ts
2. deviceDetailService.ts
3. deviceGroupService.ts
4. deviceHealthService.ts
5. deviceHardwareProfileService.ts
6. hardwareDetectionService.ts
7. userDeviceAssociationService.ts

### Phase 3.6: Analytics Domain (T028-T034)
1. analyticsService.ts
2. dashboardService.ts
3. reportsService.ts
4. conflictService.ts
5. api/scheduleApi.ts
6. api/userApi.ts
7. settingsService.ts

### Phase 3.7: API Helpers (T035-T038)
1. deviceApi.ts
2. bulkOperationService.ts
3. optimizedContentService.ts
4. qrCodeService.ts

**Note**: index.ts excluded from audit (no API calls, only exports)

---

## Backend Controller Reference

### Controllers by Domain

**Auth Domain**:
- AuthController.cs
- UsersController.cs
- UserPermissionController.cs
- AdminPermissionController.cs

**Content Domain**:
- MediaController.cs
- PlaylistController.cs
- SceneController.cs
- ScheduleController.cs
- UserScheduleController.cs
- BulkAssignmentController.cs
- OptimizedContentController.cs
- QRCodeController.cs

**Devices Domain**:
- DeviceController.cs
- DevicesController.cs
- DeviceGroupController.cs
- DeviceStatusController.cs
- DeviceHardwareProfileController.cs
- HardwareDetectionAdminController.cs
- UserDeviceAssociationController.cs
- AdminDeviceRegistrationController.cs
- DeviceRegistrationController.cs
- DeviceConfigurationController.cs
- BulkOperationsController.cs

**Analytics Domain**:
- AnalyticsController.cs
- DashboardController.cs
- ReportsController.cs
- ScheduleConflictsController.cs
- AssignmentAnalyticsController.cs
- AssignmentController.cs
- SettingsController.cs

**API Helpers**:
- ServiceRegistryController.cs (system)

---

**Last Updated**: 2025-01-10 (Phase 3.2 Discovery Complete)  
**Status**: Ready for Phase 3.3 Audit Execution
