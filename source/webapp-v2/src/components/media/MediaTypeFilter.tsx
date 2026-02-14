import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Film, Image, Headphones, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface FilterItem {
  key: string | undefined;
  label: string;
  icon: LucideIcon;
  color?: string;
}

const types: FilterItem[] = [
  { key: undefined, label: 'All', icon: LayoutGrid },
  { key: 'video', label: 'Video', icon: Film, color: 'bg-media-video' },
  { key: 'photo', label: 'Photos', icon: Image, color: 'bg-media-photo' },
  { key: 'podcast', label: 'Audio', icon: Headphones, color: 'bg-media-audio' },
  { key: 'document', label: 'Documents', icon: FileText, color: 'bg-media-document' },
];

interface MediaTypeFilterProps {
  activeType?: string;
}

export function MediaTypeFilter({ activeType }: MediaTypeFilterProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {types.map((item) => {
        const isActive = activeType === item.key;
        const Icon = item.icon;

        return (
          <button
            key={item.label}
            onClick={() => navigate(item.key ? `/collection/${item.key}` : '/collection')}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150',
              isActive
                ? item.color
                  ? `${item.color} text-white shadow-sm`
                  : 'bg-accent text-white shadow-sm'
                : 'border border-border bg-surface text-text-secondary hover:bg-accent-light hover:text-text'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
