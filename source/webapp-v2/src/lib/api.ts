import { SignatureV4 } from '@smithy/signature-v4';
import { HttpRequest } from '@smithy/protocol-http';
import { Sha256 } from '@aws-crypto/sha256-js';
import { getConfig } from './config';
import { useAuthStore } from '@/stores/authStore';

async function signedFetch(
  method: string,
  path: string,
  query?: Record<string, string>,
  body?: unknown
) {
  const config = getConfig();
  const credentials = useAuthStore.getState().credentials;

  if (!credentials) {
    throw new Error('Not authenticated');
  }

  const url = new URL(`${config.ApiEndpoint}/${path}`);

  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, v);
      }
    });
  }

  const request = new HttpRequest({
    method,
    protocol: 'https:',
    hostname: url.hostname,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
    headers: {
      'Content-Type': 'application/json',
      host: url.hostname,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const signer = new SignatureV4({
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
    region: config.Region,
    service: 'execute-api',
    sha256: Sha256,
    uriEscapePath: false,
  });

  const signed = await signer.sign(request);
  const response = await fetch(url.toString(), {
    method,
    headers: signed.headers as Record<string, string>,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errorCode) {
    throw new Error(`${data.errorCode} - ${data.errorMessage}`);
  }
  return data;
}

export const api = {
  // Assets
  getAssets: (params: { type?: string; pageSize?: number; token?: string }) =>
    signedFetch('GET', 'assets', {
      ...(params.type && { type: params.type }),
      ...(params.pageSize && { pageSize: String(params.pageSize) }),
      ...(params.token && { token: params.token }),
    }),

  getAsset: (uuid: string) =>
    signedFetch('GET', `assets/${uuid}`),

  deleteAsset: (uuid: string) =>
    signedFetch('DELETE', `assets/${uuid}`),

  // Analysis
  getAnalysis: (uuid: string) =>
    signedFetch('GET', `analysis/${uuid}`),

  startAnalysis: (uuid: string, input: unknown) =>
    signedFetch('POST', `analysis/${uuid}`, undefined, { input }),

  // Search
  search: (query: string, params?: Record<string, string>) =>
    signedFetch('GET', 'search', { q: query, ...params }),

  // Upload workflow
  startWorkflow: (input: unknown) =>
    signedFetch('POST', 'assets', undefined, { input }),

  // Settings
  getAiOptions: () => signedFetch('GET', 'ai-options'),
  updateAiOptions: (options: unknown) =>
    signedFetch('POST', 'ai-options', undefined, options),

  // IoT
  attachIot: () => signedFetch('POST', 'attach-policy'),

  // Stats
  getStats: () => signedFetch('GET', 'stats'),

  // Face collections
  getFaceCollections: () => signedFetch('GET', 'face-collections'),

  // Execution status
  getExecution: (executionArn: string) =>
    signedFetch('GET', 'execution', { executionArn }),
};
