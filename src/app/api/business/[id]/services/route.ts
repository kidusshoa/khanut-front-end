import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract the ID from params
    const businessId = params.id;
    console.log("Business ID from params:", businessId);

    // Also log the URL path for debugging
    const requestUrl = new URL(request.url);
    console.log("Request URL:", requestUrl.toString());
    console.log("Request pathname:", requestUrl.pathname);

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 }
      );
    }

    // Get query parameters from the same URL
    const page = requestUrl.searchParams.get("page") || "1";
    const limit = requestUrl.searchParams.get("limit") || "10";
    const sort = requestUrl.searchParams.get("sort") || "";
    const order = requestUrl.searchParams.get("order") || "";
    const search = requestUrl.searchParams.get("search") || "";
    const serviceType = requestUrl.searchParams.get("serviceType") || "";

    // Build the API URL
    let apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/services/business/${businessId}?page=${page}&limit=${limit}`;

    if (sort) apiUrl += `&sort=${sort}`;
    if (order) apiUrl += `&order=${order}`;
    if (search) apiUrl += `&search=${search}`;
    if (serviceType) apiUrl += `&serviceType=${serviceType}`;

    console.log("Constructed API URL:", apiUrl);

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
    console.log("Fetching with headers:", headers);
    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      // If the response is not OK, return the error
      try {
        const errorData = await response.json();
        console.error("Error response data:", errorData);
        return NextResponse.json(
          { error: errorData.message || "Failed to fetch services" },
          { status: response.status }
        );
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
        return NextResponse.json(
          {
            error: `Failed to fetch services: ${response.status} ${response.statusText}`,
          },
          { status: response.status }
        );
      }
    }

    // Return the services data
    try {
      const data = await response.json();
      console.log("Successfully fetched services data:", data);
      return NextResponse.json(data);
    } catch (parseError) {
      console.error("Error parsing successful response:", parseError);
      return NextResponse.json(
        { error: "Failed to parse services data" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching business services:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
