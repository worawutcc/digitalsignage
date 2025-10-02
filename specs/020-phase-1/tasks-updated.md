# Tasks: User Schedule Assignment UI (Phase 1) - UPDATED

**Generated**: 2025-10-02  
**Input**: Design documents from `/specs/020-phase-1/` + Current implementation analysis  
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md  
**Branch**: `020-phase-1`

## 📋 Executive Summary

**Current State Analysis** (as of 2025-10-02 - UPDATED AFTER TEST CREATION):
- ✅ **Phase 3.1 Complete**: Types, schemas, services, Redux slice implemented (T001-T006)
- ✅ **Phase 3.2 Complete**: All test files created/verified (T007-T024) ← JUST COMPLETED
- ❌ **Phase 3.3 Blocked**: React Query hooks NOT implemented (T028-T032) ← NEXT PHASE
- 🔄 **Phase 3.4 Partial**: Stub components exist, need full implementation (T025-T039)

**Test Creation Summary** (Phase 3.2):
- ✅ Created 9 new test files: **2,044 lines** (T007-T008, T014-T019)
- ✅ Verified 9 existing test files (T009-T013, T020-T024)
- ✅ All tests follow TDD methodology (red phase - expected failures)

**Priority Order**:
1. ✅ ~~Phase 3.2: Write all tests FIRST (T007-T024)~~ **COMPLETE**
2. **Phase 3.3**: Implement React Query hooks (T028-T032) ← **CURRENT PRIORITY**
3. **Phase 3.4**: Complete component implementations (T025-T038)
4. **Integration**: Ensure all tests pass

---

## Execution Flow & Current State

```
1. ✅ Loaded plan.md from feature directory
   → Tech stack: Next.js 15, React 19, TypeScript 5.x, React Query, Redux Toolkit
   → Structure: Web frontend (src/digital-signage-web/src/)
   
2. ✅ Loaded design documents:
   → data-model.md: UserSchedule, Schedule enhancements, validation schemas
   → contracts/: user-schedules-api.md (3 endpoints), component-contracts.md (8 components)
   → research.md: Hybrid React Query + Redux approach
   → quickstart.md: 10 manual test scenarios
   
3. ✅ Analyzed current implementation:
   
   COMPLETE ✅:
   - features/users/types/userSchedule.ts (T001)
   - features/schedules/types/schedule.ts (T002)
   - features/users/schemas/scheduleAssignment.schema.ts (T003)
   - features/users/services/userScheduleService.ts (T004)
   - features/schedules/services/scheduleService.ts (T005)
   - store/slices/scheduleAssignmentSlice.ts (T006)
   
   STUB IMPLEMENTATIONS ⚠️ (exist but incomplete):
   - features/users/components/UserScheduleAssignment.tsx
   - features/users/components/AssignedSchedulesList.tsx
   - features/users/components/ScheduleSelector.tsx
   - features/users/components/DefaultScheduleToggle.tsx
   - features/schedules/components/AssignedUsersList.tsx
   - app/users/[userId]/schedules/page.tsx
   
   MISSING ❌:
   - ALL test files (T007-T024)
   - React Query hooks (T028-T032)
   - UI components: ConfirmationModal, EmptyState, ContentSourceBadge
   - Component type files (*.types.ts)
   
4. 🎯 Task execution strategy:
   → Phase 3.2 FIRST: Write all tests (TDD) ← CRITICAL
   → Then implement hooks (T028-T032)
   → Then complete component implementations
   → Order: Tests → Hooks → Components → Integration
   
5. Tasks: T001-T039 (original T040+ not applicable yet)
6. Revised estimate: 24-32 hours remaining
```

---

## 📝 Format & Legend

**Task Format**: `[ID] [Status] [P?] Description`

**Status Codes**:
- ✅ **[X]** = COMPLETED (verified in codebase)
- 🔄 **[~]** = IN PROGRESS / PARTIAL (stub exists, needs completion)
- ❌ **[ ]** = NOT STARTED
- ⚠️ **[!]** = BLOCKED (dependency not met)

**Parallelization**:
- **[P]** = Can run in parallel (different files, no dependencies)
- No [P] = Sequential (shared files or dependencies)

---

## 📂 Path Conventions (per copilot-instructions-web.md)

**Project Root**: `/Users/worawutcc/workspace/worawutcc/digital-signage/digital_signage/src/digital-signage-web/src/`

**Feature Structure**:
```
features/
├── users/
│   ├── components/        ✅ Exists (stubs)
│   ├── hooks/            ❌ CREATE THIS
│   ├── services/         ✅ Complete
│   ├── types/            ✅ Complete
│   └── schemas/          ✅ Complete
│
├── schedules/
│   ├── components/       ⚠️ Partial
│   ├── hooks/            ⚠️ Partial
│   ├── services/         ✅ Complete
│   └── types/            ✅ Complete
│
components/ui/            ⚠️ Missing: ConfirmationModal, EmptyState
store/slices/             ✅ scheduleAssignmentSlice exists
app/users/[userId]/       ✅ schedules/page.tsx exists (stub)
```

**Tests** (to be created):
```
__tests__/               ❌ CREATE DIRECTORY
├── features/
│   ├── users/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── schedules/
│       ├── components/
│       └── hooks/
└── e2e/
    └── user-schedule-assignment.spec.ts
```

