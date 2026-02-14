import { formatDuration } from '@/lib/utils';

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

interface TranscriptionViewProps {
  segments: TranscriptSegment[];
  onSeek?: (time: number) => void;
}

export function TranscriptionView({ segments, onSeek }: TranscriptionViewProps) {
  if (!segments || segments.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-text-secondary">No transcription available for this asset.</p>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-1">
      {segments.map((segment, idx) => (
        <div
          key={idx}
          className="flex gap-4 rounded-lg px-4 py-2.5 hover:bg-accent-light/30 transition-colors group"
        >
          <button
            onClick={() => onSeek?.(segment.start)}
            className="shrink-0 rounded bg-background px-2 py-0.5 text-xs font-mono text-accent hover:bg-accent-light transition-colors"
          >
            {formatDuration(segment.start)}
          </button>
          <p className="text-sm text-text leading-relaxed">{segment.text}</p>
        </div>
      ))}
    </div>
  );
}
