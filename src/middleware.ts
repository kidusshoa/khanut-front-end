import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;
  const search = request.nextUrl.search;

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/register", "/verify", "/"];

  // Check if the path starts with any of the public paths
  if (publicPaths.some((publicPath) => path.startsWith(publicPath))) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Handle search redirects for customers
  if (path === "/search" && token?.role === "customer" && token?.customerId) {
    return NextResponse.redirect(
      new URL(`/customer/${token.customerId}/search${search}`, request.url)
    );
  }

  // Business route protection
  if (path.startsWith("/business")) {
    if (token.role !== "business") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Special handling for business dashboard
    if (path === "/business/dashboard") {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/business/status`,
          {
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to check business status");
        }

        const { status } = await response.json();
        if (status !== "approved") {
          return NextResponse.redirect(
            new URL("/business/pending", request.url)
          );
        }
      } catch (error) {
        return NextResponse.redirect(new URL("/business/pending", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
