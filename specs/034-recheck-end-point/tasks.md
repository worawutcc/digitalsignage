# Tasks: Complete API Endpoint Audit & Request/Response Mapping Verification

**Input**: Design documents from `/specs/034-recheck-end-point/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Execution Flow (main)
```
1. ✅ Load plan.md from feature directory
   → Tech stack: TypeScript/Next.js 15, C# .NET 8
   → Structure: Web application (frontend + backend)
2. ✅ Load optional design documents:
   → data-model.md: 8 entities identified
   → contracts/audit-report-contract.md: Report schema defined
   → research.md: 10 key decisions documented
   → quickstart.md: 10-step execution guide ready
3. ✅ Generate tasks by category:
   → Setup: Environment preparation, tooling
   → Discovery: Scan and enumerate all API calls
   → Audit: Run validation checklist per service
   → Fix: Apply corrections by severity
   → Verification: Test and validate changes
   → Documentation: Generate final report
4. ✅ Apply task rules:
   → Discovery tasks = [P] parallel
   → Audit tasks = [P] parallel within domain
   → Fix tasks = sequential by severity
   → Verification = per domain after fixes
5. ✅ Number tasks sequentially (T001-T048)
6. ✅ Generate dependency graph
7. ✅ Create parallel execution examples
8. ✅ Validate task completeness
9. SUCCESS - Tasks ready for execution
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions
- All paths relative to repository root

---

## Phase 3.1: Setup & Environment Preparation

**Objective**: Prepare environment and initialize audit infrastructure

- [ ] **T001** Verify branch checkout and clean working directory
  - Run: `git checkout 034-recheck-end-point && git status`
  - Expected: On branch 034-recheck-end-point, no uncommitted changes
  - Stash any changes if needed

- [ ] **T002** Install frontend dependencies
  - Run: `cd src/digital-signage-web && npm install`
  - Verify: node_modules exists, no dependency errors

- [ ] **T003** Create audit report file structure
  - Create: `docs/API-ENDPOINT-AUDIT-REPORT.md`
  - Initialize with header from `specs/034-recheck-end-point/contracts/audit-report-contract.md`
  - Add Executive Summary section with placeholder counts

- [ ] **T004** [P] Verify TypeScript configuration
  - Run: `cd src/digital-signage-web && npm run type-check`
  - Expected: Baseline TypeScript errors (if any) documented
  - File: Record baseline error count for comparison

---

## Phase 3.2: Discovery & Inventory

**Objective**: Scan and enumerate all service files and API calls

- [ ] **T005** [P] Generate service file inventory
  - Run: `find src/digital-signage-web/src/services -name "*.ts" -type f | sort > /tmp/service-files.txt`
  - Count: Should find ~31 service files
  - Output: List saved for reference

- [ ] **T006** [P] Count total API calls
  - Run: `grep -r "apiClient\.\(get\|post\|put\|delete\|patch\)" src/digital-signage-web/src/services/ | wc -l`
  - Expected: 100+ API calls
  - Document: Add count to audit report Executive Summary

- [ ] **T007** [P] List backend controller files
  - Run: `find src/DigitalSignage.Api/Controllers -name "*Controller.cs" | sort`
  - Count: Should find 60+ controller files
  - Output: Reference for endpoint verification

- [ ] **T008** [P] Create service file grouping by domain
  - Group files into domains: Auth, Media, Devices, Playlists, Schedules, Analytics, Reports, Settings
  - Create: `docs/SERVICE-FILE-DOMAINS.md` with categorization
  - Purpose: Organize audit workflow by feature area

---

## Phase 3.3: Audit - Auth & Users Domain

**Objective**: Audit authentication and user management services

- [ ] **T009** [P] Audit `api/authService.ts`
  - File: `src/digital-signage-web/src/services/api/authService.ts`
  - Run 7-point checklist on all methods: `register()`, `login()`, `deviceLogin()`, `refreshToken()`, `logout()`
  - Document issues in audit report with severity
  - Verify backend: `AuthController.cs`

- [ ] **T010** [P] Audit `api/userService.ts`
  - File: `src/digital-signage-web/src/services/api/userService.ts`
  - Run checklist on all API methods
  - Check response structure vs `UserController.cs`
  - Document findings

- [ ] **T011** [P] Audit `api/userPermissionService.ts`
  - File: `src/digital-signage-web/src/services/api/userPermissionService.ts`
  - Run checklist on permission-related methods
  - Verify backend: `AdminPermissionController.cs`
  - Document findings

