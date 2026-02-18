const DEV_FALLBACK_SITE_URL = "http://localhost:3000";

function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

export function getSiteUrl() {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "");

  if (configured) {
    return trimTrailingSlash(configured);
  }

  if (process.env.NODE_ENV !== "production") {
    return DEV_FALLBACK_SITE_URL;
  }

  throw new Error("NEXT_PUBLIC_SITE_URL must be configured in production.");
}
