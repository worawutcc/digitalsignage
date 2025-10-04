/**
 * useRealTimeUpdates Hook
 * 
 * Provides comprehensive real-time update capabilities using WebSocket integration
 * for live data synchronization across schedules, users, devices, and conflicts.
 * 
 * @see copilot-instructions-ui.instructions.md - React Query patterns
 * @see specs/021-user-schedule-assignment/tasks.md - T014 Requirements
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from './useToast'

export interface UseRealTimeUpdatesOptions {
  /** Enable automatic connection on mount */
  autoConnect?: boolean
  /** Reconnection configuration */
  reconnect?: {
    enabled: boolean
    maxAttempts: number
    delay: number
    backoffMultiplier: number
  }
  /** Subscription filters */
  subscriptions?: {
    schedules?: boolean
    users?: boolean
    devices?: boolean
    conflicts?: boolean
    media?: boolean
  }
  /** Entity-specific filters */
  entityFilters?: {
    userIds?: string[]
    scheduleIds?: string[]
    deviceIds?: string[]
    organizationId?: string
  }
  /** Event handling preferences */
  notifications?: {
    showToasts?: boolean
    critical?: boolean
    events?: RealTimeEventType[]
  }
}

export type RealTimeEventType = 
  | 'schedule_created'
  | 'schedule_updated' 
  | 'schedule_deleted'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'device_status_changed'
  | 'device_registered'
  | 'device_unregistered'
  | 'conflict_detected'
  | 'conflict_resolved'
  | 'media_uploaded'
  | 'media_processed'
  | 'assignment_created'
  | 'assignment_updated'
  | 'assignment_deleted'

export interface RealTimeEvent {
  id: string
  type: RealTimeEventType
  timestamp: string
  entityType: 'schedule' | 'user' | 'device' | 'conflict' | 'media' | 'assignment'
  entityId: string
  data: any
  metadata?: {
    source?: string
    userId?: string
    organizationId?: string
  }
}

export interface RealTimeConnectionState {
  isConnected: boolean
  isConnecting: boolean
  isReconnecting: boolean
  lastConnected: Date | null
  connectionAttempts: number
  error: string | null
}

/**
 * Main real-time updates hook
 * 
 * @example
 * ```tsx
 * const {
 *   connectionState,
 *   connect,
 *   disconnect,
 *   subscribe,
 *   unsubscribe,
 *   events
 * } = useRealTimeUpdates({
 *   autoConnect: true,
 *   subscriptions: {
 *     schedules: true,
 *     conflicts: true
 *   },
 *   entityFilters: {
 *     organizationId: 'org-123'
 *   },
 *   notifications: {
 *     showToasts: true,
 *     critical: true
 *   }
 * })
 * 
 * // Connection status indicator
 * return (
 *   <div>
 *     <ConnectionStatus state={connectionState} />
 *     <EventsFeed events={events} />
 *   </div>
 * )
 * ```
 */
