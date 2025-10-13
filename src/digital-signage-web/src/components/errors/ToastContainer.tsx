// ToastContainer component for displaying toast notifications
// Manages multiple toast notifications with proper positioning and animations

'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { ToastContainerProps, ToastPosition } from '@/types/errors';
import { ErrorToast } from './ErrorToast';

/**
 * Container position styles mapping
 */
const POSITION_STYLES: Record<ToastPosition, string> = {
  'top-right': 'fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full',
  'top-left': 'fixed top-4 left-4 z-50 flex flex-col gap-2 max-w-sm w-full',
  'bottom-right': 'fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 max-w-sm w-full',
  'bottom-left': 'fixed bottom-4 left-4 z-50 flex flex-col-reverse gap-2 max-w-sm w-full',
};

/**
 * ToastContainer component for managing multiple toast notifications
 */
export function ToastContainer({
  notifications,
  position = 'top-right',
  maxVisible = 5,
  groupSimilar = true,
  onDismiss,
  onDismissAll,
}: ToastContainerProps) {
  // Group similar notifications if enabled
  const processedNotifications = React.useMemo(() => {
    if (!groupSimilar) {
      return notifications.slice(0, maxVisible);
    }

    // Group similar notifications by message and type
    const grouped = notifications.reduce((acc, notification) => {
      const key = `${notification.type}-${notification.message}`;
      
      if (!acc[key]) {
        acc[key] = {
          ...notification,
          count: 1,
          ids: [notification.id],
        };
      } else {
        acc[key].count += 1;
        acc[key].ids.push(notification.id);
        // Use the most recent timestamp
        if (notification.timestamp > acc[key].timestamp) {
          acc[key].timestamp = notification.timestamp;
        }
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).slice(0, maxVisible);
  }, [notifications, groupSimilar, maxVisible]);

  // Handle dismiss with support for grouped notifications
  const handleDismiss = React.useCallback((id: string) => {
    const notification = processedNotifications.find(n => 
      n.id === id || (n.ids && n.ids.includes(id))
    );
    
    if (notification?.ids && notification.ids.length > 1) {
      // Dismiss all grouped notifications
      notification.ids.forEach((groupedId: string) => onDismiss(groupedId));
    } else {
      onDismiss(id);
    }
  }, [processedNotifications, onDismiss]);

  // Auto-dismiss non-persistent notifications
  React.useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    processedNotifications.forEach(notification => {
      if (!notification.persistent && notification.duration && notification.duration > 0) {
        const timeout = setTimeout(() => {
          handleDismiss(notification.id);
        }, notification.duration);
        
        timeouts.push(timeout);
      }
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [processedNotifications, handleDismiss]);

  // Don't render if no notifications
  if (processedNotifications.length === 0) {
    return null;
  }

  return (
    <div className={POSITION_STYLES[position]} role="region" aria-label="Notifications">
      {/* Dismiss all button when multiple notifications */}
      {processedNotifications.length > 1 && (
        <div className="flex justify-end mb-2">
          <button
            onClick={onDismissAll}
            className="text-xs text-gray-500 hover:text-gray-700 bg-white/80 backdrop-blur-sm rounded px-2 py-1 shadow-sm border border-gray-200"
            aria-label="Dismiss all notifications"
          >
            Dismiss All ({processedNotifications.length})
          </button>
        </div>
      )}

      {/* Render notifications */}
      {processedNotifications.map((notification) => (
        <div
          key={notification.id}
          className="transform transition-all duration-300 ease-in-out animate-in slide-in-from-right-full"
        >
          <ErrorToast
            notification={notification}
            onDismiss={() => handleDismiss(notification.id)}
            showCount={notification.count > 1}
            count={notification.count}
          />
        </div>
      ))}

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {processedNotifications.map(notification => (
          <div key={`announce-${notification.id}`}>
            {notification.type}: {notification.message}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Hook for managing toast container state
 */
export function useToastContainer(maxVisible = 5) {
  const [notifications, setNotifications] = React.useState<any[]>([]);

  const addNotification = React.useCallback((notification: any) => {
    setNotifications(prev => [
      ...prev.slice(-(maxVisible - 1)), // Keep only the most recent
      {
        ...notification,
        id: notification.id || `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: notification.timestamp || new Date().toISOString(),
      }
    ]);
  }, [maxVisible]);

  const dismissNotification = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const dismissAllNotifications = React.useCallback(() => {
    setNotifications([]);
  }, []);

  const clearNotifications = React.useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    dismissNotification,
    dismissAllNotifications,
    clearNotifications,
  };
}

/**
 * Portal-based ToastContainer for rendering outside component tree
 */
export function ToastPortal(props: ToastContainerProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || typeof window === 'undefined') {
    return null;
  }

  // Create portal container if it doesn't exist
  let portalContainer = document.getElementById('toast-portal');
  if (!portalContainer) {
    portalContainer = document.createElement('div');
    portalContainer.id = 'toast-portal';
    portalContainer.setAttribute('aria-live', 'polite');
    portalContainer.setAttribute('aria-atomic', 'false');
    document.body.appendChild(portalContainer);
  }

  return createPortal(
    <ToastContainer {...props} />,
    portalContainer
  );
}

/**
 * Simple toast notification system for basic use cases
 */
export function SimpleToastContainer() {
  const {
    notifications,
    dismissNotification,
    dismissAllNotifications,
  } = useToastContainer();

  return (
    <ToastContainer
      notifications={notifications}
      onDismiss={dismissNotification}
      onDismissAll={dismissAllNotifications}
      position="top-right"
      maxVisible={3}
      groupSimilar={true}
    />
  );
}