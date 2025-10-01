'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Toast } from './Toast'
import type { RootState } from '@/store'
import { removeNotification } from '@/store/slices/uiSlice'
import type { Notification as UINotification } from '@/store/slices/uiSlice'

const DEFAULT_DURATIONS: Record<UINotification['type'], number> = {
  success: 5000,
  info: 5000,
  warning: 8000,
  error: 12000,
}

interface NotificationCenterProps {
  maxVisible?: number
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

const POSITION_CLASS_MAP: Record<NonNullable<NotificationCenterProps['position']>, string> = {
  'top-left': 'left-4 top-4 items-start',
  'top-right': 'right-4 top-4 items-end',
  'bottom-left': 'left-4 bottom-4 items-start',
  'bottom-right': 'right-4 bottom-4 items-end',
}

/**
 * NotificationCenter renders toast notifications using a React portal
 */
export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  maxVisible = 4,
  position = 'top-right',
}) => {
  const [mounted, setMounted] = useState(false)
  const dispatch = useDispatch()
  const notifications = useSelector((state: RootState) => state.ui.notifications)
  const timersRef = useRef(new Map<string, number>())

  const hostElement = useMemo(() => {
    if (typeof document === 'undefined') return null
    return document.getElementById('notification-root') ?? document.body
  }, [])

  // Manage lifecycle for SSR compatibility
  useEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
      timersRef.current.forEach(timer => window.clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [])

  // Setup timers for auto-dismiss behaviour
  useEffect(() => {
    if (!mounted) return

    const activeIds = new Set(notifications.map(notification => notification.id))

    // Clear timers for notifications that have been removed
    timersRef.current.forEach((timer, id) => {
      if (!activeIds.has(id)) {
        window.clearTimeout(timer)
        timersRef.current.delete(id)
      }
    })

    notifications.forEach(notification => {
      if (timersRef.current.has(notification.id)) {
        return
      }

      const duration = notification.duration ?? DEFAULT_DURATIONS[notification.type]
      if (duration == null || duration === 0) {
        return
      }

      const timer = window.setTimeout(() => {
        dispatch(removeNotification(notification.id))
        timersRef.current.delete(notification.id)
      }, duration)

      timersRef.current.set(notification.id, timer)
    })
  }, [dispatch, notifications, mounted])

  const visibleNotifications = notifications.slice(0, maxVisible)

  if (!mounted || !hostElement) {
    return null
  }

  return createPortal(
    <div
      className={`pointer-events-none fixed z-50 flex w-full max-w-md flex-col gap-3 ${POSITION_CLASS_MAP[position]}`}
      role="region"
      aria-live="polite"
      aria-label="Application notifications"
    >
      {visibleNotifications.map(notification => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={(id) => dispatch(removeNotification(id))}
        />
      ))}
    </div>,
    hostElement
  )
}

NotificationCenter.displayName = 'NotificationCenter'

export default NotificationCenter
