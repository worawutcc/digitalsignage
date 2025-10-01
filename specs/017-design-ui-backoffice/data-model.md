# Data Model: Enhanced Backoffice Admin UI

## Frontend State Management

### Redux Store Structure
```typescript
// Global State Shape
interface RootState {
  auth: AuthState;
  ui: UIState;
  devices: DevicesState;
  media: MediaState;
  schedules: SchedulesState;
  users: UsersState;
  analytics: AnalyticsState;
}

// Authentication State
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// UI State
interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  notifications: Notification[];
  modals: ModalState[];
  loading: LoadingState;
  errors: ErrorState[];
}

// Device Management State
interface DevicesState {
  devices: Device[];
  selectedDevices: string[];
  filters: DeviceFilters;
  pagination: PaginationState;
  bulkOperations: BulkOperationState;
  deviceGroups: DeviceGroup[];
}

// Media Management State
interface MediaState {
  mediaItems: MediaItem[];
  uploadQueue: UploadItem[];
  selectedMedia: string[];
  folders: MediaFolder[];
  filters: MediaFilters;
  previewItem: MediaItem | null;
}

// Schedule Management State
interface SchedulesState {
  schedules: Schedule[];
  calendarView: CalendarViewState;
  scheduleBuilder: ScheduleBuilderState;
  conflicts: ScheduleConflict[];
  templates: ScheduleTemplate[];
}
```

### React Query Cache Structure
```typescript
// Query Keys Pattern
const queryKeys = {
  devices: {
    all: ['devices'] as const,
    lists: () => [...queryKeys.devices.all, 'list'] as const,
    list: (filters: DeviceFilters) => [...queryKeys.devices.lists(), filters] as const,
    details: () => [...queryKeys.devices.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.devices.details(), id] as const,
    status: (id: string) => [...queryKeys.devices.detail(id), 'status'] as const,
  },
  media: {
    all: ['media'] as const,
    lists: () => [...queryKeys.media.all, 'list'] as const,
    list: (filters: MediaFilters) => [...queryKeys.media.lists(), filters] as const,
    details: () => [...queryKeys.media.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.media.details(), id] as const,
    presignedUrl: (id: string) => [...queryKeys.media.detail(id), 'presigned'] as const,
  },
  schedules: {
    all: ['schedules'] as const,
    lists: () => [...queryKeys.schedules.all, 'list'] as const,
    list: (filters: ScheduleFilters) => [...queryKeys.schedules.lists(), filters] as const,
    calendar: (date: string) => [...queryKeys.schedules.all, 'calendar', date] as const,
    conflicts: () => [...queryKeys.schedules.all, 'conflicts'] as const,
  },
} as const;
```

## TypeScript Interface Definitions

### Core Entity Types
```typescript
// User & Authentication
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  isActive: boolean;
}

interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  level: number; // 1: Super Admin, 2: Admin, 3: Manager, 4: Operator
}

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

// Device Management
interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  location: DeviceLocation;
  configuration: DeviceConfiguration;
  lastHeartbeat: string | null;
  assignedContent: AssignedContent[];
  groups: DeviceGroup[];
  metadata: DeviceMetadata;
  createdAt: string;
  updatedAt: string;
}

interface DeviceStatus {
  online: boolean;
  lastSeen: string;
  uptime: number;
  performance: DevicePerformance;
  alerts: DeviceAlert[];
}

interface DeviceConfiguration {
  resolution: Resolution;
  orientation: 'landscape' | 'portrait';
  volume: number;
  brightness: number;
  timezone: string;
  autoUpdate: boolean;
  debugMode: boolean;
}

// Media Management
interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  duration?: number; // for videos
  dimensions?: Dimensions;
  s3Key: string;
  s3Bucket: string;
  presignedUrl?: string;
  thumbnail?: string;
  metadata: MediaMetadata;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface MediaFolder {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  mediaCount: number;
  children: MediaFolder[];
}

// Schedule Management
interface Schedule {
  id: string;
  name: string;
  description: string;
  priority: number;
  startDate: string;
  endDate: string;
  timeSlots: TimeSlot[];
  recurrence: RecurrenceRule | null;
  targetDevices: TargetDevice[];
  content: ScheduleContent[];
  status: ScheduleStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface TimeSlot {
  id: string;
  startTime: string; // HH:mm format
  endTime: string;
  daysOfWeek: number[]; // 0-6, Sunday = 0
  timezone: string;
}

interface ScheduleContent {
  id: string;
  mediaId: string;
  order: number;
  duration: number; // seconds
  transition: TransitionType;
  conditions: DisplayCondition[];
}
```

