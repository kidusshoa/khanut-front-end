import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;
  const search = request.nextUrl.search;

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/register", "/verify", "/"];

  // Check if this is a public business view page
  const isPublicBusinessView = path.match(/^\/business\/[^\/]+\/view\/?$/);

  // Check if the path starts with any of the public paths or is a public business view
  if (
    publicPaths.some((publicPath) => path.startsWith(publicPath)) ||
    isPublicBusinessView
  ) {
    return NextResponse.next();
  }

  // Handle direct business ID access (redirect to dashboard)
  if (path.match(/^\/business\/[^\/]+\/?$/) && !path.includes("/register/")) {
    const businessId = path.split("/")[2];
    // If authenticated and role is business, go to dashboard, otherwise view page
    if (token && token.role === "business") {
      return NextResponse.redirect(
        new URL(`/business/${businessId}/dashboard`, request.url)
      );
    } else {
      return NextResponse.redirect(
        new URL(`/business/${businessId}/view`, request.url)
      );
    }
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

  // Customer route protection
  if (path.startsWith("/customer")) {
    if (token.role !== "customer") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Extract customerId from path
    const pathParts = path.split("/");
    const pathCustomerId = pathParts[2];

    // For development, we'll skip the customer ID check
    // In production, you would want to check if the user is trying to access another customer's data
    /*
    if (pathCustomerId && pathCustomerId !== token.id) {
      return NextResponse.redirect(
        new URL(`/customer/${token.id}`, request.url)
      );
    }
    */
  }

  // Business route protection
  if (path.startsWith("/business") && !isPublicBusinessView) {
    // Skip protection for business registration
    if (path.includes("/register/")) {
      return NextResponse.next();
    }

    if (token.role !== "business") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Special handling for business dashboard
    if (path.includes("/dashboard")) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/business/status`,
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
          const businessId = path.split("/")[2];
          return NextResponse.redirect(
            new URL(`/business/${businessId}/pending`, request.url)
          );
        }
      } catch (error) {
        const businessId = path.split("/")[2];
        return NextResponse.redirect(
          new URL(`/business/${businessId}/pending`, request.url)
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
