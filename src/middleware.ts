import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (token?.role === "admin" && !path.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    if (token?.role === "business" && !path.startsWith("/business")) {
      return NextResponse.redirect(new URL("/business/dashboard", req.url));
    }

    if (token?.role === "customer" && !path.startsWith("/customer")) {
      return NextResponse.redirect(new URL("/customer/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/business/:path*",
    "/customer/:path*",
  ],
};
