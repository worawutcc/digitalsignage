# Data Model: User Management and User Schedule Assignment

**Feature**: User Management and User Schedule Assignment  
**Phase**: 1 - Design & Contracts  
**Date**: 2025-10-04

## Core Entities

### User Entity
```typescript
interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  lastLogin?: string
  permissions: Permission[]
  createdAt: string
  updatedAt: string
  
  // Enhanced fields for schedule assignment
  assignedSchedules?: UserScheduleAssignment[]
  scheduleConflicts?: ScheduleConflict[]
  profilePicture?: string
  phoneNumber?: string
  department?: string
  timezone?: string
}
```

**Validation Rules**:
- `email`: Must be unique, valid email format
- `username`: Must be unique, 3-50 characters, alphanumeric + underscore
- `firstName`, `lastName`: Required, 1-100 characters
- `role`: Must be valid UserRole
- `isActive`: Default true for new users

**State Transitions**:
- Active → Inactive: Soft delete, preserve schedule history
- Inactive → Active: Reactivate, validate role permissions
- Role changes: Validate new permissions, audit log entry

### UserRole Entity
```typescript
interface UserRole {
  id: number
  name: 'Admin' | 'ContentManager' | 'Viewer'
  description: string
  permissions: Permission[]
  canAssignSchedules: boolean
  canManageUsers: boolean
  canViewAllSchedules: boolean
  createdAt: string
  updatedAt: string
}
```

**Predefined Roles**:
- **Admin**: Full system access, user management, schedule assignment
- **ContentManager**: Content and schedule management, limited user access
- **Viewer**: Read-only access to assigned schedules

### Permission Entity
```typescript
interface Permission {
  id: number
  name: string
  resource: string // 'users', 'schedules', 'devices', 'media'
  action: string   // 'create', 'read', 'update', 'delete', 'assign'
  description: string
}
```

**Permission Matrix**:
- `users:create`, `users:read`, `users:update`, `users:delete`
- `schedules:create`, `schedules:read`, `schedules:update`, `schedules:delete`, `schedules:assign`
- `devices:read`, `devices:update`
- `media:read`, `media:upload`

### Schedule Entity (Enhanced)
```typescript
interface Schedule {
  id: number
  name: string
  description?: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  isActive: boolean
  recurrence?: RecurrencePattern
  mediaFiles: MediaFile[]
  devices: Device[]
  createdAt: string
  updatedAt: string
  lastModified: string
  
  // Enhanced fields for user assignment
  assignedUsers?: UserScheduleAssignment[]
  conflictsWith?: ScheduleConflict[]
  priority: number // 1-10, for conflict resolution
  allowsConflicts: boolean
  maxConcurrentUsers?: number
  tags?: string[]
  category?: string
}
```

### UserScheduleAssignment Entity
```typescript
interface UserScheduleAssignment {
  id: number
  userId: number
  scheduleId: number
  assignedAt: string
  assignedBy: number // User ID of assigner
  status: 'active' | 'inactive' | 'conflict' | 'pending'
  priority: number
  notes?: string
  
  // Relationship fields
  user: User
  schedule: Schedule
  assignedByUser: User
  
  // Conflict tracking
  conflicts?: ScheduleConflict[]
  lastSyncedAt?: string
  syncStatus: 'synced' | 'pending' | 'failed'
}
```

**Business Rules**:
- User can have multiple schedule assignments
- Assignment priority determines conflict resolution
- Inactive assignments preserved for audit trail
- Sync status tracks real-time update delivery

### ScheduleConflict Entity
```typescript
interface ScheduleConflict {
  id: number
  userId: number
  scheduleIds: number[]
  conflictType: 'time_overlap' | 'resource_conflict' | 'device_conflict'
  severity: 'low' | 'medium' | 'high' | 'critical'
  detectedAt: string
  resolvedAt?: string
  resolutionStrategy?: 'priority' | 'manual' | 'ignore'
  resolvedBy?: number
  isActive: boolean
  
  // Conflict details
  overlapStart: string
  overlapEnd: string
  affectedDevices?: number[]
  autoResolutionAttempted: boolean
  manualResolutionRequired: boolean
}
```

**Conflict Resolution Rules**:
- Time overlap: Higher priority schedule takes precedence
- Resource conflict: Admin intervention required
- Device conflict: Load balancing or manual assignment

## Enhanced UI State Models