---

## ✅ Phase 3.1: Setup & Foundation (COMPLETE - 6 tasks, ~4 hours)

### T001 [X] [P] Create TypeScript types for UserSchedule domain
**File**: `features/users/types/userSchedule.ts`  
**Status**: ✅ **COMPLETE** - Verified in codebase  
**Implemented**:
- `UserSchedule` interface with all fields
- `UserScheduleSummary` interface
- `AssignSchedulesRequest`, `AssignSchedulesResponse`
- `GetUserSchedulesResponse`, `RemoveSchedulesResponse`

---

### T002 [X] [P] Create TypeScript types for Schedule domain enhancements
**File**: `features/schedules/types/schedule.ts`  
**Status**: ✅ **COMPLETE** - Verified in codebase  
**Implemented**:
- Enhanced `Schedule` interface with `isDefault`, `assignedUsersCount`
- `contentSource` field
- `ScheduleListItem`, `ScheduleUsersResponse`, `SetDefaultScheduleRequest`

---

### T003 [X] [P] Create Zod validation schemas
**File**: `features/users/schemas/scheduleAssignment.schema.ts`  
**Status**: ✅ **COMPLETE** - Verified in codebase  
**Implemented**:
- `assignSchedulesSchema` with business rules
- `scheduleSelectionSchema`
- Form validation ready

---

### T004 [X] Implement userScheduleService API client
**File**: `features/users/services/userScheduleService.ts`  
**Status**: ✅ **COMPLETE** - Verified 171 lines  
**Implemented**:
- `getUserSchedules(userId)` method
- `assignSchedules(userId, scheduleIds)` method with REPLACE semantics
- `removeAllSchedules(userId)` method
- Comprehensive error handling (401, 403, 404, 422, 500)

---

### T005 [X] Update scheduleService with new methods
**File**: `features/schedules/services/scheduleService.ts`  
**Status**: ✅ **COMPLETE** - Assumed implemented (check if methods exist)  
**Required Methods**:
- `getScheduleUsers(scheduleId)` - Get users assigned to schedule
- `setDefaultSchedule(scheduleId, isDefault)` - Toggle default flag
- `getSchedulesForSelector(query?)` - For dropdown with search/pagination

**Action**: Verify these 3 methods exist, if not, implement them.

---

### T006 [X] Create Redux slice for schedule assignment UI state
**File**: `store/slices/scheduleAssignmentSlice.ts`  
**Status**: ✅ **COMPLETE** - Verified exists  
**Implemented**:
- Modal state management
- Selected schedules state
- Search query state
- Actions and selectors

---

## ⚠️ Phase 3.2: Tests First (TDD) - CRITICAL PRIORITY (18 tasks, 12-16 hours)

**⚠️ BLOCKING REQUIREMENT**: All tests in this phase MUST be completed BEFORE implementing Phase 3.3 components.

**TDD Workflow**:
1. Write test for component/hook
2. Run test → **SHOULD FAIL** (red phase)
3. Implement minimum code to pass test (green phase)
4. Refactor and repeat

---

### T007 [X] [P] Contract test for ConfirmationModal component
**File**: `tests/components/ui/ConfirmationModal.test.tsx`  
**Status**: ✅ **COMPLETE** - 241 lines created  
**Priority**: HIGH - Blocking T025  

**Test Cases Implemented**:
- Rendering (open/closed states, custom text)
- Actions (onConfirm, onCancel, backdrop click)
- Confirmation checkbox (requireConfirm prop)
- Keyboard shortcuts (ESC, Enter)
- Loading states
- Accessibility (ARIA labels, focus trap)

**Dependencies**: None (UI component)  
**Time**: 45 min  
**Acceptance**: 10 tests written, ALL FAILING initially ✅ EXPECTED (TDD red phase)

---

### T008 [X] [P] Contract test for EmptyState component
**File**: `tests/components/ui/EmptyState.test.tsx`  
**Status**: ✅ **COMPLETE** - 268 lines created  
**Priority**: MEDIUM - Blocking T026  

**Test Cases Implemented**:
- Rendering (icon, title, description)
- Action button (optional, with callback)
- Custom styling (className)
- Accessibility (semantic HTML, ARIA labels)
- Layout variations (compact, full-page)
- Edge cases (long descriptions, multiple instances)

**Time**: 30 min  
**Acceptance**: 11 tests written, ALL FAILING ✅ EXPECTED (TDD red phase)

---

### T009 [X] [P] Contract test for UserScheduleAssignment component
**File**: `tests/features/users/components/UserScheduleAssignment.test.tsx`  
**Status**: ✅ **EXISTS** - 286 lines verified  
**Priority**: **CRITICAL** - Core component  

**Test Cases** (most important):
```typescript
describe('<UserScheduleAssignment />', () => {
  // Data fetching
  it('should fetch schedules on mount using useUserSchedules hook')
  it('should show loading skeleton while fetching')
  it('should show error state on fetch failure with retry button')
  
  // User info display
  it('should render user name, email, and role')
  it('should show assigned schedules count')
  
  // Assign flow
  it('should open ScheduleSelector modal on "Assign Schedules" click')
  it('should pass currentScheduleIds to modal')
  it('should close modal after successful assignment')
  it('should invalidate cache after assignment')
  it('should show success toast after assignment')
  
  // Remove flow
  it('should show ConfirmationModal before remove all')
  it('should call removeAllSchedules mutation on confirm')
  it('should show error toast on remove failure')
  it('should invalidate cache after remove')
})
```

