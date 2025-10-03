/**
 * User Slice
 * 
 * Enhanced Redux Toolkit slice for managing user state with bulk operations,
 * optimistic updates, enhanced caching, and analytics state management.
 * 
 * @see copilot-instructions-web.md - State Management Rules
 * @see specs/021-user-schedule-assignment/tasks.md - T023 Requirements
 */

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import type { User } from '@/types/api'
import type { UserSchedule } from '@/features/users/types/userSchedule'

/**
 * Bulk operation state interface
 */
export interface BulkOperationState {
  isRunning: boolean
  operation: 'assign' | 'remove' | 'update' | null
  progress: {
    total: number
    completed: number
    failed: number
    percentage: number
  }
  errors: string[]
  canRetry: boolean
}

/**
 * Optimistic update interface
 */
export interface OptimisticUpdate {
  id: string
  type: 'add' | 'remove' | 'update'
  data: any
  timestamp: number
  userId?: number
  scheduleIds?: number[]
}

/**
 * Cache metadata interface
 */
export interface CacheMetadata {
  lastFetched: number
  expiresAt: number
  isStale: boolean
  prefetchStrategy: 'none' | 'related' | 'aggressive'
}

/**
 * Analytics state interface
 */
export interface AnalyticsState {
  events: Array<{
    id: string
    type: string
    data: Record<string, any>
    timestamp: number
    userId?: number
  }>
  performance: {
    operationTimes: Record<string, number[]>
    averageResponseTime: number
    errorRate: number
  }
  userInteractions: {
    searchQueries: string[]
    filterUsage: Record<string, number>
    componentUsage: Record<string, number>
  }
}

/**
 * Enhanced User State
 */
export interface UserState {
  // Core user data
  users: User[]
  userSchedules: Record<number, UserSchedule[]>
  selectedUserIds: number[]
  currentUserId: number | null
  
  // Loading states
  isLoading: boolean
  isLoadingSchedules: boolean
  isSaving: boolean
  
  // Error states
  error: string | null
  scheduleError: string | null
  
  // Search and filter state
  searchQuery: string
  filters: {
    role: string | null
    status: 'active' | 'inactive' | null
    hasSchedules: boolean | null
    dateRange: {
      start: string | null
      end: string | null
    }
  }
  sortBy: 'name' | 'email' | 'role' | 'lastAssigned'
  sortOrder: 'asc' | 'desc'
  
  // Pagination
  pagination: {
    page: number
    pageSize: number
    total: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  
  // Bulk operations
  bulkOperation: BulkOperationState
  
  // Optimistic updates
  optimisticUpdates: OptimisticUpdate[]
  
  // Enhanced caching
  cache: {
    users: CacheMetadata
    userSchedules: Record<number, CacheMetadata>
    enableEnhancedCaching: boolean
    prefetchStrategy: 'none' | 'related' | 'aggressive'
  }
  
  // Analytics and performance
  analytics: AnalyticsState
  
  // UI state
  ui: {
    isUserListModalOpen: boolean
    isScheduleAssignModalOpen: boolean
    isRemoveConfirmationOpen: boolean
    selectedScheduleIds: number[]
    showBulkActions: boolean
    viewMode: 'grid' | 'list'
  }
}

/**
 * Initial state
 */
const initialState: UserState = {
  // Core user data
  users: [],
  userSchedules: {},
  selectedUserIds: [],
  currentUserId: null,
  
  // Loading states
  isLoading: false,
  isLoadingSchedules: false,
  isSaving: false,
  
  // Error states
  error: null,
  scheduleError: null,
  
  // Search and filter state
  searchQuery: '',
  filters: {
    role: null,
    status: null,
    hasSchedules: null,
    dateRange: {
      start: null,
      end: null
    }
  },
  sortBy: 'name',
  sortOrder: 'asc',
  
  // Pagination
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    hasNextPage: false,
    hasPreviousPage: false
  },
  
  // Bulk operations
  bulkOperation: {
    isRunning: false,
    operation: null,
    progress: {
      total: 0,
      completed: 0,
      failed: 0,
      percentage: 0
    },
    errors: [],
    canRetry: false
  },
  
  // Optimistic updates
  optimisticUpdates: [],
  
