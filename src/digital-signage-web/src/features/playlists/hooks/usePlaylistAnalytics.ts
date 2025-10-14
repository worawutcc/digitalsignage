import { useQuery } from '@tanstack/react-query';

/**
 * Simple placeholder analytics hook
 */
export function usePlaylistAnalytics(playlistId: number | undefined) {
  return useQuery(['playlist-analytics', playlistId], 
    () => Promise.resolve(null), 
    { 
      enabled: false // Disabled for now
    }
  );
}

export function usePlaylistViewMetrics(playlistId: number | undefined) {
  return useQuery(['playlist-view-metrics', playlistId], 
    () => Promise.resolve(null), 
    { 
      enabled: false 
    }
  );
}

export function usePlaylistDeviceMetrics(playlistId: number | undefined) {
  return useQuery(['playlist-device-metrics', playlistId], 
    () => Promise.resolve(null), 
    { 
      enabled: false 
    }
  );
}

export function usePlaylistMediaAnalytics(playlistId: number | undefined) {
  return useQuery(['playlist-media-analytics', playlistId], 
    () => Promise.resolve(null), 
    { 
      enabled: false 
    }
  );
}