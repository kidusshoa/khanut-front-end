import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicPaths = ["/login"];

  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access-token")?.value;
 
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - API routes (handled separately)
     * - Static files
     * - Public routes
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|register).*)",
  ],
};