  // Enhanced caching
  cache: {
    users: {
      lastFetched: 0,
      expiresAt: 0,
      isStale: true,
      prefetchStrategy: 'none'
    },
    userSchedules: {},
    enableEnhancedCaching: true,
    prefetchStrategy: 'related'
  },
  
  // Analytics and performance
  analytics: {
    events: [],
    performance: {
      operationTimes: {},
      averageResponseTime: 0,
      errorRate: 0
    },
    userInteractions: {
      searchQueries: [],
      filterUsage: {},
      componentUsage: {}
    }
  },
  
  // UI state
  ui: {
    isUserListModalOpen: false,
    isScheduleAssignModalOpen: false,
    isRemoveConfirmationOpen: false,
    selectedScheduleIds: [],
    showBulkActions: false,
    viewMode: 'list'
  }
}

/**
 * User slice
 */
export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Core user actions
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload
      state.cache.users = {
        lastFetched: Date.now(),
        expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
        isStale: false,
        prefetchStrategy: state.cache.prefetchStrategy
      }
    },
    
    addUser: (state, action: PayloadAction<User>) => {
      const existingIndex = state.users.findIndex(u => u.id === action.payload.id)
      if (existingIndex >= 0) {
        state.users[existingIndex] = action.payload
      } else {
        state.users.push(action.payload)
      }
    },
    
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(u => u.id === action.payload.id)
      if (index >= 0) {
        state.users[index] = action.payload
      }
    },
    
    removeUser: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter(u => u.id !== action.payload)
      delete state.userSchedules[action.payload]
      state.selectedUserIds = state.selectedUserIds.filter(id => id !== action.payload)
    },
    
    // User schedules actions
    setUserSchedules: (state, action: PayloadAction<{ userId: number; schedules: UserSchedule[] }>) => {
      const { userId, schedules } = action.payload
      state.userSchedules[userId] = schedules
      state.cache.userSchedules[userId] = {
        lastFetched: Date.now(),
        expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
        isStale: false,
        prefetchStrategy: state.cache.prefetchStrategy
      }
    },
    
    addUserSchedule: (state, action: PayloadAction<{ userId: number; schedule: UserSchedule }>) => {
      const { userId, schedule } = action.payload
      if (!state.userSchedules[userId]) {
        state.userSchedules[userId] = []
      }
      state.userSchedules[userId].push(schedule)
    },
    
    removeUserSchedule: (state, action: PayloadAction<{ userId: number; scheduleId: number }>) => {
      const { userId, scheduleId } = action.payload
      if (state.userSchedules[userId]) {
        state.userSchedules[userId] = state.userSchedules[userId].filter(
          s => s.scheduleId !== scheduleId
        )
      }
    },
    
    // Selection actions
    setSelectedUserIds: (state, action: PayloadAction<number[]>) => {
      state.selectedUserIds = action.payload
      state.ui.showBulkActions = action.payload.length > 1
    },
    
    toggleUserSelection: (state, action: PayloadAction<number>) => {
      const userId = action.payload
      const index = state.selectedUserIds.indexOf(userId)
      if (index >= 0) {
        state.selectedUserIds.splice(index, 1)
      } else {
        state.selectedUserIds.push(userId)
      }
      state.ui.showBulkActions = state.selectedUserIds.length > 1
    },
    
    selectAllUsers: (state) => {
      state.selectedUserIds = state.users.map(u => u.userId)
      state.ui.showBulkActions = true
    },
    
    clearUserSelection: (state) => {
      state.selectedUserIds = []
      state.ui.showBulkActions = false
    },
    
    setCurrentUserId: (state, action: PayloadAction<number | null>) => {
      state.currentUserId = action.payload
    },
    
    // Search and filter actions
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
      state.pagination.page = 1 // Reset to first page
      
      // Track search query
      if (action.payload.trim()) {
        state.analytics.userInteractions.searchQueries.push(action.payload)
        // Keep only last 100 queries
        if (state.analytics.userInteractions.searchQueries.length > 100) {
          state.analytics.userInteractions.searchQueries.shift()
        }
      }
    },
    
    setFilters: (state, action: PayloadAction<Partial<UserState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
      state.pagination.page = 1 // Reset to first page
      
      // Track filter usage
      Object.entries(action.payload).forEach(([key, value]) => {
        if (value !== null) {
          const filterKey = `${key}:${value}`
          state.analytics.userInteractions.filterUsage[filterKey] = 
            (state.analytics.userInteractions.filterUsage[filterKey] || 0) + 1
        }
      })
    },
    
    setSorting: (state, action: PayloadAction<{ sortBy: UserState['sortBy']; sortOrder: UserState['sortOrder'] }>) => {
      const { sortBy, sortOrder } = action.payload
      state.sortBy = sortBy
      state.sortOrder = sortOrder
    },
    
    // Pagination actions
    setPagination: (state, action: PayloadAction<Partial<UserState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    
    nextPage: (state) => {
      if (state.pagination.hasNextPage) {
        state.pagination.page += 1
      }
    },
    
    previousPage: (state) => {
      if (state.pagination.hasPreviousPage) {
        state.pagination.page -= 1
      }
    },
    
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    
    setLoadingSchedules: (state, action: PayloadAction<boolean>) => {
      state.isLoadingSchedules = action.payload
    },
    
    setSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload
    },
    
    // Error states
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    
    setScheduleError: (state, action: PayloadAction<string | null>) => {
      state.scheduleError = action.payload
    },
    
    // Bulk operation actions
    startBulkOperation: (state, action: PayloadAction<{ operation: BulkOperationState['operation']; total: number }>) => {
      const { operation, total } = action.payload
      state.bulkOperation = {
        isRunning: true,
        operation,
        progress: {
          total,
          completed: 0,
          failed: 0,
          percentage: 0
        },
        errors: [],
        canRetry: false
      }
    },
    
    updateBulkOperationProgress: (state, action: PayloadAction<Partial<BulkOperationState['progress']>>) => {
      state.bulkOperation.progress = { ...state.bulkOperation.progress, ...action.payload }
      const { completed, failed, total } = state.bulkOperation.progress
      state.bulkOperation.progress.percentage = total > 0 ? Math.round(((completed + failed) / total) * 100) : 0
    },
    
    addBulkOperationError: (state, action: PayloadAction<string>) => {
      state.bulkOperation.errors.push(action.payload)
      state.bulkOperation.progress.failed += 1
    },
    
    completeBulkOperation: (state) => {
      state.bulkOperation.isRunning = false
      state.bulkOperation.canRetry = state.bulkOperation.errors.length > 0
    },
    
    resetBulkOperation: (state) => {
      state.bulkOperation = initialState.bulkOperation
    },
    
    // Optimistic updates
    addOptimisticUpdate: (state, action: PayloadAction<OptimisticUpdate>) => {
      state.optimisticUpdates.push(action.payload)
    },
    
    removeOptimisticUpdate: (state, action: PayloadAction<string>) => {
      state.optimisticUpdates = state.optimisticUpdates.filter(update => update.id !== action.payload)
    },
    
    clearOptimisticUpdates: (state) => {
      state.optimisticUpdates = []
    },
    
    // Cache management
    setCacheStrategy: (state, action: PayloadAction<'none' | 'related' | 'aggressive'>) => {
      state.cache.prefetchStrategy = action.payload
    },
    
    enableEnhancedCaching: (state, action: PayloadAction<boolean>) => {
      state.cache.enableEnhancedCaching = action.payload
    },
    
    invalidateCache: (state, action: PayloadAction<'users' | 'schedules' | 'all'>) => {
      const target = action.payload
      if (target === 'users' || target === 'all') {
        state.cache.users.isStale = true
        state.cache.users.expiresAt = 0
      }
      if (target === 'schedules' || target === 'all') {
        Object.keys(state.cache.userSchedules).forEach(userId => {
          const numUserId = Number(userId)
          if (state.cache.userSchedules[numUserId]) {
            state.cache.userSchedules[numUserId].isStale = true
            state.cache.userSchedules[numUserId].expiresAt = 0
          }
        })
      }
    },
    
    // Analytics actions
    trackEvent: (state, action: PayloadAction<{ type: string; data: Record<string, any>; userId?: number }>) => {
      const { type, data, userId } = action.payload
      const event = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: Date.now(),
        ...(userId !== undefined && { userId })
      }
      
      state.analytics.events.push(event)
      
      // Keep only last 1000 events
      if (state.analytics.events.length > 1000) {
        state.analytics.events.shift()
      }
    },
    
    trackPerformance: (state, action: PayloadAction<{ operation: string; duration: number }>) => {
      const { operation, duration } = action.payload
      
      if (!state.analytics.performance.operationTimes[operation]) {
        state.analytics.performance.operationTimes[operation] = []
      }
      
      state.analytics.performance.operationTimes[operation].push(duration)
      
      // Keep only last 100 measurements per operation
      if (state.analytics.performance.operationTimes[operation].length > 100) {
        state.analytics.performance.operationTimes[operation].shift()
      }
      
      // Update average response time
      const allTimes = Object.values(state.analytics.performance.operationTimes).flat()
      state.analytics.performance.averageResponseTime = 
        allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length
    },
    
    trackComponentUsage: (state, action: PayloadAction<string>) => {
      const component = action.payload
      state.analytics.userInteractions.componentUsage[component] = 
        (state.analytics.userInteractions.componentUsage[component] || 0) + 1
    },
    
    // UI actions
    toggleModal: (state, action: PayloadAction<'userList' | 'scheduleAssign' | 'removeConfirmation'>) => {
      const modal = action.payload
      switch (modal) {
        case 'userList':
          state.ui.isUserListModalOpen = !state.ui.isUserListModalOpen
          break
        case 'scheduleAssign':
          state.ui.isScheduleAssignModalOpen = !state.ui.isScheduleAssignModalOpen
          break
        case 'removeConfirmation':
          state.ui.isRemoveConfirmationOpen = !state.ui.isRemoveConfirmationOpen
          break
      }
    },
    
    setSelectedScheduleIds: (state, action: PayloadAction<number[]>) => {
      state.ui.selectedScheduleIds = action.payload
    },
    
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.ui.viewMode = action.payload
      state.analytics.userInteractions.componentUsage[`viewMode:${action.payload}`] = 
        (state.analytics.userInteractions.componentUsage[`viewMode:${action.payload}`] || 0) + 1
    },
    
    // Reset actions
    resetUserState: () => initialState,
    
    resetFilters: (state) => {
      state.searchQuery = ''
      state.filters = initialState.filters
      state.pagination.page = 1
    }
  }
})

