import { signOut } from "next-auth/react";
import { authService } from "@/services/auth";
import Cookies from "js-cookie";

/**
 * Handles logout across the application with a consistent approach
 * 1. Calls the backend logout API to blacklist the refresh token
 * 2. Clears cookies
 * 3. Signs out from NextAuth
 * 
 * @param refreshToken The refresh token to be blacklisted
 * @param callbackUrl The URL to redirect to after logout (defaults to /login)
 */
export async function handleLogout(refreshToken?: string, callbackUrl: string = "/login") {
  try {
    // 1. Call the backend logout API if we have a refresh token
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    
    // 2. Clear cookies
    Cookies.remove("client-token");
    Cookies.remove("user-role");
    Cookies.remove("user-id");
    
    // 3. Sign out from NextAuth
    await signOut({ callbackUrl });
    
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    
    // If API call fails, still try to sign out from NextAuth and clear cookies
    Cookies.remove("client-token");
    Cookies.remove("user-role");
    Cookies.remove("user-id");
    
    await signOut({ callbackUrl });
    
    return { success: false, error };
  }
}
