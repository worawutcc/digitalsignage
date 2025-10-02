# Component Contracts: User Schedule Assignment UI

**Feature**: User Schedule Assignment UI (Phase 1)  
**Date**: 2025-10-02

## Overview

This document defines the interface contracts for all React components in the User Schedule Assignment feature. Each component contract specifies props, behavior, and testing expectations.

---

## Page Components

### UserSchedulesPage

**Path**: `/app/users/[userId]/schedules/page.tsx`

**Purpose**: Main page for viewing and managing a user's schedule assignments

**Props**:
```typescript
interface UserSchedulesPageProps {
  params: {
    userId: string // Route parameter
  }
}
```

**Responsibilities**:
- Fetch user data and assigned schedules
- Render user info card
- Render assigned schedules list
- Provide "Assign Schedules" button
- Handle remove all assignments action

**Children Components**:
- `<UserScheduleAssignment />`

**Contract Tests**:
```typescript
describe('<UserSchedulesPage />', () => {
  it('should render user information')
  it('should fetch and display assigned schedules')
  it('should show empty state when no assignments')
  it('should open schedule selector on "Assign" click')
  it('should handle remove all with confirmation')
  it('should redirect to 404 if user not found')
  it('should require admin authentication')
})
```

---

## Feature Components

### UserScheduleAssignment

**Path**: `/features/users/components/UserScheduleAssignment.tsx`

**Purpose**: Container component for managing user schedule assignments

**Props**:
```typescript
export interface UserScheduleAssignmentProps {
  userId: number
  userName: string
  userEmail: string
}
```

**Responsibilities**:
- Manage assignment state (modal open/close)
- Fetch current assignments via React Query
- Provide assign and remove actions
- Handle loading and error states

**Children Components**:
- `<AssignedSchedulesList />`
- `<ScheduleSelector />` (modal)
- `<ConfirmationModal />` (for remove all)

**Contract Tests**:
```typescript
describe('<UserScheduleAssignment />', () => {
  it('should render with user info')
  it('should fetch schedules on mount')
  it('should show loading state while fetching')
  it('should show error state on fetch failure')
  it('should open selector modal on assign click')
  it('should close modal after successful assignment')
  it('should show confirmation before remove all')
  it('should invalidate cache after mutation')
})
```

---

### AssignedSchedulesList

**Path**: `/features/users/components/AssignedSchedulesList.tsx`

**Purpose**: Display list of currently assigned schedules

**Props**:
```typescript
export interface AssignedSchedulesListProps {
  userId: number
  schedules: UserSchedule[]
  isLoading?: boolean
  onRemoveAll: () => void
}
```

**Responsibilities**:
- Render schedule cards with details
- Show assigned date and admin
- Provide "Remove All" button
- Handle empty state

**Contract Tests**:
```typescript
describe('<AssignedSchedulesList />', () => {
  it('should render list of schedules')
  it('should show schedule details (name, date, admin)')
  it('should show empty state when no schedules')
  it('should show loading skeleton while loading')
  it('should call onRemoveAll when button clicked')
  it('should disable remove button when no schedules')
})
```

---

### ScheduleSelector

**Path**: `/features/schedules/components/ScheduleSelector.tsx`

**Purpose**: Modal for selecting schedules to assign with REPLACE warning

**Props**:
```typescript
export interface ScheduleSelectorProps {
  userId: number
  currentScheduleIds: number[]
  onAssign: (scheduleIds: number[]) => Promise<void>
  isOpen: boolean
  onClose: () => void
}
```

**Responsibilities**:
- Fetch available schedules
- Provide search/filter functionality
- Multi-select schedules with checkboxes
- Show REPLACE warning if user has existing assignments
- Require confirmation checkbox before assign
- Handle assign mutation with loading state

**Contract Tests**:
```typescript
describe('<ScheduleSelector />', () => {
  it('should render modal when open')
  it('should fetch schedules on open')
  it('should allow search by schedule name')
  it('should filter inactive schedules')
  it('should show replace warning if current assignments exist')
  it('should require confirmation checkbox when replacing')
  it('should disable assign button until confirmed')
  it('should call onAssign with selected IDs')
  it('should show loading state during mutation')
  it('should close modal on successful assignment')
  it('should show error toast on failure')
  it('should reset form on close')
})
```

---

### DefaultScheduleToggle

**Path**: `/features/schedules/components/DefaultScheduleToggle.tsx`

**Purpose**: Toggle switch for marking schedule as default

