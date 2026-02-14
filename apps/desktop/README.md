# PoseGuard Lite (Desktop)

Electron + MediaPipe Pose 기반의 자세 모니터링 데스크톱 앱입니다.  
웹캠 영상에서 자세 랜드마크를 추출하고, 기준 자세(Baseline) 대비 변화량으로 거북목/구부정/텍스트넥을 판정합니다.

## 주요 기능

- 실시간 자세 추정 및 오버레이 렌더링
- 기준 자세(Baseline) 캡처 후 상대 변화 기반 판정
- 자세 경고 상태가 일정 시간(기본 2초) 지속될 때만 알림음 재생(디바운스)
- 민감도(0~100), 비디오 투명도 조절
- 창 닫기 시 앱 종료

## 기술 스택

- Electron
- MediaPipe Pose
- Vanilla JavaScript (ES Modules)

## 폴더 구조

```text
apps/desktop
├─ main.js                         # Electron 메인 프로세스(윈도우/트레이)
├─ package.json
└─ src
   ├─ application
   │  └─ MonitorService.js         # 모니터링 루프/상태/경고 제어
   ├─ config
   │  └─ constants.js              # 임계값/모니터링 설정
   ├─ domain
   │  ├─ Evaluator.js              # 자세 판정 로직
   │  └─ Posture.js                # 랜드마크 기반 지표 계산
   ├─ infrastructure
   │  ├─ CameraAdapter.js          # 웹캠 접근
   │  ├─ MediaPipeAdapter.js       # MediaPipe 연결
   │  └─ AudioAdapter.js           # 알림음 재생
   └─ presentation
      ├─ index.html                # UI 마크업
      ├─ styles.css                # 스타일
      ├─ view.js                   # UI 이벤트/렌더링 연결
      └─ assets
         ├─ alert.mp3
         └─ icon.png
```

## 실행 방법

사전 요구사항:

- Node.js 18+ 권장
- macOS/Windows에서 웹캠 권한 허용
- 인터넷 연결 필요(MediaPipe 스크립트를 CDN에서 로드)

```bash
cd apps/desktop
npm install
npm start
```

## 빌드

```bash
cd apps/desktop
npm install
npm run build   # 폴더 형태로 빌드
npm run dist    # DMG/ZIP 생성
```

## 사용 방법

1. `Start Monitoring` 클릭
2. 자세를 곧게 한 상태에서 `Set Baseline` 클릭
3. 상태 패널에서 `Turtle Neck`, `Slouching`, `Text Neck` 확인
4. `Overall Sensitivity` 슬라이더로 판정 민감도 조정
5. `Video Opacity`로 원본 영상 가시성 조정
6. 중지 시 `Stop` 클릭

## 판정 로직 요약

`Posture`가 계산하는 지표:

- `eye distance` (얼굴-카메라 거리 변화 추정용)
- `torso height` (상체 기울어짐/구부정 추정용)
- `nose-ear y diff` (고개 숙임 추정용)

`Evaluator`는 Baseline 대비 아래 항목을 계산합니다:

- `zoomRatio = currentEyeDistance / baseline.zoom`
- `heightRatio = currentTorsoHeight / baseline.height`
- `pitchDiff = currentPitch - baseline.pitch`

민감도(0~100)에 따라 임계값을 동적으로 보정해 `BAD` / `NORMAL`을 결정합니다.

## 설정값

`src/config/constants.js`:

- `DEFAULT_THRESHOLDS`
  - `TURTLE_NECK: 1.3`
  - `SLOUCHING: 0.8`
  - `TEXT_NECK: 0.05`
- `MONITORING_CONFIG`
  - `DEBOUNCE_TIME: 2000` (ms)
  - `FRAME_INTERVAL: 200` (ms)

## 동작 특성 및 주의사항

- Baseline을 설정하지 않으면 기본적으로 `NORMAL` 상태로 처리됩니다.
- BAD 상태가 `DEBOUNCE_TIME` 이상 지속되면 알림음이 재생됩니다.
- 창 닫기 버튼을 누르면 앱이 종료됩니다.
- MediaPipe 관련 스크립트를 CDN으로 불러오므로 오프라인 환경에서는 동작이 제한될 수 있습니다.

## 사운드 모드

현재는 WebAudio 고정으로 경고음을 생성합니다. (파일 없이 브라우저 오디오)

Volume 슬라이더로 전체 볼륨을 조절할 수 있습니다.

## 릴리즈 파이프라인

GitHub Actions에서 태그(`v*`) 푸시 시 macOS/Windows 빌드를 수행하고
GitHub Releases에 업로드하도록 설정되어 있습니다.

```bash
git tag v1.0.1
git push origin v1.0.1
```

로컬 빌드는 `--publish never`로 실행되며, 업로드는 CI에서만 수행됩니다.

## 개선 아이디어

- 설정값(민감도/임계값) 영구 저장
- 알림음 재생 쿨다운(반복 알림 간격) 옵션 추가
- 릴리즈 자동화 고도화(릴리즈 노트/다운로드 링크 자동 반영)
- 테스트 코드 및 에러 처리 강화
