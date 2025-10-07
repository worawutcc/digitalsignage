import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SceneService } from '@/services/sceneService';

export function useDuplicateScene() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => SceneService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenes'] });
    },
  });
}