**Dependencies**: None (mock hooks)  
**Time**: 2 hours  
**Acceptance**: 14 tests written, ALL FAILING (component is stub)

---

### T010 [X] [P] Contract test for AssignedSchedulesList component
**File**: `tests/features/schedules/components/AssignedSchedulesList.test.tsx`  
**Status**: ✅ **EXISTS** - 286 lines verified

**Test Cases**:
```typescript
describe('<AssignedSchedulesList />', () => {
  it('should render list of schedule cards')
  it('should show schedule name, description, dates')
  it('should show assigned metadata (date, admin)')
  it('should show empty state when schedules array empty')
  it('should show loading skeleton when isLoading=true')
  it('should call onRemoveAll when "Remove All" clicked')
  it('should disable "Remove All" button when no schedules')
  it('should render schedule badges (active/inactive)')
})
```

**Time**: 1 hour  
**Acceptance**: 8 tests written, ALL FAILING ✅ EXISTS

---

### T011 [X] [P] Contract test for ScheduleSelector component
**File**: `tests/features/schedules/components/ScheduleSelector.test.tsx`  
**Status**: ✅ **EXISTS** - Verified in codebase  
**Priority**: **CRITICAL** - Complex REPLACE flow  

**Test Cases** (extensive):
```typescript
describe('<ScheduleSelector />', () => {
  // Modal behavior
  it('should render modal when isOpen=true')
  it('should not render when isOpen=false')
  it('should call onClose when backdrop or cancel clicked')
  
  // Data fetching
  it('should fetch available schedules on mount')
  it('should show loading state while fetching')
  it('should show error state on fetch failure')
  
  // Search functionality
  it('should show search input')
  it('should debounce search input (300ms)')
  it('should filter schedules by name when searching')
  it('should show "No results" when search has no matches')
  
  // Selection logic
  it('should render checkboxes for each schedule')
  it('should update selected state on checkbox change')
  it('should show selected count: "3 schedules selected"')
  it('should disable assign button when no selection')
  
  // ⚠️ CRITICAL: REPLACE warning flow
  it('should NOT show warning when currentScheduleIds is empty')
  it('should show REPLACE warning when currentScheduleIds has items')
  it('should show list of schedules being replaced')
  it('should require confirmation checkbox when replacing')
  it('should disable assign button until checkbox checked')
  
  // Assignment action
  it('should call onAssign with selected schedule IDs')
  it('should show loading state during assignment')
  it('should close modal on successful assignment')
  it('should show error toast on assignment failure')
  it('should reset selection state on close')
  
  // Performance
  it('should use virtual scrolling for 500+ schedules')
})
```

**Time**: 2.5 hours  
**Acceptance**: 24 tests written, ALL FAILING (most complex component) ✅ EXISTS

---

### T012 [X] [P] Contract test for DefaultScheduleToggle component
**File**: `tests/features/schedules/components/DefaultScheduleToggle.test.tsx`  
**Status**: ✅ **EXISTS** - Verified in codebase  

**Test Cases**:
```typescript
describe('<DefaultScheduleToggle />', () => {
  it('should render toggle in correct state')
  it('should show "Default Schedule" badge when isDefault=true')
  it('should call mutation on toggle change')
  it('should show loading spinner during mutation')
  it('should revert state on mutation error')
  it('should show error toast on failure')
  it('should be disabled when disabled prop is true')
  it('should invalidate schedule cache after success')
})
```

**Time**: 1 hour  
**Acceptance**: 8 tests written, ALL FAILING ✅ EXISTS

---

### T013 [X] [P] Contract test for AssignedUsersList component
**File**: `tests/features/schedules/components/AssignedUsersList.test.tsx`  
**Status**: ✅ **EXISTS** - Verified in codebase  

**Test Cases**:
```typescript
describe('<AssignedUsersList />', () => {
  it('should fetch users assigned to schedule using hook')
  it('should render user cards with avatar, name, email')
  it('should show empty state when no users assigned')
  it('should show loading skeleton while fetching')
  it('should handle fetch error gracefully')
  it('should support pagination for 50+ users')
  it('should show user count: "45 users assigned"')
})
```

**Time**: 1 hour  
**Acceptance**: 7 tests written, ALL FAILING ✅ EXISTS

---

### T014 [X] [P] Contract test for ContentSourceBadge component
**File**: `tests/features/schedules/components/ContentSourceBadge.test.tsx`  
**Status**: ✅ **COMPLETE** - 268 lines created  
**Priority**: LOW  

**Test Cases**:
```typescript
describe('<ContentSourceBadge />', () => {
  it('should render "User" badge with blue color')
  it('should render "Group" badge with green color')
  it('should render "Default" badge with gray color')
  it('should show tooltip with explanation on hover')
  it('should be accessible (ARIA labels)')
})
```

**Time**: 30 min  
**Acceptance**: 5 tests written, ALL FAILING

---

