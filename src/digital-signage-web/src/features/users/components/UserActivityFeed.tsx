'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Activity, 
  Clock, 
  Users, 
  UserCheck,
  UserX,
  Settings,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  RefreshCw,
  Search,
  Calendar,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { userService } from '../services/userService'
import { useUserRealTimeUpdates } from '@/hooks/useRealTimeUpdates'
import { cn } from '@/lib/utils'
import type { User } from '@/types/api'

// Simple UI components (following existing pattern)
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg shadow-sm', className)}>
      {children}
    </div>
  )
}

function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-4 border-b border-gray-200', className)}>
      {children}
    </div>
  )
}

function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-4', className)}>
      {children}
    </div>
  )
}

function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h3>
  )
}

// Simple Input component
function Input({ 
  className, 
  placeholder, 
  value, 
  onChange, 
  type = 'text',
  ...props 
}: { 
  className?: string; 
  placeholder?: string; 
  value?: string; 
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  type?: string;
  [key: string]: any;
}) {
  return (
    <input
      type={type}
      className={cn(
        'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        className
      )}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...props}
    />
  )
}

// Simple Select component
function Select({ 
  value, 
  onChange, 
  children, 
  className 
}: { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={cn(
        'px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        className
      )}
    >
      {children}
    </select>
  )
}

export interface ActivityEvent {
  id: string
  type: 'user_created' | 'user_updated' | 'user_deleted' | 'user_login' | 'user_logout' | 'permission_changed' | 'role_updated' | 'schedule_assigned' | 'device_assigned'
  timestamp: string
  userId: number
  userName: string
  userEmail: string
  targetUserId?: number | undefined
  targetUserName?: string | undefined
  details: {
    action?: string | undefined
    description?: string | undefined
    oldValue?: string | undefined
    newValue?: string | undefined
    ipAddress?: string | undefined
    userAgent?: string | undefined
    [key: string]: any
  }
  severity: 'info' | 'warning' | 'error' | 'success'
  category: 'authentication' | 'user_management' | 'permissions' | 'assignments' | 'system'
}

export interface UserActivityFeedProps {
  className?: string
  userId?: number // Optional: show activity for specific user
  maxItems?: number
  showFilters?: boolean
  autoRefresh?: boolean
  showTimeline?: boolean
  groupByDate?: boolean
}

/**
 * UserActivityFeed Component
 * 
 * Real-time user activity feed with timeline view, filtering capabilities,
 * and WebSocket integration for live updates.
 * 
 * Features:
 * - Real-time activity updates via WebSocket
 * - Timeline view with grouping
 * - Advanced filtering and search
 * - Activity categorization
 * - Expandable event details
 * - User-specific activity filtering
 * - Mobile-responsive design
 */
