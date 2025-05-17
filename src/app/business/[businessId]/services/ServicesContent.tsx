"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Calendar,
  ShoppingBag,
  MapPin,
  Loader2,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ServiceCard } from "@/components/business/ServiceCard";
import { ColumnDef } from "@tanstack/react-table";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { serviceApi } from "@/services/service";
import { AddServiceModal } from "@/components/business/AddServiceModal";
import { EditServiceModal } from "@/components/business/EditServiceModal";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import { getCorrectBusinessId } from "@/lib/business-utils";

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  serviceType: "appointment" | "product" | "in_person";
  images: string[];
  duration?: number;
  inventory?: number;
  createdAt: string;
  updatedAt: string;
}

interface ServicesContentProps {
  businessId: string;
}

export default function ServicesContent({ businessId }: ServicesContentProps) {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Fetch services with improved reliability
  const {
    data: services,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["services", businessId],
    queryFn: async () => {
      try {
        console.log("Fetching all services for business ID:", businessId);

        // First try to get all services using the direct API
        try {
          const url = `/api/services/business/${businessId}?limit=100`;

          console.log("Trying direct API call to endpoint:", url);
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(`Failed with status: ${response.status}`);
          }

          const data = await response.json();
          console.log("Direct API call succeeded:", data);
          return data;
        } catch (directApiError) {
          console.warn(
            "Direct API call failed, trying serviceApi:",
            directApiError
          );

          // Fallback to the serviceApi method
          const params = { limit: 100 };
          const data = await serviceApi.getBusinessServices(businessId, params);
          console.log("serviceApi.getBusinessServices succeeded:", data);
          return data;
        }
      } catch (error) {
        console.error("All service fetching methods failed:", error);
        throw error;
      }
    },
    enabled: !!businessId,
    retry: 3, // Retry up to 3 times if the request fails
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
  });

  // Log any errors for debugging
  useEffect(() => {
    if (isError) {
      console.error("Error fetching services:", error);
    }
  }, [isError, error]);

  const handleAddService = async () => {
    setSelectedService(null);
    setIsAddModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setIsEditModalOpen(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        await serviceApi.deleteService(serviceId);
        toast.success("Service deleted successfully");
        refetch();
      } catch (error) {
        console.error("Error deleting service:", error);
        toast.error("Failed to delete service");
      }
    }
  };

  const handleServiceAdded = () => {
    refetch();
  };

  const handleServiceUpdated = () => {
    refetch();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(price);
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-4 w-4 mr-1" />;
      case "product":
        return <ShoppingBag className="h-4 w-4 mr-1" />;
      case "in_person":
        return <MapPin className="h-4 w-4 mr-1" />;
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

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case "appointment":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "product":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "in_person":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  // State for search functionality
  const [searchTerm, setSearchTerm] = useState("");

  // Filter services based on search term
  const filteredServices =
    services && Array.isArray(services)
      ? services.filter(
          (service) =>
            searchTerm === "" ||
            service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  return (
    <DashboardLayout businessId={businessId}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Services</h1>
            <p className="text-muted-foreground">
              Manage your business services, products, and appointments.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="sm:self-start"
            >
              <Loader2 className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={handleAddService}
              className="bg-orange-600 hover:bg-orange-700 sm:self-start"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </div>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : isError ? (
            <div className="text-center py-12 bg-red-50 rounded-lg">
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Error loading services
              </h3>
              <p className="text-red-600 mb-6">
                There was a problem loading your services. Please try again.
              </p>
              <Button
                onClick={() => refetch()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Retry
              </Button>
            </div>
          ) : filteredServices && filteredServices.length > 0 ? (
            <div>
              <div className="mb-4">
                <Input
                  placeholder="Search services..."
                  className="max-w-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service._id}
                    service={service}
                    onDelete={() => handleDeleteService(service._id)}
                    onEdit={() => handleEditService(service)}
                    showActions={true}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-medium text-foreground mb-2">
                No services found
              </h3>
              <p className="text-muted-foreground mb-6">
                You haven't added any services yet.
              </p>
              <div className="flex justify-center">
                <Button
                  onClick={handleAddService}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Your First Service
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <AddServiceModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          businessId={businessId}
          onServiceAdded={handleServiceAdded}
          initialServiceType="appointment"
        />
      )}

      {isEditModalOpen && selectedService && (
        <EditServiceModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          service={selectedService}
          onServiceUpdated={handleServiceUpdated}
        />
      )}
    </DashboardLayout>
  );
}
