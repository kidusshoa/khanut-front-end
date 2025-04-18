"use client";

import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  onServiceAdded: (service: any) => void;
  initialServiceType?: "appointment" | "product" | "in_person";
}

export function AddServiceModal({
  isOpen,
  onClose,
  businessId,
  onServiceAdded,
  initialServiceType = "appointment"
}: AddServiceModalProps) {
  const [serviceType, setServiceType] = useState<"appointment" | "product" | "in_person">(initialServiceType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Appointment form
  const appointmentForm = useForm({
    resolver: zodResolver(appointmentServiceSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      businessId,
      serviceType: "appointment" as const,
      duration: 30,
      availability: {
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
      name: "",
      description: "",
      price: 0,
      businessId,
      serviceType: "product" as const,
      inventory: 0,
      sku: "",
      shippingInfo: {
        freeShipping: false,
        shippingCost: 0,
      },
    },
  });

  // In-person form
  const inPersonForm = useForm({
    resolver: zodResolver(inPersonServiceSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      businessId,
      serviceType: "in_person" as const,
    },
  });

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
      
      const response = await serviceApi.createService(formData);
      onServiceAdded(response);
      toast.success("Appointment service added successfully!");
      onClose();
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
      
      const response = await serviceApi.createService(formData);
      onServiceAdded(response);
      toast.success("Product added successfully!");
      onClose();
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
      
      const response = await serviceApi.createService(formData);
      onServiceAdded(response);
      toast.success("In-person service added successfully!");
      onClose();
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
          <DialogTitle className="text-2xl font-bold">Add New Service</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={serviceType} onValueChange={(value) => setServiceType(value as any)}>
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

          {/* Appointment Form */}
          <TabsContent value="appointment">
            <form onSubmit={appointmentForm.handleSubmit(handleAppointmentSubmit)}>
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
                    {...appointmentForm.register("price", { valueAsNumber: true })}
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
                  <Label htmlFor="appointment-duration">Duration (minutes)</Label>
                  <Input
                    id="appointment-duration"
                    type="number"
                    {...appointmentForm.register("duration", { valueAsNumber: true })}
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
                    {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
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
                      {appointmentForm.formState.errors.availability?.startTime.message}
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
                      {appointmentForm.formState.errors.availability?.endTime.message}
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
                      Adding...
                    </>
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
                    {...productForm.register("inventory", { valueAsNumber: true })}
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
                    {...productForm.register("shippingInfo.shippingCost", { valueAsNumber: true })}
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
                      Adding...
                    </>
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
                      Adding...
                    </>
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
