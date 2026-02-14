# Webapp UI Overhaul — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite the Media2Cloud webapp as a React/TypeScript SPA with Tailwind + shadcn/ui, delivering Phase 1 core screens (auth, app shell, collection browse, media detail, upload).

**Architecture:** Vite-based React 18 app in `source/webapp-v2/`. Consumes the same API Gateway endpoints (SigV4-signed) and Cognito auth as the existing webapp. Uses TanStack Query for data fetching, Zustand for client state, React Router v6 for navigation.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS 3, shadcn/ui, Lucide React, Video.js React, Recharts, AWS SDK v3 (Cognito, S3, IoT), TanStack Query, Zustand

---

## Task 1: Project Scaffolding

**Files:**
- Create: `source/webapp-v2/` (entire project scaffold)

**Step 1: Initialize Vite + React + TypeScript project**

```bash
cd source
npm create vite@latest webapp-v2 -- --template react-ts
cd webapp-v2
```

**Step 2: Install core dependencies**

```bash
npm install react-router-dom @tanstack/react-query zustand
npm install tailwindcss @tailwindcss/vite
npm install lucide-react recharts
npm install class-variance-authority clsx tailwind-merge
npm install -D @types/node
```

**Step 3: Install AWS SDK v3 packages**

```bash
npm install @aws-sdk/client-cognito-identity-provider \
  @aws-sdk/client-cognito-identity \
  @aws-sdk/credential-providers \
  @aws-sdk/client-s3 \
  @aws-sdk/lib-storage \
  @aws-sdk/client-iot \
  @smithy/signature-v4 \
  @smithy/protocol-http \
  @aws-crypto/sha256-js \
  spark-md5
npm install -D @types/spark-md5
```

**Step 4: Configure Tailwind**

Replace `source/webapp-v2/src/index.css` with:

```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

@theme {
  --font-serif: 'Instrument Serif', serif;
  --font-sans: 'Plus Jakarta Sans', sans-serif;

  --color-background: #FAFAF8;
  --color-surface: #FFFFFF;
  --color-border: #E5E5E3;
  --color-text: #1A1A1A;
  --color-text-secondary: #6B6B6B;
  --color-accent: #4F46E5;
  --color-accent-light: #EEF2FF;

  --color-media-video: #CC6B2E;
  --color-media-audio: #ED9B3F;
  --color-media-photo: #45852C;
  --color-media-document: #7C5CFC;

  --color-success: #16A34A;
  --color-danger: #DC2626;
  --color-warning: #F59E0B;
}

body {
  font-family: var(--font-sans);
  background-color: var(--color-background);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

Update `source/webapp-v2/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

Update `source/webapp-v2/tsconfig.json` to add path alias:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

**Step 5: Set up directory structure**

```bash
mkdir -p src/{components/{ui,layout,media,upload,analysis,auth},pages,hooks,lib,stores,styles}
```

**Step 6: Create utility file `src/lib/utils.ts`**

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
}
```

**Step 7: Verify dev server starts**

```bash
cd source/webapp-v2 && npm run dev
```

Expected: Vite dev server running on localhost.

**Step 8: Commit**

```bash
git add source/webapp-v2
git commit -m "feat: scaffold webapp-v2 with Vite, React, TypeScript, Tailwind"
```

---

## Task 2: shadcn/ui Base Components

**Files:**
- Create: `source/webapp-v2/src/components/ui/button.tsx`
- Create: `source/webapp-v2/src/components/ui/card.tsx`
- Create: `source/webapp-v2/src/components/ui/input.tsx`
- Create: `source/webapp-v2/src/components/ui/badge.tsx`
- Create: `source/webapp-v2/src/components/ui/tabs.tsx`
- Create: `source/webapp-v2/src/components/ui/dialog.tsx`
- Create: `source/webapp-v2/src/components/ui/progress.tsx`
- Create: `source/webapp-v2/src/components/ui/tooltip.tsx`
- Create: `source/webapp-v2/src/components/ui/dropdown-menu.tsx`
- Create: `source/webapp-v2/src/components/ui/separator.tsx`
- Create: `source/webapp-v2/src/components/ui/skeleton.tsx`
- Create: `source/webapp-v2/src/components/ui/toggle.tsx`
- Create: `source/webapp-v2/src/components/ui/scroll-area.tsx`

**Step 1: Install shadcn/ui dependencies**

```bash
cd source/webapp-v2
npm install @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu @radix-ui/react-tooltip @radix-ui/react-progress \
  @radix-ui/react-separator @radix-ui/react-toggle @radix-ui/react-scroll-area
