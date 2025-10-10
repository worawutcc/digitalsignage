import { useQuery } from '@tanstack/react-query';
import { PlaylistService } from '../services/playlistService';
import type { PlaylistDto } from '../types';

export function usePlaylistById(id: number) {
  return useQuery<PlaylistDto | undefined>({
    queryKey: ['playlist', id],
    queryFn: () => PlaylistService.getById(id),
    enabled: !!id,
  });
}
