import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useMediaList } from '@/hooks/useMedia';
import { MediaTypeFilter } from '@/components/media/MediaTypeFilter';
import { MediaGrid } from '@/components/media/MediaGrid';

export default function CollectionPage() {
  const { type } = useParams();
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useMediaList(type);

  const allAssets = useMemo(
    () => data?.pages.flatMap((page: any) => page.Items || page.assets || []) ?? [],
    [data]
  );

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Collection</h1>
      <MediaTypeFilter activeType={type} />
      <MediaGrid
        assets={allAssets}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        onLoadMore={() => fetchNextPage()}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  );
}