- [ ] **T012** [P] Audit `userService.ts` (duplicate/legacy check)
  - File: `src/digital-signage-web/src/services/userService.ts`
  - Check if duplicate of `api/userService.ts`
  - Document any differences or deprecation notes

---

## Phase 3.4: Audit - Core Content Domain (Media, Playlists, Schedules)

**Objective**: Audit content management services

- [ ] **T013** [P] Audit `mediaService.ts`
  - File: `src/digital-signage-web/src/services/mediaService.ts`
  - Methods: `getMedia()`, `uploadMedia()`, `deleteMedia()`, `getPresignedUrl()`
  - Backend: `MediaController.cs`
  - **Example detailed audit** (reference for other tasks)

- [ ] **T014** [P] Audit `enhancedMediaService.ts`
  - File: `src/digital-signage-web/src/services/enhancedMediaService.ts`
  - Check for duplication with `mediaService.ts`
  - Verify enhanced features follow patterns

- [ ] **T015** [P] Audit `tagService.ts`
  - File: `src/digital-signage-web/src/services/tagService.ts`
  - Backend: Tag-related controller endpoints
  - Document tag CRUD operations

- [ ] **T016** [P] Audit `playlistService.ts`
  - File: `src/digital-signage-web/src/services/playlistService.ts`
  - Backend: `PlaylistController.cs`
  - Check playlist CRUD + scene associations

- [ ] **T017** [P] Audit `sceneService.ts`
  - File: `src/digital-signage-web/src/services/sceneService.ts`
  - Backend: `SceneController.cs`
  - Verify scene management operations

- [ ] **T018** [P] Audit `scheduleService.ts`
  - File: `src/digital-signage-web/src/services/scheduleService.ts`
  - Backend: `ScheduleController.cs`, `UserScheduleController.cs`
  - Check schedule CRUD + conflict detection

- [ ] **T019** [P] Audit `userScheduleService.ts`
  - File: `src/digital-signage-web/src/services/userScheduleService.ts`
  - Check user-specific schedule operations
  - Verify against backend user schedule endpoints

- [ ] **T020** [P] Audit `conflictService.ts`
  - File: `src/digital-signage-web/src/services/conflictService.ts`
  - Backend: `ScheduleConflictsController.cs`
  - Verify conflict detection logic

---

## Phase 3.5: Audit - Devices & Hardware Domain

**Objective**: Audit device management and hardware detection services

- [ ] **T021** [P] Audit `deviceService.ts`
  - File: `src/digital-signage-web/src/services/deviceService.ts`
  - Backend: `DevicesController.cs`, `DeviceController.cs`
  - Check device CRUD, heartbeat, status operations

- [ ] **T022** [P] Audit `deviceDetailService.ts`
  - File: `src/digital-signage-web/src/services/deviceDetailService.ts`
  - Check device detail views and configuration
  - Verify configuration endpoint mappings

- [ ] **T023** [P] Audit `deviceGroupService.ts`
  - File: `src/digital-signage-web/src/services/deviceGroupService.ts`
  - Backend: Device group management endpoints
  - Check group CRUD operations

- [ ] **T024** [P] Audit `hardwareDetectionService.ts`
  - File: `src/digital-signage-web/src/services/hardwareDetectionService.ts`
  - Backend: `HardwareDetectionAdminController.cs`
  - Verify hardware detection job operations

- [ ] **T025** [P] Audit `deviceHardwareProfileService.ts`
  - File: `src/digital-signage-web/src/services/deviceHardwareProfileService.ts`
  - Backend: `DeviceHardwareProfileController.cs`
  - Check profile CRUD operations

- [ ] **T026** [P] Audit `deviceHealthService.ts`
  - File: `src/digital-signage-web/src/services/deviceHealthService.ts`
  - Backend: `DeviceStatusController.cs`
  - Verify health check endpoints

- [ ] **T027** [P] Audit `userDeviceAssociationService.ts`
  - File: `src/digital-signage-web/src/services/userDeviceAssociationService.ts`
  - Backend: `UserDeviceAssociationController.cs`
  - Check user-device association operations

---

## Phase 3.6: Audit - Analytics, Reports & Utilities Domain

**Objective**: Audit analytics, reporting, and utility services

