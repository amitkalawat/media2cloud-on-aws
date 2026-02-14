# Media2Cloud Webapp UI Overhaul — Design

## Decision

Full UI rewrite of the Media2Cloud webapp using React, Tailwind CSS, and shadcn/ui. Replaces the existing jQuery + Bootstrap 4.6.1 frontend with a modern, clean editorial aesthetic. Phased approach: core screens first, admin/settings later.

## Context

The current webapp (`source/webapp/`) is built with jQuery 3.5, Bootstrap 4.6.1, and vanilla ES6 modules. It works but looks dated — heavy use of Bootstrap defaults, no design language, cluttered analysis result views. The UI code is spread across ~100+ JS files that construct DOM imperatively with jQuery.

The backend (API Gateway, Step Functions, Lambda, S3, Cognito, IoT) remains unchanged. The new frontend consumes the same APIs.

## Tech Stack

| Layer | Current | New |
|---|---|---|
| Framework | jQuery + ES6 classes | React 18 |
| Build | Babel + manual bundling | Vite |
| Styling | Bootstrap 4.6.1 + custom CSS | Tailwind CSS 3 + shadcn/ui |
| Icons | Font Awesome 5 | Lucide React |
| Video | Video.js 7.6.5 | Video.js React wrapper |
| Charts | ECharts 5 | Recharts |
| Auth | Custom Cognito implementation | AWS Amplify Auth (or direct SDK) |
| Data fetching | Manual + IndexedDB | TanStack Query |
| Routing | Hash-based (#Tab/) | React Router v6 |
| Language | JavaScript | TypeScript |
| State | Class properties + events | Zustand |

## Aesthetic Direction: Clean Editorial

Inspired by Linear, Notion, and Apple's developer documentation.

**Palette:**
- Background: `#FAFAF8` (warm off-white)
- Surface: `#FFFFFF`
- Border: `#E5E5E3`
- Text primary: `#1A1A1A`
- Text secondary: `#6B6B6B`
- Accent: `#4F46E5` (deep indigo)
- Video: `#CC6B2E` (burnt orange, carried over)
- Audio: `#ED9B3F` (amber, carried over)
- Photo: `#45852C` (green, carried over)
- Document: `#7C5CFC` (refined purple)
- Success: `#16A34A`
- Danger: `#DC2626`

**Typography:**
- Headings: Instrument Serif (distinctive, editorial)
- Body/UI: Plus Jakarta Sans (geometric, clean)

**Layout principles:**
- Collapsible sidebar navigation (not top navbar tabs)
- Generous whitespace, 8px grid
- Cards with subtle 1px borders, rounded-lg corners
- No heavy drop shadows — use border + slight bg tint for elevation
- Clean hover states with smooth transitions

## Phase 1 Scope

### 1. App Shell
- Collapsible sidebar: logo, nav links (Collection, Upload, Processing, Stats, Settings), user avatar + logout
- Topbar: page title/breadcrumbs, global search input, notification indicator
- Responsive: sidebar becomes bottom sheet or hamburger on mobile

### 2. Sign In
- Centered card with logo, email/password, "Sign In" button
- Flows: sign in, first-time password change, forgot password, reset
- Uses Cognito directly

### 3. Collection Browse
- Sub-navigation: All / Video / Photo / Audio / Document tabs (pill style)
- Media grid: responsive card grid (3-4 columns)
- Each card: thumbnail, title, duration/page count, media type badge, upload date
- Hover: slight scale + "View" overlay
- Pagination: "Load more" button or infinite scroll
- Empty states for each media type

### 4. Media Detail
- Top section: media player (video/audio/image/document viewer) — full width
- Below player: tabbed analysis panel
  - Overview: key metadata in a clean 2-column layout
  - Transcription: timestamped text, click-to-seek
  - Labels: badge list with confidence bars
  - Faces/Celebrities: thumbnail grid with names
  - Entities/Keyphrases: highlighted text view
  - Moderation: flag list with severity
  - GenAI: scene descriptions
  - Technical: metadata table (mediainfo, EXIF)
- Sidebar (optional): quick stats, related assets

### 5. Upload
- Multi-step form with progress indicator (step dots)
- Step 1 — Drop Zone: drag-and-drop area + file browser, file list with remove
- Step 2 — Metadata: group name, custom key-value attributes
- Step 3 — Analysis Config: toggle groups for Rekognition, Transcribe, Comprehend, Textract, advanced features
- Step 4 — Review: summary table, upload button, progress bar per file

## Phase 2 Scope (deferred)

- Settings page (AI/ML configuration)
- Face Collection management
- Stats/analytics dashboard (Recharts pie/bar charts)
- User management/admin panel
- Processing queue monitor
- Real-time IoT status updates

## Directory Structure

```
source/webapp-v2/
├── public/
│   ├── favicon.ico
│   └── images/              # Logos, media type icons
├── src/
│   ├── main.tsx             # React entry point
│   ├── App.tsx              # Root component, router
│   ├── components/
│   │   ├── ui/              # shadcn/ui components (button, card, dialog, tabs, etc.)
│   │   ├── layout/          # AppShell, Sidebar, Topbar, Breadcrumbs
│   │   ├── media/           # MediaCard, MediaGrid, MediaPlayer, MediaDetail
│   │   ├── upload/          # DropZone, MetadataForm, AnalysisConfig, UploadReview
│   │   ├── analysis/        # TranscriptionView, LabelsView, FacesView, EntitiesView, etc.
│   │   └── auth/            # SignInForm, ResetPasswordForm
│   ├── pages/
│   │   ├── SignInPage.tsx
│   │   ├── CollectionPage.tsx
│   │   ├── MediaDetailPage.tsx
│   │   ├── UploadPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── hooks/
│   │   ├── useAuth.ts       # Cognito auth state
│   │   ├── useMedia.ts      # Media CRUD operations
│   │   ├── useAnalysis.ts   # Analysis results fetching
│   │   ├── useUpload.ts     # S3 upload with progress
│   │   └── useSettings.ts   # AI/ML settings
│   ├── lib/
│   │   ├── api.ts           # API Gateway client (axios or fetch)
│   │   ├── aws.ts           # AWS SDK config (S3, Cognito)
│   │   ├── constants.ts     # Routes, media types, analysis types
│   │   └── utils.ts         # Formatters, helpers
│   ├── stores/
│   │   └── appStore.ts      # Zustand store (auth, UI state)
│   └── styles/
│       └── globals.css      # Tailwind directives, custom utilities
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── components.json          # shadcn/ui config
```

## API Integration

The new frontend calls the same API Gateway endpoints. Key patterns:
- All requests signed with Cognito JWT (Authorization header)
- Media listing: `GET /assets?type=video&pageSize=20&token=...`
- Media detail: `GET /assets/{uuid}`
- Analysis results: `GET /assets/{uuid}/analysis`
- Upload: presigned S3 URL flow
- Settings: `GET/POST /settings`
- Search: `GET /search?query=...` (OpenSearch)
- Real-time: AWS IoT MQTT over WebSocket for processing status

The existing `apiHelper.js` and `authHttpRequest.js` contain the exact endpoint patterns to replicate.

## Migration Path

1. Build `webapp-v2/` alongside existing `webapp/`
2. Phase 1 screens functional and tested
3. Update CloudFormation webapp stack to deploy from `webapp-v2/` build output
4. Remove old `webapp/` once Phase 2 is complete
