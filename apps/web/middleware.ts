import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "./lib/i18n";

const LOCALE_COOKIE = "pg_locale";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

function detectLocaleFromAcceptLanguage(value: string | null) {
  if (!value) return null;

  const ranked = value
    .split(",")
    .map((part) => {
      const [langRaw, qRaw] = part.trim().split(";q=");
      const lang = langRaw.toLowerCase();
      const q = qRaw ? Number.parseFloat(qRaw) : 1;
      return { lang, q: Number.isFinite(q) ? q : 0 };
    })
    .sort((a, b) => b.q - a.q);

  for (const item of ranked) {
    if (item.lang === "ko" || item.lang.startsWith("ko-")) return "ko";
    if (item.lang === "en" || item.lang.startsWith("en-")) return "en";
  }

  return null;
}

function resolveLocale(request: NextRequest): "ko" | "en" {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale;
  }

  const browserLocale = detectLocaleFromAcceptLanguage(
    request.headers.get("accept-language")
  );
  if (browserLocale) {
    return browserLocale;
  }

  const country = request.geo?.country?.toUpperCase();
  if (country === "KR") {
    return "ko";
  }

  return "ko";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (first && isLocale(first)) {
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, first, {
      path: "/",
      maxAge: ONE_YEAR_IN_SECONDS,
      sameSite: "lax"
    });
    return response;
  }

  const locale = resolveLocale(request);
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname =
    pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: "lax"
  });
  return response;
}

export const config = {
  matcher: ["/((?!api).*)"]
};
