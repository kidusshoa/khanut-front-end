import { signOut } from "next-auth/react";
import { authService } from "@/services/auth";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

/**
 * Handles logout across the application with a consistent approach
 * 1. Calls the backend logout API to blacklist the refresh token
 * 2. Clears cookies
 * 3. Signs out from NextAuth
 *
 * @param refreshToken The refresh token to be blacklisted
 * @param callbackUrl The URL to redirect to after logout (defaults to /login)
 */
export async function handleLogout(
  refreshToken?: string,
  callbackUrl: string = "/login"
) {
  try {
    // 1. Call the backend logout API if we have a refresh token
    const token = refreshToken || Cookies.get("refresh-token");
    if (token) {
      try {
        await authService.logout(token);
      } catch (apiError) {
        console.error("API logout error:", apiError);
        // Continue with local logout even if API call fails
      }
    }

    // 2. Clear cookies
    Cookies.remove("client-token");
    Cookies.remove("refresh-token");
    Cookies.remove("user-role");
    Cookies.remove("user-id");
    Cookies.remove("businessId");

    // 3. Sign out from NextAuth
    await signOut({ callbackUrl });

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);

    // If API call fails, still try to sign out from NextAuth and clear cookies
    Cookies.remove("client-token");
    Cookies.remove("refresh-token");
    Cookies.remove("user-role");
    Cookies.remove("user-id");
    Cookies.remove("businessId");

    await signOut({ callbackUrl });

    return { success: false, error };
  }
}

/**
 * Get the authentication token from cookies or localStorage
 * @returns The authentication token or null if not found
 */
export const getAuthToken = async (): Promise<string | null> => {
  // Try to get the token from cookies first
  const cookieToken = Cookies.get("client-token");
  if (cookieToken) {
    return cookieToken;
  }

  // Then try localStorage
  if (typeof window !== "undefined") {
    const localToken = localStorage.getItem("accessToken");
    if (localToken) {
      // If found in localStorage but not in cookies, set it in cookies for consistency
      Cookies.set("client-token", localToken, { expires: 7 });
      return localToken;
    }
  }

  // If no token is found, return null
  return null;
};

/**
 * Check if the user is authenticated
 * @returns True if the user is authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  const token =
    Cookies.get("client-token") ||
    (typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null);
  return !!token;
};

/**
 * Get the user's role
 * @returns The user's role or null if not found
 */
export const getUserRole = (): string | null => {
  return (
    Cookies.get("user-role") ||
    (typeof window !== "undefined" ? localStorage.getItem("userRole") : null)
  );
};

/**
 * Get the user's ID
 * @returns The user's ID or null if not found
 */
export const getUserId = (): string | null => {
  return (
    Cookies.get("user-id") ||
    (typeof window !== "undefined" ? localStorage.getItem("userId") : null)
  );
};
