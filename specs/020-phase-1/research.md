# Phase 0: Research & Technical Decisions

**Feature**: User Schedule Assignment UI (Phase 1)  
**Date**: 2025-10-02  
**Status**: Complete

## Research Questions Addressed

### 1. Frontend State Management Strategy

**Question**: How should we manage state for user schedule assignments given the complexity of REPLACE semantics and real-time updates?

**Decision**: Hybrid approach using React Query + Redux Toolkit

**Rationale**:
- **React Query** for server state (schedules, assignments, users)
  - Automatic caching and background refetching
  - Optimistic updates for better UX
  - Built-in loading and error states
  - Automatic cache invalidation after mutations
- **Redux Toolkit** for UI state only
  - Modal open/close states
  - Selected schedules in multi-select
  - Form draft states
  - Navigation state

**Alternatives Considered**:
1. **Redux only** - Rejected: Too much boilerplate for API data, no automatic caching
2. **React Query only** - Rejected: Need centralized UI state for complex modals
3. **Zustand** - Rejected: Team already standardized on Redux Toolkit

**Implementation Pattern**:
```typescript
// React Query for API data
const { data: userSchedules } = useUserSchedules(userId)
const assignMutation = useAssignSchedules()

// Redux for UI state
const { selectedScheduleIds } = useSelector(state => state.scheduleAssignment)
```

---

### 2. Form Validation Approach

**Question**: How to validate schedule assignment with REPLACE warning semantics?

**Decision**: React Hook Form + Zod with custom validation rules

**Rationale**:
- Zod provides TypeScript-first schema validation
- React Hook Form handles form state efficiently
- Custom validation for business rules:
  - At least one schedule must be selected
  - Cannot assign inactive schedules
  - Warning triggers when replacing existing assignments

**Alternatives Considered**:
1. **Formik** - Rejected: Heavier bundle, team prefers React Hook Form
2. **Manual validation** - Rejected: Error-prone, hard to maintain
3. **Yup** - Rejected: Zod has better TypeScript integration

**Validation Schema Example**:
```typescript
const assignmentSchema = z.object({
  scheduleIds: z.array(z.number())
    .min(1, 'Select at least one schedule')
    .refine(ids => !hasInactiveSchedules(ids), 'Cannot assign inactive schedules'),
  confirmReplace: z.boolean()
    .refine(val => val === true, 'Must confirm replacement')
})
```

---

### 3. Component Architecture Pattern

**Question**: How should we structure components for reusability and testability?

**Decision**: Feature-folder organization with presentation/container separation

**Rationale**:
- **Feature folders** group related components, hooks, services, types
- **Presentation components** (dumb) receive props, no API calls
- **Container components** (smart) handle data fetching and business logic
- **Custom hooks** encapsulate React Query logic
- **Separate .types.ts files** for better type organization

**Folder Structure**:
```
features/users/
├── components/          # Presentation layer
│   ├── UserScheduleAssignment.tsx
│   └── AssignedSchedulesList.tsx
├── hooks/              # Business logic hooks
│   ├── useUserSchedules.ts
│   └── useAssignSchedules.ts
├── services/           # API client
│   └── userScheduleService.ts
└── types/              # TypeScript definitions
    └── userSchedule.ts
```

**Alternatives Considered**:
1. **Flat structure** - Rejected: Hard to navigate, poor scalability
2. **Atomic design** - Rejected: Overkill for this feature size
3. **Co-location** - Rejected: Types reused across components

---

### 4. API Integration Best Practices

**Question**: How to integrate with existing Feature 019 backend APIs efficiently?

**Decision**: Axios with interceptors + React Query integration

**Rationale**:
- **Axios interceptors** for auth token injection
- **Centralized error handling** in interceptor
- **React Query queryFn** wraps Axios calls
- **TypeScript interfaces** match backend DTOs
- **Presigned error retry** logic for transient failures

**API Client Pattern**:
```typescript
// services/userScheduleService.ts
export const userScheduleService = {
  getUserSchedules: async (userId: number): Promise<UserSchedule[]> => {
    const response = await apiClient.get(`/api/admin/users/${userId}/schedules`)
    return response.data
  },
  
  assignSchedules: async (userId: number, scheduleIds: number[]): Promise<void> => {
    await apiClient.post(`/api/admin/users/${userId}/schedules`, { scheduleIds })
  },
}

// hooks/useUserSchedules.ts
export function useUserSchedules(userId: number) {
  return useQuery({
    queryKey: ['userSchedules', userId],
    queryFn: () => userScheduleService.getUserSchedules(userId),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  })
}
```

