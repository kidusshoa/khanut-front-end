"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { ServiceCard } from "@/components/business/ServiceCard";
import { serviceApi } from "@/services/service";
import { AddServiceModal } from "@/components/business/AddServiceModal";

export default function BusinessServicesPage({
  params: { businessId },
}: {
  params: { businessId: string };
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const data = await serviceApi.getBusinessServices(businessId);
        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [businessId]);

  const handleAddService = async (newService: any) => {
    try {
      setServices((prev) => [...prev, newService]);
    } catch (error) {
      console.error("Error adding service:", error);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await serviceApi.deleteService(serviceId);
      setServices((prev) => prev.filter((service) => service._id !== serviceId));
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const filteredServices = activeTab === "all" 
    ? services 
    : services.filter(service => service.serviceType === activeTab);

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Services</h1>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Services</TabsTrigger>
          <TabsTrigger value="appointment">Appointments</TabsTrigger>
          <TabsTrigger value="product">Products</TabsTrigger>
          <TabsTrigger value="in_person">In-Person Services</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  onDelete={() => handleDeleteService(service._id)}
                  onEdit={() => router.push(`/business/${businessId}/services/${service._id}/edit`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No services found
              </h3>
              <p className="text-gray-500 mb-6">
                {activeTab === "all"
                  ? "You haven't added any services yet."
                  : `You haven't added any ${activeTab} services yet.`}
              </p>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Service
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        businessId={businessId}
        onServiceAdded={handleAddService}
        initialServiceType={activeTab !== "all" ? activeTab as any : undefined}
      />
    </div>
  );
}