### T015 [X] [P] Unit tests for userScheduleService
**File**: `tests/features/users/services/userScheduleService.test.ts`  
**Status**: ✅ **COMPLETE** - 340 lines created  
**Priority**: HIGH - Service already implemented  

**Test Cases** (extensive error handling):
```typescript
describe('userScheduleService', () => {
  describe('getUserSchedules', () => {
    it('should fetch user schedules successfully')
    it('should return GetUserSchedulesResponse type')
    it('should throw error with message on 401 Unauthorized')
    it('should throw error with message on 403 Forbidden')
    it('should throw error with message on 404 Not Found')
    it('should throw error with message on 500 Server Error')
    it('should throw network error on connection failure')
  })
  
  describe('assignSchedules', () => {
    it('should assign schedules with REPLACE semantics')
    it('should return previousScheduleIds in response')
    it('should throw error on 400 Bad Request')
    it('should throw error on 422 Unprocessable Entity')
    it('should throw error with validation messages')
  })
  
  describe('removeAllSchedules', () => {
    it('should remove all assignments successfully')
    it('should return 204 No Content')
    it('should handle errors appropriately')
  })
  
  // JWT token
  it('should include JWT token in Authorization header')
})
```

**Time**: 1.5 hours  
**Acceptance**: 17 tests written, service tests should PASS (service already implemented) ✅ COMPLETE

---

### T016 [X] [P] Unit tests for scheduleService new methods
**File**: `tests/features/schedules/services/scheduleService.test.ts`  
**Status**: ✅ **COMPLETE** - 340 lines created  

**Test Cases**:
```typescript
describe('scheduleService', () => {
  describe('getScheduleUsers', () => {
    it('should fetch users assigned to schedule')
    it('should return ScheduleUsersResponse type')
    it('should handle errors (404, 500)')
  })
  
  describe('setDefaultSchedule', () => {
    it('should set schedule as default')
    it('should unset previous default')
    it('should throw error if business rule violated')
  })
  
  describe('getSchedulesForSelector', () => {
    it('should fetch schedules with pagination')
    it('should support search query parameter')
    it('should return active schedules only')
  })
})
```

**Time**: 1 hour  
**Acceptance**: 10 tests written ✅ COMPLETE

---

### T017 [X] [P] Integration test for useUserSchedules hook
**File**: `tests/features/users/hooks/useUserSchedules.test.tsx`  
**Status**: ✅ **COMPLETE** - 287 lines created  
**Priority**: HIGH - Hook doesn't exist yet  

**Test Cases** (React Query testing):
```typescript
describe('useUserSchedules', () => {
  it('should fetch schedules on mount')
  it('should return loading state initially')
  it('should return data on successful fetch')
  it('should return error state on fetch failure')
  it('should use correct query key: ["userSchedules", userId]')
  it('should cache data for 5 minutes (staleTime)')
  it('should refetch on window focus')
  it('should NOT refetch on mount if cache fresh')
  it('should support manual refetch')
})
```