```

**Step 2: Create each UI component**

Build each component following the shadcn/ui pattern: Radix primitive + `cn()` utility + Tailwind classes. Use the clean editorial palette (warm whites, subtle borders, indigo accent).

Key design tokens to apply across all components:
- Border radius: `rounded-lg` (8px)
- Border color: `border-border` (#E5E5E3)
- Focus ring: `ring-accent/30`
- Font: inherit from body (Plus Jakarta Sans)
- Transitions: `transition-colors duration-150`

**Step 3: Commit**

```bash
git add source/webapp-v2/src/components/ui
git commit -m "feat: add shadcn/ui base components with editorial theme"
```

---

## Task 3: Auth Layer — Cognito Integration

**Files:**
- Create: `source/webapp-v2/src/lib/cognito.ts`
- Create: `source/webapp-v2/src/lib/config.ts`
- Create: `source/webapp-v2/src/hooks/useAuth.ts`
- Create: `source/webapp-v2/src/stores/authStore.ts`

**Step 1: Create config loader `src/lib/config.ts`**

The existing webapp loads config from `/solution-manifest.js` which is injected at deploy time. The new app must do the same.

```typescript
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
```

**Step 2: Create Cognito auth module `src/lib/cognito.ts`**

Implement the SRP auth flow matching the existing webapp:
- `signIn(username, password)` — SRP auth with PASSWORD_VERIFIER challenge
- `completeNewPassword(username, newPassword, session)` — NEW_PASSWORD_REQUIRED
- `forgotPassword(username)` — Send reset code
- `confirmForgotPassword(username, code, newPassword)` — Confirm reset
- `refreshSession(refreshToken)` — REFRESH_TOKEN_AUTH
- `getCredentials(idToken)` — Exchange ID token for AWS temporary credentials via Cognito Identity Pool
- `signOut()` — Clear tokens and localStorage

Key implementation details from existing code:
- Uses `CognitoIdentityProviderClient` + `InitiateAuthCommand`
- SRP math uses `BigInteger` and HMAC-SHA256 (port from existing `authenticationHelper.js`)
- Store username in `localStorage['cognito.username']`
- Store refresh token in `localStorage['cognito.refreshtoken']`
- Schedule token refresh 5 minutes before expiry

**Step 3: Create auth store `src/stores/authStore.ts`**

```typescript
import { create } from 'zustand';

