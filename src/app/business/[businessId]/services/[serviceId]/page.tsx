"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  ShoppingBag,
  MapPin,
  Loader2,
  AlertCircle,
  Clock,
  Package,
  DollarSign,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { serviceApi } from "@/services/service";
import { EditServiceModal } from "@/components/business/EditServiceModal";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";

export default function ServiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.businessId as string;
  const serviceId = params.serviceId as string;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch service details
  const {
    data: service,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["service", serviceId],
    queryFn: () => serviceApi.getServiceById(serviceId),
    enabled: !!serviceId,
  });

  const handleEditService = () => {
    setIsEditModalOpen(true);
  };

  const handleDeleteService = async () => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        await serviceApi.deleteService(serviceId);
        toast.success("Service deleted successfully");
        router.push(`/business/${businessId}/services`);
      } catch (error) {
        console.error("Error deleting service:", error);
        toast.error("Failed to delete service");
      }
    }
  };

  const handleServiceUpdated = () => {
    refetch();
    toast.success("Service updated successfully");
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "product":
        return <ShoppingBag className="h-5 w-5 text-orange-500" />;
      case "in_person":
        return <MapPin className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case "appointment":
        return "Appointment";
      case "product":
        return "Product";
      case "in_person":
        return "In-Person";
      default:
        return type;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(price);
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout businessId={businessId}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-muted-foreground">Loading service details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout businessId={businessId}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-2 max-w-md text-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h2 className="text-xl font-semibold text-red-500">
              Error Loading Service
            </h2>
            <p className="text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Failed to load service details"}
            </p>
            <Button
              onClick={() => router.push(`/business/${businessId}/services`)}
              className="mt-4"
            >
              Back to Services
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If service not found
  if (!service) {
    return (
      <DashboardLayout businessId={businessId}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-2 max-w-md text-center">
            <AlertCircle className="h-8 w-8 text-orange-500" />
            <h2 className="text-xl font-semibold">Service Not Found</h2>
            <p className="text-muted-foreground">
              The service you're looking for could not be found or may have been
              removed.
            </p>
            <Button
              onClick={() => router.push(`/business/${businessId}/services`)}
              className="mt-4"
            >
              Back to Services
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout businessId={businessId}>
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-fit"
            onClick={() => router.push(`/business/${businessId}/services`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Services
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {service.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 text-sm"
                >
                  {getServiceTypeIcon(service.serviceType)}
                  {getServiceTypeLabel(service.serviceType)}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {formatPrice(service.price)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleEditService}
                className="flex items-center gap-1"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteService}
                className="flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Service Image */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-square w-full overflow-hidden">
                  {service.images && service.images.length > 0 ? (
                    <img
                      src={service.images[0]}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      {getServiceTypeIcon(service.serviceType)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Description
                  </h3>
                  <p className="mt-1">{service.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Price
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span>{formatPrice(service.price)}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Created
                    </h3>
                    <p className="mt-1">
                      {dayjs(service.createdAt).format("MMMM D, YYYY")}
                    </p>
                  </div>

                  {service.serviceType === "appointment" && (
                    <>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Duration
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span>{service.duration} minutes</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Available Days
                        </h3>
                        <p className="mt-1">
                          {service.availability?.days
                            ?.map(
                              (day: string) =>
                                day.charAt(0).toUpperCase() + day.slice(1)
                            )
                            .join(", ") || "Not specified"}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Hours
                        </h3>
                        <p className="mt-1">
                          {service.availability?.startTime} -{" "}
                          {service.availability?.endTime}
                        </p>
                      </div>
                    </>
                  )}

                  {service.serviceType === "product" && (
                    <>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Inventory
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Package className="h-4 w-4 text-orange-500" />
                          <span>
                            {service.inventory !== undefined
                              ? `${service.inventory} in stock`
                              : "Not tracked"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          SKU
                        </h3>
                        <p className="mt-1">{service.sku || "Not specified"}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditServiceModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          service={service}
          onServiceUpdated={handleServiceUpdated}
        />
      )}
    </DashboardLayout>
  );
}
