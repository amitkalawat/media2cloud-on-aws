import { useRef, useEffect } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { Film, Headphones, FileText, ZoomIn } from 'lucide-react';

interface MediaAsset {
  type: string;
  proxyUrl?: string;
  thumbnail?: string;
  basename?: string;
  pages?: string[];
}

function VideoPlayer({ src, poster }: { src?: string; poster?: string }) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null);

  useEffect(() => {
    if (!videoRef.current || !src) return;

    const videoEl = document.createElement('video-js');
    videoEl.classList.add('vjs-big-play-centered', 'vjs-fluid');
    videoRef.current.appendChild(videoEl);

    playerRef.current = videojs(videoEl, {
      controls: true,
      fluid: true,
      poster,
      sources: [{ src, type: src.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp4' }],
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, poster]);

  if (!src) {
    return (
      <div className="flex aspect-video items-center justify-center bg-background">
        <Film className="h-16 w-16 text-text-secondary/30" />
      </div>
    );
  }

  return <div ref={videoRef} className="w-full" />;
}

function AudioPlayer({ src }: { src?: string }) {
  if (!src) {
    return (
      <div className="flex h-32 items-center justify-center bg-background">
        <Headphones className="h-12 w-12 text-text-secondary/30" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-media-audio/5 to-media-audio/10 p-12">
      <audio controls className="w-full max-w-lg" preload="metadata">
        <source src={src} />
      </audio>
    </div>
  );
}

function ImageViewer({ src, alt }: { src?: string; alt?: string }) {
  if (!src) {
    return (
      <div className="flex aspect-video items-center justify-center bg-background">
        <ZoomIn className="h-16 w-16 text-text-secondary/30" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-background p-4">
      <img
        src={src}
        alt={alt || 'Image'}
        className="max-h-[70vh] w-auto rounded-lg object-contain"
      />
    </div>
  );
}

function DocumentViewer({ pages }: { pages?: string[] }) {
  if (!pages || pages.length === 0) {
    return (
      <div className="flex aspect-video items-center justify-center bg-background">
        <FileText className="h-16 w-16 text-text-secondary/30" />
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-background p-4">
      {pages.map((page, idx) => (
        <div key={idx} className="flex justify-center">
          <img
            src={page}
            alt={`Page ${idx + 1}`}
            className="w-full max-w-2xl rounded border border-border shadow-sm"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}

export function MediaPlayer({ asset }: { asset: MediaAsset }) {
  switch (asset.type) {
    case 'video':
      return <VideoPlayer src={asset.proxyUrl} poster={asset.thumbnail} />;
    case 'podcast':
      return <AudioPlayer src={asset.proxyUrl} />;
    case 'photo':
      return <ImageViewer src={asset.proxyUrl} alt={asset.basename} />;
    case 'document':
      return <DocumentViewer pages={asset.pages} />;
    default:
      return (
        <div className="flex aspect-video items-center justify-center bg-background">
          <FileText className="h-16 w-16 text-text-secondary/30" />
        </div>
      );
  }
}
