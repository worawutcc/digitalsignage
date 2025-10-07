import { useQuery } from '@tanstack/react-query';
import { SceneService } from '@/services/sceneService';
import type { SceneDto } from '@/types/scene';

export function useScenesByUserId(userId: number) {
  return useQuery<SceneDto[]>({
    queryKey: ['scenes', 'user', userId],
    queryFn: () => SceneService.getByUserId(userId),
    enabled: !!userId,
  });
}
