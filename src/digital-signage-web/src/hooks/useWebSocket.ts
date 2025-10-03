'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  websocketClient,
  type ConnectionStatus,
  type EventHandler,
  type RealTimeEvent,
  type RealTimeEventType,
} from '@/lib/websocket'

export type WebSocketEventHandlers = Partial<
  Record<RealTimeEventType | '*', EventHandler>
>

export interface UseWebSocketOptions {
  autoConnect?: boolean
  autoReconnect?: boolean
  onStatusChange?: (status: ConnectionStatus) => void
}

export interface UseWebSocketReturn {
  status: ConnectionStatus
  send: <TPayload = unknown>(type: RealTimeEventType, payload: TPayload) => void
  connect: () => void
  disconnect: () => void
}

const EMPTY_HANDLERS: WebSocketEventHandlers = {}

function createHandlersArray(handlers: WebSocketEventHandlers) {
  return Object.entries(handlers)
    .filter(([, handler]) => typeof handler === 'function')
    .map(([type, handler]) => ({
      type: type as RealTimeEventType | '*',
      handler: handler as EventHandler,
    }))
}

/**
 * React hook that binds application code to the shared WebSocket client
 */
export function useWebSocket(
  handlers: WebSocketEventHandlers = EMPTY_HANDLERS,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const { autoConnect = true, autoReconnect = true, onStatusChange } = options
  const [status, setStatus] = useState<ConnectionStatus>(() => websocketClient.getStatus())

  const normalizedHandlers = useMemo(() => createHandlersArray(handlers), [handlers])

  useEffect(() => {
    websocketClient.configure({ autoReconnect })
    if (autoConnect) {
      websocketClient.connect()
    }
  }, [autoConnect, autoReconnect])

  useEffect(() => {
    const unsubscribers = normalizedHandlers.map(({ type, handler }) =>
      websocketClient.subscribe(type, handler)
    )

    return () => {
      unsubscribers.forEach(unsub => unsub())
    }
  }, [normalizedHandlers])

  useEffect(() => {
    const unsubscribe = websocketClient.onStatusChange(nextStatus => {
      setStatus(nextStatus)
      onStatusChange?.(nextStatus)
    })

    return () => {
      unsubscribe()
    }
  }, [onStatusChange])

  const send = useCallback(<TPayload,>(type: RealTimeEventType, payload: TPayload) => {
    // TODO: Implement generic send method in WebSocketClient
    console.warn('WebSocket send not yet implemented:', type, payload)
  }, [])

  const connect = useCallback(() => {
    websocketClient.connect()
  }, [])

  const disconnect = useCallback(() => {
    websocketClient.disconnect()
  }, [])

  return {
    status,
    send,
    connect,
    disconnect,
  }
}

export type { RealTimeEvent }
