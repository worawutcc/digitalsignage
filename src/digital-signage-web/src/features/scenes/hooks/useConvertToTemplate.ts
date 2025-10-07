import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SceneService } from '@/services/sceneService';

export function useConvertToTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, templateName }: { id: number; templateName: string }) => 
      SceneService.convertToTemplate(id, templateName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenes'] });
    },
  });
}
