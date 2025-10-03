/**
 * User Management Feature Types
 * Defines all TypeScript interfaces for user, role, and permission management
 */

import { User } from '@/types/api'
export type { User }

export interface UserRole {
  id: string;
  name: string;
  description: string;
  level: number; // 1: Super Admin, 2: Admin, 3: Manager, 4: Operator
  permissions: Permission[];
  userCount?: number;
  createdAt: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  name?: string;
  conditions?: Record<string, any>;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: string[];
  status?: ('active' | 'inactive')[];
  lastLogin?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface UserListResponse {
  success: boolean;
  data: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RoleListResponse {
  success: boolean;
  data: UserRole[];
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  level: number;
  permissions: Array<{
    resource: string;
    action: string;
  }>;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  level?: number;
  permissions?: Array<{
    resource: string;
    action: string;
  }>;
}

export interface PermissionResource {
  name: string;
  actions: string[];
}

export const PERMISSION_RESOURCES: PermissionResource[] = [
  { name: 'users', actions: ['read', 'write', 'delete'] },
  { name: 'roles', actions: ['read', 'write', 'delete'] },
  { name: 'devices', actions: ['read', 'write', 'delete'] },
  { name: 'media', actions: ['read', 'write', 'delete'] },
  { name: 'schedules', actions: ['read', 'write', 'delete'] },
  { name: 'analytics', actions: ['read'] },
  { name: 'settings', actions: ['read', 'write'] },
];
