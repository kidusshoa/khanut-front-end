import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const businessId = context.params.id;
    
    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const page = url.searchParams.get("page") || "1";
    const limit = url.searchParams.get("limit") || "10";
    const sort = url.searchParams.get("sort") || "";
    const order = url.searchParams.get("order") || "";
    const search = url.searchParams.get("search") || "";
    const serviceType = url.searchParams.get("serviceType") || "";

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
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch services" },
        { status: response.status }
      );
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