- [ ] **T028** [P] Audit `analyticsService.ts`
  - File: `src/digital-signage-web/src/services/analyticsService.ts`
  - Backend: `AnalyticsController.cs`
  - Check analytics data retrieval methods

- [ ] **T029** [P] Audit `dashboardService.ts`
  - File: `src/digital-signage-web/src/services/dashboardService.ts`
  - Backend: `DashboardController.cs`
  - Verify dashboard metrics endpoints

- [ ] **T030** [P] Audit `reportsService.ts`
  - File: `src/digital-signage-web/src/services/reportsService.ts`
  - Backend: Report generation endpoints
  - Check report generation and download

- [ ] **T031** [P] Audit `settingsService.ts`
  - File: `src/digital-signage-web/src/services/settingsService.ts`
  - Backend: `SettingsController.cs`
  - Verify system settings operations

- [ ] **T032** [P] Audit `bulkOperationService.ts`
  - File: `src/digital-signage-web/src/services/bulkOperationService.ts`
  - Check bulk operation endpoints
  - Verify error handling for batch operations

- [ ] **T033** [P] Audit `qrCodeService.ts`
  - File: `src/digital-signage-web/src/services/qrCodeService.ts`
  - Backend: `QRCodeController.cs`
  - Check QR code generation endpoints

- [ ] **T034** [P] Audit `optimizedContentService.ts`
  - File: `src/digital-signage-web/src/services/optimizedContentService.ts`
  - Backend: `OptimizedContentController.cs`
  - Verify content optimization endpoints

---

## Phase 3.7: Audit - API Helper Files

**Objective**: Check API wrapper/helper files

- [ ] **T035** [P] Audit `api/mediaApi.ts`
  - File: `src/digital-signage-web/src/services/api/mediaApi.ts`
  - Check if wrapper for `mediaService.ts` or separate functionality
  - Document purpose and usage

- [ ] **T036** [P] Audit `api/scheduleApi.ts`
  - File: `src/digital-signage-web/src/services/api/scheduleApi.ts`
  - Check relationship with `scheduleService.ts`

- [ ] **T037** [P] Audit `api/userApi.ts`
  - File: `src/digital-signage-web/src/services/api/userApi.ts`
  - Check relationship with `userService.ts`

- [ ] **T038** [P] Audit `deviceApi.ts`
  - File: `src/digital-signage-web/src/services/deviceApi.ts`
  - Check relationship with `deviceService.ts`

---

## Phase 3.8: Fix Application - Critical Issues

**Objective**: Fix all CRITICAL severity issues (runtime crashes)

⚠️ **SEQUENTIAL EXECUTION REQUIRED** - These tasks modify service files and must be done carefully

- [ ] **T039** Fix CRITICAL issues in Auth & Users domain
  - Apply fixes to: `api/authService.ts`, `api/userService.ts`, `api/userPermissionService.ts`, `userService.ts`
  - Add: `Array.isArray()` guards, try-catch blocks, safe defaults
  - Test: `npm run type-check` passes
  - Commit: `git commit -m "fix(auth): add critical guards and error handling"`

- [ ] **T040** Fix CRITICAL issues in Core Content domain
  - Apply fixes to: `mediaService.ts`, `enhancedMediaService.ts`, `playlistService.ts`, `sceneService.ts`, `scheduleService.ts`
  - Pattern: Follow `copilot-instructions-ui.instructions.md` examples
  - Test: TypeScript compilation
  - Commit: Individual commit per service file

- [ ] **T041** Fix CRITICAL issues in Devices & Hardware domain
  - Apply fixes to: `deviceService.ts`, `deviceDetailService.ts`, `hardwareDetectionService.ts`, `deviceHardwareProfileService.ts`
  - Focus: Response structure guards
  - Test: TypeScript + manual device page load
  - Commit: Per-file commits

- [ ] **T042** Fix CRITICAL issues in Analytics & Reports domain
  - Apply fixes to: `analyticsService.ts`, `dashboardService.ts`, `reportsService.ts`
  - Ensure: No undefined errors in dashboard
  - Test: Load dashboard, check console
  - Commit: Per-domain commit

---

## Phase 3.9: Fix Application - High Priority Issues

**Objective**: Fix HIGH severity issues (data loss, incorrect display)

- [ ] **T043** Fix HIGH priority issues across all domains
  - Focus areas: Missing fallback values, wrong property names, missing error logs
  - Apply fixes to all service files with HIGH issues
  - Pattern: Add fallbacks like `|| 'Untitled'`, `|| 'No description'`
  - Test: Verify data displays correctly in UI
  - Commit: Batch commit per domain

