import { NextResponse } from "next/server";

const OWNER = "TheDeveperKwon";
const REPO = "pose-guard";
const RELEASE_PAGE = `https://github.com/${OWNER}/${REPO}/releases/latest`;

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
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" },
      cache: "no-store"
    });

    if (!res.ok) return NextResponse.redirect(RELEASE_PAGE, { status: 302 });

    const data = await res.json();
    const assets = Array.isArray(data?.assets) ? data.assets : [];
    const assetUrl = pickAssetUrl(platform, assets);

    return NextResponse.redirect(assetUrl ?? RELEASE_PAGE, { status: 302 });
  } catch {
    return NextResponse.redirect(RELEASE_PAGE, { status: 302 });
  }
}
