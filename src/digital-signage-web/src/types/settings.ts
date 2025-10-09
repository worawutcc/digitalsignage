// Settings/Profile Types - matching backend DTOs

export interface UserProfile {
  userId: number
  email: string
  fullName: string
  phoneNumber: string | null
  role: string
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
}

export interface UpdateProfileRequest {
  firstName: string
  lastName: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordResponse {
  success: boolean
  message: string
}
