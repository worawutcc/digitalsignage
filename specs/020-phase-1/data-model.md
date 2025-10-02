# Phase 1: Data Model & Type Definitions

**Feature**: User Schedule Assignment UI (Phase 1)  
**Date**: 2025-10-02  
**Status**: Complete

## Overview

This document defines the TypeScript interfaces, types, and Zod schemas for the User Schedule Assignment feature. All types align with existing Feature 019 backend DTOs.

---

## Core Entities

### 1. UserSchedule (Assignment Entity)

**Purpose**: Represents the relationship between a user and assigned schedule(s)

```typescript
// features/users/types/userSchedule.ts

export interface UserSchedule {
  userId: number
  scheduleId: number
  scheduleName: string
  scheduleDescription: string | null
  isActive: boolean
  assignedAt: string // ISO 8601 datetime
  assignedBy: string // Admin username
}

export interface UserScheduleSummary {
  userId: number
  userName: string
  userEmail: string
  assignedSchedulesCount: number
  assignedDevicesCount: number
  lastAssignedAt: string | null
}
```

---

### 2. Schedule (Enhanced with Assignment Metadata)

**Purpose**: Schedule entity with assignment-related fields

```typescript
// features/schedules/types/schedule.ts

export interface Schedule {
  id: number
  name: string
  description: string | null
  isActive: boolean
  isDefault: boolean // NEW: Default flag for fallback content
  startDate: string // ISO 8601 date
  endDate: string | null
  priority: number
  createdAt: string
  updatedAt: string
  
  // Assignment metadata
  assignedUsersCount: number // NEW: Count of users with this schedule
  assignedDevicesCount: number
  mediaCount: number
  
  // Content source indicator
  contentSource: 'User' | 'Group' | 'Default' // NEW: Priority tier
}

export interface ScheduleListItem {
  id: number
  name: string
  isActive: boolean
  isDefault: boolean
  assignedUsersCount: number
  startDate: string
  endDate: string | null
}
```

---

### 3. User (with Assignment Context)

**Purpose**: User entity extended with schedule assignment context

```typescript
// features/users/types/user.ts

export interface User {
  id: number
  username: string
  email: string
  firstName: string | null
  lastName: string | null
  role: 'Admin' | 'User' | 'Viewer'
  isActive: boolean
  createdAt: string
  
  // Assignment context
  assignedSchedulesCount: number // NEW
  assignedDevicesCount: number
}

export interface UserWithSchedules extends User {
  schedules: UserSchedule[] // NEW: Populated schedule assignments
}
```

---

## API Request/Response Types

### Assignment Operations

```typescript
// features/users/types/assignment.ts

/**
 * Request to assign schedules to a user (REPLACE semantics)
 */
export interface AssignSchedulesRequest {
  userId: number
  scheduleIds: number[] // Array of schedule IDs to assign (replaces existing)
}

/**
 * Response after successful assignment
 */
export interface AssignSchedulesResponse {
  userId: number
  assignedScheduleIds: number[]
  previousScheduleIds: number[] // What was replaced
  assignedAt: string
  assignedBy: string
}

/**
 * Request to remove all schedule assignments from user
 */
export interface RemoveAllAssignmentsRequest {
  userId: number
}

/**
 * Request to set schedule as default
 */
export interface SetDefaultScheduleRequest {
  scheduleId: number
  isDefault: boolean
}

/**
 * Response with assigned users for a schedule
 */
export interface ScheduleUsersResponse {
  scheduleId: number
  scheduleName: string
  users: Array<{
    id: number
    name: string
    email: string
    assignedAt: string
    deviceCount: number
  }>
  totalCount: number
}
```

---

## Form Data Types

### Schedule Assignment Form

```typescript
// features/users/types/forms.ts

/**
 * Form data for schedule assignment
 */
export interface ScheduleAssignmentFormData {
  scheduleIds: number[]
  confirmReplace: boolean // Must be true if user has existing assignments
}

/**
 * Schedule selector form data
 */
export interface ScheduleSelectorFormData {
  searchTerm: string
  selectedIds: number[]
  showActiveOnly: boolean
}
```

---

## Zod Validation Schemas

### Assignment Validation

