import { useQuery } from '@tanstack/react-query';
import { PlaylistService } from '../services/playlistService';
import type { PlaylistAssignmentSummary } from '../types';

/**
 * Hook for fetching playlist assignment summary
 * TODO: Implement getAssignmentSummary method in PlaylistService when API endpoint is available
 */
export function usePlaylistAssignmentSummary(playlistId: number) {
  return useQuery<PlaylistAssignmentSummary>({
    queryKey: ['playlistAssignmentSummary', playlistId],
    queryFn: () => PlaylistService.getAssignmentSummary(playlistId),
    enabled: !!playlistId,
  });
}
