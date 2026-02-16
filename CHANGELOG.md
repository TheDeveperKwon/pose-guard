# Changelog

## v1.0.6 (2026-02-16)

### Fixed
- Package desktop release resources with `extraResources` so shared modules are available in packaged apps.
- Prevent release-time `ERR_FILE_NOT_FOUND` when loading shared posture/policy modules from desktop builds.

## v1.0.5 (2026-02-16)

### Changed
- Share posture thresholds/monitoring policy parameters across desktop and web from `apps/shared`.
- Tune turtle-neck threshold to be more sensitive (`TURTLE_NECK: 1.2`).
- Simplify desktop app code by removing unused state, duplicated handlers, and dead posture methods.

### Fixed
- Propagate desktop monitor start errors consistently to UI handling.
- Correct desktop shared re-export paths so posture/policy modules resolve correctly.

## v1.0.4 (2026-02-17)

### Added
- Unify posture logic with shared modules to reduce desktop/web drift.
- Add SEO metadata, OG/Twitter cards, canonical links, sitemap, and robots.
- Keep posture point overlay visible even when camera preview is hidden.
- Add/refresh usage and landing content sections.
- Unify desktop posture/policy imports with shared modules via desktop re-export shims.

### Fixed
- Stabilize monitor loop and simplify audio/download flow.
- Improve favicon and icon handling.
- Normalize shared module import paths across desktop and web to keep behavior and logic consistent.

## v1.0.3 (2026-02-14)

### Fixed
- Fix release packaging artifact handling and align download URLs.
- Add direct binary download links for latest release assets.

## v1.0.2 (2026-02-14)

### Fixed
- Fix release CI to use cross-platform publish configuration.

## v1.0.1 (2026-02-14)

### Added
- Update FAQ wording and hide placeholder pages (Q&A, Sponsor) until rollout.

### Fixed
- Apply latest release URL in download flow.

## v1.0.0 (2026-02-14)

### Added
- Desktop app architecture and media pipeline initialization.
- Webcam tracking and posture monitoring core features.
- WebAudio alerts with volume controls.
- Binary packaging configuration and release readiness.
