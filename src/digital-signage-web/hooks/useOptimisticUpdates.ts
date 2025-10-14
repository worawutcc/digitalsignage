'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

/**
 * Optimistic UI Update Hooks for Playlist Management
 * Implements optimistic updates with proper error handling and rollback
 * Follows UI copilot patterns with consistent user feedback
 */

// ================================
// TYPE DEFINITIONS
// ================================

export interface PlaylistData {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  totalDuration: number;
  mediaCount: number;
  assignedDevicesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: number;
  name: string;
  type: 'image' | 'video' | 'html';
  fileSize: number;
  duration: number;
  thumbnailUrl?: string;
  playlistOrder?: number; // Optional to handle cases where it's not set yet
}

export interface OptimisticUpdateOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

// ================================
// PLAYLIST OPTIMISTIC UPDATES
// ================================

/**
 * Hook for optimistic playlist creation
 */
export function useOptimisticCreatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playlistData: Omit<PlaylistData, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playlistData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create playlist');
      }
      
      return response.json();
    },
    onMutate: async (newPlaylist) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['playlists'] });

      // Snapshot the previous value
      const previousPlaylists = queryClient.getQueryData<PlaylistData[]>(['playlists']) || [];

      // Optimistically update to the new value
      const optimisticPlaylist: PlaylistData = {
        id: Date.now(), // Temporary ID
        ...newPlaylist,
        totalDuration: 0,
        mediaCount: 0,
        assignedDevicesCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<PlaylistData[]>(['playlists'], (old = []) => [
        optimisticPlaylist,
        ...old,
      ]);

      // Show optimistic toast
      toast.loading('Creating playlist...', { id: 'create-playlist' });

      // Return a context object with the snapshotted value
      return { previousPlaylists, optimisticPlaylist };
    },
    onSuccess: (data) => {
      // Update with real data
      queryClient.setQueryData<PlaylistData[]>(['playlists'], (old = []) =>
        old.map((playlist) => 
          playlist.id === data.id || playlist.createdAt === data.createdAt 
            ? data 
            : playlist
        )
      );
      
      toast.success('Playlist created successfully!', { id: 'create-playlist' });
    },
    onError: (err, newPlaylist, context) => {
      // Roll back to the previous state
      if (context?.previousPlaylists) {
        queryClient.setQueryData(['playlists'], context.previousPlaylists);
      }
      
      toast.error('Failed to create playlist. Please try again.', { id: 'create-playlist' });
      console.error('Create playlist error:', err);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}

/**
 * Hook for optimistic playlist updates
 */