interface User {
  username: string;
  email: string;
  groups: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  canRead: boolean;
  canWrite: boolean;
  canModify: boolean;
  credentials: any | null;
  setUser: (user: User | null) => void;
  setCredentials: (creds: any) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  canRead: false,
  canWrite: false,
  canModify: false,
  credentials: null,
  setUser: (user) => set({
    user,
    isAuthenticated: !!user,
    canRead: !!user,
    canWrite: user?.groups?.some(g => ['Creator', 'Admin'].includes(g)) ?? false,
    canModify: user?.groups?.includes('Admin') ?? false,
  }),
  setCredentials: (credentials) => set({ credentials }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({
    user: null, isAuthenticated: false, credentials: null,
    canRead: false, canWrite: false, canModify: false,
  }),
}));
```

**Step 4: Create `src/hooks/useAuth.ts`**

```typescript
export function useAuth() {
  const store = useAuthStore();

  const signIn = async (username: string, password: string) => { /* call cognito.signIn, update store */ };
  const signOut = async () => { /* clear store + localStorage */ };
  const tryAutoSignIn = async () => { /* check localStorage for cached refresh token */ };

  return { ...store, signIn, signOut, tryAutoSignIn };
}
```

**Step 5: Verify auth module compiles**

```bash
cd source/webapp-v2 && npx tsc --noEmit
```

**Step 6: Commit**

```bash
git add source/webapp-v2/src/lib source/webapp-v2/src/stores source/webapp-v2/src/hooks
git commit -m "feat: add Cognito auth layer with SRP flow, token refresh, and auth store"
```

---

## Task 4: API Client — SigV4 Signed Requests

**Files:**
- Create: `source/webapp-v2/src/lib/api.ts`
- Create: `source/webapp-v2/src/lib/constants.ts`

**Step 1: Create constants `src/lib/constants.ts`**

```typescript
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
```

**Step 2: Create API client `src/lib/api.ts`**

Implement SigV4-signed HTTP requests matching `authHttpRequest.js`:

```typescript
import { SignatureV4 } from '@smithy/signature-v4';
import { HttpRequest } from '@smithy/protocol-http';
import { Sha256 } from '@aws-crypto/sha256-js';
import { getConfig } from './config';
import { useAuthStore } from '@/stores/authStore';

async function signedFetch(method: string, path: string, query?: Record<string, string>, body?: any) {
  const config = getConfig();
  const credentials = useAuthStore.getState().credentials;
  const url = new URL(`${config.ApiEndpoint}/${path}`);

  if (query) {
    Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
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
    credentials,
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

  const data = await response.json();
  if (data.errorCode) {
    throw new Error(`${data.errorCode} - ${data.errorMessage}`);
  }
  return data;
}

// Public API methods
export const api = {
  // Assets
  getAssets: (params: { type?: string; pageSize?: number; token?: string }) =>
    signedFetch('GET', 'assets', params as Record<string, string>),

  getAsset: (uuid: string) =>
    signedFetch('GET', `assets/${uuid}`),

  deleteAsset: (uuid: string) =>
    signedFetch('DELETE', `assets/${uuid}`),

  // Analysis
  getAnalysis: (uuid: string) =>
    signedFetch('GET', `analysis/${uuid}`),

  startAnalysis: (uuid: string, input: any) =>
    signedFetch('POST', `analysis/${uuid}`, undefined, { input }),

  // Search
  search: (query: string, params?: Record<string, string>) =>
    signedFetch('GET', 'search', { q: query, ...params }),

  // Upload workflow
  startWorkflow: (input: any) =>
    signedFetch('POST', 'assets', undefined, { input }),

  // Settings
  getAiOptions: () => signedFetch('GET', 'ai-options'),
  updateAiOptions: (options: any) => signedFetch('POST', 'ai-options', undefined, options),

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
```

**Step 3: Commit**

```bash
git add source/webapp-v2/src/lib
git commit -m "feat: add SigV4-signed API client matching existing endpoint patterns"
```

---

## Task 5: App Shell — Layout, Sidebar, Topbar

**Files:**
- Create: `source/webapp-v2/src/components/layout/AppShell.tsx`
- Create: `source/webapp-v2/src/components/layout/Sidebar.tsx`
- Create: `source/webapp-v2/src/components/layout/Topbar.tsx`
- Create: `source/webapp-v2/src/components/layout/Logo.tsx`
- Modify: `source/webapp-v2/src/App.tsx`
- Modify: `source/webapp-v2/src/main.tsx`

**Step 1: Create Logo component**

SVG or image-based logo component. Use the existing `m2c-logo-orange.png` from `source/webapp/images/`.

```typescript
// src/components/layout/Logo.tsx
export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-5">
      <img src="/images/m2c-logo-orange.png" alt="M2C" className="h-8 w-8" />
      {!collapsed && (
        <span className="font-serif text-xl tracking-tight">Media2Cloud</span>
      )}
    </div>
  );
}
```

**Step 2: Create Sidebar**

Collapsible sidebar with nav links using Lucide icons:
- Collection (Library icon)
- Upload (Upload icon)
- Processing (Loader icon) — conditional on canWrite
- Stats (BarChart3 icon)
- Face Collection (Users icon) — conditional on canWrite
- Settings (Settings icon) — conditional on canModify

Design: warm white bg (#FAFAF8), active item has indigo left border + indigo text, hover has subtle bg tint. Collapse to icon-only mode with a toggle button at bottom.

**Step 3: Create Topbar**

Horizontal bar above content area:
- Left: breadcrumb or page title (Instrument Serif, text-2xl)
- Right: search input (subtle border, search icon), user avatar dropdown (name, role badge, sign out)

**Step 4: Create AppShell**

Compose Sidebar + Topbar + `<Outlet />` for routed content:

```typescript
// src/components/layout/AppShell.tsx
export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

