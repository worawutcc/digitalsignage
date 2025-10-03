/* eslint-disable no-console */
'use client'

import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'

export type ConnectionStatus = 'idle' | 'connecting' | 'open' | 'closing' | 'closed' | 'error'

export type RealTimeEventType =
  | 'device_status_changed'
  | 'device_heartbeat'
  | 'device_configuration_update'
  | 'schedule_conflict_detected'
  | 'schedule_updated'
  | 'media_uploaded'
  | 'user_action'
  | 'system_alert'
  | 'heartbeat'
  | 'connection_established'
  | string

export interface RealTimeEvent<TPayload = unknown> {
  type: RealTimeEventType
  payload: TPayload
  timestamp: string
}

/**
 * SignalR event DTO structure from backend
 */
export interface RealtimeEventDto {
  type: string
  payload: string
  timestamp: string
}

export type EventHandler<TPayload = unknown> = (
  payload: TPayload,
  event: RealTimeEvent<TPayload>
) => void

export type StatusHandler = (status: ConnectionStatus) => void

interface WebSocketClientOptions {
  autoReconnect?: boolean
  maxReconnectDelay?: number
  minReconnectDelay?: number
}

const DEFAULT_OPTIONS: Required<WebSocketClientOptions> = {
  autoReconnect: true,
  minReconnectDelay: 1000,
  maxReconnectDelay: 15000,
}

/**
 * WebSocketClient handles SignalR connection lifecycle, reconnection, and event dispatching
 * Connects to the NotificationHub on the backend
 * 
 * Following UI copilot instructions:
 * - TypeScript strict typing
 * - Error handling and reconnection logic
 * - Event-driven architecture
 */
class WebSocketClient {
  private connection: HubConnection | null = null

  private status: ConnectionStatus = 'idle'

  private reconnectAttempts = 0

  private reconnectTimer: number | null = null

  private options: Required<WebSocketClientOptions>

  private readonly eventHandlers = new Map<RealTimeEventType | '*', Set<EventHandler>>()

  private readonly statusHandlers = new Set<StatusHandler>()

  private isManuallyDisconnected = false

  private accessToken?: string

  private subscribedDevices: Set<number> = new Set()

  private subscribedEventTypes: Set<string> = new Set()

  constructor(options?: WebSocketClientOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  /**
   * Connect to the SignalR NotificationHub
   */
  async connect(url?: string) {
    if (typeof window === 'undefined') return

    if (this.connection?.state === 'Connected' || this.connection?.state === 'Connecting') {
      return
    }

    const baseUrl = url || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5100'
    const hubUrl = `${baseUrl}/ws`

    try {
      this.updateStatus('connecting')
      this.isManuallyDisconnected = false

      this.connection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => this.accessToken || '',
          withCredentials: false,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            const delay = Math.min(
              this.options.minReconnectDelay * Math.pow(2, retryContext.previousRetryCount),
              this.options.maxReconnectDelay
            )
            return delay + Math.random() * 1000 // Add jitter
          },
        })
        .configureLogging(LogLevel.Information)
        .build()

      // Set up event handlers
      this.setupSignalRHandlers()

      await this.connection.start()
      this.reconnectAttempts = 0
      this.updateStatus('open')

