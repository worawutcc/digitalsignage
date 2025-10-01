import { apiClient } from '@/lib/api'
import type { User, Tokens } from '@/store/slices/authSlice'
import type {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  PasswordResetRequest,
  PasswordResetConfirmation,
  PasswordChangeRequest,
  TwoFactorEnableResponse,
  TwoFactorVerificationRequest,
  EmailAvailabilityResponse,
  ProfileUpdateData,
} from './authService.types'

/**
 * Token refresh response
 */
export interface TokenRefreshResponse {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

/**
 * Enhanced authentication service with comprehensive auth flows
 * Provides methods for login, registration, password management, profile updates, and 2FA
 */
export class AuthService {
  /**
   * Login with email and password
   * @param credentials - User login credentials including email, password, and optional rememberMe flag
   * @returns Promise with user data and authentication tokens
   * @throws Error if login fails
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  /**
   * Register new user account
   */
  async register(data: RegisterData): Promise<LoginResponse> {
    try {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      const response = await apiClient.post<LoginResponse>('/api/auth/register', {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout')
    } catch (error: any) {
      // Log error but don't throw - we still want to clear local state
      console.error('Logout API error:', error)
    }
  }

  /**
   * Refresh authentication tokens
   * @param refreshToken - The refresh token to use for getting new access token
   * @returns Promise with new access and refresh tokens
   * @throws Error if token refresh fails
   */
  async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
    try {
      const response = await apiClient.post<TokenRefreshResponse>('/api/auth/refresh', {
        refreshToken,
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token refresh failed')
    }
  }

  /**
   * Get current user profile
   * @returns Promise with user profile data
   * @throws Error if profile fetch fails
   */
  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/api/auth/profile')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile')
    }
  }

  /**
   * Update user profile
   * @param data - Profile data to update (firstName, lastName, email, phoneNumber)
   * @returns Promise with updated user profile
   * @throws Error if update fails
   */
  async updateProfile(data: ProfileUpdateData): Promise<User> {
    try {
      const response = await apiClient.put<User>('/api/auth/profile', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile')
    }
  }

  /**
   * Change user password
   * @param data - Password change request with current password and new password
   * @returns Promise that resolves when password is changed
   * @throws Error if passwords don't match or change fails
   */
  async changePassword(data: PasswordChangeRequest): Promise<void> {
    try {
      // Validate passwords match
      if (data.newPassword !== data.confirmPassword) {
        throw new Error('New passwords do not match')
      }

      await apiClient.post('/api/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to change password')
    }
  }

  /**
   * Request password reset email
   * @param data - Password reset request with user email
   * @returns Promise that resolves when reset email is sent
   * @throws Error if request fails
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    try {
      await apiClient.post('/api/auth/forgot-password', data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to request password reset')
    }
  }

  /**
   * Confirm password reset with token
   * @param data - Password reset confirmation with token and new password
   * @returns Promise that resolves when password is reset
   * @throws Error if passwords don't match or reset fails
   */
  async confirmPasswordReset(data: PasswordResetConfirmation): Promise<void> {
    try {
      // Validate passwords match
      if (data.newPassword !== data.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      await apiClient.post('/api/auth/reset-password', {
        token: data.token,
        newPassword: data.newPassword,
      })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset password')
    }
  }

  /**
   * Verify authentication token
   * @param token - JWT token to verify
   * @returns Promise with boolean indicating if token is valid
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{ valid: boolean }>('/api/auth/verify', {
        token,
      })
      return response.data.valid
    } catch (error: any) {
      return false
    }
  }

  /**
   * Validate email availability
   * @param email - Email address to check
   * @returns Promise with boolean indicating if email is available
   */
  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{ available: boolean }>('/api/auth/check-email', {
        email,
      })
      return response.data.available
    } catch (error: any) {
      return false
    }
  }

  /**
   * Enable two-factor authentication
   * @returns Promise with QR code and secret for 2FA setup
   * @throws Error if 2FA enable fails
   */
  async enableTwoFactor(): Promise<{ qrCode: string; secret: string }> {
    try {
      const response = await apiClient.post<{ qrCode: string; secret: string }>(
        '/api/auth/2fa/enable'
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to enable 2FA')
    }
  }

  /**
   * Verify two-factor authentication code
   * @param code - 6-digit verification code from authenticator app
   * @returns Promise with boolean indicating if code is valid
   */
  async verifyTwoFactor(code: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{ valid: boolean }>('/api/auth/2fa/verify', {
        code,
      })
      return response.data.valid
    } catch (error: any) {
      return false
    }
  }

  /**
   * Disable two-factor authentication
   * @param password - Current password for security verification
   * @returns Promise that resolves when 2FA is disabled
   * @throws Error if 2FA disable fails
   */
  async disableTwoFactor(password: string): Promise<void> {
    try {
      await apiClient.post('/api/auth/2fa/disable', { password })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to disable 2FA')
    }
  }
}

/**
 * Singleton instance of AuthService
 * Use this instance throughout the application for all authentication operations
 */
export const authService = new AuthService()
