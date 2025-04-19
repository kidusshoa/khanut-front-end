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
  Loader2,
  Building,
  User,
  PenLine,
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
} from "lucide-react";
import { LoadingState } from "@/components/ui/loading-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { businessDetailApi } from "@/services/businessDetail";
import { ServiceCard } from "@/components/business/ServiceCard";
import { BusinessMap } from "@/components/business/BusinessMap";
import { ReviewForm } from "@/components/business/ReviewForm";
import { SimilarBusinesses } from "@/components/business/SimilarBusinesses";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

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

  // Debug auth state
  useEffect(() => {
    console.log("Customer ID from URL:", customerId);
    console.log("Auth Customer ID:", authCustomerId);
    console.log("Session:", session);
    console.log("Is Authenticated:", isAuthenticated);
  }, [customerId, authCustomerId, session, isAuthenticated]);

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
      toast.error("Failed to load business details");
      console.error(businessError);
    }
    if (servicesError) {
      toast.error("Failed to load business services");
      console.error(servicesError);
    }
    if (reviewsError) {
      toast.error("Failed to load business reviews");
      console.error(reviewsError);
    }
  }, [businessError, servicesError, reviewsError]);

  // Filter services based on active tab
  const filteredServices =
    services?.filter((service) => {
      if (activeTab === "all") return true;
      return service.serviceType === activeTab;
    }) || [];

  // Calculate average rating
  const averageRating = reviews?.length
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  // Format address
  const formatAddress = (business) => {
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
        <LoadingState
          message="Loading business details..."
          size="lg"
          className="min-h-[60vh]"
        />
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
      </div>

      {/* Business Name Header */}
      <h1 className="text-4xl font-bold mb-6 text-orange-600">
        {business?.name || "Business Details"}
      </h1>

      {/* Business Header */}
      <div className="mb-8">
        <div className="relative rounded-lg overflow-hidden h-64 mb-6">
          {business?.coverImage ? (
            <img
              src={business.coverImage}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <div className="text-6xl font-bold text-muted-foreground">
                {business?.name?.charAt(0)}
              </div>
            </div>
          )}

          {business?.logo && (
            <div className="absolute bottom-4 left-4 h-20 w-20 rounded-full border-4 border-white overflow-hidden bg-white">
              <img
                src={business.logo}
                alt={`${business.name} logo`}
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">
              {business?.name || "Business Details"}
            </h2>

            {business?.category && (
              <div className="mt-2 mb-2">
                <Badge
                  variant="outline"
                  className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 flex items-center gap-1 px-2 py-1"
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

            {reviews && (
              <div className="flex items-center mt-2">
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
                <span className="ml-2 text-sm">
                  {averageRating.toFixed(1)} ({reviews.length} reviews)
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {business?.serviceTypes?.map((type) => (
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
                  {type === "in_person" && <MapPin className="h-4 w-4 mr-1" />}
                  {type === "appointment" && "Appointments"}
                  {type === "product" && "Products"}
                  {type === "in_person" && "In-Person"}
                </div>
              </Badge>
            ))}
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
              {business?.category && (
                <div className="mb-3 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 flex items-center gap-1 px-2 py-1"
                  >
                    {getCategoryIcon(business.category)}
                    {business.category}
                  </Badge>
                </div>
              )}
              <p className="text-muted-foreground">
                {business?.description || "No description available."}
              </p>
            </CardContent>
          </Card>

          {/* Services Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Services</CardTitle>
              <Tabs defaultValue="all" onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="appointment">Appointments</TabsTrigger>
                  <TabsTrigger value="product">Products</TabsTrigger>
                  <TabsTrigger value="in_person">In-Person</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {isServicesLoading ? (
                <LoadingState size="md" message="Loading services..." />
              ) : filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredServices.map((service) => (
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
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No {activeTab === "all" ? "services" : activeTab} available.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {isReviewsLoading ? (
                <LoadingState size="md" message="Loading reviews..." />
              ) : reviews?.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="pb-6 border-b last:border-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3">
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
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex">
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
                      <p className="text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No reviews yet.</p>
                  <p className="text-sm text-muted-foreground mt-2 mb-4">
                    Be the first to share your experience!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Form Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Write a Review</CardTitle>
              <p className="text-sm text-muted-foreground">
                Share your experience with this business
              </p>
            </CardHeader>
            <CardContent>
              <ReviewForm
                businessId={businessId}
                forceLoggedIn={true} // Force logged in state since we're in a customer route
                onReviewSubmitted={() => {
                  queryClient.invalidateQueries({
                    queryKey: ["businessReviews", businessId],
                  });
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
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{business.phone}</span>
                </div>
              )}
              {business?.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{business.email}</span>
                </div>
              )}
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-1" />
                <span>{formatAddress(business)}</span>
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

          {/* Business Hours */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
            </CardHeader>
            <CardContent>
              {business?.businessHours ? (
                <div className="space-y-2">
                  {Object.entries(business.businessHours).map(
                    ([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="font-medium capitalize">{day}</span>
                        <span>{hours || "Closed"}</span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Business hours not available.
                </p>
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
