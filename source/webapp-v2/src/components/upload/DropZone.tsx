import { useState, useRef, useCallback } from 'react';
import { Upload, X, Film, Image, Headphones, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/lib/utils';
import { cn } from '@/lib/utils';

const ACCEPT = 'video/*,audio/*,image/*,application/pdf';

const typeIcons: Record<string, typeof Film> = {
  video: Film,
  image: Image,
  audio: Headphones,
};

function getTypeIcon(mimeType: string) {
  for (const [key, Icon] of Object.entries(typeIcons)) {
    if (mimeType.startsWith(key)) return Icon;
  }
  return FileText;
}

interface DropZoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export function DropZone({ files, onFilesChange }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = Array.from(e.dataTransfer.files);
      onFilesChange([...files, ...dropped]);
    },
    [files, onFilesChange]
  );

  const handleSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || []);
      onFilesChange([...files, ...selected]);
      e.target.value = '';
    },
    [files, onFilesChange]
  );

  const removeFile = useCallback(
    (index: number) => {
      onFilesChange(files.filter((_, i) => i !== index));
    },
    [files, onFilesChange]
  );

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all duration-200',
          isDragging
            ? 'border-accent bg-accent-light/30'
            : 'border-border bg-background hover:border-accent/50 hover:bg-accent-light/10'
        )}
      >
        <Upload className={cn('h-10 w-10 mb-4', isDragging ? 'text-accent' : 'text-text-secondary')} />
        <p className="text-sm font-medium text-text">
          {isDragging ? 'Drop files here' : 'Drag files here or click to browse'}
        </p>
        <p className="mt-1 text-xs text-text-secondary">
          Video, audio, image, and PDF files supported
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={handleSelect}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, idx) => {
            const Icon = getTypeIcon(file.type);
            return (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="h-5 w-5 text-text-secondary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-text-secondary">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFile(idx)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
