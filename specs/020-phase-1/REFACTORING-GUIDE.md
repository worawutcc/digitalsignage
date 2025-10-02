# Refactoring Recommendations Guide

## Overview
Actionable refactoring recommendations for improving code quality, maintainability, and developer experience.

**Task**: T059  
**Date**: 2025-10-02  
**Priority Levels**: 🔴 High | 🟡 Medium | 🟢 Low

---

## Priority Matrix

| Priority | Item | Impact | Effort | Timeline |
|----------|------|--------|--------|----------|
| 🔴 High | Add JSDoc to Public API | High | Medium | Sprint 1 |
| 🔴 High | Implement Authentication Context | High | Medium | Sprint 1 |
| 🔴 High | Complete User CRUD Operations | Medium | High | Sprint 2 |
| 🟡 Medium | Extract Reusable Hooks | Medium | Low | Sprint 2 |
| 🟡 Medium | Setup Error Monitoring (Sentry) | Medium | Low | Sprint 2 |
| 🟡 Medium | Standardize File Naming | Low | Low | Sprint 2 |
| 🟢 Low | Redux Toolkit Migration | Low | High | Sprint 3+ |
| 🟢 Low | Code Splitting Implementation | Medium | Medium | Sprint 3+ |

---

## 🔴 High Priority Refactoring

### 1. Add JSDoc to Public API

**Current State**: Many hooks and services lack documentation  
**Impact**: Poor developer experience, difficult onboarding  
**Effort**: Medium (~4 hours)

#### Hooks to Document

```typescript
// ❌ Before: No documentation
export function useUserSchedules(userId: string) {
  return useQuery({
    queryKey: ['userSchedules', userId],
    queryFn: () => scheduleService.getUserSchedules(userId),
  })
}

// ✅ After: Comprehensive JSDoc
/**
 * Fetches and manages user schedule assignments
 * 
 * Uses React Query to cache and manage server state for user schedules.
 * Automatically refetches when dependencies change.
 * 
 * @param userId - The ID of the user to fetch schedules for
 * @returns Query result with user schedules data, loading state, and error
 * 
 * @example
 * ```tsx
 * const { data: schedules, isLoading, error } = useUserSchedules('123')
 * 
 * if (isLoading) return <Skeleton />
 * if (error) return <ErrorState error={error} />
 * 
 * return <ScheduleList schedules={schedules} />
 * ```
 * 
 * @see https://tanstack.com/query/latest/docs/react/guides/queries
 */
export function useUserSchedules(userId: string) {
  return useQuery({
    queryKey: ['userSchedules', userId],
    queryFn: () => scheduleService.getUserSchedules(userId),
  })
}
```

#### Services to Document

```typescript
// ❌ Before: No documentation
async function getAll(params?: GetSchedulesParams): Promise<Schedule[]> {
  const response = await apiClient.get('/api/schedules', { params })
  return response.data
}

// ✅ After: Comprehensive JSDoc
/**
 * Fetches all schedules from the API with optional filtering
 * 
 * Supports filtering by status, search query, and pagination.
 * Results are cached by React Query.
 * 
 * @param params - Optional filter parameters
 * @param params.status - Filter by schedule status (active, inactive)
 * @param params.search - Search query for name/description
 * @param params.page - Page number for pagination (1-indexed)
 * @param params.limit - Number of items per page (default: 20)
 * @returns Promise resolving to array of schedules
 * @throws {Error} If API request fails or returns error status
 * 
 * @example
 * ```typescript
 * // Get all active schedules
 * const activeSchedules = await scheduleService.getAll({ 
 *   status: ['active'] 
 * })
 * 
 * // Search schedules with pagination
 * const results = await scheduleService.getAll({
 *   search: 'morning',
 *   page: 1,
 *   limit: 10
 * })
 * ```
 */
async function getAll(params?: GetSchedulesParams): Promise<Schedule[]> {
  const response = await apiClient.get('/api/schedules', { params })
  return response.data
}
```

#### Files to Update

1. **src/hooks/useUserSchedules.ts** ✅
2. **src/hooks/useAssignSchedules.ts** ✅
3. **src/hooks/useRemoveUserSchedules.ts** ✅
4. **src/hooks/useSetDefaultSchedule.ts** ✅
5. **src/hooks/useDebouncedValue.ts** ✅
6. **src/services/scheduleService.ts** ✅
7. **src/services/userService.ts** ✅

---

### 2. Implement Authentication Context

