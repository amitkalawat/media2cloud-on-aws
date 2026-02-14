import { MediaCard } from './MediaCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FolderOpen } from 'lucide-react';

interface MediaAsset {
  uuid: string;
  basename: string;
  type: string;
  thumbnail?: string;
  duration?: number;
  lastModified?: string;
  overallStatus?: string;
}

interface MediaGridProps {
  assets: MediaAsset[];
  isLoading: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  isFetchingNextPage?: boolean;
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border border-border bg-surface">
          <Skeleton className="aspect-video w-full" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <FolderOpen className="h-16 w-16 text-text-secondary/30 mb-4" />
      <h3 className="text-lg font-medium text-text">No media found</h3>
      <p className="mt-1 text-sm text-text-secondary">
        Upload some files to get started
      </p>
    </div>
  );
}

export function MediaGrid({ assets, isLoading, hasNextPage, onLoadMore, isFetchingNextPage }: MediaGridProps) {
  if (isLoading) return <SkeletonGrid />;
  if (assets.length === 0) return <EmptyState />;

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {assets.map((asset) => (
          <MediaCard key={asset.uuid} asset={asset} />
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </>
  );
}
