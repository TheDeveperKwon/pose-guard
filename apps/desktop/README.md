# PoseGuard Lite (Desktop)

[English version](./README.en.md)

Electron + MediaPipe Pose 기반 자세 모니터링 앱입니다.  
웹캠 랜드마크를 기준 자세(Baseline)와 비교해 `Turtle Neck`, `Slouching`, `Text Neck` 상태를 실시간으로 표시합니다.

## 핵심 기능

- 실시간 자세 추정 + 랜드마크 오버레이 렌더링
- 다중 인원 감지 시 주요 사용자 1인 선택 추적
- 모니터링 시작 시 자동 Baseline 캘리브레이션 (약 1.8초)
- 재캘리브레이션 진행률(%) 및 상태 메시지 표시
- BAD 상태가 `DEBOUNCE_TIME` 이상 유지될 때만 알림 발생
- 반복 알림 쿨다운(`COOLDOWN_MS`) 적용
- `Manner Mode` (기본 ON): 소리 대신 전체 화면 가장자리 글로우 오버레이 표시
- 카메라 미리보기 기본 OFF, 필요 시 설정에서 표시
- 절전 모드(미리보기/렌더링 비활성화), 민감도, 볼륨 조절
- 첫 실행 1회 온보딩 모달
- 최소화 시 트레이 아이콘 생성, 창 닫기 시 앱 종료

## 기술 구성

- Electron (메인/렌더러 분리 + preload 브릿지)
- MediaPipe Pose
- Vanilla JavaScript (ES Modules)
- 공유 모듈
  - `apps/shared/posture`: 샘플 추출/자세 평가 로직
  - `apps/shared/policy`: 모니터링/사운드 정책값

## 폴더 구조

```text
apps/desktop
├─ main.js                              # Electron 메인 프로세스, 트레이, 매너모드 오버레이
├─ scripts/
│  └─ sync-mediapipe-assets.js          # node_modules -> vendor 정적 자산 동기화
├─ src
│  ├─ application/MonitorService.js     # 모니터링 루프/캘리브레이션/알림 흐름
│  ├─ domain/
│  │  ├─ Evaluator.js                   # shared posture 로직 기반 판정
│  │  └─ Posture.js                     # 랜드마크 샘플 변환
│  ├─ infrastructure/
│  │  ├─ CameraAdapter.js               # getUserMedia 처리
│  │  ├─ MediaPipeAdapter.js            # Pose 초기화/결과 선택
│  │  └─ AudioAdapter.js                # WebAudio 알림음 생성
│  ├─ presentation/
│  │  ├─ index.html                     # 메인 UI
│  │  ├─ overlay.html                   # 매너모드 글로우 오버레이
│  │  ├─ view.js                        # UI 이벤트/렌더링 연결
│  │  └─ vendor/mediapipe               # 동기화된 MediaPipe 정적 자산
│  └─ shared/                           # apps/shared re-export shim
└─ package.json
```

## 사전 요구사항

- Node.js 18 이상 권장
- macOS/Windows 카메라 권한 허용
- 최초 설치 시 네트워크 필요 (`npm install`)

참고:
- `postinstall`, `start`, `build`, `dist` 실행 시 MediaPipe 자산이 자동 동기화됩니다.
- 동기화 대상: `src/presentation/vendor/mediapipe`

## 실행

```bash
cd apps/desktop
npm install
npm start
```

수동 동기화만 다시 수행:

```bash
npm run sync:mediapipe
```

## 빌드

```bash
cd apps/desktop
npm install
npm run build   # unpacked directory 출력
npm run dist    # 설치/배포용 아티팩트 생성
```

`electron-builder` 타깃:
- macOS: `dmg`, `zip`
- Windows: `nsis`, `zip`
- Linux: `AppImage`, `deb` (로컬 설정 기준)

## 사용 흐름

1. `Start Monitoring` 클릭
2. 얼굴/어깨를 프레임에 맞춘 채 잠시 유지해 자동 캘리브레이션 완료
3. 상태 카드에서 `Turtle Neck`, `Slouching`, `Text Neck` 확인
4. 필요 시 `Settings`에서 민감도/매너모드/절전모드/볼륨 조정
5. `Recalibrate Baseline`으로 기준 자세 재설정
6. `Stop Monitoring`으로 중지

## 판정 로직 요약

`extractPostureSample()`이 랜드마크에서 아래 지표를 추출합니다.

- `zoom`: 양쪽 눈 거리
- `height`: 코와 양쪽 어깨 중간점의 높이 차
- `pitch`: 코와 양쪽 귀 중간점의 y축 차

평가 시 계산식:

- `zoomRatio = current.zoom / baseline.zoom`
- `heightRatio = current.height / baseline.height`
- `pitchDiff = current.pitch - baseline.pitch`

민감도(0~100)에 따라 임계값을 보정해 `NORMAL`/`BAD`를 판정합니다.

## 기본 정책값

출처:
- `apps/shared/posture/index.js`
- `apps/shared/policy/index.js`

값:
- `DEFAULT_THRESHOLDS`
  - `TURTLE_NECK: 1.2`
  - `SLOUCHING: 0.8`
  - `TEXT_NECK: 0.05`
- `MONITORING_CONFIG`
  - `DEBOUNCE_TIME: 2000`ms
  - `FRAME_INTERVAL: 200`ms
- `SOUND_CONFIG`
  - `COOLDOWN_MS: 1500`ms

UI 기본값(`src/presentation/view.js`):
- `Manner Mode`: ON
- `Sound Volume`: `0%` (조용한 기본값)

## 권한/프라이버시 동작

- 카메라 영상은 로컬에서만 처리됩니다.
- 카메라 미리보기는 기본 숨김이며, 추정 오버레이는 유지됩니다.
- `Manner Mode`에서는 소리 대신 OS 레벨 투명 오버레이 창으로 시각 알림을 표시합니다.
- 창 닫기(`close`)는 최소화가 아니라 앱 종료 동작입니다.

## 릴리즈

GitHub Actions(`.github/workflows/release.yml`) 기준:
- 태그 `v*` 푸시 시 macOS/Windows 빌드 + GitHub Release 업로드
- 로컬 `npm run dist`는 `--publish never`로 업로드 없이 아티팩트만 생성

예시:

```bash
git tag v1.0.8
git push origin v1.0.8
```

## Known Gaps

- 사용자 설정(민감도/볼륨/모드) 영구 저장 미지원
- 자동 테스트 코드 부재 (`npm test`는 placeholder)
