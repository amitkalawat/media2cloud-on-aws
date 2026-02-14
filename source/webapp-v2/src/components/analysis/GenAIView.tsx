import { Sparkles } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface SceneDescription {
  timestamp?: number;
  text: string;
}

interface GenAIViewProps {
  descriptions: SceneDescription[];
  summary?: string;
}

export function GenAIView({ descriptions, summary }: GenAIViewProps) {
  if ((!descriptions || descriptions.length === 0) && !summary) {
    return (
      <div className="py-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <Sparkles className="h-10 w-10 text-accent/30" />
          <p className="text-text-secondary">No AI-generated descriptions available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-6">
      {summary && (
        <div className="rounded-lg border border-accent/20 bg-accent-light/30 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold text-accent">AI Summary</h3>
          </div>
          <p className="text-sm text-text leading-relaxed">{summary}</p>
        </div>
      )}

      {descriptions && descriptions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
            Scene Descriptions
          </h3>
          {descriptions.map((scene, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-border bg-surface p-4"
            >
              {scene.timestamp != null && (
                <span className="inline-block mb-2 rounded bg-background px-2 py-0.5 text-xs font-mono text-accent">
                  {formatDuration(scene.timestamp)}
                </span>
              )}
              <p className="text-sm text-text leading-relaxed">{scene.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
