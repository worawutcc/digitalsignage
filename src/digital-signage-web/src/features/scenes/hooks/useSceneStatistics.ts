import { useQuery } from '@tanstack/react-query';
import { SceneService } from '@/services/sceneService';
import type { SceneStatistics } from '@/types/scene';

export function useSceneStatistics() {
  return useQuery<SceneStatistics>({
    queryKey: ['sceneStatistics'],
    queryFn: SceneService.getStatistics,
  });
}
