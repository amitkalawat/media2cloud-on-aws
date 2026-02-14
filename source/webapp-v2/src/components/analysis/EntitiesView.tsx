import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ConfidenceBar } from './ConfidenceBar';

interface EntityResult {
  text: string;
  type: string;
  confidence: number;
}

interface EntitiesViewProps {
  entities: EntityResult[];
}

const entityTypeColors: Record<string, string> = {
  PERSON: 'bg-blue-100 text-blue-800',
  LOCATION: 'bg-green-100 text-green-800',
  ORGANIZATION: 'bg-purple-100 text-purple-800',
  DATE: 'bg-orange-100 text-orange-800',
  QUANTITY: 'bg-yellow-100 text-yellow-800',
  EVENT: 'bg-red-100 text-red-800',
  TITLE: 'bg-indigo-100 text-indigo-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

export function EntitiesView({ entities }: EntitiesViewProps) {
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  if (!entities || entities.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-text-secondary">No entities detected for this asset.</p>
      </div>
    );
  }

  // Group by type
  const grouped = entities.reduce<Record<string, EntityResult[]>>((acc, entity) => {
    const type = entity.type || 'OTHER';
    if (!acc[type]) acc[type] = [];
    acc[type].push(entity);
    return acc;
  }, {});

  const toggleType = (type: string) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  return (
    <div className="py-4 space-y-2">
      {Object.entries(grouped)
        .sort(([, a], [, b]) => b.length - a.length)
        .map(([type, typeEntities]) => {
          const isExpanded = expandedTypes.has(type);
          const colorClass = entityTypeColors[type] || entityTypeColors.OTHER;

          return (
            <div key={type} className="rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => toggleType(type)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-accent-light/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-text-secondary" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-text-secondary" />
                  )}
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
                    {type}
                  </span>
                </div>
                <Badge variant="outline">{typeEntities.length}</Badge>
              </button>

              {isExpanded && (
                <div className="border-t border-border">
                  {typeEntities
                    .sort((a, b) => b.confidence - a.confidence)
                    .map((entity, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-4 py-2.5 odd:bg-background"
                      >
                        <span className="text-sm text-text">{entity.text}</span>
                        <ConfidenceBar value={entity.confidence} />
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