**Alternatives Considered**:
1. **Fetch API** - Rejected: Team standard is Axios
2. **GraphQL** - Rejected: Backend uses REST
3. **SWR** - Rejected: Team standardized on React Query

---

### 5. Warning Modal UX Pattern

**Question**: How to implement REPLACE warning that users won't skip?

**Decision**: Mandatory confirmation modal with visual emphasis

**Rationale**:
- **Modal blocks UI** - Cannot be dismissed accidentally
- **Warning color scheme** (amber/yellow) for visual attention
- **Explicit checkbox** "I understand this will replace existing assignments"
- **Show current assignments** in modal for context
- **Confirm button disabled** until checkbox checked

**Modal Flow**:
1. User selects schedules and clicks "Assign"
2. If user has existing assignments:
   - Show modal with current assignments list
   - Display warning message in amber/yellow
   - Require checkbox confirmation
   - Enable "Confirm Replace" button only after checkbox
3. If no existing assignments:
   - Skip modal, assign directly
   - Show success toast

**Alternatives Considered**:
1. **Toast warning** - Rejected: Too easy to miss
2. **Inline warning** - Rejected: Users might not read
3. **Two-step form** - Rejected: Too complex for UX

---

### 6. Empty State Design

**Question**: How to handle empty states for users with no schedule assignments?

**Decision**: Actionable empty states with clear call-to-action

**Rationale**:
- **Visual icon** (calendar with slash) for recognition
- **Clear message** "No schedules assigned yet"
- **Actionable CTA** button "Assign Schedules"
- **Contextual help** text explaining what schedules do
- **Consistent styling** with existing empty states

**Empty State Component**:
```tsx
<EmptyState
  icon={<CalendarX className="h-12 w-12 text-gray-400" />}
  title="No schedules assigned"
  description="This user doesn't have any content schedules assigned yet. Assign schedules to deliver personalized content to their devices."
  action={
    <Button onClick={() => setShowSelector(true)}>
      Assign Schedules
    </Button>
  }
/>
```

**Alternatives Considered**:
1. **Just text** - Rejected: Not visually engaging
2. **Complex illustration** - Rejected: Overkill, brand consistency issues
3. **No empty state** - Rejected: Confusing for users

---

### 7. Performance Optimization Strategy

**Question**: How to optimize performance for large lists (500+ schedules/users)?

**Decision**: Virtual scrolling + pagination + search filtering

**Rationale**:
- **React Query pagination** for initial load performance
- **Virtual scrolling** (react-virtual) for rendering only visible items
- **Debounced search** to filter schedules before rendering
- **Lazy loading** modal content on open, not mount
- **Optimistic updates** for instant feedback

**Implementation Approach**:
```typescript
// Pagination with React Query
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ['schedules'],
  queryFn: ({ pageParam = 0 }) => 
    scheduleService.getSchedules({ page: pageParam, limit: 50 }),
  getNextPageParam: (lastPage) => lastPage.nextPage,
})

// Virtual scrolling for large lists
import { useVirtualizer } from '@tanstack/react-virtual'

// Debounced search
const debouncedSearch = useDebouncedValue(searchTerm, 300)
```

**Alternatives Considered**:
1. **Load all at once** - Rejected: Poor performance with 500+ items
2. **Traditional pagination** - Rejected: Worse UX than infinite scroll
3. **No optimization** - Rejected: Phase 1 requirement is scalability

---

### 8. Error Handling Strategy

**Question**: How to handle API errors gracefully across components?

**Decision**: Layered error handling with React Query + Error Boundaries

**Rationale**:
- **React Query error states** for API call failures
- **Error Boundaries** for component rendering failures
- **Toast notifications** for user-visible errors
- **Retry logic** for transient network failures
- **Fallback UI** for critical failures

**Error Handling Layers**:
```typescript
// Layer 1: React Query automatic retry
useQuery({
  retry: 3,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
})

// Layer 2: Component-level error handling
if (error) {
  return <ErrorState error={error} onRetry={refetch} />
}

// Layer 3: Error Boundary for critical errors
<ErrorBoundary fallback={<CriticalErrorPage />}>
  <UserScheduleAssignment />
</ErrorBoundary>
```

