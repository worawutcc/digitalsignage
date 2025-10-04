'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  Bell, 
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
  Settings,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  Volume2,
  VolumeX,
  Clock,
  Calendar,
  Search,
  Download,
  MoreHorizontal
} from 'lucide-react'
import { useUserRealTimeUpdates } from '../../../hooks/useRealTimeUpdates'
import { userService } from '../services/userService'

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

type NotificationSeverity = 'info' | 'warning' | 'error' | 'critical'
type NotificationCategory = 'schedule' | 'device' | 'system' | 'user_action' | 'conflict'
type NotificationStatus = 'unread' | 'read' | 'archived'
type DeliveryChannel = 'in_app' | 'email' | 'push' | 'sms'

interface UserNotification {
  id: string
  userId: number
  title: string
  message: string
  severity: NotificationSeverity
  category: NotificationCategory
  status: NotificationStatus
  createdAt: string
  readAt?: string
  expiresAt?: string
  metadata?: Record<string, any>
  actions?: NotificationAction[]
  // Real-time event data
  eventType?: string
  eventPayload?: Record<string, any>
}

interface NotificationAction {
  id: string
  label: string
  action: 'acknowledge' | 'resolve' | 'dismiss' | 'view_details' | 'custom'
  variant: 'primary' | 'secondary' | 'danger'
  url?: string
  callback?: () => void | Promise<void>
}

interface NotificationSettings {
  inApp: {
    enabled: boolean
    categories: Record<NotificationCategory, boolean>
    severityThreshold: NotificationSeverity
    showToasts: boolean
    soundEnabled: boolean
    autoMarkAsRead: boolean
    maxVisible: number
  }
  email: {
    enabled: boolean
    categories: Record<NotificationCategory, boolean>
    severityThreshold: NotificationSeverity
    digestEnabled: boolean
    digestFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  }
  push: {
    enabled: boolean
    categories: Record<NotificationCategory, boolean>
    severityThreshold: NotificationSeverity
    quietHours: {
      enabled: boolean
      start: string
      end: string
    }
  }
}

interface NotificationFilters {
  search: string
  severity: NotificationSeverity[]
  category: NotificationCategory[]
  status: NotificationStatus[]
  dateRange: {
    from?: string
    to?: string
  }
}

interface UserNotificationsProps {
  userId?: number
  mode?: 'center' | 'popover' | 'feed'
  maxDisplayed?: number
  showSettings?: boolean
  onNotificationClick?: (notification: UserNotification) => void
  onSettingsChange?: (settings: NotificationSettings) => void
  className?: string
}

// ============================================================================
// MOCK DATA - In production, this would come from the API
// ============================================================================

const MOCK_NOTIFICATIONS: UserNotification[] = [
  {
    id: '1',
    userId: 1,
    title: 'Schedule Conflict Detected',
    message: 'Conflict detected between Morning Schedule and Afternoon Schedule on Device Group 1',
    severity: 'error',
    category: 'conflict',
    status: 'unread',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    eventType: 'schedule_conflict_detected',
    metadata: {
      conflictId: 'conflict_123',
      scheduleIds: ['schedule_1', 'schedule_2'],
      deviceGroupId: 1
    },
    actions: [
      {
        id: 'resolve',
        label: 'Resolve Conflict',
        action: 'resolve',
        variant: 'primary'
      },
      {
        id: 'view',
        label: 'View Details',
        action: 'view_details',
        variant: 'secondary'
      }
    ]
  },
  {
    id: '2',
    userId: 1,
    title: 'Device Offline Alert',
    message: 'Device "Meeting Room Display" has been offline for 30 minutes',
    severity: 'warning',
    category: 'device',
    status: 'unread',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    eventType: 'device_status_changed',
    metadata: {
      deviceId: 'device_123',
      deviceName: 'Meeting Room Display',
      lastSeen: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    actions: [
      {
        id: 'acknowledge',
        label: 'Acknowledge',
        action: 'acknowledge',
        variant: 'secondary'
      }
    ]
  },
  {
    id: '3',
    userId: 1,
    title: 'User Permission Updated',
    message: 'Your permissions have been updated by Administrator',
    severity: 'info',
    category: 'user_action',
    status: 'read',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    readAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    eventType: 'user_action',
    metadata: {
      actionBy: 'admin@example.com',
      changes: ['schedule_create', 'device_manage']
    }
  },
  {
    id: '4',
    userId: 1,
    title: 'Schedule Assignment Complete',
    message: 'Successfully assigned 5 schedules to 12 devices',
    severity: 'info',
    category: 'schedule',
    status: 'read',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    eventType: 'bulk_operation_complete',
    metadata: {
      operationType: 'schedule_assignment',
      totalSchedules: 5,
      totalDevices: 12
    }
  }
]

const DEFAULT_SETTINGS: NotificationSettings = {
  inApp: {
    enabled: true,
    categories: {
      schedule: true,
      device: true,
      system: true,
      user_action: true,
      conflict: true
    },
    severityThreshold: 'info',
    showToasts: true,
    soundEnabled: true,
    autoMarkAsRead: false,
    maxVisible: 10
  },
  email: {
    enabled: true,
    categories: {
      schedule: false,
      device: true,
      system: true,
      user_action: false,
      conflict: true
    },
    severityThreshold: 'warning',
    digestEnabled: true,
    digestFrequency: 'daily'
  },
  push: {
    enabled: false,
    categories: {
      schedule: false,
      device: true,
      system: true,
      user_action: false,
      conflict: true
    },
    severityThreshold: 'error',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00'
    }
  }
}

