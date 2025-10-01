# Component Contracts: Enhanced Backoffice Admin UI

## Layout Components

### AdminLayout
Root layout component providing consistent structure and navigation

**Props Interface:**
```typescript
interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: HeaderAction[];
  sidebar?: {
    collapsed?: boolean;
    onToggle?: () => void;
  };
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
}

interface HeaderAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}
```

**Usage Contract:**
```tsx
<AdminLayout
  title="Device Management"
  description="Manage and monitor all digital signage devices"
  breadcrumbs={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Devices", href: "/devices" }
  ]}
  actions={[
    {
      label: "Add Device",
      icon: PlusIcon,
      onClick: () => setShowCreateModal(true),
      variant: "primary"
    }
  ]}
>
  <DeviceManagementContent />
</AdminLayout>
```

### Sidebar
Navigation sidebar with collapsible sections and real-time status

**Props Interface:**
```typescript
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  user: User;
  notifications: Notification[];
  systemStatus: SystemStatus;
}

interface SystemStatus {
  devicesOnline: number;
  totalDevices: number;
  activeSchedules: number;
  alerts: SystemAlert[];
}
```

**Component Contract:**
- Must render all navigation items based on user permissions
- Should show notification badges for unread items
- Must display system status indicators
- Should handle keyboard navigation (Tab, Enter, Escape)
- Must be accessible with proper ARIA labels

### PageHeader
Reusable page header with title, description, and actions

**Props Interface:**
```typescript
interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: HeaderAction[];
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}
```

## Data Display Components

### DataTable
Comprehensive data table with sorting, filtering, pagination, and selection

**Props Interface:**
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  error?: string | null;
  
  // Pagination
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
  
  // Selection
  selection?: {
    enabled: boolean;
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    selectAllEnabled?: boolean;
  };
  
  // Filtering & Searching
  filters?: FilterConfig[];
  searchConfig?: {
    enabled: boolean;
    placeholder?: string;
    onSearch: (query: string) => void;
  };
  
  // Sorting
  sorting?: {
    enabled: boolean;
    defaultSort?: SortConfig;
    onSortChange: (sort: SortConfig) => void;
  };
  
  // Actions
  rowActions?: RowAction<T>[];
  bulkActions?: BulkAction<T>[];
  
  // Styling
  size?: 'sm' | 'md' | 'lg';
  striped?: boolean;
  bordered?: boolean;
  
  // Events
  onRowClick?: (row: T, event: MouseEvent) => void;
  onRowDoubleClick?: (row: T, event: MouseEvent) => void;
}

interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => any;
  cell?: (info: CellContext<T>) => React.ReactNode;
  size?: number;
  minSize?: number;
  maxSize?: number;
  sortable?: boolean;
  filterable?: boolean;
  sticky?: 'left' | 'right';
  className?: string;
}
```

**Usage Contract:**
```tsx
<DataTable
  data={devices}
  columns={deviceColumns}
  loading={isLoading}
  pagination={{
    page: currentPage,
    limit: pageSize,
    total: totalDevices,
    onPageChange: setCurrentPage,
    onLimitChange: setPageSize
  }}
  selection={{
    enabled: true,
    selectedIds: selectedDeviceIds,
    onSelectionChange: setSelectedDeviceIds,
    selectAllEnabled: true
  }}
  searchConfig={{
    enabled: true,
    placeholder: "Search devices...",
    onSearch: handleSearch
  }}
  bulkActions={[
    {
      label: "Update Configuration",
      icon: SettingsIcon,
      onClick: handleBulkUpdate,
      variant: "secondary"
    },
    {
      label: "Delete",
      icon: TrashIcon,
      onClick: handleBulkDelete,
      variant: "destructive",
      confirmMessage: "Are you sure you want to delete selected devices?"
    }
  ]}
  onRowClick={(device) => router.push(`/devices/${device.id}`)}
/>
```

### StatusIndicator
Visual status indicator with different states and animations

**Props Interface:**
```typescript
interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning' | 'error' | 'loading';
  label?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  tooltip?: string;
  className?: string;
}
```

**Component Contract:**
- Must render appropriate color for each status
- Should show pulse animation for 'loading' state
- Must be accessible with proper ARIA labels
- Should support tooltip for additional context

### MetricCard
Dashboard metric display card with trend indicators

**Props Interface:**
```typescript
interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period: string;
  };
  status?: 'normal' | 'warning' | 'error';
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}
```

## Form Components

### FormBuilder
Dynamic form builder with validation and conditional fields

**Props Interface:**
```typescript
interface FormBuilderProps {
  schema: FormSchema;
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  
  // Events
  onChange: (field: string, value: any) => void;
  onBlur: (field: string) => void;
  onSubmit: (values: Record<string, any>) => void;
  
  // State
  loading?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  
  // Layout
  layout?: 'vertical' | 'horizontal' | 'inline';
  columns?: 1 | 2 | 3 | 4;
  spacing?: 'sm' | 'md' | 'lg';
  
  // Actions
  submitLabel?: string;
  showReset?: boolean;
  resetLabel?: string;
  actions?: FormAction[];
}