**Alternatives Considered**:
1. **Try-catch only** - Rejected: Doesn't handle React errors
2. **Global error handler** - Rejected: Too generic, loses context
3. **No error handling** - Rejected: Poor UX

---

## Technology Stack Confirmation

### Confirmed Technologies (from existing project)
✅ **Next.js 15** with App Router  
✅ **React 19** with TypeScript 5.x  
✅ **Tailwind CSS 4** for styling  
✅ **React Query** for server state  
✅ **Redux Toolkit** for UI state  
✅ **React Hook Form** + **Zod** for forms  
✅ **Axios** for API calls  
✅ **shadcn/ui** or **Radix UI** for accessible components  
✅ **Lucide React** for icons  
✅ **Jest** + **React Testing Library** for unit tests  

### New Dependencies Required
🆕 **@tanstack/react-virtual** - Virtual scrolling for large lists  
🆕 **react-use** - Utility hooks (useDebounce, useLocalStorage)  
🆕 **clsx** or **tailwind-variants** - Conditional styling (if not already present)  

---

## Integration Points

### Backend APIs (Feature 019 - Already Implemented)

**Confirmed Available Endpoints**:
```
GET    /api/admin/users/{userId}/schedules          ✅ Get user assignments
POST   /api/admin/users/{userId}/schedules          ✅ Assign schedules (REPLACE)
DELETE /api/admin/users/{userId}/schedules          ✅ Remove all assignments
GET    /api/admin/schedules/{scheduleId}/users      ✅ Get users for schedule
PUT    /api/admin/schedules/{scheduleId}/default    ✅ Set default flag
```

**API Response Types** (from backend DTOs):
- `UserScheduleDto`: userId, scheduleId, assignedAt, assignedBy
- `AssignSchedulesRequest`: userId, scheduleIds[]
- `ScheduleDto`: id, name, description, isActive, isDefault, assignedUsersCount
- `UserDto`: id, name, email, role, assignedDevicesCount

**Authentication**: JWT Bearer token in `Authorization` header

---

## Risk Assessment

### Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|---------|------------|------------|
| Large schedule lists cause performance issues | High | Medium | Virtual scrolling + pagination + search |
| Users accidentally replace assignments | High | High | Mandatory confirmation modal with checkbox |
| API failures during assignment | Medium | Low | Optimistic updates + retry logic + error states |
| TypeScript type mismatches with backend | Medium | Low | Contract tests + shared type definitions |
| React Query cache inconsistencies | Medium | Medium | Explicit cache invalidation after mutations |

### UX Risks

| Risk | Impact | Likelihood | Mitigation |
|------|---------|------------|------------|
| Users don't understand REPLACE semantics | High | High | Clear warning modal + in-app help text |
| Empty states not actionable | Medium | Low | CTA buttons + contextual help |
| Mobile responsiveness issues | Medium | Medium | Mobile-first design + responsive testing |
| Confusing navigation flow | Medium | Low | Breadcrumbs + back button + clear page titles |

---

## Dependencies & Prerequisites

### Required Before Implementation
✅ Feature 019 backend APIs (already complete)  
✅ JWT authentication system (already complete)  
✅ Next.js 15 project setup (already complete)  
✅ Component library established (already complete)  
✅ API client with interceptors (already complete)  

### Optional Enhancements (Future)
🔮 Bulk assignment operations  
🔮 Schedule preview in assignment modal  
🔮 Assignment history/audit log UI  
🔮 Assignment templates  
🔮 Drag-drop schedule assignment  

---

## Success Criteria

### Phase 1 Complete When:
1. ✅ Admins can assign schedules to users with REPLACE warning
2. ✅ Admins can view users assigned to each schedule
3. ✅ Admins can mark schedules as default
4. ✅ Admins can remove all user assignments
5. ✅ Empty states are clear and actionable
6. ✅ All API integrations working correctly
7. ✅ Mobile-responsive design implemented
8. ✅ Unit tests cover critical paths (>80% coverage)
9. ✅ E2E tests validate user flows
10. ✅ Performance meets goals (<2s load, <500ms render)

---

## Next Steps

**Phase 0 Complete** ✅  
→ Proceed to **Phase 1**: Design & Contracts

**Phase 1 Will Generate**:
- `data-model.md` - TypeScript interfaces and types
- `contracts/` - API contracts and component contracts
- `quickstart.md` - Manual testing guide
- Update `.github/copilot-instructions-web.md` - Add Phase 1 context
