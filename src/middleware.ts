import { type NextRequest, NextResponse } from "next/server"

const VALID_LANGS = ["ko", "en"] as const
const LANG_COOKIE_NAME = "preferred-lang"

// 경로별 기본 언어: 2025 아카이브는 영어 기본 유지, 그 외(2026)는 한국어 기본
function getPathDefaultLang(pathname: string): "ko" | "en" {
  return pathname === "/2025" || pathname.startsWith("/2025/") ? "en" : "ko"
}

function getPreferredLanguage(request: NextRequest, pathname: string): string {
  // 1. Check cookie for saved preference
  const cookieLang = request.cookies.get(LANG_COOKIE_NAME)?.value
  if (cookieLang && VALID_LANGS.includes(cookieLang as "ko" | "en")) {
    return cookieLang
  }

  // 2. Check Accept-Language header
  const acceptLanguage = request.headers.get("accept-language")
  if (acceptLanguage) {
    // Parse Accept-Language header (e.g., "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
    const languages = acceptLanguage.split(",").map((lang) => {
      const [code] = lang.trim().split(";")
      return code.toLowerCase()
    })

    // Check if Korean is preferred
    for (const lang of languages) {
      if (lang.startsWith("ko")) {
        return "ko"
      }
      if (lang.startsWith("en")) {
        return "en"
      }
    }
  }

  // 3. 경로별 기본 언어 (2026 → ko, /2025 → en)
  return getPathDefaultLang(pathname)
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // Static files (images, etc.)
  ) {
    return NextResponse.next()
  }

  const langParam = searchParams.get("lang")

  // If lang param exists and is valid, continue
  if (langParam && VALID_LANGS.includes(langParam as "ko" | "en")) {
    return NextResponse.next()
  }

  // If lang param is missing or invalid, redirect with detected language
  const preferredLang = getPreferredLanguage(request, pathname)

  const url = request.nextUrl.clone()

  // Preserve existing search params and add/update lang
  url.searchParams.set("lang", preferredLang)

  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