      // Re-subscribe to devices and events after reconnection
      await this.resubscribeAfterReconnect()

    } catch (error) {
      console.error('[WebSocketClient] Failed to establish SignalR connection', error)
      this.updateStatus('error')
      this.scheduleReconnect()
    }
  }

  /**
   * Disconnect from the SignalR hub and stop auto-reconnect
   */
  async disconnect() {
    this.isManuallyDisconnected = true
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.connection) {
      this.updateStatus('closing')
      await this.connection.stop()
      this.connection = null
      this.updateStatus('closed')
    }
  }

  /**
   * Send heartbeat to server
   */
  async sendHeartbeat() {
    if (!this.connection || this.connection.state !== 'Connected') {
      return
    }

    try {
      await this.connection.invoke('SendHeartbeat')
    } catch (error) {
      console.error('[WebSocketClient] Failed to send heartbeat', error)
    }
  }

  /**
   * Subscribe to device status updates for specific devices
   */
  async subscribeToDevices(deviceIds: number[]) {
    if (!this.connection || this.connection.state !== 'Connected') {
      console.warn('[WebSocketClient] Unable to subscribe to devices, not connected')
      return
    }

    try {
      await this.connection.invoke('SubscribeToDevices', deviceIds)
      deviceIds.forEach(id => this.subscribedDevices.add(id))
      console.log('[WebSocketClient] Subscribed to devices:', deviceIds)
    } catch (error) {
      console.error('[WebSocketClient] Failed to subscribe to devices', error)
    }
  }

  /**
   * Unsubscribe from device status updates
   */
  async unsubscribeFromDevices(deviceIds: number[]) {
    if (!this.connection || this.connection.state !== 'Connected') {
      return
    }

    try {
      await this.connection.invoke('UnsubscribeFromDevices', deviceIds)
      deviceIds.forEach(id => this.subscribedDevices.delete(id))
      console.log('[WebSocketClient] Unsubscribed from devices:', deviceIds)
    } catch (error) {
      console.error('[WebSocketClient] Failed to unsubscribe from devices', error)
    }
  }

  /**
   * Subscribe to all device events (admin only)
   */
  async subscribeToAllDevices() {
    if (!this.connection || this.connection.state !== 'Connected') {
      return
    }

    try {
      await this.connection.invoke('SubscribeToAllDevices')
      console.log('[WebSocketClient] Subscribed to all device events')
    } catch (error) {
      console.error('[WebSocketClient] Failed to subscribe to all devices', error)
    }
  }

  /**
   * Subscribe to specific event types
   */
  async subscribeToEventTypes(eventTypes: string[]) {
    if (!this.connection || this.connection.state !== 'Connected') {
      return
    }

    try {
      await this.connection.invoke('SubscribeToEvents', eventTypes)
      eventTypes.forEach(type => this.subscribedEventTypes.add(type))
      console.log('[WebSocketClient] Subscribed to event types:', eventTypes)
    } catch (error) {
      console.error('[WebSocketClient] Failed to subscribe to event types', error)
    }
  }

  /**
   * Update client configuration at runtime
   */
  configure(options: WebSocketClientOptions) {
    this.options = { ...this.options, ...options }
  }

  /**
   * Subscribe to specific event type. Use "*" to listen to all events
   */
  subscribe<TPayload = unknown>(
    type: RealTimeEventType | '*',
    handler: EventHandler<TPayload>
  ): () => void {
    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, new Set())
    }

    const handlers = this.eventHandlers.get(type)!
    handlers.add(handler as EventHandler)

    // Ensure connection is established when a subscription is added
    this.connect()

    return () => {
      handlers.delete(handler as EventHandler)
      if (handlers.size === 0) {
        this.eventHandlers.delete(type)
      }
    }
  }

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler)
    handler(this.status)
    return () => {
      this.statusHandlers.delete(handler)
    }
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return this.status
  }

  /**
   * Emit an event to all subscribers (used internally and in tests)
   */
  emit<TPayload = unknown>(event: RealTimeEvent<TPayload>) {
    const handlers = this.eventHandlers.get(event.type)
    if (handlers) {
      handlers.forEach(handler => handler(event.payload, event))
    }

    const wildcardHandlers = this.eventHandlers.get('*')
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => handler(event.payload, event))
    }
  }

  /**
   * Emit connection status for listeners (used internally and in tests)
   */
  emitConnectionStatus(status: ConnectionStatus) {
    this.updateStatus(status)
  }

  /**
   * Remove every registered event handler (useful for tests)
   */
  clearAllListeners() {
    this.eventHandlers.clear()
    this.statusHandlers.clear()
  }

  /**
   * Set access token for authentication
   */
  setAccessToken(token: string) {
    this.accessToken = token
  }

  /**
   * Setup SignalR event handlers
   */
  private setupSignalRHandlers() {
    if (!this.connection) return

    // Main event handler for all realtime events
    this.connection.on('ReceiveEvent', (event: RealtimeEventDto) => {
      try {
        const payload = JSON.parse(event.payload)
        
        const realTimeEvent: RealTimeEvent = {
          type: event.type as RealTimeEventType,
          payload,
          timestamp: event.timestamp
        }

        this.emit(realTimeEvent)
        
      } catch (error) {
        console.error('[WebSocketClient] Failed to parse SignalR event payload:', error, event)
      }
    })

    // Connection state handlers
    this.connection.onreconnecting((error) => {
      console.log('[WebSocketClient] SignalR reconnecting...', error)
      this.updateStatus('connecting')
    })

    this.connection.onreconnected(async (connectionId) => {
      console.log('[WebSocketClient] SignalR reconnected:', connectionId)
      this.reconnectAttempts = 0
      this.updateStatus('open')
      await this.resubscribeAfterReconnect()
    })

    this.connection.onclose((error) => {
      console.log('[WebSocketClient] SignalR connection closed:', error)
      this.updateStatus('closed')
      
      if (!this.isManuallyDisconnected && this.options.autoReconnect) {
        this.scheduleReconnect()
      }
    })
  }

  /**
   * Re-subscribe to devices and events after reconnection
   */
  private async resubscribeAfterReconnect() {
    try {
      // Re-subscribe to devices
      if (this.subscribedDevices.size > 0) {
        const deviceIds = Array.from(this.subscribedDevices)
        await this.subscribeToDevices(deviceIds)
      }

      // Re-subscribe to event types
      if (this.subscribedEventTypes.size > 0) {
        const eventTypes = Array.from(this.subscribedEventTypes)
        await this.subscribeToEventTypes(eventTypes)
      }
    } catch (error) {
      console.error('[WebSocketClient] Failed to resubscribe after reconnect:', error)
    }
  }

  /**
   * Update status and notify handlers
   */
  private updateStatus(status: ConnectionStatus) {
    if (this.status === status) return
    this.status = status
    this.statusHandlers.forEach(handler => handler(status))
  }

  /**
   * Schedule reconnect with exponential backoff for SignalR
   */
  private scheduleReconnect() {
    if (!this.options.autoReconnect || typeof window === 'undefined') {
      return
    }

    const delay = Math.min(
      this.options.minReconnectDelay * 2 ** this.reconnectAttempts,
      this.options.maxReconnectDelay
    )

    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer)
    }

    this.reconnectTimer = window.setTimeout(async () => {
      this.reconnectAttempts += 1
      try {
        await this.connect()
      } catch (error) {
        console.error('[WebSocketClient] Reconnection failed:', error)
      }
    }, delay)

    this.updateStatus('connecting')
  }
}

export const websocketClient = new WebSocketClient()

export type { WebSocketClient }
