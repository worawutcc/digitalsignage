'use client'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from '@/hooks/useWebSocket'
import type { AppDispatch } from '@/store'
import {
  devicesActions,
  type Device,
} from '@/store/slices/devicesSlice'
import { addNotification } from '@/store/slices/uiSlice'
import { scheduleKeys } from '@/features/schedules/hooks/useSchedules'
import type { ConnectionStatus, EventHandler } from '@/lib/websocket'

interface DeviceStatusPayload {
  deviceId: string
  status: Device['status']
  lastSeen: string
  scheduleId?: string | null
}

interface ScheduleConflictPayload {
  conflictId: string
  scheduleId: string
  scheduleName: string
  devices: string[]
  severity: 'info' | 'warning' | 'error'
  message: string
  suggestion?: string
}

const CONNECTION_NOTIFICATIONS: Partial<Record<ConnectionStatus, { type: 'info' | 'error'; message: string }>> = {
  error: {
    type: 'error',
    message: 'Real-time connection lost. Attempting to reconnect…',
  },
  open: {
    type: 'info',
    message: 'Real-time updates connected',
  },
}

/**
 * RealTimeEventsClient wires WebSocket events into Redux and React Query caches
 */
export const RealTimeEventsClient = () => {
  const dispatch = useDispatch<AppDispatch>()
  const queryClient = useQueryClient()

  const { status } = useWebSocket(
    {
      device_status_changed: ((payload: DeviceStatusPayload) => {
        dispatch(
          devicesActions.updateDeviceHeartbeat({
            deviceId: payload.deviceId,
            status: payload.status,
            lastSeen: payload.lastSeen,
          })
        )

        dispatch(
          addNotification({
            type: payload.status === 'online' ? 'success' : payload.status === 'maintenance' ? 'warning' : 'error',
            title: payload.status === 'online' ? 'Device online' : 'Device status changed',
            message:
              payload.status === 'online'
                ? `Device ${payload.deviceId} reconnected`
                : `Device ${payload.deviceId} is now ${payload.status}`,
          })
        )

        queryClient.invalidateQueries({ queryKey: scheduleKeys.forDevice(payload.deviceId) })
        queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      }) as EventHandler,
      schedule_conflict_detected: ((payload: ScheduleConflictPayload) => {
        const baseNotification = {
          type: payload.severity === 'error' ? 'error' : 'warning',
          title: 'Schedule conflict detected',
          message: payload.message,
        } as const

        dispatch(
          addNotification({
            ...baseNotification,
            ...(payload.severity === 'error' ? { duration: 15000 } : {}),
          })
        )

        queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
        queryClient.invalidateQueries({ queryKey: scheduleKeys.stats() })
      }) as EventHandler,
    },
    {
      autoConnect: false, // Disable autoConnect to prevent SSR issues
      autoReconnect: true,
    }
  )

  useEffect(() => {
    const notification = CONNECTION_NOTIFICATIONS[status]
    if (!notification) return

    dispatch(
      addNotification({
        type: notification.type,
        title: notification.type === 'error' ? 'Connection issue' : 'Connection restored',
        message: notification.message,
      })
    )
  }, [dispatch, status])

  return null
}

RealTimeEventsClient.displayName = 'RealTimeEventsClient'

export default RealTimeEventsClient
