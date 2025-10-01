/**
 * Authentication service types and interfaces
 */

import type { User, Tokens } from '@/store/slices/authSlice'

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

/**
 * Login response from API
 */
export interface LoginResponse {
  user: User
  tokens: Tokens
}

/**
 * Registration data interface
 */
export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  confirmPassword: string
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirmation {
  token: string
  newPassword: string
  confirmPassword: string
}

/**
 * Password change request
 */
export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

/**
 * Two-factor authentication enable response
 */
export interface TwoFactorEnableResponse {
  qrCode: string
  secret: string
}

/**
 * Two-factor authentication verification request
 */
export interface TwoFactorVerificationRequest {
  code: string
}

/**
 * Email availability response
 */
export interface EmailAvailabilityResponse {
  available: boolean
}

/**
 * Profile update data
 */
export interface ProfileUpdateData {
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
}
