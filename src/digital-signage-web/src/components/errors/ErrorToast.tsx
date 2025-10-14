// ErrorToast component for individual toast notifications
// Handles display of success, error, warning, and info messages with proper styling

'use client';

import React from 'react';
import { ToastNotification, ToastType } from '@/types/errors';

/**
 * Props for ErrorToast component
 */
export interface ErrorToastProps {
  notification: ToastNotification;
  onDismiss: () => void;
  showCount?: boolean;
  count?: number;
}

/**
 * Toast type styling configuration
 */
const TOAST_STYLES: Record<ToastType, {
  container: string;
  icon: string;
  iconBg: string;
  iconSvg: React.ReactNode;
}> = {
  error: {
    container: 'bg-white border-l-4 border-red-500 shadow-lg',
    icon: 'text-red-600',
    iconBg: 'bg-red-100',
    iconSvg: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  warning: {
    container: 'bg-white border-l-4 border-yellow-500 shadow-lg',
    icon: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    iconSvg: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
  },
  success: {
    container: 'bg-white border-l-4 border-green-500 shadow-lg',
    icon: 'text-green-600',
    iconBg: 'bg-green-100',
    iconSvg: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  info: {
    container: 'bg-white border-l-4 border-blue-500 shadow-lg',
    icon: 'text-blue-600',
    iconBg: 'bg-blue-100',
    iconSvg: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

/**
 * ErrorToast component for displaying individual toast notifications
 */
export function ErrorToast({ 
  notification, 
  onDismiss, 
  showCount = false, 
  count = 1 
}: ErrorToastProps) {
  const style = TOAST_STYLES[notification.type];
  const [isVisible, setIsVisible] = React.useState(false);
  const [isExiting, setIsExiting] = React.useState(false);

  // Animation handling
  React.useEffect(() => {
    // Enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Handle dismiss with exit animation
  const handleDismiss = React.useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 300); // Match animation duration
  }, [onDismiss]);

  // Auto-dismiss timer
  React.useEffect(() => {
    if (notification.persistent || !notification.duration) {
      return;
    }

    const timer = setTimeout(handleDismiss, notification.duration);
    return () => clearTimeout(timer);
  }, [notification.persistent, notification.duration, handleDismiss]);

  // Progress bar for timed toasts
  const [progress, setProgress] = React.useState(100);
  
  React.useEffect(() => {
    if (notification.persistent || !notification.duration) {
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const duration = notification.duration || 3000;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [notification.duration, notification.persistent]);

  return (
    <div
      className={`
        ${style.container}
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${isExiting ? 'translate-x-full opacity-0 scale-95' : ''}
        max-w-sm w-full relative overflow-hidden rounded-md
      `}
      role="alert"
      aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      {/* Progress bar for timed toasts */}
      {!notification.persistent && notification.duration && (
        <div 
          className="absolute top-0 left-0 h-1 bg-gray-300 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${style.iconBg} flex items-center justify-center`}>
            <div className={style.icon}>
              {style.iconSvg}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title and count */}
            <div className="flex items-center justify-between">
              {notification.title && (
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {notification.title}
                  {showCount && count > 1 && (
                    <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {count}
                    </span>
                  )}
                </h3>
              )}
              
              {/* Dismiss button */}
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 ml-2 p-1 rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                aria-label="Dismiss notification"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Message */}
            <p className="mt-1 text-sm text-gray-700 break-words">
              {notification.message}
            </p>

            {/* Timestamp */}
            <p className="mt-2 text-xs text-gray-500">
              {new Date(notification.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact version of ErrorToast for space-constrained areas
 */
export function CompactErrorToast({ 
  notification, 
  onDismiss 
}: Omit<ErrorToastProps, 'showCount' | 'count'>) {
  const style = TOAST_STYLES[notification.type];

  return (
    <div
      className={`
        ${style.container}
        max-w-xs w-full p-2 rounded-md
        transform transition-all duration-200 ease-in-out
      `}
      role="alert"
      aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex items-center gap-2">
        {/* Compact icon */}
        <div className={`flex-shrink-0 w-5 h-5 rounded-full ${style.iconBg} flex items-center justify-center`}>
          <div className={`${style.icon} scale-75`}>
            {style.iconSvg}
          </div>
        </div>

        {/* Compact message */}
        <p className="flex-1 text-xs text-gray-700 truncate">
          {notification.message}
        </p>

        {/* Compact dismiss */}
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-0.5 rounded text-gray-400 hover:text-gray-600"
          aria-label="Dismiss"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Hook for creating toast notifications with proper formatting
 */
export function useToast() {
  const createToast = React.useCallback((
    type: ToastType,
    message: string,
    options?: {
      title?: string;
      duration?: number;
      persistent?: boolean;
    }
  ): Omit<ToastNotification, 'id' | 'timestamp'> => {
    const toast: Omit<ToastNotification, 'id' | 'timestamp'> = {
      type,
      message,
      duration: options?.duration ?? (type === 'error' ? 5000 : 3000),
      persistent: options?.persistent ?? (type === 'error'),
    };

    if (options?.title) {
      toast.title = options.title;
    }

    return toast;
  }, []);

  const success = React.useCallback((message: string, options?: { title?: string; duration?: number }) =>
    createToast('success', message, { ...options, persistent: false }), [createToast]);

  const error = React.useCallback((message: string, options?: { title?: string; duration?: number; persistent?: boolean }) =>
    createToast('error', message, options), [createToast]);

  const warning = React.useCallback((message: string, options?: { title?: string; duration?: number }) =>
    createToast('warning', message, options), [createToast]);

  const info = React.useCallback((message: string, options?: { title?: string; duration?: number }) =>
    createToast('info', message, { ...options, persistent: false }), [createToast]);

  return {
    success,
    error,
    warning,
    info,
    createToast,
  };
}