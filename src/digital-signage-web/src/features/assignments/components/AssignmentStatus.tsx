/**
 * @fileoverview Assignment Status Badge Component
 * @description Status indicator badge for assignment status with color coding
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { AssignmentStatus as AssignmentStatusEnum } from '../types/assignment.types';
import {
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  Pause,
  Ban,
  AlertTriangle,
} from 'lucide-react';

export interface AssignmentStatusProps {
  /**
   * Assignment status (string from API)
   */
  status: string;
  
  /**
   * Badge size variant
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Show animated pulse for active status
   * @default false
   */
  animated?: boolean;
  
  /**
   * Show icon
   * @default true
   */
  showIcon?: boolean;
  
  /**
   * Custom label (overrides default)
   */
  label?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Test ID for testing
   */
  'data-testid'?: string;
}

/**
 * Status configuration mapping (using string keys from API)
 */
const STATUS_CONFIG: Record<string, {
  label: string;
  icon: React.ComponentType<any>;
  className: string;
  darkClassName: string;
  dotClassName: string;
  animated: boolean;
}> = {
  'Draft': {
    label: 'Draft',
    icon: Clock,
    className: 'bg-gray-100 text-gray-700 border-gray-300',
    darkClassName: 'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
    dotClassName: 'bg-gray-500',
    animated: false,
  },
  'Scheduled': {
    label: 'Scheduled',
    icon: Clock,
    className: 'bg-blue-100 text-blue-700 border-blue-300',
    darkClassName: 'dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700',
    dotClassName: 'bg-blue-500',
    animated: false,
  },
  'Active': {
    label: 'Active',
    icon: Play,
    className: 'bg-green-100 text-green-700 border-green-300',
    darkClassName: 'dark:bg-green-900 dark:text-green-300 dark:border-green-700',
    dotClassName: 'bg-green-500',
    animated: true,
  },
  'Expired': {
    label: 'Expired',
    icon: XCircle,
    className: 'bg-red-100 text-red-700 border-red-300',
    darkClassName: 'dark:bg-red-900 dark:text-red-300 dark:border-red-700',
    dotClassName: 'bg-red-500',
    animated: false,
  },
  'Paused': {
    label: 'Paused',
    icon: Pause,
    className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    darkClassName: 'dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700',
    dotClassName: 'bg-yellow-500',
    animated: false,
  },
  'Cancelled': {
    label: 'Cancelled',
    icon: Ban,
    className: 'bg-gray-100 text-gray-700 border-gray-300',
    darkClassName: 'dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600',
    dotClassName: 'bg-gray-500',
    animated: false,
  },
};

/**
 * Size configuration
 */
const SIZE_CONFIG = {
  sm: {
    container: 'px-2 py-0.5 text-xs gap-1',
    icon: 'w-3 h-3',
    dot: 'w-1.5 h-1.5',
  },
  md: {
    container: 'px-2.5 py-1 text-sm gap-1.5',
    icon: 'w-3.5 h-3.5',
    dot: 'w-2 h-2',
  },
  lg: {
    container: 'px-3 py-1.5 text-base gap-2',
    icon: 'w-4 h-4',
    dot: 'w-2.5 h-2.5',
  },
} as const;

/**
 * AssignmentStatus component
 * 
 * Displays assignment status with appropriate color coding and optional icon.
 * Supports animations for active status and responsive sizing.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <AssignmentStatus status={AssignmentStatus.Active} />
 * 
 * // With animation
 * <AssignmentStatus status={AssignmentStatus.Active} animated />
 * 
 * // Custom size
 * <AssignmentStatus status={AssignmentStatus.Draft} size="lg" />
 * 
 * // Without icon
 * <AssignmentStatus status={AssignmentStatus.Scheduled} showIcon={false} />
 * 
 * // Custom label
 * <AssignmentStatus status={AssignmentStatus.Paused} label="On Hold" />
 * ```
 */
export function AssignmentStatus({
  status,
  size = 'md',
  animated = false,
  showIcon = true,
  label,
  className,
  'data-testid': testId,
}: AssignmentStatusProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['Draft']!; // Fallback to Draft
  const sizeConfig = SIZE_CONFIG[size];
  
  if (!STATUS_CONFIG[status]) {
    console.warn(`Unknown assignment status: ${status}, falling back to Draft`);
  }

  const Icon = config.icon;
  const displayLabel = label || config.label;
  const shouldAnimate = animated && config.animated;

  return (
    <span
      data-testid={testId || `assignment-status-${status}`}
      className={cn(
        // Base styles
        'inline-flex items-center font-medium rounded-full border transition-colors',
        sizeConfig.container,
        
        // Status colors
        config.className,
        config.darkClassName,
        
        // Custom classes
        className
      )}
      role="status"
      aria-label={`Status: ${displayLabel}`}
    >
      {showIcon && (
        <>
          {/* Animated dot for active status */}
          {shouldAnimate ? (
            <span className="relative flex items-center justify-center">
              <span
                className={cn(
                  'absolute rounded-full opacity-75 animate-ping',
                  sizeConfig.dot,
                  config.dotClassName
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  'relative rounded-full',
                  sizeConfig.dot,
                  config.dotClassName
                )}
                aria-hidden="true"
              />
            </span>
          ) : (
            /* Static icon for other statuses */
            <Icon
              className={cn(sizeConfig.icon, 'flex-shrink-0')}
              aria-hidden="true"
            />
          )}
        </>
      )}
      
      <span className="font-medium">{displayLabel}</span>
    </span>
  );
}

/**
 * Assignment Status Dot (compact version)
 * 
 * Minimal status indicator showing only a colored dot
 * 
 * @example
 * ```tsx
 * <AssignmentStatusDot status={AssignmentStatus.Active} />
 * ```
 */
export function AssignmentStatusDot({
  status,
  size = 'md',
  animated = false,
  className,
  'data-testid': testId,
}: Omit<AssignmentStatusProps, 'showIcon' | 'label'>) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['Draft']!;
  const sizeConfig = SIZE_CONFIG[size];
  
  const shouldAnimate = animated && config.animated;

  return (
    <span
      data-testid={testId || `assignment-status-dot-${status}`}
      className={cn('relative inline-flex items-center justify-center', className)}
      role="status"
      aria-label={`Status: ${config.label}`}
      title={config.label}
    >
      {shouldAnimate ? (
        <>
          <span
            className={cn(
              'absolute rounded-full opacity-75 animate-ping',
              sizeConfig.dot,
              config.dotClassName
            )}
            aria-hidden="true"
          />
          <span
            className={cn(
              'relative rounded-full',
              sizeConfig.dot,
              config.dotClassName
            )}
            aria-hidden="true"
          />
        </>
      ) : (
        <span
          className={cn(
            'rounded-full',
            sizeConfig.dot,
            config.dotClassName
          )}
          aria-hidden="true"
        />
      )}
    </span>
  );
}

/**
 * Get status variant class name for external use
 */
export function getAssignmentStatusVariant(status: AssignmentStatusEnum): {
  className: string;
  darkClassName: string;
  label: string;
} {
  const config = STATUS_CONFIG[status];
  
  if (!config) {
    return {
      className: 'bg-gray-100 text-gray-700 border-gray-300',
      darkClassName: 'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
      label: 'Unknown',
    };
  }

  return {
    className: config.className,
    darkClassName: config.darkClassName,
    label: config.label,
  };
}

export default AssignmentStatus;