---

## Phase 3.10: Verification & Testing

**Objective**: Validate all fixes work correctly

- [ ] **T044** Run TypeScript compilation check
  - Run: `cd src/digital-signage-web && npm run type-check`
  - Expected: Zero TypeScript errors (or fewer than baseline from T004)
  - Document: Update audit report with result

- [ ] **T045** Run build process
  - Run: `cd src/digital-signage-web && npm run build`
  - Expected: Build succeeds with no errors
  - Document: Note bundle size change (should be +1-2KB max)

- [ ] **T046** Manual UI testing - Critical paths
  - Test areas:
    - ✅ Login/Auth flow
    - ✅ Media library page
    - ✅ Device management page
    - ✅ Playlist creation
    - ✅ Schedule wizard
    - ✅ Dashboard analytics
  - Check: Browser console for runtime errors
  - Document: Update audit report testing section

- [ ] **T047** Browser console error audit
  - Open DevTools → Console in all tested pages
  - Verify: Zero `TypeError`, zero `Cannot read property of undefined`
  - Document: Screenshot clean console for each major page
  - Update: Audit report with verification status

---

## Phase 3.11: Documentation & Final Report

**Objective**: Generate comprehensive audit report and close out

- [ ] **T048** Generate final audit report
  - File: `docs/API-ENDPOINT-AUDIT-REPORT.md`
  - Populate all sections:
    - Executive Summary with final counts
    - Issue Distribution tables (by severity, type, domain)
    - Detailed Findings for each service file
    - Response Structure Mapping
    - Compliance Report
    - Fix Summary with git commits
    - Testing & Validation results
    - Recommendations
  - Add: All appendices (service files, endpoints, patterns)
  - Commit: `git add docs/API-ENDPOINT-AUDIT-REPORT.md && git commit -m "docs: complete API endpoint audit report"`

---

## Dependencies Graph

```
Phase 3.1 (Setup)
├─ T001 → T002 → T003, T004
│
Phase 3.2 (Discovery) - All parallel after T004
├─ T005 [P]
├─ T006 [P]
├─ T007 [P]
└─ T008 [P]
    │
    Phase 3.3-3.7 (Audit) - All [P] within phase, phases sequential
    ├─ T009-T012 [P] Auth & Users
    ├─ T013-T020 [P] Core Content
    ├─ T021-T027 [P] Devices & Hardware
    ├─ T028-T034 [P] Analytics & Reports
    └─ T035-T038 [P] API Helpers
        │
        Phase 3.8-3.9 (Fixes) - Sequential by severity
        ├─ T039 (CRITICAL - Auth)
        ├─ T040 (CRITICAL - Content)
        ├─ T041 (CRITICAL - Devices)
        ├─ T042 (CRITICAL - Analytics)
        └─ T043 (HIGH - All domains)
            │
            Phase 3.10 (Verification) - Sequential
            ├─ T044
            ├─ T045
            ├─ T046
            └─ T047
                │
                Phase 3.11 (Documentation)
                └─ T048
```

---

## Parallel Execution Examples

### Discovery Phase (T005-T008)
```bash
# All can run simultaneously
Task: "Generate service file inventory - find src/digital-signage-web/src/services -name '*.ts' -type f | sort"
Task: "Count total API calls - grep -r 'apiClient\.(get|post|put|delete|patch)' src/digital-signage-web/src/services/ | wc -l"
Task: "List backend controllers - find src/DigitalSignage.Api/Controllers -name '*Controller.cs'"
Task: "Create service file grouping by domain in docs/SERVICE-FILE-DOMAINS.md"
```

### Audit Phase - Auth Domain (T009-T012)
```bash
# All auth services can be audited in parallel
Task: "Audit api/authService.ts - run 7-point checklist on all methods"
Task: "Audit api/userService.ts - verify response structures vs UserController.cs"
Task: "Audit api/userPermissionService.ts - check permission endpoints"
Task: "Audit userService.ts - compare with api/userService.ts for duplicates"
```

### Audit Phase - Content Domain (T013-T020)
```bash
# All content services can be audited in parallel
Task: "Audit mediaService.ts - detailed example with MediaController.cs verification"
Task: "Audit enhancedMediaService.ts - check for duplication with mediaService"
Task: "Audit tagService.ts - verify tag CRUD operations"
Task: "Audit playlistService.ts - check PlaylistController.cs mappings"
Task: "Audit sceneService.ts - verify scene management"
Task: "Audit scheduleService.ts - check schedule + conflict endpoints"
Task: "Audit userScheduleService.ts - user-specific schedules"
Task: "Audit conflictService.ts - conflict detection logic"
```

