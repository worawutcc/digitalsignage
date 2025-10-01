'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import {
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  X,
} from 'lucide-react'
import type { Notification as UINotification } from '@/store/slices/uiSlice'

const TYPE_ICON_MAP: Record<UINotification['type'], React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />,
  info: <Info className="h-5 w-5 text-sky-500" aria-hidden="true" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />,
  error: <XCircle className="h-5 w-5 text-rose-500" aria-hidden="true" />,
}

const TYPE_CLASS_MAP: Record<UINotification['type'], string> = {
  success: 'border-emerald-500/30 bg-emerald-50 text-emerald-900 shadow-emerald-200',
  info: 'border-sky-500/30 bg-sky-50 text-sky-900 shadow-sky-200',
  warning: 'border-amber-500/30 bg-amber-50 text-amber-900 shadow-amber-200',
  error: 'border-rose-500/30 bg-rose-50 text-rose-900 shadow-rose-200',
}

export interface ToastProps {
  notification: UINotification
  onClose: (id: string) => void
}

/**
 * Toast component renders a single notification with styling based on severity
 */
export const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  const { id, type, title, message, timestamp } = notification

  return (
    <div
      role="status"
      aria-live={type === 'error' || type === 'warning' ? 'assertive' : 'polite'}
      className={cn(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border shadow-lg transition-all',
        TYPE_CLASS_MAP[type]
      )}
      data-testid={`toast-${id}`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0">{TYPE_ICON_MAP[type]}</div>
        <div className="flex-1 text-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold leading-5">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{message}</p>
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => onClose(id)}
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-base/none text-current transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <time
            dateTime={new Date(timestamp).toISOString()}
            className="mt-2 block text-xs text-muted-foreground/80"
          >
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </time>
        </div>
      </div>
    </div>
  )
}

Toast.displayName = 'Toast'

export default Toast
