import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useMediaList(type?: string) {
  return useInfiniteQuery({
    queryKey: ['media', type],
    queryFn: ({ pageParam }) => api.getAssets({
      type,
      pageSize: 20,
      token: pageParam,
    }),
    getNextPageParam: (lastPage: any) => lastPage.NextToken,
    initialPageParam: undefined as string | undefined,
  });
}
