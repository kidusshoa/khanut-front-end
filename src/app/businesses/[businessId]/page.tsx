"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
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
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const businessId = params.businessId as string;
  const [activeTab, setActiveTab] = useState("all");
  const [showReviewForm, setShowReviewForm] = useState(false);

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

  // Fetch similar businesses if we have the business category
  const { data: similarBusinesses, isLoading: isSimilarLoading } = useQuery({
    queryKey: ["similarBusinesses", businessId, business?.category],
    queryFn: () =>
      business?.category
        ? businessDetailApi.getSimilarBusinesses(businessId, business.category)
        : Promise.resolve([]),
    enabled: !!business?.category,
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
      <div className="container mx-auto py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Loading business details...</h3>
        </div>
      </div>
    );
  }

  if (!business && !isBusinessLoading) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Business not found</h3>
          <p className="text-muted-foreground mb-6">
            The business you're looking for doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => router.push("/search")}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted-foreground mb-6">
        <Button
          variant="link"
          className="p-0 h-auto text-muted-foreground"
          onClick={() => router.push("/search")}
        >
          Search
        </Button>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-foreground">{business?.name}</span>
      </div>

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
            <h1 className="text-3xl font-bold">{business?.name}</h1>
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
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              ) : filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredServices.map((service) => (
                    <ServiceCard
                      key={service._id}
                      service={{
                        _id: service._id,
                        name: service.name,
                        description: service.description || "",
                        price: service.price,
                        serviceType: service.serviceType,
                        images: service.image ? [service.image] : [],
                        duration: service.duration,
                        customerId: service.customerId,
                        businessId: businessId,
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Reviews</CardTitle>
              {session && !showReviewForm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReviewForm(true)}
                  className="text-orange-600"
                >
                  <PenLine className="h-4 w-4 mr-1" />
                  Write a Review
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {showReviewForm && (
                <div className="mb-8 p-4 border rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Write a Review</h3>
                  <ReviewForm
                    businessId={businessId}
                    onReviewSubmitted={() => {
                      setShowReviewForm(false);
                      queryClient.invalidateQueries({
                        queryKey: ["businessReviews", businessId],
                      });
                    }}
                  />
                </div>
              )}

              {isReviewsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              ) : reviews && reviews.length > 0 ? (
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
                  {!showReviewForm && session && (
                    <Button
                      variant="outline"
                      onClick={() => setShowReviewForm(true)}
                      className="mt-4"
                    >
                      Be the first to review
                    </Button>
                  )}
                </div>
              )}
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
    </div>
  );
}
