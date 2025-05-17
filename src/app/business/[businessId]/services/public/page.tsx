"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShoppingCart, Calendar, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

// Fetch business details
const fetchBusinessDetails = async (businessId: string) => {
  try {
    console.log("Fetching business details for ID:", businessId);

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

// Fetch business services
const fetchBusinessServices = async (businessId: string) => {
  try {
    console.log("Fetching services for business ID:", businessId);

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/services/business/${businessId}`;
    console.log("Services URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        "Services endpoint failed:",
        response.status,
        response.statusText
      );
      throw new Error(
        `Failed to fetch business services: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Services data received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching business services:", error);
    throw error;
  }
};

// Service type interface
interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  businessId: string;
  serviceType: "appointment" | "product" | "in_person";
  images: string[];
  duration?: number;
  inventory?: number;
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
}

export default function BusinessServicesPublicPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.businessId as string;
  const [activeTab, setActiveTab] = useState("all");

  console.log("Rendering BusinessServicesPublicPage with ID:", businessId);

  // Fetch business details
  const {
    data: business,
    isLoading: isBusinessLoading,
    error: businessError,
    isError: isBusinessError,
  } = useQuery({
    queryKey: ["businessDetails", businessId],
    queryFn: () => fetchBusinessDetails(businessId),
    retry: 1,
  });

  // Fetch business services
  const {
    data: services,
    isLoading: isServicesLoading,
    error: servicesError,
    isError: isServicesError,
  } = useQuery({
    queryKey: ["businessServices", businessId],
    queryFn: () => fetchBusinessServices(businessId),
    retry: 1,
  });

  // Filter services by type
  const filteredServices = services?.filter((service: Service) => {
    if (activeTab === "all") return true;
    return service.serviceType === activeTab;
  });

  // Loading state
  if (isBusinessLoading || isServicesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-muted-foreground">Loading business services...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isBusinessError || isServicesError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-500">
            Error Loading Data
          </h2>
          <p className="text-muted-foreground">
            {businessError instanceof Error
              ? businessError.message
              : servicesError instanceof Error
              ? servicesError.message
              : "Failed to load data"}
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

  // If we have no services data but no error occurred, show a no services message
  if (!services || services.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-fit"
            onClick={() => router.push(`/business/${businessId}/view`)}
          >
            Back to Business
          </Button>

          <h1 className="text-2xl font-bold">{business.name} - Services</h1>

          <div className="flex items-center justify-center min-h-[30vh]">
            <div className="flex flex-col items-center gap-2 max-w-md text-center">
              <h2 className="text-xl font-semibold">No Services Available</h2>
              <p className="text-muted-foreground">
                This business hasn't added any services yet.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Count services by type
  const appointmentCount = services.filter(
    (s: Service) => s.serviceType === "appointment"
  ).length;
  const productCount = services.filter(
    (s: Service) => s.serviceType === "product"
  ).length;
  const inPersonCount = services.filter(
    (s: Service) => s.serviceType === "in_person"
  ).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <Button
          variant="outline"
          className="w-fit"
          onClick={() => router.push(`/business/${businessId}/view`)}
        >
          Back to Business
        </Button>

        <h1 className="text-2xl font-bold">{business.name} - Services</h1>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All Services ({services.length})
            </TabsTrigger>
            {appointmentCount > 0 && (
              <TabsTrigger value="appointment">
                Appointments ({appointmentCount})
              </TabsTrigger>
            )}
            {productCount > 0 && (
              <TabsTrigger value="product">
                Products ({productCount})
              </TabsTrigger>
            )}
            {inPersonCount > 0 && (
              <TabsTrigger value="in_person">
                In-Person ({inPersonCount})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices?.map((service: Service) => (
                <Card
                  key={service._id}
                  className="overflow-hidden flex flex-col"
                >
                  {service.images && service.images.length > 0 ? (
                    <div className="relative h-48 w-full">
                      <img
                        src={service.images[0]}
                        alt={service.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="bg-muted h-48 w-full flex items-center justify-center">
                      <p className="text-muted-foreground">
                        No image available
                      </p>
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{service.name}</CardTitle>
                        <CardDescription className="mt-2">
                          {service.description}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          service.serviceType === "appointment"
                            ? "default"
                            : service.serviceType === "product"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {service.serviceType === "appointment"
                          ? "Appointment"
                          : service.serviceType === "product"
                          ? "Product"
                          : "In-Person"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-grow">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Price:</span>
                        <span>${service.price.toFixed(2)}</span>
                      </div>

                      {service.serviceType === "appointment" &&
                        service.duration && (
                          <div className="flex justify-between">
                            <span className="font-medium">Duration:</span>
                            <span>{service.duration} minutes</span>
                          </div>
                        )}

                      {service.serviceType === "product" &&
                        service.inventory !== undefined && (
                          <div className="flex justify-between">
                            <span className="font-medium">In Stock:</span>
                            <span>
                              {service.inventory > 0
                                ? `${service.inventory} available`
                                : "Out of stock"}
                            </span>
                          </div>
                        )}
                    </div>
                  </CardContent>

                  <CardFooter className="border-t pt-4">
                    {service.serviceType === "appointment" ? (
                      <Button
                        className="w-full"
                        onClick={() =>
                          router.push(
                            `/business/${businessId}/service/${service._id}/book`
                          )
                        }
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Appointment
                      </Button>
                    ) : service.serviceType === "product" ? (
                      <Button
                        className="w-full"
                        disabled={service.inventory === 0}
                        onClick={() =>
                          router.push(
                            `/business/${businessId}/service/${service._id}/purchase`
                          )
                        }
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {service.inventory === 0
                          ? "Out of Stock"
                          : "Add to Cart"}
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() =>
                          router.push(
                            `/business/${businessId}/service/${service._id}/details`
                          )
                        }
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