// ============================================================================
// COMPONENT IMPLEMENTATION
// ============================================================================

/**
 * UserNotifications Component
 * 
 * Comprehensive notification management component with:
 * - Real-time notification display
 * - Multi-channel delivery settings
 * - Advanced filtering and search
 * - Action handling and callbacks
 * - Customizable display modes
 * 
 * @see copilot-instructions-ui.instructions.md - Follow established patterns
 */
export function UserNotifications({
  userId,
  mode = 'center',
  maxDisplayed = 50,
  showSettings = true,
  onNotificationClick,
  onSettingsChange,
  className = ''
}: UserNotificationsProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [notifications, setNotifications] = useState<UserNotification[]>(MOCK_NOTIFICATIONS)
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS)
  const [filters, setFilters] = useState<NotificationFilters>({
    search: '',
    severity: [],
    category: [],
    status: [],
    dateRange: {}
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  // ============================================================================
  // REAL-TIME UPDATES
  // ============================================================================

  // Hook into real-time updates for the current user
  const { connectionState } = useUserRealTimeUpdates(
    userId ? [userId.toString()] : undefined
  )

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredNotifications = useMemo(() => {
    let filtered = notifications

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchLower) ||
        notification.message.toLowerCase().includes(searchLower)
      )
    }

    // Severity filter
    if (filters.severity.length > 0) {
      filtered = filtered.filter(notification =>
        filters.severity.includes(notification.severity)
      )
    }

    // Category filter  
    if (filters.category.length > 0) {
      filtered = filtered.filter(notification =>
        filters.category.includes(notification.category)
      )
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(notification =>
        filters.status.includes(notification.status)
      )
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(notification => {
        const notificationDate = new Date(notification.createdAt)
        const fromDate = filters.dateRange.from ? new Date(filters.dateRange.from) : null
        const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : null
        
        return (!fromDate || notificationDate >= fromDate) &&
               (!toDate || notificationDate <= toDate)
      })
    }

    // Apply display limit
    return filtered.slice(0, maxDisplayed)
  }, [notifications, filters, maxDisplayed])

  const notificationStats = useMemo(() => {
    const stats = {
      total: notifications.length,
      unread: 0,
      critical: 0,
      byCategory: {} as Record<NotificationCategory, number>
    }

    notifications.forEach(notification => {
      if (notification.status === 'unread') stats.unread++
      if (notification.severity === 'critical') stats.critical++
      stats.byCategory[notification.category] = (stats.byCategory[notification.category] || 0) + 1
    })

    return stats
  }, [notifications])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleNotificationClick = async (notification: UserNotification) => {
    // Mark as read if unread
    if (notification.status === 'unread') {
      await markAsRead([notification.id])
    }

    onNotificationClick?.(notification)
  }

  const markAsRead = async (notificationIds: string[]) => {
    setIsLoading(true)
    try {
      // In production, this would call the API
      setNotifications(prev => prev.map(notification =>
        notificationIds.includes(notification.id)
          ? { ...notification, status: 'read' as const, readAt: new Date().toISOString() }
          : notification
      ))
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsUnread = async (notificationIds: string[]) => {
    setIsLoading(true)
    try {
      setNotifications(prev => prev.map(notification => {
        if (notificationIds.includes(notification.id)) {
          const { readAt, ...notificationWithoutReadAt } = notification
          return { ...notificationWithoutReadAt, status: 'unread' as const }
        }
        return notification
      }))
    } catch (error) {
      console.error('Failed to mark notifications as unread:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const archiveNotifications = async (notificationIds: string[]) => {
    setIsLoading(true)
    try {
      setNotifications(prev => prev.map(notification =>
        notificationIds.includes(notification.id)
          ? { ...notification, status: 'archived' as const }
          : notification
      ))
    } catch (error) {
      console.error('Failed to archive notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteNotifications = async (notificationIds: string[]) => {
    setIsLoading(true)
    try {
      setNotifications(prev => prev.filter(notification =>
        !notificationIds.includes(notification.id)
      ))
    } catch (error) {
      console.error('Failed to delete notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkAction = async (action: 'read' | 'unread' | 'archive' | 'delete') => {
    const selectedIds = Array.from(selectedNotifications)
    if (selectedIds.length === 0) return

    switch (action) {
      case 'read':
        await markAsRead(selectedIds)
        break
      case 'unread':
        await markAsUnread(selectedIds)
        break
      case 'archive':
        await archiveNotifications(selectedIds)
        break
      case 'delete':
        await deleteNotifications(selectedIds)
        break
    }

    setSelectedNotifications(new Set())
  }

  const handleActionClick = async (notification: UserNotification, action: NotificationAction) => {
    switch (action.action) {
      case 'acknowledge':
        await markAsRead([notification.id])
        break
      case 'resolve':
        // Handle conflict resolution
        if (action.url) {
          window.location.href = action.url
        }
        break
      case 'dismiss':
        await archiveNotifications([notification.id])
        break
      case 'view_details':
        if (action.url) {
          window.open(action.url, '_blank')
        }
        break
      case 'custom':
        if (action.callback) {
          await action.callback()
        }
        break
    }
  }

  const updateSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings)
    onSettingsChange?.(newSettings)
  }

  const refreshNotifications = async () => {
    setIsLoading(true)
    try {
      // In production, fetch from API
      // const response = await userService.getNotifications(userId, filters)
      // setNotifications(response.data)
    } catch (error) {
      console.error('Failed to refresh notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================================================
  // UI COMPONENTS
  // ============================================================================

  const SeverityIcon = ({ severity }: { severity: NotificationSeverity }) => {
    const icons = {
      info: Info,
      warning: AlertTriangle,
      error: AlertCircle,
      critical: AlertCircle
    }
    
    const colors = {
      info: 'text-blue-500',
      warning: 'text-yellow-500',
      error: 'text-red-500',
      critical: 'text-red-600'
    }
    
    const Icon = icons[severity]
    return <Icon className={`h-5 w-5 ${colors[severity]}`} />
  }

  const CategoryBadge = ({ category }: { category: NotificationCategory }) => {
    const styles = {
      schedule: 'bg-blue-100 text-blue-800',
      device: 'bg-green-100 text-green-800',
      system: 'bg-gray-100 text-gray-800',
      user_action: 'bg-purple-100 text-purple-800',
      conflict: 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[category]}`}>
        {category.replace('_', ' ')}
      </span>
    )
  }

  const TimeAgo = ({ timestamp }: { timestamp: string }) => {
    const getTimeAgo = (timestamp: string) => {
      const now = new Date()
      const time = new Date(timestamp)
      const diffMs = now.getTime() - time.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      return time.toLocaleDateString()
    }
    
    return (
      <span className="text-xs text-gray-500 flex items-center">
        <Clock className="h-3 w-3 mr-1" />
        {getTimeAgo(timestamp)}
      </span>
    )
  }

  const NotificationItem = ({ notification }: { notification: UserNotification }) => (
    <div
      className={`p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ${
        notification.status === 'unread' ? 'bg-blue-50' : ''
      }`}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="flex items-start space-x-3">
        {/* Selection checkbox */}
        <input
          type="checkbox"
          checked={selectedNotifications.has(notification.id)}
          onChange={(e) => {
            e.stopPropagation()
            const newSelected = new Set(selectedNotifications)
            if (e.target.checked) {
              newSelected.add(notification.id)
            } else {
              newSelected.delete(notification.id)
            }
            setSelectedNotifications(newSelected)
          }}
          className="mt-1 rounded"
        />
        
        {/* Severity icon */}
        <div className="flex-shrink-0">
          <SeverityIcon severity={notification.severity} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-medium text-gray-900 ${
              notification.status === 'unread' ? 'font-semibold' : ''
            }`}>
              {notification.title}
            </h3>
            <div className="flex items-center space-x-2">
              <CategoryBadge category={notification.category} />
              {notification.status === 'unread' && (
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-1 truncate">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <TimeAgo timestamp={notification.createdAt} />
            
            {/* Action buttons */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="flex space-x-2">
                {notification.actions.slice(0, 2).map(action => (
                  <button
                    key={action.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleActionClick(notification, action)
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      action.variant === 'primary'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : action.variant === 'danger'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const FilterPanel = () => (
    <div className="border-b border-gray-200 p-4 bg-gray-50">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Severity filters */}
          {(['info', 'warning', 'error', 'critical'] as NotificationSeverity[]).map(severity => (
            <button
              key={severity}
              onClick={() => setFilters(prev => ({
                ...prev,
                severity: prev.severity.includes(severity)
                  ? prev.severity.filter(s => s !== severity)
                  : [...prev.severity, severity]
              }))}
              className={`px-3 py-1 text-xs rounded-full ${
                filters.severity.includes(severity)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {severity}
            </button>
          ))}
          
          {/* Status filters */}
          {(['unread', 'read', 'archived'] as NotificationStatus[]).map(status => (
            <button
              key={status}
              onClick={() => setFilters(prev => ({
                ...prev,
                status: prev.status.includes(status)
                  ? prev.status.filter(s => s !== status)
                  : [...prev.status, status]
              }))}
              className={`px-3 py-1 text-xs rounded-full ${
                filters.status.includes(status)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const HeaderActions = () => (
    <div className="flex items-center space-x-2 mb-4">
      {/* Stats */}
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <span>Total: {notificationStats.total}</span>
        <span className="flex items-center">
          <div className="w-2 h-2 bg-blue-600 rounded-full mr-1" />
          Unread: {notificationStats.unread}
        </span>
        {notificationStats.critical > 0 && (
          <span className="flex items-center text-red-600 font-medium">
            <AlertCircle className="h-4 w-4 mr-1" />
            Critical: {notificationStats.critical}
          </span>
        )}
      </div>
      
      <div className="flex-1" />
      
      {/* Action buttons */}
      <div className="flex items-center space-x-2">
        {selectedNotifications.size > 0 && (
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600">
              {selectedNotifications.size} selected
            </span>
            <button
              onClick={() => handleBulkAction('read')}
              className="p-1 text-gray-600 hover:text-blue-600"
              title="Mark as read"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleBulkAction('unread')}
              className="p-1 text-gray-600 hover:text-blue-600"
              title="Mark as unread"
            >
              <EyeOff className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="p-1 text-gray-600 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-md ${
            showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Toggle filters"
        >
          <Filter className="h-4 w-4" />
        </button>
        
        <button
          onClick={refreshNotifications}
          disabled={isLoading}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
        
        {showSettings && (
          <button
            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
            className={`p-2 rounded-md ${
              showSettingsPanel ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Notification settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            {connectionState.isConnected && (
              <div className="flex items-center space-x-1 text-xs text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Live</span>
              </div>
            )}
          </div>
        </div>
        
        <HeaderActions />
      </div>
      
      {/* Filters */}
      {showFilters && <FilterPanel />}
      
      {/* Notifications list */}
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No notifications</p>
            <p className="text-sm">
              {filters.search || filters.severity.length > 0 || filters.category.length > 0 || filters.status.length > 0
                ? 'No notifications match your current filters'
                : 'You\'re all caught up! No new notifications to show.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        )}
      </div>
      
      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => markAsRead(notifications.filter(n => n.status === 'unread').map(n => n.id))}
                className="text-blue-600 hover:text-blue-500"
              >
                Mark all as read
              </button>
              <span>•</span>
              <button
                onClick={() => archiveNotifications(notifications.filter(n => n.status === 'read').map(n => n.id))}
                className="text-gray-600 hover:text-gray-500"
              >
                Archive all read
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}