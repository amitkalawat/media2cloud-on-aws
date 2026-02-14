import { useNavigate } from 'react-router-dom';
import { Film, Image, Headphones, FileText } from 'lucide-react';
import { formatDuration, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface MediaAsset {
  uuid: string;
  basename: string;
  type: string;
  thumbnail?: string;
  duration?: number;
  lastModified?: string;
  overallStatus?: string;
}

const typeIcons: Record<string, typeof Film> = {
  video: Film,
  photo: Image,
  podcast: Headphones,
  document: FileText,
};

const typeDotColors: Record<string, string> = {
  video: 'bg-media-video',
  photo: 'bg-media-photo',
  podcast: 'bg-media-audio',
  document: 'bg-media-document',
};

export function MediaCard({ asset }: { asset: MediaAsset }) {
  const navigate = useNavigate();
  const Icon = typeIcons[asset.type] || FileText;

  return (
    <div
      onClick={() => navigate(`/media/${asset.uuid}`)}
      className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-surface transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
    >
      <div className="relative aspect-video bg-background">
        {asset.thumbnail ? (
          <img
            src={asset.thumbnail}
            alt={asset.basename}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Icon className="h-12 w-12 text-text-secondary/30" />
          </div>
        )}

        {/* Media type dot */}
        <span className={cn(
          'absolute top-2 right-2 h-3 w-3 rounded-full ring-2 ring-white',
          typeDotColors[asset.type] || 'bg-text-secondary'
        )} />

        {/* Duration badge */}
        {asset.duration != null && asset.duration > 0 && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
            {formatDuration(asset.duration)}
          </span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/10">
          <span className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-medium text-text opacity-0 transition-opacity group-hover:opacity-100">
            View
          </span>
        </div>
      </div>

      <div className="p-3">
        <p className="truncate text-sm font-medium">{asset.basename}</p>
        {asset.lastModified && (
          <p className="mt-1 text-xs text-text-secondary">{formatDate(asset.lastModified)}</p>
        )}
      </div>
    </div>
  );
}
