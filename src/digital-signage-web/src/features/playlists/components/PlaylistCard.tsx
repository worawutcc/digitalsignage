'use client';

import React, { useState, memo, useCallback } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { 
  Play, 
  Pause, 
  MoreVertical, 
  Eye, 
  Edit, 
  Copy, 
  Trash2, 
  Monitor,
  Calendar,
  Clock,
  Image
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Playlist, PlaylistStatus } from '@/types/playlist';
import { 
  useActivatePlaylist,
  useDuplicatePlaylist,
  useBulkPlaylistActions 
} from '../hooks';

/**
 * Props interface for PlaylistCard component
 */
export interface PlaylistCardProps {
  /** The playlist data to display */
  playlist: Playlist;
  /** Whether the card is currently selected */
  isSelected?: boolean;
  /** Callback when selection state changes */
  onSelect?: (id: number, selected: boolean) => void;
  /** Callback when view action is triggered */
  onView?: (playlist: Playlist) => void;
  /** Callback when edit action is triggered */
  onEdit?: (playlist: Playlist) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether the card should be draggable */
  draggable?: boolean;
}

const statusConfig: Record<PlaylistStatus, { color: string; label: string }> = {
  [PlaylistStatus.Draft]: { color: 'bg-gray-500', label: 'Draft' },
  [PlaylistStatus.Active]: { color: 'bg-green-500', label: 'Active' },
  [PlaylistStatus.Inactive]: { color: 'bg-red-500', label: 'Inactive' },
  [PlaylistStatus.Scheduled]: { color: 'bg-blue-500', label: 'Scheduled' },
  [PlaylistStatus.Expired]: { color: 'bg-orange-500', label: 'Expired' },
  [PlaylistStatus.Error]: { color: 'bg-red-600', label: 'Error' },
  [PlaylistStatus.Archived]: { color: 'bg-gray-400', label: 'Archived' },
};

/**
 * PlaylistCard Component
 * 
 * A comprehensive card component for displaying playlist information with actions.
 * Features drag-drop support, bulk selection, and contextual actions.
 * 
 * @param playlist - The playlist data to display
 * @param isSelected - Whether the card is currently selected
 * @param onSelect - Callback when selection state changes
 * @param onView - Callback when view action is triggered  
 * @param onEdit - Callback when edit action is triggered
 * @param className - Additional CSS classes
 * @param draggable - Whether the card should be draggable
 */
export const PlaylistCard = memo(({
  playlist,
  isSelected = false,
  onSelect,
  onView,
  onEdit,
  className,
  draggable = false,
}: PlaylistCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const activatePlaylist = useActivatePlaylist();
  const duplicatePlaylist = useDuplicatePlaylist();
  const { mutate: bulkAction } = useBulkPlaylistActions();

  const statusInfo = statusConfig[playlist.status];
  const isActive = playlist.status === PlaylistStatus.Active;
  const canActivate = [PlaylistStatus.Draft, PlaylistStatus.Inactive].includes(playlist.status);

  const handleToggleActive = useCallback(() => {
    if (canActivate) {
      activatePlaylist.mutate(playlist.id);
    } else {
      bulkAction({
        playlistIds: [playlist.id],
        action: 'deactivate'
      });
    }
  }, [canActivate, activatePlaylist, bulkAction, playlist.id]);

  const handleDuplicate = useCallback(() => {
    duplicatePlaylist.mutate(playlist.id);
  }, [duplicatePlaylist, playlist.id]);

  const handleDelete = useCallback(() => {
    bulkAction({
      playlistIds: [playlist.id],
      action: 'delete'
    });
  }, [bulkAction, playlist.id]);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.card-content')) {
      if (onSelect) {
        onSelect(playlist.id, !isSelected);
      } else if (onView) {
        onView(playlist);
      }
    }
  }, [onSelect, onView, playlist.id, isSelected]);

  /**
   * Format date string to readable format
   */
  const formatDate = useCallback((date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  /**
   * Format duration from seconds to human readable format
   */
  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []);

  return (
    <div
      className={cn(
        'group relative cursor-pointer transition-all duration-200 hover:shadow-lg',
        'bg-white rounded-lg border border-gray-200 overflow-hidden',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2',
        draggable && 'cursor-grab active:cursor-grabbing',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      draggable={draggable}
      role="button"
      tabIndex={0}
      aria-label={`Playlist: ${playlist.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick(e as any);
        }
      }}
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(playlist.id, e.target.checked);
            }}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
        </div>
      )}

      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden rounded-t-lg bg-gray-100">
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <Image className="h-12 w-12 text-gray-400" />
        </div>
        
        {/* Status Badge */}
        <Badge
          className={cn(
            'absolute top-2 right-2 text-white',
            statusInfo.color
          )}
        >
          {statusInfo.label}
        </Badge>
      </div>

      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate text-gray-900">
              {playlist.name}
            </h3>
            {playlist.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {playlist.description}
              </p>
            )}
          </div>
          
          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'opacity-0 transition-opacity duration-200 ml-2',
                  isHovered && 'opacity-100'
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onView?.(playlist)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(playlist)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleToggleActive}>
                {isActive ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="card-content px-4 pt-0 pb-2">
        {/* Metadata */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Monitor className="h-3 w-3" />
              <span>{playlist.totalItems || 0} items</span>
            </div>
            {playlist.totalDurationSeconds > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(playlist.totalDurationSeconds)}</span>
              </div>
            )}
          </div>
          
          {/* Priority indicator */}
          {playlist.priority > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs">Priority: {playlist.priority}</span>
              {playlist.isLooped && (
                <span className="text-xs text-blue-600">
                  {playlist.loopCount ? `Loop ${playlist.loopCount}x` : 'Infinite loop'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pt-2 pb-3 border-t bg-gray-50/50">
        <div className="flex items-center justify-between w-full text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Created {formatDate(playlist.createdAt)}</span>
          </div>
          {playlist.updatedAt && (
            <span>Updated {formatDate(playlist.updatedAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
});

PlaylistCard.displayName = 'PlaylistCard';