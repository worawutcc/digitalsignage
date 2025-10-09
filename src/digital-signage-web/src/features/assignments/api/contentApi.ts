/**
 * @fileoverview Content API Service for Assignment Wizard
 * @description API client for fetching schedules, playlists, and media for content selection
 */

import { apiClient } from '@/lib/api';

export interface ContentItem {
  id: number;
  name: string;
  type: 'schedule' | 'playlist' | 'media';
  description?: string;
  status?: string;
  duration?: number;
  mediaCount?: number;
}

/**
 * Get all schedules for assignment wizard
 */
export async function getSchedules(): Promise<ContentItem[]> {
  try {
    const response = await apiClient.get('/api/admin/schedules');
    console.log('📅 Schedules API response:', response.data);
    
    const schedulesArray = Array.isArray(response.data) ? response.data : [];
    
    return schedulesArray.map((schedule: any) => ({
      id: schedule.id,
      name: schedule.name || 'Untitled Schedule',
      type: 'schedule' as const,
      description: schedule.description || 'No description',
      status: schedule.status || 'active',
    }));
  } catch (error) {
    console.error('❌ Failed to fetch schedules:', error);
    return [];
  }
}

/**
 * Get all playlists for assignment wizard
 */
export async function getPlaylists(): Promise<ContentItem[]> {
  try {
    const response = await apiClient.get('/api/playlist');
    console.log('🎵 Playlists API response:', response.data);
    
    const playlistsArray = Array.isArray(response.data) ? response.data : [];
    
    return playlistsArray.map((playlist: any) => ({
      id: playlist.id,
      name: playlist.name || 'Untitled Playlist',
      type: 'playlist' as const,
      description: `${playlist.description || 'No description'} (${playlist.sceneCount || 0} scenes)`,
      mediaCount: playlist.sceneCount || 0,
    }));
  } catch (error) {
    console.error('❌ Failed to fetch playlists:', error);
    return [];
  }
}

/**
 * Get all media for assignment wizard
 */
export async function getMedia(): Promise<ContentItem[]> {
  try {
    const response = await apiClient.get('/api/media');
    console.log('📦 Media API response:', response.data);
    
    // Backend returns array directly, not wrapped in { items: [] }
    const mediaArray = Array.isArray(response.data) ? response.data : [];
    
    return mediaArray.map((media: any) => ({
      id: media.id,
      name: media.fileName || media.name || 'Untitled',
      type: 'media' as const,
      description: media.fileType ? 
        `${media.fileType} - ${(media.fileSize / 1024 / 1024).toFixed(2)} MB` : 
        'No description',
      status: media.status || 'unknown',
    }));
  } catch (error) {
    console.error('❌ Failed to fetch media:', error);
    return [];
  }
}

/**
 * Get content by assignment type
 */
export async function getContentByType(type: 'schedule' | 'playlist' | 'media'): Promise<ContentItem[]> {
  switch (type) {
    case 'schedule':
      return getSchedules();
    case 'playlist':
      return getPlaylists();
    case 'media':
      return getMedia();
    default:
      return [];
  }
}
