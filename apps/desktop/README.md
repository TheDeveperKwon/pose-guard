# PoseGuard Lite (Desktop)

Language: **한국어** | [English](./README.en.md)

PoseGuard Lite는 Electron + MediaPipe Pose 기반 자세 모니터링 앱입니다.  
웹캠 랜드마크를 기준 자세(Baseline)와 비교해 `Turtle Neck`, `Slouching`, `Text Neck` 상태를 실시간으로 보여줍니다.

## 빠른 시작 (1분)

```bash
cd apps/desktop
npm install
npm start
```

처음 실행할 때:
1. 카메라 권한을 허용합니다.
2. `Start Monitoring`을 누르고 1~2초 정면 자세를 유지합니다.
3. 필요하면 `Settings`에서 알림/민감도를 조정합니다.

참고:
- `postinstall`, `start`, `build`, `dist` 실행 시 MediaPipe 자산이 자동 동기화됩니다.
- 수동 동기화: `npm run sync:mediapipe`

## 사용 가이드

### 1) 시작 전 체크

- 얼굴 + 어깨가 카메라 프레임에 함께 들어오게 맞춰주세요.
- 화면이 너무 어둡거나 역광이면 인식 정확도가 떨어질 수 있습니다.
- 여러 사람이 잡히면 화면 중앙/가까운 사용자가 우선 추적됩니다.

### 2) 모니터링 시작/중지

1. `Start Monitoring` 클릭
2. 상태가 `Calibrating...`일 때 자세를 고정
3. 상태가 `Monitoring`으로 바뀌면 추적 시작
4. 중지할 때 `Stop Monitoring` 클릭

재보정이 필요하면 `Recalibrate Baseline` 버튼을 눌러 기준 자세를 다시 잡습니다.

### 3) 상태와 알림 해석

- 상태 카드
  - `Good`: 기준 대비 정상 범위
  - `WARNING`: BAD 상태 감지
- 알림 트리거
  - BAD 상태가 `DEBOUNCE_TIME`(기본 2000ms) 이상 유지될 때 알림 발생
  - 반복 알림은 `COOLDOWN_MS`(기본 1500ms) 쿨다운 적용

### 4) 설정 가이드

설정값은 변경 즉시 로컬에 저장되며, 앱을 다시 실행해도 유지됩니다.

| 항목 | 기본값 | 설명 | 추천 사용 |
| --- | --- | --- | --- |
| Show Camera | OFF | 카메라 원본 미리보기 표시 | 프라이버시 우선이면 OFF |
| Visual Alert | ON | BAD 지속 시 가장자리 글로우 오버레이 | 기본 유지 권장 |
| Sound Alert | OFF | BAD 지속 시 소리 알림 추가 | 조용한 공간이면 OFF |
| Sound Volume | 0% | Sound Alert 볼륨 | Sound Alert ON 시 조정 |
| Overall Sensitivity | 50 | 높을수록 경고를 더 빠르게 감지 | 오탐 많으면 낮추기 |
| Power Saving Mode | OFF | 렌더링/미리보기 최소화 | 배터리 절약 시 ON |

팁:
- 설정 항목의 `?` 아이콘은 클릭/hover로 도움말을 볼 수 있습니다.
- `Sound Alert`가 꺼져 있으면 볼륨 슬라이더는 비활성화됩니다.

### 5) 추천 프리셋

- 사무실/도서관: `Visual Alert ON`, `Sound Alert OFF`, `Sensitivity 45~55`
- 재택 집중 모드: `Visual Alert ON`, `Sound Alert ON`, `Volume 20~40%`, `Sensitivity 55~65`
- 배터리 우선: `Power Saving ON`, 필요 시 `Show Camera OFF` 유지

## 문제 해결

### 카메라가 안 켜짐

- macOS: 시스템 설정 > 개인정보 보호 및 보안 > 카메라에서 앱 권한 확인
- 다른 화상회의 앱이 카메라를 점유 중이면 종료 후 다시 시도

### `No User Detected`가 계속 표시됨

- 얼굴/어깨가 프레임 안에 모두 보이는지 확인
- 조명 확보, 카메라와 거리 조정 후 `Recalibrate Baseline` 실행

### 소리 알림이 안 들림

- `Sound Alert`가 ON인지 확인
- `Sound Volume`이 0%가 아닌지 확인
- OS 출력 장치/볼륨이 음소거인지 확인

### 시각 알림이 잘 안 보임

- `Visual Alert`가 ON인지 확인
- 전체화면 앱 위에서 투명 오버레이 표시가 제한되는 환경인지 확인

## 핵심 기능

- 실시간 자세 추정 + 랜드마크 오버레이 렌더링
- 다중 인원 감지 시 주요 사용자 1인 선택 추적
- 모니터링 시작 시 자동 Baseline 캘리브레이션 (약 1.8초)
- 재캘리브레이션 진행률(%) 및 상태 메시지 표시
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
├─ main.js                              # Electron 메인 프로세스, 트레이, 시각 알람 오버레이
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
│  │  ├─ overlay.html                   # 시각 알람 글로우 오버레이
│  │  ├─ view.js                        # UI 이벤트/렌더링 연결
│  │  └─ vendor/mediapipe               # 동기화된 MediaPipe 정적 자산
│  └─ shared/                           # apps/shared re-export shim
└─ package.json
```

## 사전 요구사항

- Node.js 18 이상 권장
- macOS/Windows 카메라 권한 허용
- 최초 설치 시 네트워크 필요 (`npm install`)

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
- `Visual Alert`: ON
- `Sound Alert`: OFF
- `Sound Volume`: `0%`

## 권한/프라이버시 동작

- 카메라 영상은 로컬에서만 처리됩니다.
- 카메라 미리보기는 기본 숨김이며, 추정 오버레이는 유지됩니다.
- `Visual Alert`가 켜져 있으면 OS 레벨 투명 오버레이 창으로 시각 알림을 표시합니다.
- `Sound Alert`를 함께 켜면 동일 조건에서 소리 알림도 추가 재생됩니다.
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

- 사용자 설정의 기기 간 동기화 미지원
- 자동 테스트 코드 부재 (`npm test`는 placeholder)
