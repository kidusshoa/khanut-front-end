"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";
import { toast } from "react-hot-toast";

export default function CustomerServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const customerId = params.customerId as string;
  const serviceId = params.serviceId as string;

  const [service, setService] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

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

  const handleBookAppointment = () => {
    if (!session) {
      toast.error("Please log in to book appointments");
      router.push(`/customer/${customerId}/login`);
      return;
    }
    setShowBookModal(true);
  };

  const handleAddToCart = () => {
    if (!session) {
      toast.error("Please log in to add items to cart");
      router.push(`/customer/${customerId}/login`);
      return;
    }
    setShowCartModal(true);
  };

  if (isLoading) {
    return (
      <CustomerDashboardLayout customerId={customerId}>
        <div className="container mx-auto py-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Loading service details...</h3>
          </div>
        </div>
      </CustomerDashboardLayout>
    );
  }

  if (!service) {
    return (
      <CustomerDashboardLayout customerId={customerId}>
        <div className="container mx-auto py-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Service not found</h3>
            <p className="text-muted-foreground mb-6">
              The service you're looking for doesn't exist or has been removed.
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
          onClick={() => router.push(`/customer/${customerId}/search`)}
        >
          Search
        </Button>
        <ChevronRight className="h-4 w-4 mx-1" />
        {business && (
          <>
            <Button
              variant="link"
              className="p-0 h-auto text-muted-foreground"
              onClick={() =>
                router.push(
                  `/customer/${customerId}/businesses/${business._id}`
                )
              }
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
        <div>
          <div className="rounded-lg overflow-hidden h-80 mb-4">
            {service.images && service.images.length > 0 ? (
              <img
                src={service.images[0]}
                alt={service.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          {service.images && service.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {service.images
                .slice(0, 4)
                .map((image: string, index: number) => (
                  <div key={index} className="rounded-md overflow-hidden h-20">
                    <img
                      src={image}
                      alt={`${service.name} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Service Details */}
        <div>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold">{service.name}</h1>
              <Badge
                className={`
                  ${
                    service.serviceType === "appointment"
                      ? "bg-blue-100 text-blue-800"
                      : ""
                  }
                  ${
                    service.serviceType === "product"
                      ? "bg-orange-100 text-orange-800"
                      : ""
                  }
                  ${
                    service.serviceType === "in_person"
                      ? "bg-green-100 text-green-800"
                      : ""
                  }
                `}
              >
                <div className="flex items-center">
                  {service.serviceType === "appointment" && (
                    <Calendar className="h-4 w-4 mr-1" />
                  )}
                  {service.serviceType === "product" && (
                    <ShoppingBag className="h-4 w-4 mr-1" />
                  )}
                  {service.serviceType === "in_person" && (
                    <MapPin className="h-4 w-4 mr-1" />
                  )}
                  {service.serviceType === "appointment" && "Appointment"}
                  {service.serviceType === "product" && "Product"}
                  {service.serviceType === "in_person" && "In-Person"}
                </div>
              </Badge>
            </div>

            <p className="text-2xl font-semibold text-orange-600 mb-4">
              {formatPrice(service.price)}
            </p>

            <p className="text-gray-700 mb-6">{service.description}</p>

            <div className="space-y-4 mb-6">
              {service.serviceType === "appointment" && service.duration && (
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-2" />
                  <span>Duration: {service.duration} minutes</span>
                </div>
              )}

              {service.serviceType === "product" &&
                service.inventory !== undefined && (
                  <div className="flex items-center">
                    <ShoppingBag className="h-5 w-5 text-gray-500 mr-2" />
                    <span>
                      {service.inventory > 0
                        ? `In Stock: ${service.inventory} units`
                        : "Out of Stock"}
                    </span>
                  </div>
                )}

              {service.availability && (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <span>
                    Available: {service.availability.days.join(", ")}
                    {service.availability.startTime &&
                      service.availability.endTime &&
                      ` (${service.availability.startTime} - ${service.availability.endTime})`}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {service.serviceType === "appointment" && (
                <Button
                  className="bg-orange-600 hover:bg-orange-700 flex-1"
                  onClick={handleBookAppointment}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Appointment
                </Button>
              )}

              {service.serviceType === "product" && (
                <Button
                  className="bg-orange-600 hover:bg-orange-700 flex-1"
                  onClick={handleAddToCart}
                  disabled={
                    service.inventory !== undefined && service.inventory <= 0
                  }
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              )}

              {service.serviceType === "in_person" && (
                <Button
                  className="bg-orange-600 hover:bg-orange-700 flex-1"
                  onClick={() =>
                    router.push(
                      `/customer/${customerId}/businesses/${service.businessId}`
                    )
                  }
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Visit Business
                </Button>
              )}
            </div>

            {/* Business info */}
            {business && (
              <Card className="mt-8">
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
                      <Link
                        href={`/customer/${customerId}/businesses/${business._id}`}
                      >
                        <Button variant="outline" className="mt-2">
                          View Business
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showBookModal && (
        <BookAppointmentModal
          service={service}
          isOpen={showBookModal}
          onClose={() => setShowBookModal(false)}
          businessId={service?.businessId || ""}
        />
      )}

      {showCartModal && (
        <AddToCartModal
          service={service}
          isOpen={showCartModal}
          onClose={() => setShowCartModal(false)}
          businessId={service?.businessId || ""}
        />
      )}
    </CustomerDashboardLayout>
  );
}
