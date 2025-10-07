import { useQuery } from '@tanstack/react-query';
import { PlaylistService } from '@/services/playlistService';
import type { PlaylistStatistics } from '@/types/playlist';

export function usePlaylistStatistics() {
  return useQuery<PlaylistStatistics>({
    queryKey: ['playlistStatistics'],
    queryFn: PlaylistService.getStatistics,
  });
}
