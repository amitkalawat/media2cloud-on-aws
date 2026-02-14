import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import SparkMD5 from 'spark-md5';

export async function computeMD5(file: File): Promise<string> {
  const spark = new SparkMD5.ArrayBuffer();
  const chunkSize = 8 * 1024 * 1024; // 8MB chunks matching existing code
  let offset = 0;

  while (offset < file.size) {
    const chunk = await file.slice(offset, offset + chunkSize).arrayBuffer();
    spark.append(chunk);
    offset += chunkSize;
  }
  return spark.end();
}

export async function uploadToS3(params: {
  file: File;
  bucket: string;
  key: string;
  uuid: string;
  md5: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
  };
  region: string;
  onProgress?: (pct: number) => void;
}) {
  const client = new S3Client({
    region: params.region,
    credentials: {
      accessKeyId: params.credentials.accessKeyId,
      secretAccessKey: params.credentials.secretAccessKey,
      sessionToken: params.credentials.sessionToken,
    },
  });

  const upload = new Upload({
    client,
    params: {
      Bucket: params.bucket,
      Key: params.key,
      Body: params.file,
      ContentType: params.file.type,
      Metadata: {
        uuid: params.uuid,
        md5: params.md5,
        webupload: new Date().toISOString(),
      },
    },
    queueSize: 4,
    partSize: 8 * 1024 * 1024,
  });

  upload.on('httpUploadProgress', (progress) => {
    if (progress.loaded && progress.total) {
      params.onProgress?.(Math.round((progress.loaded / progress.total) * 100));
    }
  });

  await upload.done();
}
