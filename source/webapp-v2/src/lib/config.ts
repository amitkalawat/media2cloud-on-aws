export interface SolutionConfig {
  Region: string;
  ApiEndpoint: string;
  ApiOps: Record<string, string>;
  Cognito: {
    UserPoolId: string;
    ClientId: string;
    IdentityPoolId: string;
    Group: { Viewer: string; Creator: string; Admin: string };
  };
  IotHost: string;
  IotTopic: string;
  Ingest: { Bucket: string };
  Proxy: { Bucket: string };
  S3: { ExpectedBucketOwner: string };
  KnowledgeGraph?: { Endpoint: string; ApiKey: string };
  Shoppable?: { Endpoint: string; ApiKey: string };
}

let _config: SolutionConfig | null = null;

export async function loadConfig(): Promise<SolutionConfig> {
  if (_config) return _config;
  // solution-manifest.js sets window.SolutionManifest
  await import('/solution-manifest.js');
  _config = (window as any).SolutionManifest;
  if (!_config) throw new Error('SolutionManifest not found');
  return _config;
}

export function getConfig(): SolutionConfig {
  if (!_config) throw new Error('Config not loaded. Call loadConfig() first.');
  return _config;
}
