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
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
    response.cookies.delete("client-token");
    response.cookies.delete("user-role");
    response.cookies.delete("user-id");

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    // Clear cookies even if the API call fails
    const response = NextResponse.json(
      { success: false, message: "Failed to logout" },
      { status: 500 }
    );
    response.cookies.delete("client-token");
    response.cookies.delete("user-role");
    response.cookies.delete("user-id");

    return response;
  }
}
