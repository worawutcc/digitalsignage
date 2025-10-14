import { useQuery } from '@tanstack/react-query';
import { PlaylistService } from '../services/playlistService';
import type { DevicePlaylistAssignment, PlaylistAnalyticsReportDto } from '@/types/playlist';

/**
 * Hook for getting device assignments for a playlist
 */
export function usePlaylistDeviceAssignments(playlistId: number) {
  return useQuery<DevicePlaylistAssignment[]>({
    queryKey: ['playlist-device-assignments', playlistId],
    queryFn: () => PlaylistService.getDeviceAssignments(playlistId),
    enabled: !!playlistId,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for getting playlist analytics
 */
export function usePlaylistAnalytics(
  playlistId: number, 
  startDate?: Date, 
  endDate?: Date
) {
  return useQuery<PlaylistAnalyticsReportDto>({
    queryKey: ['playlist-analytics', playlistId, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: () => PlaylistService.getAnalytics(playlistId, startDate, endDate),
    enabled: !!playlistId,
    refetchOnWindowFocus: false,
  });
}