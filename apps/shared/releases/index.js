export const RELEASES = [
  {
    version: "v1.0.11",
    date: "2026-03-02",
    items: [
      "Move desktop `Recalibrate Baseline` action into the main controls to improve discoverability.",
      "Add one-time contextual coachmark guidance for recalibration during monitoring."
    ]
  },
  {
    version: "v1.0.10",
    date: "2026-03-02",
    items: [
      "Add desktop language settings for Korean/English with immediate UI switching and persisted preference.",
      "Refactor desktop i18n into shared locale modules for renderer/main to remove hard-coded translation blocks.",
      "Update web landing hero copy to emphasize real-time posture monitoring alerts.",
      "Fix calibration stall after monitor stop/restart by stabilizing camera restart, monitor loop lifecycle, and calibration sample handling."
    ]
  },
  {
    version: "v1.0.9",
    date: "2026-02-23",
    items: [
      "Add local MediaPipe asset synchronization for desktop via `sync:mediapipe` and wire it into install/start/build/dist flows.",
      "Split desktop alert controls into independent visual/sound toggles and add clickable help tips in Settings.",
      "Expand root/web/desktop README guides with clearer navigation paths and troubleshooting notes."
    ]
  },
  {
    version: "v1.0.8",
    date: "2026-02-21",
    items: [
      "Upgrade desktop UX and onboarding flow for faster first-time setup.",
      "Apply privacy-first defaults for monitoring and camera preview behavior.",
      "Refine monitoring flow, calibration UX, and desktop UI states for stability."
    ]
  },
  {
    version: "v1.0.7",
    date: "2026-02-18",
    items: [
      "Add desktop Manner Mode for public-space use with full-screen edge glow alerts instead of alarm sound.",
      "Show tray on minimize while keeping close action as app quit.",
      "Refactor MediaPipe init timing, alert policy sharing, and release/site metadata handling for stability."
    ]
  },
  {
    version: "v1.0.6",
    date: "2026-02-16",
    items: [
      "Package desktop release resources with extraResources so shared modules are available in packaged apps.",
      "Prevent release-time ERR_FILE_NOT_FOUND when loading shared posture/policy modules from desktop builds."
    ]
  },
  {
    version: "v1.0.5",
    date: "2026-02-16",
    items: [
      "Share posture thresholds/monitoring policy parameters across desktop and web from apps/shared.",
      "Tune turtle-neck threshold to be more sensitive (TURTLE_NECK: 1.2).",
      "Simplify desktop app code by removing unused state, duplicated handlers, and dead posture methods.",
      "Propagate desktop monitor start errors consistently to UI handling.",
      "Correct desktop shared re-export paths so posture/policy modules resolve correctly."
    ]
  },
  {
    version: "v1.0.4",
    date: "2026-02-17",
    items: [
      "Unify posture logic with shared modules to reduce desktop/web drift.",
      "Add SEO metadata, OG/Twitter cards, canonical links, sitemap, and robots.",
      "Switch camera visibility to on/off toggle and keep posture points visible when video is hidden.",
      "Stabilize monitor loop and simplify audio/download flow.",
      "Add usage/landing content updates and improve favicon/icon handling."
    ]
  },
  {
    version: "v1.0.3",
    date: "2026-02-14",
    items: [
      "Fix release packaging artifact handling and align download URLs.",
      "Add direct binary download links for latest release assets."
    ]
  },
  {
    version: "v1.0.2",
    date: "2026-02-14",
    items: [
      "Fix release CI to use cross-platform publish configuration."
    ]
  },
  {
    version: "v1.0.1",
    date: "2026-02-14",
    items: [
      "Update FAQ wording and hide placeholder pages (Q&A, Sponsor) until rollout.",
      "Apply latest release URL in download flow."
    ]
  },
  {
    version: "v1.0.0",
    date: "2026-02-14",
    items: [
      "Desktop app architecture and media pipeline initialization.",
      "Add webcam tracking and posture monitoring core features.",
      "Add WebAudio alerts with volume controls.",
      "Add binary packaging configuration and basic release readiness."
    ]
  }
];

export const LATEST_RELEASE = RELEASES[0];
