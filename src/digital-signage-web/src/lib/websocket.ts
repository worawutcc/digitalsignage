/* eslint-disable no-console */
'use client'

export type ConnectionStatus = 'idle' | 'connecting' | 'open' | 'closing' | 'closed' | 'error'

export type RealTimeEventType =
  | 'device_status_changed'
  | 'schedule_conflict_detected'
  | 'schedule_updated'
  | 'media_uploaded'
  | 'user_action'
  | 'system_alert'
  | 'heartbeat'
  | string

export interface RealTimeEvent<TPayload = unknown> {
  type: RealTimeEventType
  payload: TPayload
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
 * WebSocketClient handles connection lifecycle, reconnection, and event dispatching
 */
class WebSocketClient {
  private socket: WebSocket | null = null

  private status: ConnectionStatus = 'idle'

  private reconnectAttempts = 0

  private reconnectTimer: number | null = null

  private options: Required<WebSocketClientOptions>

  private readonly eventHandlers = new Map<RealTimeEventType | '*', Set<EventHandler>>()

  private readonly statusHandlers = new Set<StatusHandler>()

  private isManuallyDisconnected = false

  constructor(options?: WebSocketClientOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  /**
   * Connect to the configured WebSocket endpoint
   */
  connect(url?: string) {
    if (typeof window === 'undefined') return

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return
    }

    const endpoint = url || process.env.NEXT_PUBLIC_WS_URL

    if (!endpoint) {
      console.warn('[WebSocketClient] Missing NEXT_PUBLIC_WS_URL environment variable')
      return
    }

    try {
      this.updateStatus('connecting')
      this.isManuallyDisconnected = false
      this.socket = new WebSocket(endpoint)
      this.socket.addEventListener('open', this.handleOpen)
      this.socket.addEventListener('message', this.handleMessage)
      this.socket.addEventListener('error', this.handleError)
      this.socket.addEventListener('close', this.handleClose)
    } catch (error) {
      console.error('[WebSocketClient] Failed to establish connection', error)
      this.scheduleReconnect()
    }
  }

  /**
   * Disconnect from the WebSocket endpoint and stop auto-reconnect
   */
  disconnect() {
    this.isManuallyDisconnected = true
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.socket) {
      this.updateStatus('closing')
      this.socket.removeEventListener('open', this.handleOpen)
      this.socket.removeEventListener('message', this.handleMessage)
      this.socket.removeEventListener('error', this.handleError)
      this.socket.removeEventListener('close', this.handleClose)
      this.socket.close()
      this.socket = null
      this.updateStatus('closed')
    }
  }

  /**
   * Send payload to server
   */
  send<TPayload = unknown>(type: RealTimeEventType, payload: TPayload) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocketClient] Unable to send message, socket not open')
      return
    }

    const event: RealTimeEvent<TPayload> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    }

    this.socket.send(JSON.stringify(event))
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
   * Internal: handle socket open event
   */
  private handleOpen = () => {
    this.reconnectAttempts = 0
    this.updateStatus('open')
  }

  /**
   * Internal: handle incoming message payloads
   */
  private handleMessage = (event: MessageEvent) => {
    try {
      const parsed = JSON.parse(event.data) as RealTimeEvent
      if (!parsed?.type) {
        console.warn('[WebSocketClient] Received message without type', parsed)
        return
      }
      this.emit(parsed)
    } catch (error) {
      console.error('[WebSocketClient] Failed to parse message', error, event.data)
    }
  }

  /**
   * Internal: handle socket errors
   */
  private handleError = (error: Event) => {
    console.error('[WebSocketClient] Socket error', error)
    this.updateStatus('error')
  }

  /**
   * Internal: handle socket close events and trigger reconnect if appropriate
   */
  private handleClose = () => {
    this.updateStatus('closed')
    this.cleanupSocket()
    if (!this.isManuallyDisconnected && this.options.autoReconnect) {
      this.scheduleReconnect()
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
   * Cleanup socket listeners
   */
  private cleanupSocket() {
    if (!this.socket) return
    this.socket.removeEventListener('open', this.handleOpen)
    this.socket.removeEventListener('message', this.handleMessage)
    this.socket.removeEventListener('error', this.handleError)
    this.socket.removeEventListener('close', this.handleClose)
    this.socket = null
  }

  /**
   * Schedule reconnect with exponential backoff
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

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectAttempts += 1
      this.connect()
    }, delay)

    this.updateStatus('connecting')
  }
}

export const websocketClient = new WebSocketClient()

export type { WebSocketClient }
