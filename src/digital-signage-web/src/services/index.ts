// Re-export all services for easy importing
export { MediaService } from './mediaService'
export { ScheduleService } from './scheduleService'
export { TagService } from './tagService'
export { DeviceService } from './deviceService'
export { DashboardService } from './dashboardService'
export { UserService } from './userService'

// New enhanced services
export { DeviceHealthService, deviceHealthService } from './deviceHealthService'
export { HardwareDetectionService, hardwareDetectionService } from './hardwareDetectionService'
export { DeviceHardwareProfileService, deviceHardwareProfileService } from './deviceHardwareProfileService' 
export { OptimizedContentService, optimizedContentService } from './optimizedContentService'

// Updated API services
export { userService } from './api/userService'
export { userPermissionService } from './api/userPermissionService'
export { authService } from './api/authService'

// Re-export all types
export type {
  MediaFile,
  MediaUploadRequest,
  MediaSearchParams,
} from './mediaService'

export type {
  Schedule,
  RecurrencePattern,
  ScheduleTemplate,
  MediaSlot,
  CreateScheduleRequest,
  ScheduleSearchParams,
} from './scheduleService'

export type {
  Tag,
  TagSearchParams,
  CreateTagRequest,
  TagStatistics,
} from './tagService'

export type {
  Device,
  DeviceSearchParams,
  DeviceRegistrationRequest,
  DeviceUpdateRequest,
  DeviceStatistics,
} from './deviceService'

export type {
  DashboardMetrics,
  QuickAction,
  RecentItem,
  SearchResult,
} from './dashboardService'

// Export new API service types
export type {
  User,
  UpdateUserProfileRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  LockUserRequest,
} from './api/userService'

export type {
  UserPermissionLevel,
  DeviceGroupAccessDto,
  UserPermissionDto,
} from './api/userPermissionService'

export type {
  UserDto,
  DeviceDto,
  LoginRequest,
  LoginResponse,
  DeviceLoginRequest,
  DeviceLoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
} from './api/authService'