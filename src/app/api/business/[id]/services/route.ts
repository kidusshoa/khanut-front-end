import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

// Client-side approach - this is just a proxy to the backend API
export async function GET(request: NextRequest) {
  try {
    // Extract the business ID from the URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const businessId = pathParts[pathParts.indexOf("business") + 1];

    // Get query parameters from the URL
    const { searchParams } = url;
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const sort = searchParams.get("sort") || "";
    const order = searchParams.get("order") || "";
    const search = searchParams.get("search") || "";
    const serviceType = searchParams.get("serviceType") || "";

    // Build the API URL
    let apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/services/business/${businessId}?page=${page}&limit=${limit}`;

    if (sort) apiUrl += `&sort=${sort}`;
    if (order) apiUrl += `&order=${order}`;
    if (search) apiUrl += `&search=${search}`;
    if (serviceType) apiUrl += `&serviceType=${serviceType}`;

    // Get session for authentication
    const session = await getServerSession(authOptions);

    // Prepare headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add authorization header if session exists
    if (session?.accessToken) {
      headers["Authorization"] = `Bearer ${session.accessToken}`;
    }

    // Fetch services from the backend API
    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      // If the response is not OK, return the error
      try {
        const errorData = await response.json();
        return NextResponse.json(
          { error: errorData.message || "Failed to fetch services" },
          { status: response.status }
        );
      } catch (parseError) {
        return NextResponse.json(
          {
            error: `Failed to fetch services: ${response.status} ${response.statusText}`,
          },
          { status: response.status }
        );
      }
    }

    // Return the services data
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching business services:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