export function useRealTimeUpdates(options: UseRealTimeUpdatesOptions = {}) {
  const {
    autoConnect = false,
    reconnect = {
      enabled: true,
      maxAttempts: 5,
      delay: 1000,
      backoffMultiplier: 1.5
    },
    subscriptions = {
      schedules: true,
      users: true,
      devices: true,
      conflicts: true,
      media: false
    },
    entityFilters = {},
    notifications = {
      showToasts: false,
      critical: true,
      events: []
    }
  } = options

  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // WebSocket connection reference
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const subscriptionsRef = useRef<Set<string>>(new Set())

  // State
  const [connectionState, setConnectionState] = useState<RealTimeConnectionState>({
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    lastConnected: null,
    connectionAttempts: 0,
    error: null
  })

  const [events, setEvents] = useState<RealTimeEvent[]>([])
  const [eventSubscriptions, setEventSubscriptions] = useState<Map<string, (event: RealTimeEvent) => void>>(new Map())

  // Get WebSocket URL (in real implementation, this would come from config)
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    return `${protocol}//${host}/api/ws/real-time`
  }, [])

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const realTimeEvent: RealTimeEvent = JSON.parse(event.data)
      
      console.log('Real-time event received:', realTimeEvent)
      
      // Add to events history
      setEvents(prev => [realTimeEvent, ...prev.slice(0, 49)]) // Keep last 50 events
      
      // Trigger custom subscriptions
      eventSubscriptions.forEach(callback => {
        try {
          callback(realTimeEvent)
        } catch (error) {
          console.error('Error in event subscription callback:', error)
        }
      })
      
      // Handle specific event types
      switch (realTimeEvent.type) {
        case 'schedule_created':
        case 'schedule_updated':
        case 'schedule_deleted':
          queryClient.invalidateQueries({ queryKey: ['schedules'] })
          queryClient.invalidateQueries({ queryKey: ['userSchedules'] })
          break
          
        case 'user_created':
        case 'user_updated':
        case 'user_deleted':
          queryClient.invalidateQueries({ queryKey: ['users'] })
          queryClient.invalidateQueries({ queryKey: ['userSchedules'] })
          break
          
        case 'device_status_changed':
        case 'device_registered':
        case 'device_unregistered':
          queryClient.invalidateQueries({ queryKey: ['devices'] })
          break
          
        case 'conflict_detected':
        case 'conflict_resolved':
          queryClient.invalidateQueries({ queryKey: ['conflicts'] })
          break
          
        case 'assignment_created':
        case 'assignment_updated':
        case 'assignment_deleted':
          queryClient.invalidateQueries({ queryKey: ['userSchedules'] })
          queryClient.invalidateQueries({ queryKey: ['scheduleAssignments'] })
          break
      }
      
      // Show toast notifications if enabled
      if (notifications.showToasts) {
        const shouldNotify = !notifications.events?.length || 
          notifications.events.includes(realTimeEvent.type)
        
        if (shouldNotify) {
          const isCritical = ['conflict_detected', 'device_unregistered'].includes(realTimeEvent.type)
          
          if (!notifications.critical || isCritical) {
            toast({
              title: formatEventTitle(realTimeEvent.type),
              description: getEventDescription(realTimeEvent),
              variant: isCritical ? 'destructive' : 'default',
              duration: isCritical ? 0 : 3000
            })
          }
        }
      }
      
    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
    }
  }, [queryClient, eventSubscriptions, notifications, toast])

  // Handle WebSocket connection open
  const handleOpen = useCallback(() => {
    console.log('WebSocket connection established')
    
    setConnectionState(prev => ({
      ...prev,
      isConnected: true,
      isConnecting: false,
      isReconnecting: false,
      lastConnected: new Date(),
      connectionAttempts: 0,
      error: null
    }))

    // Send subscription message
    if (wsRef.current) {
      const subscriptionMessage = {
        action: 'subscribe',
        subscriptions: Object.entries(subscriptions)
          .filter(([, enabled]) => enabled)
          .map(([type]) => type),
        filters: entityFilters
      }
      
      wsRef.current.send(JSON.stringify(subscriptionMessage))
    }
  }, [subscriptions, entityFilters])

  // Handle WebSocket connection close
  const handleClose = useCallback((event: CloseEvent) => {
    console.log('WebSocket connection closed:', event.code, event.reason)
    
    setConnectionState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      error: event.reason || 'Connection closed'
    }))

    // Attempt reconnection if enabled
    if (reconnect.enabled && 
        connectionState.connectionAttempts < reconnect.maxAttempts &&
        !event.wasClean) {
      
      const delay = reconnect.delay * Math.pow(reconnect.backoffMultiplier, connectionState.connectionAttempts)
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${connectionState.connectionAttempts + 1}/${reconnect.maxAttempts})`)
      
      setConnectionState(prev => ({
        ...prev,
        isReconnecting: true,
        connectionAttempts: prev.connectionAttempts + 1
      }))
      
      reconnectTimeoutRef.current = setTimeout(() => {
        connect()
      }, delay)
    }
  }, [reconnect, connectionState.connectionAttempts])

  // Handle WebSocket errors
  const handleError = useCallback((error: Event) => {
    console.error('WebSocket error:', error)
    
    setConnectionState(prev => ({
      ...prev,
      error: 'Connection error occurred'
    }))
  }, [])

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.CONNECTING || 
        wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      setConnectionState(prev => ({
        ...prev,
        isConnecting: true,
        error: null
      }))

      const wsUrl = getWebSocketUrl()
      console.log('Connecting to WebSocket:', wsUrl)
      
      wsRef.current = new WebSocket(wsUrl)
      wsRef.current.onopen = handleOpen
      wsRef.current.onmessage = handleMessage
      wsRef.current.onclose = handleClose
      wsRef.current.onerror = handleError
      
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error)
      
      setConnectionState(prev => ({
        ...prev,
        isConnecting: false,
        error: 'Failed to connect'
      }))
    }
  }, [getWebSocketUrl, handleOpen, handleMessage, handleClose, handleError])

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect')
      wsRef.current = null
    }

    setConnectionState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      connectionAttempts: 0
    }))
  }, [])

  // Subscribe to specific events
  const subscribe = useCallback((eventTypes: RealTimeEventType[], callback: (event: RealTimeEvent) => void) => {
    const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const wrappedCallback = (event: RealTimeEvent) => {
      if (eventTypes.includes(event.type)) {
        callback(event)
      }
    }
    
    setEventSubscriptions(prev => new Map(prev).set(subscriptionId, wrappedCallback))
    
    return () => {
      setEventSubscriptions(prev => {
        const newMap = new Map(prev)
        newMap.delete(subscriptionId)
        return newMap
      })
    }
  }, [])

  // Unsubscribe from events
  const unsubscribe = useCallback((subscriptionId: string) => {
    setEventSubscriptions(prev => {
      const newMap = new Map(prev)
      newMap.delete(subscriptionId)
      return newMap
    })
  }, [])

  // Send custom message to WebSocket
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      return true
    }
    return false
  }, [])

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    /** Connection state */
    connectionState,
    
    /** Connection controls */
    connect,
    disconnect,
    
    /** Event subscription */
    subscribe,
    unsubscribe,
    sendMessage,
    
    /** Event data */
    events,
    recentEvents: events.slice(0, 10),
    
    /** Utility functions */
    utils: {
      /** Clear events history */
      clearEvents: () => setEvents([]),
      
      /** Get events by type */
      getEventsByType: (type: RealTimeEventType) => 
        events.filter(event => event.type === type),
      
      /** Get events by entity */
      getEventsByEntity: (entityType: string, entityId: string) =>
        events.filter(event => 
          event.entityType === entityType && event.entityId === entityId
        ),
      
      /** Check if connected */
      isConnected: () => connectionState.isConnected,
      
      /** Get connection uptime */
      getUptime: () => {
        if (!connectionState.lastConnected) return 0
        return Date.now() - connectionState.lastConnected.getTime()
      }
    }
  }
}

// Helper functions
function formatEventTitle(eventType: RealTimeEventType): string {
  const titles: Record<RealTimeEventType, string> = {
    schedule_created: 'Schedule Created',
    schedule_updated: 'Schedule Updated',
    schedule_deleted: 'Schedule Deleted',
    user_created: 'User Created',
    user_updated: 'User Updated',
    user_deleted: 'User Deleted',
    device_status_changed: 'Device Status Changed',
    device_registered: 'Device Registered',
    device_unregistered: 'Device Unregistered',
    conflict_detected: 'Conflict Detected',
    conflict_resolved: 'Conflict Resolved',
    media_uploaded: 'Media Uploaded',
    media_processed: 'Media Processed',
    assignment_created: 'Assignment Created',
    assignment_updated: 'Assignment Updated',
    assignment_deleted: 'Assignment Deleted'
  }
  
  return titles[eventType] || 'Event Received'
}

function getEventDescription(event: RealTimeEvent): string {
  switch (event.type) {
    case 'conflict_detected':
      return `A new conflict has been detected${event.data?.description ? ': ' + event.data.description : ''}`
    case 'device_unregistered':
      return `Device ${event.entityId} has been unregistered`
    case 'schedule_created':
      return `New schedule "${event.data?.name || event.entityId}" has been created`
    default:
      return `${event.entityType} ${event.entityId} has been updated`
  }
}

/**
 * Simplified hook for schedule real-time updates
 */
export function useScheduleRealTimeUpdates(scheduleIds?: string[]) {
  const options: UseRealTimeUpdatesOptions = {
    autoConnect: true,
    subscriptions: {
      schedules: true,
      conflicts: true
    },
    notifications: {
      showToasts: true,
      critical: true
    }
  }
  
  if (scheduleIds) {
    options.entityFilters = { scheduleIds }
  }
  
  return useRealTimeUpdates(options)
}

/**
 * Simplified hook for user real-time updates
 */
export function useUserRealTimeUpdates(userIds?: string[]) {
  const options: UseRealTimeUpdatesOptions = {
    autoConnect: true,
    subscriptions: {
      users: true,
      conflicts: true
    },
    notifications: {
      showToasts: false
    }
  }
  
  if (userIds) {
    options.entityFilters = { userIds }
  }
  
  return useRealTimeUpdates(options)
}

export default useRealTimeUpdates