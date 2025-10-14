'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * Touch-Friendly Components
 * Mobile-optimized interactions following iOS/Android design patterns
 */

// ================================
// TOUCH GESTURE HOOKS
// ================================

interface TouchGestureState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  direction: 'left' | 'right' | 'up' | 'down' | null;
}

export function useTouchGestures() {
  const [gestureState, setGestureState] = useState<TouchGestureState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    direction: null
  });

  const [isActive, setIsActive] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    
    setGestureState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      direction: null
    });
    setIsActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isActive) return;
    
    const touch = e.touches[0];
    if (!touch) return;
    
    const deltaX = touch.clientX - gestureState.startX;
    const deltaY = touch.clientY - gestureState.startY;
    
    // Determine swipe direction
    let direction: 'left' | 'right' | 'up' | 'down' | null = null;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    setGestureState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX,
      deltaY,
      direction
    }));
  };

  const handleTouchEnd = () => {
    setIsActive(false);
  };

  return {
    gestureState,
    isActive,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
}

// ================================
// SWIPEABLE CARD
// ================================

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeThreshold?: number;
  className?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  swipeThreshold = 100,
  className = '',
  leftAction,
  rightAction
}) => {
  const { gestureState, isActive, touchHandlers } = useTouchGestures();
  const [swipeState, setSwipeState] = useState<'idle' | 'left' | 'right'>('idle');

  useEffect(() => {
    if (!isActive && Math.abs(gestureState.deltaX) > swipeThreshold) {
      if (gestureState.direction === 'left' && onSwipeLeft) {
        onSwipeLeft();
      } else if (gestureState.direction === 'right' && onSwipeRight) {
        onSwipeRight();
      }
    }
  }, [isActive, gestureState, swipeThreshold, onSwipeLeft, onSwipeRight]);

  // Update swipe state for visual feedback
  useEffect(() => {
    if (isActive) {
      if (gestureState.deltaX < -50) {
        setSwipeState('left');
      } else if (gestureState.deltaX > 50) {
        setSwipeState('right');
      } else {
        setSwipeState('idle');
      }
    } else {
      setSwipeState('idle');
    }
  }, [isActive, gestureState.deltaX]);

  return (
    <div className="relative overflow-hidden">
      {/* Background actions */}
      {leftAction && (
        <div className={cn(
          'absolute inset-y-0 left-0 flex items-center justify-start px-4',
          'bg-green-500 text-white transform transition-transform duration-200',
          swipeState === 'right' ? 'translate-x-0' : '-translate-x-full'
        )}>
          {leftAction}
        </div>
      )}
      
      {rightAction && (
        <div className={cn(
          'absolute inset-y-0 right-0 flex items-center justify-end px-4',
          'bg-red-500 text-white transform transition-transform duration-200',
          swipeState === 'left' ? 'translate-x-0' : 'translate-x-full'
        )}>
          {rightAction}
        </div>
      )}

      {/* Main content */}
      <div
        {...touchHandlers}
        className={cn(
          'relative bg-white transform transition-transform duration-200',
          isActive && 'z-10',
          className
        )}
        style={{
          transform: isActive ? `translateX(${gestureState.deltaX * 0.8}px)` : 'translateX(0)'
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ================================
// TOUCH-FRIENDLY BUTTON
// ================================

interface TouchButtonProps {
  children: React.ReactNode;
  onClick?: (() => void) | undefined;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  haptic?: boolean; // Trigger haptic feedback on touch
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  haptic = false
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => {
    if (!disabled && !loading) {
      setIsPressed(true);
      
      // Haptic feedback (if supported)
      if (haptic && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  const handleClick = () => {
    if (!disabled && !loading) {
      onClick?.();
    }
  };

  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium rounded-lg',
    'transition-all duration-200 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'touch-manipulation select-none', // Optimize for touch
    'active:scale-95', // Touch feedback
    isPressed && 'scale-95',
    disabled && 'opacity-50 cursor-not-allowed',
    loading && 'cursor-wait'
  );

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 active:bg-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[2.5rem]', // 40px minimum touch target
    md: 'px-6 py-3 text-base min-h-[3rem]',  // 48px minimum touch target
    lg: 'px-8 py-4 text-lg min-h-[3.5rem]'   // 56px minimum touch target
  };

  return (
    <button
      type="button"
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

// ================================
// PULL-TO-REFRESH
// ================================

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
  refreshThreshold?: number;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshThreshold = 80,
  className = ''
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const { gestureState, isActive, touchHandlers } = useTouchGestures();

  useEffect(() => {
    if (isActive && gestureState.direction === 'down') {
      const distance = Math.max(0, gestureState.deltaY);
      setPullDistance(Math.min(distance, refreshThreshold * 1.5));
      setIsPulling(true);
    } else if (!isActive && isPulling) {
      if (pullDistance >= refreshThreshold && onRefresh) {
        setIsRefreshing(true);
        onRefresh().finally(() => {
          setIsRefreshing(false);
          setPullDistance(0);
          setIsPulling(false);
        });
      } else {
        setPullDistance(0);
        setIsPulling(false);
      }
    }
  }, [isActive, gestureState, isPulling, pullDistance, refreshThreshold, onRefresh]);

  const refreshProgress = Math.min(pullDistance / refreshThreshold, 1);
  const shouldRefresh = pullDistance >= refreshThreshold;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Pull indicator */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 flex items-center justify-center',
          'bg-gray-50 border-b transition-all duration-200',
          isPulling ? 'opacity-100' : 'opacity-0'
        )}
        style={{ height: Math.min(pullDistance, refreshThreshold) }}
      >
        <div className="flex items-center space-x-2 text-gray-600">
          {isRefreshing ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm">Refreshing...</span>
            </>
          ) : (
            <>
              <svg
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  shouldRefresh && 'rotate-180'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span className="text-sm">
                {shouldRefresh ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        {...touchHandlers}
        className={cn('transition-transform duration-200')}
        style={{
          transform: isPulling ? `translateY(${Math.min(pullDistance, refreshThreshold)}px)` : 'translateY(0)'
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ================================
// FLOATING ACTION BUTTON
// ================================

interface FloatingActionButtonProps {
  onClick?: (() => void) | undefined;
  icon: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon,
  label,
  position = 'bottom-right',
  size = 'md',
  className = ''
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2'
  };

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };

  return (
    <TouchButton
      onClick={onClick}
      className={cn(
        'fixed z-50 rounded-full shadow-lg',
        'bg-blue-600 text-white hover:bg-blue-700',
        'focus:ring-4 focus:ring-blue-300',
        positionClasses[position],
        sizeClasses[size],
        className
      )}
      haptic
    >
      <span className="sr-only">{label}</span>
      {icon}
    </TouchButton>
  );
};

export default {
  useTouchGestures,
  SwipeableCard,
  TouchButton,
  PullToRefresh,
  FloatingActionButton
};