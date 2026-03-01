# PoseGuard Web

Language: **English** | [한국어](./README.ko.md)

Docs: [Project README (EN)](../../README.md) | [프로젝트 개요 (KO)](../../README.ko.md) | [Desktop (EN)](../desktop/README.md) | [데스크톱 (KO)](../desktop/README.ko.md)

PoseGuard Web is a Next.js-based KR/EN landing + webcam demo app.

## Quick Start

```bash
cd apps/web
npm install
npm run dev
```

Default entry:
- Local server: `http://localhost:3000`
- `/` redirects to `/ko`
- English routes are under `/en`

## Key Features

- Locale routes: `/ko`, `/en`
- Marketing pages: landing, demo, download, how-it-works, faq, changelog, privacy
- Extended pages: qna, sponsor
- Client-side MediaPipe Pose webcam demo
- Download/demo analytics events

## Route Map

Route group names (`(marketing)` etc.) are not shown in URLs.

| URL | Page |
| --- | --- |
| `/ko`, `/en` | Landing |
| `/:locale/demo` | Webcam demo |
| `/:locale/download` | Download page |
| `/:locale/how-it-works` | How it works |
| `/:locale/faq` | FAQ |
| `/:locale/changelog` | Changelog |
| `/:locale/privacy` | Privacy |
| `/:locale/qna` | Q&A |
| `/:locale/sponsor` | Sponsor |

## Environment Variables

Create `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Base absolute URL for canonical/OG/sitemap |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 measurement ID |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Microsoft Clarity project ID |
| `NEXT_PUBLIC_CLOUDFLARE_BEACON_TOKEN` | Cloudflare Web Analytics token |

## Analytics Events

Current major events:
- `download_click` (`platform`, `locale`, `source`)
- `demo_start` (`locale`)
- `demo_baseline_set` (`locale`)

## Release Metadata Integration

The download page reads latest release metadata from `apps/shared/releases/index.js`.

Check these files together:
- `apps/web/lib/downloads.ts`
- `apps/shared/releases/index.js`
- `apps/desktop/package.json` (`build.artifactName`)

When releasing desktop binaries, keep version and file names in sync.

## Deploy (Vercel)

- Framework preset: `Next.js`
- Root directory: `apps/web`
- Production branch: `main`
- Environment variables: set the same keys as `.env.local`

## Troubleshooting

### Camera does not start in demo

- Check browser camera permission
- Check if another app is using the camera
- Non-HTTPS environments may be restricted by browser policy

### SEO URLs show local domain

- Check `NEXT_PUBLIC_SITE_URL` is set to your production domain

### Download version is outdated

- Check `LATEST_RELEASE` in `apps/shared/releases/index.js`
