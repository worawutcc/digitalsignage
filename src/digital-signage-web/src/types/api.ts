// API Response Types
export interface User {
  id: number
  username: string
  email: string
  role: 'Admin' | 'Manager' | 'User'
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface Device {
  id: number
  name: string
  deviceKey: string
  location: string
  status: 'Online' | 'Offline' | 'Error'
  ipAddress: string
  resolution: string
  isActive: boolean
  lastHeartbeat?: string
  managedByUserId?: number
  deviceGroupId?: number
  createdAt: string
  updatedAt?: string
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

// Error Types
export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
  statusCode: number
}