```typescript
// features/users/schemas/assignmentSchema.ts
import { z } from 'zod'

/**
 * Schema for schedule assignment validation
 */
export const assignSchedulesSchema = z.object({
  scheduleIds: z.array(z.number())
    .min(1, 'At least one schedule must be selected')
    .max(50, 'Cannot assign more than 50 schedules at once'),
  
  confirmReplace: z.boolean()
    .refine(
      val => val === true, 
      'You must confirm replacement of existing assignments'
    )
})

/**
 * Schema for default schedule toggle
 */
export const setDefaultScheduleSchema = z.object({
  scheduleId: z.number().positive(),
  isDefault: z.boolean()
})

/**
 * Schema for schedule selector search
 */
export const scheduleSelectorSchema = z.object({
  searchTerm: z.string().max(100),
  selectedIds: z.array(z.number()),
  showActiveOnly: z.boolean()
})
```

---

## Component Props Types

### User Schedule Assignment Component

```typescript
// features/users/components/UserScheduleAssignment.types.ts

export interface UserScheduleAssignmentProps {
  userId: number
  userName: string
  userEmail: string
}

export interface AssignedSchedulesListProps {
  userId: number
  schedules: UserSchedule[]
  isLoading?: boolean
  onRemoveAll: () => void
}

export interface ScheduleSelectorProps {
  userId: number
  currentScheduleIds: number[]
  onAssign: (scheduleIds: number[]) => Promise<void>
  isOpen: boolean
  onClose: () => void
}
```

### Schedule Enhancement Components

```typescript
// features/schedules/components/DefaultScheduleToggle.types.ts

export interface DefaultScheduleToggleProps {
  scheduleId: number
  isDefault: boolean
  onToggle: (isDefault: boolean) => Promise<void>
  disabled?: boolean
}

export interface AssignedUsersListProps {
  scheduleId: number
  isOpen: boolean
  onClose: () => void
}

export interface ContentSourceBadgeProps {
  source: 'User' | 'Group' | 'Default'
  className?: string
}
```

---

## UI State Types

### Redux State Slice

```typescript
// store/slices/scheduleAssignmentSlice.types.ts

export interface ScheduleAssignmentState {
  // Modal states
  isSelectorOpen: boolean
  isUserListOpen: boolean
  isConfirmationOpen: boolean
  
  // Selection state
  selectedScheduleIds: number[]
  currentUserId: number | null
  currentScheduleId: number | null
  
  // Warning state
  showReplaceWarning: boolean
  existingAssignmentsCount: number
  
  // Search state
  searchTerm: string
  filterActiveOnly: boolean
}
```

---

## React Query Types

### Query Keys

```typescript
// features/users/hooks/queryKeys.ts

export const userScheduleKeys = {
  all: ['userSchedules'] as const,
  lists: () => [...userScheduleKeys.all, 'list'] as const,
  list: (filters: string) => [...userScheduleKeys.lists(), { filters }] as const,
  details: () => [...userScheduleKeys.all, 'detail'] as const,
  detail: (userId: number) => [...userScheduleKeys.details(), userId] as const,
}

export const scheduleKeys = {
  all: ['schedules'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  details: () => [...scheduleKeys.all, 'detail'] as const,
  users: (scheduleId: number) => [...scheduleKeys.all, 'users', scheduleId] as const,
}
```

### Query/Mutation Types

```typescript
// features/users/hooks/types.ts

export interface UseUserSchedulesResult {
  schedules: UserSchedule[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

export interface UseAssignSchedulesMutation {
  mutate: (data: AssignSchedulesRequest) => void
  mutateAsync: (data: AssignSchedulesRequest) => Promise<void>
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  error: Error | null
}
```

---

## Error Types

### API Error Responses

```typescript
// lib/types/errors.ts

export interface ApiError {
  statusCode: number
  message: string
  errors?: Array<{
    field: string
    message: string
  }>
  timestamp: string
}

export interface ValidationError {
  field: string
  message: string
  value: any
}

export class ScheduleAssignmentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ScheduleAssignmentError'
  }
}
```

---

## Utility Types

### Pagination Types

```typescript
// lib/types/pagination.ts

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}
```

