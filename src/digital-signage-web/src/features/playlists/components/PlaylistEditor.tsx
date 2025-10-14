'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { 
  Save, 
  ArrowLeft,
  Clock,
  Upload,
  Settings,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Playlist } from '@/types/playlist';
import type { 
  PlaylistDto, 
  PlaylistItemDto, 
  CreatePlaylistItemRequest 
} from '../types';
import { TransitionEffect } from '@/types/playlist';
import type { MediaType } from '@/types/media';
import { MediaPicker } from './MediaPicker';
import { PlaylistService } from '../services/playlistService';

interface PlaylistEditorProps {
  playlist?: Playlist;
  isEditing?: boolean;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  className?: string;
}

export function PlaylistEditor({
  playlist,
  isEditing = false,
  onSave,
  onCancel,
  className,
}: PlaylistEditorProps) {
  const router = useRouter();
  
  // State management
  const [activeView, setActiveView] = useState<'details' | 'media' | 'settings'>('details');
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState({
    name: playlist?.name || '',
    description: playlist?.description || '',
    isLooped: playlist?.isLooped || false,
    priority: playlist?.priority || 0
  });
  const [playlistItems, setPlaylistItems] = useState<PlaylistItemDto[]>(
    (playlist as any)?.playlistItems || []
  );

  // Handle form field changes
  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  // Handle save
  const handleSave = useCallback(() => {
    // Convert PlaylistItemDto to CreatePlaylistItemRequest for new playlists
    const playlistItemsForCreate = playlistItems.map((item, index) => ({
      mediaId: item.mediaId,
      orderIndex: index + 1, // 1-based indexing
      durationSeconds: item.durationSeconds || 10,
      useCustomDuration: item.useCustomDuration || false,
      transitionEffect: item.transitionEffect || TransitionEffect.Cut,
      transitionDurationMs: item.transitionDurationMs || 0,
      isConditional: item.isConditional || false,
      startTime: item.startTime || null,
      endTime: item.endTime || null
    }));

    const completeData = {
      ...formData,
      playlistItems: playlistItemsForCreate
    };

    console.log('💾 PlaylistEditor saving data:', completeData);
    console.log('📋 Playlist items to save:', playlistItemsForCreate);
    
    onSave?.(completeData);
    setIsDirty(false);
  }, [formData, playlistItems, onSave]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    
    onCancel?.();
    router.back();
  }, [isDirty, onCancel, router]);

  // Handle media selection change
  const handleMediaSelectionChange = useCallback((mediaIds: number[]) => {
    if (isEditing && playlist?.id) {
      // For existing playlists, add new media items via API
      handleAddMediaToExistingPlaylist(mediaIds);
    } else {
      // For new playlists, just update local state
      handleMediaSelectionForNewPlaylist(mediaIds);
    }
  }, [isEditing, playlist?.id, playlistItems]);

  // Handle adding media to existing playlist (API call)
  const handleAddMediaToExistingPlaylist = useCallback(async (mediaIds: number[]) => {
    if (!playlist?.id || mediaIds.length === 0) return;

    try {
      for (const mediaId of mediaIds) {
        const request: CreatePlaylistItemRequest = {
          mediaId,
          orderIndex: playlistItems.length + 1,
          durationSeconds: 10,
          useCustomDuration: false
        };

        const newItem = await PlaylistService.addItem(playlist.id, request);
        setPlaylistItems(prev => [...prev, newItem]);
      }
      setIsDirty(true);
    } catch (error) {
      console.error('❌ Error adding media to existing playlist:', error);
    }
  }, [playlist?.id, playlistItems.length]);

  // Handle media selection for new playlist (local state only)
  const handleMediaSelectionForNewPlaylist = useCallback((mediaIds: number[]) => {
    console.log('📋 Media selection changed for new playlist:', mediaIds);
    
    // Convert media IDs to playlist items for local state
    const newPlaylistItems: PlaylistItemDto[] = mediaIds.map((mediaId, index) => ({
      id: -mediaId, // Use negative ID for temporary items
      playlistId: playlist?.id || 0, // Will be set when playlist is created
      mediaId,
      mediaName: `Media ${mediaId}`, // Placeholder - will be resolved later
      mediaFileName: `media_${mediaId}`, // Placeholder
      mediaType: 'Image' as MediaType, // Default - will be resolved later
      orderIndex: index + 1,
      durationSeconds: 10,
      useCustomDuration: false,
      transitionEffect: TransitionEffect.Cut,
      transitionDurationMs: 0,
      isConditional: false,
      startTime: null,
      endTime: null
    }));

    setPlaylistItems(newPlaylistItems);
    setIsDirty(true);
  }, []);

  // Handle removing media from playlist
  const handleRemoveMedia = useCallback(async (itemId: number) => {
    if (!playlist?.id) return;

    try {
      await PlaylistService.removeItem(playlist.id, itemId);
      setPlaylistItems(prev => prev.filter(item => item.id !== itemId));
      setIsDirty(true);
    } catch (error) {
      console.error('Error removing media from playlist:', error);
    }
  }, [playlist?.id]);

  // Calculate metrics
  const itemCount = playlist?.playlistItems?.length || 0;
  const totalDuration = playlist?.totalDurationSeconds || 0;

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Playlist' : 'Create Playlist'}
            </h1>
            {playlist && (
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={playlist.status === 1 ? 'success' : 'default'}
                >
                  {playlist.status === 1 ? 'Active' : 'Draft'}
                </Badge>
                <span className="text-sm text-gray-500">
                  Created {new Date(playlist.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Playlist Metrics */}
          <div className="flex items-center gap-4 text-sm text-gray-600 border-l pl-4">
            <div className="flex items-center gap-1">
              <Upload className="h-4 w-4" />
              <span>{itemCount} items</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(totalDuration)}</span>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={!isDirty}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b">
        <nav className="flex px-6">
          <button
            onClick={() => setActiveView('details')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2',
              activeView === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <Settings className="h-4 w-4" />
            Details
          </button>
          <button
            onClick={() => setActiveView('media')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2',
              activeView === 'media'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <Upload className="h-4 w-4" />
            Media ({itemCount})
          </button>
          <button
            onClick={() => setActiveView('settings')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2',
              activeView === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <Monitor className="h-4 w-4" />
            Settings
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {activeView === 'details' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Playlist Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Enter playlist name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Enter playlist description"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isLooped}
                    onChange={(e) => handleFieldChange('isLooped', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Loop Playlist</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => handleFieldChange('priority', parseInt(e.target.value) || 0)}
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        )}

        {activeView === 'media' && (
          <div className="h-full">
            <MediaPicker
              selectedMedia={playlistItems.map(item => item.mediaId)}
              onSelectionChange={handleMediaSelectionChange}
              multiSelect={true}
              showFilters={true}
            />
          </div>
        )}

        {activeView === 'settings' && (
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Advanced Settings</h3>
            <p className="mt-1 text-sm text-gray-500">
              Settings panel will be added in the next phase
            </p>
          </div>
        )}
      </div>

      {/* Unsaved Changes Warning */}
      {isDirty && (
        <div className="border-t bg-yellow-50 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-yellow-800">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span className="text-sm font-medium">You have unsaved changes</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDirty(false)}
                className="text-yellow-800"
              >
                Discard
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}