// Export actions
export const {
  // Core user actions
  setUsers,
  addUser,
  updateUser,
  removeUser,
  
  // User schedules actions
  setUserSchedules,
  addUserSchedule,
  removeUserSchedule,
  
  // Selection actions
  setSelectedUserIds,
  toggleUserSelection,
  selectAllUsers,
  clearUserSelection,
  setCurrentUserId,
  
  // Search and filter actions
  setSearchQuery,
  setFilters,
  setSorting,
  
  // Pagination actions
  setPagination,
  nextPage,
  previousPage,
  
  // Loading states
  setLoading,
  setLoadingSchedules,
  setSaving,
  
  // Error states
  setError,
  setScheduleError,
  
  // Bulk operation actions
  startBulkOperation,
  updateBulkOperationProgress,
  addBulkOperationError,
  completeBulkOperation,
  resetBulkOperation,
  
  // Optimistic updates
  addOptimisticUpdate,
  removeOptimisticUpdate,
  clearOptimisticUpdates,
  
  // Cache management
  setCacheStrategy,
  enableEnhancedCaching,
  invalidateCache,
  
  // Analytics actions
  trackEvent,
  trackPerformance,
  trackComponentUsage,
  
  // UI actions
  toggleModal,
  setSelectedScheduleIds,
  setViewMode,
  
  // Reset actions
  resetUserState,
  resetFilters
} = userSlice.actions

