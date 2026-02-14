import { useParams } from 'react-router-dom';
import { useAsset, useAnalysis } from '@/hooks/useAnalysis';
import { MediaPlayer } from '@/components/media/MediaPlayer';
import { MediaHeader } from '@/components/media/MediaHeader';
import { TechnicalInfo } from '@/components/analysis/TechnicalInfo';
import { TranscriptionView } from '@/components/analysis/TranscriptionView';
import { LabelsView } from '@/components/analysis/LabelsView';
import { FacesView } from '@/components/analysis/FacesView';
import { EntitiesView } from '@/components/analysis/EntitiesView';
import { ModerationView } from '@/components/analysis/ModerationView';
import { GenAIView } from '@/components/analysis/GenAIView';
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

  const hasTranscription = analysis?.transcription?.segments?.length > 0;
  const hasLabels = analysis?.labels?.length > 0;
  const hasFaces = analysis?.faces?.length > 0;
  const hasEntities = analysis?.entities?.length > 0;
  const hasModeration = analysis?.moderation?.length > 0;
  const hasGenAI = analysis?.genai?.descriptions?.length > 0 || analysis?.genai?.summary;

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
            {hasModeration && <TabsTrigger value="moderation">Moderation</TabsTrigger>}
            {hasGenAI && <TabsTrigger value="genai">AI Insights</TabsTrigger>}
            <TabsTrigger value="technical">Technical</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="py-4">
              <p className="text-text-secondary">
                {analysis
                  ? 'Select a tab above to view detailed analysis results.'
                  : 'Analysis results are not yet available for this asset.'}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="transcription">
            <TranscriptionView segments={analysis?.transcription?.segments || []} />
          </TabsContent>

          <TabsContent value="labels">
            <LabelsView labels={analysis?.labels || []} />
          </TabsContent>

          <TabsContent value="faces">
            <FacesView faces={analysis?.faces || []} />
          </TabsContent>

          <TabsContent value="entities">
            <EntitiesView entities={analysis?.entities || []} />
          </TabsContent>

          {hasModeration && (
            <TabsContent value="moderation">
              <ModerationView flags={analysis?.moderation || []} />
            </TabsContent>
          )}

          {hasGenAI && (
            <TabsContent value="genai">
              <GenAIView
                descriptions={analysis?.genai?.descriptions || []}
                summary={analysis?.genai?.summary}
              />
            </TabsContent>
          )}

          <TabsContent value="technical">
            <TechnicalInfo asset={asset} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
