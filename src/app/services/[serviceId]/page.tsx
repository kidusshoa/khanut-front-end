"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ShoppingBag,
  MapPin,
  Clock,
  Tag,
  Loader2,
  ChevronRight,
  Building,
  ArrowLeft,
} from "lucide-react";
import { serviceApi } from "@/services/service";
import { BookAppointmentModal } from "@/components/customer/BookAppointmentModal";
import { AddToCartModal } from "@/components/customer/AddToCartModal";
import { ReviewList } from "@/components/reviews/ReviewList";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { businessDetailApi } from "@/services/businessDetail";
import { toast } from "react-hot-toast";

export default function ServiceDetailPage({
  params: { serviceId },
}: {
  params: { serviceId: string };
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [service, setService] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setIsLoading(true);
        const serviceData = await serviceApi.getServiceById(serviceId);
        setService(serviceData);

        // Fetch business details
        if (serviceData.businessId) {
          try {
            const businessData = await businessDetailApi.getBusinessById(
              serviceData.businessId
            );
            setBusiness(businessData);
          } catch (businessError) {
            console.error("Error fetching business details:", businessError);
          }
        }
      } catch (error) {
        console.error("Error fetching service details:", error);
        toast.error("Failed to load service details");
      } finally {
        setIsLoading(false);
      }
    };

    if (serviceId) {
      fetchServiceDetails();
    }
  }, [serviceId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(price);
  };

  const handleActionClick = () => {
    if (!session) {
      toast.error("Please log in to continue");
      router.push("/login");
      return;
    }

    if (service.serviceType === "appointment") {
      setIsBookModalOpen(true);
    } else if (service.serviceType === "product") {
      setIsCartModalOpen(true);
    } else if (service.serviceType === "in_person") {
      // For in-person services, just show the business location
      router.push(`/businesses/${service.businessId}`);
    }
  };

  const getActionButtonText = () => {
    switch (service?.serviceType) {
      case "appointment":
        return "Book Appointment";
      case "product":
        return "Add to Cart";
      case "in_person":
        return "View Business Location";
      default:
        return "View Details";
    }
  };

  const getActionButtonIcon = () => {
    switch (service?.serviceType) {
      case "appointment":
        return <Calendar className="mr-2 h-4 w-4" />;
      case "product":
        return <ShoppingBag className="mr-2 h-4 w-4" />;
      case "in_person":
        return <MapPin className="mr-2 h-4 w-4" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Loading service details...</h3>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Service not found</h3>
          <p className="text-muted-foreground mb-6">
            The service you're looking for doesn't exist or has been removed.
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
        {business && (
          <>
            <Button
              variant="link"
              className="p-0 h-auto text-muted-foreground"
              onClick={() => router.push(`/businesses/${business._id}`)}
            >
              {business.name}
            </Button>
            <ChevronRight className="h-4 w-4 mx-1" />
          </>
        )}
        <span className="text-foreground">{service.name}</span>
      </div>

      <Button variant="outline" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Service Image */}
        <div className="relative h-80 md:h-full rounded-lg overflow-hidden">
          {service.images && service.images.length > 0 ? (
            <Image
              src={service.images[0]}
              alt={service.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>

        {/* Service Details */}
        <div>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {service.name}
              </h1>
              <Badge className="bg-orange-600">
                {service.serviceType === "appointment" && "Appointment"}
                {service.serviceType === "product" && "Product"}
                {service.serviceType === "in_person" && "In-Person"}
              </Badge>
            </div>
            <p className="text-2xl font-semibold text-orange-600 mb-4">
              {formatPrice(service.price)}
            </p>
            <p className="text-gray-700 mb-6">{service.description}</p>

            {/* Service-specific details */}
            {service.serviceType === "appointment" && (
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>Duration: {service.duration} minutes</span>
                </div>
                {service.availability && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>
                      Available:{" "}
                      {service.availability.days
                        .map((day: string) => day.slice(0, 3))
                        .join(", ")}
                      ({service.availability.startTime} -{" "}
                      {service.availability.endTime})
                    </span>
                  </div>
                )}
              </div>
            )}

            {service.serviceType === "product" && (
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-gray-600">
                  <Tag className="h-5 w-5 mr-2" />
                  <span>SKU: {service.productDetails?.sku || "N/A"}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  <span>
                    {service.inventory > 0
                      ? `In Stock: ${service.inventory} units`
                      : "Out of Stock"}
                  </span>
                </div>
              </div>
            )}

            {/* Business info */}
            {business && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                      {business.logo ? (
                        <img
                          src={business.logo}
                          alt={business.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Building className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{business.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {business.city || "Location not specified"}
                      </p>
                      <Link href={`/businesses/${business._id}`}>
                        <Button variant="outline" className="mt-2">
                          View Business
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Button */}
            <Button
              onClick={handleActionClick}
              className="w-full py-6 text-lg bg-orange-600 hover:bg-orange-700"
              disabled={
                service.serviceType === "product" && service.inventory <= 0
              }
            >
              {getActionButtonIcon()}
              {getActionButtonText()}
            </Button>

            {service.serviceType === "product" && service.inventory <= 0 && (
              <p className="text-red-500 text-sm mt-2 text-center">
                This product is currently out of stock
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <Separator className="my-8" />
      <ReviewList serviceId={serviceId} businessId={service.businessId} />

      {/* Modals */}
      {service.serviceType === "appointment" && (
        <BookAppointmentModal
          isOpen={isBookModalOpen}
          onClose={() => setIsBookModalOpen(false)}
          service={service}
          businessId={service.businessId}
        />
      )}

      {service.serviceType === "product" && (
        <AddToCartModal
          isOpen={isCartModalOpen}
          onClose={() => setIsCartModalOpen(false)}
          service={service}
          businessId={service.businessId}
        />
      )}
    </div>
  );
}
