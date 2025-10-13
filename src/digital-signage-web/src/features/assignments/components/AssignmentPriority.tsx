/**
 * @fileoverview Assignment Priority Component
 * @description Priority display and editor with 1-10 scale and visual indicators
 */

'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, Minus } from 'lucide-react';

export interface AssignmentPriorityProps {
  /**
   * Priority value (1-10)
   */
  priority: number;
  
  /**
   * Enable editing mode with slider
   * @default false
   */
  editable?: boolean;
  
  /**
   * Callback when priority changes (editable mode only)
   */
  onChange?: (priority: number) => void;
  
  /**
   * Badge size variant
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Show numeric label
   * @default true
   */
  showLabel?: boolean;
  
  /**
   * Show priority level text (Low/Medium/High)
   * @default false
   */
  showLevel?: boolean;
  
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
 * Priority level configuration
 */
export type PriorityLevel = 'low' | 'medium' | 'high';

export interface PriorityConfig {
  level: PriorityLevel;
  label: string;
  icon: typeof ChevronUp | typeof ChevronDown | typeof Minus;
  className: string;
  darkClassName: string;
  barClassName: string;
}

/**
 * Get priority level from numeric value
 */
export function getPriorityLevel(priority: number): PriorityLevel {
  if (priority >= 1 && priority <= 3) return 'low';
  if (priority >= 4 && priority <= 7) return 'medium';
  if (priority >= 8 && priority <= 10) return 'high';
  return 'medium'; // fallback
}

/**
 * Priority level configuration
 */
const PRIORITY_LEVELS: Record<PriorityLevel, PriorityConfig> = {
  low: {
    level: 'low',
    label: 'Low',
    icon: ChevronDown,
    className: 'bg-blue-100 text-blue-700 border-blue-300',
    darkClassName: 'dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700',
    barClassName: 'bg-blue-500',
  },
  medium: {
    level: 'medium',
    label: 'Medium',
    icon: Minus,
    className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    darkClassName: 'dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700',
    barClassName: 'bg-yellow-500',
  },
  high: {
    level: 'high',
    label: 'High',
    icon: ChevronUp,
    className: 'bg-red-100 text-red-700 border-red-300',
    darkClassName: 'dark:bg-red-900 dark:text-red-300 dark:border-red-700',
    barClassName: 'bg-red-500',
  },
};

/**
 * Size configuration
 */
const SIZE_CONFIG = {
  sm: {
    badge: 'px-2 py-0.5 text-xs gap-1',
    icon: 'w-3 h-3',
    slider: 'h-1.5',
    thumb: 'w-3 h-3',
  },
  md: {
    badge: 'px-2.5 py-1 text-sm gap-1.5',
    icon: 'w-3.5 h-3.5',
    slider: 'h-2',
    thumb: 'w-4 h-4',
  },
  lg: {
    badge: 'px-3 py-1.5 text-base gap-2',
    icon: 'w-4 h-4',
    slider: 'h-2.5',
    thumb: 'w-5 h-5',
  },
} as const;

/**
 * AssignmentPriority component
 * 
 * Displays assignment priority with visual indicators (1-10 scale).
 * Supports both display and editable modes with slider.
 * 
 * Priority Levels:
 * - Low (1-3): Blue
 * - Medium (4-7): Yellow
 * - High (8-10): Red
 * 
 * @example
 * ```tsx
 * // Display mode
 * <AssignmentPriority priority={5} />
 * 
 * // With level text
 * <AssignmentPriority priority={8} showLevel />
 * 
 * // Editable mode
 * <AssignmentPriority
 *   priority={5}
 *   editable
 *   onChange={(value) => console.log('Priority:', value)}
 * />
 * 
 * // Custom size
 * <AssignmentPriority priority={3} size="lg" />
 * ```
 */
export function AssignmentPriority({
  priority: initialPriority,
  editable = false,
  onChange,
  size = 'md',
  showLabel = true,
  showLevel = false,
  className,
  'data-testid': testId,
}: AssignmentPriorityProps) {
  // Local state for slider preview
  const [localPriority, setLocalPriority] = useState(initialPriority);
  
  // Ensure priority is in valid range, default to 5 if invalid
  const priority = Math.min(10, Math.max(1, localPriority || 5));
  const level = getPriorityLevel(priority);
  const config = PRIORITY_LEVELS[level];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  // Handle slider change
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newPriority = parseInt(event.target.value, 10);
    setLocalPriority(newPriority);
    onChange?.(newPriority);
  }, [onChange]);

  // Calculate slider progress percentage
  const progressPercent = ((priority - 1) / 9) * 100;

  if (editable) {
    return (
      <div
        data-testid={testId || 'assignment-priority-editor'}
        className={cn('flex flex-col gap-2 min-w-[200px]', className)}
      >
        {/* Priority Preview Badge */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'inline-flex items-center font-medium rounded-full border transition-colors',
              sizeConfig.badge,
              config.className,
              config.darkClassName
            )}
            role="status"
            aria-label={`Priority: ${priority} - ${config.label}`}
          >
            <Icon className={cn(sizeConfig.icon, 'flex-shrink-0')} aria-hidden="true" />
            {showLabel && <span className="font-semibold">{priority}</span>}
            {showLevel && <span className="font-medium">{config.label}</span>}
          </span>
          
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Priority: {priority}/10
          </span>
        </div>

        {/* Slider Input */}
        <div className="relative">
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={priority}
            onChange={handleChange}
            className={cn(
              'w-full appearance-none bg-transparent cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              level === 'low' && 'focus:ring-blue-500',
              level === 'medium' && 'focus:ring-yellow-500',
              level === 'high' && 'focus:ring-red-500'
            )}
            style={{
              background: `linear-gradient(to right, 
                ${level === 'low' ? 'rgb(59, 130, 246)' : 
                  level === 'medium' ? 'rgb(234, 179, 8)' : 
                  'rgb(239, 68, 68)'} ${progressPercent}%, 
                rgb(229, 231, 235) ${progressPercent}%
              )`,
            }}
            aria-label="Assignment priority"
            aria-valuemin={1}
            aria-valuemax={10}
            aria-valuenow={priority}
            aria-valuetext={`Priority ${priority} - ${config.label}`}
          />
          
          {/* Priority level markers */}
          <div className="flex justify-between mt-1 px-1">
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              1
            </span>
            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
              5
            </span>
            <span className="text-xs text-red-600 dark:text-red-400 font-medium">
              10
            </span>
          </div>
        </div>

        {/* Level descriptions */}
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Low (1-3)</span>
          <span>Medium (4-7)</span>
          <span>High (8-10)</span>
        </div>
      </div>
    );
  }

  // Display mode (non-editable)
  return (
    <span
      data-testid={testId || 'assignment-priority-badge'}
      className={cn(
        'inline-flex items-center font-medium rounded-full border transition-colors',
        sizeConfig.badge,
        config.className,
        config.darkClassName,
        className
      )}
      role="status"
      aria-label={`Priority: ${priority} - ${config.label}`}
      title={`Priority ${priority}/10 - ${config.label}`}
    >
      <Icon className={cn(sizeConfig.icon, 'flex-shrink-0')} aria-hidden="true" />
      
      {showLabel && (
        <span className="font-semibold">{priority}</span>
      )}
      
      {showLevel && (
        <span className="font-medium">{config.label}</span>
      )}
    </span>
  );
}

