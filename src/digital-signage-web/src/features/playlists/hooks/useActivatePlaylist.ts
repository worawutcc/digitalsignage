import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlaylistService } from '../services/playlistService';

export function useActivatePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => PlaylistService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}

export function useDeactivatePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => PlaylistService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}
