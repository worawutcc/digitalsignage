import { useQuery } from '@tanstack/react-query';
import { SceneService } from '@/services/sceneService';
import type { SceneDto } from '@/types/scene';

export function useSceneTemplates() {
  return useQuery<SceneDto[]>({
    queryKey: ['sceneTemplates'],
    queryFn: SceneService.getTemplates,
  });
}
