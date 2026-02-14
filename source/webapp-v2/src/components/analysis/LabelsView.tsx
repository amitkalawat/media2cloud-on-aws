import { useState, useMemo } from 'react';
import { ConfidenceBar } from './ConfidenceBar';
import { Badge } from '@/components/ui/badge';

interface LabelResult {
  name: string;
  confidence: number;
  count?: number;
  parents?: string[];
}

interface LabelsViewProps {
  labels: LabelResult[];
}

export function LabelsView({ labels }: LabelsViewProps) {
  const [minConfidence, setMinConfidence] = useState(50);

  const filteredLabels = useMemo(
    () => labels
      ?.filter((l) => l.confidence >= minConfidence)
      .sort((a, b) => b.confidence - a.confidence) ?? [],
    [labels, minConfidence]
  );

  if (!labels || labels.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-text-secondary">No labels detected for this asset.</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm text-text-secondary">Min Confidence:</label>
        <input
          type="range"
          min={0}
          max={100}
          value={minConfidence}
          onChange={(e) => setMinConfidence(Number(e.target.value))}
          className="w-40 accent-accent"
        />
        <span className="text-sm font-mono text-text">{minConfidence}%</span>
        <Badge variant="secondary">{filteredLabels.length} labels</Badge>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filteredLabels.map((label) => (
          <div
            key={label.name}
            className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{label.name}</p>
              {label.parents && label.parents.length > 0 && (
                <p className="text-xs text-text-secondary truncate">
                  {label.parents.join(' > ')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-3">
              {label.count != null && label.count > 1 && (
                <span className="text-xs text-text-secondary">{label.count}x</span>
              )}
              <ConfidenceBar value={label.confidence} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
