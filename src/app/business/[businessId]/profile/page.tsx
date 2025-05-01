"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Loader2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Star,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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

// Fetch business reviews
const fetchBusinessReviews = async (businessId: string) => {
  try {
    console.log("Fetching reviews for business ID:", businessId);

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/business/${businessId}`;
    console.log("Reviews URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        "Reviews endpoint failed:",
        response.status,
        response.statusText
      );
      return []; // Return empty array instead of throwing to handle gracefully
    }

    const data = await response.json();
    console.log("Reviews data received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching business reviews:", error);
    return []; // Return empty array on error
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
      return []; // Return empty array instead of throwing
    }

    const data = await response.json();
    console.log("Services data received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching business services:", error);
    return []; // Return empty array on error
  }
};

// Interfaces
interface Business {
  _id: string;
  name: string;
  description: string;
  category: string;
  city: string;
  email: string;
  phone: string;
  profilePicture?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface Review {
  _id: string;
  businessId: string;
  authorId: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  serviceType: "appointment" | "product" | "in_person";
  images: string[];
  duration?: number;
  inventory?: number;
}

export default async function BusinessProfilePage({
  params,
}: {
  params: { businessId: string };
}) {
  const businessId = params.businessId;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("about");

  // Fetch business details
  const {
    data: business,
    isLoading: isBusinessLoading,
    error: businessError,
  } = useQuery({
    queryKey: ["businessProfile", businessId],
    queryFn: () => fetchBusinessDetails(businessId),
    retry: 1,
  });

  // Fetch business reviews
  const { data: reviews = [], isLoading: isReviewsLoading } = useQuery({
    queryKey: ["businessReviews", businessId],
    queryFn: () => fetchBusinessReviews(businessId),
    retry: 1,
    enabled: !!business,
  });

  // Fetch business services
  const { data: services = [], isLoading: isServicesLoading } = useQuery({
    queryKey: ["businessServices", businessId],
    queryFn: () => fetchBusinessServices(businessId),
    retry: 1,
    enabled: !!business,
  });

  // Loading state
  if (isBusinessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-muted-foreground">Loading business profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (businessError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-500">
            Error Loading Business
          </h2>
          <p className="text-muted-foreground">
            {businessError instanceof Error
              ? businessError.message
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

  // Group services by type
  const appointmentServices = services.filter(
    (s: Service) => s.serviceType === "appointment"
  );
  const productServices = services.filter(
    (s: Service) => s.serviceType === "product"
  );
  const inPersonServices = services.filter(
    (s: Service) => s.serviceType === "in_person"
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Header with back button */}
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-fit"
            onClick={() => router.back()}
          >
            Back
          </Button>
        </div>

        {/* Business Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            <div className="relative w-full aspect-square max-w-[300px] mx-auto md:mx-0 rounded-lg overflow-hidden">
              {business.profilePicture ? (
                <img
                  src={business.profilePicture}
                  alt={business.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-4xl font-bold text-muted-foreground">
                    {business.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">{business.name}</h1>
              <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                <Badge variant="outline" className="text-sm">
                  {business.category}
                </Badge>
                {business.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {business.rating.toFixed(1)} ({business.reviewCount || 0}{" "}
                      reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>{business.city}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span>{business.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span>{business.email}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  onClick={() =>
                    router.push(`/business/${businessId}/analytics`)
                  }
                >
                  View Analytics
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => router.push(`/business/${businessId}/contact`)}
                >
                  Contact Business
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="w-full md:w-2/3">
            <Tabs
              defaultValue="about"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="mb-6">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {business.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">
                      {business.description}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Business Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Category
                        </h3>
                        <p>{business.category}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          City
                        </h3>
                        <p>{business.city}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Member Since
                        </h3>
                        <p>
                          {format(new Date(business.createdAt), "MMMM yyyy")}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Services
                        </h3>
                        <p>{services.length} services</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services" className="space-y-6">
                {isServicesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  </div>
                ) : services.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">
                        This business hasn't added any services yet.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {appointmentServices.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Appointment Services
                          </CardTitle>
                          <CardDescription>
                            Book appointments with {business.name}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {appointmentServices
                              .slice(0, 4)
                              .map((service: Service) => (
                                <div
                                  key={service._id}
                                  className="flex items-center gap-3 p-3 border rounded-lg"
                                >
                                  <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                    {service.images &&
                                    service.images.length > 0 ? (
                                      <img
                                        src={service.images[0]}
                                        alt={service.name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center">
                                        <Calendar className="h-6 w-6 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-grow">
                                    <h3 className="font-medium">
                                      {service.name}
                                    </h3>
                                    <div className="flex justify-between items-center mt-1">
                                      <span className="text-sm text-muted-foreground">
                                        {service.duration} min
                                      </span>
                                      <span className="font-medium">
                                        ${service.price.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                          {appointmentServices.length > 4 && (
                            <div className="mt-4 text-center">
                              <Button
                                variant="outline"
                                onClick={() =>
                                  router.push(
                                    `/business/${businessId}/services/public`
                                  )
                                }
                              >
                                View All Appointment Services
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {productServices.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Products
                          </CardTitle>
                          <CardDescription>
                            Shop products from {business.name}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {productServices
                              .slice(0, 4)
                              .map((service: Service) => (
                                <div
                                  key={service._id}
                                  className="flex items-center gap-3 p-3 border rounded-lg"
                                >
                                  <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                    {service.images &&
                                    service.images.length > 0 ? (
                                      <img
                                        src={service.images[0]}
                                        alt={service.name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center">
                                        <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-grow">
                                    <h3 className="font-medium">
                                      {service.name}
                                    </h3>
                                    <div className="flex justify-between items-center mt-1">
                                      <span className="text-sm text-muted-foreground">
                                        {service.inventory !== undefined
                                          ? service.inventory > 0
                                            ? `${service.inventory} in stock`
                                            : "Out of stock"
                                          : ""}
                                      </span>
                                      <span className="font-medium">
                                        ${service.price.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                          {productServices.length > 4 && (
                            <div className="mt-4 text-center">
                              <Button
                                variant="outline"
                                onClick={() =>
                                  router.push(
                                    `/business/${businessId}/services/public`
                                  )
                                }
                              >
                                View All Products
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {inPersonServices.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            In-Person Services
                          </CardTitle>
                          <CardDescription>
                            Services available at {business.name}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {inPersonServices
                              .slice(0, 4)
                              .map((service: Service) => (
                                <div
                                  key={service._id}
                                  className="flex items-center gap-3 p-3 border rounded-lg"
                                >
                                  <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                    {service.images &&
                                    service.images.length > 0 ? (
                                      <img
                                        src={service.images[0]}
                                        alt={service.name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center">
                                        <MapPin className="h-6 w-6 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-grow">
                                    <h3 className="font-medium">
                                      {service.name}
                                    </h3>
                                    <div className="flex justify-between items-center mt-1">
                                      <span className="text-sm text-muted-foreground">
                                        In-person
                                      </span>
                                      <span className="font-medium">
                                        ${service.price.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                          {inPersonServices.length > 4 && (
                            <div className="mt-4 text-center">
                              <Button
                                variant="outline"
                                onClick={() =>
                                  router.push(
                                    `/business/${businessId}/services/public`
                                  )
                                }
                              >
                                View All In-Person Services
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    <div className="text-center mt-4">
                      <Button
                        onClick={() =>
                          router.push(`/business/${businessId}/services/public`)
                        }
                      >
                        View All Services
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                {isReviewsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  </div>
                ) : reviews.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">
                        This business doesn't have any reviews yet.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Customer Reviews</CardTitle>
                        {business.rating && (
                          <CardDescription>
                            {business.rating.toFixed(1)} out of 5 stars (
                            {business.reviewCount || 0} reviews)
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {reviews.map((review: Review) => (
                          <div
                            key={review._id}
                            className="border-b pb-6 last:border-0 last:pb-0"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar>
                                {review.authorId.profilePicture ? (
                                  <AvatarImage
                                    src={review.authorId.profilePicture}
                                    alt={review.authorId.name}
                                  />
                                ) : null}
                                <AvatarFallback>
                                  {review.authorId.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {review.authorId.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {format(
                                    new Date(review.createdAt),
                                    "MMMM d, yyyy"
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-muted"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-sm">{review.comment}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <div className="text-center">
                      <Button
                        variant="outline"
                        onClick={() =>
                          router.push(`/business/${businessId}/reviews`)
                        }
                      >
                        View All Reviews
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
