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

  // Fetch services with improved reliability - similar to ProductsContent approach
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  // Function to fetch services
  const fetchServices = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      let fetchedServices: Service[] = [];

      // Get the correct business ID using our utility function
      const correctBusinessId = await getCorrectBusinessId(businessId);
      console.log("Using business ID for services:", correctBusinessId);

      try {
        // First try to fetch non-product services using the getServicesByType API for appointment type
        console.log("Trying getServicesByType API for appointment services");
        const appointmentServices = await serviceApi.getServicesByType(
          correctBusinessId,
          "appointment",
          { limit: 100 }
        );

        if (Array.isArray(appointmentServices)) {
          fetchedServices = [...appointmentServices];
          console.log(
            `Found ${appointmentServices.length} appointment services`
          );
        }

        // Then try to fetch in-person services
        console.log("Trying getServicesByType API for in-person services");
        const inPersonServices = await serviceApi.getServicesByType(
          correctBusinessId,
          "in_person",
          { limit: 100 }
        );

        if (Array.isArray(inPersonServices)) {
          fetchedServices = [...fetchedServices, ...inPersonServices];
          console.log(`Found ${inPersonServices.length} in-person services`);
        }

        console.log(`Total services found: ${fetchedServices.length}`);
      } catch (typeError) {
        console.warn("Error fetching services by type:", typeError);
        console.log("Falling back to getBusinessServices API...");

        // Fallback to getBusinessServices API and filter out products
        try {
          const allServices = await serviceApi.getBusinessServices(
            correctBusinessId,
            { limit: 100 }
          );

          // Filter out products
          if (Array.isArray(allServices)) {
            fetchedServices = allServices.filter(
              (service: any) => service.serviceType !== "product"
            );
            console.log(
              `Found ${fetchedServices.length} non-product services via getBusinessServices`
            );
          } else {
            console.log("getBusinessServices did not return an array");
          }
        } catch (fallbackError) {
          console.warn("Error fetching business services:", fallbackError);
          // Continue to next fallback
        }
      }

      // Try direct API call as a last resort if no services were found
      if (fetchedServices.length === 0) {
        try {
          console.log("Trying direct API call as last resort");
          const response = await fetch(
            `/api/services/business/${correctBusinessId}?limit=100`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Failed with status: ${response.status}`);
          }

          const data = await response.json();

          if (Array.isArray(data)) {
            fetchedServices = data.filter(
              (service: any) => service.serviceType !== "product"
            );
            console.log(
              `Found ${fetchedServices.length} non-product services via direct API call`
            );
          }
        } catch (directError) {
          console.warn("Error with direct API call:", directError);
          // Continue with empty services array
        }
      }

      setServices(fetchedServices);

      // If no services were found but there was no error, set a friendly message
      if (fetchedServices.length === 0) {
        console.log("No services found for this business");
      }
    } catch (err: any) {
      console.error("Error fetching services:", err);
      setIsError(true);
      setError(err.message || "Failed to load services");
      toast.error("Failed to load services. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch services on component mount
  useEffect(() => {
    if (businessId) {
      fetchServices();
    }
  }, [businessId]);

  // Function to refetch services
  const refetch = () => {
    fetchServices();
  };

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
        setIsLoading(true);
        await serviceApi.deleteService(serviceId);

        // Update the local state to remove the deleted service
        setServices(services.filter((service) => service._id !== serviceId));

        toast.success("Service deleted successfully");
      } catch (error) {
        console.error("Error deleting service:", error);
        toast.error("Failed to delete service");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleServiceAdded = () => {
    fetchServices();
    toast.success("Service added successfully");
  };

  const handleServiceUpdated = () => {
    fetchServices();
    toast.success("Service updated successfully");
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

  // Filter services based on search term and exclude products
  const filteredServices = services.filter(
    (service) =>
      // Exclude products
      service.serviceType !== "product" &&
      // Apply search filter
      (searchTerm === "" ||
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              onClick={() => fetchServices()}
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
                onClick={() => fetchServices()}
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
