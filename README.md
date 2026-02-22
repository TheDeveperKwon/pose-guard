# PoseGuard

PoseGuard는 자세 모니터링 데스크톱 앱과 이를 소개/체험하는 웹 사이트를 함께 운영하는 멀티앱 저장소입니다.

## 문서 바로가기

| 문서 | 용도 | 링크 |
| --- | --- | --- |
| 프로젝트 개요 | 저장소 구조, 공통 실행 방법 | **현재 문서** |
| 데스크톱 앱 문서 (KO) | 앱 실행/설정/빌드/문제 해결 | [apps/desktop/README.md](./apps/desktop/README.md) |
| 데스크톱 앱 문서 (EN) | Desktop guide in English | [apps/desktop/README.en.md](./apps/desktop/README.en.md) |
| 웹 앱 문서 | 웹 데모/라우트/환경변수/배포 | [apps/web/README.md](./apps/web/README.md) |

## 빠른 시작

사전 요구사항:
- Node.js 18+
- npm 9+

데스크톱 앱 실행:

```bash
cd apps/desktop
npm install
npm start
```

웹 앱 실행:

```bash
cd apps/web
npm install
npm run dev
```

## 저장소 구조

```text
apps/
├─ desktop/   # Electron + MediaPipe Pose 데스크톱 앱
├─ web/       # Next.js 기반 KR/EN 랜딩 + 웹캠 데모
└─ shared/    # posture/policy/release 공용 모듈
```

## 앱별 요약

### Desktop (`apps/desktop`)

- 실시간 자세 판정 (`Turtle Neck`, `Slouching`, `Text Neck`)
- Baseline 캘리브레이션 + 디바운스/쿨다운 알림 정책
- 시각 알림(오버레이), 소리 알림, 절전 모드, 트레이 지원
- 자세한 사용법: [apps/desktop/README.md](./apps/desktop/README.md)

### Web (`apps/web`)

- Locale 라우트: `/ko`, `/en`
- 제품 소개/작동 원리/FAQ/다운로드/데모 페이지
- GA4 + Clarity + Cloudflare 분석 이벤트 지원
- 자세한 운영 가이드: [apps/web/README.md](./apps/web/README.md)

## 릴리즈/메타데이터 참고

- 데스크톱 배포 아티팩트 이름은 `apps/desktop/package.json`의 `build.artifactName`을 기준으로 생성됩니다.
- 웹 다운로드 페이지의 버전/릴리즈 노트 메타데이터는 `apps/shared/releases/index.js`를 사용합니다.
- 새 릴리즈 반영 시 위 두 파일의 정합성을 함께 확인하세요.

## 개발 시 자주 하는 작업

데스크톱 배포 파일 생성:

```bash
cd apps/desktop
npm run dist
```

웹 프로덕션 빌드 점검:

```bash
cd apps/web
npm run build
npm run start
```
