import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SceneService } from '@/services/sceneService';
import type { SceneDto, CreateSceneRequest, UpdateSceneRequest } from '@/types/scene';

export function useScenes() {
  return useQuery<SceneDto[]>({
    queryKey: ['scenes'],
    queryFn: SceneService.getAll,
    refetchOnWindowFocus: false,
  });
}

export function useCreateScene() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSceneRequest) => SceneService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenes'] });
    },
  });
}

export function useUpdateScene() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSceneRequest }) => 
      SceneService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenes'] });
    },
  });
}

export function useDeleteScene() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => SceneService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenes'] });
    },
  });
}
