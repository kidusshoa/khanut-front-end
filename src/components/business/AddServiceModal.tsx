"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Calendar, ShoppingBag, MapPin } from "lucide-react";
import {
  serviceSchema,
  appointmentServiceSchema,
  productServiceSchema,
  inPersonServiceSchema,
} from "@/lib/validations/service";
import { serviceApi } from "@/services/service";
import api from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";
import { getCorrectBusinessId } from "@/lib/business-utils";

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  onServiceAdded: (service: any) => void;
  initialServiceType?: "appointment" | "product" | "in_person";
  initialData?: any; // For editing existing services
  forceServiceType?: boolean; // Whether to force the service type to be the initialServiceType
}

export function AddServiceModal({
  isOpen,
  onClose,
  businessId,
  onServiceAdded,
  initialServiceType = "appointment",
  initialData = null,
  forceServiceType = false,
}: AddServiceModalProps) {
  const [serviceType, setServiceType] = useState<
    "appointment" | "product" | "in_person"
  >(initialData?.serviceType || initialServiceType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(
    initialData?.availability?.days || []
  );
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.images?.[0] || null
  );
  const [correctBusinessId, setCorrectBusinessId] =
    useState<string>(businessId);

  // Determine if we're in edit mode
  const isEditMode = !!initialData;

  // Get the correct business ID on component mount
  useEffect(() => {
    const fetchCorrectBusinessId = async () => {
      try {
        console.log("Initial businessId from props:", businessId);

        // Use the utility function to get the correct business ID
        const id = await getCorrectBusinessId(businessId);
        console.log("Got correct business ID:", id);

        if (id && id !== businessId) {
          console.log(`Updating businessId from ${businessId} to ${id}`);
          setCorrectBusinessId(id);

          // Store the correct business ID in localStorage for future use
          if (typeof window !== "undefined") {
            localStorage.setItem("correctBusinessId", id);
            console.log("Stored correct business ID in localStorage:", id);
          }
        } else {
          console.log("Using businessId from props:", businessId);
          setCorrectBusinessId(businessId);
        }
      } catch (error) {
        console.error("Failed to get correct business ID:", error);
        console.log("Continuing with provided businessId:", businessId);
        setCorrectBusinessId(businessId);
      }
    };

    fetchCorrectBusinessId();
  }, [businessId]);

  // Appointment form
  const appointmentForm = useForm({
    resolver: zodResolver(appointmentServiceSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      businessId: correctBusinessId,
      serviceType: "appointment" as const,
      duration: initialData?.duration || 30,
      availability: initialData?.availability || {
        days: [],
        startTime: "09:00",
        endTime: "17:00",
      },
    },
  });

  // Product form
  const productForm = useForm({
    resolver: zodResolver(productServiceSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      businessId: correctBusinessId,
      serviceType: "product" as const,
      inventory: initialData?.inventory || 0,
      sku: initialData?.sku || "",
      shippingInfo: initialData?.shippingInfo || {
        freeShipping: false,
        shippingCost: 0,
      },
    },
  });

  // In-person form
  const inPersonForm = useForm({
    resolver: zodResolver(inPersonServiceSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      businessId: correctBusinessId,
      serviceType: "in_person" as const,
    },
  });

  // Update form values when correctBusinessId changes
  useEffect(() => {
    inPersonForm.setValue("businessId", correctBusinessId);
    console.log("Updated in-person form businessId to:", correctBusinessId);
  }, [correctBusinessId, inPersonForm]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Image selected:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        console.log("Image preview generated, length:", result.length);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    } else {
      console.log("No image file selected or file selection canceled");
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
      console.log("Submitting appointment data:", data);

      // Update days from selected days state
      data.availability.days = selectedDays;

      // Use the correct businessId we already fetched
      console.log(
        "Using businessId for appointment creation:",
        correctBusinessId
      );
      data.businessId = correctBusinessId;

      // Try a simple approach first - create a basic service without images
      try {
        console.log("Trying simple service creation without images");

        // First try the /businesses/services endpoint with minimal data
        try {
          // For the /businesses/services endpoint, we only need these fields
          // The backend will handle the serviceType field
          const basicService = {
            name: data.name,
            description: data.description,
            price: Number(data.price),
          };

          console.log(
            "Sending basic service data to /businesses/services:",
            basicService
          );

          const response = await api.post("/businesses/services", basicService);
          console.log(
            "Service created successfully with /businesses/services:",
            response.data
          );

          onServiceAdded(response.data);
          toast.success("Appointment service added successfully!");
          onClose();
          return;
        } catch (basicError: any) {
          console.error(
            "Basic service creation failed:",
            basicError.response?.data || basicError.message
          );

          // If basic approach fails, try the /services endpoint
          console.log("Trying /services endpoint instead");
        }

        // Create a simple JSON object instead of FormData for /services endpoint
        const simpleService = {
          name: data.name,
          description: data.description,
          price: Number(data.price),
          serviceType: "appointment",
          businessId: data.businessId,
          duration: Number(data.duration),
          availability: data.availability,
        };

        console.log("Sending simple service data to /services:", simpleService);

        // Use the API directly with JSON
        const response = await api.post("/services", simpleService);
        console.log(
          "Service created successfully with /services:",
          response.data
        );

        onServiceAdded(response.data);
        toast.success("Appointment service added successfully!");
        onClose();
        return;
      } catch (simpleError: any) {
        console.error(
          "Simple service creation failed:",
          simpleError.response?.data || simpleError.message
        );

        // If simple approach fails, try with FormData
        console.log("Falling back to FormData approach");
      }

      const formData = new FormData();

      // Add required fields for both endpoints
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", String(data.price));
      // The serviceType is required by the Service model schema for both endpoints
      formData.append("serviceType", "appointment");

      // For the /services endpoint, we need these additional fields
      formData.append("businessId", data.businessId); // This should now have the correct ID
      formData.append("duration", String(data.duration));

      // Add availability as JSON string
      if (data.availability) {
        formData.append("availability", JSON.stringify(data.availability));
      }

      // Add images if any
      const imageInput = document.getElementById(
        "appointment-image"
      ) as HTMLInputElement;
      if (imageInput && imageInput.files && imageInput.files.length > 0) {
        // Both endpoints use "images" as the field name
        const file = imageInput.files[0];
        console.log("Adding image file:", file.name, file.type, file.size);
        formData.append("images", file);
      } else {
        console.log("No image file selected");
      }

      // Log the form data for debugging
      console.log("Form data entries:", Object.fromEntries(formData.entries()));

      try {
        const response = await serviceApi.createService(formData);
        onServiceAdded(response);
        toast.success("Appointment service added successfully!");
        onClose();
      } catch (error: any) {
        console.error("Error response:", error.response?.data);
        toast.error(
          error.response?.data?.message ||
            "Failed to add service. Please try again."
        );
      }
    } catch (error) {
      console.error("Error adding appointment service:", error);
      toast.error("Failed to add service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting product data:", data);

      // If we're in edit mode, update the existing product
      if (isEditMode && initialData?._id) {
        try {
          console.log("Updating existing product with ID:", initialData._id);

          // Create FormData for update
          const formData = new FormData();
          formData.append("name", data.name);
          formData.append("description", data.description);
          formData.append("price", String(data.price));
          formData.append("inventory", String(data.inventory || 0));
          formData.append("sku", data.sku || "");
          formData.append("serviceType", "product");

          // Add image if a new one was selected
          const imageInput = document.getElementById(
            "product-image"
          ) as HTMLInputElement;
          if (imageInput && imageInput.files && imageInput.files.length > 0) {
            const file = imageInput.files[0];
            console.log(
              "Adding new image file for update:",
              file.name,
              file.type,
              file.size
            );
            formData.append("images", file);
          }

          // Update the product
          const response = await serviceApi.updateService(
            initialData._id,
            formData
          );
          console.log("Product updated successfully:", response);

          onServiceAdded(response);
          toast.success("Product updated successfully!");
          onClose();
          return;
        } catch (updateError: any) {
          console.error("Error updating product:", updateError);
          toast.error(
            updateError.message || "Failed to update product. Please try again."
          );
          throw updateError;
        }
      }

      // For new products, continue with creation flow
      // Use the correct businessId we already fetched
      console.log("Using businessId for product creation:", correctBusinessId);
      data.businessId = correctBusinessId;

      // Try a simple approach first - create a basic service without images
      try {
        console.log("Trying simple service creation without images");

        // First try the /businesses/services endpoint with minimal data
        try {
          // For the /businesses/services endpoint, we only need these fields
          // The backend will handle the serviceType field
          const basicService = {
            name: data.name,
            description: data.description,
            price: Number(data.price),
            serviceType: "product", // Explicitly set serviceType for products
          };

          console.log(
            "Sending basic service data to /businesses/services:",
            basicService
          );

          const response = await api.post("/businesses/services", basicService);
          console.log(
            "Service created successfully with /businesses/services:",
            response.data
          );

          onServiceAdded(response.data);
          toast.success("Product added successfully!");
          onClose();
          return;
        } catch (basicError: any) {
          console.error(
            "Basic service creation failed:",
            basicError.response?.data || basicError.message
          );

          // If basic approach fails, try the /services endpoint
          console.log("Trying /services endpoint instead");
        }

        // Create a simple JSON object instead of FormData for /services endpoint
        const simpleService = {
          name: data.name,
          description: data.description,
          price: Number(data.price),
          serviceType: "product",
          businessId: data.businessId,
          inventory: Number(data.inventory || 0),
        };

        console.log("Sending simple service data to /services:", simpleService);

        // Use the API directly with JSON
        const response = await api.post("/services", simpleService);
        console.log(
          "Service created successfully with /services:",
          response.data
        );

        onServiceAdded(response.data);
        toast.success("Product added successfully!");
        onClose();
        return;
      } catch (simpleError: any) {
        console.error(
          "Simple service creation failed:",
          simpleError.response?.data || simpleError.message
        );

        // If simple approach fails, try with FormData
        console.log("Falling back to FormData approach");
      }

      const formData = new FormData();

      // Add required fields for both endpoints
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", String(data.price));
      // The serviceType is required by the Service model schema for both endpoints
      formData.append("serviceType", "product");

      // Log the form data for debugging
      console.log("Adding product with serviceType:", "product");

      // For the /services endpoint, we need these additional fields
      formData.append("businessId", data.businessId); // This should now have the correct ID
      formData.append("inventory", String(data.inventory || 0));

      // Add optional fields
      if (data.sku) {
        formData.append("sku", data.sku);
      }

      // Add shipping info as JSON string
      if (data.shippingInfo) {
        formData.append("shippingInfo", JSON.stringify(data.shippingInfo));
      }

      // Add dimensions if present
      if (data.dimensions) {
        formData.append("dimensions", JSON.stringify(data.dimensions));
      }

      // Add images if any
      const imageInput = document.getElementById(
        "product-image"
      ) as HTMLInputElement;
      if (imageInput && imageInput.files && imageInput.files.length > 0) {
        // Both endpoints use "images" as the field name
        const file = imageInput.files[0];
        console.log("Adding image file:", file.name, file.type, file.size);
        formData.append("images", file);
      } else {
        console.log("No image file selected");
      }

      // Log the form data for debugging
      console.log("Form data entries:", Object.fromEntries(formData.entries()));

      try {
        const response = await serviceApi.createService(formData);
        onServiceAdded(response);
        toast.success("Product added successfully!");
        onClose();
      } catch (error: any) {
        console.error("Error response:", error.response?.data);
        toast.error(
          error.response?.data?.message ||
            "Failed to add product. Please try again."
        );
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInPersonSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting in-person service data:", data);

      // Use the correct businessId we already fetched
      console.log(
        "Using businessId for in-person service creation:",
        correctBusinessId
      );
      data.businessId = correctBusinessId;

      // Try a simple approach first - create a basic service without images
      try {
        console.log("Trying simple service creation without images");

        // First try the /businesses/services endpoint with minimal data
        try {
          // For the /businesses/services endpoint, we need these fields
          // Explicitly include serviceType for in-person services
          const basicService = {
            name: data.name,
            description: data.description,
            price: Number(data.price),
            serviceType: "in_person", // Explicitly set serviceType for in-person services
          };

          console.log(
            "Sending basic service data to /businesses/services:",
            basicService
          );

          const response = await api.post("/businesses/services", basicService);
          console.log(
            "Service created successfully with /businesses/services:",
            response.data
          );

          onServiceAdded(response.data);
          toast.success("In-person service added successfully!");
          onClose();
          return;
        } catch (basicError: any) {
          console.error(
            "Basic service creation failed:",
            basicError.response?.data || basicError.message
          );

          // If basic approach fails, try the /services endpoint
          console.log("Trying /services endpoint instead");
        }

        // Create a simple JSON object instead of FormData for /services endpoint
        const simpleService = {
          name: data.name,
          description: data.description,
          price: Number(data.price),
          serviceType: "in_person",
          businessId: data.businessId,
        };

        console.log("Sending simple service data to /services:", simpleService);

        // Use the API directly with JSON
        const response = await api.post("/services", simpleService);
        console.log(
          "Service created successfully with /services:",
          response.data
        );

        onServiceAdded(response.data);
        toast.success("In-person service added successfully!");
        onClose();
        return;
      } catch (simpleError: any) {
        console.error(
          "Simple service creation failed:",
          simpleError.response?.data || simpleError.message
        );

        // If simple approach fails, try with FormData
        console.log("Falling back to FormData approach");
      }

      const formData = new FormData();

      // Add required fields for both endpoints
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", String(data.price));

      // The serviceType is required by the Service model schema for both endpoints
      // This is critical - the backend will return a 500 error if this is missing
      formData.append("serviceType", "in_person");

      // Log to confirm serviceType is being set
      console.log("Setting serviceType to 'in_person' in FormData");

      // For the /services endpoint, we need these additional fields
      formData.append("businessId", data.businessId); // This should now have the correct ID

      // Add images if any
      const imageInput = document.getElementById(
        "in-person-image"
      ) as HTMLInputElement;
      if (imageInput && imageInput.files && imageInput.files.length > 0) {
        // Both endpoints use "images" as the field name
        const file = imageInput.files[0];
        console.log("Adding image file:", file.name, file.type, file.size);
        formData.append("images", file);
      } else {
        console.log("No image file selected");
      }

      // Log the form data for debugging
      console.log("Form data entries:", Object.fromEntries(formData.entries()));

      try {
        const response = await serviceApi.createService(formData);
        onServiceAdded(response);
        toast.success("In-person service added successfully!");
        onClose();
      } catch (error: any) {
        console.error("Error response:", error.response?.data);
        toast.error(
          error.response?.data?.message ||
            "Failed to add service. Please try again."
        );
      }
    } catch (error) {
      console.error("Error adding in-person service:", error);
      toast.error("Failed to add service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEditMode ? "Edit Service" : "Add New Service"}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue={serviceType}
          onValueChange={(value) =>
            !forceServiceType && setServiceType(value as any)
          }
        >
          {!forceServiceType ? (
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="appointment" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Appointment
              </TabsTrigger>
              <TabsTrigger value="product" className="flex items-center">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Product
              </TabsTrigger>
              <TabsTrigger value="in_person" className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                In-Person
              </TabsTrigger>
            </TabsList>
          ) : (
            <div className="mb-6 flex items-center">
              <h3 className="text-lg font-medium">
                {serviceType === "appointment" ? (
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Appointment Service
                  </span>
                ) : serviceType === "product" ? (
                  <span className="flex items-center">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Product
                  </span>
                ) : (
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    In-Person Service
                  </span>
                )}
              </h3>
            </div>
          )}

          {/* Appointment Form */}
          <TabsContent value="appointment">
            <form
              onSubmit={appointmentForm.handleSubmit(handleAppointmentSubmit)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="appointment-name">Service Name</Label>
                  <Input
                    id="appointment-name"
                    {...appointmentForm.register("name")}
                    placeholder="Haircut, Consultation, etc."
                  />
                  {appointmentForm.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {appointmentForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="appointment-price">Price (ETB)</Label>
                  <Input
                    id="appointment-price"
                    type="number"
                    {...appointmentForm.register("price", {
                      valueAsNumber: true,
                    })}
                    placeholder="0.00"
                  />
                  {appointmentForm.formState.errors.price && (
                    <p className="text-red-500 text-sm mt-1">
                      {appointmentForm.formState.errors.price.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="appointment-description">Description</Label>
                  <Textarea
                    id="appointment-description"
                    {...appointmentForm.register("description")}
                    placeholder="Describe your service..."
                    rows={3}
                  />
                  {appointmentForm.formState.errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {appointmentForm.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="appointment-duration">
                    Duration (minutes)
                  </Label>
                  <Input
                    id="appointment-duration"
                    type="number"
                    {...appointmentForm.register("duration", {
                      valueAsNumber: true,
                    })}
                    placeholder="30"
                  />
                  {appointmentForm.formState.errors.duration && (
                    <p className="text-red-500 text-sm mt-1">
                      {appointmentForm.formState.errors.duration.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Available Days</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {[
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                      "saturday",
                      "sunday",
                    ].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day}`}
                          checked={selectedDays.includes(day)}
                          onCheckedChange={() => handleDayChange(day)}
                        />
                        <Label htmlFor={`day-${day}`} className="capitalize">
                          {day.slice(0, 3)}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {appointmentForm.formState.errors.availability?.days && (
                    <p className="text-red-500 text-sm mt-1">
                      Select at least one day
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="appointment-start-time">Start Time</Label>
                  <Input
                    id="appointment-start-time"
                    type="time"
                    {...appointmentForm.register("availability.startTime")}
                  />
                  {appointmentForm.formState.errors.availability?.startTime && (
                    <p className="text-red-500 text-sm mt-1">
                      {
                        appointmentForm.formState.errors.availability?.startTime
                          .message
                      }
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="appointment-end-time">End Time</Label>
                  <Input
                    id="appointment-end-time"
                    type="time"
                    {...appointmentForm.register("availability.endTime")}
                  />
                  {appointmentForm.formState.errors.availability?.endTime && (
                    <p className="text-red-500 text-sm mt-1">
                      {
                        appointmentForm.formState.errors.availability?.endTime
                          .message
                      }
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="appointment-image">Service Image</Label>
                  <Input
                    id="appointment-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? "Updating..." : "Adding..."}
                    </>
                  ) : isEditMode ? (
                    "Update Appointment Service"
                  ) : (
                    "Add Appointment Service"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Product Form */}
          <TabsContent value="product">
            <form onSubmit={productForm.handleSubmit(handleProductSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input
                    id="product-name"
                    {...productForm.register("name")}
                    placeholder="T-shirt, Book, etc."
                  />
                  {productForm.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {productForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="product-price">Price (ETB)</Label>
                  <Input
                    id="product-price"
                    type="number"
                    {...productForm.register("price", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {productForm.formState.errors.price && (
                    <p className="text-red-500 text-sm mt-1">
                      {productForm.formState.errors.price.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="product-description">Description</Label>
                  <Textarea
                    id="product-description"
                    {...productForm.register("description")}
                    placeholder="Describe your product..."
                    rows={3}
                  />
                  {productForm.formState.errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {productForm.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="product-sku">SKU (Stock Keeping Unit)</Label>
                  <Input
                    id="product-sku"
                    {...productForm.register("sku")}
                    placeholder="PROD-001"
                  />
                  {productForm.formState.errors.sku && (
                    <p className="text-red-500 text-sm mt-1">
                      {productForm.formState.errors.sku.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="product-inventory">Inventory</Label>
                  <Input
                    id="product-inventory"
                    type="number"
                    {...productForm.register("inventory", {
                      valueAsNumber: true,
                    })}
                    placeholder="0"
                  />
                  {productForm.formState.errors.inventory && (
                    <p className="text-red-500 text-sm mt-1">
                      {productForm.formState.errors.inventory.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id="free-shipping"
                      {...productForm.register("shippingInfo.freeShipping")}
                    />
                    <Label htmlFor="free-shipping">Free Shipping</Label>
                  </div>

                  <Label htmlFor="shipping-cost">Shipping Cost (ETB)</Label>
                  <Input
                    id="shipping-cost"
                    type="number"
                    {...productForm.register("shippingInfo.shippingCost", {
                      valueAsNumber: true,
                    })}
                    placeholder="0.00"
                    disabled={productForm.watch("shippingInfo.freeShipping")}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="product-image">Product Image</Label>
                  <Input
                    id="product-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? "Updating..." : "Adding..."}
                    </>
                  ) : isEditMode ? (
                    "Update Product"
                  ) : (
                    "Add Product"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* In-Person Form */}
          <TabsContent value="in_person">
            <form onSubmit={inPersonForm.handleSubmit(handleInPersonSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="in-person-name">Service Name</Label>
                  <Input
                    id="in-person-name"
                    {...inPersonForm.register("name")}
                    placeholder="Walk-in Consultation, etc."
                  />
                  {inPersonForm.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {inPersonForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="in-person-price">Price (ETB)</Label>
                  <Input
                    id="in-person-price"
                    type="number"
                    {...inPersonForm.register("price", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {inPersonForm.formState.errors.price && (
                    <p className="text-red-500 text-sm mt-1">
                      {inPersonForm.formState.errors.price.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="in-person-description">Description</Label>
                  <Textarea
                    id="in-person-description"
                    {...inPersonForm.register("description")}
                    placeholder="Describe your service..."
                    rows={3}
                  />
                  {inPersonForm.formState.errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {inPersonForm.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="in-person-image">Service Image</Label>
                  <Input
                    id="in-person-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? "Updating..." : "Adding..."}
                    </>
                  ) : isEditMode ? (
                    "Update In-Person Service"
                  ) : (
                    "Add In-Person Service"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