export function useOptimisticUpdatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<PlaylistData> }) => {
      const response = await fetch(`/api/playlists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update playlist');
      }
      
      return response.json();
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['playlists'] });
      await queryClient.cancelQueries({ queryKey: ['playlist', id] });

      // Snapshot previous values
      const previousPlaylists = queryClient.getQueryData<PlaylistData[]>(['playlists']);
      const previousPlaylist = queryClient.getQueryData<PlaylistData>(['playlist', id]);

      // Optimistically update playlist list
      queryClient.setQueryData<PlaylistData[]>(['playlists'], (old = []) =>
        old.map((playlist) =>
          playlist.id === id
            ? { ...playlist, ...updates, updatedAt: new Date().toISOString() }
            : playlist
        )
      );

      // Optimistically update individual playlist
      if (previousPlaylist) {
        queryClient.setQueryData(['playlist', id], {
          ...previousPlaylist,
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      }

      toast.loading('Updating playlist...', { id: `update-playlist-${id}` });

      return { previousPlaylists, previousPlaylist };
    },
    onSuccess: (data, { id }) => {
      // Update with real data
      queryClient.setQueryData<PlaylistData[]>(['playlists'], (old = []) =>
        old.map((playlist) => (playlist.id === id ? data : playlist))
      );
      
      queryClient.setQueryData(['playlist', id], data);
      
      toast.success('Playlist updated successfully!', { id: `update-playlist-${id}` });
    },
    onError: (err, { id }, context) => {
      // Roll back changes
      if (context?.previousPlaylists) {
        queryClient.setQueryData(['playlists'], context.previousPlaylists);
      }
      if (context?.previousPlaylist) {
        queryClient.setQueryData(['playlist', id], context.previousPlaylist);
      }
      
      toast.error('Failed to update playlist. Please try again.', { id: `update-playlist-${id}` });
      console.error('Update playlist error:', err);
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      queryClient.invalidateQueries({ queryKey: ['playlist', id] });
    },
  });
}

/**
 * Hook for optimistic playlist deletion
 */
export function useOptimisticDeletePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/playlists/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete playlist');
      }
      
      return { id };
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['playlists'] });

      // Snapshot previous state
      const previousPlaylists = queryClient.getQueryData<PlaylistData[]>(['playlists']);

      // Optimistically remove from list
      queryClient.setQueryData<PlaylistData[]>(['playlists'], (old = []) =>
        old.filter((playlist) => playlist.id !== id)
      );

      // Remove individual playlist cache
      queryClient.removeQueries({ queryKey: ['playlist', id] });

      toast.loading('Deleting playlist...', { id: `delete-playlist-${id}` });

      return { previousPlaylists };
    },
    onSuccess: (_, id) => {
      toast.success('Playlist deleted successfully!', { id: `delete-playlist-${id}` });
    },
    onError: (err, id, context) => {
      // Restore previous state
      if (context?.previousPlaylists) {
        queryClient.setQueryData(['playlists'], context.previousPlaylists);
      }
      
      toast.error('Failed to delete playlist. Please try again.', { id: `delete-playlist-${id}` });
      console.error('Delete playlist error:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}

// ================================
// MEDIA ITEM OPTIMISTIC UPDATES
// ================================

/**
 * Hook for optimistic media reordering within playlist
 */
export function useOptimisticReorderMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      playlistId, 
      mediaId, 
      newOrder 
    }: { 
      playlistId: number; 
      mediaId: number; 
      newOrder: number; 
    }) => {
      const response = await fetch(`/api/playlists/${playlistId}/media/${mediaId}/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reorder media');
      }
      
      return response.json();
    },
    onMutate: async ({ playlistId, mediaId, newOrder }) => {
      await queryClient.cancelQueries({ queryKey: ['playlist', playlistId, 'media'] });

      // Snapshot previous state
      const previousMedia = queryClient.getQueryData<MediaItem[]>(['playlist', playlistId, 'media']);

      if (previousMedia) {
        // Create optimistic reordered array
        const mediaArray = [...previousMedia];
        const mediaIndex = mediaArray.findIndex(item => item.id === mediaId);
        
        if (mediaIndex !== -1) {
          // Remove media from current position
          const [movedItem] = mediaArray.splice(mediaIndex, 1);
          
          // Insert at new position
          const newIndex = Math.min(newOrder - 1, mediaArray.length);
          mediaArray.splice(newIndex, 0, { ...movedItem, playlistOrder: newOrder } as MediaItem);
          
          // Update order numbers for affected items
          const reorderedMedia = mediaArray.map((item, index) => ({
            ...item,
            playlistOrder: index + 1,
          }));
          
          queryClient.setQueryData(['playlist', playlistId, 'media'], reorderedMedia);
        }
      }

      toast.loading('Reordering media...', { id: `reorder-media-${mediaId}` });

      return { previousMedia };
    },
    onSuccess: (data, { mediaId, playlistId }) => {
      // Update with real data
      queryClient.setQueryData(['playlist', playlistId, 'media'], data);
      toast.success('Media reordered successfully!', { id: `reorder-media-${mediaId}` });
    },
    onError: (err, { mediaId, playlistId }, context) => {
      // Restore previous order
      if (context?.previousMedia) {
        queryClient.setQueryData(['playlist', playlistId, 'media'], context.previousMedia);
      }
      
      toast.error('Failed to reorder media. Please try again.', { id: `reorder-media-${mediaId}` });
      console.error('Reorder media error:', err);
    },
    onSettled: (_, __, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId, 'media'] });
    },
  });
}

/**
 * Hook for optimistic media removal from playlist
 */
