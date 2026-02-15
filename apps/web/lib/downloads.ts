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
  version: "v1.0.3",
  releasedAt: "2026-02-15",
  macFileName,
  winFileName,
  releaseNotesUrl: "https://github.com/TheDeveperKwon/pose-guard/releases/latest"
} as const;

export const CHANGELOG_ENTRIES = [
  {
    version: DOWNLOAD_META.version,
    date: DOWNLOAD_META.releasedAt,
    items: [
      "Initial bilingual landing structure (KR/EN)",
      "Webcam demo with MediaPipe Pose integration",
      "Download, how-it-works, FAQ, and privacy pages"
    ]
  }
] as const;
