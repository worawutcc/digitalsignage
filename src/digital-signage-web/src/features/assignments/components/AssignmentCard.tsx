/**
 * @fileoverview Assignment Card Component
 * @description Card component for displaying assignments in list or grid view
 */

'use client';

import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Assignment, AssignmentType, AssignmentStatus as AssignmentStatusEnum, AssignmentTargetType } from '../types/assignment.types';
import { AssignmentStatus } from './AssignmentStatus';
import { AssignmentPriority } from './AssignmentPriority';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import {
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Monitor,
  Users,
  PlaySquare,
  Image,
  Radio,
} from 'lucide-react';

export interface AssignmentCardProps {
  /**
   * Assignment data
   */
  assignment: Assignment;
  
  /**
   * Whether card is selected
   * @default false
   */
  selected?: boolean;
  
  /**
   * View mode
   * @default 'list'
   */
  viewMode?: 'list' | 'grid';
  
  /**
   * Show checkbox for bulk selection
   * @default false
   */
  showCheckbox?: boolean;
  
  /**
   * Callback when card is selected/deselected
   */
  onSelect?: (id: number, selected: boolean) => void;
  
  /**
   * Callback when edit button clicked
   */
  onEdit?: (id: number) => void;
  
  /**
   * Callback when delete button clicked
   */
  onDelete?: (id: number) => void;
  
  /**
   * Callback when view details clicked
   */
  onViewDetails?: (id: number) => void;
  
