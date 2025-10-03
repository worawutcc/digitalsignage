/**
 * User Service - API integration for user and role management with RBAC
 */

import { apiClient } from '@/lib/api';
import type {
  User,
  UserRole,
  CreateUserRequest,
  UpdateUserRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  UserFilters,
  UserListResponse,
  RoleListResponse,
} from '../types';

/**
 * User Management Service
 * Handles all user-related API operations with proper error handling
 */
class UserService {
  private readonly basePath = '/api/users';
  private readonly rolesPath = '/api/roles';

  /**
   * Get paginated list of users with filters
   */
  async getUsers(filters?: UserFilters): Promise<UserListResponse> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.order) params.append('order', filters.order);
    
    if (filters?.role?.length) {
      filters.role.forEach(r => params.append('role', r));
    }
    
    if (filters?.status?.length) {
      filters.status.forEach(s => params.append('status', s));
    }
    
    if (filters?.lastLogin) {
      params.append('lastLogin', filters.lastLogin);
    }

    const response = await apiClient.get<UserListResponse>(
      `${this.basePath}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get single user by ID
   */
  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: User }>(
      `${this.basePath}/${id}`
    );
    return response.data.data;
  }

  /**
   * Create new user
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<{ success: boolean; data: User }>(
      this.basePath,
      data
    );
    return response.data.data;
  }

  /**
   * Update existing user
   */
  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<{ success: boolean; data: User }>(
      `${this.basePath}/${id}`,
      data
    );
    return response.data.data;
  }

  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  /**
   * Activate user account
   */
  async activateUser(id: number): Promise<User> {
    const response = await apiClient.post<{ success: boolean; data: User }>(
      `${this.basePath}/${id}/activate`
    );
    return response.data.data;
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(id: number): Promise<User> {
    const response = await apiClient.post<{ success: boolean; data: User }>(
      `${this.basePath}/${id}/deactivate`
    );
    return response.data.data;
  }

  /**
   * Reset user password (admin action)
   */
  async resetUserPassword(id: number): Promise<{ temporaryPassword: string }> {
    const response = await apiClient.post<{
      success: boolean;
      data: { temporaryPassword: string };
    }>(`${this.basePath}/${id}/reset-password`);
    return response.data.data;
  }

  /**
   * Get all available roles
   */
  async getRoles(): Promise<UserRole[]> {
    const response = await apiClient.get<RoleListResponse>(this.rolesPath);
    return response.data.data;
  }

  /**
   * Get single role by ID
   */
  async getRoleById(id: string): Promise<UserRole> {
    const response = await apiClient.get<{ success: boolean; data: UserRole }>(
      `${this.rolesPath}/${id}`
    );
    return response.data.data;
  }

  /**
   * Create new role
   */
  async createRole(data: CreateRoleRequest): Promise<UserRole> {
    const response = await apiClient.post<{ success: boolean; data: UserRole }>(
      this.rolesPath,
      data
    );
    return response.data.data;
  }

  /**
   * Update existing role
   */
  async updateRole(id: string, data: UpdateRoleRequest): Promise<UserRole> {
    const response = await apiClient.put<{ success: boolean; data: UserRole }>(
      `${this.rolesPath}/${id}`,
      data
    );
    return response.data.data;
  }

  /**
   * Delete role (only if no users assigned)
   */
  async deleteRole(id: string): Promise<void> {
    await apiClient.delete(`${this.rolesPath}/${id}`);
  }

  /**
   * Check if current user has specific permission
   */
  hasPermission(
    user: User | null,
    resource: string,
    action: string
  ): boolean {
    if (!user || !user.role) return false;

    // Admin has all permissions
    if (user.role === 'Admin') return true;

    // User has limited permissions
    if (user.role === 'User') {
      const userPermissions = [
        { resource: 'devices', action: 'read' },
        { resource: 'content', action: 'read' },
        { resource: 'playlists', action: 'read' },
        { resource: 'schedules', action: 'read' }
      ];
      
      return userPermissions.some(
        (p) =>
          (p.resource === resource || p.resource === '*') &&
          (p.action === action || p.action === '*')
      );
    }

    return false;
  }

  /**
   * Check if user can manage other users
   */
  canManageUser(currentUser: User | null, targetUser: User): boolean {
    if (!currentUser) return false;
    
    // Can't manage yourself for certain operations
    if (currentUser.id === targetUser.id) return false;

    // Admin can manage everyone
    if (currentUser.role === 'Admin') return true;

    // Regular users cannot manage other users
    return false;
  }

  /**
   * Check if user can assign a specific role
   */
  canAssignRole(currentUser: User | null, role: 'Admin' | 'User'): boolean {
    if (!currentUser) return false;

    // Admin can assign any role
    if (currentUser.role === 'Admin') return true;

    // Regular users cannot assign roles
    return false;
  }

  /**
   * Get user's full name
   */
  getUserFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`.trim() || user.email;
  }

  /**
   * Get user status badge info
   */
  getUserStatusBadge(user: User): {
    label: string;
    variant: 'success' | 'error' | 'warning';
  } {
    if (!user.isActive) {
      return { label: 'Inactive', variant: 'error' };
    }

    if (!user.lastLoginAt) {
      return { label: 'Never Logged In', variant: 'warning' };
    }

    const lastLogin = new Date(user.lastLoginAt);
    const daysSinceLogin = Math.floor(
      (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLogin > 30) {
      return { label: 'Inactive', variant: 'warning' };
    }

    return { label: 'Active', variant: 'success' };
  }

  /**
   * Format last login timestamp
   */
  formatLastLogin(lastLoginAt: string | null): string {
    if (!lastLoginAt) return 'Never';

    const date = new Date(lastLoginAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    }

    return date.toLocaleDateString();
  }
}

// Export singleton instance
export const userService = new UserService();