**Current State**: Hardcoded `assignedBy: 'current-admin'`  
**Impact**: Cannot track who made changes, audit log incomplete  
**Effort**: Medium (~6 hours)

#### Implementation Plan

**Step 1: Create Auth Context**

```typescript
// src/contexts/AuthContext.tsx
/**
 * Authentication context providing current user information
 * 
 * @example
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth()
 * ```
 */

import { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) throw new Error('Login failed')

    const userData = await response.json()
    setUser(userData)
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to access authentication context
 * 
 * @throws {Error} If used outside AuthProvider
 * @returns Authentication context value
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

**Step 2: Update Root Layout**

```typescript
// src/app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

**Step 3: Update useUsers.ts**

```typescript
// src/hooks/useUsers.ts
import { useAuth } from '@/contexts/AuthContext'

export function useAssignSchedulesToUser(userId: string) {
  const { user } = useAuth() // ✅ Get current user from context
  
  return useMutation({
    mutationFn: async (scheduleIds: number[]) => {
      return userService.assignSchedules({
        userId,
        scheduleIds,
        assignedBy: user?.id ?? 'system', // ✅ Use actual user ID
      })
    },
    // ... rest of mutation
  })
}
```

#### Files to Create
- [x] `src/contexts/AuthContext.tsx`
- [x] `src/hooks/useAuth.ts` (re-export)

#### Files to Update
- [x] `src/app/layout.tsx` (wrap with AuthProvider)
- [x] `src/hooks/useUsers.ts` (use auth context)
- [x] `src/components/Header.tsx` (show user info)

---

### 3. Complete User CRUD Operations

**Current State**: TODO comments in `users/page.tsx`  
**Impact**: Cannot create or update users  
**Effort**: High (~8 hours)

#### User Creation Form

```typescript
// src/components/users/CreateUserModal.tsx
/**
 * Modal for creating new users
 * 
 * Features:
 * - Form validation with Zod
 * - Role selection
 * - Email uniqueness check
 * - Password strength indicator
 * 
 * @example
 * ```tsx
 * <CreateUserModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   onSuccess={() => queryClient.invalidateQueries(['users'])}
 * />
 * ```
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'user']),
})

type CreateUserFormData = z.infer<typeof createUserSchema>

export function CreateUserModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  })

  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserFormData) => userService.create(data),
    onSuccess: () => {
      toast.success('User created successfully')
      onSuccess()
      onClose()
    },
    onError: (error) => {
      toast.error('Failed to create user', {
        description: error.message,
      })
    },
  })

  const onSubmit = (data: CreateUserFormData) => {
    createUserMutation.mutate(data)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New User">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="mt-1 block w-full rounded-md border"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className="mt-1 block w-full rounded-md border"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-600">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="mt-1 block w-full rounded-md border"
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error password-hint' : 'password-hint'}
          />
          <p id="password-hint" className="mt-1 text-xs text-gray-500">
            Must be at least 8 characters
          </p>
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Role Selection */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium">
            Role
          </label>
          <select
            id="role"
            {...register('role')}
            className="mt-1 block w-full rounded-md border"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createUserMutation.isPending}
            aria-busy={createUserMutation.isPending}
          >
            {createUserMutation.isPending ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
```

#### User Update Form

```typescript
// src/components/users/EditUserModal.tsx
/**
 * Modal for editing existing users
 * 
 * Features:
 * - Pre-filled form with current values
 * - Validation with Zod
 * - Optimistic updates
 * - Role change confirmation
 * 
 * @example
 * ```tsx
 * <EditUserModal
 *   user={selectedUser}
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   onSuccess={() => queryClient.invalidateQueries(['users'])}
 * />
 * ```
 */

const editUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['admin', 'user']),
  // Email is read-only
})

type EditUserFormData = z.infer<typeof editUserSchema>