// Selectors
export const selectUsers = (state: RootState) => state.users.users
export const selectUserSchedules = (userId: number) => (state: RootState) => 
  state.users.userSchedules[userId] || []
export const selectSelectedUserIds = (state: RootState) => state.users.selectedUserIds
export const selectCurrentUserId = (state: RootState) => state.users.currentUserId
export const selectSearchQuery = (state: RootState) => state.users.searchQuery
export const selectFilters = (state: RootState) => state.users.filters
export const selectSorting = (state: RootState) => ({ 
  sortBy: state.users.sortBy, 
  sortOrder: state.users.sortOrder 
})
export const selectPagination = (state: RootState) => state.users.pagination
export const selectIsLoading = (state: RootState) => state.users.isLoading
export const selectError = (state: RootState) => state.users.error
export const selectBulkOperation = (state: RootState) => state.users.bulkOperation
export const selectOptimisticUpdates = (state: RootState) => state.users.optimisticUpdates
export const selectCacheState = (state: RootState) => state.users.cache
export const selectAnalytics = (state: RootState) => state.users.analytics
export const selectUI = (state: RootState) => state.users.ui

// Complex selectors
export const selectFilteredUsers = (state: RootState) => {
  let filteredUsers = state.users.users

  // Apply search query
  if (state.users.searchQuery.trim()) {
    const query = state.users.searchQuery.toLowerCase()
    filteredUsers = filteredUsers.filter(user => 
      user.fullName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    )
  }

  // Apply filters
  const { role, status, hasSchedules } = state.users.filters
  
  if (role) {
    filteredUsers = filteredUsers.filter(user => user.role === role)
  }
  
  if (status) {
    filteredUsers = filteredUsers.filter(user => 
      status === 'active' ? user.isActive : !user.isActive
    )
  }
  
  if (hasSchedules !== null) {
    filteredUsers = filteredUsers.filter(user => {
      const userSchedules = state.users.userSchedules[user.userId] || []
      return hasSchedules ? userSchedules.length > 0 : userSchedules.length === 0
    })
  }

  return filteredUsers
}

