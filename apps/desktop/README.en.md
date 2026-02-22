# PoseGuard Lite (Desktop)

Language: [한국어](./README.md) | **English**

PoseGuard Lite is an Electron + MediaPipe Pose desktop app for posture monitoring.  
It compares webcam landmarks against a calibrated baseline and reports `Turtle Neck`, `Slouching`, and `Text Neck` in real time.

## Key Features

- Real-time pose estimation with landmark overlay rendering
- Primary-user selection when multiple people are detected
- Automatic baseline calibration at monitor start (about 1.8s)
- Recalibration progress (%) and status messaging
- Alerts only after BAD posture lasts beyond `DEBOUNCE_TIME`
- Repeated-alert cooldown using `COOLDOWN_MS`
- `Visual Alert` (default ON): full-screen edge glow overlay
- `Sound Alert` (default OFF): optional extra sound notification
- Camera preview default OFF, optional toggle in settings
- Power-saving mode (hides preview/rendering), sensitivity and volume controls
- One-time onboarding modal on first launch
- Tray icon on minimize, app quits on window close

## Tech Stack

- Electron (main/renderer split with preload bridge)
- MediaPipe Pose
- Vanilla JavaScript (ES Modules)
- Shared modules
  - `apps/shared/posture`: sample extraction and posture evaluation
  - `apps/shared/policy`: monitoring and sound policy constants

## Directory Layout

```text
apps/desktop
├─ main.js                              # Electron main process, tray, visual-alert overlay
├─ scripts/
│  └─ sync-mediapipe-assets.js          # Sync static assets from node_modules to vendor
├─ src
│  ├─ application/MonitorService.js     # Monitoring loop, calibration, alert flow
│  ├─ domain/
│  │  ├─ Evaluator.js                   # Evaluation using shared posture logic
│  │  └─ Posture.js                     # Landmark-to-sample conversion
│  ├─ infrastructure/
│  │  ├─ CameraAdapter.js               # getUserMedia handling
│  │  ├─ MediaPipeAdapter.js            # Pose init and result selection
│  │  └─ AudioAdapter.js                # WebAudio tone generation
│  ├─ presentation/
│  │  ├─ index.html                     # Main UI
│  │  ├─ overlay.html                   # Full-screen glow overlay for visual alerts
│  │  ├─ view.js                        # UI events and rendering bridge
│  │  └─ vendor/mediapipe               # Synced MediaPipe static assets
│  └─ shared/                           # Re-export shim to apps/shared
└─ package.json
```

## Prerequisites

- Node.js 18+ recommended
- Camera permission granted on macOS/Windows
- Network required for first install (`npm install`)

Notes:
- MediaPipe assets are auto-synced during `postinstall`, `start`, `build`, and `dist`.
- Sync target: `src/presentation/vendor/mediapipe`

## Run

```bash
cd apps/desktop
npm install
npm start
```

Re-run only MediaPipe sync:

```bash
npm run sync:mediapipe
```

## Build

```bash
cd apps/desktop
npm install
npm run build   # unpacked directory output
npm run dist    # installer/release artifacts
```

`electron-builder` targets:
- macOS: `dmg`, `zip`
- Windows: `nsis`, `zip`
- Linux: `AppImage`, `deb` (local config)

## Usage Flow

1. Click `Start Monitoring`
2. Keep face and shoulders in frame for auto calibration
3. Check `Turtle Neck`, `Slouching`, `Text Neck` status fields
4. Tune sensitivity/visual alert/sound alert/power saving/volume in `Settings` if needed
5. Click `Recalibrate Baseline` to reset baseline posture
6. Click `Stop Monitoring` to stop

## Posture Evaluation Summary

`extractPostureSample()` derives:

- `zoom`: distance between eyes
- `height`: vertical distance between nose and shoulder midpoint
- `pitch`: y-axis difference between nose and ear midpoint

Evaluation metrics:

- `zoomRatio = current.zoom / baseline.zoom`
- `heightRatio = current.height / baseline.height`
- `pitchDiff = current.pitch - baseline.pitch`

Sensitivity (0-100) adjusts thresholds to produce `NORMAL` or `BAD`.

## Default Policy Values

Source files:
- `apps/shared/posture/index.js`
- `apps/shared/policy/index.js`

Values:
- `DEFAULT_THRESHOLDS`
  - `TURTLE_NECK: 1.2`
  - `SLOUCHING: 0.8`
  - `TEXT_NECK: 0.05`
- `MONITORING_CONFIG`
  - `DEBOUNCE_TIME: 2000`ms
  - `FRAME_INTERVAL: 200`ms
- `SOUND_CONFIG`
  - `COOLDOWN_MS: 1500`ms

UI defaults (`src/presentation/view.js`):
- `Visual Alert`: ON
- `Sound Alert`: OFF
- `Sound Volume`: `0%` (quiet-by-default)

## Privacy and Permission Behavior

- Camera data is processed locally.
- Camera preview is hidden by default; posture overlay can still render.
- When `Visual Alert` is enabled, alerts use an OS-level transparent overlay window.
- If `Sound Alert` is also enabled, a sound alert is played under the same BAD posture condition.
- Window `close` quits the app (not minimize-to-tray).

## Release

Based on `.github/workflows/release.yml`:
- Pushing a `v*` tag triggers macOS/Windows build and GitHub Release upload
- Local `npm run dist` uses `--publish never` (build only, no upload)

Example:

```bash
git tag v1.0.8
git push origin v1.0.8
```

## Known Gaps

- No cross-device sync for user settings
- No automated tests yet (`npm test` is a placeholder)
