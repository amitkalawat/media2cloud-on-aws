import { ConfidenceBar } from './ConfidenceBar';
import { User } from 'lucide-react';

interface FaceResult {
  name?: string;
  confidence: number;
  thumbnail?: string;
  gender?: string;
  ageRange?: string;
}

interface FacesViewProps {
  faces: FaceResult[];
}

export function FacesView({ faces }: FacesViewProps) {
  if (!faces || faces.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-text-secondary">No faces detected for this asset.</p>
      </div>
    );
  }

  // Group by identity
  const grouped = faces.reduce<Record<string, FaceResult[]>>((acc, face) => {
    const key = face.name || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(face);
    return acc;
  }, {});

  return (
    <div className="py-4 space-y-6">
      {Object.entries(grouped).map(([name, groupFaces]) => (
        <div key={name}>
          <h3 className="mb-3 text-sm font-semibold text-text">{name}</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {groupFaces.map((face, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center rounded-lg border border-border bg-surface p-3"
              >
                {face.thumbnail ? (
                  <img
                    src={face.thumbnail}
                    alt={face.name || 'Face'}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-light">
                    <User className="h-6 w-6 text-accent" />
                  </div>
                )}
                <div className="mt-2 w-full text-center">
                  {face.gender && (
                    <p className="text-xs text-text-secondary">{face.gender}</p>
                  )}
                  {face.ageRange && (
                    <p className="text-xs text-text-secondary">{face.ageRange}</p>
                  )}
                  <div className="mt-1 flex justify-center">
                    <ConfidenceBar value={face.confidence} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
