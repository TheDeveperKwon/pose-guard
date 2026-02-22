# PoseGuard Web

문서 이동: [프로젝트 전체](../../README.md) | [데스크톱 (한국어)](../desktop/README.md) | [Desktop (English)](../desktop/README.en.md) | **웹 문서**

PoseGuard Web은 Next.js 기반 KR/EN 랜딩 + 웹캠 데모 앱입니다.

## 빠른 시작

```bash
cd apps/web
npm install
npm run dev
```

기본 진입:
- 로컬 개발 서버: `http://localhost:3000`
- `/` 진입 시 `/ko`로 리다이렉트됩니다.
- 영어 페이지는 `/en`에서 확인할 수 있습니다.

## 핵심 기능

- Locale 라우트: `/ko`, `/en`
- 마케팅 페이지: landing, demo, download, how-it-works, faq, changelog, privacy
- 확장 페이지: qna, sponsor
- MediaPipe Pose 기반 웹캠 데모 (클라이언트 처리)
- 다운로드 클릭/데모 시작 이벤트 계측

## 라우트 맵

URL에는 라우트 그룹 이름(`(marketing)` 등)이 노출되지 않습니다.

| URL | 페이지 |
| --- | --- |
| `/ko`, `/en` | 랜딩 |
| `/:locale/demo` | 웹캠 데모 |
| `/:locale/download` | 설치 파일 안내 |
| `/:locale/how-it-works` | 작동 원리 |
| `/:locale/faq` | FAQ |
| `/:locale/changelog` | 변경 이력 |
| `/:locale/privacy` | 개인정보 안내 |
| `/:locale/qna` | Q&A |
| `/:locale/sponsor` | 스폰서 |

## 환경 변수

`.env.local` 생성:

```bash
cp .env.example .env.local
```

| 변수 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | canonical/OG/sitemap 절대 URL 기준 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 측정 ID |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Microsoft Clarity 프로젝트 ID |
| `NEXT_PUBLIC_CLOUDFLARE_BEACON_TOKEN` | Cloudflare Web Analytics 토큰 |

## 분석 이벤트

현재 주요 이벤트:
- `download_click` (`platform`, `locale`, `source`)
- `demo_start` (`locale`)
- `demo_baseline_set` (`locale`)

## 릴리즈 메타데이터 연동

다운로드 페이지는 `apps/shared/releases/index.js`에서 최신 버전 메타데이터를 읽어옵니다.

확인 파일:
- `apps/web/lib/downloads.ts`
- `apps/shared/releases/index.js`
- `apps/desktop/package.json` (`build.artifactName`)

새 데스크톱 릴리즈를 배포할 때 위 파일들의 버전/파일명이 일치하는지 함께 확인하세요.

## 배포 (Vercel)

- Framework preset: `Next.js`
- Root directory: `apps/web`
- Production branch: `main`
- 환경 변수: `.env.local`과 동일 키를 프로젝트 환경 변수에 등록

## 문제 해결

### 데모 화면에서 카메라가 안 뜸

- 브라우저 카메라 권한을 허용했는지 확인
- 다른 앱(회의 앱 등)이 카메라를 점유 중인지 확인
- HTTPS가 아닌 환경에서는 브라우저 정책 제한이 있을 수 있음

### SEO URL이 로컬 주소로 보임

- `NEXT_PUBLIC_SITE_URL`이 배포 도메인으로 설정되었는지 확인

### 다운로드 버전 정보가 최신이 아님

- `apps/shared/releases/index.js`의 `LATEST_RELEASE`가 최신 항목인지 확인
