"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { LucideIcon } from "lucide-react";
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Calendar,
  ShoppingBag,
  Clock,
  ChevronRight,
  Building,
  User,
  ArrowLeft,
  Tag,
  Store,
  Utensils,
  Briefcase,
  ShoppingCart,
  Scissors,
  Home,
  Car,
  Laptop,
  Book,
  Heart,
  Shirt,
  Coffee,
  RefreshCw,
} from "lucide-react";
import { LoadingState } from "@/components/ui/loading-state";
import { BusinessDetailSkeleton } from "@/components/business/BusinessDetailSkeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { businessDetailApi } from "@/services/businessDetail";
import { ServiceCard } from "@/components/business/ServiceCard";
import { BusinessMap } from "@/components/business/BusinessMap";
import { ReviewForm } from "@/components/customer/ReviewForm";
import { SimilarBusinesses } from "@/components/business/SimilarBusinesses";
import { FallbackImage } from "@/components/ui/fallback-image";
import { FavoriteButton } from "@/components/business/FavoriteButton";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { toastService } from "@/services/toast";
import { analyticsService } from "@/services/analytics";

// Helper function to get an icon based on business category
const getCategoryIcon = (category: string) => {
  const categoryMap: Record<string, LucideIcon> = {
    Restaurant: Utensils,
    Cafe: Coffee,
    Retail: Store,
    Electronics: Laptop,
    Clothing: Shirt,
    Books: Book,
    Automotive: Car,
    Health: Heart,
    Beauty: Scissors,
    Home: Home,
    Professional: Briefcase,
    Shopping: ShoppingCart,
  };

  // Default icon if category doesn't match
  const Icon = categoryMap[category] || Tag;
  return <Icon className="h-3.5 w-3.5" />;
};

