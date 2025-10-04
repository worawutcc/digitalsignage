/**
 * useUsers Hook - React Query integration for user management
 * Enhanced with advanced filtering, search debouncing, and bulk operations
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import type {
  User,
  UserRole,
  CreateUserRequest,
  UpdateUserRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  UserFilters,
  EnhancedUser,
  BulkScheduleAssignmentRequest,
  BulkOperationResponse,
  UserScheduleAssignment,
  ScheduleConflict,
} from '../types';

// Custom hook for debouncing search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Query keys for user management
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  roles: {
    all: ['roles'] as const,
    lists: () => [...userKeys.roles.all, 'list'] as const,
    details: () => [...userKeys.roles.all, 'detail'] as const,
    detail: (id: string) => [...userKeys.roles.details(), id] as const,
  },
} as const;

/**
 * Enhanced hook to fetch paginated list of users with advanced filtering and search debouncing
 */
export function useUsers(filters?: UserFilters, options?: {
  debounceMs?: number;
  enableSearch?: boolean;
  enableAdvancedFiltering?: boolean;
}) {
  const { debounceMs = 300, enableSearch = true, enableAdvancedFiltering = true } = options || {};
  
  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(filters?.search || '', debounceMs);
  
  // Create enhanced filters with debounced search
  const enhancedFilters = useMemo(() => {
    if (!filters) return undefined;
    
    const result: UserFilters = { ...filters };
    
    if (enableSearch) {
      if (debouncedSearchTerm) {
        result.search = debouncedSearchTerm;
      } else {
        delete result.search;
      }
    }
    
    return result;
  }, [filters, debouncedSearchTerm, enableSearch]);

  return useQuery({
    queryKey: userKeys.list(enhancedFilters),
    queryFn: () => userService.getEnhancedUsers(enhancedFilters),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    placeholderData: (previousData: any) => previousData, // Keep previous data while loading new search
    retry: (failureCount, error: any) => {
      // Don't retry on client errors (400-499)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for advanced user filtering with state management and search debouncing
 */
export function useUsersWithAdvancedFiltering(initialFilters?: UserFilters) {
  const [filters, setFilters] = useState<UserFilters>(
    initialFilters || {
      page: 1,
      limit: 20,
      sort: 'username',
      order: 'asc',
    }
  );

  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Update filters when debounced search term changes
  useEffect(() => {
    setFilters(prev => {
      const updated: UserFilters = { ...prev, page: 1 };
      if (debouncedSearchTerm) {
        updated.search = debouncedSearchTerm;
      } else {
        delete updated.search;
      }
      return updated;
    });
  }, [debouncedSearchTerm]);

  const updateFilters = useCallback((updates: Partial<UserFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...updates,
      // Reset to first page when filters change
      page: updates.page !== undefined ? updates.page : 1,
    }));
  }, []);

  const updateSearch = useCallback((search: string) => {
    setSearchTerm(search);
  }, []);

  const resetFilters = useCallback(() => {
    const defaultFilters: UserFilters = {
      page: 1,
      limit: 20,
      sort: 'username',
      order: 'asc',
    };
    setFilters(defaultFilters);
    setSearchTerm('');
  }, []);

  const query = useUsers(filters, { enableSearch: true, enableAdvancedFiltering: true });

  return {
    ...query,
    filters,
    searchTerm,
    updateFilters,
    updateSearch,
    resetFilters,
    isFiltered: Boolean(
      filters.search ||
      filters.role?.length ||
      filters.status?.length ||
      filters.department?.length ||
      filters.hasScheduleConflicts !== undefined
    ),
  };
}

/**
 * Hook to fetch single user by ID
 */
export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch all available roles
 */
export function useRoles() {
  return useQuery({
    queryKey: userKeys.roles.lists(),
    queryFn: () => userService.getRoles(),
    staleTime: 300000, // 5 minutes (roles don't change often)
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch single role by ID
 */
export function useRole(id: string) {
  return useQuery({
    queryKey: userKeys.roles.detail(id),
    queryFn: () => userService.getRoleById(id),
    enabled: !!id,
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Hook to create a new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),
    onSuccess: () => {
      // Invalidate all user lists to refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) =>
      userService.updateUser(id, data),
    onSuccess: (updatedUser) => {
      // Update the user detail cache
      queryClient.setQueryData(userKeys.detail(updatedUser.userId), updatedUser);
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: userKeys.detail(deletedId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to activate a user
 */
export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.activateUser(id),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userKeys.detail(updatedUser.userId), updatedUser);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to deactivate a user
 */
export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.deactivateUser(id),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userKeys.detail(updatedUser.userId), updatedUser);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to reset user password
 */
export function useResetUserPassword() {
  return useMutation({
    mutationFn: (id: number) => userService.resetUserPassword(id),
  });
}

/**
 * Hook to create a new role
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleRequest) => userService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.roles.lists() });
    },
  });
}

/**
 * Hook to update an existing role
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) =>
      userService.updateRole(id, data),
    onSuccess: (updatedRole) => {
      queryClient.setQueryData(
        userKeys.roles.detail(updatedRole.id),
        updatedRole
      );
      queryClient.invalidateQueries({ queryKey: userKeys.roles.lists() });
      // Also invalidate users since their roles may have changed
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to delete a role
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deleteRole(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: userKeys.roles.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: userKeys.roles.lists() });
    },
  });
}

// ============================================================================
// BULK OPERATIONS HOOKS
// ============================================================================

/**
 * Hook for bulk schedule assignment to multiple users
 */
export function useBulkAssignSchedules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BulkScheduleAssignmentRequest) => 
      userService.bulkAssignSchedules(request),
    onSuccess: () => {
      // Invalidate all user-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['userSchedules'] });
    },
    onError: (error: any) => {
      console.error('Bulk schedule assignment failed:', error);
    },
  });
}

/**
 * Hook for bulk removal of schedule assignments
 */
export function useBulkRemoveScheduleAssignments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userIds, scheduleIds }: { userIds: number[]; scheduleIds: number[] }) =>
      userService.bulkRemoveScheduleAssignments(userIds, scheduleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['userSchedules'] });
    },
    onError: (error: any) => {
      console.error('Bulk schedule removal failed:', error);
    },
  });
}