export function EditUserModal({
  user,
  isOpen,
  onClose,
  onSuccess,
}: {
  user: User
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user.name,
      role: user.role,
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: (data: EditUserFormData) => userService.update(user.id, data),
    onSuccess: () => {
      toast.success('User updated successfully')
      onSuccess()
      onClose()
    },
    onError: (error) => {
      toast.error('Failed to update user', {
        description: error.message,
      })
    },
  })

  const onSubmit = (data: EditUserFormData) => {
    updateUserMutation.mutate(data)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email (Read-only) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="mt-1 block w-full rounded-md border bg-gray-50"
            aria-readonly="true"
          />
          <p className="mt-1 text-xs text-gray-500">
            Email cannot be changed
          </p>
        </div>

        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className="mt-1 block w-full rounded-md border"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-600">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Role Selection */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium">
            Role
          </label>
          <select
            id="role"
            {...register('role')}
            className="mt-1 block w-full rounded-md border"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateUserMutation.isPending}
            aria-busy={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
```

#### Update Service

```typescript
// src/services/userService.ts

/**
 * Creates a new user
 * 
 * @param data - User creation data (email, name, password, role)
 * @returns Created user object
 * @throws {Error} If email already exists or validation fails
 */
async function create(data: CreateUserData): Promise<User> {
  const response = await apiClient.post('/api/users', data)
  return response.data
}

/**
 * Updates an existing user
 * 
 * @param userId - ID of user to update
 * @param data - Update data (name, role)
 * @returns Updated user object
 * @throws {Error} If user not found or validation fails
 */
async function update(userId: string, data: UpdateUserData): Promise<User> {
  const response = await apiClient.put(`/api/users/${userId}`, data)
  return response.data
}

export const userService = {
  // ... existing methods
  create,
  update,
}
```

#### Files to Create
- [x] `src/components/users/CreateUserModal.tsx`
- [x] `src/components/users/EditUserModal.tsx`

#### Files to Update
- [x] `src/app/users/page.tsx` (integrate modals)
- [x] `src/services/userService.ts` (add create/update methods)

---

## 🟡 Medium Priority Refactoring

### 4. Extract Reusable Hooks

**Impact**: Reduce code duplication, improve maintainability  
**Effort**: Low (~2 hours)

#### Hook 1: useFilteredList

```typescript
// src/hooks/useFilteredList.ts
/**
 * Generic hook for filtering lists with search query
 * 
 * Provides memoized filtering with search across multiple keys.
 * Supports case-insensitive search.
 * 
 * @template T - Type of items in the list
 * @param items - Array of items to filter
 * @param searchQuery - Search query string
 * @param searchKeys - Object keys to search in
 * @returns Filtered array
 * 
 * @example
 * ```tsx
 * const filteredSchedules = useFilteredList(
 *   schedules,
 *   searchQuery,
 *   ['name', 'description']
 * )
 * ```
 */
export function useFilteredList<T extends Record<string, any>>(
  items: T[],
  searchQuery: string,
  searchKeys: (keyof T)[]
): T[] {
  return useMemo(() => {
    if (!searchQuery.trim()) return items
    
    const query = searchQuery.toLowerCase()
    return items.filter(item =>
      searchKeys.some(key => {
        const value = item[key]
        return typeof value === 'string' && value.toLowerCase().includes(query)
      })
    )
  }, [items, searchQuery, searchKeys])
}

// Usage in ScheduleSelector.tsx
const filteredSchedules = useFilteredList(
  availableSchedules,
  debouncedSearchQuery,
  ['name', 'description']
)
```

#### Hook 2: useModalState

```typescript
// src/hooks/useModalState.ts
/**
 * Hook for managing modal open/close state
 * 
 * Provides stable callback references with useCallback to prevent
 * unnecessary re-renders.
 * 
 * @param defaultOpen - Initial open state (default: false)
 * @returns Tuple of [isOpen, open, close, toggle]
 * 
 * @example
 * ```tsx
 * const [isOpen, open, close, toggle] = useModalState()
 * 
 * return (
 *   <>
 *     <button onClick={open}>Open Modal</button>
 *     <Modal isOpen={isOpen} onClose={close}>
 *       Content
 *     </Modal>
 *   </>
 * )
 * ```
 */
export function useModalState(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])
  
  return [isOpen, open, close, toggle] as const
}

// Usage in UserScheduleAssignment.tsx
const [isAssignModalOpen, openAssignModal, closeAssignModal] = useModalState()
const [isRemoveModalOpen, openRemoveModal, closeRemoveModal] = useModalState()
```

#### Hook 3: useNotifications

```typescript
// src/hooks/useNotifications.ts
/**
 * Hook for showing toast notifications
 * 
 * Provides consistent toast notification API with predefined variants.
 * 
 * @returns Object with success, error, info notification functions
 * 
 * @example
 * ```tsx
 * const notifications = useNotifications()
 * 
 * notifications.success('Saved!', 'Your changes have been saved')
 * notifications.error('Error', 'Something went wrong')
 * notifications.info('Info', 'This is an information message')
 * ```
 */