**Step 5: Set up routing in App.tsx**

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/signin" element={<SignInPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<Navigate to="/collection" replace />} />
              <Route path="/collection" element={<CollectionPage />} />
              <Route path="/collection/:type" element={<CollectionPage />} />
              <Route path="/media/:uuid" element={<MediaDetailPage />} />
              <Route path="/upload" element={<UploadPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

**Step 6: Create ProtectedRoute wrapper**

Checks `useAuth().isAuthenticated`, redirects to `/signin` if not.

**Step 7: Update main.tsx entry point**

Load solution config before rendering:

```typescript
import { loadConfig } from '@/lib/config';

loadConfig().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode><App /></StrictMode>
  );
});
```

**Step 8: Verify shell renders with sidebar + topbar**

```bash
npm run dev
```

**Step 9: Commit**

```bash
git add source/webapp-v2/src
git commit -m "feat: add app shell with collapsible sidebar, topbar, and routing"
```

---

## Task 6: Sign-In Page

**Files:**
- Create: `source/webapp-v2/src/pages/SignInPage.tsx`
- Create: `source/webapp-v2/src/components/auth/SignInForm.tsx`
- Create: `source/webapp-v2/src/components/auth/NewPasswordForm.tsx`
- Create: `source/webapp-v2/src/components/auth/ForgotPasswordForm.tsx`

**Step 1: Create SignInPage**

Full-screen centered layout. Left half: decorative gradient/illustration. Right half: sign-in card.

Design:
- Background: subtle warm gradient
- Card: white, rounded-xl, generous padding (p-10)
- Logo centered above form
- "Welcome back" heading in Instrument Serif
- Email + password inputs (shadcn Input)
- "Sign In" button (indigo, full-width)
- "Forgot password?" link below
- Error toast for invalid credentials

**Step 2: Create form components**

- `SignInForm`: username, password, submit, forgot-password link
- `NewPasswordForm`: new password + confirm (shown after NEW_PASSWORD_REQUIRED challenge)
- `ForgotPasswordForm`: email input → code + new password inputs (2 steps)

Each form uses the `useAuth()` hook to call Cognito.

**Step 3: Handle auth state transitions**

```
SignIn → success → redirect to /collection
SignIn → NEW_PASSWORD_REQUIRED → show NewPasswordForm
ForgotPassword → code sent → show code + new password fields
Any error → show inline error message
```

**Step 4: Verify sign-in flow renders**

```bash
npm run dev
# Navigate to /signin
```

**Step 5: Commit**

```bash
git add source/webapp-v2/src/pages/SignInPage.tsx source/webapp-v2/src/components/auth
git commit -m "feat: add sign-in page with Cognito auth flows"
```

---

## Task 7: Collection Browse Page

**Files:**
- Create: `source/webapp-v2/src/pages/CollectionPage.tsx`
- Create: `source/webapp-v2/src/components/media/MediaGrid.tsx`
- Create: `source/webapp-v2/src/components/media/MediaCard.tsx`
- Create: `source/webapp-v2/src/components/media/MediaTypeFilter.tsx`
- Create: `source/webapp-v2/src/hooks/useMedia.ts`

**Step 1: Create useMedia hook**

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useMediaList(type?: string) {
  return useInfiniteQuery({
    queryKey: ['media', type],
    queryFn: ({ pageParam }) => api.getAssets({
      type,
      pageSize: 20,
      token: pageParam,
    }),
    getNextPageParam: (lastPage) => lastPage.NextToken,
    initialPageParam: undefined,
  });
}
```

**Step 2: Create MediaTypeFilter**

Horizontal pill tabs: All / Video / Photo / Audio / Document. Each pill shows count badge. Active pill has solid fill matching media type color.

```typescript
// Pill-style filter bar
const types = [
  { key: undefined, label: 'All', icon: LayoutGrid },
  { key: 'video', label: 'Video', icon: Film, color: 'media-video' },
  { key: 'photo', label: 'Photos', icon: Image, color: 'media-photo' },
  { key: 'podcast', label: 'Audio', icon: Headphones, color: 'media-audio' },
  { key: 'document', label: 'Documents', icon: FileText, color: 'media-document' },
];
```

**Step 3: Create MediaCard**

Card component for each media asset in the grid:
- Thumbnail image (proxy or placeholder by type)
- Bottom overlay: title (truncated), duration or page count
- Top-right: media type badge (colored dot)
- Hover state: slight scale (1.02), subtle shadow, "View" overlay
- Click: navigate to `/media/:uuid`

Design: white bg, 1px border, rounded-lg, aspect-ratio 16/9 for thumbnail area.

```typescript
export function MediaCard({ asset }: { asset: MediaAsset }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/media/${asset.uuid}`)}
      className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-surface transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
    >
      <div className="relative aspect-video bg-background">
        <img src={asset.thumbnail} alt={asset.basename} className="h-full w-full object-cover" />
        {asset.duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
            {formatDuration(asset.duration)}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-medium">{asset.basename}</p>
        <p className="mt-1 text-xs text-text-secondary">{formatDate(asset.lastModified)}</p>
      </div>
    </div>
  );
}
```

**Step 4: Create MediaGrid**

Responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5`

Includes:
- Loading state: skeleton grid (Skeleton component for each card)
- Empty state: centered illustration + "No media found" message
- "Load more" button at bottom (uses `fetchNextPage` from useInfiniteQuery)

**Step 5: Create CollectionPage**

Compose filter + grid:

```typescript
export default function CollectionPage() {
  const { type } = useParams();
  const { data, isLoading, hasNextPage, fetchNextPage } = useMediaList(type);

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Collection</h1>
      <MediaTypeFilter activeType={type} />
      <MediaGrid assets={allAssets} isLoading={isLoading} />
      {hasNextPage && <LoadMoreButton onClick={fetchNextPage} />}
    </div>
  );
}
```

**Step 6: Commit**

```bash
git add source/webapp-v2/src/pages/CollectionPage.tsx source/webapp-v2/src/components/media source/webapp-v2/src/hooks
git commit -m "feat: add collection browse page with media grid, type filters, infinite scroll"
```

---

## Task 8: Media Detail Page — Player & Technical Info

**Files:**
- Create: `source/webapp-v2/src/pages/MediaDetailPage.tsx`
- Create: `source/webapp-v2/src/components/media/MediaPlayer.tsx`
- Create: `source/webapp-v2/src/components/media/MediaHeader.tsx`
- Create: `source/webapp-v2/src/components/analysis/TechnicalInfo.tsx`
- Create: `source/webapp-v2/src/hooks/useAnalysis.ts`

**Step 1: Install Video.js**

```bash
cd source/webapp-v2
npm install video.js @types/video.js
```

**Step 2: Create MediaPlayer component**

Wrapper around Video.js for video/audio, `<img>` for photos, PDF viewer for documents:

```typescript
export function MediaPlayer({ asset }: { asset: MediaAsset }) {
  switch (asset.type) {
    case 'video':
      return <VideoPlayer src={asset.proxyUrl} poster={asset.thumbnail} />;
    case 'podcast':
      return <AudioPlayer src={asset.proxyUrl} />;
    case 'photo':
      return <ImageViewer src={asset.proxyUrl} />;
    case 'document':
      return <DocumentViewer src={asset.proxyUrl} pages={asset.pages} />;
  }
}
```

VideoPlayer: Video.js instance with fluid layout, poster image, HLS support.
ImageViewer: Full-width image with zoom on click.
AudioPlayer: Styled audio element with waveform placeholder.
DocumentViewer: Page-by-page image viewer.

**Step 3: Create MediaHeader**

Above player: breadcrumb (Collection > Video > filename), media type badge, status badge, action buttons (Re-analyze, Delete — conditional on permissions).

**Step 4: Create useAnalysis hook**

```typescript
export function useAnalysis(uuid: string) {
  return useQuery({
    queryKey: ['analysis', uuid],
    queryFn: () => api.getAnalysis(uuid),
    enabled: !!uuid,
  });
}
```

**Step 5: Create TechnicalInfo panel**

Clean 2-column key-value layout for metadata:
- File: name, size, type, last modified
- MediaInfo: codec, resolution, bitrate, framerate, duration
- EXIF: camera, GPS, date taken (for photos)

Design: subtle alternating row backgrounds, monospace values.

**Step 6: Compose MediaDetailPage**

```typescript
export default function MediaDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const { data: asset } = useQuery({ queryKey: ['asset', uuid], queryFn: () => api.getAsset(uuid!) });
  const { data: analysis } = useAnalysis(uuid!);

  return (
    <div className="max-w-6xl mx-auto">
      <MediaHeader asset={asset} />
      <div className="mt-6 rounded-xl border border-border bg-surface overflow-hidden">
        <MediaPlayer asset={asset} />
      </div>
      <div className="mt-8">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transcription">Transcription</TabsTrigger>
            <TabsTrigger value="labels">Labels</TabsTrigger>
            <TabsTrigger value="faces">Faces</TabsTrigger>
            <TabsTrigger value="entities">Entities</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">...</TabsContent>
          <TabsContent value="technical"><TechnicalInfo asset={asset} /></TabsContent>
          {/* More tabs added in Task 9 */}
        </Tabs>
      </div>
    </div>
  );
}
```

**Step 7: Commit**

```bash
git add source/webapp-v2/src/pages/MediaDetailPage.tsx source/webapp-v2/src/components/media source/webapp-v2/src/components/analysis source/webapp-v2/src/hooks
git commit -m "feat: add media detail page with player and technical info tab"
```

---

## Task 9: Analysis Result Tabs

**Files:**
- Create: `source/webapp-v2/src/components/analysis/TranscriptionView.tsx`
- Create: `source/webapp-v2/src/components/analysis/LabelsView.tsx`
- Create: `source/webapp-v2/src/components/analysis/FacesView.tsx`
- Create: `source/webapp-v2/src/components/analysis/EntitiesView.tsx`
- Create: `source/webapp-v2/src/components/analysis/ModerationView.tsx`
- Create: `source/webapp-v2/src/components/analysis/GenAIView.tsx`
- Create: `source/webapp-v2/src/components/analysis/ConfidenceBar.tsx`

**Step 1: Create ConfidenceBar component**

Reusable horizontal bar showing confidence percentage:

```typescript
export function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-border">
        <div className="h-full rounded-full bg-accent" style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-text-secondary">{value.toFixed(0)}%</span>
    </div>
  );
}
```

**Step 2: Create TranscriptionView**

Timestamped transcript with click-to-seek:
- Each segment: timestamp badge + text
- Click timestamp → seek video player to that time
- Uses data from Transcribe results (VTT/JSON format)
- Clean list layout with subtle time badges

**Step 3: Create LabelsView**

Grid of detected labels with confidence:
- Each label: name badge + confidence bar + occurrence count
- Sorted by confidence descending
- Filterable by min confidence slider
- Click label → highlight in video timeline (future)

**Step 4: Create FacesView**

Thumbnail gallery of detected faces:
- Grid of face crops (48x48 rounded)
- Name (if identified) or "Unknown"
- Confidence bar
- Group by identity

**Step 5: Create EntitiesView**

NLP entity results from Comprehend:
- Entity type badge (PERSON, LOCATION, ORGANIZATION, etc.) with distinct colors
- Entity text
- Confidence score
- Grouped by type with collapsible sections

**Step 6: Create ModerationView**

Content moderation flags:
- Flag icon + category name + confidence
- Color-coded severity (red for high, amber for medium)

**Step 7: Create GenAIView**

Bedrock-generated descriptions:
- Scene descriptions as clean paragraphs
- Timestamp references
- Summary section

**Step 8: Wire all tabs into MediaDetailPage**

Add all TabsContent entries. Show/hide tabs based on which analysis data is available.

**Step 9: Commit**

```bash
git add source/webapp-v2/src/components/analysis
git commit -m "feat: add analysis result tabs (transcription, labels, faces, entities, moderation, genai)"
```

---

## Task 10: Upload Page — Multi-Step Wizard

**Files:**
- Create: `source/webapp-v2/src/pages/UploadPage.tsx`
- Create: `source/webapp-v2/src/components/upload/UploadWizard.tsx`
- Create: `source/webapp-v2/src/components/upload/DropZone.tsx`
- Create: `source/webapp-v2/src/components/upload/MetadataForm.tsx`
- Create: `source/webapp-v2/src/components/upload/AnalysisConfig.tsx`
- Create: `source/webapp-v2/src/components/upload/UploadReview.tsx`
- Create: `source/webapp-v2/src/hooks/useUpload.ts`
- Create: `source/webapp-v2/src/lib/s3.ts`

**Step 1: Create S3 upload utility `src/lib/s3.ts`**

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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
  credentials: any;
  region: string;
  onProgress?: (pct: number) => void;
}) {
  const client = new S3Client({ region: params.region, credentials: params.credentials });
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
```

