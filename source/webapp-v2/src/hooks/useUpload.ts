import { useState, useCallback } from 'react';
import { computeMD5, uploadToS3 } from '@/lib/s3';
import { api } from '@/lib/api';
import { getConfig } from '@/lib/config';
import { useAuthStore } from '@/stores/authStore';

interface FileStatus {
  file: File;
  md5Status: 'pending' | 'computing' | 'done';
  md5?: string;
  uploadProgress: number;
  uploadStatus: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

interface Attribute {
  key: string;
  value: string;
}

export function useUpload() {
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [groupName, setGroupName] = useState('');
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [analysisConfig, setAnalysisConfig] = useState<Record<string, boolean>>({
    celeb: true, face: true, faceMatch: true, label: true,
    moderation: true, person: true, text: true, segment: true,
    transcribe: true, keyphrase: true, entity: true, sentiment: true,
    textract: true, scene: false, adbreak: false, autoFaceIndexer: false,
  });
  const [isUploading, setIsUploading] = useState(false);

  const setRawFiles = useCallback((rawFiles: File[]) => {
    setFiles(rawFiles.map((file) => ({
      file,
      md5Status: 'pending',
      uploadProgress: 0,
      uploadStatus: 'pending',
    })));
  }, []);

  const computeChecksums = useCallback(async () => {
    for (let i = 0; i < files.length; i++) {
      setFiles((prev) => {
        const updated = [...prev];
        updated[i] = { ...updated[i], md5Status: 'computing' };
        return updated;
      });

      const md5 = await computeMD5(files[i].file);

      setFiles((prev) => {
        const updated = [...prev];
        updated[i] = { ...updated[i], md5Status: 'done', md5 };
        return updated;
      });
    }
  }, [files]);

  const uploadAll = useCallback(async () => {
    const config = getConfig();
    const credentials = useAuthStore.getState().credentials;
    if (!credentials) throw new Error('Not authenticated');

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const fileStatus = files[i];
      const uuid = crypto.randomUUID();
      const key = `${uuid}/${fileStatus.file.name}`;

      setFiles((prev) => {
        const updated = [...prev];
        updated[i] = { ...updated[i], uploadStatus: 'uploading' };
        return updated;
      });

      try {
        await uploadToS3({
          file: fileStatus.file,
          bucket: config.Ingest.Bucket,
          key,
          uuid,
          md5: fileStatus.md5 || '',
          credentials,
          region: config.Region,
          onProgress: (pct) => {
            setFiles((prev) => {
              const updated = [...prev];
              updated[i] = { ...updated[i], uploadProgress: pct };
              return updated;
            });
          },
        });

        // Start workflow
        const input: Record<string, any> = {
          uuid,
          bucket: config.Ingest.Bucket,
          key,
          destination: { bucket: config.Proxy.Bucket },
          aiOptions: analysisConfig,
        };

        if (groupName) input.group = groupName;

        const attrs = attributes.filter((a) => a.key && a.value);
        if (attrs.length > 0) {
          input.attributes = Object.fromEntries(attrs.map((a) => [a.key, a.value]));
        }

        await api.startWorkflow(input);

        setFiles((prev) => {
          const updated = [...prev];
          updated[i] = { ...updated[i], uploadStatus: 'done', uploadProgress: 100 };
          return updated;
        });
      } catch (err: any) {
        setFiles((prev) => {
          const updated = [...prev];
          updated[i] = { ...updated[i], uploadStatus: 'error', error: err.message };
          return updated;
        });
      }
    }

    setIsUploading(false);
  }, [files, analysisConfig, groupName, attributes]);

  const overallProgress = files.length > 0
    ? Math.round(files.reduce((sum, f) => sum + f.uploadProgress, 0) / files.length)
    : 0;

  return {
    files,
    setRawFiles,
    groupName,
    setGroupName,
    attributes,
    setAttributes,
    analysisConfig,
    setAnalysisConfig,
    isUploading,
    computeChecksums,
    uploadAll,
    overallProgress,
  };
}
