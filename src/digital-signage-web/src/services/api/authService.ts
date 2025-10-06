/**
 * Authentication API service
 * Connects to backend /api/auth endpoints (AuthController)
 * Handles login, registration, token refresh, device authentication
 */

import { apiClient } from '@/lib/api';

// ================== Types & Interfaces ==================

/**
 * User DTO for authentication responses
 */
export interface UserDto {
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
 * Device DTO for device authentication
 */
export interface DeviceDto {
  deviceId: number;
  deviceKey: string;
  name: string;
  isActive: boolean;
}

/**
 * Login request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: UserDto;
}

/**
 * Device login request
 */
export interface DeviceLoginRequest {
  deviceKey: string;
}

/**
 * Device login response
 */
export interface DeviceLoginResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
  device: DeviceDto;
}

/**
 * Registration request
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

/**
 * Registration response
 */
export interface RegisterResponse {
  userId: number;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * Logout request
 */
export interface LogoutRequest {
  refreshToken: string;
}

// ================== Service Implementation ==================

/**
 * Authentication Service
 * Handles all authentication-related API operations
 */
class AuthService {
  private readonly basePath = '/api/auth';

  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(`${this.basePath}/register`, data);
    return response.data;
  }

  /**
   * Authenticate user and return tokens
   * POST /api/auth/login
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(`${this.basePath}/login`, data);
    return response.data;
  }

  /**
   * Authenticate device and return token
   * POST /api/auth/device-login
   */
  async deviceLogin(data: DeviceLoginRequest): Promise<DeviceLoginResponse> {
    const response = await apiClient.post<DeviceLoginResponse>(`${this.basePath}/device-login`, data);
    return response.data;
  }

  /**
   * Refresh access token using refresh token
   * POST /api/auth/refresh
   */
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>(`${this.basePath}/refresh`, data);
    return response.data;
  }

  /**
   * Logout user and revoke refresh token
   * POST /api/auth/logout
   */
  async logout(data: LogoutRequest): Promise<void> {
    await apiClient.post<void>(`${this.basePath}/logout`, data);
  }

  // ================== Helper Methods ==================

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) return true;
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  /**
   * Get token expiration date
   */
  getTokenExpiration(token: string): Date | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) return null;
      const payload = JSON.parse(atob(parts[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  }

  /**
   * Get user ID from token
   */
  getUserIdFromToken(token: string): number | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) return null;
      const payload = JSON.parse(atob(parts[1]));
      return parseInt(payload.sub) || null;
    } catch {
      return null;
    }
  }

  /**
   * Get user role from token
   */
  getUserRoleFromToken(token: string): string | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload.role || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(token: string, role: string): boolean {
    const userRole = this.getUserRoleFromToken(token);
    return userRole === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin(token: string): boolean {
    return this.hasRole(token, 'Admin');
  }

  /**
   * Check if user is manager
   */
  isManager(token: string): boolean {
    return this.hasRole(token, 'Manager');
  }

  /**
   * Check if user can manage other users
   */
  canManageUsers(token: string): boolean {
    return this.isAdmin(token) || this.isManager(token);
  }

  /**
   * Format token expiration time
   */
  formatTokenExpiration(expiresIn: number): string {
    const minutes = Math.floor(expiresIn / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  }

  /**
   * Get display name for user
   */
  getDisplayName(user: UserDto): string {
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
}

// Export singleton instance
export const authService = new AuthService();
export default authService;