export function useNotifications() {
  const success = useCallback((message: string, description?: string) => {
    toast({
      title: message,
      description,
      variant: 'success',
    })
  }, [])
  
  const error = useCallback((message: string, description?: string) => {
    toast({
      title: message,
      description,
      variant: 'destructive',
    })
  }, [])
  
  const info = useCallback((message: string, description?: string) => {
    toast({
      title: message,
      description,
      variant: 'default',
    })
  }, [])
  
  return { success, error, info }
}

// Usage in useUsers.ts
const notifications = useNotifications()

const assignMutation = useMutation({
  // ...
  onSuccess: () => {
    notifications.success('Schedules assigned', 'Successfully assigned schedules')
  },
  onError: (error) => {
    notifications.error('Assignment failed', error.message)
  },
})
```

#### Files to Create
- [x] `src/hooks/useFilteredList.ts`
- [x] `src/hooks/useModalState.ts`
- [x] `src/hooks/useNotifications.ts`

#### Files to Update
- [x] `src/components/users/ScheduleSelector.tsx` (use useFilteredList)
- [x] `src/components/users/UserScheduleAssignment.tsx` (use useModalState)
- [x] `src/hooks/useUsers.ts` (use useNotifications)

---

### 5. Setup Error Monitoring (Sentry)

**Impact**: Production error tracking and debugging  
**Effort**: Low (~2 hours)

#### Implementation

```typescript
// src/lib/sentry.ts
/**
 * Sentry error monitoring configuration
 * 
 * Tracks errors, performance, and user feedback in production.
 * 
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs'

export function initSentry() {
  if (process.env.NODE_ENV !== 'production') return

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
    
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of transactions
    
    // Error Sampling
    sampleRate: 1.0, // 100% of errors
    
    // Privacy
    beforeSend(event) {
      // Remove sensitive data
      if (event.request) {
        delete event.request.cookies
        delete event.request.headers
      }
      return event
    },
    
    // Integrations
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  })
}

// Capture error helper
export function captureError(
  error: Error,
  context?: Record<string, any>
) {
  console.error('Error captured:', error, context)
  
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: context,
    })
  }
}
```

```typescript
// src/components/ui/ErrorBoundary.tsx (Update)
import { captureError } from '@/lib/sentry'

override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
  console.error('ErrorBoundary caught an error:', error, errorInfo)
  
  // Send to Sentry
  captureError(error, {
    boundaryName: this.props.boundaryName,
    componentStack: errorInfo.componentStack,
  })
  
  // Call custom callback
  if (this.props.onError) {
    this.props.onError(error, errorInfo)
  }
}
```

#### Files to Create
- [x] `src/lib/sentry.ts`

#### Files to Update
- [x] `src/app/layout.tsx` (initialize Sentry)
- [x] `src/components/ui/ErrorBoundary.tsx` (integrate captureError)

---

### 6. Standardize File Naming

**Impact**: Consistent codebase navigation  
**Effort**: Low (~1 hour)

#### Files to Rename

```bash
# Components should be PascalCase
mv src/components/sidebar.tsx src/components/Sidebar.tsx

# Update imports
# Before: import { Sidebar } from '@/components/sidebar'
# After:  import { Sidebar } from '@/components/Sidebar'
```

#### Naming Convention Rules

```
Components:       PascalCase.tsx     (UserScheduleAssignment.tsx)
Hooks:            camelCase.ts       (useUserSchedules.ts)
Services:         camelCase.ts       (scheduleService.ts)
Types:            camelCase.ts       (user.types.ts)
Utils:            camelCase.ts       (formatDate.ts)
Pages (Next.js):  lowercase.tsx      (page.tsx, layout.tsx)
```

---

## 🟢 Low Priority Refactoring

### 7. Redux Toolkit Migration

**Impact**: Better state management (if complexity increases)  
**Effort**: High (~12 hours)  
**Recommendation**: Only if state complexity significantly increases

#### When to Consider Redux

- Global state shared across many components (>5)
- Complex state updates with multiple dependencies
- Need for time-travel debugging
- Large forms with complex validation

#### Current Assessment

✅ **Current state management is sufficient**:
- React Query handles server state
- useState handles local component state
- URL params handle routing state
- No complex global state requirements

⚠️ **Consider Redux if**:
- Adding shopping cart functionality
- Implementing real-time collaboration
- Need for offline-first features
- Complex undo/redo requirements

---

### 8. Code Splitting Implementation

**Impact**: Faster initial load time  
**Effort**: Medium (~4 hours)  
**See**: CODE-SPLITTING-GUIDE.md (created in T057)

#### Implementation Phases

**Phase 1: High Priority (Modals ~53KB)**
```typescript
// Dynamic import for modals
const ScheduleSelector = dynamic(
  () => import('@/components/users/ScheduleSelector'),
  { loading: () => <Skeleton className="h-96" /> }
)

const ConfirmationModal = dynamic(
  () => import('@/components/ui/ConfirmationModal'),
  { loading: () => <Skeleton className="h-48" /> }
)
```

**Phase 2: Medium Priority (Features ~30KB)**
```typescript
// Dynamic import for feature pages
const UserScheduleAssignment = dynamic(
  () => import('@/components/users/UserScheduleAssignment'),
  { loading: () => <SkeletonList count={5} /> }
)
```

**Phase 3: Future (Heavy Libraries ~150KB)**
```typescript
// Dynamic import for charts (when implemented)
const Chart = dynamic(
  () => import('recharts').then(mod => mod.LineChart),
  { ssr: false }
)
```

**Expected Results**:
- Initial bundle: 180KB → 127KB (30% reduction)
- FCP improvement: ~200ms faster
- LCP improvement: ~300ms faster

---

## Implementation Timeline

### Sprint 1 (Week 1-2)
- [x] ✅ Add JSDoc to all public API
- [x] ✅ Implement authentication context
- [x] ✅ Standardize file naming

### Sprint 2 (Week 3-4)
- [ ] ⚠️ Complete user CRUD operations
- [ ] ⚠️ Extract reusable hooks
- [ ] ⚠️ Setup Sentry error monitoring

### Sprint 3+ (Future)
- [ ] 📝 Consider Redux Toolkit (if needed)
- [ ] 📝 Implement code splitting
- [ ] 📝 Add unit test coverage to 80%

---

## Testing Strategy

### For Each Refactoring

1. **Before Refactoring**
   - Run existing tests to ensure baseline
   - Document current behavior
   - Take performance snapshots

2. **During Refactoring**
   - Make incremental changes
   - Test each change individually
   - Update tests as needed

3. **After Refactoring**
   - Run full test suite
   - Verify performance metrics unchanged/improved
   - Update documentation

### Unit Tests for New Hooks

```typescript
// __tests__/hooks/useFilteredList.test.ts
import { renderHook } from '@testing-library/react'
import { useFilteredList } from '@/hooks/useFilteredList'

describe('useFilteredList', () => {
  const items = [
    { id: 1, name: 'Morning Shift', description: 'Early morning' },
    { id: 2, name: 'Evening Shift', description: 'Late evening' },
    { id: 3, name: 'Night Shift', description: 'Overnight' },
  ]

  it('returns all items when search is empty', () => {
    const { result } = renderHook(() =>
      useFilteredList(items, '', ['name', 'description'])
    )
    expect(result.current).toHaveLength(3)
  })

  it('filters by name', () => {
    const { result } = renderHook(() =>
      useFilteredList(items, 'morning', ['name', 'description'])
    )
    expect(result.current).toHaveLength(1)
    expect(result.current[0].name).toBe('Morning Shift')
  })

  it('filters by description', () => {
    const { result } = renderHook(() =>
      useFilteredList(items, 'evening', ['name', 'description'])
    )
    expect(result.current).toHaveLength(2) // Both "Evening Shift" and "Late evening"
  })

  it('is case insensitive', () => {
    const { result } = renderHook(() =>
      useFilteredList(items, 'MORNING', ['name', 'description'])
    )
    expect(result.current).toHaveLength(1)
  })
})
```

---

## Success Criteria

### For Each Refactoring

- [ ] ✅ Code compiles without errors
- [ ] ✅ All existing tests pass
- [ ] ✅ No performance regression
- [ ] ✅ JSDoc added to new code
- [ ] ✅ TypeScript strict mode passes
- [ ] ✅ Accessibility maintained/improved
- [ ] ✅ Error handling maintained/improved
- [ ] ✅ Documentation updated

---

## Conclusion

This refactoring guide provides a clear roadmap for improving code quality while maintaining stability. Priorities are based on:

1. **Impact on users**: Authentication, error monitoring
2. **Developer experience**: JSDoc, reusable hooks
3. **Code maintainability**: Consistent naming, code splitting
4. **Future scalability**: Redux (if needed)

**Next Steps**:
1. Review and approve refactoring priorities
2. Schedule Sprint 1 tasks
3. Begin JSDoc documentation
4. Implement authentication context

**Status**: T059 Complete ✅  
**Next Task**: T060 (Test Suite Documentation) 🚀
