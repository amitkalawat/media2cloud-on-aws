import { useParams } from 'react-router-dom';
import { useAsset, useAnalysis } from '@/hooks/useAnalysis';
import { MediaPlayer } from '@/components/media/MediaPlayer';
import { MediaHeader } from '@/components/media/MediaHeader';
import { TechnicalInfo } from '@/components/analysis/TechnicalInfo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export default function MediaDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const { data: asset, isLoading: assetLoading } = useAsset(uuid!);
  const { data: analysis } = useAnalysis(uuid!);

  if (assetLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-96" />
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-lg font-medium text-text">Asset not found</h2>
        <p className="mt-1 text-sm text-text-secondary">
          The requested media could not be loaded.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <MediaHeader asset={asset} />

      <div className="mt-6 rounded-xl border border-border bg-surface overflow-hidden">
        <MediaPlayer asset={asset} />
      </div>

      <div className="mt-8">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transcription">Transcription</TabsTrigger>
            <TabsTrigger value="labels">Labels</TabsTrigger>
            <TabsTrigger value="faces">Faces</TabsTrigger>
            <TabsTrigger value="entities">Entities</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="py-4">
              <p className="text-text-secondary">
                Overview of analysis results will appear here.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="transcription">
            <div className="py-4">
              <p className="text-text-secondary">Transcription content — populated in Task 9.</p>
            </div>
          </TabsContent>

          <TabsContent value="labels">
            <div className="py-4">
              <p className="text-text-secondary">Labels content — populated in Task 9.</p>
            </div>
          </TabsContent>

          <TabsContent value="faces">
            <div className="py-4">
              <p className="text-text-secondary">Faces content — populated in Task 9.</p>
            </div>
          </TabsContent>

          <TabsContent value="entities">
            <div className="py-4">
              <p className="text-text-secondary">Entities content — populated in Task 9.</p>
            </div>
          </TabsContent>

          <TabsContent value="technical">
            <TechnicalInfo asset={asset} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
