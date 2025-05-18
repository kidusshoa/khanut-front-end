import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Try to get token from NextAuth
  const token = await getToken({ req: request });

  // Also check for client-token cookie as fallback
  const clientToken = request.cookies.get("client-token")?.value;
  const userRole = request.cookies.get("user-role")?.value;

  // For debugging
  console.log("Middleware token check:", {
    hasNextAuthToken: !!token,
    hasClientToken: !!clientToken,
    userRole: userRole || (token?.role as string),
  });

  const path = request.nextUrl.pathname;
  const search = request.nextUrl.search;

  // Public paths that don't require authentication
  const publicPaths = [
    "/login",
    "/register",
    "/verify",
    "/",
    "/business/login",
  ];

  // Check if this is a public business view page
  const isPublicBusinessView = path.match(/^\/business\/[^\/]+\/view\/?$/);

  // Check if this is a pending page
  const isPendingPage = path.match(/^\/business\/[^\/]+\/pending\/?$/);

  // Check if user is authenticated using either NextAuth token or client-token cookie
  const isAuthenticated = !!token || !!clientToken;

  // Create a combined token object for use in the middleware
  const effectiveToken = token || {
    role: userRole,
    id: request.cookies.get("user-id")?.value,
    accessToken: clientToken,
  };

  // Check if the path starts with any of the public paths, is a public business view, or is a pending page
  if (
    publicPaths.some((publicPath) => path.startsWith(publicPath)) ||
    isPublicBusinessView ||
    isPendingPage
  ) {
    return NextResponse.next();
  }

  // Handle direct business ID access (no need to redirect to dashboard)
  // The main business page is already the dashboard
  if (path.match(/^\/business\/[^\/]+\/?$/) && !path.includes("/register/")) {
    const businessId = path.split("/")[2];
    // If not authenticated as business, redirect to view page
    if (
      !isAuthenticated ||
      (userRole !== "business" && token?.role !== "business")
    ) {
      console.log("Not authenticated as business, redirecting to view page");
      return NextResponse.redirect(
        new URL(`/business/${businessId}/view`, request.url)
      );
    }
    // Otherwise, continue to the business dashboard page
    return NextResponse.next();
  }

  // If not authenticated for protected routes, redirect to login
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Handle search redirects for customers
  if (
    path === "/search" &&
    effectiveToken?.role === "customer" &&
    effectiveToken?.id
  ) {
    return NextResponse.redirect(
      new URL(`/customer/${effectiveToken.id}/search${search}`, request.url)
    );
  }

  // Customer route protection
  if (path.startsWith("/customer")) {
    if (effectiveToken.role !== "customer") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // For development, we'll skip the customer ID check
    // In production, you would want to check if the user is trying to access another customer's data
    /*
    // Extract customerId from path
    const pathParts = path.split("/");
    const pathCustomerId = pathParts[2];

    if (pathCustomerId && pathCustomerId !== effectiveToken.id) {
      return NextResponse.redirect(
        new URL(`/customer/${effectiveToken.id}`, request.url)
      );
    }
    */
  }

  // Business route protection
  if (path.startsWith("/business") && !isPublicBusinessView && !isPendingPage) {
    // Skip protection for business registration and login
    if (path.includes("/register/") || path.includes("/login")) {
      return NextResponse.next();
    }

    if (effectiveToken?.role !== "business") {
      return NextResponse.redirect(new URL("/business/login", request.url));
    }

    // Special handling for business dashboard
    if (path.includes("/dashboard") || path.match(/^\/business\/[^\/]+\/?$/)) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/business/status`,
          {
            headers: {
              Authorization: `Bearer ${effectiveToken.accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to check business status");
        }

        const { status, approved } = await response.json();
        if (status !== "approved" || !approved) {
          const businessId = path.split("/")[2];
          return NextResponse.redirect(
            new URL(`/business/${businessId}/pending`, request.url)
          );
        }

        // If we're at /business/[businessId]/dashboard, redirect to /business/[businessId]
        if (path.includes("/dashboard")) {
          const businessId = path.split("/")[2];
          return NextResponse.redirect(
            new URL(`/business/${businessId}`, request.url)
          );
        }
      } catch (error) {
        console.error("Error checking business status:", error);
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
