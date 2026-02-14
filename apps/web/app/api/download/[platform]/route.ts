import { NextResponse } from "next/server";

const OWNER = "TheDeveperKwon";
const REPO = "pose-guard";
const RELEASE_PAGE = `https://github.com/${OWNER}/${REPO}/releases/latest`;
const DIRECT_ASSET = {
  mac: `https://github.com/${OWNER}/${REPO}/releases/latest/download/PoseGuard-Lite-mac-arm64.dmg`,
  win: `https://github.com/${OWNER}/${REPO}/releases/latest/download/PoseGuard-Lite-win-x64.exe`
} as const;

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Platform = "mac" | "win";

function pickAssetUrl(platform: Platform, assets: Array<{ name?: string; browser_download_url?: string }>) {
  const patterns =
    platform === "mac"
      ? [/^PoseGuard-Lite-.*mac.*\.dmg$/i, /^PoseGuard.*\.dmg$/i, /\.dmg$/i]
      : [/^PoseGuard-Lite-.*win.*\.exe$/i, /^PoseGuard.*\.exe$/i, /\.exe$/i];

  for (const pattern of patterns) {
    const found = assets.find((asset) => {
      const name = asset.name ?? "";
      return pattern.test(name) && Boolean(asset.browser_download_url);
    });
    if (found?.browser_download_url) return found.browser_download_url;
  }

  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: { platform: string } }
) {
  const platform = params.platform;
  if (platform !== "mac" && platform !== "win") {
    return NextResponse.redirect(RELEASE_PAGE, { status: 302 });
  }

  try {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "pose-guard-download-proxy",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      cache: "no-store"
    });

    if (!res.ok) return NextResponse.redirect(DIRECT_ASSET[platform], { status: 302 });

    const data = await res.json();
    const assets = Array.isArray(data?.assets) ? data.assets : [];
    const assetUrl = pickAssetUrl(platform, assets);

    return NextResponse.redirect(assetUrl ?? DIRECT_ASSET[platform], { status: 302 });
  } catch {
    return NextResponse.redirect(DIRECT_ASSET[platform], { status: 302 });
  }
}
