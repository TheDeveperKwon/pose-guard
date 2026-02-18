# PoseGuard

PoseGuard는 자세 모니터링 데스크톱 앱과 이를 소개/데모하는 웹 사이트를 함께 관리하는 멀티앱 저장소입니다.

## Repository Structure

```text
apps/
├─ desktop/   # Electron 기반 자세 모니터링 앱
└─ web/       # Next.js 기반 랜딩/데모 사이트
```

## Apps

1. Desktop App (`apps/desktop`)
- Electron + MediaPipe Pose
- 실시간 자세 판정, Baseline 보정, 디바운스 알림
- 매너모드(공공장소용): 소리 대신 전체화면 가장자리 시각 알림
- 최소화 시 트레이 생성, 닫기 시 앱 종료
- 상세 문서: `apps/desktop/README.md`

2. Web Site (`apps/web`)
- Next.js + TypeScript
- KR/EN 랜딩, 웹캠 데모, 다운로드/FAQ/설명 페이지
- 확장형 라우트 그룹: marketing / community / sponsor
- 상세 문서: `apps/web/README.md`

## Quick Start

사전 요구사항:
- Node.js 18+ 권장

Desktop 실행:

```bash
cd apps/desktop
npm install
npm start
```

Web 실행:

```bash
cd apps/web
npm install
npm run dev
```

## Notes

- 앱별 의존성은 각 폴더에서 개별 설치합니다.
- 웹 데모/데스크톱 일부 기능은 카메라 권한과 네트워크(CDN 리소스 로드)가 필요합니다.