/**
 * Hook to get users with schedule conflicts
 */
export function useUsersWithConflicts(options?: {
  severity?: ('low' | 'medium' | 'high' | 'critical')[];
  scheduleIds?: number[];
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['users', 'conflicts', options],
    queryFn: () => userService.getUsersWithConflicts(options),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get user's schedule assignments with conflict information
 */
export function useUserScheduleAssignments(
  userId: number,
  options?: {
    includeInactive?: boolean;
    startDate?: string;
    endDate?: string;
  }
) {
  return useQuery({
    queryKey: ['users', userId, 'schedule-assignments', options],
    queryFn: () => userService.getUserScheduleAssignments(userId, options),
    enabled: !!userId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to assign a schedule to a user
 */
export function useAssignScheduleToUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, request }: { 
      userId: number; 
      request: { scheduleId: number; priority?: number; notes?: string; allowConflicts?: boolean } 
    }) => userService.assignScheduleToUser(userId, request),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['users', userId, 'schedule-assignments'] });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error: any) => {
      // Handle conflict errors specially
      if (error.message && error.message.includes('conflict')) {
        console.warn('Schedule conflict detected:', error);
      } else {
        console.error('Schedule assignment failed:', error);
      }
    },
  });
}

/**
 * Hook to get user assignment statistics
 */
