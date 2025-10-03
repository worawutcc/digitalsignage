// API Response Types matching OpenAPI schema

/**
 * Login response from API
 */
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
  user: User
}

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  role: 'Admin' | 'User'
  isActive: boolean
  createdAt: string
  lastLoginAt?: string
}

export interface Device {
  id: number
  name: string
  deviceKey: string
  location: string
  deviceType: string
  macAddress: string
  ipAddress: string
  status: 'Online' | 'Offline' | 'Error' | 'Maintenance'
  groupId?: number
  group?: DeviceGroup
  isActive: boolean
  createdAt: string
  lastHeartbeat?: string
  currentContent?: string
  softwareVersion: string
  hardwareInfo: string
  // Additional device properties
  model?: string
  resolution?: string
  manufacturer?: string
  serialNumber?: string
  androidVersion?: string
  apiLevel?: number
  deviceGroupId?: number
}

export interface DeviceGroup {
  id: number
  name: string
  description: string
  isActive: boolean
  parentGroupId?: number
  path: string
  level: number
  createdByUserId?: number
  createdAt: string
  updatedAt?: string
  devices?: Device[]
  childGroups?: DeviceGroup[]
}

export interface Media {
  id: number
  name: string
  fileName: string
  type: 'Image' | 'Video' | 'Html' | 'Text'
  fileSize: number
  s3Key: string
  mimeType: string
  durationSeconds: number
  createdAt: string
  updatedAt?: string
}

export interface Schedule {
  id: number
  name: string
  deviceId: number
  startTime: string
  endTime: string
  isActive: boolean
  priority: number
  createdAt: string
  updatedAt?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
  expiresIn: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

// Form Types
export interface CreateDeviceRequest {
  name: string
  location: string
  deviceGroupId?: number
  resolution: string
}

export interface UpdateDeviceRequest extends Partial<CreateDeviceRequest> {
  isActive?: boolean
}

export interface CreateDeviceGroupRequest {
  name: string
  description?: string
  parentGroupId?: number
}

export interface MediaUploadRequest {
  name?: string
  type?: 'Image' | 'Video' | 'Html' | 'Text'
  durationSeconds?: number
}

// Query Parameters
export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface DeviceFilters extends PaginationParams {
  search?: string
  status?: string
  deviceGroupId?: number
  isActive?: boolean
}

export interface MediaFilters extends PaginationParams {
  search?: string
  type?: string
}

// Android TV Device Management Types
export interface DeviceConfiguration {
  id: number
  deviceId: number
  displayOrientation: 'Portrait' | 'Landscape' | 'Auto'
  screenTimeout: number
  powerManagement: 'Standard' | 'Optimized' | 'Maximum'
  autoRotate: boolean
  networkConfig?: any
  appPermissions?: any
  proxySettings?: any
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface DeviceStatusLog {
  id: number
  deviceId: number
  status: string
  previousStatus?: string
  message?: string
  timestamp: string
  createdAt: string
}

export interface RegistrationRecord {
  id: number
  deviceId: number
  registrationPin: string
  action: 'Register' | 'Approve' | 'Reject' | 'Deactivate'
  performedByUserId?: number
  notes?: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

// Device Registration Request Types
export interface DeviceRegistrationRequest {
  deviceName: string
  macAddress: string
  androidVersion: string
  apiLevel: string
  serialNumber: string
  manufacturer: string
  model: string
  displayResolution: string
  location?: string
}

export interface DeviceRegistrationResponse {
  deviceId: number
  registrationPin: string
  status: 'Pending'
  message: string
}

export interface DeviceApprovalRequest {
  deviceId: number
  approve: boolean
  notes?: string
}

export interface UpdateDeviceConfigurationRequest {
  displayOrientation?: 'Portrait' | 'Landscape' | 'Auto'
  screenTimeout?: number
  powerManagement?: 'Standard' | 'Optimized' | 'Maximum'
  autoRotate?: boolean
  networkConfig?: any
  appPermissions?: any
  proxySettings?: any
}

// Error Types
export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
  statusCode: number
}