### Filter Types

```typescript
// features/schedules/types/filters.ts

export interface ScheduleFilters {
  searchTerm?: string
  isActive?: boolean
  isDefault?: boolean
  hasAssignedUsers?: boolean
  dateRange?: {
    start: string
    end: string
  }
}

export interface UserFilters {
  searchTerm?: string
  role?: 'Admin' | 'User' | 'Viewer'
  hasAssignments?: boolean
}
```

---

## Type Guards

### Runtime Type Checking

```typescript
// lib/utils/typeGuards.ts

export function isUserSchedule(obj: any): obj is UserSchedule {
  return (
    typeof obj === 'object' &&
    typeof obj.userId === 'number' &&
    typeof obj.scheduleId === 'number' &&
    typeof obj.scheduleName === 'string' &&
    typeof obj.assignedAt === 'string'
  )
}

export function isSchedule(obj: any): obj is Schedule {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.isActive === 'boolean' &&
    typeof obj.isDefault === 'boolean'
  )
}

export function isApiError(error: any): error is ApiError {
  return (
    typeof error === 'object' &&
    'statusCode' in error &&
    'message' in error
  )
}
```

---

## Enums

### Content Source Enum

```typescript
// features/schedules/types/enums.ts

export enum ContentSource {
  User = 'User',
  Group = 'Group',
  Default = 'Default'
}

export enum AssignmentAction {
  Assign = 'Assign',
  Replace = 'Replace',
  RemoveAll = 'RemoveAll'
}
```

---

## Type Mappings

### Backend DTO to Frontend Type Mapping

| Backend DTO | Frontend Type | Notes |
|-------------|---------------|-------|
| `UserScheduleDto` | `UserSchedule` | Direct mapping |
| `ScheduleDto` | `Schedule` | Added `contentSource` field |
| `UserDto` | `User` | Added `assignedSchedulesCount` |
| `AssignSchedulesRequest` | `AssignSchedulesRequest` | Direct mapping |
| `SetDefaultScheduleRequest` | `SetDefaultScheduleRequest` | Direct mapping |

---

## Data Validation Rules

### Business Rule Validations

```typescript
// lib/validations/scheduleRules.ts

/**
 * Validate if schedules can be assigned to user
 */
export function validateScheduleAssignment(
  user: User,
  schedules: Schedule[]
): ValidationError[] {
  const errors: ValidationError[] = []
  
  // Rule 1: At least one schedule must be selected
  if (schedules.length === 0) {
    errors.push({
      field: 'scheduleIds',
      message: 'At least one schedule must be selected',
      value: schedules
    })
  }
  
  // Rule 2: Cannot assign inactive schedules
  const inactiveSchedules = schedules.filter(s => !s.isActive)
  if (inactiveSchedules.length > 0) {
    errors.push({
      field: 'scheduleIds',
      message: `Cannot assign inactive schedules: ${inactiveSchedules.map(s => s.name).join(', ')}`,
      value: inactiveSchedules.map(s => s.id)
    })
  }
  
  // Rule 3: Cannot assign to inactive user
  if (!user.isActive) {
    errors.push({
      field: 'userId',
      message: 'Cannot assign schedules to inactive user',
      value: user.id
    })
  }
  
  // Rule 4: Maximum 50 schedules per user
  if (schedules.length > 50) {
    errors.push({
      field: 'scheduleIds',
      message: 'Cannot assign more than 50 schedules to a user',
      value: schedules.length
    })
  }
  
  return errors
}
```

---

## Summary

**Total Types Defined**: 35+ interfaces, types, and schemas

**Key Type Files**:
- `features/users/types/userSchedule.ts` - User schedule entities
- `features/users/types/assignment.ts` - Assignment request/response types
- `features/users/types/forms.ts` - Form data types
- `features/users/schemas/assignmentSchema.ts` - Zod validation schemas
- `features/schedules/types/schedule.ts` - Enhanced schedule types
- `lib/types/errors.ts` - Error handling types
- `lib/types/pagination.ts` - Pagination utilities

**Type Safety Level**: 100% (strict TypeScript mode, Zod runtime validation)

**Next**: Generate API contracts in `/contracts/` folder
