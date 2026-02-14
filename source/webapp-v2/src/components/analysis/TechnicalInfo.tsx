import { formatFileSize } from '@/lib/utils';

interface TechnicalInfoProps {
  asset: {
    basename?: string;
    fileSize?: number;
    mime?: string;
    lastModified?: string;
    mediainfo?: {
      container?: Record<string, string>;
      video?: Record<string, string>;
      audio?: Record<string, string>;
    };
    imageinfo?: Record<string, string>;
  } | undefined;
}

function InfoRow({ label, value }: { label: string; value: string | number | undefined | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex justify-between py-2.5 px-4 odd:bg-background">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-mono text-text">{value}</span>
    </div>
  );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
        {title}
      </h3>
      <div className="rounded-lg border border-border overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export function TechnicalInfo({ asset }: TechnicalInfoProps) {
  if (!asset) return null;

  return (
    <div className="py-4 space-y-6">
      <InfoSection title="File Information">
        <InfoRow label="Filename" value={asset.basename} />
        <InfoRow label="Size" value={asset.fileSize ? formatFileSize(asset.fileSize) : undefined} />
        <InfoRow label="Type" value={asset.mime} />
        <InfoRow label="Last Modified" value={asset.lastModified} />
      </InfoSection>

      {asset.mediainfo?.container && (
        <InfoSection title="Container">
          {Object.entries(asset.mediainfo.container).map(([key, value]) => (
            <InfoRow key={key} label={key} value={value} />
          ))}
        </InfoSection>
      )}

      {asset.mediainfo?.video && (
        <InfoSection title="Video">
          {Object.entries(asset.mediainfo.video).map(([key, value]) => (
            <InfoRow key={key} label={key} value={value} />
          ))}
        </InfoSection>
      )}

      {asset.mediainfo?.audio && (
        <InfoSection title="Audio">
          {Object.entries(asset.mediainfo.audio).map(([key, value]) => (
            <InfoRow key={key} label={key} value={value} />
          ))}
        </InfoSection>
      )}

      {asset.imageinfo && (
        <InfoSection title="Image Info">
          {Object.entries(asset.imageinfo).map(([key, value]) => (
            <InfoRow key={key} label={key} value={value} />
          ))}
        </InfoSection>
      )}
    </div>
  );
}