**Props**:
```typescript
export interface DefaultScheduleToggleProps {
  scheduleId: number
  isDefault: boolean
  onToggle: (isDefault: boolean) => Promise<void>
  disabled?: boolean
}
```

**Responsibilities**:
- Render toggle switch with current state
- Call mutation on toggle
- Show loading state during mutation
- Revert on error

**Contract Tests**:
```typescript
describe('<DefaultScheduleToggle />', () => {
  it('should render toggle with current state')
  it('should call onToggle when clicked')
  it('should show loading state during mutation')
  it('should update UI on success')
  it('should revert state on error')
  it('should be disabled when prop is true')
  it('should show tooltip explaining default')
})
```

---

### AssignedUsersList

**Path**: `/features/schedules/components/AssignedUsersList.tsx`

**Purpose**: Modal showing users assigned to a schedule

**Props**:
```typescript
export interface AssignedUsersListProps {
  scheduleId: number
  isOpen: boolean
  onClose: () => void
}
```

**Responsibilities**:
- Fetch users for schedule when opened
- Display user list with details (name, email, device count)
- Show total count
- Provide search functionality
- Handle pagination for large lists

**Contract Tests**:
```typescript
describe('<AssignedUsersList />', () => {
  it('should fetch users when opened')
  it('should render user cards with details')
  it('should show total count')
  it('should allow search by name or email')
  it('should paginate large lists')
  it('should show empty state if no users')
  it('should close modal on close button click')
})
```

---

### ContentSourceBadge

**Path**: `/features/schedules/components/ContentSourceBadge.tsx`

**Purpose**: Visual indicator for schedule content source (priority tier)

**Props**:
```typescript
export interface ContentSourceBadgeProps {
  source: 'User' | 'Group' | 'Default'
  className?: string
}
```

**Responsibilities**:
- Render colored badge based on source
- User = blue (highest priority)
- Group = yellow (medium priority)
- Default = gray (fallback)
- Show icon for visual distinction

**Contract Tests**:
```typescript
describe('<ContentSourceBadge />', () => {
  it('should render User badge in blue')
  it('should render Group badge in yellow')
  it('should render Default badge in gray')
  it('should show appropriate icon')
  it('should apply custom className')
  it('should have accessible label')
})
```

---

## UI Components

### ConfirmationModal

**Path**: `/components/ui/ConfirmationModal.tsx`

**Purpose**: Reusable confirmation modal for destructive actions

**Props**:
```typescript
export interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}
```

**Responsibilities**:
- Render modal with title and description
- Provide confirm and cancel buttons
- Apply variant styling (danger = red, warning = amber)
- Close on cancel or background click
- Prevent accidental clicks

**Contract Tests**:
```typescript
describe('<ConfirmationModal />', () => {
  it('should render when open')
  it('should display title and description')
  it('should call onConfirm when confirm clicked')
  it('should call onClose when cancel clicked')
  it('should close on background click')
  it('should apply danger styling for danger variant')
  it('should focus confirm button on open')
  it('should trap focus within modal')
})
```

---

### EmptyState

**Path**: `/components/ui/EmptyState.tsx`

**Purpose**: Reusable empty state component

**Props**:
```typescript
export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}
```

**Responsibilities**:
- Render centered empty state
- Display icon, title, description
- Provide optional action button
- Maintain consistent styling

**Contract Tests**:
```typescript
describe('<EmptyState />', () => {
  it('should render title')
  it('should render optional icon')
  it('should render optional description')
  it('should render optional action button')
  it('should center content')
  it('should apply custom className')
})
```

---

## Hook Contracts

### useUserSchedules

**Path**: `/features/users/hooks/useUserSchedules.ts`

**Purpose**: Fetch user's assigned schedules

**Signature**:
```typescript
function useUserSchedules(userId: number): UseQueryResult<UserSchedule[]>
```

**Responsibilities**:
- Fetch schedules from API
- Cache with React Query
- Auto-refetch on window focus
- Return loading, error, data states

**Contract Tests**:
```typescript
describe('useUserSchedules', () => {
  it('should fetch schedules on mount')
  it('should return loading state initially')
  it('should return data on success')
  it('should return error on failure')
  it('should cache results')
  it('should refetch on invalidation')
})
```

---

### useAssignSchedules

**Path**: `/features/users/hooks/useAssignSchedules.ts`

**Purpose**: Mutation for assigning schedules

**Signature**:
```typescript
function useAssignSchedules(): UseMutationResult<void, Error, AssignSchedulesRequest>
```

**Responsibilities**:
- Post assignment to API
- Invalidate user schedules cache on success
- Show success toast
- Handle errors

