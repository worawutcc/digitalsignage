'use client';

import React, { useState } from 'react';
import { 
  useOptimisticCreatePlaylist,
  useOptimisticUpdatePlaylist,
  useOptimisticDeletePlaylist,
  useOptimisticReorderMedia,
  useOptimisticRemoveMedia,
  useOptimisticBulkPlaylistActions,
  PlaylistData,
  MediaItem
} from '../../hooks/useOptimisticUpdates';

/**
 * Optimistic UI Components for Playlist Management
 * Provides instant feedback with proper error handling and rollback
 */

// ================================
// PLAYLIST FORM WITH OPTIMISTIC UPDATES
// ================================

interface OptimisticPlaylistFormProps {
  playlist?: PlaylistData;
  onSuccess?: (playlist: PlaylistData) => void;
  onCancel?: () => void;
}

export const OptimisticPlaylistForm: React.FC<OptimisticPlaylistFormProps> = ({
  playlist,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: playlist?.name || '',
    description: playlist?.description || '',
    isActive: playlist?.isActive ?? true,
  });

  const createMutation = useOptimisticCreatePlaylist();
  const updateMutation = useOptimisticUpdatePlaylist();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (playlist) {
        const result = await updateMutation.mutateAsync({
          id: playlist.id,
          updates: formData,
        });
        onSuccess?.(result);
      } else {
        const result = await createMutation.mutateAsync({
          ...formData,
          totalDuration: 0,
          mediaCount: 0,
          assignedDevicesCount: 0,
        });
        onSuccess?.(result);
        // Reset form for new creation
        setFormData({ name: '', description: '', isActive: true });
      }
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error('Form submission error:', error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Playlist Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          placeholder="Enter playlist name"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={isLoading}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          placeholder="Enter playlist description"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          disabled={isLoading}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
          Active playlist
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !formData.name.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {playlist ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            playlist ? 'Update Playlist' : 'Create Playlist'
          )}
        </button>
      </div>
    </form>
  );
};

// ================================
// OPTIMISTIC DELETE BUTTON
// ================================

interface OptimisticDeleteButtonProps {
  playlistId: number;
  playlistName: string;
  onSuccess?: () => void;
  className?: string;
}

export const OptimisticDeleteButton: React.FC<OptimisticDeleteButtonProps> = ({
  playlistId,
  playlistName,
  onSuccess,
  className = ''
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const deleteMutation = useOptimisticDeletePlaylist();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(playlistId);
      onSuccess?.();
      setShowConfirm(false);
    } catch (error) {
      // Error handled in mutation hook
    }
  };

  if (showConfirm) {
    return (
      <div className="inline-flex items-center space-x-2">
        <span className="text-sm text-gray-600">Delete "{playlistName}"?</span>
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {deleteMutation.isPending ? 'Deleting...' : 'Confirm'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={deleteMutation.isPending}
          className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className={`p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors ${className}`}
      title={`Delete ${playlistName}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  );
};

// ================================
// OPTIMISTIC MEDIA REORDER COMPONENT
// ================================

interface OptimisticMediaListProps {
  playlistId: number;
  mediaItems: MediaItem[];
  onReorder?: (items: MediaItem[]) => void;
}

export const OptimisticMediaList: React.FC<OptimisticMediaListProps> = ({
  playlistId,
  mediaItems,
  onReorder
}) => {
  const [draggedItem, setDraggedItem] = useState<MediaItem | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  const reorderMutation = useOptimisticReorderMedia();
  const removeMutation = useOptimisticRemoveMedia();

  const handleDragStart = (e: React.DragEvent, item: MediaItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (!draggedItem) return;

    const currentIndex = mediaItems.findIndex(item => item.id === draggedItem.id);
    if (currentIndex === targetIndex) return;

    try {
      await reorderMutation.mutateAsync({
        playlistId,
        mediaId: draggedItem.id,
        newOrder: targetIndex + 1,
      });
      
      onReorder?.(mediaItems);
    } catch (error) {
      // Error handled in mutation hook
    }

    setDraggedItem(null);
  };

  const handleRemoveMedia = async (mediaId: number) => {
    try {
      await removeMutation.mutateAsync({ playlistId, mediaId });
      onReorder?.(mediaItems.filter(item => item.id !== mediaId));
    } catch (error) {
      // Error handled in mutation hook
    }
  };

  return (
    <div className="space-y-2">
      {mediaItems.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={(e) => handleDragStart(e, item)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          className={`
            flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg cursor-move
            hover:shadow-md transition-shadow
            ${dragOverIndex === index ? 'border-blue-400 bg-blue-50' : ''}
            ${draggedItem?.id === item.id ? 'opacity-50' : ''}
          `}
        >
          <div className="flex items-center space-x-3">
            {/* Drag Handle */}
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            
            {/* Media Thumbnail */}
            {item.thumbnailUrl ? (
              <img
                src={item.thumbnailUrl}
                alt={item.name}
                className="w-12 h-12 object-cover rounded"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {/* Media Info */}
            <div>
              <h4 className="font-medium text-gray-900">{item.name}</h4>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="capitalize">{item.type}</span>
                <span>•</span>
                <span>{Math.round(item.duration)}s</span>
                <span>•</span>
                <span>Order {item.playlistOrder}</span>
              </div>
            </div>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => handleRemoveMedia(item.id)}
            disabled={removeMutation.isPending}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
            title="Remove from playlist"
          >
            {removeMutation.isPending ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>
      ))}
      
      {mediaItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3" />
          </svg>
          <p>No media items in this playlist</p>
          <p className="text-sm">Add media items to get started</p>
        </div>
      )}
    </div>
  );
};

// ================================
// BULK ACTIONS COMPONENT
// ================================

interface OptimisticBulkActionsProps {
  selectedPlaylists: number[];
  onSelectionChange: (ids: number[]) => void;
  onActionComplete?: () => void;
}

export const OptimisticBulkActions: React.FC<OptimisticBulkActionsProps> = ({
  selectedPlaylists,
  onSelectionChange,
  onActionComplete
}) => {
  const bulkMutation = useOptimisticBulkPlaylistActions();

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    try {
      await bulkMutation.mutateAsync({
        action,
        playlistIds: selectedPlaylists,
      });
      
      onSelectionChange([]);
      onActionComplete?.();
    } catch (error) {
      // Error handled in mutation hook
    }
  };

  if (selectedPlaylists.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-blue-800">
            {selectedPlaylists.length} playlist(s) selected
          </span>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleBulkAction('activate')}
              disabled={bulkMutation.isPending}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Activate
            </button>
            
            <button
              onClick={() => handleBulkAction('deactivate')}
              disabled={bulkMutation.isPending}
              className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 transition-colors"
            >
              Deactivate
            </button>
            
            <button
              onClick={() => handleBulkAction('delete')}
              disabled={bulkMutation.isPending}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        <button
          onClick={() => onSelectionChange([])}
          disabled={bulkMutation.isPending}
          className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {bulkMutation.isPending && (
        <div className="mt-3 flex items-center space-x-2">
          <svg className="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm text-blue-700">Processing...</span>
        </div>
      )}
    </div>
  );
};