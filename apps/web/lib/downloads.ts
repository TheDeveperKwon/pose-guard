import { LATEST_RELEASE, RELEASES } from "@shared/releases/index.js";

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
  version: LATEST_RELEASE.version,
  releasedAt: LATEST_RELEASE.date,
  macFileName,
  winFileName,
  releaseNotesUrl: "https://github.com/TheDeveperKwon/pose-guard/releases/latest"
} as const;

export const CHANGELOG_ENTRIES = RELEASES;
