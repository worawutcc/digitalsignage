/**
 * Admin Menu System TypeScript Interfaces
 * 
 * This file contains the core TypeScript interfaces for the admin menu system,
 * providing type safety for menu items, notifications, and state management.
 */

export interface AdminMenuItem {
  id: string
  title: string
  icon: string
  path: string
  permission?: string
  children?: AdminMenuItem[]
  badge?: MenuBadge
  order: number
  isEnabled: boolean
  metadata?: MenuItemMetadata
}

export interface MenuBadge {
  count: number
  type: 'info' | 'warning' | 'error' | 'success'
  tooltip?: string
  lastUpdated: Date
  isVisible: boolean
}

export interface MenuItemMetadata {
  description?: string
  shortcut?: string
  category?: string
  lastAccessed?: Date
  accessCount?: number
}

export interface MenuNotification {
  id: string
  menuItemId: string
  type: 'count' | 'alert' | 'status'
  data: NotificationData
  priority: 'low' | 'medium' | 'high' | 'critical'
  expiresAt?: Date
  createdAt: Date
  acknowledgedAt?: Date
}

export interface NotificationData {
  count?: number
  message?: string
  status?: 'online' | 'offline' | 'error'
  metadata?: Record<string, any>
}

export interface MenuPermission {
  menuItemId: string
  permissionName: string
  isRequired: boolean
  fallbackBehavior: 'hide' | 'disable' | 'redirect'
}

export interface MenuState {
  userId: string
  activeSection: string
  expandedSections: string[]
  collapsedSidebar: boolean
  pinnedItems: string[]
  lastAccessedItems: MenuAccessHistory[]
  preferences: MenuPreferences
  updatedAt: Date
}

export interface MenuAccessHistory {
  menuItemId: string
  accessedAt: Date
  accessCount: number
}

export interface MenuPreferences {
  theme: 'light' | 'dark' | 'auto'
  compactMode: boolean
  showBadges: boolean
  groupByCategory: boolean
}

// API Request/Response Types
export interface MenuConfigurationResponse {
  configuration: MenuConfiguration
  userState: MenuState
  runtimeData: MenuRuntimeData
}

export interface MenuConfiguration {
  version: string
  lastUpdated: Date
  menuItems: AdminMenuItem[]
  permissions: MenuPermission[]
  defaultState: Partial<MenuState>
  featureFlags: Record<string, boolean>
}

export interface MenuRuntimeData {
  notifications: MenuNotification[]
  userPermissions: string[]
  systemStatus: SystemStatus
  pendingCounts: Record<string, number>
}

export interface SystemStatus {
  overall: 'healthy' | 'warning' | 'error'
  services: ServiceStatus[]
  lastCheck: Date
}

export interface ServiceStatus {
  name: string
  status: 'online' | 'offline' | 'degraded'
  responseTime?: number
  errorCount?: number
}

export interface UpdateMenuStateRequest {
  userId: string
  stateChanges: Partial<MenuState>
}

export interface MenuNotificationsResponse {
  notifications: MenuNotification[]
  totalCount: number
  unreadCount: number
}

export interface PermissionValidationRequest {
  userId: string
  menuItemIds: string[]
}

export interface PermissionValidationResponse {
  permissions: Record<string, boolean> // menuItemId -> hasAccess
  deniedItems: string[]
  redirects: Record<string, string> // menuItemId -> redirectPath
}

// Component Props Types
export interface MenuItemProps {
  item: AdminMenuItem
  level?: number
  isActive?: boolean
  onItemClick?: (item: AdminMenuItem) => void
}

export interface MenuSectionProps {
  title: string
  items: AdminMenuItem[]
  isExpanded?: boolean
  onToggle?: () => void
}

export interface AdminSidebarProps {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
}

export interface MenuBadgeProps {
  badge: MenuBadge
  size?: 'sm' | 'md' | 'lg'
  position?: 'top-right' | 'bottom-right' | 'inline'
}