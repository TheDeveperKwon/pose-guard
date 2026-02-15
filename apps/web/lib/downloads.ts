const RELEASE_DOWNLOAD_BASE =
  "https://github.com/TheDeveperKwon/pose-guard/releases/latest/download";

// Keep these file names aligned with apps/desktop/package.json -> build.artifactName
export const DOWNLOAD_URLS = {
  mac: `${RELEASE_DOWNLOAD_BASE}/PoseGuard-Lite-mac-arm64.dmg`,
  win: `${RELEASE_DOWNLOAD_BASE}/PoseGuard-Lite-win-x64.exe`
} as const;