export const selectSortedUsers = (state: RootState) => {
  const filteredUsers = selectFilteredUsers(state)
  const { sortBy, sortOrder } = state.users

  return [...filteredUsers].sort((a, b) => {
    let aValue: any, bValue: any

    switch (sortBy) {
      case 'name':
        aValue = `${a.firstName} ${a.lastName}`.toLowerCase()
        bValue = `${b.firstName} ${b.lastName}`.toLowerCase()
        break
      case 'email':
        aValue = a.email.toLowerCase()
        bValue = b.email.toLowerCase()
        break
      case 'role':
        aValue = a.role.toLowerCase()
        bValue = b.role.toLowerCase()
        break
      case 'lastAssigned':
        const aSchedules = state.users.userSchedules[a.userId] || []
        const bSchedules = state.users.userSchedules[b.userId] || []
        aValue = aSchedules.length > 0 ? Math.max(...aSchedules.map(s => new Date(s.assignedAt).getTime())) : 0
        bValue = bSchedules.length > 0 ? Math.max(...bSchedules.map(s => new Date(s.assignedAt).getTime())) : 0
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })
}

export const selectPaginatedUsers = (state: RootState) => {
  const sortedUsers = selectSortedUsers(state)
  const { page, pageSize } = state.users.pagination
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize

  return sortedUsers.slice(startIndex, endIndex)
}

export const selectUserById = (userId: number) => (state: RootState) =>
  state.users.users.find(user => user.id === userId)

export const selectIsUserSelected = (userId: number) => (state: RootState) =>
  state.users.selectedUserIds.includes(userId)

export const selectSelectedUsers = (state: RootState) =>
  state.users.users.filter(user => state.users.selectedUserIds.includes(user.userId))

export const selectBulkOperationProgress = (state: RootState) => {
  const { progress, isRunning } = state.users.bulkOperation
  return {
    ...progress,
    isRunning,
    isComplete: !isRunning && progress.total > 0,
    hasErrors: progress.failed > 0
  }
}

export const selectPerformanceMetrics = (state: RootState) => {
  const { operationTimes, averageResponseTime, errorRate } = state.users.analytics.performance
  
  return {
    averageResponseTime,
    errorRate,
    operationCounts: Object.entries(operationTimes).reduce((acc, [op, times]) => {
      acc[op] = times.length
      return acc
    }, {} as Record<string, number>),
    slowestOperations: Object.entries(operationTimes).map(([op, times]) => ({
      operation: op,
      maxTime: Math.max(...times),
      averageTime: times.reduce((sum, time) => sum + time, 0) / times.length
    })).sort((a, b) => b.maxTime - a.maxTime)
  }
}

// Export reducer
export default userSlice.reducer