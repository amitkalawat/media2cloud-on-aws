import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { ConfidenceBar } from './ConfidenceBar';

interface ModerationResult {
  name: string;
  confidence: number;
  parentName?: string;
}

interface ModerationViewProps {
  flags: ModerationResult[];
}

export function ModerationView({ flags }: ModerationViewProps) {
  if (!flags || flags.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <ShieldAlert className="h-10 w-10 text-success/50" />
          <p className="text-text-secondary">No moderation flags found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-2">
      {flags
        .sort((a, b) => b.confidence - a.confidence)
        .map((flag, idx) => {
          const severity = flag.confidence >= 80 ? 'high' : flag.confidence >= 50 ? 'medium' : 'low';
          const severityStyles = {
            high: 'border-danger/30 bg-danger/5',
            medium: 'border-warning/30 bg-warning/5',
            low: 'border-border bg-surface',
          };

          return (
            <div
              key={idx}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 ${severityStyles[severity]}`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle
                  className={`h-5 w-5 ${
                    severity === 'high'
                      ? 'text-danger'
                      : severity === 'medium'
                        ? 'text-warning'
                        : 'text-text-secondary'
                  }`}
                />
                <div>
                  <p className="text-sm font-medium">{flag.name}</p>
                  {flag.parentName && (
                    <p className="text-xs text-text-secondary">{flag.parentName}</p>
                  )}
                </div>
              </div>
              <ConfidenceBar value={flag.confidence} />
            </div>
          );
        })}
    </div>
  );
}