### UI Component Props
```typescript
// Table Components
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  error?: string | null;
  pagination?: PaginationConfig;
  selection?: SelectionConfig<T>;
  filters?: FilterConfig[];
  sorting?: SortingConfig;
  actions?: TableAction<T>[];
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selected: T[]) => void;
}

// Form Components
interface FormBuilderProps {
  schema: FormSchema;
  values: Record<string, any>;
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
  onSubmit: (values: Record<string, any>) => void;
  loading?: boolean;
  disabled?: boolean;
}

// Modal Components
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

// Chart Components
interface ChartProps {
  data: ChartData[];
  type: ChartType;
  config: ChartConfig;
  loading?: boolean;
  error?: string | null;
  height?: number;
  width?: number;
}
```

### API Response Types
```typescript
// Standard API Response Envelope
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: ResponseMetadata;
}

// Paginated Response
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Error Response
interface ErrorResponse {
  success: false;
  message: string;
  errors: Record<string, string[]>;
  code: string;
  timestamp: string;
}

// Real-time Event Types
interface WebSocketEvent {
  type: WebSocketEventType;
  payload: any;
  timestamp: string;
  userId?: string;
}

type WebSocketEventType = 
  | 'device_status_changed'
  | 'schedule_updated'
  | 'media_uploaded'
  | 'user_action'
  | 'system_alert'
  | 'heartbeat';
```

### Filter and Search Types
```typescript
// Generic Filter Interface
interface FilterConfig {
  key: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  multiple?: boolean;
  searchable?: boolean;
}

type FilterType = 
  | 'text'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'daterange'
  | 'number'
  | 'boolean';

// Device Filters
interface DeviceFilters {
  search?: string;
  status?: DeviceStatus[];
  type?: DeviceType[];
  location?: string[];
  group?: string[];
  lastSeen?: DateRange;
  tags?: string[];
}

// Media Filters
interface MediaFilters {
  search?: string;
  type?: string[];
  size?: NumberRange;
  createdAt?: DateRange;
  tags?: string[];
  folder?: string;
}

// Schedule Filters
interface ScheduleFilters {
  search?: string;
  status?: ScheduleStatus[];
  dateRange?: DateRange;
  priority?: NumberRange;
  createdBy?: string[];
  devices?: string[];
}
```

## Component Hierarchy

### Layout Structure
```
AdminLayout
├── Header
│   ├── UserMenu
│   ├── NotificationCenter
│   └── ThemeToggle
├── Sidebar
│   ├── NavigationMenu
│   ├── QuickActions
│   └── SystemStatus
└── MainContent
    ├── Breadcrumbs
    ├── PageHeader
    └── PageContent
```

### Feature Component Trees
```
DeviceManagement
├── DeviceList
│   ├── DeviceTable
│   ├── DeviceFilters
│   └── BulkActions
├── DeviceDetail
│   ├── DeviceInfo
│   ├── DeviceStatus
│   ├── DeviceConfiguration
│   └── DeviceHistory
└── DeviceModals
    ├── CreateDeviceModal
    ├── EditDeviceModal
    └── BulkEditModal

MediaManagement
├── MediaLibrary
│   ├── MediaGrid
│   ├── MediaFilters
│   └── UploadDropzone
├── MediaDetail
│   ├── MediaPreview
│   ├── MediaInfo
│   └── MediaActions
└── MediaModals
    ├── UploadModal
    ├── EditMediaModal
    └── OrganizeModal
```

## Real-time Data Flow

### WebSocket Integration
```typescript
// WebSocket Connection Management
interface WebSocketConnection {
  url: string;
  protocols: string[];
  reconnect: ReconnectConfig;
  authentication: AuthConfig;
  messageHandlers: MessageHandler[];
}

// Event Handling
interface MessageHandler {
  eventType: WebSocketEventType;
  handler: (payload: any) => void;
  priority: number;
}

// Real-time State Updates
interface RealTimeUpdate {
  entity: EntityType;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  userId?: string;
}
```

This data model provides comprehensive type safety for the enhanced admin UI, covering all major features including device management, media handling, scheduling, user management, and real-time updates. The structure supports both Redux for UI state and React Query for server state management.