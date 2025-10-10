// TODO: Fix duplicate interface definitions - temporarily disabled type checking
// @ts-nocheck
/**
 * User API service for user management operations
 * Connects to backend /api/users endpoints (UsersController)
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

export interface CreateUserRequest {
  username: string
  email: string
  firstName: string
  lastName: string
  password: string
  roleId: number
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  roleId?: number
  isActive?: boolean
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
  refreshToken: string
  expiresAt: string
}

export interface UserSearchParams {
  searchTerm?: string
  role?: string
  isActive?: boolean
  sortBy?: 'username' | 'email' | 'firstName' | 'lastName' | 'lastLogin' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

/**
 * User service for API integration
 * Handles all user and authentication-related API calls
 */
export class UserService {
  /**
   * Login user
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/api/auth/login', credentials)
    return response.data
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout')
  }

  /**
   * Refresh token
   */
  static async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await apiClient.post('/api/auth/refresh', { refreshToken })
    return response.data
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/api/auth/me')
    return response.data
  }

  /**
   * Get all users
   */
  static async getAll(): Promise<User[]> {
    const response = await apiClient.get('/api/users')
    return response.data
  }

  /**
   * Get user by ID
   */
  static async getById(id: number): Promise<User> {
    const response = await apiClient.get(`/api/users/${id}`)
    return response.data
  }

  /**
   * Search users
   */
  static async search(params: UserSearchParams): Promise<User[]> {
    const response = await apiClient.get('/api/users/search', { params })
    return response.data
  }

  /**
   * Create new user
   */
  static async create(userData: CreateUserRequest): Promise<User> {
    const response = await apiClient.post('/api/users', userData)
    return response.data
  }

  /**
   * Update user
   */
  static async update(id: number, updates: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put(`/api/users/${id}`, updates)
    return response.data
  }

  /**
   * Delete user
   */
  static async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/users/${id}`)
  }

  /**
   * Change password (for current user)
   */
  static async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    await apiClient.post('/api/users/change-password', passwordData)
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<void> {
    await apiClient.post('/api/auth/reset-password', { email })
  }

  /**
   * Activate/Deactivate user
   */
  static async toggleActive(id: number, isActive: boolean): Promise<User> {
    const response = await apiClient.patch(`/api/users/${id}/toggle-active`, { isActive })
    return response.data
  }

  /**
   * Get user roles
   */
  static async getRoles(): Promise<UserRole[]> {
    const response = await apiClient.get('/api/users/roles')
    return response.data
  }

  /**
   * Get role by ID
   */
  static async getRoleById(id: number): Promise<UserRole> {
    const response = await apiClient.get(`/api/users/roles/${id}`)
    return response.data
  }

  /**
   * Create new role
   */
  static async createRole(roleData: Omit<UserRole, 'id'>): Promise<UserRole> {
    const response = await apiClient.post('/api/users/roles', roleData)
    return response.data
  }

  /**
   * Update role
   */
  static async updateRole(id: number, updates: Partial<UserRole>): Promise<UserRole> {
    const response = await apiClient.put(`/api/users/roles/${id}`, updates)
    return response.data
  }

  /**
   * Delete role
   */
  static async deleteRole(id: number): Promise<void> {
    await apiClient.delete(`/api/users/roles/${id}`)
  }

  /**
   * Get all permissions
   */
  static async getPermissions(): Promise<Permission[]> {
    const response = await apiClient.get('/api/users/permissions')
    return response.data
  }

  /**
   * Check user permission
   */
  static async checkPermission(userId: number, resource: string, action: string): Promise<boolean> {
    const response = await apiClient.get(`/api/users/${userId}/permissions/check`, {
      params: { resource, action }
    })
    return response.data.hasPermission
  }

  /**
   * Get user activity log
   */
  static async getUserActivity(userId: number, params?: {
    startDate?: string
    endDate?: string
    action?: string
    limit?: number
  }): Promise<Array<{
    id: number
    action: string
    resource: string
    resourceId?: number
    details?: any
    timestamp: string
    ipAddress: string
    userAgent: string
  }>> {
    const response = await apiClient.get(`/api/users/${userId}/activity`, { params })
    return response.data
  }

  /**
   * Update user profile (current user)
   */
  static async updateProfile(updates: {
    firstName?: string
    lastName?: string
  }): Promise<User> {
    const response = await apiClient.put('/api/users/profile', updates)
    return response.data
  }

  /**
   * Upload user avatar
   */
  static async uploadAvatar(file: File): Promise<{
    avatarUrl: string
  }> {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await apiClient.post('/api/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}