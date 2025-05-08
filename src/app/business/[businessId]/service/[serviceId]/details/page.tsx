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
  ArrowLeft,
  Info,
  DollarSign,
  Package,
  Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import dayjs from "dayjs";
// Replaced date-fns with dayjs

// Fetch service details
const fetchServiceDetails = async (serviceId: string) => {
  try {
    console.log("Fetching service details for ID:", serviceId);

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/services/${serviceId}`;
    console.log("Service URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        "Service endpoint failed:",
        response.status,
        response.statusText
      );
      throw new Error(
        `Failed to fetch service details: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Service data received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching service details:", error);
    throw error;
  }
};

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

// Fetch service reviews
const fetchServiceReviews = async (serviceId: string) => {
  try {
    console.log("Fetching reviews for service ID:", serviceId);

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/service/${serviceId}`;
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
      return []; // Return empty array instead of throwing
    }

    const data = await response.json();
    console.log("Reviews data received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching service reviews:", error);
    return []; // Return empty array on error
  }
};

// Interfaces
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
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface Business {
  _id: string;
  name: string;
  description: string;
  category: string;
  city: string;
  email: string;
  phone: string;
  profilePicture?: string;
}

interface Review {
  _id: string;
  serviceId: string;
  authorId: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ServiceDetailsPage({
  params,
}: {
  params: { businessId: string; serviceId: string };
}) {
  const businessId = params.businessId;
  const serviceId = params.serviceId;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("details");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch service details
  const {
    data: service,
    isLoading: isServiceLoading,
    error: serviceError,
  } = useQuery({
    queryKey: ["serviceDetails", serviceId],
    queryFn: () => fetchServiceDetails(serviceId),
    retry: 1,
  });

  // Fetch business details
  const { data: business, isLoading: isBusinessLoading } = useQuery({
    queryKey: ["businessDetails", businessId],
    queryFn: () => fetchBusinessDetails(businessId),
    retry: 1,
    enabled: !!service,
  });

  // Fetch service reviews
  const { data: reviews = [], isLoading: isReviewsLoading } = useQuery({
    queryKey: ["serviceReviews", serviceId],
    queryFn: () => fetchServiceReviews(serviceId),
    retry: 1,
    enabled: !!service,
  });

  // Loading state
  if (isServiceLoading || isBusinessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-muted-foreground">Loading service details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (serviceError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-500">
            Error Loading Service
          </h2>
          <p className="text-muted-foreground">
            {serviceError instanceof Error
              ? serviceError.message
              : "Failed to load service details"}
          </p>
          <Button
            onClick={() =>
              router.push(`/business/${businessId}/services/public`)
            }
            className="mt-4"
          >
            Back to Services
          </Button>
        </div>
      </div>
    );
  }

  // If we have no service data but no error occurred, show a not found message
  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 max-w-md text-center">
          <h2 className="text-xl font-semibold">Service Not Found</h2>
          <p className="text-muted-foreground">
            The service you're looking for could not be found or may have been
            removed.
          </p>
          <Button
            onClick={() =>
              router.push(`/business/${businessId}/services/public`)
            }
            className="mt-4"
          >
            Back to Services
          </Button>
        </div>
      </div>
    );
  }

  // Get service type icon
  const getServiceTypeIcon = () => {
    switch (service.serviceType) {
      case "appointment":
        return <Calendar className="h-5 w-5" />;
      case "product":
        return <ShoppingCart className="h-5 w-5" />;
      case "in_person":
        return <MapPin className="h-5 w-5" />;
      default:
        return null;
    }
  };

  // Get service type label
  const getServiceTypeLabel = () => {
    switch (service.serviceType) {
      case "appointment":
        return "Appointment";
      case "product":
        return "Product";
      case "in_person":
        return "In-Person Service";
      default:
        return service.serviceType;
    }
  };

  // Handle image navigation
  const handleNextImage = () => {
    if (service.images && service.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === service.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handlePrevImage = () => {
    if (service.images && service.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? service.images.length - 1 : prevIndex - 1
      );
    }
  };

  // Action button based on service type
  const renderActionButton = () => {
    switch (service.serviceType) {
      case "appointment":
        return (
          <Button
            className="w-full"
            onClick={() =>
              router.push(`/business/${businessId}/service/${serviceId}/book`)
            }
          >
            <Calendar className="mr-2 h-4 w-4" />
            Book Appointment
          </Button>
        );
      case "product":
        return (
          <Button
            className="w-full"
            disabled={service.inventory === 0}
            onClick={() =>
              router.push(
                `/business/${businessId}/service/${serviceId}/purchase`
              )
            }
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {service.inventory === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        );
      case "in_person":
        return (
          <Button
            className="w-full"
            variant="outline"
            onClick={() => router.push(`/business/${businessId}/contact`)}
          >
            <Phone className="mr-2 h-4 w-4" />
            Contact Business
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Header with back button */}
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-fit"
            onClick={() =>
              router.push(`/business/${businessId}/services/public`)
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Services
          </Button>
        </div>

        {/* Service Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="md:col-span-2">
            <Card className="overflow-hidden">
              {/* Image Gallery */}
              <div className="relative h-[300px] md:h-[400px] w-full bg-muted">
                {service.images && service.images.length > 0 ? (
                  <>
                    <img
                      src={service.images[currentImageIndex]}
                      alt={service.name}
                      className="object-cover w-full h-full"
                    />
                    {service.images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full"
                          onClick={handlePrevImage}
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full"
                          onClick={handleNextImage}
                        >
                          <ArrowLeft className="h-4 w-4 transform rotate-180" />
                        </Button>
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                          {service.images.map((_, index) => (
                            <div
                              key={index}
                              className={`h-2 w-2 rounded-full ${
                                index === currentImageIndex
                                  ? "bg-white"
                                  : "bg-white/50"
                              }`}
                              onClick={() => setCurrentImageIndex(index)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      {getServiceTypeIcon()}
                      <p>No image available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Service Info */}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{service.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {business?.name || "Business Name"}
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
                    className="flex items-center gap-1"
                  >
                    {getServiceTypeIcon()}
                    {getServiceTypeLabel()}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Tabs
                  defaultValue="details"
                  value={activeTab}
                  onValueChange={setActiveTab}
                >
                  <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="reviews">
                      Reviews{" "}
                      {service.reviewCount ? `(${service.reviewCount})` : ""}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="mt-4 space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Description</h3>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {service.description || "No description available."}
                      </p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="font-medium">
                            ${service.price.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {service.serviceType === "appointment" &&
                        service.duration && (
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <Clock3 className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Duration
                              </p>
                              <p className="font-medium">
                                {service.duration} minutes
                              </p>
                            </div>
                          </div>
                        )}

                      {service.serviceType === "product" &&
                        service.inventory !== undefined && (
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Availability
                              </p>
                              <p className="font-medium">
                                {service.inventory > 0
                                  ? `${service.inventory} in stock`
                                  : "Out of stock"}
                              </p>
                            </div>
                          </div>
                        )}

                      {service.serviceType === "appointment" &&
                        service.availability && (
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Available Days
                              </p>
                              <p className="font-medium">
                                {service.availability.days.join(", ")}
                              </p>
                            </div>
                          </div>
                        )}

                      {service.serviceType === "appointment" &&
                        service.availability && (
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <Clock className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Hours
                              </p>
                              <p className="font-medium">
                                {service.availability.startTime} -{" "}
                                {service.availability.endTime}
                              </p>
                            </div>
                          </div>
                        )}
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="mt-4">
                    {isReviewsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-8 bg-muted/30 rounded-lg">
                        <p className="text-muted-foreground">
                          No reviews yet for this service.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
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
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Business Info & Actions */}
          <div className="space-y-6">
            {/* Business Card */}
            <Card>
              <CardHeader>
                <CardTitle>Provided by</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    {business?.profilePicture ? (
                      <AvatarImage
                        src={business.profilePicture}
                        alt={business?.name}
                      />
                    ) : null}
                    <AvatarFallback>{business?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{business?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {business?.category}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{business?.city}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{business?.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{business?.email}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/business/${businessId}/profile`)}
                >
                  View Business Profile
                </Button>
              </CardContent>
            </Card>

            {/* Action Card */}
            <Card>
              <CardHeader>
                <CardTitle>${service.price.toFixed(2)}</CardTitle>
                <CardDescription>
                  {service.serviceType === "appointment"
                    ? `${service.duration} minutes appointment`
                    : service.serviceType === "product"
                    ? service.inventory !== undefined && service.inventory > 0
                      ? `${service.inventory} available in stock`
                      : "Currently out of stock"
                    : "In-person service"}
                </CardDescription>
              </CardHeader>
              <CardFooter>{renderActionButton()}</CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