/**
 * Priority Bar (compact visual indicator)
 * 
 * Shows priority as a horizontal bar with color coding
 * 
 * @example
 * ```tsx
 * <AssignmentPriorityBar priority={7} />
 * ```
 */
export function AssignmentPriorityBar({
  priority,
  size = 'md',
  showLabel = false,
  className,
  'data-testid': testId,
}: Omit<AssignmentPriorityProps, 'editable' | 'onChange' | 'showLevel'>) {
  const level = getPriorityLevel(priority);
  const config = PRIORITY_LEVELS[level];
  const progressPercent = ((priority - 1) / 9) * 100;

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-2.5' : 'h-2';

  return (
    <div
      data-testid={testId || 'assignment-priority-bar'}
      className={cn('flex items-center gap-2', className)}
      role="progressbar"
      aria-valuenow={priority}
      aria-valuemin={1}
      aria-valuemax={10}
      aria-label={`Priority: ${priority}/10 - ${config.label}`}
    >
      <div className={cn('flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden', heightClass)}>
        <div
          className={cn('h-full transition-all duration-300', config.barClassName)}
          style={{ width: `${progressPercent}%` }}
          aria-hidden="true"
        />
      </div>
      
      {showLabel && (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[3ch]">
          {priority}
        </span>
      )}
    </div>
  );
}

/**
 * Get priority variant class name for external use
 */
export function getAssignmentPriorityVariant(priority: number): PriorityConfig {
  const level = getPriorityLevel(priority);
  return PRIORITY_LEVELS[level];
}

export default AssignmentPriority;
