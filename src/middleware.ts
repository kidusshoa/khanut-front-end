import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;

  // Public routes that should always be accessible
  if (
    path === "/login" ||
    path === "/register" ||
    path === "/verify" ||
    path.startsWith("/_next") ||
    path.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Handle role-specific routes
  if (path.startsWith("/customer/") && token.role !== "customer") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (path.startsWith("/business/") && token.role !== "business") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (path.startsWith("/admin/") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Handle business owner specific routes
  if (token.role === "business") {
    const businessStatus = token.businessStatus;

    if (!businessStatus && !path.includes("/business/register")) {
      return NextResponse.redirect(
        new URL(`/business/register/${token.id}`, request.url)
      );
    }

    if (businessStatus === "pending" && !path.includes("/business/pending")) {
      return NextResponse.redirect(new URL("/business/pending", request.url));
    }

    if (businessStatus === "rejected" && !path.includes("/business/rejected")) {
      return NextResponse.redirect(new URL("/business/rejected", request.url));
    }

    if (businessStatus !== "approved" && path.includes("/business/dashboard")) {
      return NextResponse.redirect(new URL("/business/pending", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. Root path (/)
     * 2. API routes (/api)
     * 3. Static files (_next/static, _next/image, favicon.ico)
     * 4. Auth-related routes (login, register)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|register|$).*)",
  ],
};
