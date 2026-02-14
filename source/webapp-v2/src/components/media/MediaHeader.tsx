import { Link } from 'react-router-dom';
import { ChevronRight, RotateCcw, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { MEDIA_TYPE_LABELS } from '@/lib/constants';
import type { MediaType } from '@/lib/constants';

interface MediaHeaderProps {
  asset: {
    uuid: string;
    basename: string;
    type: string;
    overallStatus?: string;
  } | undefined;
  onReanalyze?: () => void;
  onDelete?: () => void;
}

const statusVariants: Record<string, 'default' | 'success' | 'destructive' | 'warning'> = {
  COMPLETED: 'success',
  PROCESSING: 'warning',
  ERROR: 'destructive',
};

export function MediaHeader({ asset, onReanalyze, onDelete }: MediaHeaderProps) {
  const { canWrite, canModify } = useAuthStore();

  if (!asset) return null;

  const typeLabel = MEDIA_TYPE_LABELS[asset.type as MediaType] || asset.type;
  const typeBadgeVariant = asset.type as 'video' | 'photo' | 'audio' | 'document';

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-text-secondary">
        <Link to="/collection" className="hover:text-accent transition-colors">
          Collection
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          to={`/collection/${asset.type}`}
          className="hover:text-accent transition-colors"
        >
          {typeLabel}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-text font-medium truncate max-w-xs">
          {asset.basename}
        </span>
      </nav>

      {/* Title + badges + actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="font-serif text-3xl truncate">{asset.basename}</h1>
          <Badge variant={typeBadgeVariant}>{typeLabel}</Badge>
          {asset.overallStatus && (
            <Badge variant={statusVariants[asset.overallStatus] || 'outline'}>
              {asset.overallStatus}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canWrite && onReanalyze && (
            <Button variant="outline" size="sm" onClick={onReanalyze}>
              <RotateCcw className="mr-1 h-4 w-4" />
              Re-analyze
            </Button>
          )}
          {canModify && onDelete && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
