import { useQuery } from '@tanstack/react-query';
import { PlaylistService } from '@/services/playlistService';
import type { PlaylistDto } from '@/types/playlist';

export function usePlaylistsByUserId(userId: number) {
  return useQuery<PlaylistDto[]>({
    queryKey: ['playlists', 'user', userId],
    queryFn: () => PlaylistService.getByUserId(userId),
    enabled: !!userId,
  });
}
