import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedRoutes: string[] = ["/app"];
const publicRoutes = new Set(["/", "/login", "/r"]);
const isLoginRoute = (pathname: string) => pathname.startsWith("/login");

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  const isCallId = pathname.split("/")[3];
  const isCallPath = isCallId?.length === 6;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isPublic = publicRoutes.has(pathname);

  const { userId } = await auth();

  console.log({
    userId,
    isCallPath,
    pathname,
  });

  // Allow all login routes to pass through without authentication
  if (isLoginRoute(pathname)) {
    return NextResponse.next();
  }

  if (isCallPath && !userId) {
    return NextResponse.redirect(
      new URL("/r?meetingId=" + isCallId, req.url)
    );
  }

  if (isPublic && userId && pathname !== "/") {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  if (isProtected && !userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

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
