import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();
    
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "Refresh token is required" },
        { status: 400 }
      );
    }
    
    // Call the backend logout API
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      token: refreshToken,
    });
    
    // Clear cookies
    const cookieStore = cookies();
    cookieStore.delete("client-token");
    cookieStore.delete("user-role");
    cookieStore.delete("user-id");
    
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    
    // Clear cookies even if the API call fails
    const cookieStore = cookies();
    cookieStore.delete("client-token");
    cookieStore.delete("user-role");
    cookieStore.delete("user-id");
    
    return NextResponse.json(
      { success: false, message: "Failed to logout" },
      { status: 500 }
    );
  }
}
