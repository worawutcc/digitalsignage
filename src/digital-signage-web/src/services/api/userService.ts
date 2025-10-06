/**
 * User API service for user management operations
 * Updated to match backend UsersController endpoints at /api/users
 */

import { apiClient } from '@/lib/api';

// ================== Types & Interfaces ==================

/**
 * User data transfer object matching backend UserDto
 */
export interface User {
  userId: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

/**
 * Update user profile request (self-update)
 */
export interface UpdateUserProfileRequest {
  firstName: string;
  lastName: string;
}

/**
 * Update user request (admin/manager)
 */
export interface UpdateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Reset password request (admin action)
 */
export interface ResetPasswordRequest {
  newPassword: string;
  confirmPassword: string;
}

/**
 * Lock user request
 */
export interface LockUserRequest {
  isLocked: boolean;
  lockoutUntil?: string;
  reason?: string;
}

/**
 * Device DTO for user devices
 */
export interface DeviceDto {
  deviceId: number;
  deviceKey: string;
  name: string;
  isActive: boolean;
}

// ================== Service Implementation ==================

/**
 * User Management Service
 * Handles all user-related API operations following backend UsersController endpoints
 */
class UserService {
  private readonly basePath = '/api/users';

  /**
   * Get current user profile
   * GET /api/users/profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>(`${this.basePath}/profile`);
    return response.data;
  }

  /**
   * Update current user profile
   * PUT /api/users/profile
   */
  async updateProfile(data: UpdateUserProfileRequest): Promise<User> {
    const response = await apiClient.put<User>(`${this.basePath}/profile`, data);
    return response.data;
  }

  /**
   * Change current user password
   * POST /api/users/change-password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post<void>(`${this.basePath}/change-password`, data);
  }

  /**
   * Get all users (Admin only)
   * GET /api/users
   */
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>(this.basePath);
    return response.data;
  }

  /**
   * Get user by ID (Admin/Manager only)
   * GET /api/users/{id}
   */
  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<User>(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Update user (Admin/Manager only)
   * PUT /api/users/{id}
   */
  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<User>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  /**
   * Delete user (Admin only)
   * DELETE /api/users/{id}
   */
  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  /**
   * Reset user password (Admin/Manager only)
   * POST /api/users/{id}/reset-password
   */
  async resetUserPassword(id: number, data: ResetPasswordRequest): Promise<void> {
    await apiClient.post<void>(`${this.basePath}/${id}/reset-password`, data);
  }

  /**
   * Lock/unlock user account (Admin only)
   * POST /api/users/{id}/lock
   */
  async lockUser(id: number, data: LockUserRequest): Promise<void> {
    await apiClient.post<void>(`${this.basePath}/${id}/lock`, data);
  }

  /**
   * Get devices associated with a user
   * GET /api/users/{userId}/devices
   */
  async getUserDevices(userId: string): Promise<DeviceDto[]> {
    const response = await apiClient.get<DeviceDto[]>(`${this.basePath}/${userId}/devices`);
    return response.data;
  }

  // ================== Helper Methods ==================

  /**
   * Check if user has specific role
   */
  hasRole(user: User | null, role: string): boolean {
    return user?.role === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin(user: User | null): boolean {
    return this.hasRole(user, 'Admin');
  }

  /**
   * Check if user is manager
   */
  isManager(user: User | null): boolean {
    return this.hasRole(user, 'Manager');
  }

  /**
   * Check if user can manage other users
   */
  canManageUsers(user: User | null): boolean {
    return this.isAdmin(user) || this.isManager(user);
  }

  /**
   * Check if user is active
   */
  isActive(user: User | null): boolean {
    return user?.isActive === true;
  }

  /**
   * Get display name for user
   */
  getDisplayName(user: User): string {
    return user.fullName || user.email;
  }

  /**
   * Format user role for display
   */
  formatRole(role: string): string {
    switch (role) {
      case 'Admin':
        return 'Administrator';
      case 'Manager':
        return 'Manager';
      case 'User':
        return 'Standard User';
      default:
        return role;
    }
  }

  /**
   * Get user status color
   */
  getStatusColor(user: User): 'green' | 'red' | 'gray' {
    if (!user.isActive) return 'red';
    return user.lastLoginAt ? 'green' : 'gray';
  }

  /**
   * Get user status text
   */
  getStatusText(user: User): string {
    if (!user.isActive) return 'Inactive';
    return user.lastLoginAt ? 'Active' : 'Never logged in';
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;