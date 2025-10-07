import { useQuery } from '@tanstack/react-query';
import { SceneService } from '@/services/sceneService';
import type { SceneDto } from '@/types/scene';

export function useSceneById(id: number) {
  return useQuery<SceneDto | undefined>({
    queryKey: ['scene', id],
    queryFn: () => SceneService.getById(id),
    enabled: !!id,
  });
}
