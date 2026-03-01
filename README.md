# PoseGuard

Language: **English** | [한국어](./README.ko.md)

PoseGuard is a multi-app repository that includes a desktop posture monitoring app and a web product/demo site.

## Docs At A Glance

| Document | Purpose | Link |
| --- | --- | --- |
| Project Overview (EN) | Repository structure and shared workflows | **This document** |
| 프로젝트 개요 (KO) | 저장소 구조와 공통 실행 방법 | [README.ko.md](./README.ko.md) |
| Desktop Guide (EN) | Desktop app setup, usage, build, troubleshooting | [apps/desktop/README.md](./apps/desktop/README.md) |
| 데스크톱 가이드 (KO) | 데스크톱 앱 한국어 문서 | [apps/desktop/README.ko.md](./apps/desktop/README.ko.md) |
| Web Guide (EN) | Web app routes, env, deployment, troubleshooting | [apps/web/README.md](./apps/web/README.md) |
| 웹 가이드 (KO) | 웹 앱 한국어 문서 | [apps/web/README.ko.md](./apps/web/README.ko.md) |

## Quick Start

Prerequisites:
- Node.js 18+
- npm 9+

Run desktop app:

```bash
cd apps/desktop
npm install
npm start
```

Run web app:

```bash
cd apps/web
npm install
npm run dev
```

## Repository Layout

```text
apps/
├─ desktop/   # Electron + MediaPipe Pose desktop app
├─ web/       # Next.js KR/EN landing + webcam demo
└─ shared/    # Shared posture/policy/release modules
```

## App Summary

### Desktop (`apps/desktop`)

- Real-time posture evaluation (`Turtle Neck`, `Slouching`, `Text Neck`)
- Baseline calibration + debounce/cooldown alert policy
- Visual overlay alerts, sound alerts, power-saving mode, tray support
- Full guide: [apps/desktop/README.md](./apps/desktop/README.md)

### Web (`apps/web`)

- Locale routes: `/ko`, `/en`
- Landing / demo / download / how-it-works / FAQ pages
- GA4 + Clarity + Cloudflare analytics event support
- Full guide: [apps/web/README.md](./apps/web/README.md)

## Release Metadata Notes

- Desktop artifact names are generated from `build.artifactName` in `apps/desktop/package.json`.
- Web download page version/release metadata is read from `apps/shared/releases/index.js`.
- Keep those files aligned when preparing a new release.

## Common Dev Tasks

Build desktop release artifacts:

```bash
cd apps/desktop
npm run dist
```

Run web production check:

```bash
cd apps/web
npm run build
npm run start
```
