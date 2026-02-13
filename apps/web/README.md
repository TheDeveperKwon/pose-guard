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

## Run

```bash
cd apps/web
npm install
npm run dev
```

## Deploy (Vercel)

- Framework preset: `Next.js`
- Root directory: `apps/web`
- Production branch: `main`
