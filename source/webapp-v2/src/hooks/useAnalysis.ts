import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useAnalysis(uuid: string) {
  return useQuery({
    queryKey: ['analysis', uuid],
    queryFn: () => api.getAnalysis(uuid),
    enabled: !!uuid,
  });
}

export function useAsset(uuid: string) {
  return useQuery({
    queryKey: ['asset', uuid],
    queryFn: () => api.getAsset(uuid),
    enabled: !!uuid,
  });
}
