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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { serviceApi } from "@/services/service";
import { AddServiceModal } from "@/components/business/AddServiceModal";
import { EditServiceModal } from "@/components/business/EditServiceModal";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
// Replaced date-fns with dayjs

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

export default function BusinessServicesPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const [businessId, setBusinessId] = useState<string>("");

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setBusinessId(resolvedParams.businessId);
      } catch (error) {
        console.error("Error resolving params:", error);
      }
    };

    resolveParams();
  }, [params]);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Fetch services
  const {
    data: services,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["services", businessId],
    queryFn: () => serviceApi.getBusinessServices(businessId),
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

  // Define table columns
  const columns: ColumnDef<Service>[] = [
    {
      accessorKey: "name",
      header: "Service",
      cell: ({ row }) => {
        const service = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
              {service.images && service.images.length > 0 ? (
                <img
                  src={service.images[0]}
                  alt={service.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-muted">
                  {getServiceTypeIcon(service.serviceType)}
                </div>
              )}
            </div>
            <div>
              <div className="font-medium">{service.name}</div>
              <div className="text-sm text-muted-foreground line-clamp-1">
                {service.description}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => formatPrice(row.original.price),
    },
    {
      accessorKey: "serviceType",
      header: "Type",
      cell: ({ row }) => (
        <Badge
          className={getServiceTypeColor(row.original.serviceType)}
          variant="outline"
        >
          <div className="flex items-center">
            {getServiceTypeIcon(row.original.serviceType)}
            {getServiceTypeLabel(row.original.serviceType)}
          </div>
        </Badge>
      ),
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }) => {
        const service = row.original;
        if (service.serviceType === "appointment" && service.duration) {
          return <div className="text-sm">{service.duration} minutes</div>;
        } else if (
          service.serviceType === "product" &&
          service.inventory !== undefined
        ) {
          return (
            <div className="text-sm">
              {service.inventory > 0
                ? `${service.inventory} in stock`
                : "Out of stock"}
            </div>
          );
        }
        return null;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) =>
        dayjs(new Date(row.original.createdAt)).format("MMM D, YYYY"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const service = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                router.push(`/business/${businessId}/services/${service._id}`)
              }
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditService(service)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => handleDeleteService(service._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Filter services based on active tab
  const filteredServices =
    services && Array.isArray(services)
      ? activeTab === "all"
        ? services
        : services.filter((service: any) => service.serviceType === activeTab)
      : [];

  // Log the filtered services for debugging
  useEffect(() => {
    console.log("Filtered services:", filteredServices);
  }, [filteredServices]);

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
          <Button
            onClick={handleAddService}
            className="bg-orange-600 hover:bg-orange-700 sm:self-start"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Services</TabsTrigger>
            <TabsTrigger
              value="appointment"
              className="flex items-center gap-1"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="product" className="flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="in_person" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">In-Person</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
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
              <DataTable
                columns={columns}
                data={filteredServices}
                searchColumn="name"
                searchPlaceholder="Search services..."
              />
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No services found
                </h3>
                <p className="text-muted-foreground mb-6">
                  {activeTab === "all"
                    ? "You haven't added any services yet."
                    : `You haven't added any ${getServiceTypeLabel(
                        activeTab
                      ).toLowerCase()} services yet.`}
                </p>
                <Button
                  onClick={handleAddService}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Your First Service
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {isAddModalOpen && (
        <AddServiceModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          businessId={businessId}
          onServiceAdded={handleServiceAdded}
          initialServiceType={
            activeTab !== "all" ? (activeTab as any) : undefined
          }
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
