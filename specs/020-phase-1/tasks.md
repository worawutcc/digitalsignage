# Tasks: User Schedule Assignment UI (Phase 1)

**Input**: Design documents from `/specs/020-phase-1/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Tech stack: Next.js 15, React 19, TypeScript 5.x, React Query, Redux Toolkit
   → Structure: Web frontend (src/digital-signage-web/)
2. Load design documents:
   → data-model.md: 35+ entities → type/schema tasks
   → contracts/: 2 files → component & API contract tests
   → quickstart.md: 10 scenarios → integration test tasks
3. Generate tasks by category:
   → Setup: Types, services, Redux state
   → Tests: Component contract tests (TDD)
   → Core: React components & hooks
   → Integration: Pages, navigation, E2E tests
   → Polish: Performance, accessibility, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Tasks numbered T001-T070
6. Total estimate: 38-52 hours
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
**Project**: Web frontend at `src/digital-signage-web/src/`
- Components: `features/[domain]/components/`
- Hooks: `features/[domain]/hooks/`
- Services: `features/[domain]/services/`
- Types: `features/[domain]/types/`
- Tests: `src/digital-signage-web/__tests__/features/`
- E2E: `src/digital-signage-web/__tests__/e2e/`

---

## Phase 3.1: Setup & Foundation (6 tasks, 4-6 hours)

### T001 [P] Create TypeScript types for UserSchedule domain
**File**: `src/digital-signage-web/src/features/users/types/userSchedule.ts`
**Description**: 
- Create `UserSchedule` interface
- Create `UserScheduleSummary` interface
- Create `AssignSchedulesRequest` type
- Create `RemoveSchedulesResponse` type
- Export all types
**Dependencies**: None
**Time**: 30 min
**Acceptance**: 
- All types match data-model.md specifications
- TypeScript compiles without errors

### T002 [P] Create TypeScript types for Schedule domain enhancements
**File**: `src/digital-signage-web/src/features/schedules/types/schedule.ts`
**Description**:
- Add `isDefault: boolean` to Schedule interface
- Add `assignedUsersCount: number` to Schedule interface
- Add `contentSource: 'User' | 'Group' | 'Default'` to Schedule interface
- Create `ScheduleListItem` type
- Create `ScheduleUsersResponse` type
- Create `SetDefaultScheduleRequest` type
**Dependencies**: None
**Time**: 30 min
**Acceptance**:
- Schedule type enhanced per data-model.md
- No breaking changes to existing code

### T003 [P] Create Zod validation schemas
**File**: `src/digital-signage-web/src/features/users/schemas/scheduleAssignment.schema.ts`
**Description**:
- Create `assignSchedulesSchema` with Zod
  - `scheduleIds: z.array(z.number()).min(1)`
  - Custom validation for inactive schedules
  - `confirmReplace: z.boolean()` validation
- Create `scheduleSelectionSchema`
- Export all schemas
**Dependencies**: None
**Time**: 45 min
**Acceptance**:
- Schemas validate per business rules in data-model.md
- Error messages are user-friendly

### T004 Implement userScheduleService API client
**File**: `src/digital-signage-web/src/features/users/services/userScheduleService.ts`
**Description**:
- Implement `getUserSchedules(userId: number)` method
- Implement `assignSchedules(userId: number, scheduleIds: number[])` method
- Implement `removeAllSchedules(userId: number)` method
- Use Axios instance with interceptors
- Handle JWT authentication headers
- Parse error responses
**Dependencies**: T001
**Time**: 1 hour
**Acceptance**:
- All 3 methods match user-schedules-api.md contracts
- Error handling covers 401, 403, 404, 422, 500
- Returns properly typed responses

### T005 Update scheduleService with new methods
**File**: `src/digital-signage-web/src/features/schedules/services/scheduleService.ts`
**Description**:
- Add `getScheduleUsers(scheduleId: number)` method
- Add `setDefaultSchedule(scheduleId: number, isDefault: boolean)` method
- Add `getSchedulesForSelector(query?: string)` method with pagination support
- Maintain existing methods
**Dependencies**: T002
**Time**: 1 hour
**Acceptance**:
- New methods match user-schedules-api.md contracts
- Existing functionality not broken
- Supports pagination and search

### T006 Create Redux slice for schedule assignment UI state
**File**: `src/digital-signage-web/src/store/slices/scheduleAssignmentSlice.ts`
**Description**:
- Create slice with initial state:
  - `isAssignModalOpen: boolean`
  - `isRemoveModalOpen: boolean`
  - `selectedScheduleIds: number[]`
  - `searchQuery: string`
- Create actions: `openAssignModal`, `closeAssignModal`, `toggleScheduleSelection`, `setSearchQuery`
- Create selectors
**Dependencies**: None
**Time**: 45 min
**Acceptance**:
- Redux DevTools shows state changes
- Actions properly typed with TypeScript
- Selectors return correct values

---

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3 (18 tasks, 12-16 hours)

### T007 [P] Contract test for ConfirmationModal component
**File**: `src/digital-signage-web/__tests__/components/ui/ConfirmationModal.test.tsx`
**Description**:
- Test modal renders with title and message
- Test confirm button calls onConfirm
- Test cancel button calls onCancel
- Test checkbox requirement when requireConfirm=true
- Test ESC key closes modal
- Test backdrop click behavior
**Dependencies**: None
**Time**: 45 min
**Acceptance**: Tests written, all FAIL initially

### T008 [P] Contract test for EmptyState component
**File**: `src/digital-signage-web/__tests__/components/ui/EmptyState.test.tsx`
**Description**:
- Test renders icon, title, description
- Test action button renders when provided
- Test no action button when not provided
- Test custom className applied
**Dependencies**: None
**Time**: 30 min
**Acceptance**: Tests written, all FAIL initially

### T009 [P] Contract test for UserScheduleAssignment component
**File**: `src/digital-signage-web/__tests__/features/users/UserScheduleAssignment.test.tsx`
**Description**:
- Test renders with user info
- Test fetches schedules on mount (mock React Query)
- Test shows loading skeleton while fetching
- Test shows error state on fetch failure
- Test opens selector modal on "Assign" click
- Test closes modal after successful assignment
- Test shows confirmation before remove all
- Test invalidates cache after mutation
**Dependencies**: None
**Time**: 1.5 hours
**Acceptance**: Tests written with React Testing Library, all FAIL initially

### T010 [P] Contract test for AssignedSchedulesList component
**File**: `src/digital-signage-web/__tests__/features/users/AssignedSchedulesList.test.tsx`
**Description**:
- Test renders list of schedules
- Test shows schedule details (name, date, admin)
- Test shows empty state when no schedules
- Test shows loading skeleton while isLoading=true
- Test calls onRemoveAll when button clicked
- Test disables remove button when schedules array empty
**Dependencies**: None
**Time**: 1 hour
**Acceptance**: Tests written, all FAIL initially

### T011 [P] Contract test for ScheduleSelector component
**File**: `src/digital-signage-web/__tests__/features/schedules/ScheduleSelector.test.tsx`
**Description**:
- Test modal renders when isOpen=true
- Test fetches available schedules
- Test shows search input
- Test filters schedules by search query
- Test checkbox selection updates state
- Test shows REPLACE warning when currentScheduleIds not empty
- Test warning requires checkbox confirmation
- Test assign button disabled until valid selection
- Test calls onAssign with selected IDs
- Test calls onClose on cancel
**Dependencies**: None
**Time**: 2 hours
**Acceptance**: Tests written, all FAIL initially (most complex component)

### T012 [P] Contract test for DefaultScheduleToggle component
**File**: `src/digital-signage-web/__tests__/features/schedules/DefaultScheduleToggle.test.tsx`
**Description**:
- Test renders toggle in correct state
- Test shows "Default Schedule" badge when isDefault=true
- Test toggle calls mutation on change
- Test shows loading state during mutation
- Test shows error toast on mutation failure
- Test only one schedule can be default (business rule)
**Dependencies**: None
**Time**: 1 hour
**Acceptance**: Tests written, all FAIL initially

### T013 [P] Contract test for AssignedUsersList component
**File**: `src/digital-signage-web/__tests__/features/schedules/AssignedUsersList.test.tsx`
**Description**:
- Test fetches users assigned to schedule
- Test renders user cards with avatar and info
- Test shows empty state when no users
- Test shows loading skeleton
- Test handles fetch error
- Test pagination works for 50+ users
**Dependencies**: None
**Time**: 1 hour
**Acceptance**: Tests written, all FAIL initially

### T014 [P] Contract test for ContentSourceBadge component
**File**: `src/digital-signage-web/__tests__/features/schedules/ContentSourceBadge.test.tsx`
**Description**:
- Test renders "User" badge with blue color
- Test renders "Group" badge with green color
- Test renders "Default" badge with gray color
- Test tooltip shows explanation
**Dependencies**: None
**Time**: 30 min
**Acceptance**: Tests written, all FAIL initially

### T015 [P] Unit tests for userScheduleService
**File**: `src/digital-signage-web/__tests__/features/users/services/userScheduleService.test.ts`
**Description**:
- Mock Axios requests
- Test getUserSchedules success
- Test getUserSchedules error handling (401, 403, 404, 500)
- Test assignSchedules success with REPLACE
- Test assignSchedules validation errors (422)
- Test removeAllSchedules success
- Test JWT token included in headers
**Dependencies**: T004
**Time**: 1.5 hours
**Acceptance**: Service tests pass, cover all error scenarios

### T016 [P] Unit tests for scheduleService new methods
**File**: `src/digital-signage-web/__tests__/features/schedules/services/scheduleService.test.ts`
**Description**:
- Test getScheduleUsers success
- Test setDefaultSchedule mutation
- Test getSchedulesForSelector with search/pagination
- Test error handling for all methods
**Dependencies**: T005
**Time**: 1 hour
**Acceptance**: Tests pass, 100% coverage of new methods

### T017 [P] Integration test for useUserSchedules hook
**File**: `src/digital-signage-web/__tests__/features/users/hooks/useUserSchedules.test.tsx`
**Description**:
- Test hook fetches data on mount
- Test caching works (second call uses cache)
- Test refetch on window focus
- Test error state
- Test loading state
**Dependencies**: None
**Time**: 1 hour
**Acceptance**: Tests written using React Query testing utils

### T018 [P] Integration test for useAssignSchedules hook
**File**: `src/digital-signage-web/__tests__/features/users/hooks/useAssignSchedules.test.tsx`
**Description**:
- Test mutation calls API correctly
- Test optimistic update
- Test cache invalidation after success
- Test error handling
- Test onSuccess callback
**Dependencies**: None
**Time**: 1 hour
**Acceptance**: Tests written, all FAIL initially

### T019 [P] Integration test for useSetDefaultSchedule hook
**File**: `src/digital-signage-web/__tests__/features/schedules/hooks/useSetDefaultSchedule.test.tsx`
**Description**:
- Test toggle default flag mutation
- Test only one schedule can be default
- Test cache invalidation
- Test error rollback
**Dependencies**: None
**Time**: 45 min
**Acceptance**: Tests written, all FAIL initially

### T020 [P] Contract test for UserSchedulesPage
**File**: `src/digital-signage-web/__tests__/app/users/[userId]/schedules/page.test.tsx`
**Description**:
- Test page renders with userId param
- Test fetches user data
- Test renders UserScheduleAssignment component
- Test requires admin authentication
- Test redirects to 404 if user not found
- Test breadcrumb navigation
**Dependencies**: None
**Time**: 1 hour
**Acceptance**: Tests written, all FAIL initially

### T021 [P] E2E test: View user schedules
**File**: `src/digital-signage-web/__tests__/e2e/user-schedule-assignment.spec.ts`
**Description**:
- Navigate to /users/123/schedules
- Verify page renders
- Verify user info displayed
- Verify assigned schedules list
- Verify empty state when no assignments
**Dependencies**: None
**Time**: 45 min
**Acceptance**: Playwright test written, FAILS initially

### T022 [P] E2E test: Assign schedules (new assignment)
**File**: `src/digital-signage-web/__tests__/e2e/user-schedule-assignment.spec.ts`
**Description**:
- Click "Assign Schedules" button
- Modal opens
- Search for schedule
- Select 2 schedules
- No warning shown (no existing assignments)
- Click assign
- Verify success toast
- Verify schedules appear in list
**Dependencies**: None
**Time**: 1 hour
**Acceptance**: Playwright test written, FAILS initially

### T023 [P] E2E test: Replace assignments with warning
**File**: `src/digital-signage-web/__tests__/e2e/user-schedule-assignment.spec.ts`
**Description**:
- User already has 2 schedules assigned
- Click "Assign Schedules"
- Select 3 different schedules
- REPLACE warning appears
- Checkbox "I understand" required
- Click assign after confirming
- Verify old schedules replaced
- Verify new schedules displayed
**Dependencies**: None
**Time**: 1.5 hours
**Acceptance**: Playwright test covers critical REPLACE flow

### T024 [P] E2E test: Error handling scenarios
**File**: `src/digital-signage-web/__tests__/e2e/user-schedule-assignment.spec.ts`
**Description**:
- Test 401 unauthorized redirect
- Test 403 forbidden error toast
- Test 404 user not found
- Test 422 validation error display
- Test 500 server error with retry
**Dependencies**: None
**Time**: 1 hour
**Acceptance**: All error scenarios tested

---

## Phase 3.3: Core Implementation (ONLY after tests are failing) (20 tasks, 16-20 hours)

### T025 [P] Implement ConfirmationModal component
**File**: `src/digital-signage-web/src/components/ui/ConfirmationModal.tsx`
**Description**:
- Create reusable modal with Radix UI Dialog
- Support title, message, confirmText, cancelText props
- Optional checkbox for "I understand" confirmation
- Keyboard shortcuts (ESC, Enter)
- Accessible with proper ARIA labels
**Dependencies**: T007
**Time**: 1 hour
**Acceptance**: T007 tests pass

### T026 [P] Implement EmptyState component
**File**: `src/digital-signage-web/src/components/ui/EmptyState.tsx`
**Description**:
- Create reusable empty state with Lucide icon
- Support icon, title, description, actionButton props
- Centered layout with Tailwind
- Responsive design
**Dependencies**: T008
**Time**: 30 min
**Acceptance**: T008 tests pass

### T027 [P] Implement ContentSourceBadge component
**File**: `src/digital-signage-web/src/features/schedules/components/ContentSourceBadge.tsx`
**Description**:
- Render badge based on contentSource prop
- User = blue, Group = green, Default = gray
- Add tooltip with Radix UI Tooltip
- Use Tailwind for styling
**Dependencies**: T014
**Time**: 30 min
**Acceptance**: T014 tests pass

### T028 Implement useUserSchedules React Query hook
**File**: `src/digital-signage-web/src/features/users/hooks/useUserSchedules.ts`
**Description**:
- Create hook using useQuery
- Query key: `['userSchedules', userId]`
- Call userScheduleService.getUserSchedules
- Enable caching with staleTime: 5 minutes
- Auto-refetch on window focus
**Dependencies**: T004, T017
**Time**: 45 min
**Acceptance**: T017 tests pass, data fetched correctly

### T029 Implement useAssignSchedules React Query mutation hook
**File**: `src/digital-signage-web/src/features/users/hooks/useAssignSchedules.ts`
**Description**:
- Create hook using useMutation
- Call userScheduleService.assignSchedules
- Optimistic update (immediate UI change)
- Invalidate ['userSchedules', userId] on success
- Show toast notification on success/error
**Dependencies**: T004, T018
**Time**: 1 hour
**Acceptance**: T018 tests pass, optimistic updates work

### T030 Implement useRemoveUserSchedules mutation hook
**File**: `src/digital-signage-web/src/features/users/hooks/useRemoveUserSchedules.ts`
**Description**:
- Create hook using useMutation
- Call userScheduleService.removeAllSchedules
- Invalidate cache on success
- Show confirmation toast
**Dependencies**: T004
**Time**: 30 min
**Acceptance**: Mutation works, cache invalidated

### T031 Implement useSetDefaultSchedule React Query mutation hook
**File**: `src/digital-signage-web/src/features/schedules/hooks/useSetDefaultSchedule.ts`
**Description**:
- Create hook using useMutation
- Call scheduleService.setDefaultSchedule
- Optimistic update for immediate UI feedback
- Invalidate ['schedules'] cache
- Handle "only one default" business rule
**Dependencies**: T005, T019
**Time**: 45 min
**Acceptance**: T019 tests pass, toggle works correctly

### T032 Implement useScheduleUsers hook
**File**: `src/digital-signage-web/src/features/schedules/hooks/useScheduleUsers.ts`
**Description**:
- Create hook using useQuery
- Query key: `['scheduleUsers', scheduleId]`
- Call scheduleService.getScheduleUsers
- Support pagination
**Dependencies**: T005
**Time**: 30 min
**Acceptance**: Fetches users assigned to schedule

### T033 Implement AssignedSchedulesList component
**File**: `src/digital-signage-web/src/features/users/components/AssignedSchedulesList.tsx`
**Description**:
- Render schedule cards with name, description, dates
- Show assigned metadata (date, admin)
- "Remove All" button (disabled when empty)
- Loading skeleton component
- Empty state using EmptyState component
**Dependencies**: T010, T026
**Time**: 1.5 hours
**Acceptance**: T010 tests pass, UI matches Figma (if exists)

### T034 Implement DefaultScheduleToggle component
**File**: `src/digital-signage-web/src/features/schedules/components/DefaultScheduleToggle.tsx`
**Description**:
- Render toggle switch with Radix UI Switch
- Show "Default Schedule" badge when active
- Call useSetDefaultSchedule hook on change
- Show loading spinner during mutation
- Disable when loading
**Dependencies**: T012, T031
**Time**: 1 hour
**Acceptance**: T012 tests pass, toggle functional

### T035 Implement AssignedUsersList component
**File**: `src/digital-signage-web/src/features/schedules/components/AssignedUsersList.tsx`
**Description**:
- Use useScheduleUsers hook
- Render user cards with avatar, name, email
- Pagination for 50+ users
- Loading skeleton
- Empty state
**Dependencies**: T013, T032
**Time**: 1.5 hours
**Acceptance**: T013 tests pass, pagination works

### T036 Implement ScheduleSelector component (critical REPLACE flow)
**File**: `src/digital-signage-web/src/features/schedules/components/ScheduleSelector.tsx`
**Description**:
- Modal with Radix UI Dialog
- Fetch schedules with search/filter
- Multi-select checkboxes
- Search input with debounce (300ms)
- Virtual scrolling for 500+ schedules (react-window)
- **REPLACE WARNING LOGIC**:
  - If currentScheduleIds.length > 0, show warning banner
  - "⚠️ This will REPLACE your existing assignments"
  - Require "I understand" checkbox
  - Disable assign button until confirmed
- Assign button calls onAssign callback
- Show selected count: "3 schedules selected"
**Dependencies**: T011, T025
**Time**: 3 hours
**Acceptance**: T011 tests pass, REPLACE warning works correctly

### T037 Implement UserScheduleAssignment container component
**File**: `src/digital-signage-web/src/features/users/components/UserScheduleAssignment.tsx`
**Description**:
- Use useUserSchedules hook
- Redux state for modal open/close
- Render user info card (name, email, device count)
- Render AssignedSchedulesList
- "Assign Schedules" button opens ScheduleSelector
- "Remove All" button shows ConfirmationModal
- Handle loading, error states
- Show toast notifications
**Dependencies**: T009, T028, T029, T030, T033, T036
**Time**: 2 hours
**Acceptance**: T009 tests pass, full workflow functional

### T038 Create UserSchedulesPage
**File**: `src/digital-signage-web/src/app/users/[userId]/schedules/page.tsx`
**Description**:
- Next.js 15 page with params
- Fetch user data (validate exists)
- Breadcrumb: Home > Users > [User Name] > Schedules
- Render UserScheduleAssignment component
- Protect route with admin auth (redirect if not admin)
- 404 page if user not found
- Meta tags for SEO
**Dependencies**: T020, T037
**Time**: 1.5 hours
**Acceptance**: T020 tests pass, page renders correctly

### T039 Add navigation link from user list to schedules page
**File**: `src/digital-signage-web/src/features/users/components/UserListItem.tsx` (or similar)
**Description**:
- Add "Manage Schedules" button/link to user row actions
- Link to `/users/${userId}/schedules`
- Add icon (Calendar or List)
**Dependencies**: T038
**Time**: 30 min
**Acceptance**: Link navigates to correct page

### T040 Update schedules page with new components
**File**: `src/digital-signage-web/src/app/schedules/page.tsx` (or similar)
**Description**:
- Add DefaultScheduleToggle to each schedule row
- Add ContentSourceBadge to show User/Group/Default priority
- Add "Assigned Users" count with click to view AssignedUsersList
- Modal or sidebar to show AssignedUsersList
**Dependencies**: T027, T034, T035
**Time**: 2 hours
**Acceptance**: Schedule list enhanced with new features

### T041 Implement breadcrumb navigation
**File**: `src/digital-signage-web/src/components/layout/Breadcrumb.tsx`
**Description**:
- Create reusable breadcrumb component
- Support dynamic segments
- Clickable links with Next.js Link
- Accessible navigation
- Use in UserSchedulesPage
**Dependencies**: None
**Time**: 45 min
**Acceptance**: Breadcrumbs render correctly on schedule pages

### T042 Add mobile responsive styles to UserScheduleAssignment
**File**: `src/digital-signage-web/src/features/users/components/UserScheduleAssignment.tsx`
**Description**:
- Responsive grid/flex layouts (Tailwind breakpoints)
- Stack components vertically on mobile
- Touch-friendly buttons (min 44px height)
- Test on 375px, 768px, 1024px viewports
**Dependencies**: T037
**Time**: 1 hour
**Acceptance**: Looks good on mobile, tablet, desktop

### T043 Add mobile responsive styles to ScheduleSelector
**File**: `src/digital-signage-web/src/features/schedules/components/ScheduleSelector.tsx`
**Description**:
- Full-screen modal on mobile
- Search input full width
- Larger tap targets for checkboxes
- Bottom-sheet style on mobile
**Dependencies**: T036
**Time**: 1 hour
**Acceptance**: Modal usable on mobile devices

### T044 Implement toast notifications for all actions
**File**: `src/digital-signage-web/src/hooks/useToast.ts` (or use existing)
**Description**:
- Success toast: "Schedules assigned successfully"
- Success toast: "All schedules removed"
- Success toast: "Default schedule updated"
- Error toast: "Failed to assign schedules: [error message]"
- Warning toast: "You are replacing existing assignments"
- Use toast library (react-hot-toast or shadcn toast)
**Dependencies**: None
**Time**: 45 min
**Acceptance**: Toasts appear for all mutations

---

## Phase 3.4: Integration & E2E (6 tasks, 4-6 hours)

### T045 Run and fix E2E test: View user schedules
**File**: `src/digital-signage-web/__tests__/e2e/user-schedule-assignment.spec.ts`
**Description**:
- Run T021 test with Playwright
- Fix any failures
- Verify navigation, rendering, data display
**Dependencies**: T021, T038
**Time**: 30 min
**Acceptance**: T021 test passes

### T046 Run and fix E2E test: Assign schedules (new)
**File**: `src/digital-signage-web/__tests__/e2e/user-schedule-assignment.spec.ts`
**Description**:
- Run T022 test
- Fix modal interactions
- Verify assignment flow works end-to-end
**Dependencies**: T022, T036, T037
**Time**: 45 min
**Acceptance**: T022 test passes

### T047 Run and fix E2E test: Replace assignments with warning
**File**: `src/digital-signage-web/__tests__/e2e/user-schedule-assignment.spec.ts`
**Description**:
- Run T023 test
- Verify REPLACE warning appears
- Verify checkbox requirement enforced
- Verify old schedules replaced
**Dependencies**: T023, T036
**Time**: 1 hour
**Acceptance**: T023 test passes, REPLACE flow validated

### T048 Run and fix E2E test: Error handling
**File**: `src/digital-signage-web/__tests__/e2e/user-schedule-assignment.spec.ts`
**Description**:
- Run T024 test
- Mock backend errors (401, 403, 404, 422, 500)
- Verify error messages display
- Verify retry logic
**Dependencies**: T024, T037
**Time**: 1 hour
**Acceptance**: T024 test passes, all errors handled gracefully

### T049 Integration test: Full user journey
**File**: `src/digital-signage-web/__tests__/e2e/user-schedule-full-journey.spec.ts`
**Description**:
- Login as admin
- Navigate to users list
- Click "Manage Schedules" for user
- Assign 3 schedules
- Remove all schedules
- Re-assign 2 different schedules (REPLACE)
- Navigate to schedules page
- Toggle default flag
- View assigned users
- Logout
**Dependencies**: T045-T048
**Time**: 1.5 hours
**Acceptance**: Complete journey works without errors

### T050 Cross-browser testing
**File**: Run E2E tests on multiple browsers
**Description**:
- Run all E2E tests on Chrome
- Run all E2E tests on Firefox
- Run all E2E tests on Safari (if Mac)
- Run all E2E tests on Edge
- Fix browser-specific issues
**Dependencies**: T045-T049
**Time**: 1 hour
**Acceptance**: All tests pass on all browsers

---

## Phase 3.5: Performance & Polish (10 tasks, 5-8 hours)

### T051 Implement virtual scrolling for schedule selector
**File**: `src/digital-signage-web/src/features/schedules/components/ScheduleSelector.tsx`
**Description**:
- Install react-window
- Replace plain list with FixedSizeList
- Render only visible items (500+ schedules)
- Maintain scroll position on search
**Dependencies**: T036
**Time**: 1 hour
**Acceptance**: Smooth scrolling with 1000+ schedules, <16ms frame time

### T052 Add debounced search in schedule selector
**File**: `src/digital-signage-web/src/features/schedules/components/ScheduleSelector.tsx`
**Description**:
- Use useDebouncedValue hook (300ms)
- Prevent API calls on every keystroke
- Show loading indicator while searching
**Dependencies**: T036
**Time**: 30 min
**Acceptance**: Search queries debounced, fewer API calls

### T053 Optimize React Query cache invalidation
**File**: Multiple hook files
**Description**:
- Review all invalidateQueries calls
- Use specific query keys (avoid invalidating too much)
- Implement optimistic updates for instant feedback
- Set appropriate staleTime and cacheTime
**Dependencies**: T028-T032
**Time**: 1 hour
**Acceptance**: Cache efficiently managed, no unnecessary refetches

### T054 Add loading skeletons for all async operations
**File**: `src/digital-signage-web/src/components/ui/Skeleton.tsx` and component files
**Description**:
- Create reusable Skeleton component
- Add to AssignedSchedulesList (skeleton cards)
- Add to ScheduleSelector (skeleton rows)
- Add to AssignedUsersList (skeleton users)
- Add to UserSchedulesPage (skeleton header)
**Dependencies**: T033, T035, T036, T038
**Time**: 1 hour
**Acceptance**: All loading states have skeletons, no blank screens

### T055 Implement optimistic updates for all mutations
**File**: Hook files for mutations
**Description**:
- useAssignSchedules: Update cache immediately before API call
- useRemoveUserSchedules: Clear list immediately
- useSetDefaultSchedule: Toggle flag immediately
- Rollback on error
**Dependencies**: T029-T031
**Time**: 1.5 hours
**Acceptance**: UI responds instantly, rollback on error works

### T056 Accessibility audit and fixes
**File**: All component files
**Description**:
- Run axe DevTools on all pages
- Fix all WCAG violations
- Add proper ARIA labels to modals
- Ensure keyboard navigation works
- Add focus management (trap focus in modals)
- Test with screen reader (VoiceOver or NVDA)
**Dependencies**: T025-T044
**Time**: 2 hours
**Acceptance**: 0 axe violations, keyboard navigation works, screen reader friendly

### T057 Performance audit with Lighthouse
**File**: All pages
**Description**:
- Run Lighthouse on UserSchedulesPage
- Run Lighthouse on Schedules page
- Optimize bundle size (code splitting)
- Optimize images (if any)
- Target: Performance score > 90
**Dependencies**: T038, T040
**Time**: 1 hour
**Acceptance**: Lighthouse score > 90, no performance warnings

### T058 Add error boundaries around major components
**File**: `src/digital-signage-web/src/components/ErrorBoundary.tsx`
**Description**:
- Create ErrorBoundary component
- Wrap UserScheduleAssignment
- Wrap ScheduleSelector
- Show user-friendly error UI
- Log errors to monitoring service
**Dependencies**: T037, T036
**Time**: 45 min
**Acceptance**: Errors caught, app doesn't crash

### T059 Code review and refactoring
**File**: All component files
**Description**:
- Remove duplicate code
- Extract reusable hooks
- Simplify complex components
- Add JSDoc comments to public functions
- Ensure consistent naming conventions
**Dependencies**: All implementation tasks
**Time**: 1.5 hours
**Acceptance**: Code is DRY, well-documented, follows conventions

### T060 Run full test suite and fix flaky tests
**File**: All test files
**Description**:
- Run all unit tests: `npm test`
- Run all E2E tests: `npm run test:e2e`
- Fix any flaky tests (re-run 3 times each)
- Ensure 100% pass rate
**Dependencies**: All test tasks
**Time**: 1 hour
**Acceptance**: All tests pass consistently (3 consecutive runs)

---

## Phase 3.6: Documentation & Validation (10 tasks, 4-5 hours)

### T061 [P] Update README with Phase 1 features
**File**: `src/digital-signage-web/README.md`
**Description**:
- Add "User Schedule Assignment" section
- Document new features (assign, replace, default toggle, user list)
- Add screenshots (if available)
- Link to quickstart guide
**Dependencies**: None
**Time**: 30 min
**Acceptance**: README updated, clear feature description

### T062 [P] Document API integration patterns
**File**: `docs/api-integration.md` (create if needed)
**Description**:
- Document userScheduleService usage
- Document React Query hook patterns
- Show example API calls
- Document error handling strategy
**Dependencies**: None
**Time**: 45 min
**Acceptance**: Developers can understand API integration from docs

### T063 [P] Create developer guide for REPLACE semantics
**File**: `docs/replace-semantics-guide.md`
**Description**:
- Explain REPLACE vs APPEND behavior
- Document warning modal requirement
- Show code examples
- Explain business justification
- Add flowchart (if helpful)
**Dependencies**: None
**Time**: 45 min
**Acceptance**: REPLACE semantics clearly documented

### T064 [P] Update component library documentation
**File**: `docs/components.md` or Storybook stories
**Description**:
- Document ConfirmationModal props and usage
- Document EmptyState props and usage
- Document ContentSourceBadge usage
- Add code examples
**Dependencies**: None
**Time**: 1 hour
**Acceptance**: Reusable components documented for team

### T065 Run manual testing using quickstart.md (Scenario 1-3)
**File**: `specs/020-phase-1/quickstart.md`
**Description**:
- Manually execute Scenario 1 (View user schedules)
- Manually execute Scenario 2 (Assign new)
- Manually execute Scenario 3 (Replace with warning) - CRITICAL
- Check all acceptance criteria
- Document any issues
**Dependencies**: T038, T037, T036
**Time**: 1 hour
**Acceptance**: All scenarios pass manual testing

### T066 Run manual testing using quickstart.md (Scenario 4-7)
**File**: `specs/020-phase-1/quickstart.md`
**Description**:
- Manually execute Scenario 4 (Remove all)
- Manually execute Scenario 5 (View users for schedule)
- Manually execute Scenario 6 (Toggle default)
- Manually execute Scenario 7 (Search and filter)
**Dependencies**: T038-T040
**Time**: 1 hour
**Acceptance**: All scenarios pass

### T067 Run manual testing using quickstart.md (Scenario 8-10)
**File**: `specs/020-phase-1/quickstart.md`
**Description**:
- Manually execute Scenario 8 (Mobile responsive)
- Manually execute Scenario 9 (Error handling - 5 sub-tests)
- Manually execute Scenario 10 (Performance testing - 4 sub-tests)
**Dependencies**: T042, T043, T051, T057
**Time**: 1.5 hours
**Acceptance**: All scenarios pass, performance meets goals

### T068 Build production bundle and test
**File**: Build output
**Description**:
- Run `npm run build` for production
- Fix any build errors
- Verify bundle size < 500KB (gzipped) for this feature
- Test production build locally
**Dependencies**: All implementation
**Time**: 30 min
**Acceptance**: Production build succeeds, bundle size acceptable

### T069 Deploy to staging environment
**File**: Deployment config
**Description**:
- Deploy to staging server
- Verify environment variables set correctly
- Smoke test on staging (basic flows)
- Check API connectivity
**Dependencies**: T068
**Time**: 30 min
**Acceptance**: Staging deployment successful, basic features work

### T070 Final QA validation checklist
**File**: `specs/020-phase-1/quickstart.md`
**Description**:
- ✅ All 30 functional requirements (FR-001 to FR-030) met
- ✅ REPLACE semantics work correctly with warning
- ✅ Default schedule toggle works (only one default)
- ✅ User list per schedule displays correctly
- ✅ Mobile responsive on 3 screen sizes
- ✅ All E2E tests pass
- ✅ Performance meets goals (< 2s load, < 500ms API render)
- ✅ Accessibility score > 90
- ✅ No console errors
- ✅ Ready for production deployment
**Dependencies**: T061-T069
**Time**: 1 hour
**Acceptance**: All checkboxes pass, feature ready for production

---

## Dependencies Graph

```
Setup (T001-T006) → Tests (T007-T024) → Implementation (T025-T044)
                          ↓                        ↓
                    [Must FAIL]              [Tests PASS]
                                                  ↓
                                    Integration (T045-T050)
                                                  ↓
                                        Polish (T051-T060)
                                                  ↓
                                      Documentation (T061-T070)
