'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import {
  PlaylistHubClient,
  getPlaylistHubClient,
  PlaylistEventHandlers,
  ConnectionState
} from '@/lib/signalr/playlistHub';
import { PlaylistDto, PlaylistStatus } from '@/types/playlist';
import { useAuth } from '@/hooks/usePermissions';

interface UseRealtimePlaylistOptions {
  /**
   * Playlist ID to monitor (optional)
   * If provided, will join/leave playlist group automatically
   */
  playlistId?: number;
  
  /**
   * Device IDs to monitor (optional)
   * If provided, will join/leave device groups automatically
   */
  deviceIds?: number[];
  
  /**
   * Auto-connect on mount (default: true)
   */
  autoConnect?: boolean;
  
  /**
   * Show toast notifications for events (default: true)
   */
  showNotifications?: boolean;
  
  /**
   * Custom event handlers
   */
  eventHandlers?: Partial<PlaylistEventHandlers>;
}

interface UseRealtimePlaylistReturn {
  // Connection state
  isConnected: boolean;
  connectionState: ConnectionState;
  connectionError: string | null;
  
  // Connection management
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  
  // Group management
  joinPlaylistGroup: (playlistId: number) => Promise<void>;
  leavePlaylistGroup: (playlistId: number) => Promise<void>;
  joinDeviceGroup: (deviceId: number) => Promise<void>;
  leaveDeviceGroup: (deviceId: number) => Promise<void>;
  
  // Activity reporting
  reportPlaylistView: (playlistId: number, deviceId: number) => Promise<void>;
  reportPlaybackStarted: (playlistId: number, deviceId: number, mediaItemId: number) => Promise<void>;
  reportPlaybackStopped: (playlistId: number, deviceId: number, reason: string) => Promise<void>;
}

/**
 * Real-time playlist updates hook
 * Manages SignalR connection and playlist-specific events with automatic cache invalidation
 * Following React 18 patterns and TypeScript strict mode
 */
