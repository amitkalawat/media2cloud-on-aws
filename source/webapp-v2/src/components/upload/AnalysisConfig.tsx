import { cn } from '@/lib/utils';

interface AnalysisOption {
  key: string;
  label: string;
  enabled: boolean;
}

interface AnalysisGroup {
  title: string;
  options: AnalysisOption[];
}

interface AnalysisConfigProps {
  config: Record<string, boolean>;
  onChange: (key: string, enabled: boolean) => void;
}

const analysisGroups: AnalysisGroup[] = [
  {
    title: 'Rekognition',
    options: [
      { key: 'celeb', label: 'Celebrity Recognition', enabled: true },
      { key: 'face', label: 'Face Detection', enabled: true },
      { key: 'faceMatch', label: 'Face Matching', enabled: true },
      { key: 'label', label: 'Label Detection', enabled: true },
      { key: 'moderation', label: 'Content Moderation', enabled: true },
      { key: 'person', label: 'Person Tracking', enabled: true },
      { key: 'text', label: 'Text Detection', enabled: true },
      { key: 'segment', label: 'Segment Detection', enabled: true },
    ],
  },
  {
    title: 'Transcribe',
    options: [
      { key: 'transcribe', label: 'Speech-to-Text', enabled: true },
    ],
  },
  {
    title: 'Comprehend',
    options: [
      { key: 'keyphrase', label: 'Key Phrases', enabled: true },
      { key: 'entity', label: 'Entity Detection', enabled: true },
      { key: 'sentiment', label: 'Sentiment Analysis', enabled: true },
    ],
  },
  {
    title: 'Textract',
    options: [
      { key: 'textract', label: 'Document Analysis', enabled: true },
    ],
  },
  {
    title: 'Advanced',
    options: [
      { key: 'scene', label: 'Scene Detection (Bedrock)', enabled: false },
      { key: 'adbreak', label: 'Ad Break Detection', enabled: false },
      { key: 'autoFaceIndexer', label: 'Auto Face Indexer', enabled: false },
    ],
  },
];

function ToggleSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
        enabled ? 'bg-accent' : 'bg-border'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200',
          enabled ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

export function AnalysisConfig({ config, onChange }: AnalysisConfigProps) {
  return (
    <div className="space-y-6">
      {analysisGroups.map((group) => (
        <div key={group.title}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
            {group.title}
          </h3>
          <div className="space-y-1">
            {group.options.map((option) => (
              <div
                key={option.key}
                className="flex items-center justify-between rounded-lg px-4 py-3 hover:bg-accent-light/30 transition-colors"
              >
                <span className="text-sm text-text">{option.label}</span>
                <ToggleSwitch
                  enabled={config[option.key] ?? option.enabled}
                  onChange={(enabled) => onChange(option.key, enabled)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
