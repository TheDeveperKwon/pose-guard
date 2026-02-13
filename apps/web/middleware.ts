import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "./lib/i18n";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (!first) {
    return NextResponse.redirect(new URL("/ko", request.url));
  }

  if (!isLocale(first)) {
    return NextResponse.redirect(new URL(`/ko${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api).*)"]
};
