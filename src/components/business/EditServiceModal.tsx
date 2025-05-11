"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar, ShoppingBag, MapPin } from "lucide-react";
import { 
  serviceSchema, 
  appointmentServiceSchema,
  productServiceSchema,
  inPersonServiceSchema
} from "@/lib/validations/service";
import { serviceApi } from "@/services/service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: any;
  onServiceUpdated: () => void;
}

export function EditServiceModal({
  isOpen,
  onClose,
  service,
  onServiceUpdated
}: EditServiceModalProps) {
  const [serviceType, setServiceType] = useState<"appointment" | "product" | "in_person">(
    service?.serviceType || "appointment"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(
    service?.availability?.days || []
  );
  const [imagePreview, setImagePreview] = useState<string | null>(
    service?.images?.[0] || null
  );

  // Appointment form
  const appointmentForm = useForm({
    resolver: zodResolver(appointmentServiceSchema),
    defaultValues: {
      name: service?.name || "",
      description: service?.description || "",
      price: service?.price || 0,
      businessId: service?.businessId || "",
      serviceType: "appointment" as const,
      duration: service?.duration || 30,
      availability: {
        days: service?.availability?.days || [],
        startTime: service?.availability?.startTime || "09:00",
        endTime: service?.availability?.endTime || "17:00",
      },
    },
  });

  // Product form
  const productForm = useForm({
    resolver: zodResolver(productServiceSchema),
    defaultValues: {
      name: service?.name || "",
      description: service?.description || "",
      price: service?.price || 0,
      businessId: service?.businessId || "",
      serviceType: "product" as const,
      inventory: service?.inventory || 0,
      sku: service?.sku || "",
      shippingInfo: {
        freeShipping: service?.shippingInfo?.freeShipping || false,
        shippingCost: service?.shippingInfo?.shippingCost || 0,
      },
    },
  });

  // In-person form
  const inPersonForm = useForm({
    resolver: zodResolver(inPersonServiceSchema),
    defaultValues: {
      name: service?.name || "",
      description: service?.description || "",
      price: service?.price || 0,
      businessId: service?.businessId || "",
      serviceType: "in_person" as const,
    },
  });

  useEffect(() => {
    // Set the selected days from the service
    if (service?.availability?.days) {
      setSelectedDays(service.availability.days);
    }
  }, [service]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDayChange = (day: string) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const handleAppointmentSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Update days from selected days state
      data.availability.days = selectedDays;
      
      const formData = new FormData();
      
      // Add all fields to form data
      Object.entries(data).forEach(([key, value]) => {
        if (key === "availability") {
          formData.append(key, JSON.stringify(value));
        } else if (key !== "images") {
          formData.append(key, String(value));
        }
      });
      
      // Add images if any
      const imageInput = document.getElementById("appointment-image") as HTMLInputElement;
      if (imageInput && imageInput.files && imageInput.files.length > 0) {
        formData.append("images", imageInput.files[0]);
      }
      
      const response = await serviceApi.updateService(service._id, formData);
      onServiceUpdated();
      toast.success("Service updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating appointment service:", error);
      toast.error("Failed to update service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      
      // Add all fields to form data
      Object.entries(data).forEach(([key, value]) => {
        if (key === "shippingInfo" || key === "dimensions") {
          formData.append(key, JSON.stringify(value));
        } else if (key !== "images") {
          formData.append(key, String(value));
        }
      });
      
      // Add images if any
      const imageInput = document.getElementById("product-image") as HTMLInputElement;
      if (imageInput && imageInput.files && imageInput.files.length > 0) {
        formData.append("images", imageInput.files[0]);
      }
      
      const response = await serviceApi.updateService(service._id, formData);
      onServiceUpdated();
      toast.success("Product updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInPersonSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      
      // Add all fields to form data
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "images") {
          formData.append(key, String(value));
        }
      });
      
      // Add images if any
      const imageInput = document.getElementById("in-person-image") as HTMLInputElement;
      if (imageInput && imageInput.files && imageInput.files.length > 0) {
        formData.append("images", imageInput.files[0]);
      }
      
      const response = await serviceApi.updateService(service._id, formData);
      onServiceUpdated();
      toast.success("In-person service updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating in-person service:", error);
      toast.error("Failed to update service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Service</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={serviceType} value={serviceType}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="appointment" className="flex items-center" disabled>
              <Calendar className="h-4 w-4 mr-2" />
              Appointment
            </TabsTrigger>
            <TabsTrigger value="product" className="flex items-center" disabled>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Product
            </TabsTrigger>
            <TabsTrigger value="in_person" className="flex items-center" disabled>
              <MapPin className="h-4 w-4 mr-2" />
              In-Person
            </TabsTrigger>
          </TabsList>

          {/* Render the appropriate form based on service type */}
          {serviceType === "appointment" && (
            <TabsContent value="appointment">
              {/* Appointment form content */}
              <form onSubmit={appointmentForm.handleSubmit(handleAppointmentSubmit)}>
                {/* Form fields similar to AddServiceModal but with defaultValues */}
                {/* ... */}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Service"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          )}

          {serviceType === "product" && (
            <TabsContent value="product">
              {/* Product form content */}
              <form onSubmit={productForm.handleSubmit(handleProductSubmit)}>
                {/* Form fields similar to AddServiceModal but with defaultValues */}
                {/* ... */}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Product"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          )}

          {serviceType === "in_person" && (
            <TabsContent value="in_person">
              {/* In-person form content */}
              <form onSubmit={inPersonForm.handleSubmit(handleInPersonSubmit)}>
                {/* Form fields similar to AddServiceModal but with defaultValues */}
                {/* ... */}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Service"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