```

**Critical Path** (longest dependency chain):
```
T001 → T004 → T015 → T028 → T029 → T037 → T038 → T045 → T049 → T065 → T070
(~20 hours on critical path)
```

**Parallel Opportunities**:
- T001, T002, T003, T006 can run in parallel (foundation types)
- T007-T024 can ALL run in parallel (contract tests, different files)
- T025, T026, T027 can run in parallel (UI components, different files)
- T061-T064 can run in parallel (documentation)

---

## Parallel Execution Examples

### Round 1: Foundation (6 tasks in parallel)
```bash
Task T001: Create TypeScript types for UserSchedule domain
Task T002: Create TypeScript types for Schedule domain enhancements
Task T003: Create Zod validation schemas
Task T006: Create Redux slice for schedule assignment UI state
# Wait for T001, T002 to complete before T004, T005
```

### Round 2: Contract Tests (18 tasks in parallel)
```bash
Task T007: Contract test for ConfirmationModal component
Task T008: Contract test for EmptyState component
Task T009: Contract test for UserScheduleAssignment component
Task T010: Contract test for AssignedSchedulesList component
Task T011: Contract test for ScheduleSelector component
Task T012: Contract test for DefaultScheduleToggle component
Task T013: Contract test for AssignedUsersList component
Task T014: Contract test for ContentSourceBadge component
Task T017: Integration test for useUserSchedules hook
Task T018: Integration test for useAssignSchedules hook
Task T019: Integration test for useSetDefaultSchedule hook
Task T020: Contract test for UserSchedulesPage
Task T021: E2E test: View user schedules
Task T022: E2E test: Assign schedules (new)
Task T023: E2E test: Replace assignments with warning
Task T024: E2E test: Error handling scenarios
# All tests should FAIL at this stage
```

### Round 3: Simple UI Components (3 tasks in parallel)
```bash
Task T025: Implement ConfirmationModal component
Task T026: Implement EmptyState component
Task T027: Implement ContentSourceBadge component
# These have no dependencies on each other
```

---

## Validation Checklist
*GATE: Checked before considering tasks complete*

- [x] All API contracts (6 endpoints) have contract tests (T015, T016)
- [x] All components (10) have contract tests (T007-T014, T020)
- [x] All tests come before implementation (T007-T024 before T025-T044)
- [x] Parallel tasks [P] are truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Critical REPLACE flow thoroughly tested (T011, T023, T036, T047, T065)
- [x] All 10 quickstart scenarios have manual tests (T065-T067)
- [x] Performance goals validated (T051, T057, T067)
- [x] Accessibility validated (T056)

---

## Task Summary

**Total Tasks**: 70  
**Total Estimated Time**: 42-54 hours

**By Phase**:
- Setup: 6 tasks, 4-6 hours
- Tests (TDD): 18 tasks, 12-16 hours
- Implementation: 20 tasks, 16-20 hours
- Integration: 6 tasks, 4-6 hours
- Polish: 10 tasks, 5-8 hours
- Documentation: 10 tasks, 4-5 hours

**By Parallelizability**:
- Sequential tasks: 42 (need dependencies resolved first)
- Parallel tasks [P]: 28 (can run simultaneously)

**Critical REPLACE Flow Tasks** (highest priority):
- T003: Zod validation with confirmReplace
- T011: ScheduleSelector contract test with warning
- T036: ScheduleSelector implementation (REPLACE warning logic)
- T023: E2E test for REPLACE warning
- T047: Fix and validate E2E REPLACE test
- T065: Manual testing Scenario 3 (REPLACE)

---

## Notes

- **TDD Mandatory**: Tests T007-T024 MUST be written and MUST FAIL before implementing T025-T044
- **REPLACE Semantics**: This is the most critical feature - requires explicit warning modal with checkbox confirmation
- **Commit Frequency**: Commit after each task or logical group (e.g., after all contract tests pass)
- **Code Review**: Recommend review after T044 (all core implementation) before polish phase
- **Backend Dependency**: All 6 backend APIs are already implemented (Feature 019) - no backend changes needed
- **Virtual Scrolling**: Required for 500+ schedule lists (T051) - use react-window
- **Mobile First**: Test on 375px viewport first (T042, T043)

---

*Tasks generated from: plan.md, research.md, data-model.md, contracts/, quickstart.md*  
*Generated: 2025-10-02*  
*Branch: 020-phase-1*  
*Ready for execution with TDD approach*
