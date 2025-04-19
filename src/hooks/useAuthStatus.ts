"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";

/**
 * Custom hook to determine if a user is authenticated
 * Checks multiple sources: NextAuth session, URL params, and cookies
 */
export function useAuthStatus() {
  const { status, data: session } = useSession();
  const params = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get customer ID from URL params if available
  const customerId = params.customerId as string;

  useEffect(() => {
    const checkAuth = () => {
      // Check NextAuth session
      const hasSession = status === "authenticated";

      // Check URL params
      const hasCustomerIdInUrl = !!customerId;

      // Check cookies
      const hasAuthCookie = !!Cookies.get("client-token");

      // Check localStorage for forced login state (for testing)
      // Use try-catch to handle server-side rendering where localStorage is not available
      let hasForceLoggedIn = false;
      try {
        hasForceLoggedIn =
          typeof window !== "undefined" &&
          localStorage.getItem("forceLoggedIn") === "true";
      } catch (e) {
        console.error("Error accessing localStorage:", e);
      }

      // User is authenticated if any of these are true
      const authenticated =
        hasSession || hasCustomerIdInUrl || hasAuthCookie || hasForceLoggedIn;

      setIsAuthenticated(authenticated);
      setIsLoading(false);

      // Debug
      console.log("Auth check:", {
        hasSession,
        hasCustomerIdInUrl,
        hasAuthCookie,
        hasForceLoggedIn,
        authenticated,
      });
    };

    checkAuth();
  }, [status, customerId]);

  return { isAuthenticated, isLoading, session, customerId };
}