**Step 2: Create DropZone**

Drag-and-drop area + file browser button:
- Dashed border area, centered upload icon + "Drag files here" text
- On drag-over: border turns indigo, bg tints
- File list below with: filename, size, type icon, remove button
- Accepts: video/*, audio/*, image/*, application/pdf

**Step 3: Create MetadataForm**

- Group name input (optional)
- Dynamic key-value attribute pairs: "Add attribute" button, each row has key input + value input + delete button
- Clean form layout with labels

**Step 4: Create AnalysisConfig**

Toggle groups matching existing settings:
- **Rekognition**: face detection, label detection, content moderation, celebrity, text detection
- **Transcribe**: enable, language dropdown, custom vocabulary dropdown
- **Comprehend**: entities, keyphrases, sentiment
- **Textract**: document analysis
- **Advanced**: scene detection, ad breaks, auto face indexer

Each feature: toggle switch + optional sub-settings (min confidence slider, model dropdown).
Fetch available models/vocabularies from API on mount.

**Step 5: Create UploadReview**

Summary before upload:
- File list table: name, size, type, MD5 status
- Selected analysis options summary
- Metadata summary
- "Upload" button (indigo, prominent)
- Per-file progress bars during upload
- Overall progress indicator

**Step 6: Create UploadWizard**

4-step wizard with horizontal step indicator:

```typescript
const steps = ['Select Files', 'Metadata', 'Analysis', 'Review & Upload'];
// Step indicator: numbered circles connected by lines
// Active step: filled indigo circle
// Completed: checkmark circle
// Future: empty circle with gray border
```

Navigation: "Back" and "Next" buttons. "Next" validates current step.

**Step 7: Create useUpload hook**

Manages the upload workflow state:
- Files list with MD5 status
- Metadata (group, attributes)
- Analysis options
- Upload progress per file
- Orchestrates: compute MD5 → upload to S3 → start workflow via API

**Step 8: Create UploadPage**

```typescript
export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-serif text-3xl mb-8">Upload Media</h1>
      <UploadWizard />
    </div>
  );
}
```

**Step 9: Commit**

```bash
git add source/webapp-v2/src/pages/UploadPage.tsx source/webapp-v2/src/components/upload source/webapp-v2/src/hooks/useUpload.ts source/webapp-v2/src/lib/s3.ts
git commit -m "feat: add upload wizard with dropzone, metadata, analysis config, and S3 upload"
```

---

## Task 11: Static Assets & Build Config

**Files:**
- Create: `source/webapp-v2/public/images/` (copy logos from existing webapp)
- Create: `source/webapp-v2/public/solution-manifest.js` (dev placeholder)
- Modify: `source/webapp-v2/index.html`
- Modify: `source/webapp-v2/package.json` (add build scripts)

**Step 1: Copy static assets**

```bash
cp source/webapp/images/m2c-logo-orange.png source/webapp-v2/public/images/
cp source/webapp/favicon.ico source/webapp-v2/public/
```

**Step 2: Create dev placeholder for solution-manifest.js**

```javascript
// source/webapp-v2/public/solution-manifest.js
// Development placeholder — replaced at deploy time
window.SolutionManifest = {
  Region: 'us-east-1',
  ApiEndpoint: 'https://localhost:3001',
  // ... minimal config for local dev
};
```

**Step 3: Update index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <title>Media2Cloud</title>
  <script src="/solution-manifest.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

**Step 4: Add build scripts to package.json**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  }
}
```

**Step 5: Verify production build**

```bash
cd source/webapp-v2
npm run build
```

Expected: `dist/` directory with production bundle.

**Step 6: Commit**

```bash
git add source/webapp-v2/public source/webapp-v2/index.html source/webapp-v2/package.json
git commit -m "feat: add static assets, dev manifest, and build config"
```

---

## Task 12: 404 Page & Polish

**Files:**
- Create: `source/webapp-v2/src/pages/NotFoundPage.tsx`
- Modify: various components for final polish

**Step 1: Create NotFoundPage**

Centered layout with large "404" in Instrument Serif, subtitle, and "Back to Collection" link.

**Step 2: Add loading states**

Ensure all pages show skeleton loaders while data loads (Collection grid, Media detail, Upload config dropdowns).

**Step 3: Add error boundaries**

React error boundary wrapping main content area — shows friendly error message + retry button.

**Step 4: Add toast notifications**

Lightweight toast system for success/error messages (upload complete, delete confirmed, errors).

**Step 5: Responsive testing**

Verify all layouts work at:
- Desktop (1440px+)
- Laptop (1024px)
- Tablet (768px)
- Mobile (375px) — sidebar collapses to hamburger menu

**Step 6: Final commit**

```bash
git add source/webapp-v2/src
git commit -m "feat: add 404 page, loading states, error boundaries, and responsive polish"
```

---

## Summary

| Task | What | Key Files |
|------|------|-----------|
| 1 | Project scaffold | Vite + React + TS + Tailwind |
| 2 | UI components | shadcn/ui button, card, tabs, dialog, etc. |
| 3 | Auth layer | Cognito SRP, token refresh, auth store |
| 4 | API client | SigV4-signed fetch, all endpoints |
| 5 | App shell | Sidebar, topbar, routing |
| 6 | Sign-in page | Auth forms (login, new password, forgot) |
| 7 | Collection browse | Media grid, type filters, infinite scroll |
| 8 | Media detail | Player, header, technical info |
| 9 | Analysis tabs | Transcription, labels, faces, entities, moderation, genai |
| 10 | Upload wizard | Dropzone, metadata, analysis config, S3 upload |
| 11 | Build config | Assets, manifest, production build |
| 12 | Polish | 404, loading states, errors, responsive |