interface FormSchema {
  fields: FormField[];
  validation?: ValidationSchema;
}

interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  
  // Conditional Logic
  condition?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'in' | 'not_in';
    value: any;
  };
  
  // Field-specific props
  options?: SelectOption[];
  multiple?: boolean;
  min?: number;
  max?: number;
  step?: number;
  accept?: string; // for file inputs
  
  // Styling
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

type FormFieldType = 
  | 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio'
  | 'date' | 'datetime' | 'time' | 'file' | 'switch' | 'slider'
  | 'color' | 'json' | 'markdown';
```

### FileUpload
Drag-and-drop file upload with progress tracking

**Props Interface:**
```typescript
interface FileUploadProps {
  // Upload Configuration
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  
  // Upload Behavior
  autoUpload?: boolean;
  onUpload: (files: File[]) => Promise<UploadResult[]>;
  
  // Events
  onFileSelect?: (files: File[]) => void;
  onUploadProgress?: (progress: UploadProgress) => void;
  onUploadComplete?: (results: UploadResult[]) => void;
  onUploadError?: (error: UploadError) => void;
  
  // UI Configuration
  showPreview?: boolean;
  showProgress?: boolean;
  dragDropText?: string;
  browseText?: string;
  
  // State
  disabled?: boolean;
  loading?: boolean;
  
  // Styling
  className?: string;
  dropzoneClassName?: string;
}

interface UploadProgress {
  fileId: string;
  filename: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

interface UploadResult {
  fileId: string;
  success: boolean;
  mediaId?: string;
  url?: string;
  error?: string;
}
```

## Modal & Dialog Components

### Modal
Base modal component with consistent behavior

**Props Interface:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  
  // Content
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  
  // Behavior
  closable?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  
  // Styling
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centered?: boolean;
  
  // Animation
  animation?: 'fade' | 'slide' | 'zoom';
  
  // Events
  onOpen?: () => void;
  onClosed?: () => void;
  
  className?: string;
}
```

### ConfirmDialog
Confirmation dialog for destructive actions

**Props Interface:**
```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  
  // Content
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  
  // Styling
  variant?: 'default' | 'destructive' | 'warning';
  icon?: LucideIcon;
  
  // State
  loading?: boolean;
  disabled?: boolean;
}
```

## Chart & Visualization Components

### Chart
Versatile chart component supporting multiple chart types

**Props Interface:**
```typescript
interface ChartProps {
  data: ChartData[];
  type: ChartType;
  config: ChartConfig;
  
  // Dimensions
  width?: number;
  height?: number;
  responsive?: boolean;
  
  // Interaction
  interactive?: boolean;
  onDataPointClick?: (data: ChartDataPoint) => void;
  onDataPointHover?: (data: ChartDataPoint | null) => void;
  
  // State
  loading?: boolean;
  error?: string | null;
  
  // Styling
  theme?: 'light' | 'dark';
  colors?: string[];
  className?: string;
}

type ChartType = 
  | 'line' | 'area' | 'bar' | 'column' | 'pie' | 'donut' 
  | 'scatter' | 'heatmap' | 'gauge' | 'progress';

interface ChartConfig {
  title?: string;
  subtitle?: string;
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  legend?: LegendConfig;
  tooltip?: TooltipConfig;
  grid?: GridConfig;
  animation?: AnimationConfig;
}
```

## Notification Components

### NotificationCenter
Centralized notification management

**Props Interface:**
```typescript
interface NotificationCenterProps {
  notifications: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onNotificationDismiss?: (notificationId: string) => void;
  onMarkAllRead?: () => void;
  onClearAll?: () => void;
  
  // Display
  maxVisible?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  
  // Behavior
  autoClose?: boolean;
  autoCloseDelay?: number;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  persistent?: boolean;
  actions?: NotificationAction[];
}

interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}
```

### Toast
Temporary notification overlay

**Props Interface:**
```typescript
interface ToastProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
  onClose?: () => void;
  
  // Actions
  actions?: ToastAction[];
  
  // Styling
  position?: ToastPosition;
  animation?: 'slide' | 'fade' | 'bounce';
}

type ToastPosition = 
  | 'top-center' | 'top-right' | 'top-left'
  | 'bottom-center' | 'bottom-right' | 'bottom-left';
```

## Component Behavior Contracts

### Accessibility Requirements
All components must:
- Support keyboard navigation
- Include proper ARIA labels and roles
- Maintain focus management
- Support screen readers
- Meet WCAG 2.1 AA contrast requirements

### Responsive Design Requirements
All components must:
- Work on mobile devices (320px+)
- Adapt to different screen sizes
- Use relative units for sizing
- Support touch interactions
- Maintain usability across breakpoints

### Performance Requirements
All components must:
- Lazy load when appropriate
- Virtualize large data sets
- Debounce user inputs
- Cache expensive calculations
- Minimize re-renders

### Error Handling Requirements
All components must:
- Display error states gracefully
- Provide meaningful error messages
- Recover from errors when possible
- Log errors for debugging
- Maintain UI stability during errors

These component contracts ensure consistent behavior, accessibility, and user experience across the entire admin interface.