**Contract Tests**:
```typescript
describe('useAssignSchedules', () => {
  it('should call API with correct data')
  it('should invalidate cache on success')
  it('should return loading state during mutation')
  it('should return error on failure')
  it('should call onSuccess callback')
})
```

---

### useSetDefaultSchedule

**Path**: `/features/schedules/hooks/useSetDefaultSchedule.ts`

**Purpose**: Mutation for toggling default schedule flag

**Signature**:
```typescript
function useSetDefaultSchedule(): UseMutationResult<void, Error, SetDefaultScheduleRequest>
```

**Responsibilities**:
- Put default flag to API
- Invalidate schedules cache on success
- Optimistic update for instant feedback
- Revert on error

**Contract Tests**:
```typescript
describe('useSetDefaultSchedule', () => {
  it('should call API with schedule ID and flag')
  it('should update cache optimistically')
  it('should revert on error')
  it('should invalidate cache on success')
})
```

---

## Service Contracts

### userScheduleService

**Path**: `/features/users/services/userScheduleService.ts`

**Purpose**: API client for user schedule operations

**Methods**:
```typescript
{
  getUserSchedules(userId: number): Promise<UserSchedule[]>
  assignSchedules(userId: number, scheduleIds: number[]): Promise<AssignSchedulesResponse>
  removeAllSchedules(userId: number): Promise<void>
}
```

**Contract Tests**:
```typescript
describe('userScheduleService', () => {
  describe('getUserSchedules', () => {
    it('should call GET /api/admin/users/:id/schedules')
    it('should return schedule array')
    it('should handle 404 error')
  })
  
  describe('assignSchedules', () => {
    it('should call POST with schedule IDs')
    it('should return assignment response')
    it('should handle validation errors')
  })
  
  describe('removeAllSchedules', () => {
    it('should call DELETE endpoint')
    it('should return void on success')
    it('should handle errors')
  })
})
```

---

### scheduleService

**Path**: `/features/schedules/services/scheduleService.ts`

**New Methods**:
```typescript
{
  getScheduleUsers(scheduleId: number, params?: PaginationParams): Promise<ScheduleUsersResponse>
  setScheduleAsDefault(scheduleId: number, isDefault: boolean): Promise<Schedule>
}
```

**Contract Tests**:
```typescript
describe('scheduleService', () => {
  describe('getScheduleUsers', () => {
    it('should call GET /api/admin/schedules/:id/users')
    it('should support pagination')
    it('should support search')
  })
  
  describe('setScheduleAsDefault', () => {
    it('should call PUT with default flag')
    it('should return updated schedule')
  })
})
```

---

## Integration Test Contracts

### User Schedule Assignment Flow

```typescript
describe('User Schedule Assignment - E2E', () => {
  it('should complete full assignment workflow', async () => {
    // 1. Navigate to user schedule page
    await page.goto('/users/123/schedules')
    
    // 2. Verify current assignments displayed
    await expect(page.getByTestId('assigned-schedules-list')).toBeVisible()
    
    // 3. Click "Assign Schedules"
    await page.click('button:has-text("Assign Schedules")')
    
    // 4. Modal opens with schedule selector
    await expect(page.getByRole('dialog')).toBeVisible()
    
    // 5. Search for schedules
    await page.fill('input[placeholder="Search schedules"]', 'Morning')
    
    // 6. Select schedules
    await page.check('input[type="checkbox"][value="45"]')
    await page.check('input[type="checkbox"][value="67"]')
    
    // 7. Replace warning shown (user has existing assignments)
    await expect(page.getByText(/will replace existing/i)).toBeVisible()
    
    // 8. Confirm replacement
    await page.check('input[type="checkbox"][name="confirmReplace"]')
    
    // 9. Click assign
    await page.click('button:has-text("Assign Schedules")')
    
    // 10. Loading state
    await expect(page.getByRole('button', { name: 'Assigning...' })).toBeVisible()
    
    // 11. Success toast
    await expect(page.getByText(/successfully assigned/i)).toBeVisible()
    
    // 12. Modal closes
    await expect(page.getByRole('dialog')).not.toBeVisible()
    
    // 13. New assignments displayed
    await expect(page.getByText('Morning News')).toBeVisible()
    await expect(page.getByText('Afternoon Ads')).toBeVisible()
  })
})
```

---

## Summary

**Total Components**: 8 feature components, 2 UI components
**Total Hooks**: 3 React Query hooks
**Total Services**: 2 API services (1 new, 1 updated)

**Contract Coverage**: 100% of components have defined contracts

**Next**: Generate quickstart.md for manual testing guide
