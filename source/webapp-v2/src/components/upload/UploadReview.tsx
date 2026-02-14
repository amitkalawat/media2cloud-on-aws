import { Check, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatFileSize } from '@/lib/utils';

interface FileStatus {
  file: File;
  md5Status: 'pending' | 'computing' | 'done';
  md5?: string;
  uploadProgress: number;
  uploadStatus: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

interface UploadReviewProps {
  files: FileStatus[];
  analysisConfig: Record<string, boolean>;
  groupName: string;
  isUploading: boolean;
  overallProgress: number;
  onUpload: () => void;
}

const md5StatusIcons = {
  pending: <Clock className="h-4 w-4 text-text-secondary" />,
  computing: <Clock className="h-4 w-4 text-warning animate-spin" />,
  done: <Check className="h-4 w-4 text-success" />,
};

const uploadStatusLabels = {
  pending: 'Waiting',
  uploading: 'Uploading',
  done: 'Complete',
  error: 'Error',
};

export function UploadReview({
  files,
  analysisConfig,
  groupName,
  isUploading,
  overallProgress,
  onUpload,
}: UploadReviewProps) {
  const enabledFeatures = Object.entries(analysisConfig)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const allMd5Done = files.every((f) => f.md5Status === 'done');
  const allUploadDone = files.every((f) => f.uploadStatus === 'done');

  return (
    <div className="space-y-6">
      {/* File list */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
          Files ({files.length})
        </h3>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-background">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium text-text-secondary">Name</th>
                <th className="px-4 py-2.5 text-right font-medium text-text-secondary">Size</th>
                <th className="px-4 py-2.5 text-center font-medium text-text-secondary">MD5</th>
                <th className="px-4 py-2.5 text-center font-medium text-text-secondary">Status</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f, idx) => (
                <tr key={idx} className="border-t border-border">
                  <td className="px-4 py-2.5 truncate max-w-xs">{f.file.name}</td>
                  <td className="px-4 py-2.5 text-right text-text-secondary">
                    {formatFileSize(f.file.size)}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex justify-center">{md5StatusIcons[f.md5Status]}</div>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {f.uploadStatus === 'uploading' ? (
                      <div className="flex items-center justify-center gap-2">
                        <Progress value={f.uploadProgress} className="w-16 h-1.5" />
                        <span className="text-xs text-text-secondary">{f.uploadProgress}%</span>
                      </div>
                    ) : f.uploadStatus === 'error' ? (
                      <div className="flex items-center justify-center gap-1 text-danger">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-xs">Error</span>
                      </div>
                    ) : (
                      <span className="text-xs text-text-secondary">
                        {uploadStatusLabels[f.uploadStatus]}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analysis summary */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
          Analysis Options
        </h3>
        <div className="flex flex-wrap gap-2">
          {enabledFeatures.map((feature) => (
            <Badge key={feature} variant="secondary">{feature}</Badge>
          ))}
          {enabledFeatures.length === 0 && (
            <p className="text-sm text-text-secondary">No analysis options selected.</p>
          )}
        </div>
      </div>

      {/* Group */}
      {groupName && (
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-text-secondary">
            Group
          </h3>
          <p className="text-sm text-text">{groupName}</p>
        </div>
      )}

      {/* Overall progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Overall Progress</span>
            <span className="font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} />
        </div>
      )}

      {/* Upload button */}
      {!allUploadDone && (
        <Button
          className="w-full"
          size="lg"
          onClick={onUpload}
          disabled={isUploading || !allMd5Done}
        >
          {isUploading
            ? 'Uploading...'
            : !allMd5Done
              ? 'Computing checksums...'
              : `Upload ${files.length} file${files.length > 1 ? 's' : ''}`}
        </Button>
      )}

      {allUploadDone && (
        <div className="rounded-lg bg-success/10 p-4 text-center">
          <Check className="mx-auto h-8 w-8 text-success mb-2" />
          <p className="text-sm font-medium text-success">All files uploaded successfully!</p>
        </div>
      )}
    </div>
  );
}
