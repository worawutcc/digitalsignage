import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlaylistService } from '../services/playlistService';
import type { 
  UpdatePlaylistOrderRequest, 
  BulkPlaylistActionRequest,
  CreateDevicePlaylistRequest
} from '@/types/playlist';
import toast from 'react-hot-toast';

/**
 * Hook for updating playlist item order
 */
export function useUpdatePlaylistOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdatePlaylistOrderRequest }) =>
      PlaylistService.updateOrder(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      queryClient.invalidateQueries({ queryKey: ['playlist', variables.id] });
      toast.success('Playlist order updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update playlist order:', error);
      toast.error('Failed to update playlist order');
    },
  });
}

/**
 * Hook for bulk playlist actions
 */
export function useBulkPlaylistActions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: BulkPlaylistActionRequest) =>
      PlaylistService.bulkAction(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      // Invalidate individual playlist queries for affected items
      variables.playlistIds.forEach((id: number) => {
        queryClient.invalidateQueries({ queryKey: ['playlist', id] });
      });
      toast.success(`Bulk ${variables.action} completed successfully`);
    },
    onError: (error) => {
      console.error('Failed to perform bulk action:', error);
      toast.error('Failed to perform bulk action');
    },
  });
}

/**
 * Hook for assigning playlist to devices
 */
export function useAssignPlaylistToDevices() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, assignments }: { id: number; assignments: CreateDevicePlaylistRequest[] }) =>
      PlaylistService.assignToDevices(id, assignments),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      queryClient.invalidateQueries({ queryKey: ['playlist', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['playlist-device-assignments', variables.id] });
      toast.success(`Playlist assigned to ${variables.assignments.length} device(s) successfully`);
    },
    onError: (error) => {
      console.error('Failed to assign playlist to devices:', error);
      toast.error('Failed to assign playlist to devices');
    },
  });
}