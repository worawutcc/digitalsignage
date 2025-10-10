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
    try {
      const response = await apiClient.get<User>(`${this.basePath}/profile`);
      
      if (!response.data || !response.data.userId) {
        throw new Error('Invalid user profile response structure');
      }
      
      console.log('[UserService] User profile retrieved successfully:', response.data.email);
      return response.data;
    } catch (error) {
      console.error('[UserService] Failed to get user profile:', error);
      throw error;
    }
  }

  /**
   * Update current user profile
   * PUT /api/users/profile
   */
  async updateProfile(data: UpdateUserProfileRequest): Promise<User> {
    try {
      const response = await apiClient.put<User>(`${this.basePath}/profile`, data);
      
      if (!response.data || !response.data.userId) {
        throw new Error('Invalid update profile response structure');
      }
      
      console.log('[UserService] User profile updated successfully:', response.data.email);
      return response.data;
    } catch (error) {
      console.error('[UserService] Failed to update user profile:', error);
      throw error;
    }
  }

  /**
   * Change current user password
   * POST /api/users/change-password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    try {
      await apiClient.post<void>(`${this.basePath}/change-password`, data);
      console.log('[UserService] Password changed successfully');
    } catch (error) {
      console.error('[UserService] Failed to change password:', error);
      throw error;
    }
  }

  /**
   * Get all users (Admin only)
   * GET /api/users
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get<User[]>(this.basePath);
      
      const usersArray = Array.isArray(response.data) ? response.data : [];
      console.log('[UserService] Retrieved all users successfully:', usersArray.length);
      return usersArray;
    } catch (error) {
      console.error('[UserService] Failed to get all users:', error);
      return [];
    }
  }

  /**
   * Get user by ID (Admin/Manager only)
   * GET /api/users/{id}
   */
  async getUserById(id: number): Promise<User> {
    try {
      const response = await apiClient.get<User>(`${this.basePath}/${id}`);
      
      if (!response.data || !response.data.userId) {
        throw new Error('Invalid user response structure');
      }
      
      console.log('[UserService] User retrieved successfully:', response.data.email);
      return response.data;
    } catch (error) {
      console.error('[UserService] Failed to get user by ID:', id, error);
      throw error;
    }
  }

  /**
   * Update user (Admin/Manager only)
   * PUT /api/users/{id}
   */
  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    try {
      const response = await apiClient.put<User>(`${this.basePath}/${id}`, data);
      
      if (!response.data || !response.data.userId) {
        throw new Error('Invalid update user response structure');
      }
      
      console.log('[UserService] User updated successfully:', response.data.email);
      return response.data;
    } catch (error) {
      console.error('[UserService] Failed to update user:', id, error);
      throw error;
    }
  }

  /**
   * Delete user (Admin only)
   * DELETE /api/users/{id}
   */
  async deleteUser(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`);
      console.log('[UserService] User deleted successfully:', id);
    } catch (error) {
      console.error('[UserService] Failed to delete user:', id, error);
      throw error;
    }
  }

  /**
   * Reset user password (Admin/Manager only)
   * POST /api/users/{id}/reset-password
   */
  async resetUserPassword(id: number, data: ResetPasswordRequest): Promise<void> {
    try {
      await apiClient.post<void>(`${this.basePath}/${id}/reset-password`, data);
      console.log('[UserService] User password reset successfully:', id);
    } catch (error) {
      console.error('[UserService] Failed to reset user password:', id, error);
      throw error;
    }
  }

  /**
   * Lock/unlock user account (Admin only)
   * POST /api/users/{id}/lock
   */
  async lockUser(id: number, data: LockUserRequest): Promise<void> {
    try {
      await apiClient.post<void>(`${this.basePath}/${id}/lock`, data);
      console.log('[UserService] User lock status updated:', id, data.isLocked);
    } catch (error) {
      console.error('[UserService] Failed to update user lock status:', id, error);
      throw error;
    }
  }

  /**
   * Get devices associated with a user
   * GET /api/users/{userId}/devices
   */
  async getUserDevices(userId: number): Promise<DeviceDto[]> {
    try {
      const response = await apiClient.get<DeviceDto[]>(`${this.basePath}/${userId}/devices`);
      
      const devicesArray = Array.isArray(response.data) ? response.data : [];
      console.log('[UserService] User devices retrieved successfully:', userId, devicesArray.length);
      return devicesArray;
    } catch (error) {
      console.error('[UserService] Failed to get user devices:', userId, error);
      return [];
    }
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