---

## Task Execution Checklist

### Before Starting
- [ ] Read `specs/034-recheck-end-point/quickstart.md` in full
- [ ] Have `copilot-instructions-ui.instructions.md` open for reference
- [ ] Have `API-RESPONSE-MAPPING-GUIDELINE.md` open for patterns
- [ ] Ensure `git status` is clean

### During Audit (T009-T038)
For each service file:
1. [ ] Open service file in editor
2. [ ] Open corresponding backend controller
3. [ ] Run 7-point checklist on each method
4. [ ] Document issues in audit report with:
   - Severity (CRITICAL/HIGH/MEDIUM/LOW)
   - Issue type (e.g., MISSING_ARRAY_GUARD)
   - Line numbers
   - Current code snippet
   - Corrected code snippet
   - Pattern reference
5. [ ] Move to next file

### During Fixes (T039-T043)
For each service file with issues:
1. [ ] Apply fix following pattern from guidelines
2. [ ] Run `npm run type-check`
3. [ ] Test affected UI page
4. [ ] Git commit with descriptive message
5. [ ] Update audit report issue status to FIXED
6. [ ] Move to next file

### During Verification (T044-T047)
1. [ ] Run all automated checks
2. [ ] Manually test each major feature area
3. [ ] Monitor browser console
4. [ ] Screenshot clean console
5. [ ] Document all results in audit report

---

## Expected Outcomes

### Quantitative Metrics
- **Service Files Audited**: 31 files
- **API Methods Checked**: ~150+ methods
- **Issues Expected**: 80-100 total
  - CRITICAL: 10-15 (missing guards, no error handling)
  - HIGH: 20-30 (missing fallbacks, wrong property names)
  - MEDIUM: 30-40 (missing logs, style issues)
  - LOW: 15-25 (optimization opportunities)
- **Fixes Applied**: 70-90 (all CRITICAL + HIGH + most MEDIUM)
- **Time Estimate**: 12-20 hours total

### Qualitative Outcomes
- ✅ Zero runtime errors in browser console
- ✅ All API responses handled safely
- ✅ 100% compliance with copilot-instructions-ui patterns
- ✅ Comprehensive audit report for future reference
- ✅ Established patterns prevent future issues

---

## Notes

### Parallel Execution Strategy
- **Discovery tasks (T005-T008)**: Run all 4 simultaneously
- **Audit tasks (T009-T038)**: Run all within a domain in parallel (8 at a time max)
- **Fix tasks (T039-T043)**: MUST be sequential to avoid merge conflicts
- **Verification tasks (T044-T047)**: Sequential (each depends on previous)

### Common Pitfalls to Avoid
- ❌ Don't skip the 7-point checklist for any method
- ❌ Don't apply fixes before documenting issues
- ❌ Don't commit multiple file changes in one commit
- ❌ Don't skip manual testing after fixes
- ❌ Don't assume response structure without checking backend

### Success Indicators
- ✅ TypeScript compilation with zero errors
- ✅ Build succeeds
- ✅ All major pages load without console errors
- ✅ Data displays correctly everywhere
- ✅ Audit report is comprehensive and clear

---

## Validation Checklist
*GATE: Verify before marking feature complete*

- [ ] All 31 service files have been audited
- [ ] All CRITICAL issues documented and fixed
- [ ] All HIGH issues documented and fixed (or justified if not)
- [ ] Audit report is complete with all sections filled
- [ ] TypeScript compilation passes
- [ ] Build process succeeds
- [ ] Manual testing completed for all domains
- [ ] Browser console shows zero runtime errors
- [ ] Git commits follow convention (one fix per commit)
- [ ] Final audit report committed to `docs/`
- [ ] Pull request created with report summary

---

**Total Tasks**: 48  
**Parallel Tasks**: 34 (marked with [P])  
**Sequential Tasks**: 14 (setup, fixes, verification, documentation)  
**Estimated Duration**: 12-20 hours (spread over 2-3 days recommended)

**Ready for execution!** Follow the quickstart guide in `specs/034-recheck-end-point/quickstart.md` for detailed step-by-step instructions for each task.