  /**
   * Callback when card is clicked (excluding actions)
   */
  onClick?: (id: number) => void;
  
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
 * Format date to readable string
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

/**
 * Format relative time (e.g. "2 hours ago")
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(dateString);
}

/**
 * Get content type icon
 */
function getContentTypeIcon(type: AssignmentType) {
  switch (type) {
    case AssignmentType.Schedule:
      return Calendar;
    case AssignmentType.Playlist:
      return PlaySquare;
    case AssignmentType.Media:
      return Image;
    case AssignmentType.Emergency:
      return Radio;
    default:
      return PlaySquare;
  }
}

/**
 * Get target type display
 */
function getTargetTypeDisplay(assignment: Assignment) {
  const isGroup = assignment.targetType === AssignmentTargetType.DeviceGroup;
  const Icon = isGroup ? Users : Monitor;
  const label = isGroup ? 'Group' : 'Device';
  
  return { Icon, label };
}

/**
 * Format date range
 */
function formatDateRange(startDate: string, endDate?: string | null): string {
  const start = formatDate(startDate);
  
  if (endDate) {
    const end = formatDate(endDate);
    return `${start} - ${end}`;
  }
  
  return `From ${start}`;
}

/**
 * AssignmentCard component
 * 
 * Displays assignment information in a card format with actions.
 * Supports both list and grid view modes.
 * 
 * @example
 * ```tsx
 * // List view
 * <AssignmentCard
 *   assignment={assignment}
 *   viewMode="list"
 *   onEdit={(id) => console.log('Edit', id)}
 *   onDelete={(id) => console.log('Delete', id)}
 * />
 * 
 * // Grid view with selection
 * <AssignmentCard
 *   assignment={assignment}
 *   viewMode="grid"
 *   selected={true}
 *   showCheckbox
 *   onSelect={(id, selected) => console.log('Select', id, selected)}
 * />
 * ```
 */
export function AssignmentCard({
  assignment,
  selected = false,
  viewMode = 'list',
  showCheckbox = false,
  onSelect,
  onEdit,
  onDelete,
  onViewDetails,
  onClick,
  className,
  'data-testid': testId,
}: AssignmentCardProps) {
  const ContentIcon = getContentTypeIcon(assignment.assignmentType);
  const { Icon: TargetIcon, label: targetLabel } = getTargetTypeDisplay(assignment);
  
  const isEmergency = assignment.isEmergencyBroadcast;
  const isGridView = viewMode === 'grid';

  // Handle checkbox change
  const handleCheckboxChange = useCallback(
    (checked: boolean) => {
      onSelect?.(assignment.id, checked);
    },
    [assignment.id, onSelect]
  );

  // Handle card click (excluding actions)
  const handleCardClick = useCallback(() => {
    if (!onClick) return;
    onClick(assignment.id);
  }, [assignment.id, onClick]);

  // Action handlers
  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit?.(assignment.id);
    },
    [assignment.id, onEdit]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete?.(assignment.id);
    },
    [assignment.id, onDelete]
  );

  const handleViewDetails = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onViewDetails?.(assignment.id);
    },
    [assignment.id, onViewDetails]
  );

  return (
    <div
      data-testid={testId || `assignment-card-${assignment.id}`}
      data-selected={selected}
      className={cn(
        'group relative bg-white dark:bg-gray-800 rounded-lg border transition-all duration-200',
        'hover:shadow-md hover:border-gray-400 dark:hover:border-gray-600',
        
        // Selected state
        selected
          ? 'border-blue-500 dark:border-blue-400 shadow-sm'
          : 'border-gray-200 dark:border-gray-700',
        
        // Emergency highlight
        isEmergency && !selected && 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950',
        
        // Cursor
        onClick && 'cursor-pointer',
        
        // Layout
        isGridView ? 'p-4' : 'p-4',
        
        className
      )}
      onClick={handleCardClick}
      role="article"
      aria-label={`Assignment: ${assignment.contentName}`}
    >
      {/* Header */}
      <div className={cn('flex items-start gap-3', isGridView ? 'flex-col' : 'flex-row')}>
        {/* Checkbox */}
        {showCheckbox && (
          <div 
            className="flex-shrink-0 pt-1"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <Checkbox
              checked={selected}
              onChange={handleCheckboxChange}
              aria-label={`Select ${assignment.contentName}`}
            />
          </div>
        )}

        {/* Content Icon */}
        <div
          className={cn(
            'flex-shrink-0 rounded-lg p-2 transition-colors',
            isEmergency
              ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          )}
        >
          <ContentIcon className="w-5 h-5" aria-hidden="true" />
        </div>

        {/* Main Content */}
        <div className={cn('flex-1 min-w-0', isGridView && 'w-full')}>
          {/* Title & Type */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                {assignment.contentName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {AssignmentType[assignment.assignmentType]}
                {isEmergency && ' 🚨'}
              </p>
            </div>
            
            {!isGridView && (
              <AssignmentStatus
                status={assignment.status}
                animated={assignment.status === AssignmentStatusEnum.Active}
                size="sm"
              />
            )}
          </div>

          {/* Target Info */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <TargetIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">
              {targetLabel}: {assignment.targetName}
            </span>
          </div>

          {/* Metadata Row */}
          <div
            className={cn(
              'flex gap-3',
              isGridView ? 'flex-col gap-2' : 'flex-row items-center flex-wrap'
            )}
          >
            {/* Priority */}
            <div className="flex items-center gap-1.5">
              <AssignmentPriority priority={assignment.priority} size="sm" showLabel />
            </div>

            {/* Status (grid view only) */}
            {isGridView && (
              <AssignmentStatus
                status={assignment.status}
                animated={assignment.status === AssignmentStatusEnum.Active}
                size="sm"
              />
            )}

            {/* Date Range */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">
                {formatDateRange(assignment.startDate, assignment.endDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        className={cn(
          'flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700',
          'opacity-0 group-hover:opacity-100 transition-opacity'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {onViewDetails && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewDetails}
            aria-label="View details"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
            <span className="ml-1.5 text-xs">Details</span>
          </Button>
        )}
        
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            aria-label="Edit assignment"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
            <span className="ml-1.5 text-xs">Edit</span>
          </Button>
        )}
        
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
            aria-label="Delete assignment"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
            <span className="ml-1.5 text-xs">Delete</span>
          </Button>
        )}
      </div>

      {/* Updated indicator (bottom right) */}
      {assignment.updatedAt && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
          Updated {formatRelativeTime(assignment.updatedAt)}
        </div>
      )}
    </div>
  );
}

/**
 * AssignmentCardSkeleton - Loading skeleton
 * 
 * @example
 * ```tsx
 * <AssignmentCardSkeleton viewMode="list" />
 * ```
 */
export function AssignmentCardSkeleton({
  viewMode = 'list',
  className,
}: {
  viewMode?: 'list' | 'grid';
  className?: string;
}) {
  const isGridView = viewMode === 'grid';

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
        isGridView ? 'p-4' : 'p-4',
        'animate-pulse',
        className
      )}
      role="status"
      aria-label="Loading assignment"
    >
      <div className={cn('flex items-start gap-3', isGridView ? 'flex-col' : 'flex-row')}>
        {/* Icon skeleton */}
        <div className="flex-shrink-0 w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />

        {/* Content skeleton */}
        <div className={cn('flex-1 min-w-0 space-y-3', isGridView && 'w-full')}>
          {/* Title */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>

          {/* Target */}
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />

          {/* Metadata */}
          <div className="flex gap-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssignmentCard;
