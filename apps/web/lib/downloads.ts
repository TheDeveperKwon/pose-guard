const RELEASE_DOWNLOAD_BASE =
  "https://github.com/TheDeveperKwon/pose-guard/releases/latest/download";

const macFileName = "PoseGuard-Lite-mac-arm64.dmg";
const winFileName = "PoseGuard-Lite-win-x64.exe";

// Keep these file names aligned with apps/desktop/package.json -> build.artifactName
export const DOWNLOAD_URLS = {
  mac: `${RELEASE_DOWNLOAD_BASE}/${macFileName}`,
  win: `${RELEASE_DOWNLOAD_BASE}/${winFileName}`
} as const;

export const DOWNLOAD_META = {
  version: "v1.0.4",
  releasedAt: "2026-02-17",
  macFileName,
  winFileName,
  releaseNotesUrl: "https://github.com/TheDeveperKwon/pose-guard/releases/latest"
} as const;

export const CHANGELOG_ENTRIES = [
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
  },
] as const;
