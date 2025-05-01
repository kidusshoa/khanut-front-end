"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Fetch business details
const fetchBusinessDetails = async (businessId: string) => {
  try {
    console.log("Fetching business details for ID:", businessId);
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

    // Try the primary endpoint first
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/businesses/${businessId}`;
      console.log("Trying primary URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Primary endpoint response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Business data received from primary endpoint:", data);
        return data;
      }

      console.error(
        "Primary endpoint failed:",
        response.status,
        response.statusText
      );
      // If primary endpoint fails, we'll try the fallback
    } catch (primaryError) {
      console.error("Error with primary endpoint:", primaryError);
      // Continue to fallback
    }

    // Try fallback endpoint
    const fallbackUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/business/${businessId}`;
    console.log("Trying fallback URL:", fallbackUrl);

    const fallbackResponse = await fetch(fallbackUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Fallback endpoint response status:", fallbackResponse.status);

    if (!fallbackResponse.ok) {
      console.error(
        "Both endpoints failed. Fallback response:",
        fallbackResponse.status,
        fallbackResponse.statusText
      );
      throw new Error(
        `Failed to fetch business details: ${fallbackResponse.status} ${fallbackResponse.statusText}`
      );
    }

    const fallbackData = await fallbackResponse.json();
    console.log("Business data received from fallback endpoint:", fallbackData);
    return fallbackData;
  } catch (error) {
    console.error("Error fetching business details:", error);
    throw error;
  }
};

export default function BusinessViewPage({
  params,
}: {
  params: { businessId: string };
}) {
  const businessId = params.businessId;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  console.log("Rendering BusinessViewPage with ID:", businessId);

  // Fetch business details
  const {
    data: business,
    isLoading: isBusinessLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["businessDetails", businessId],
    queryFn: () => fetchBusinessDetails(businessId),
    retry: 1,
  });

  useEffect(() => {
    console.log("Business data in component:", business);
    console.log("Loading state:", isBusinessLoading);
    console.log("Error state:", isError, error);
  }, [business, isBusinessLoading, isError, error]);

  if (isBusinessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-muted-foreground">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-500">
            Error Loading Business
          </h2>
          <p className="text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Failed to load business details"}
          </p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // If we have no business data but no error occurred, show a not found message
  if (!business) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 max-w-md text-center">
          <h2 className="text-xl font-semibold">Business Not Found</h2>
          <p className="text-muted-foreground">
            The business you're looking for could not be found or may have been
            removed.
          </p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // If we have business data, render the business details
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Business Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">
              {business?.name || "Business Name"}
            </CardTitle>
            <CardDescription>
              {business?.description || "Business Description"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Location</h3>
                <p className="text-muted-foreground">
                  {business?.address || "Address not available"}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Contact</h3>
                <p className="text-muted-foreground">
                  {business?.phone || "Phone not available"}
                </p>
                <p className="text-muted-foreground">
                  {business?.email || "Email not available"}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Business Hours</h3>
                <p className="text-muted-foreground">
                  {business?.businessHours || "Business hours not available"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              onClick={() => router.push(`/business/${businessId}/profile`)}
            >
              View Profile
            </Button>
            <Button
              className="w-full"
              onClick={() =>
                router.push(`/business/${businessId}/services/public`)
              }
            >
              View Services
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() =>
                router.push(`/business/${businessId}/appointments`)
              }
            >
              Book Appointment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
