'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { 
  Play, 
  Pause, 
  Copy, 
  Trash2, 
  Archive,
  CheckSquare,
  Square,
  MoreVertical,
  Download,
  Upload,
  Tag,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBulkPlaylistActions, useAssignPlaylistToDevices } from '../hooks';
import type { Playlist, BulkActionType } from '@/types/playlist';

interface BulkActionsToolbarProps {
  selectedIds: Set<number>;
  selectedPlaylists: Playlist[];
  onSelectAll: (selected: boolean) => void;
  onClearSelection: () => void;
  totalCount: number;
  className?: string;
  disabled?: boolean;
}

interface ConfirmationDialog {
  isOpen: boolean;
  action: BulkActionType | null;
  title: string;
  description: string;
}

export function BulkActionsToolbar({
  selectedIds,
  selectedPlaylists,
  onSelectAll,
  onClearSelection,
  totalCount,
  className,
  disabled = false,
}: BulkActionsToolbarProps) {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog>({
    isOpen: false,
    action: null,
    title: '',
    description: '',
  });

  const bulkActionsMutation = useBulkPlaylistActions();
  const assignToDevicesMutation = useAssignPlaylistToDevices();

  const selectedCount = selectedIds.size;
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  // Handle bulk actions with confirmation
  const handleBulkAction = (action: BulkActionType) => {
    const actionConfigs: Record<BulkActionType, { title: string; description: string }> = {
      activate: {
        title: 'Activate Playlists',
        description: `Are you sure you want to activate ${selectedCount} playlist${selectedCount === 1 ? '' : 's'}?`,
      },
      deactivate: {
        title: 'Deactivate Playlists',
        description: `Are you sure you want to deactivate ${selectedCount} playlist${selectedCount === 1 ? '' : 's'}?`,
      },
      delete: {
        title: 'Delete Playlists',
        description: `Are you sure you want to delete ${selectedCount} playlist${selectedCount === 1 ? '' : 's'}? This action cannot be undone.`,
      },
      archive: {
        title: 'Archive Playlists',
        description: `Are you sure you want to archive ${selectedCount} playlist${selectedCount === 1 ? '' : 's'}?`,
      },
      duplicate: {
        title: 'Duplicate Playlists',
        description: `This will create ${selectedCount} new playlist${selectedCount === 1 ? '' : 's'} as copies of the selected items.`,
      },
    };

    const config = actionConfigs[action];
    if (config) {
      setConfirmDialog({
        isOpen: true,
        action,
        title: config.title,
        description: config.description,
      });
    }
  };

  // Execute confirmed bulk action
  const executeBulkAction = () => {
    if (!confirmDialog.action) return;

    bulkActionsMutation.mutate({
      playlistIds: Array.from(selectedIds),
      action: confirmDialog.action,
    }, {
      onSuccess: () => {
        onClearSelection();
        setConfirmDialog({ isOpen: false, action: null, title: '', description: '' });
      },
    });
  };

  // Handle select all toggle
  const handleSelectAllToggle = () => {
    onSelectAll(!isAllSelected);
  };

  // Get action availability based on selected playlists
  const getActionAvailability = () => {
    const activePlaylists = selectedPlaylists.filter(p => p.status === 1); // Active
    const inactivePlaylists = selectedPlaylists.filter(p => p.status === 2); // Inactive
    const draftPlaylists = selectedPlaylists.filter(p => p.status === 0); // Draft
    
    return {
      canActivate: inactivePlaylists.length > 0 || draftPlaylists.length > 0,
      canDeactivate: activePlaylists.length > 0,
      canDelete: selectedCount > 0,
      canArchive: selectedCount > 0,
      canDuplicate: selectedCount > 0,
    };
  };

  const actionAvailability = getActionAvailability();

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className={cn(
        'flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg',
        className
      )}>
        <div className="flex items-center gap-3">
          {/* Select All Checkbox */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAllToggle}
            className="h-8 w-8 p-0"
            disabled={disabled}
          >
            {isAllSelected ? (
              <CheckSquare className="h-4 w-4" />
            ) : isIndeterminate ? (
              <div className="h-4 w-4 border-2 border-current bg-current/20" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </Button>

          {/* Selection Count */}
          <div className="flex items-center gap-2">
            <Badge variant="info" className="font-medium">
              {selectedCount} selected
            </Badge>
            {selectedCount < totalCount && (
              <Button
                variant="link"
                size="sm"
                onClick={() => onSelectAll(true)}
                className="h-auto p-0 text-blue-600 hover:text-blue-700"
                disabled={disabled}
              >
                Select all {totalCount}
              </Button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Primary Actions */}
          {actionAvailability.canActivate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('activate')}
              disabled={disabled || bulkActionsMutation.isPending}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Activate
            </Button>
          )}

          {actionAvailability.canDeactivate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('deactivate')}
              disabled={disabled || bulkActionsMutation.isPending}
              className="gap-2"
            >
              <Pause className="h-4 w-4" />
              Deactivate
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('duplicate')}
            disabled={disabled || bulkActionsMutation.isPending}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Duplicate
          </Button>

          <div className="border-l border-gray-200 h-6" />

          {/* More Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                className="gap-2"
              >
                <MoreVertical className="h-4 w-4" />
                More
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={() => handleBulkAction('archive')}
                disabled={bulkActionsMutation.isPending}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive Selected
              </DropdownMenuItem>
              
              <DropdownMenuItem disabled>
                <Tag className="mr-2 h-4 w-4" />
                Add Tags
              </DropdownMenuItem>
              
              <DropdownMenuItem disabled>
                <Monitor className="mr-2 h-4 w-4" />
                Assign to Devices
              </DropdownMenuItem>
              
              <div className="border-t border-gray-200 my-1" />
              
              <DropdownMenuItem disabled>
                <Download className="mr-2 h-4 w-4" />
                Export Selected
              </DropdownMenuItem>
              
              <DropdownMenuItem disabled>
                <Upload className="mr-2 h-4 w-4" />
                Import & Replace
              </DropdownMenuItem>
              
              <div className="border-t border-gray-200 my-1" />
              
              <DropdownMenuItem 
                onClick={() => handleBulkAction('delete')}
                className="text-red-600 focus:text-red-600"
                disabled={bulkActionsMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="border-l border-gray-200 h-6" />

          {/* Clear Selection */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={disabled}
            className="text-gray-600 hover:text-gray-800"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={executeBulkAction}
        title={confirmDialog.title}
        message={confirmDialog.description}
        confirmText={bulkActionsMutation.isPending ? 'Processing...' : 'Confirm'}
        cancelText="Cancel"
        variant={confirmDialog.action === 'delete' ? 'danger' : 'warning'}
        isLoading={bulkActionsMutation.isPending}
      />
    </>
  );
}