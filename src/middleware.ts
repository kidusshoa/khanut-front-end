import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Public paths that don't need redirection
  const publicPaths = ["/login", "/register", "/verify", "/"];

  // Allow access to business registration only after verification
  if (path === "/business/register") {
    const isVerified = request.cookies.get("is-verified")?.value;
    if (!isVerified) {
      return NextResponse.redirect(new URL("/register", request.url));
    }
  }

  // If it's the root path (/), check for authentication
  if (path === "/") {
    const accessToken = request.cookies.get("access-token")?.value;
    const userRole = request.cookies.get("user-role")?.value;

    if (accessToken && userRole) {
      // Redirect based on role
      switch (userRole) {
        case "admin":
          return NextResponse.redirect(
            new URL("/admin/dashboard", request.url)
          );
        case "business":
          return NextResponse.redirect(
            new URL("/business/dashboard", request.url)
          );
        case "customer":
          return NextResponse.redirect(
            new URL("/customer/dashboard", request.url)
          );
        default:
          return NextResponse.next();
      }
    }
  }

  // For other paths, continue with existing logic
  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access-token")?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based access control
  const userRole = request.cookies.get("user-role")?.value;

  if (path.startsWith("/admin") && userRole !== "admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (path.startsWith("/business") && userRole !== "business") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (path.startsWith("/customer") && userRole !== "customer") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/admin/:path*",
    "/business/:path*",
    "/customer/:path*",
  ],
};
