/**
 * Device Registration Types
 * 
 * TypeScript type definitions for device registration management.
 * Based on backend DTOs for device registration workflow.
 */

/**
 * Base information about a matched user
 */
export interface MatchedUser {
  userId: number
  email: string
  displayName: string
  role: string
  matchedAutomatically: boolean
}

/**
 * Pending device registration awaiting admin approval
 */
export interface PendingRegistration {
  registrationId: string
  macAddress: string
  deviceModel: string
  manufacturer: string
  androidVersion: string
  appVersion: string
  requestedAt: string
  expiresAt: string
  pin: string
  requestedUsername?: string
  requestedUserDisplayName?: string
  matchedUser?: MatchedUser
  networkName?: string
  ipAddress?: string
  serialNumber?: string
  apiLevel?: string
  displayResolution?: string
}

/**
 * Response containing list of pending registrations
 */
export interface GetPendingRegistrationsResponse {
  registrations: PendingRegistration[]
  totalCount: number
  lastUpdated: string
}

/**
 * Device approval request data
 */
export interface ApprovalRequest {
  registrationId: string
  customDeviceName?: string
  location?: string
  deviceGroupId?: number
  assignedUserId?: number
  adminNotes?: string
}

/**
 * Device approval response data
 */
export interface ApprovalResponse {
  isSuccess: boolean
  deviceId: number
  deviceKey: string
  status: 'Approved' | 'Rejected'
  message: string
  approvedAt: string
  assignedUser?: {
    userId: number
    email: string
    displayName: string
  }
}

/**
 * Device rejection request data
 */
export interface RejectionRequest {
  registrationId: string
  reason: string
  adminNotes?: string
}

/**
 * Device registration status
 */
export type RegistrationStatus = 
  | 'Pending'
  | 'Approved' 
  | 'Rejected'
  | 'Expired'

/**
 * Device group information for assignment
 */
export interface DeviceGroup {
  id: number
  name: string
  description?: string
  location?: string
  deviceCount: number
}

/**
 * User information for device assignment
 */
export interface AssignableUser {
  id: number
  email: string
  fullName: string
  role: string
  isActive: boolean
  assignedDevicesCount: number
}

/**
 * Bulk approval request
 */
export interface BulkApprovalRequest {
  registrationIds: string[]
  defaultLocation?: string
  defaultDeviceGroupId?: number
  adminNotes?: string
}

/**
 * Bulk approval response
 */
export interface BulkApprovalResponse {
  succeeded: number
  failed: number
  results: Array<{
    registrationId: string
    success: boolean
    deviceId?: number
    error?: string
  }>
}

/**
 * Registration statistics for admin dashboard
 */
export interface RegistrationStatistics {
  totalPending: number
  totalApprovedToday: number
  totalRejectedToday: number
  averageApprovalTime: number // in minutes
  expiringSoon: number // expiring within 24 hours
}

/**
 * Registration audit log entry
 */
export interface RegistrationAuditLog {
  id: number
  registrationId: string
  action: 'Created' | 'Approved' | 'Rejected' | 'Expired'
  performedBy?: string
  performedAt: string
  notes?: string
  deviceInfo: {
    macAddress: string
    deviceModel: string
    manufacturer: string
  }
}

/**
 * Form data for device approval modal
 */
export interface DeviceApprovalFormData {
  customDeviceName: string
  location: string
  deviceGroupId?: number
  assignedUserId?: number
  adminNotes: string
}

/**
 * Form data for device rejection modal
 */
export interface DeviceRejectionFormData {
  reason: string
  adminNotes?: string
}

/**
 * Registration filter options
 */
export interface RegistrationFilters {
  manufacturer?: string
  deviceModel?: string
  hasMatchedUser?: boolean
  expiringWithin?: number // hours
  requestedAfter?: string
  requestedBefore?: string
}

/**
 * Sort options for registration list
 */
export interface RegistrationSortOptions {
  field: 'requestedAt' | 'expiresAt' | 'deviceModel' | 'manufacturer'
  direction: 'asc' | 'desc'
}

/**
 * Paginated registration request
 */
export interface GetPendingRegistrationsRequest {
  page?: number
  pageSize?: number
  filters?: RegistrationFilters
  sort?: RegistrationSortOptions
}