export function useOptimisticRemoveMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ playlistId, mediaId }: { playlistId: number; mediaId: number }) => {
      const response = await fetch(`/api/playlists/${playlistId}/media/${mediaId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove media from playlist');
      }
      
      return { playlistId, mediaId };
    },
    onMutate: async ({ playlistId, mediaId }) => {
      await queryClient.cancelQueries({ queryKey: ['playlist', playlistId, 'media'] });

      // Snapshot previous state
      const previousMedia = queryClient.getQueryData<MediaItem[]>(['playlist', playlistId, 'media']);

      // Optimistically remove media
      queryClient.setQueryData<MediaItem[]>(['playlist', playlistId, 'media'], (old = []) =>
        old.filter((item) => item.id !== mediaId)
      );

      // Update playlist media count
      queryClient.setQueryData<PlaylistData>(['playlist', playlistId], (old) => 
        old ? { ...old, mediaCount: old.mediaCount - 1 } : old
      );

      toast.loading('Removing media...', { id: `remove-media-${mediaId}` });

      return { previousMedia };
    },
    onSuccess: (_, { mediaId }) => {
      toast.success('Media removed from playlist!', { id: `remove-media-${mediaId}` });
    },
    onError: (err, { playlistId, mediaId }, context) => {
      // Restore previous state
      if (context?.previousMedia) {
        queryClient.setQueryData(['playlist', playlistId, 'media'], context.previousMedia);
      }
      
      toast.error('Failed to remove media. Please try again.', { id: `remove-media-${mediaId}` });
      console.error('Remove media error:', err);
    },
    onSettled: (_, __, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId, 'media'] });
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
    },
  });
}

// ================================
// BULK OPERATIONS
// ================================

/**
 * Hook for optimistic bulk playlist operations
 */
export function useOptimisticBulkPlaylistActions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      action, 
      playlistIds 
    }: { 
      action: 'activate' | 'deactivate' | 'delete'; 
      playlistIds: number[] 
    }) => {
      const response = await fetch('/api/playlists/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, playlistIds }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} playlists`);
      }
      
      return response.json();
    },
    onMutate: async ({ action, playlistIds }) => {
      await queryClient.cancelQueries({ queryKey: ['playlists'] });

      // Snapshot previous state
      const previousPlaylists = queryClient.getQueryData<PlaylistData[]>(['playlists']);

      // Apply optimistic updates based on action
      queryClient.setQueryData<PlaylistData[]>(['playlists'], (old = []) => {
        switch (action) {
          case 'activate':
            return old.map(playlist => 
              playlistIds.includes(playlist.id)
                ? { ...playlist, isActive: true, updatedAt: new Date().toISOString() }
                : playlist
            );
          case 'deactivate':
            return old.map(playlist => 
              playlistIds.includes(playlist.id)
                ? { ...playlist, isActive: false, updatedAt: new Date().toISOString() }
                : playlist
            );
          case 'delete':
            return old.filter(playlist => !playlistIds.includes(playlist.id));
          default:
            return old;
        }
      });

      const actionLabels = {
        activate: 'Activating',
        deactivate: 'Deactivating',
        delete: 'Deleting'
      };

      toast.loading(`${actionLabels[action]} ${playlistIds.length} playlist(s)...`, { 
        id: `bulk-${action}` 
      });

      return { previousPlaylists };
    },
    onSuccess: (_, { action, playlistIds }) => {
      const actionLabels = {
        activate: 'activated',
        deactivate: 'deactivated',
        delete: 'deleted'
      };

      toast.success(`Successfully ${actionLabels[action]} ${playlistIds.length} playlist(s)!`, { 
        id: `bulk-${action}` 
      });
    },
    onError: (err, { action }, context) => {
      // Restore previous state
      if (context?.previousPlaylists) {
        queryClient.setQueryData(['playlists'], context.previousPlaylists);
      }
      
      toast.error(`Failed to ${action} playlists. Please try again.`, { id: `bulk-${action}` });
      console.error(`Bulk ${action} error:`, err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}

// ================================
// OPTIMISTIC UPDATE UTILITIES
// ================================

export const OptimisticUpdateUtils = {
  /**
   * Generate temporary ID for optimistic updates
   */
  generateTempId: (): number => {
    return -Math.abs(Date.now());
  },

  /**
   * Check if an item is optimistically created (has temporary ID)
   */
  isOptimistic: (id: number): boolean => {
    return id < 0;
  },

  /**
   * Create optimistic update context
   */
  createOptimisticContext: <T>(
    currentData: T | undefined,
    updates: Partial<T>
  ): T | undefined => {
    if (!currentData) return undefined;
    
    return {
      ...currentData,
      ...updates,
      updatedAt: new Date().toISOString(),
    } as T;
  },

  /**
   * Debounce optimistic updates to prevent excessive API calls
   */
  debounceOptimistic: <T extends any[]>(
    fn: (...args: T) => void,
    delay: number = 300
  ): ((...args: T) => void) => {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: T) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  },

  /**
   * Batch multiple optimistic updates
   */
  batchUpdates: (updates: Array<() => void>): void => {
    // Use React's automatic batching in React 18
    updates.forEach(update => update());
  }
};