export function useUserAssignmentStats(userId: number) {
  return useQuery({
    queryKey: ['users', userId, 'assignment-stats'],
    queryFn: () => userService.getUserAssignmentStats(userId),
    enabled: !!userId,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to check if user can be assigned to schedule
 */
export function useCanAssignUserToSchedule(userId: number, scheduleId: number) {
  return useQuery({
    queryKey: ['users', userId, 'can-assign', scheduleId],
    queryFn: () => userService.canAssignUserToSchedule(userId, scheduleId),
    enabled: !!userId && !!scheduleId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get suggested users for schedule assignment
 */
export function useSuggestedUsersForSchedule(
  scheduleId: number, 
  options?: {
    limit?: number;
    excludeUserIds?: number[];
    requiredRole?: string;
  }
) {
  return useQuery({
    queryKey: ['schedules', scheduleId, 'suggested-users', options],
    queryFn: () => userService.getSuggestedUsersForSchedule(scheduleId, options),
    enabled: !!scheduleId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

// ============================================================================
// LEGACY HOOKS (keeping for backward compatibility)
// ============================================================================

/**
 * Hook to manage user filters with state
 */
export function useUserFilters(initialFilters?: UserFilters) {
  const [filters, setFilters] = useState<UserFilters>(
    initialFilters || {
      page: 1,
      limit: 10,
      sort: 'createdAt',
      order: 'desc',
    }
  );

  const updateFilters = useCallback(
    (updates: Partial<UserFilters>) => {
      setFilters((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
      sort: 'createdAt',
      order: 'desc',
    });
  }, []);

  return {
    filters,
    updateFilters,
    resetFilters,
  };
}

// ==========================================
// User Schedule Assignment Hooks (Phase 1)
// ==========================================

/**
 * Hook to fetch user's assigned schedules
 * T028: useUserSchedules
 */
export function useUserSchedules(userId: number) {
  return useQuery({
    queryKey: ['userSchedules', userId],
    queryFn: async () => {
      const { userScheduleService } = await import('../services/userScheduleService');
      return userScheduleService.getUserSchedules(userId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 2,
    enabled: !!userId && userId > 0,
  });
}

/**
 * Hook to assign schedules to a user (REPLACE semantics)
 * T029: useAssignSchedules
 */
export function useAssignSchedules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, scheduleIds }: { userId: number; scheduleIds: number[] }) => {
      const { userScheduleService } = await import('../services/userScheduleService');
      return userScheduleService.assignSchedules(userId, scheduleIds);
    },

    // Optimistic update
    onMutate: async ({ userId, scheduleIds }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['userSchedules', userId] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['userSchedules', userId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['userSchedules', userId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          schedules: scheduleIds.map((id) => ({
            scheduleId: id,
            userId,
            assignedAt: new Date().toISOString(),
            assignedBy: 'current-admin', // TODO: Get from auth context
          })),
        };
      });

      return { previousData };
    },

    onSuccess: (data, { userId }) => {
      // Invalidate cache to refetch with accurate data
      queryClient.invalidateQueries({ queryKey: ['userSchedules', userId] });
      
      // Show success notification
      if (typeof window !== 'undefined') {
        // toast.success(`Successfully assigned ${data.assignedScheduleIds.length} schedules`);
        console.log(`Successfully assigned ${data.assignedScheduleIds.length} schedules`);
      }
    },

    onError: (error: any, { userId }, context) => {
      // Rollback to previous data on error
      if (context?.previousData) {
        queryClient.setQueryData(['userSchedules', userId], context.previousData);
      }
      
      // Show error notification
      if (typeof window !== 'undefined') {
        // toast.error(error.message || 'Failed to assign schedules');
        console.error('Failed to assign schedules:', error.message);
      }
    },
  });
}

/**
 * Hook to remove all schedules from a user
 * T030: useRemoveUserSchedules
 */
export function useRemoveUserSchedules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      const { userScheduleService } = await import('../services/userScheduleService');
      return userScheduleService.removeAllSchedules(userId);
    },

    onSuccess: (_, userId) => {
      // Invalidate cache to refetch
      queryClient.invalidateQueries({ queryKey: ['userSchedules', userId] });
      
      // Show success notification
      if (typeof window !== 'undefined') {
        // toast.success('Successfully removed all schedules');
        console.log('Successfully removed all schedules');
      }
    },

    onError: (error: any) => {
      // Show error notification
      if (typeof window !== 'undefined') {
        // toast.error(error.message || 'Failed to remove schedules');
        console.error('Failed to remove schedules:', error.message);
      }
    },
  });
}
