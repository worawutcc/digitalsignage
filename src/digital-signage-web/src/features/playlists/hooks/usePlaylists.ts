import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlaylistService } from '../services/playlistService';
import type { PlaylistDto, CreatePlaylistRequest, UpdatePlaylistRequest } from '../types';

export function usePlaylists() {
  return useQuery<PlaylistDto[]>({
    queryKey: ['playlists'],
    queryFn: PlaylistService.getAll,
    refetchOnWindowFocus: false,
  });
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlaylistRequest) => PlaylistService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}

export function useUpdatePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePlaylistRequest }) => 
      PlaylistService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => PlaylistService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}
