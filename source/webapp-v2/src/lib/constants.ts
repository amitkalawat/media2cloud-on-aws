export const MEDIA_TYPES = {
  VIDEO: 'video',
  PHOTO: 'photo',
  PODCAST: 'podcast',
  DOCUMENT: 'document',
} as const;

export type MediaType = typeof MEDIA_TYPES[keyof typeof MEDIA_TYPES];

export const MEDIA_TYPE_COLORS: Record<MediaType, string> = {
  video: 'bg-media-video',
  photo: 'bg-media-photo',
  podcast: 'bg-media-audio',
  document: 'bg-media-document',
};

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  video: 'Video',
  photo: 'Photo',
  podcast: 'Audio',
  document: 'Document',
};

export const OVERALL_STATUS = {
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR',
} as const;

export const ANALYSIS_TYPES = [
  'celeb', 'face', 'face_match', 'label', 'moderation',
  'person', 'segment', 'text', 'transcribe', 'keyphrase',
  'entity', 'sentiment', 'textract', 'custom_label',
] as const;
