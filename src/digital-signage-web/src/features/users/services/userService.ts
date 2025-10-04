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
  EnhancedUser,
  UserScheduleAssignment,
  BulkScheduleAssignmentRequest,
  BulkOperationResponse,
  UserScheduleAssignmentResponse,
  CreateScheduleAssignmentRequest,
  UpdateScheduleAssignmentRequest,
  ConflictErrorResponse,
} from '../types';
import type { BulkOperation } from '@/types/bulk-operations';
import type { ScheduleConflict } from '@/types/schedule-conflicts';

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
    // Use fullName from API, fallback to legacy firstName/lastName if available, then email
    return user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
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

  // ============================================================================
  // ENHANCED USER METHODS WITH SCHEDULE ASSIGNMENT
  // ============================================================================

  /**
   * Get enhanced users list with schedule assignment and conflict data
   */
  async getEnhancedUsers(filters?: UserFilters): Promise<UserListResponse> {
    const params = new URLSearchParams();
    
    // Standard filters
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

    // Enhanced filters
    if (filters?.department?.length) {
      filters.department.forEach(d => params.append('department', d));
    }

    if (filters?.hasScheduleConflicts !== undefined) {
      params.append('hasScheduleConflicts', filters.hasScheduleConflicts.toString());
    }

    if (filters?.assignedScheduleIds?.length) {
      filters.assignedScheduleIds.forEach(id => params.append('assignedScheduleIds', id.toString()));
    }

    if (filters?.scheduleSyncStatus?.length) {
      filters.scheduleSyncStatus.forEach(status => params.append('scheduleSyncStatus', status));
    }

    // Date range filters
    if (filters?.lastScheduleUpdate?.from) {
      params.append('lastScheduleUpdateFrom', filters.lastScheduleUpdate.from);
    }
    if (filters?.lastScheduleUpdate?.to) {
      params.append('lastScheduleUpdateTo', filters.lastScheduleUpdate.to);
    }

    if (filters?.createdDate?.from) {
      params.append('createdDateFrom', filters.createdDate.from);
    }
    if (filters?.createdDate?.to) {
      params.append('createdDateTo', filters.createdDate.to);
    }

    const response = await apiClient.get<UserListResponse>(
      `${this.basePath}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Bulk assign schedules to multiple users
   */
  async bulkAssignSchedules(request: BulkScheduleAssignmentRequest): Promise<BulkOperationResponse> {
    const response = await apiClient.post<BulkOperationResponse>(
      `${this.basePath}/bulk-assign-schedules`,
      request
    );
    return response.data;
  }

  /**
   * Bulk remove schedule assignments from multiple users
   */
  async bulkRemoveScheduleAssignments(userIds: number[], scheduleIds: number[]): Promise<BulkOperationResponse> {
    const response = await apiClient.post<BulkOperationResponse>(
      `${this.basePath}/bulk-remove-schedules`,
      { userIds, scheduleIds }
    );
    return response.data;
  }

  /**
   * Get user's schedule assignments with conflicts
   */
  async getUserScheduleAssignments(
    userId: number,
    options?: {
      includeInactive?: boolean;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<UserScheduleAssignmentResponse> {
    const params = new URLSearchParams();
    
    if (options?.includeInactive !== undefined) {
      params.append('includeInactive', options.includeInactive.toString());
    }
    
    if (options?.startDate) {
      params.append('startDate', options.startDate);
    }
    
    if (options?.endDate) {
      params.append('endDate', options.endDate);
    }

    const response = await apiClient.get<UserScheduleAssignmentResponse>(
      `${this.basePath}/${userId}/schedule-assignments?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Assign schedule to user
   */
  async assignScheduleToUser(userId: number, request: CreateScheduleAssignmentRequest): Promise<UserScheduleAssignment> {
    try {
      const response = await apiClient.post<{ success: boolean; data: UserScheduleAssignment }>(
        `${this.basePath}/${userId}/schedule-assignments`,
        request
      );
      return response.data.data;
    } catch (error: any) {
      // Handle conflict errors specially
      if (error.response?.status === 409) {
        const conflictError = error.response.data as ConflictErrorResponse;
        throw new Error(`Schedule conflict detected: ${conflictError.error.message}`, { cause: conflictError });
      }
      throw error;
    }
  }

  /**
   * Update schedule assignment
   */
  async updateScheduleAssignment(
    userId: number, 
    assignmentId: number, 
    request: UpdateScheduleAssignmentRequest
  ): Promise<UserScheduleAssignment> {
    const response = await apiClient.put<{ success: boolean; data: UserScheduleAssignment }>(
      `${this.basePath}/${userId}/schedule-assignments/${assignmentId}`,
      request
    );
    return response.data.data;
  }

  /**
   * Remove schedule assignment
   */
  async removeScheduleAssignment(userId: number, assignmentId: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${userId}/schedule-assignments/${assignmentId}`);
  }

  /**
   * Get users with schedule conflicts
   */
  async getUsersWithConflicts(options?: {
    severity?: ('low' | 'medium' | 'high' | 'critical')[];
    scheduleIds?: number[];
    page?: number;
    limit?: number;
  }): Promise<UserListResponse> {
    const params = new URLSearchParams();
    params.append('hasScheduleConflicts', 'true');
    
    if (options?.severity?.length) {
      options.severity.forEach(s => params.append('conflictSeverity', s));
    }
    
    if (options?.scheduleIds?.length) {
      options.scheduleIds.forEach(id => params.append('conflictScheduleIds', id.toString()));
    }
    
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());

    const response = await apiClient.get<UserListResponse>(
      `${this.basePath}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get schedule conflicts for a specific user
   */
  async getUserScheduleConflicts(userId: number): Promise<ScheduleConflict[]> {
    const response = await apiClient.get<{ success: boolean; data: ScheduleConflict[] }>(
      `${this.basePath}/${userId}/schedule-conflicts`
    );
    return response.data.data;
  }

  /**
   * Resolve schedule conflict for user
   */
  async resolveUserScheduleConflict(
    userId: number, 
    conflictId: number, 
    resolution: {
      strategy: 'priority' | 'reschedule' | 'ignore';
      parameters?: Record<string, any>;
    }
  ): Promise<void> {
    await apiClient.post(
      `${this.basePath}/${userId}/schedule-conflicts/${conflictId}/resolve`,
      resolution
    );
  }

  // ============================================================================
  // UTILITY METHODS FOR ENHANCED FUNCTIONALITY
  // ============================================================================

  /**
   * Get user assignment statistics
   */
  async getUserAssignmentStats(userId: number): Promise<{
    totalAssigned: number;
    activeAssignments: number;
    conflictCount: number;
    lastAssignmentDate?: string;
  }> {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        totalAssigned: number;
        activeAssignments: number;
        conflictCount: number;
        lastAssignmentDate?: string;
      };
    }>(`${this.basePath}/${userId}/assignment-stats`);
    return response.data.data;
  }

  /**
   * Check if user can be assigned to schedule (conflict detection)
   */
  async canAssignUserToSchedule(userId: number, scheduleId: number): Promise<{
    canAssign: boolean;
    conflicts: ScheduleConflict[];
    warnings: string[];
  }> {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        canAssign: boolean;
        conflicts: ScheduleConflict[];
        warnings: string[];
      };
    }>(`${this.basePath}/${userId}/can-assign-schedule/${scheduleId}`);
    return response.data.data;
  }

  /**
   * Get suggested users for schedule assignment (based on availability, role, etc.)
   */
  async getSuggestedUsersForSchedule(scheduleId: number, options?: {
    limit?: number;
    excludeUserIds?: number[];
    requiredRole?: string;
  }): Promise<EnhancedUser[]> {
    const params = new URLSearchParams();
    params.append('scheduleId', scheduleId.toString());
    
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.requiredRole) params.append('requiredRole', options.requiredRole);
    if (options?.excludeUserIds?.length) {
      options.excludeUserIds.forEach(id => params.append('excludeUserIds', id.toString()));
    }

    const response = await apiClient.get<{ success: boolean; data: EnhancedUser[] }>(
      `${this.basePath}/suggested-for-schedule?${params.toString()}`
    );
    return response.data.data;
  }
}

// Export singleton instance
export const userService = new UserService();
