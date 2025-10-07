import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlaylistService } from '@/services/playlistService';

export function useDuplicatePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => PlaylistService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}
