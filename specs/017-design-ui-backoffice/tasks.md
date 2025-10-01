# Tasks: Enhanced Backoffice Admin UI Design

**Input**: Design documents from `/specs/017-design-ui-backoffice/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory ✅
   → Extracted: Next.js 15, TypeScript, React Query/TanStack Query, Redux Toolkit, Tailwind CSS 4
2. Load design documents ✅
   → data-model.md: Redux state structure, TypeScript interfaces
   → contracts/: API endpoints and component interfaces  
   → research.md: Technology decisions and architecture patterns
3. Generate tasks by category:
   → Setup: Project dependencies, configuration files
   → Tests: Component tests, API integration tests
   → Core: Redux store, API client, base components
   → Features: Device, Media, Schedule, User management
   → Integration: WebSocket, real-time updates
   → Polish: Performance optimization, documentation
4. Apply task rules:
   → Different files/components = mark [P] for parallel
   → Sequential for shared infrastructure
   → Tests before implementation (TDD)
5. Tasks numbered T001-T032
6. Ready for execution
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `src/digital-signage-web/src/` for source files
- **Tests**: `src/digital-signage-web/tests/` for test files
- All paths relative to repository root

## Phase 3.1: Setup & Configuration
- [x] T001 Install and configure Next.js 15 dependencies in src/digital-signage-web/package.json
- [x] T002 Configure Tailwind CSS 4 with PostCSS in src/digital-signage-web/postcss.config.mjs
- [x] T003 [P] Setup ESLint and Prettier configuration in src/digital-signage-web/.eslintrc.json
- [x] T004 [P] Configure TypeScript strict mode in src/digital-signage-web/tsconfig.json
- [x] T005 Update Next.js configuration for S3 images in src/digital-signage-web/next.config.js

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T006 [P] Component test AdminLayout in tests/components/AdminLayout.test.tsx
- [ ] T007 [P] Component test DataTable in tests/components/DataTable.test.tsx
- [ ] T008 [P] Component test DashboardStats in tests/components/DashboardStats.test.tsx
- [ ] T009 [P] API integration test device endpoints in tests/integration/deviceApi.test.ts
- [ ] T010 [P] API integration test media endpoints in tests/integration/mediaApi.test.ts
- [ ] T011 [P] API integration test auth endpoints in tests/integration/authApi.test.ts
- [ ] T012 [P] Redux store test auth slice in tests/store/authSlice.test.ts
- [ ] T013 [P] Redux store test devices slice in tests/store/devicesSlice.test.ts

## Phase 3.3: Core Infrastructure (ONLY after tests are failing)
- [ ] T014 Redux store configuration in src/digital-signage-web/src/store/index.ts
- [ ] T015 [P] Auth slice implementation in src/digital-signage-web/src/store/slices/authSlice.ts
- [ ] T016 [P] UI slice implementation in src/digital-signage-web/src/store/slices/uiSlice.ts
- [ ] T017 [P] Devices slice implementation in src/digital-signage-web/src/store/slices/devicesSlice.ts
- [ ] T018 API client with interceptors in src/digital-signage-web/src/lib/api.ts
- [ ] T019 React Query configuration in src/digital-signage-web/src/app/providers.tsx
- [ ] T020 Root layout with providers in src/digital-signage-web/src/app/layout.tsx

## Phase 3.4: Base UI Components (TDD - tests exist)
- [x] T021 [P] Button component in src/digital-signage-web/src/components/ui/Button.tsx
- [x] T022 [P] Input component in src/digital-signage-web/src/components/ui/Input.tsx
- [x] T023 [P] Modal component in src/digital-signage-web/src/components/ui/Modal.tsx
- [x] T024 [P] DataTable component in src/digital-signage-web/src/components/tables/DataTable.tsx
- [x] T025 AdminLayout component in src/digital-signage-web/src/components/layouts/AdminLayout.tsx
- [x] T026 Sidebar navigation in src/digital-signage-web/src/components/layouts/Sidebar.tsx

## Phase 3.5: Dashboard & Analytics
- [x] T027 Dashboard page in src/digital-signage-web/src/app/dashboard/page.tsx
- [x] T028 [P] DashboardStats component in src/digital-signage-web/src/components/dashboard/DashboardStats.tsx
- [x] T029 [P] MetricCard component in src/digital-signage-web/src/components/dashboard/MetricCard.tsx
- [x] T030 [P] Chart components in src/digital-signage-web/src/components/charts/

## Phase 3.6: Device Management Feature
- [ ] T031 Device management page in src/digital-signage-web/src/app/devices/page.tsx
- [ ] T032 [P] Device list component in src/digital-signage-web/src/features/devices/components/DeviceList.tsx
- [ ] T033 [P] Device status component in src/digital-signage-web/src/features/devices/components/DeviceStatus.tsx
- [ ] T034 [P] Device filters component in src/digital-signage-web/src/features/devices/components/DeviceFilters.tsx
- [ ] T035 [P] useDevices hook in src/digital-signage-web/src/features/devices/hooks/useDevices.ts
- [ ] T036 Device service API calls in src/digital-signage-web/src/features/devices/services/deviceService.ts

## Phase 3.7: Media Management Feature
- [ ] T037 Media library page in src/digital-signage-web/src/app/content/page.tsx
- [ ] T038 [P] MediaGrid component in src/digital-signage-web/src/features/media/components/MediaGrid.tsx
- [ ] T039 [P] FileUpload component in src/digital-signage-web/src/features/media/components/FileUpload.tsx
- [ ] T040 [P] MediaPreview component in src/digital-signage-web/src/features/media/components/MediaPreview.tsx
- [ ] T041 [P] useMedia hook in src/digital-signage-web/src/features/media/hooks/useMedia.ts
- [ ] T042 Media service with S3 integration in src/digital-signage-web/src/features/media/services/mediaService.ts

## Phase 3.8: Schedule Management Feature
- [x] T043 Schedule management page in src/digital-signage-web/src/app/schedules/page.tsx
- [x] T044 [P] ScheduleCalendar component in src/digital-signage-web/src/features/schedules/components/ScheduleCalendar.tsx
- [x] T045 [P] ScheduleBuilder component in src/digital-signage-web/src/features/schedules/components/ScheduleBuilder.tsx
- [x] T046 [P] ConflictDetection component in src/digital-signage-web/src/features/schedules/components/ConflictDetection.tsx
- [x] T047 [P] useSchedules hook in src/digital-signage-web/src/features/schedules/hooks/useSchedules.ts
- [x] T048 Schedule service API calls in src/digital-signage-web/src/features/schedules/services/scheduleService.ts

## Phase 3.9: User Management Feature
- [x] T049 User management page in src/digital-signage-web/src/app/users/page.tsx
- [x] T050 [P] UserList component in src/digital-signage-web/src/features/users/components/UserList.tsx
- [x] T051 [P] RoleManager component in src/digital-signage-web/src/features/users/components/RoleManager.tsx
- [x] T052 [P] PermissionMatrix component in src/digital-signage-web/src/features/users/components/PermissionMatrix.tsx
- [x] T053 [P] useUsers hook in src/digital-signage-web/src/features/users/hooks/useUsers.ts
- [x] T054 User service with RBAC in src/digital-signage-web/src/features/users/services/userService.ts

## Phase 3.10: Real-time Features
- [x] T055 WebSocket client in src/digital-signage-web/src/lib/websocket.ts
- [x] T056 [P] useWebSocket hook in src/digital-signage-web/src/hooks/useWebSocket.ts
- [x] T057 [P] NotificationCenter component in src/digital-signage-web/src/components/notifications/NotificationCenter.tsx
- [x] T058 [P] Toast notifications in src/digital-signage-web/src/components/notifications/Toast.tsx
- [x] T059 Real-time device status updates integration
- [x] T060 Real-time schedule conflict notifications

## Phase 3.11: Authentication & Security
- [x] T061 Enhanced auth flow in src/digital-signage-web/src/features/auth/services/authService.ts
- [x] T062 [P] Login page in src/digital-signage-web/src/app/login/page.tsx
- [x] T063 [P] RBAC permission hooks in src/digital-signage-web/src/hooks/usePermissions.ts
- [x] T064 Route protection middleware in src/digital-signage-web/src/middleware.ts
- [x] T065 JWT token management in src/digital-signage-web/src/lib/auth.ts

## Phase 3.12: Forms & Validation
- [x] T066 [P] FormBuilder component in src/digital-signage-web/src/components/forms/FormBuilder.tsx
- [x] T067 [P] Validation schemas with Zod in src/digital-signage-web/src/lib/validations.ts
- [x] T068 [P] Form hooks with React Hook Form in src/digital-signage-web/src/hooks/useForm.ts

## Phase 3.13: Integration & Polish
- [x] T069 [P] Error boundary components in src/digital-signage-web/src/components/ErrorBoundary.tsx
- [x] T070 [P] Loading states and skeletons in src/digital-signage-web/src/components/ui/LoadingStates.tsx
- [x] T071 [P] Performance optimization with React.memo and useMemo
- [x] T072 [P] E2E tests with Playwright in tests/e2e/
- [x] T073 Bundle optimization and code splitting
- [x] T074 Accessibility testing and improvements
- [x] T075 Performance monitoring setup

## Dependencies
- **Setup (T001-T005)** before everything
- **Tests (T006-T013)** before core implementation
- **Core Infrastructure (T014-T020)** before features
- **Base Components (T021-T026)** before feature components
- **Features (T027-T065)** can run in parallel groups by feature
- **Integration (T069-T075)** after core features

## Parallel Execution Examples

### Phase 3.2 - All tests in parallel
```bash
# All component tests can run together (different files):
Task: "Component test AdminLayout in tests/components/AdminLayout.test.tsx"
Task: "Component test DataTable in tests/components/DataTable.test.tsx" 
Task: "Component test DashboardStats in tests/components/DashboardStats.test.tsx"

