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
  detail: (id: string) => [...userKeys.details(), id] as const,
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
export function useUser(id: string) {
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
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
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
    mutationFn: (id: string) => userService.deleteUser(id),
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
    mutationFn: (id: string) => userService.activateUser(id),
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
    mutationFn: (id: string) => userService.deactivateUser(id),
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
    mutationFn: (id: string) => userService.resetUserPassword(id),
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

// Add React import for hooks
import React from 'react';