### BulkOperation Entity
```typescript
interface BulkOperation {
  id: string
  type: 'assign_schedules' | 'update_users' | 'delete_users' | 'resolve_conflicts'
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
  progress: number // 0-100
  totalItems: number
  processedItems: number
  failedItems: BulkOperationError[]
  startedAt: string
  completedAt?: string
  createdBy: number
  
  // Operation-specific data
  metadata: {
    userIds?: number[]
    scheduleIds?: number[]
    assignmentData?: Partial<UserScheduleAssignment>
    updateData?: Partial<User>
  }
}
```

### BulkOperationError Entity
```typescript
interface BulkOperationError {
  itemId: number
  errorType: 'validation' | 'conflict' | 'permission' | 'network' | 'unknown'
  errorMessage: string
  retryable: boolean
  retryCount: number
  lastAttemptAt: string
}
```

### PerformanceMetric Entity
```typescript
interface PerformanceMetric {
  id: string
  operation: string
  duration: number
  itemCount: number
  timestamp: string
  userId: number
  metadata: {
    cacheHits?: number
    apiCalls?: number
    virtualizedRows?: number
    optimisticUpdates?: number
  }
}
```

## API Response Models

### PaginatedUserResponse
```typescript
interface PaginatedUserResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters?: {
    role?: string
    isActive?: boolean
    search?: string
  }
  sorting?: {
    field: string
    direction: 'asc' | 'desc'
  }
}
```

### UserScheduleAssignmentResponse
```typescript
interface UserScheduleAssignmentResponse {
  assignments: UserScheduleAssignment[]
  conflicts: ScheduleConflict[]
  summary: {
    totalAssignments: number
    activeAssignments: number
    conflictCount: number
    lastUpdated: string
  }
  upcomingSchedules: {
    schedule: Schedule
    startsIn: string
    duration: string
  }[]
}
```

## Validation Schemas (Zod)

### User Creation Schema
```typescript
const createUserSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  password: z.string().min(8).max(128),
  roleId: z.number().int().positive(),
  phoneNumber: z.string().optional(),
  department: z.string().optional(),
  timezone: z.string().optional(),
})
```

### Schedule Assignment Schema
```typescript
const scheduleAssignmentSchema = z.object({
  userIds: z.array(z.number().int().positive()).min(1),
  scheduleId: z.number().int().positive(),
  priority: z.number().int().min(1).max(10).default(5),
  notes: z.string().optional(),
  allowConflicts: z.boolean().default(false),
})
```

### Bulk Assignment Schema
```typescript
const bulkAssignmentSchema = z.object({
  userIds: z.array(z.number().int().positive()).min(1).max(100),
  scheduleIds: z.array(z.number().int().positive()).min(1).max(50),
  assignmentSettings: z.object({
    priority: z.number().int().min(1).max(10).default(5),
    allowConflicts: z.boolean().default(false),
    notes: z.string().optional(),
    replaceExisting: z.boolean().default(false),
  }),
})
```

## Entity Relationships

```
User (1) ←→ (N) UserScheduleAssignment ←→ (1) Schedule
User (1) ←→ (N) ScheduleConflict
User (N) ←→ (1) UserRole
UserRole (1) ←→ (N) Permission
Schedule (1) ←→ (N) ScheduleConflict
BulkOperation (1) ←→ (N) BulkOperationError
```

## Database Considerations

### Indexing Strategy
- `users.email` - Unique index for authentication
- `users.username` - Unique index for login
- `user_schedule_assignments(user_id, schedule_id)` - Composite index
- `schedule_conflicts.user_id` - Index for conflict queries
- `bulk_operations.created_by` - Index for user operations

### Soft Delete Strategy
- Users: `isActive` flag, preserve assignments
- Schedules: `isActive` flag, preserve assignments but mark inactive
- Assignments: Status-based soft delete with audit trail

## Performance Optimizations

### Caching Strategy
- User list: 5-minute cache with tag-based invalidation
- Role permissions: Long-lived cache (1 hour)
- Schedule conflicts: Real-time updates, no caching
- Assignment counts: Aggregate caching with incremental updates

### Query Optimization
- Use pagination for all list operations
- Implement search with debouncing (300ms)
- Lazy load assignment details
- Batch conflict detection queries

This data model supports all functional requirements while maintaining compatibility with existing API endpoints and database structure.