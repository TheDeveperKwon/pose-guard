# PoseGuard Lite (Desktop)

Docs: [Project README](../../README.md) | [Web README](../web/README.md) | [한국어](./README.md) | **English**

PoseGuard Lite is an Electron + MediaPipe Pose desktop app for posture monitoring.  
It compares webcam landmarks against a calibrated baseline and reports `Turtle Neck`, `Slouching`, and `Text Neck` in real time.

## Quick Start (1 minute)

```bash
cd apps/desktop
npm install
npm start
```

On first launch:
1. Allow camera access.
2. Click `Start Monitoring` and hold a neutral posture for 1-2 seconds.
3. Adjust alert and sensitivity options in `Settings` if needed.

Notes:
- MediaPipe assets are auto-synced during `postinstall`, `start`, `build`, and `dist`.
- Manual sync: `npm run sync:mediapipe`

## Usage Guide

### 1) Pre-check

- Keep your face and shoulders visible in frame.
- Very dark scenes or strong backlight can reduce detection quality.
- When multiple people are visible, the app prioritizes a primary user.

### 2) Start and stop monitoring

1. Click `Start Monitoring`
2. Keep posture steady while status shows `Calibrating...`
3. Monitoring begins when status changes to `Monitoring`
4. Click `Stop Monitoring` to stop

Use `Recalibrate Baseline` any time you want to reset the baseline posture.

### 3) Understand status and alerts

- Status cards
  - `Good`: within normal range vs baseline
  - `WARNING`: BAD posture detected
- Alert trigger policy
  - BAD posture must last longer than `DEBOUNCE_TIME` (default 2000ms)
  - Repeated alerts are rate-limited by `COOLDOWN_MS` (default 1500ms)

### 4) Settings guide

Settings are saved immediately to local storage and restored on next launch.

| Option | Default | Meaning | Recommended usage |
| --- | --- | --- | --- |
| Show Camera | OFF | Shows raw camera preview | Keep OFF for privacy |
| Visual Alert | ON | Edge-glow overlay for sustained BAD posture | Keep ON by default |
| Sound Alert | OFF | Adds audio alert for sustained BAD posture | Turn ON in private spaces |
| Sound Volume | 0% | Alert volume when Sound Alert is ON | Increase only when needed |
| Overall Sensitivity | 50 | Higher value reacts faster | Lower if too many false positives |
| Power Saving Mode | OFF | Minimizes preview/rendering load | Turn ON for battery saving |

Tips:
- `?` icons in Settings support click/hover help.
- When `Sound Alert` is OFF, the volume slider is disabled.

### 5) Recommended presets

- Office/library: `Visual Alert ON`, `Sound Alert OFF`, `Sensitivity 45-55`
- Home focus mode: `Visual Alert ON`, `Sound Alert ON`, `Volume 20-40%`, `Sensitivity 55-65`
- Battery-first: `Power Saving ON`, usually keep `Show Camera OFF`

## Troubleshooting

### Camera does not start

- macOS: System Settings > Privacy & Security > Camera, then allow the app
- Close other apps that may be using the camera (video meeting tools, etc.)

### `No User Detected` keeps showing

- Make sure both face and shoulders are visible
- Improve lighting and camera distance, then run `Recalibrate Baseline`

### No sound alert

- Check if `Sound Alert` is ON
- Check if `Sound Volume` is greater than 0%
- Check OS output device and mute state

### Visual alert is hard to notice

- Confirm `Visual Alert` is ON
- Some fullscreen app environments may limit transparent overlay visibility

## Key Features

- Real-time pose estimation with landmark overlay rendering
- Primary-user selection when multiple people are detected
- Automatic baseline calibration at monitor start (about 1.8s)
- Recalibration progress (%) and status messaging
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
- `Sound Volume`: `0%`

## Privacy and Permission Behavior

- Camera data is processed locally.
- Camera preview is hidden by default; posture overlay can still render.
- When `Visual Alert` is enabled, alerts use an OS-level transparent overlay window.
- If `Sound Alert` is also enabled, audio alerts are played under the same BAD posture condition.
- Window `close` quits the app (not minimize-to-tray).

## Release

Based on `.github/workflows/release.yml`:
- Pushing a `v*` tag triggers macOS/Windows build and GitHub Release upload
- Local `npm run dist` uses `--publish never` (build only, no upload)

Example:

```bash
git tag v1.0.9
git push origin v1.0.9
```

## Known Gaps

- No cross-device sync for user settings
- No automated tests yet (`npm test` is a placeholder)
