/**
 * useUsers Hook - React Query integration for user management
 */

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
} from '../types';

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
 * Hook to fetch paginated list of users with filters
 */
export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => userService.getUsers(filters),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
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
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
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
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
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
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
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

/**
 * Hook to manage user filters with state
 */
export function useUserFilters(initialFilters?: UserFilters) {
  const [filters, setFilters] = React.useState<UserFilters>(
    initialFilters || {
      page: 1,
      limit: 10,
      sort: 'createdAt',
      order: 'desc',
    }
  );

  const updateFilters = React.useCallback(
    (updates: Partial<UserFilters>) => {
      setFilters((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const resetFilters = React.useCallback(() => {
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

// Add React import for hooks
import React from 'react';
