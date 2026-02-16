# PoseGuard Web

Next.js 기반 KR/EN 랜딩 + 실시간 웹캠 데모 사이트입니다.

## Included

- Locale routes: `/ko`, `/en`
- Route groups:
  - `(marketing)`: landing, demo, download, how-it-works, faq, changelog, privacy
  - `(community)`: qna
  - `(sponsor)`: sponsor
- Dark minimal UI and low-power/high-performance messaging
- MediaPipe Pose webcam demo (client-side)

## SEO
- Set NEXT_PUBLIC_SITE_URL to your production domain so OG image, canonical, robots, and sitemap use absolute URLs.

## Run

```bash
cd apps/web
npm install
npm run dev
```

## Analytics (GA4 + Clarity + Cloudflare)

1. Copy env template:

```bash
cp .env.example .env.local
```

2. Fill variables in `.env.local`:

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_CLARITY_PROJECT_ID`
- `NEXT_PUBLIC_CLOUDFLARE_BEACON_TOKEN`

3. Tracked events:

- `download_click` (`platform`, `locale`)
- `demo_start` (`locale`)
- `demo_baseline_set` (`locale`)

## Deploy (Vercel)

- Framework preset: `Next.js`
- Root directory: `apps/web`
- Production branch: `main`
- Add the same analytics env vars to Vercel Project Settings