export default function CustomerBusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { isAuthenticated, customerId: authCustomerId } = useAuthStatus();
  const queryClient = useQueryClient();
  const customerId = params.customerId as string;
  const businessId = params.businessId as string;
  const [activeTab, setActiveTab] = useState("all");
  // Review form is now always shown at the bottom of the page

  // Track business view and debug auth state
  useEffect(() => {
    console.log("Customer ID from URL:", customerId);
    console.log("Auth Customer ID:", authCustomerId);
    console.log("Session:", session);
    console.log("Is Authenticated:", isAuthenticated);

    // Track business view for analytics
    analyticsService.trackBusinessView(businessId, customerId);
  }, [customerId, authCustomerId, session, isAuthenticated, businessId]);

  // Get search context from URL parameters
  const searchQuery = searchParams.get("q") || "";
  const fromSearch = searchParams.get("fromSearch") === "true";

  // Fetch business details
  const {
    data: business,
    isLoading: isBusinessLoading,
    error: businessError,
  } = useQuery({
    queryKey: ["businessDetail", businessId],
    queryFn: () => businessDetailApi.getBusinessById(businessId),
  });

  // Fetch business services
  const {
    data: services,
    isLoading: isServicesLoading,
    error: servicesError,
  } = useQuery({
    queryKey: ["businessServices", businessId],
    queryFn: () => businessDetailApi.getBusinessServices(businessId),
  });

  // Fetch business reviews
  const {
    data: reviews,
    isLoading: isReviewsLoading,
    error: reviewsError,
  } = useQuery({
    queryKey: ["businessReviews", businessId],
    queryFn: () => businessDetailApi.getBusinessReviews(businessId),
  });

  // Handle errors
  useEffect(() => {
    if (businessError) {
      toastService.error("Failed to load business details");
      console.error(businessError);
    }
    if (servicesError) {
      toastService.error("Failed to load business services");
      console.error(servicesError);
    }
    if (reviewsError) {
      toastService.error("Failed to load business reviews");
      console.error(reviewsError);
    }
  }, [businessError, servicesError, reviewsError]);

  // Update document title when business data is loaded
  useEffect(() => {
    if (business?.name) {
      document.title = `${business.name} | Khanut`;
    }
    return () => {
      document.title = "Business Profile | Khanut";
    };
  }, [business?.name]);

  // Function to refresh all data
  const refreshData = () => {
    const refreshToast = toastService.loading("Refreshing business data...");

    // Invalidate all queries related to this business
    queryClient.invalidateQueries({ queryKey: ["businessDetail", businessId] });
    queryClient.invalidateQueries({
      queryKey: ["businessServices", businessId],
    });
    queryClient.invalidateQueries({
      queryKey: ["businessReviews", businessId],
    });

    // Dismiss the loading toast after a short delay
    setTimeout(() => {
      toast.dismiss(refreshToast);
      toastService.success("Business data refreshed");
    }, 1000);
  };

  // Filter services based on active tab
  const filteredServices =
    services?.filter((service: any) => {
      if (activeTab === "all") return true;
      return service.serviceType === activeTab;
    }) || [];

  // Calculate average rating
  const averageRating = reviews?.length
    ? reviews.reduce((acc: any, review: any) => acc + review.rating, 0) /
      reviews.length
    : 0;

  // Format address
  const formatAddress = (business: any) => {
    if (!business) return "Location not specified";

    const parts = [
      business.address?.street,
      business.city,
      business.address?.state,
      business.address?.country,
    ].filter(Boolean);

    return parts.join(", ");
  };

  if (isBusinessLoading) {
    return (
      <CustomerDashboardLayout customerId={customerId}>
        <BusinessDetailSkeleton />
      </CustomerDashboardLayout>
    );
  }

  if (!business && !isBusinessLoading) {
    return (
      <CustomerDashboardLayout customerId={customerId}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Business not found</h3>
            <p className="text-muted-foreground mb-6">
              The business you're looking for doesn't exist or has been removed.
            </p>
            <Button
              onClick={() => router.push(`/customer/${customerId}/search`)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Back to Search
            </Button>
          </div>
        </div>
      </CustomerDashboardLayout>
    );
  }

  return (
    <CustomerDashboardLayout customerId={customerId}>
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted-foreground mb-6">
        <Button
          variant="link"
          className="p-0 h-auto text-muted-foreground"
          onClick={() => router.push(`/customer/${customerId}`)}
        >
          Dashboard
        </Button>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Button
          variant="link"
          className="p-0 h-auto text-muted-foreground"
          onClick={() =>
            router.push(
              `/customer/${customerId}/search${
                searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""
              }`
            )
          }
        >
          Search{searchQuery ? `: ${searchQuery}` : ""}
        </Button>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-foreground">{business?.name}</span>
      </div>

      <div className="flex gap-2 mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {fromSearch && (
          <Button
            variant="secondary"
            onClick={() =>
              router.push(
                `/customer/${customerId}/search${
                  searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""
                }`
              )
            }
          >
            Back to Search Results
          </Button>
        )}

        <Button
          variant="outline"
          className="ml-auto"
          onClick={refreshData}
          disabled={isBusinessLoading || isServicesLoading || isReviewsLoading}
        >
          <RefreshCw
            className={cn(
              "h-4 w-4 mr-2",
              (isBusinessLoading || isServicesLoading || isReviewsLoading) &&
                "animate-spin"
            )}
          />
          Refresh
        </Button>
      </div>

      {/* Business Name Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 bg-orange-50 dark:bg-orange-950/20 p-6 rounded-lg border-2 border-orange-300 dark:border-orange-800/50 shadow-md">
        <div>
          <h1 className="text-4xl font-bold text-orange-600">
            {business?.name || "Business Details"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {business?.category || "Business"} in{" "}
            {business?.city || "Local Area"}
          </p>
        </div>

        {reviews && (
          <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
            <div className="flex mr-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-5 w-5",
                    star <= Math.round(averageRating)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="font-medium">{averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground ml-1">
              ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}
      </div>

      {/* Business Header */}
      <div className="mb-8">
        <div className="relative rounded-lg overflow-hidden h-80 mb-6 shadow-md">
          <div className="w-full h-full">
            <FallbackImage
              src={business?.coverImage}
              alt={business?.name || "Business cover image"}
              className="w-full h-full object-cover"
              fallbackType="business"
              fallbackClassName="h-16 w-16"
              fill
            />
          </div>

          {business?.logo && (
            <div className="absolute bottom-4 left-4 h-24 w-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
              <FallbackImage
                src={business.logo}
                alt={`${business.name} logo`}
                className="object-cover w-full h-full"
                fallbackType="business"
                fallbackClassName="h-8 w-8"
                width={96}
                height={96}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">
              About {business?.name || "This Business"}
            </h2>

            {business?.category && (
              <div className="mt-2 mb-2">
                <Badge
                  variant="outline"
                  className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 flex items-center gap-1 px-3 py-1.5 text-sm font-medium shadow-sm"
                >
                  {getCategoryIcon(business.category)}
                  {business.category}
                </Badge>
              </div>
            )}

            <div className="flex items-center mt-2 text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{formatAddress(business)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {business?.serviceTypes?.map((type: any) => (
                <Badge
                  key={type}
                  variant="outline"
                  className={cn(
                    type === "appointment" &&
                      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
                    type === "product" &&
                      "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
                    type === "in_person" &&
                      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  )}
                >
                  <div className="flex items-center">
                    {type === "appointment" && (
                      <Calendar className="h-4 w-4 mr-1" />
                    )}
                    {type === "product" && (
                      <ShoppingBag className="h-4 w-4 mr-1" />
                    )}
                    {type === "in_person" && (
                      <MapPin className="h-4 w-4 mr-1" />
                    )}
                    {type === "appointment" && "Appointments"}
                    {type === "product" && "Products"}
                    {type === "in_person" && "In-Person"}
                  </div>
                </Badge>
              ))}
            </div>

            <FavoriteButton
              businessId={businessId}
              showText={true}
              variant="outline"
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* About Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {business?.category && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-muted-foreground">
                      Category:
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 flex items-center gap-1 px-2 py-1"
                    >
                      {getCategoryIcon(business.category)}
                      {business.category}
                    </Badge>
                  </div>
                )}

                {business?.description ? (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {business.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    No description available.
                  </p>
                )}

                {business?.businessHours && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Business Hours</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(business.businessHours).map(
                        ([day, hours]) => (
                          <div
                            key={day}
                            className="flex justify-between border-b border-gray-100 dark:border-gray-800 py-1 last:border-0"
                          >
                            <span className="font-medium capitalize">
                              {day}
                            </span>
                            <span className="text-muted-foreground">
                              {typeof hours === "string" ? hours : "Closed"}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Services Section */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Services</CardTitle>
                <Tabs defaultValue="all" onValueChange={setActiveTab}>
                  <TabsList className="h-9">
                    <TabsTrigger
                      value="all"
                      className="text-xs sm:text-sm px-3"
                    >
                      All
                    </TabsTrigger>
                    <TabsTrigger
                      value="appointment"
                      className="text-xs sm:text-sm px-3"
                    >
                      <Calendar className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
                      Appointments
                    </TabsTrigger>
                    <TabsTrigger
                      value="product"
                      className="text-xs sm:text-sm px-3"
                    >
                      <ShoppingBag className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
                      Products
                    </TabsTrigger>
                    <TabsTrigger
                      value="in_person"
                      className="text-xs sm:text-sm px-3"
                    >
                      <MapPin className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
                      In-Person
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {isServicesLoading ? (
                <div className="py-12">
                  <LoadingState size="md" message="Loading services..." />
                </div>
              ) : filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredServices.map((service: any) => (
                    <ServiceCard
                      key={service._id}
                      service={{
                        ...service,
                        customerId: customerId, // Pass customer ID to the service card
                      }}
                      onDelete={() => {}}
                      onEdit={() => {}}
                      showActions={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    {activeTab === "appointment" ? (
                      <Calendar className="h-6 w-6 text-muted-foreground" />
                    ) : activeTab === "product" ? (
                      <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                    ) : activeTab === "in_person" ? (
                      <MapPin className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <Clock className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-muted-foreground font-medium">
                    No {activeTab === "all" ? "services" : activeTab} available.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This business hasn't added any{" "}
                    {activeTab === "all" ? "services" : activeTab} yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle>Reviews</CardTitle>
              {reviews && reviews.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-4 w-4",
                          star <= Math.round(averageRating)
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-medium">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    based on {reviews?.length || 0}{" "}
                    {reviews?.length === 1 ? "review" : "reviews"}
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isReviewsLoading ? (
                <div className="py-12">
                  <LoadingState size="md" message="Loading reviews..." />
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review: any) => (
                    <div
                      key={review._id}
                      className="p-4 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3 border border-gray-200 dark:border-gray-700">
                            {review.authorId?.profilePicture ? (
                              <img
                                src={review.authorId.profilePicture}
                                alt={review.authorId.name}
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {review.authorId?.name || "Anonymous"}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "h-4 w-4",
                                star <= review.rating
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <Star className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">
                    No reviews yet
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 mb-4">
                    Be the first to share your experience with this business!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Form Section */}
          <Card className="mt-8 border-2 border-dashed border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Write a Review</CardTitle>
              <p className="text-sm text-muted-foreground">
                Share your experience with this business
              </p>
            </CardHeader>
            <CardContent>
              <ReviewForm
                businessId={businessId}
                onReviewSubmitted={() => {
                  queryClient.invalidateQueries({
                    queryKey: ["businessReviews", businessId],
                  });
                  toast.success("Your review has been submitted!");
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          {/* Contact Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {business?.phone && (
                <div className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                    <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Phone</div>
                    <div className="font-medium">{business.phone}</div>
                  </div>
                </div>
              )}
              {business?.email && (
                <div className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors">
                  <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                    <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-medium">{business.email}</div>
                  </div>
                </div>
              )}
              <div className="flex items-start p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors">
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                  <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Address</div>
                  <div className="font-medium">{formatAddress(business)}</div>
                </div>
              </div>

              {/* Map */}
              {business?.location?.coordinates &&
                business.location.coordinates.length === 2 && (
                  <div className="mt-4">
                    <BusinessMap
                      latitude={business.location.coordinates[1]}
                      longitude={business.location.coordinates[0]}
                      businessName={business.name}
                    />
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Similar Businesses */}
          <Card>
            <CardHeader>
              <CardTitle>Similar Businesses</CardTitle>
            </CardHeader>
            <CardContent>
              {business?.category ? (
                <SimilarBusinesses
                  businessId={businessId}
                  category={business.category}
                  customerId={customerId}
                />
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No similar businesses found
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerDashboardLayout>
  );
}