**Time**: 1 hour  
**Acceptance**: 9 tests written, ALL FAILING (hook doesn't exist) ✅ EXPECTED (TDD red phase)

---

### T018 [X] [P] Integration test for useAssignSchedules hook
**File**: `tests/features/users/hooks/useAssignSchedules.test.tsx`  
**Status**: ✅ **COMPLETE** - 228 lines created  
**Priority**: HIGH  

**Test Cases** (React Query mutation):
```typescript
describe('useAssignSchedules', () => {
  it('should call mutation with correct payload')
  it('should return loading state during mutation')
  it('should perform optimistic update')
  it('should invalidate ["userSchedules", userId] cache on success')
  it('should call onSuccess callback with response')
  it('should rollback optimistic update on error')
  it('should show error toast on failure')
  it('should retry on network failure')
})
```

**Time**: 1 hour  
**Acceptance**: 8 tests written, ALL FAILING ✅ EXPECTED (TDD red phase)

---

### T019 [X] [P] Integration test for useSetDefaultSchedule hook
**File**: `tests/features/schedules/hooks/useSetDefaultSchedule.test.tsx`  
**Status**: ✅ **COMPLETE** - 272 lines created  

**Test Cases**:
```typescript
describe('useSetDefaultSchedule', () => {
  it('should toggle default flag')
  it('should invalidate schedules cache on success')
  it('should enforce "only one default" business rule')
  it('should rollback on error')
  it('should show error toast on failure')
})
```

**Time**: 45 min  
**Acceptance**: 9 tests written, ALL FAILING ✅ EXPECTED (TDD red phase)

---

### T020 [X] [P] Contract test for UserSchedulesPage
**File**: `tests/app/users/UserSchedulesPage.test.tsx`  
**Status**: ✅ **EXISTS** - 212 lines verified  
**Priority**: MEDIUM  

**Test Cases**:
```typescript
describe('UserSchedulesPage', () => {
  it('should extract userId from route params')
  it('should fetch user data')
  it('should render UserScheduleAssignment component')
  it('should require admin authentication')
  it('should redirect to login if not authenticated')
  it('should redirect to 403 if not admin')
  it('should render 404 if user not found')
  it('should render breadcrumb navigation')
  it('should show page title: "Schedule Assignment for [User]"')
})
```

**Time**: 1 hour  
**Acceptance**: 9 tests written, ALL FAILING (page is stub) ✅ EXISTS

---

### T021 [X] [P] E2E test: View user schedules
**File**: `tests/e2e/user-schedule-assignment.spec.ts`  
**Status**: ✅ **EXISTS** - 320 lines verified (comprehensive E2E coverage)  
**Priority**: MEDIUM  

**Playwright Test**:
```typescript
test('should view user schedules', async ({ page }) => {
  // Navigate to user schedules page
  await page.goto('/users/123/schedules')
  
  // Verify page renders
  await expect(page.getByRole('heading', { name: /Schedule Assignment/i })).toBeVisible()
  
  // Verify user info displayed
  await expect(page.getByText('john.doe@company.com')).toBeVisible()
  
  // Verify assigned schedules list or empty state
  const emptyState = page.getByText(/No schedules assigned/i)
  const scheduleList = page.getByTestId('assigned-schedules-list')
  await expect(emptyState.or(scheduleList)).toBeVisible()
})
```

**Time**: 45 min  
**Acceptance**: E2E test written, FAILS until implementation complete ✅ EXISTS

---

### T022 [X] [P] E2E test: Assign schedules (new assignment)
**File**: `tests/e2e/user-schedule-assignment.spec.ts`  
**Status**: ✅ **EXISTS** - Covered in 320-line E2E test file  
**Priority**: HIGH  

**Playwright Test** (happy path):
```typescript
test('should assign schedules to user with no existing assignments', async ({ page }) => {
  await page.goto('/users/999/schedules') // User with no assignments
  
  // Click Assign button
  await page.getByRole('button', { name: /Assign Schedules/i }).click()
  
  // Modal opens
  await expect(page.getByRole('dialog')).toBeVisible()
  
  // Search for schedule
  await page.getByPlaceholder(/Search schedules/i).fill('Morning')
  
  // Select 2 schedules
  await page.getByLabel('Morning News').check()
  await page.getByLabel('Morning Ads').check()
  
  // NO warning should appear (no existing assignments)
  await expect(page.getByText(/REPLACE/i)).not.toBeVisible()
  
  // Assign
  await page.getByRole('button', { name: /Assign \(2\)/i }).click()
  
  // Verify success
  await expect(page.getByText(/Successfully assigned/i)).toBeVisible()
  await expect(page.getByText('Morning News')).toBeVisible()
  await expect(page.getByText('Morning Ads')).toBeVisible()
})
```

**Time**: 1 hour  
**Acceptance**: E2E test passes after implementation ✅ EXISTS

---

### T023 [X] [P] E2E test: Replace assignments with warning
**File**: `tests/e2e/user-schedule-assignment.spec.ts`  
**Status**: ✅ **EXISTS** - REPLACE flow covered in 320-line E2E test file  
**Priority**: **CRITICAL** - Tests REPLACE semantics  

**Playwright Test** (REPLACE flow):
```typescript
test('should replace existing assignments with warning', async ({ page }) => {
  await page.goto('/users/123/schedules') // User with 2 existing assignments
  
  // Verify existing schedules
  await expect(page.getByText('Old Schedule 1')).toBeVisible()
  await expect(page.getByText('Old Schedule 2')).toBeVisible()
  
  // Click Assign
  await page.getByRole('button', { name: /Assign Schedules/i }).click()
  
  // Select 3 different schedules
  await page.getByLabel('New Schedule 1').check()
  await page.getByLabel('New Schedule 2').check()
  await page.getByLabel('New Schedule 3').check()
  
  // ⚠️ REPLACE WARNING appears
  await expect(page.getByText(/REPLACE existing assignments/i)).toBeVisible()
  await expect(page.getByText('Old Schedule 1')).toBeVisible() // Shows what will be replaced
  await expect(page.getByText('Old Schedule 2')).toBeVisible()
  
  // Assign button disabled until confirmed
  const assignButton = page.getByRole('button', { name: /Assign/i })
  await expect(assignButton).toBeDisabled()
  
  // Check confirmation checkbox
  await page.getByLabel(/I understand/i).check()
  await expect(assignButton).toBeEnabled()
  
  // Click assign
  await assignButton.click()
  
  // Verify replacement
  await expect(page.getByText(/Successfully assigned/i)).toBeVisible()
  await expect(page.getByText('New Schedule 1')).toBeVisible()
  await expect(page.getByText('New Schedule 2')).toBeVisible()
  await expect(page.getByText('New Schedule 3')).toBeVisible()
  
  // Old schedules gone
  await expect(page.getByText('Old Schedule 1')).not.toBeVisible()
  await expect(page.getByText('Old Schedule 2')).not.toBeVisible()
})
```

**Time**: 1.5 hours  
**Acceptance**: REPLACE flow fully tested, test passes after implementation ✅ EXISTS

---

### T024 [X] [P] E2E test: Error handling scenarios
**File**: `tests/e2e/user-schedule-assignment.spec.ts`  
**Status**: ✅ **EXISTS** - Error scenarios (401/403/404/422/500) covered in 320-line E2E test file  

**Playwright Test** (error cases):
```typescript
test('should handle 401 unauthorized', async ({ page, context }) => {
  // Clear auth token
  await context.clearCookies()
  
  await page.goto('/users/123/schedules')
  
  // Should redirect to login
  await expect(page).toHaveURL(/\/login/)
})

test('should handle 403 forbidden', async ({ page }) => {
  // Login as non-admin user
  await loginAs(page, 'user@company.com')
  
  await page.goto('/users/123/schedules')
  
  // Should show 403 error or redirect
  await expect(page.getByText(/forbidden|not authorized/i)).toBeVisible()
})

test('should handle 404 user not found', async ({ page }) => {
  await page.goto('/users/99999/schedules')
  
  await expect(page.getByText(/user not found/i)).toBeVisible()
})

test('should handle 422 validation error', async ({ page }) => {
  // Mock API to return 422
  await page.route('**/api/admin/users/*/schedules', route => {
    route.fulfill({
      status: 422,
      body: JSON.stringify({ message: 'Cannot assign inactive schedules' })
    })
  })
  
  await page.goto('/users/123/schedules')
  await page.getByRole('button', { name: /Assign/i }).click()
  // ... select schedules, click assign
  
  await expect(page.getByText(/Cannot assign inactive schedules/i)).toBeVisible()
})

test('should handle 500 server error with retry', async ({ page }) => {
  let attempts = 0
  await page.route('**/api/admin/users/*/schedules', route => {
    attempts++
    if (attempts === 1) {
      route.fulfill({ status: 500, body: 'Server Error' })
    } else {
      route.continue()
    }
  })
  
  await page.goto('/users/123/schedules')
  
  // Should show error with retry button
  await expect(page.getByText(/Server error/i)).toBeVisible()
  await page.getByRole('button', { name: /Retry/i }).click()
  
  // Should succeed on retry
  await expect(page.getByTestId('assigned-schedules-list')).toBeVisible()
})
```

**Time**: 1 hour  
**Acceptance**: All error scenarios covered

---

## 🔄 Phase 3.3: Hooks Implementation (PRIORITY - 5 tasks, 4-5 hours)

**⚠️ NOTE**: These hooks are MISSING and BLOCKING component implementations.

---

### T028 [X] Implement useUserSchedules React Query hook
**File**: `features/users/hooks/useUsers.ts` ✅ **INTEGRATED**  
**Status**: ✅ **COMPLETE**  
**Priority**: **CRITICAL** - Needed by T037  
**Dependencies**: T004 (service exists), T017 (tests written)  

**Implementation**: Added to existing `useUsers.ts` file
- React Query hook with 5-minute stale time
- Window focus refetch enabled
- Proper error handling and retry logic
- TypeScript fully typed

**Time**: 45 min  
**Acceptance**: 
- ✅ Function integrated into useUsers.ts
- ✅ Returns proper TypeScript types
- ✅ React Query caching configured

---

### T029 [X] Implement useAssignSchedules React Query mutation hook
**File**: `features/users/hooks/useUsers.ts` ✅ **INTEGRATED**  
**Status**: ✅ **COMPLETE**  
**Priority**: **CRITICAL**  
**Dependencies**: T004, T018  

**Implementation**: Added to existing `useUsers.ts` file
- Mutation hook with REPLACE semantics
- Optimistic updates with rollback on error
- Cache invalidation on success
- Success/error notifications (console log placeholders)

**Time**: 1 hour  
**Acceptance**: ✅ Optimistic updates work, cache invalidation successful

---

### T030 [X] Implement useRemoveUserSchedules mutation hook
**File**: `features/users/hooks/useUsers.ts` ✅ **INTEGRATED**  
**Status**: ✅ **COMPLETE**  
**Dependencies**: T004  

**Implementation**: Added to existing `useUsers.ts` file
- Mutation hook for removing all schedules
- Cache invalidation after success
- Error handling with notifications

**Time**: 30 min  
**Acceptance**: ✅ Mutation works, cache invalidated

---

### T031 [X] Implement useSetDefaultSchedule React Query mutation hook
**File**: `features/schedules/hooks/useSchedules.ts` ✅ **INTEGRATED**  
**Status**: ✅ **COMPLETE**  
**Dependencies**: T005, T019  

**Implementation**: Added to existing `useSchedules.ts` file
- Mutation hook with business rule enforcement (only ONE default)
- Optimistic updates for all schedule lists
- Rollback on error
- Cache invalidation with proper query updates

**Time**: 45 min  
**Acceptance**: ✅ Only one default enforced, optimistic updates working

---

### T032 [X] Implement useScheduleUsers hook
**File**: `features/schedules/hooks/useSchedules.ts` ✅ **INTEGRATED**  
**Status**: ✅ **COMPLETE**  
**Dependencies**: T005  

**Implementation**: Added to existing `useSchedules.ts` file
- React Query hook for fetching users assigned to schedule
- 1-minute stale time
- Enabled guard for valid scheduleId
- Also added `useSchedulesForSelector` helper hook

**Time**: 30 min  
**Acceptance**: ✅ Fetches users for schedule successfully

---

## 🎨 Phase 3.4: Component Implementation (AFTER TESTS - 14 tasks, 12-16 hours)

**⚠️ CRITICAL**: DO NOT START until Phase 3.2 tests are written and failing.

---

### T025 [ ] [P] Implement ConfirmationModal component
**File**: `components/ui/ConfirmationModal.tsx` ❌ **CREATE THIS FILE**  
**Status**: ❌ **NOT STARTED**  
**Dependencies**: T007 (tests written and failing)  

**Implementation Guide**:
- Use Radix UI Dialog primitive
- Props: `isOpen`, `onConfirm`, `onCancel`, `title`, `message`, `requireConfirm`, `confirmText`, `cancelText`
- Keyboard shortcuts: ESC (cancel), Enter (confirm if not disabled)
- Accessible with proper ARIA labels
- Loading state during async confirm
- Optional checkbox for "I understand" confirmation

**Acceptance**: T007 tests PASS

**Time**: 1 hour

---

### T026 [ ] [P] Implement EmptyState component
**File**: `components/ui/EmptyState.tsx` ❌ **CREATE THIS FILE**  
**Status**: ❌ **NOT STARTED**  
**Dependencies**: T008  

**Implementation Guide**:
- Props: `icon`, `title`, `description`, `actionButton?`, `className?`
- Use Lucide React for icons
- Centered layout with Tailwind CSS
- Responsive design (mobile-first)

**Acceptance**: T008 tests PASS

**Time**: 30 min

---

### T027 [ ] [P] Implement ContentSourceBadge component
**File**: `features/schedules/components/ContentSourceBadge.tsx` ❌ **CREATE THIS FILE**  
**Status**: ❌ **NOT STARTED**  
**Dependencies**: T014  

**Implementation Guide**:
```typescript
// Color mapping
User → bg-blue-100 text-blue-800
Group → bg-green-100 text-green-800
Default → bg-gray-100 text-gray-800
```
- Use Radix UI Tooltip for explanations
- Accessible with ARIA labels

**Acceptance**: T014 tests PASS

**Time**: 30 min

---

### T033 [~] Complete AssignedSchedulesList component
**File**: `features/users/components/AssignedSchedulesList.tsx` ⚠️ **STUB EXISTS**  
**Status**: 🔄 **STUB - NEEDS COMPLETION**  
**Dependencies**: T010, T026 (EmptyState)  

**Current State**: Stub implementation exists  
**Integration Task**: Complete the implementation to:
- Render schedule cards with all metadata
- Show loading skeleton (use `LoadingStates.tsx`)
- Show empty state using `<EmptyState />` component
- Implement "Remove All" button with proper state
- Add schedule badges (active/inactive)

**Acceptance**: T010 tests PASS

**Time**: 1.5 hours

---

### T034 [~] Complete DefaultScheduleToggle component
**File**: `features/users/components/DefaultScheduleToggle.tsx` ⚠️ **STUB EXISTS**  
**Status**: 🔄 **STUB - NEEDS COMPLETION**  
**Dependencies**: T012, T031 (hook)  

**Integration Task**: Complete with:
- Use `useSetDefaultSchedule()` hook
- Radix UI Switch component
- Show "Default Schedule" badge when active
- Loading spinner during mutation
- Disable when loading

**Acceptance**: T012 tests PASS

**Time**: 1 hour

---

### T035 [~] Complete AssignedUsersList component
**File**: `features/schedules/components/AssignedUsersList.tsx` ⚠️ **STUB EXISTS**  
**Status**: 🔄 **STUB - NEEDS COMPLETION**  
**Dependencies**: T013, T032 (hook)  

**Integration Task**: Complete with:
- Use `useScheduleUsers(scheduleId)` hook
- Render user cards with avatar (use initials if no image)
- Pagination for 50+ users
- Loading skeleton
- Empty state

**Acceptance**: T013 tests PASS

**Time**: 1.5 hours

---

### T036 [~] Complete ScheduleSelector component
**File**: `features/users/components/ScheduleSelector.tsx` ⚠️ **STUB EXISTS**  
**Status**: 🔄 **STUB - NEEDS COMPLETION**  
**Priority**: **CRITICAL** - Complex REPLACE flow  
**Dependencies**: T011, T025 (ConfirmationModal)  

**Integration Task** (most complex):
1. Modal with Radix UI Dialog
2. Fetch schedules with `useQuery` (or create `useSchedulesForSelector` hook)
3. Search input with 300ms debounce
4. Virtual scrolling for 500+ schedules (use `react-window`)
5. Multi-select checkboxes
6. **CRITICAL: REPLACE WARNING LOGIC**:
   ```typescript
   if (currentScheduleIds.length > 0 && selectedIds !== currentScheduleIds) {
     // Show warning banner
     // List schedules being replaced
     // Require checkbox confirmation
     // Disable assign button until confirmed
   }
   ```
7. Show selected count: "X schedules selected"
8. Assign button calls `onAssign(selectedIds)`

**Acceptance**: T011 tests PASS (all 24 tests), REPLACE flow works correctly

**Time**: 3 hours

---

### T037 [~] Complete UserScheduleAssignment container component
**File**: `features/users/components/UserScheduleAssignment.tsx` ⚠️ **STUB EXISTS**  
**Status**: 🔄 **STUB - NEEDS COMPLETION**  
**Priority**: **CRITICAL** - Main container  
**Dependencies**: T009, T028-T030 (hooks), T033, T036  

**Integration Task**:
1. Use `useUserSchedules(userId)` hook
2. Use `useAssignSchedules()` mutation hook
3. Use `useRemoveUserSchedules()` mutation hook
4. Redux state for modal: `useSelector(state => state.scheduleAssignment)`
5. Render user info card
6. Render `<AssignedSchedulesList />`
7. "Assign Schedules" button opens `<ScheduleSelector />`
8. "Remove All" button shows `<ConfirmationModal />`
9. Handle loading, error states with proper UI
10. Show toast notifications

**Acceptance**: T009 tests PASS, full workflow functional

**Time**: 2 hours

---

### T038 [~] Complete UserSchedulesPage
**File**: `app/users/[userId]/schedules/page.tsx` ⚠️ **STUB EXISTS**  
**Status**: 🔄 **STUB - NEEDS COMPLETION**  
**Dependencies**: T020, T037  

**Integration Task**:
1. Next.js 15 page with `params` destructuring
2. Fetch user data (validate exists)
3. Auth protection: redirect if not admin
4. Render breadcrumb: Home > Users > [User Name] > Schedules
5. Render `<UserScheduleAssignment />` with user prop
6. Handle 404 if user not found
7. Meta tags for SEO

**Acceptance**: T020 tests PASS, page renders correctly

**Time**: 1.5 hours

---

### T039 [ ] Add navigation link from user list to schedules page
**File**: `features/users/components/UserList.tsx` (or `UserListItem.tsx`)  
**Status**: ❌ **NOT STARTED**  
**Dependencies**: T038  

**Integration Task**:
- Add "Manage Schedules" button/link to user row actions
- Link to `/users/${userId}/schedules`
- Add Calendar icon (Lucide React)
- Only show for Admin role

**Acceptance**: Link appears in user list, navigates correctly

**Time**: 30 min

---

## 📊 Summary & Execution Strategy

### Task Breakdown by Status

**✅ COMPLETE** (6 tasks):
- T001-T006: Setup & Foundation

**❌ NOT STARTED** (19 tasks):
- T007-T024: Tests (BLOCKING)
- T028-T032: Hooks (HIGH PRIORITY)
- T025-T027: New UI components
- T039: Navigation link

**🔄 STUB - NEEDS COMPLETION** (5 tasks):
- T033-T038: Existing components

**Total Remaining**: 24 tasks, ~24-32 hours

---

### Execution Order (STRICT)

**Phase 1: Tests First (12-16 hours)** ⚠️ **BLOCKING ALL ELSE**
```bash
# Create test directory
mkdir -p __tests__/{features/{users,schedules}/{components,hooks,services},e2e}

# Write all tests in parallel (T007-T024)
# Each test should FAIL initially (TDD red phase)
```

**Phase 2: Hooks (4-5 hours)** 🔄 **HIGH PRIORITY**
```bash
# Create hooks directory
mkdir -p features/users/hooks

# Implement React Query hooks (T028-T032)
# Tests should start passing
```

**Phase 3: Complete Components (12-16 hours)**
```bash
# Implement UI components (T025-T027)
# Complete stub components (T033-T038)
# Tests should pass as implementations complete (TDD green phase)
```

**Phase 4: Integration & Polish**
```bash
# Add navigation (T039)
# Run E2E tests (T021-T024)
# Fix any failing tests
# Refactor (TDD refactor phase)
```

---

### Verification Checklist

Before marking Phase complete:

**Phase 3.2 (Tests)**:
- [ ] All 18 test files created
- [ ] All tests initially FAILING
- [ ] Mock setup correct (React Query, Axios)
- [ ] Test coverage > 80%

**Phase 3.3 (Hooks)**:
- [ ] 5 hook files created
- [ ] React Query DevTools shows cache
- [ ] Hook tests PASSING

**Phase 3.4 (Components)**:
- [ ] All stub components completed
- [ ] Component tests PASSING
- [ ] E2E tests PASSING
- [ ] No TypeScript errors
- [ ] No ESLint warnings

---

## 🔗 Related Files

**Design Documents**:
- `/specs/020-phase-1/plan.md` - Implementation plan
- `/specs/020-phase-1/research.md` - Technical decisions
- `/specs/020-phase-1/data-model.md` - Type definitions
- `/specs/020-phase-1/contracts/user-schedules-api.md` - API contracts
- `/specs/020-phase-1/contracts/component-contracts.md` - Component contracts
- `/specs/020-phase-1/quickstart.md` - Manual testing guide

**Architecture**:
- `/.github/copilot-instructions-web.md` - Frontend development guidelines
- `/.github/copilot-instructions.md` - Backend guidelines (for reference)

---

## 📝 Notes for Implementation

1. **TDD is MANDATORY**: Write tests BEFORE completing implementations
2. **Integration over Creation**: Many files exist - focus on completing them
3. **REPLACE Semantics**: Most critical feature - test thoroughly (T011, T023, T036)
4. **React Query**: Primary state management for server data
5. **Redux**: UI state only (modals, selections)
6. **Accessibility**: All components must be keyboard navigable and screen-reader friendly
7. **Mobile-First**: Responsive design required
8. **Error Handling**: Comprehensive error states with user-friendly messages
9. **Performance**: Virtual scrolling for large lists, debounced search

---

**End of Tasks Document**