export function UserActivityFeed({
  className = '',
  userId,
  maxItems = 50,
  showFilters = true,
  autoRefresh = true,
  showTimeline = true,
  groupByDate = true,
}: UserActivityFeedProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())
  const [refreshing, setRefreshing] = useState(false)

  // Fetch activity events
  const {
    data: activityEvents,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userActivityFeed', { userId, maxItems }],
    queryFn: async () => {
      // In real implementation, this would call a dedicated activity API
      // For now, we'll generate mock data based on existing user data
      return generateMockActivityEvents(userId, maxItems)
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: autoRefresh ? 30000 : false, // 30 seconds auto-refresh
    refetchOnWindowFocus: false,
  })

  // Real-time updates via WebSocket
  const { events: realtimeEvents } = useUserRealTimeUpdates(userId ? [userId.toString()] : undefined)

  // Process real-time events and update activity feed
  useEffect(() => {
    if (realtimeEvents.length > 0) {
      // Filter for user-related events
      const userEvents = realtimeEvents.filter(event => 
        event.type.includes('user') || 
        event.type.includes('permission') || 
        event.type.includes('role')
      )
      
      if (userEvents.length > 0) {
        refetch() // Refresh the activity feed when new events arrive
      }
    }
  }, [realtimeEvents, refetch])

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setTimeout(() => setRefreshing(false), 1000)
    }
  }

  // Filter and search activity events
  const filteredEvents = useMemo(() => {
    if (!activityEvents) return []

    return activityEvents.filter(event => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchableText = `${event.userName} ${event.userEmail} ${event.details.description || ''} ${event.details.action || ''}`.toLowerCase()
        if (!searchableText.includes(query)) return false
      }

      // Category filter
      if (selectedCategory !== 'all' && event.category !== selectedCategory) {
        return false
      }

      // Severity filter
      if (selectedSeverity !== 'all' && event.severity !== selectedSeverity) {
        return false
      }

      return true
    })
  }, [activityEvents, searchQuery, selectedCategory, selectedSeverity])

  // Group events by date if enabled
  const groupedEvents = useMemo(() => {
    if (!groupByDate || !filteredEvents) return { ungrouped: filteredEvents }

    const groups: Record<string, ActivityEvent[]> = {}
    
    filteredEvents.forEach(event => {
      const date = new Date(event.timestamp).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(event)
    })

    return groups
  }, [filteredEvents, groupByDate])

  // Toggle event expansion
  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents)
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId)
    } else {
      newExpanded.add(eventId)
    }
    setExpandedEvents(newExpanded)
  }

  if (error) {
    return (
      <div className={cn('p-6 text-center', className)}>
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">Failed to load activity feed</h3>
        <p className="mt-2 text-sm text-gray-600">
          Unable to fetch user activity data. Please try again.
        </p>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {userId ? 'User Activity Feed' : 'System Activity Feed'}
          </h2>
          <p className="text-sm text-gray-600">
            {userId 
              ? 'Real-time activity feed for selected user'
              : 'System-wide user activity and events with real-time updates'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || refreshing}
          >
            <RefreshCw className={cn('mr-2 h-4 w-4', { 'animate-spin': isLoading || refreshing })} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="authentication">Authentication</option>
                <option value="user_management">User Management</option>
                <option value="permissions">Permissions</option>
                <option value="assignments">Assignments</option>
                <option value="system">System</option>
              </Select>

              {/* Severity Filter */}
              <Select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
              >
                <option value="all">All Severities</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </Select>

              {/* Results Count */}
              <div className="flex items-center text-sm text-gray-600">
                <Activity className="mr-2 h-4 w-4" />
                {filteredEvents?.length || 0} events
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Timeline */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent>
                  <div className="animate-pulse space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-200 rounded w-1/2 mt-1" />
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-16" />
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : groupByDate ? (
          <div className="space-y-6">
            {Object.entries(groupedEvents).map(([date, events]) => (
              <div key={date} className="space-y-3">
                {date !== 'ungrouped' && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <h3 className="text-sm font-medium text-gray-900">{date}</h3>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                )}
                <div className="space-y-3">
                  {events.map((event, index) => (
                    <ActivityEventCard
                      key={event.id}
                      event={event}
                      isExpanded={expandedEvents.has(event.id)}
                      onToggleExpansion={() => toggleEventExpansion(event.id)}
                      showTimeline={showTimeline}
                      isLast={index === events.length - 1}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents?.map((event, index) => (
              <ActivityEventCard
                key={event.id}
                event={event}
                isExpanded={expandedEvents.has(event.id)}
                onToggleExpansion={() => toggleEventExpansion(event.id)}
                showTimeline={showTimeline}
                isLast={index === (filteredEvents?.length || 0) - 1}
              />
            ))}
          </div>
        )}

        {filteredEvents?.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No activity found</h3>
              <p className="mt-2 text-sm text-gray-600">
                {searchQuery || selectedCategory !== 'all' || selectedSeverity !== 'all'
                  ? 'Try adjusting your filters or search query.'
                  : 'No user activity has been recorded yet.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

/**
 * ActivityEventCard Component
 * Individual activity event display with expandable details
 */
interface ActivityEventCardProps {
  event: ActivityEvent
  isExpanded: boolean
  onToggleExpansion: () => void
  showTimeline: boolean
  isLast: boolean
}

function ActivityEventCard({ 
  event, 
  isExpanded, 
  onToggleExpansion, 
  showTimeline,
  isLast 
}: ActivityEventCardProps) {
  const getEventIcon = (type: ActivityEvent['type'], severity: ActivityEvent['severity']) => {
    switch (type) {
      case 'user_created':
        return <UserCheck className="h-4 w-4" />
      case 'user_deleted':
        return <UserX className="h-4 w-4" />
      case 'user_login':
        return <CheckCircle className="h-4 w-4" />
      case 'user_logout':
        return <XCircle className="h-4 w-4" />
      case 'permission_changed':
      case 'role_updated':
        return <Shield className="h-4 w-4" />
      case 'schedule_assigned':
      case 'device_assigned':
        return <Settings className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: ActivityEvent['severity']) => {
    switch (severity) {
      case 'success':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-blue-600 bg-blue-100'
    }
  }

  return (
    <div className="relative">
      {/* Timeline Line */}
      {showTimeline && !isLast && (
        <div className="absolute left-6 top-12 w-px h-full bg-gray-200" />
      )}
      
      <Card className="relative">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Timeline Icon */}
            {showTimeline && (
              <div className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                getSeverityColor(event.severity)
              )}>
                {getEventIcon(event.type, event.severity)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              {/* Event Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">
                    {event.userName}
                  </p>
                  <Badge className={cn('text-xs', getSeverityColor(event.severity))}>
                    {event.category.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {new Date(event.timestamp).toLocaleString()}
                </div>
              </div>

              {/* Event Description */}
              <p className="mt-1 text-sm text-gray-600">
                {event.details.description || getDefaultDescription(event.type, event.targetUserName)}
              </p>

              {/* Expandable Details */}
              {(event.details.oldValue || event.details.newValue || event.details.ipAddress) && (
                <div className="mt-2">
                  <button
                    onClick={onToggleExpansion}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                  >
                    {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    {isExpanded ? 'Hide details' : 'Show details'}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md space-y-2">
                      {event.details.oldValue && (
                        <div className="text-xs">
                          <span className="font-medium text-gray-700">Previous:</span>
                          <span className="ml-2 text-gray-600">{event.details.oldValue}</span>
                        </div>
                      )}
                      {event.details.newValue && (
                        <div className="text-xs">
                          <span className="font-medium text-gray-700">Updated:</span>
                          <span className="ml-2 text-gray-600">{event.details.newValue}</span>
                        </div>
                      )}
                      {event.details.ipAddress && (
                        <div className="text-xs">
                          <span className="font-medium text-gray-700">IP Address:</span>
                          <span className="ml-2 text-gray-600">{event.details.ipAddress}</span>
                        </div>
                      )}
                      {event.details.userAgent && (
                        <div className="text-xs">
                          <span className="font-medium text-gray-700">User Agent:</span>
                          <span className="ml-2 text-gray-600 break-all">{event.details.userAgent}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Get default description for event types
 */
function getDefaultDescription(type: ActivityEvent['type'], targetUserName?: string): string {
  switch (type) {
    case 'user_created':
      return `Created new user account${targetUserName ? ` for ${targetUserName}` : ''}`
    case 'user_updated':
      return `Updated user profile${targetUserName ? ` for ${targetUserName}` : ''}`
    case 'user_deleted':
      return `Deleted user account${targetUserName ? ` for ${targetUserName}` : ''}`
    case 'user_login':
      return 'Logged into the system'
    case 'user_logout':
      return 'Logged out of the system'
    case 'permission_changed':
      return `Changed permissions${targetUserName ? ` for ${targetUserName}` : ''}`
    case 'role_updated':
      return `Updated user role${targetUserName ? ` for ${targetUserName}` : ''}`
    case 'schedule_assigned':
      return `Assigned schedule${targetUserName ? ` to ${targetUserName}` : ''}`
    case 'device_assigned':
      return `Assigned device${targetUserName ? ` to ${targetUserName}` : ''}`
    default:
      return 'Performed system action'
  }
}

/**
 * Generate mock activity events
 * In real implementation, this would be replaced with API calls
 */
function generateMockActivityEvents(userId?: number, maxItems: number = 50): ActivityEvent[] {
  const eventTypes: ActivityEvent['type'][] = [
    'user_created', 'user_updated', 'user_login', 'user_logout', 
    'permission_changed', 'role_updated', 'schedule_assigned', 'device_assigned'
  ]
  
  const categories: ActivityEvent['category'][] = [
    'authentication', 'user_management', 'permissions', 'assignments', 'system'
  ]
  
  const severities: ActivityEvent['severity'][] = ['info', 'success', 'warning', 'error']
  
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com' },
  ]

  const events: ActivityEvent[] = []
  
  for (let i = 0; i < maxItems; i++) {
    const user = mockUsers[Math.floor(Math.random() * mockUsers.length)]
    
    // Filter by userId if specified
    if (userId && user && user.id !== userId) {
      continue
    }
    
    if (!user) continue

    const targetUser = Math.random() > 0.7 ? mockUsers[Math.floor(Math.random() * mockUsers.length)] : undefined
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)] || 'user_updated'
    const category = categories[Math.floor(Math.random() * categories.length)] || 'user_management'
    const severity = severities[Math.floor(Math.random() * severities.length)] || 'info'

    const eventDetails: ActivityEvent['details'] = {}
    if (Math.random() > 0.5) eventDetails.description = `Custom description for ${type}`
    if (Math.random() > 0.7) eventDetails.oldValue = 'Previous Value'
    if (Math.random() > 0.7) eventDetails.newValue = 'New Value'
    if (Math.random() > 0.8) eventDetails.ipAddress = '192.168.1.100'
    if (Math.random() > 0.9) eventDetails.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

    events.push({
      id: `event-${i}`,
      type,
      timestamp: new Date(Date.now() - i * 1000 * 60 * Math.random() * 60).toISOString(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      targetUserId: targetUser?.id,
      targetUserName: targetUser?.name,
      details: eventDetails,
      severity,
      category,
    })
  }
  
  return events
}

export default UserActivityFeed