# All API integration tests can run together:
Task: "API integration test device endpoints in tests/integration/deviceApi.test.ts"
Task: "API integration test media endpoints in tests/integration/mediaApi.test.ts"
Task: "API integration test auth endpoints in tests/integration/authApi.test.ts"
```

### Phase 3.3 - Redux slices in parallel
```bash
# Different slice files can be implemented in parallel:
Task: "Auth slice implementation in src/digital-signage-web/src/store/slices/authSlice.ts"
Task: "UI slice implementation in src/digital-signage-web/src/store/slices/uiSlice.ts"
Task: "Devices slice implementation in src/digital-signage-web/src/store/slices/devicesSlice.ts"
```

### Phase 3.4 - Base components in parallel
```bash
# All base UI components (different files):
Task: "Button component in src/digital-signage-web/src/components/ui/Button.tsx"
Task: "Input component in src/digital-signage-web/src/components/ui/Input.tsx"
Task: "Modal component in src/digital-signage-web/src/components/ui/Modal.tsx"
```

### Phase 3.6-3.9 - Feature modules in parallel
```bash
# Each feature can be developed in parallel by different developers:
Task: "Device list component in src/digital-signage-web/src/features/devices/components/DeviceList.tsx"
Task: "MediaGrid component in src/digital-signage-web/src/features/media/components/MediaGrid.tsx"
Task: "ScheduleCalendar component in src/digital-signage-web/src/features/schedules/components/ScheduleCalendar.tsx"
Task: "UserList component in src/digital-signage-web/src/features/users/components/UserList.tsx"
```

## Notes
- **[P] tasks** = different files, no dependencies, can run in parallel
- **TDD approach**: All tests (T006-T013) must be written and failing before implementation
- **Feature-based organization**: Each feature module is independent
- **Clean architecture**: Clear separation between components, services, and hooks
- **Type safety**: All components fully typed with TypeScript
- **Real-time updates**: WebSocket integration for live data
- **Performance**: Code splitting and optimization built-in
- **Accessibility**: WCAG 2.1 AA compliance throughout

## Task Generation Rules Applied
- ✅ Contract files → component interface tests (T006-T008)
- ✅ API endpoints → integration tests (T009-T011)  
- ✅ Data model entities → Redux slice tasks (T015-T017)
- ✅ Feature requirements → feature module tasks (T031-T054)
- ✅ Different files = parallel [P] marking
- ✅ Shared infrastructure = sequential
- ✅ Tests before implementation (TDD)
- ✅ Dependencies clearly documented
- ✅ Clear file paths for each task

**Total Tasks**: 75 tasks organized in 13 phases
**Estimated Timeline**: 4-6 weeks with 2-3 developers
**Critical Path**: Setup → Tests → Core Infrastructure → Features → Integration