export function useRealtimePlaylist(options: UseRealtimePlaylistOptions = {}): UseRealtimePlaylistReturn {
  const {
    playlistId,
    deviceIds = [],
    autoConnect = true,
    showNotifications = true,
    eventHandlers = {}
  } = options;
  
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // SignalR client instance
  const [client] = useState<PlaylistHubClient>(() => getPlaylistHubClient());
  const [connectionState, setConnectionState] = useState<ConnectionState>(client.state);
  const [connectionError, setConnectionError] = useState<string | null>(client.error);
  
  // Track joined groups to cleanup on unmount
  const joinedPlaylistGroups = useRef<Set<number>>(new Set());
  const joinedDeviceGroups = useRef<Set<number>>(new Set());

  /**
   * Invalidate playlist-related queries
   */
  const invalidatePlaylistQueries = useCallback((playlistId?: number) => {
    // Invalidate general playlist queries
    queryClient.invalidateQueries({ queryKey: ['playlists'] });
    queryClient.invalidateQueries({ queryKey: ['playlists', 'list'] });
    
    if (playlistId) {
      // Invalidate specific playlist queries
      queryClient.invalidateQueries({ queryKey: ['playlists', playlistId] });
      queryClient.invalidateQueries({ queryKey: ['playlists', playlistId, 'details'] });
      queryClient.invalidateQueries({ queryKey: ['playlists', playlistId, 'analytics'] });
      queryClient.invalidateQueries({ queryKey: ['playlists', playlistId, 'statistics'] });
    }
  }, [queryClient]);

  /**
   * Show toast notification for playlist events
   */
  const showToastNotification = useCallback((
    variant: 'success' | 'default' | 'warning' | 'destructive',
    title: string,
    description?: string
  ) => {
    if (!showNotifications) return;
    
    toast({
      title,
      description: description || '',
      variant
    });
  }, [showNotifications, toast]);

  /**
   * Setup default event handlers with cache invalidation
   */
  const setupDefaultEventHandlers = useCallback(() => {
    const defaultHandlers: PlaylistEventHandlers = {
      onPlaylistCreated: (playlist) => {
        console.log('Playlist created:', playlist);
        invalidatePlaylistQueries();
        showToastNotification('success', 'New playlist created', `"${playlist.name}" has been created`);
        eventHandlers.onPlaylistCreated?.(playlist);
      },
      
      onPlaylistUpdated: (playlist) => {
        console.log('Playlist updated:', playlist);
        invalidatePlaylistQueries(playlist.id);
        showToastNotification('default', 'Playlist updated', `"${playlist.name}" has been updated`);
        eventHandlers.onPlaylistUpdated?.(playlist);
      },
      
      onPlaylistDeleted: (data) => {
        console.log('Playlist deleted:', data);
        invalidatePlaylistQueries(data.PlaylistId);
        showToastNotification('default', 'Playlist deleted', `Playlist has been deleted`);
        eventHandlers.onPlaylistDeleted?.(data);
      },
      
      onPlaylistStatusChanged: (data) => {
        console.log('Playlist status changed:', data);
        invalidatePlaylistQueries(data.PlaylistId);
        
        const statusMessages: Record<PlaylistStatus, string> = {
          [PlaylistStatus.Draft]: 'moved to draft',
          [PlaylistStatus.Active]: 'activated',
          [PlaylistStatus.Scheduled]: 'scheduled',
          [PlaylistStatus.Inactive]: 'deactivated',
          [PlaylistStatus.Expired]: 'expired',
          [PlaylistStatus.Error]: 'in error state',
          [PlaylistStatus.Archived]: 'archived'
        };
        
        showToastNotification(
          data.NewStatus === PlaylistStatus.Active ? 'success' : 'default',
          'Playlist status changed',
          `Playlist ${statusMessages[data.NewStatus] || 'status changed'}`
        );
        eventHandlers.onPlaylistStatusChanged?.(data);
      },
      
      onPlaylistReordered: (data) => {
        console.log('Playlist reordered:', data);
        invalidatePlaylistQueries(data.PlaylistId);
        showToastNotification('default', 'Playlist reordered', 'Media items have been reordered');
        eventHandlers.onPlaylistReordered?.(data);
      },
      
      onDeviceAssignmentChanged: (data) => {
        console.log('Device assignment changed:', data);
        invalidatePlaylistQueries(data.PlaylistId);
        
        // Invalidate device-related queries
        queryClient.invalidateQueries({ queryKey: ['devices', data.DeviceId] });
        queryClient.invalidateQueries({ queryKey: ['device-assignments'] });
        
        showToastNotification(
          'default',
          data.IsAssigned ? 'Device assigned' : 'Device unassigned',
          `Playlist ${data.IsAssigned ? 'assigned to' : 'removed from'} device`
        );
        eventHandlers.onDeviceAssignmentChanged?.(data);
      },
      
      onBulkPlaylistAction: (data) => {
        console.log('Bulk playlist action:', data);
        data.PlaylistIds.forEach(id => invalidatePlaylistQueries(id));
        showToastNotification('default', 'Bulk action completed', `${data.Action} performed on ${data.PlaylistIds.length} playlists`);
        eventHandlers.onBulkPlaylistAction?.(data);
      },
      
      onAnalyticsUpdated: (data) => {
        console.log('Analytics updated:', data);
        queryClient.invalidateQueries({ queryKey: ['playlists', data.PlaylistId, 'analytics'] });
        queryClient.invalidateQueries({ queryKey: ['playlists', data.PlaylistId, 'statistics'] });
        eventHandlers.onAnalyticsUpdated?.(data);
      },
      
      onPlaylistViewed: (data) => {
        console.log('Playlist viewed:', data);
        // Update analytics queries for view tracking
        queryClient.invalidateQueries({ queryKey: ['playlists', data.PlaylistId, 'analytics'] });
        eventHandlers.onPlaylistViewed?.(data);
      },
      
      onPlaybackStarted: (data) => {
        console.log('Playback started:', data);
        queryClient.invalidateQueries({ queryKey: ['playlists', data.PlaylistId, 'analytics'] });
        eventHandlers.onPlaybackStarted?.(data);
      },
      
      onPlaybackStopped: (data) => {
        console.log('Playback stopped:', data);
        queryClient.invalidateQueries({ queryKey: ['playlists', data.PlaylistId, 'analytics'] });
        eventHandlers.onPlaybackStopped?.(data);
      }
    };

    client.onEvents(defaultHandlers);
  }, [client, eventHandlers, invalidatePlaylistQueries, queryClient, showToastNotification]);

  /**
   * Setup connection state monitoring
   */
  useEffect(() => {
    const unsubscribe = client.onStateChange((state, error) => {
      setConnectionState(state);
      setConnectionError(error || null);
      
      if (state === 'Connected') {
        showToastNotification('success', 'Connected', 'Real-time updates enabled');
      } else if (state === 'Disconnected' && error) {
        showToastNotification('destructive', 'Connection lost', 'Real-time updates disabled');
      } else if (state === 'Reconnecting') {
        showToastNotification('default', 'Reconnecting...', 'Attempting to restore connection');
      }
    });

    return unsubscribe;
  }, [client, showToastNotification]);

  /**
   * Setup event handlers on mount
   */
  useEffect(() => {
    setupDefaultEventHandlers();
  }, [setupDefaultEventHandlers]);

  /**
   * Auto-connect and join groups
   */
  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        // Auto-connect if enabled and user is authenticated
        if (autoConnect && user && !client.isConnected) {
          await client.connect();
          
          if (!mounted) return;
          
          // Join playlist group if specified
          if (playlistId) {
            await client.joinPlaylistGroup(playlistId);
            joinedPlaylistGroups.current.add(playlistId);
          }
          
          // Join device groups if specified
          for (const deviceId of deviceIds) {
            await client.joinDeviceGroup(deviceId);
            joinedDeviceGroups.current.add(deviceId);
          }
        }
      } catch (error) {
        console.error('Failed to initialize playlist hub connection:', error);
        if (mounted) {
          setConnectionError(error instanceof Error ? error.message : 'Connection failed');
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [autoConnect, user, client, playlistId, deviceIds]);

  /**
   * Update group memberships when dependencies change
   */
  useEffect(() => {
    if (!client.isConnected) return;

    async function updateGroups() {
      try {
        // Handle playlist group changes
        if (playlistId && !joinedPlaylistGroups.current.has(playlistId)) {
          await client.joinPlaylistGroup(playlistId);
          joinedPlaylistGroups.current.add(playlistId);
        }

        // Handle device group changes
        for (const deviceId of deviceIds) {
          if (!joinedDeviceGroups.current.has(deviceId)) {
            await client.joinDeviceGroup(deviceId);
            joinedDeviceGroups.current.add(deviceId);
          }
        }
      } catch (error) {
        console.error('Failed to update group memberships:', error);
      }
    }

    updateGroups();
  }, [client, playlistId, deviceIds]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      async function cleanup() {
        try {
          // Leave all joined groups
          for (const playlistId of joinedPlaylistGroups.current) {
            await client.leavePlaylistGroup(playlistId);
          }
          
          for (const deviceId of joinedDeviceGroups.current) {
            await client.leaveDeviceGroup(deviceId);
          }
          
          joinedPlaylistGroups.current.clear();
          joinedDeviceGroups.current.clear();
        } catch (error) {
          console.error('Failed to cleanup groups:', error);
        }
      }

      cleanup();
    };
  }, [client]);

  // Connection management functions
  const connect = useCallback(async () => {
    await client.connect();
  }, [client]);

  const disconnect = useCallback(async () => {
    await client.disconnect();
  }, [client]);

  // Group management functions
  const joinPlaylistGroup = useCallback(async (id: number) => {
    await client.joinPlaylistGroup(id);
    joinedPlaylistGroups.current.add(id);
  }, [client]);

  const leavePlaylistGroup = useCallback(async (id: number) => {
    await client.leavePlaylistGroup(id);
    joinedPlaylistGroups.current.delete(id);
  }, [client]);

  const joinDeviceGroup = useCallback(async (id: number) => {
    await client.joinDeviceGroup(id);
    joinedDeviceGroups.current.add(id);
  }, [client]);

  const leaveDeviceGroup = useCallback(async (id: number) => {
    await client.leaveDeviceGroup(id);
    joinedDeviceGroups.current.delete(id);
  }, [client]);

  // Activity reporting functions
  const reportPlaylistView = useCallback(async (playlistId: number, deviceId: number) => {
    await client.reportPlaylistView(playlistId, deviceId);
  }, [client]);

  const reportPlaybackStarted = useCallback(async (playlistId: number, deviceId: number, mediaItemId: number) => {
    await client.reportPlaybackStarted(playlistId, deviceId, mediaItemId);
  }, [client]);

  const reportPlaybackStopped = useCallback(async (playlistId: number, deviceId: number, reason: string) => {
    await client.reportPlaybackStopped(playlistId, deviceId, reason);
  }, [client]);

  return {
    // Connection state
    isConnected: client.isConnected,
    connectionState,
    connectionError,
    
    // Connection management
    connect,
    disconnect,
    
    // Group management
    joinPlaylistGroup,
    leavePlaylistGroup,
    joinDeviceGroup,
    leaveDeviceGroup,
    
    // Activity reporting
    reportPlaylistView,
    reportPlaybackStarted,
    reportPlaybackStopped
  };
}

/**
 * Hook for monitoring a specific playlist with real-time updates
 */
export function useRealtimePlaylistById(
  playlistId: number,
  options: Omit<UseRealtimePlaylistOptions, 'playlistId'> = {}
): UseRealtimePlaylistReturn {
  return useRealtimePlaylist({
    ...options,
    playlistId
  });
}

/**
 * Hook for monitoring device-specific playlist updates
 */
export function useRealtimeDevicePlaylist(
  deviceId: number,
  options: Omit<UseRealtimePlaylistOptions, 'deviceIds'> = {}
): UseRealtimePlaylistReturn {
  return useRealtimePlaylist({
    ...options,
    deviceIds: [deviceId]
  });
}

/**
 * Hook for monitoring multiple devices
 */
export function useRealtimeMultiDevicePlaylist(
  deviceIds: number[],
  options: Omit<UseRealtimePlaylistOptions, 'deviceIds'> = {}
): UseRealtimePlaylistReturn {
  return useRealtimePlaylist({
    ...options,
    deviceIds
  });
}