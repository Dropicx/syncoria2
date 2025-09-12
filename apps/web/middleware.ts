import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedRoutes: string[] = ["/app"];
const publicRoutes = new Set(["/", "/login", "/r"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isCallId = pathname.split("/")[3];
  const isCallPath = isCallId?.length === 6;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isPublic = publicRoutes.has(pathname);

  try {
    const sessionCookie = getSessionCookie(request.headers, {});

    console.log({
      sessionCookie,
      isCallPath,
    });

    if (isCallPath && !sessionCookie) {
      return NextResponse.redirect(
        new URL("/r?meetingId=" + isCallId, request.url)
      );
    }

    if (isPublic && sessionCookie && pathname !== "/") {
      return NextResponse.redirect(new URL("/app", request.url));
    }

    if (isProtected && !sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
