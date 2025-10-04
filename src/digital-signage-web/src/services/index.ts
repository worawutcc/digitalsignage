// Re-export all services for easy importing
export { MediaService } from './mediaService'
export { ScheduleService } from './scheduleService'
export { TagService } from './tagService'
export { DeviceService } from './deviceService'
export { DashboardService } from './dashboardService'
export { UserService } from './userService'

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

export type {
  User,
  UserRole,
  Permission,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  UserSearchParams,
} from './userService'