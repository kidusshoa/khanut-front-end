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
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CalendarIcon, User } from "lucide-react";
import { appointmentBookingSchema } from "@/lib/validations/service";
import { appointmentApi } from "@/services/appointment";
import { serviceApi } from "@/services/service";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  onAppointmentAdded: (appointment: any) => void;
}

export function AddAppointmentModal({
  isOpen,
  onClose,
  businessId,
  onAppointmentAdded,
}: AddAppointmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [services, setServices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<any[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(appointmentBookingSchema),
    defaultValues: {
      serviceId: "",
      businessId: businessId,
      customerId: "",
      date: "",
      startTime: "",
      endTime: "",
      notes: "",
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        serviceId: "",
        businessId: businessId,
        customerId: "",
        date: "",
        startTime: "",
        endTime: "",
        notes: "",
      });
      setSelectedDate(undefined);
      setAvailableTimeSlots([]);
      setImagePreview(null);
      fetchServices();
      fetchCustomers();
    }
  }, [isOpen, reset, businessId]);

  // Fetch services for this business
  const fetchServices = async () => {
    try {
      setIsLoadingServices(true);
      const servicesData = await serviceApi.getServicesByType(
        businessId,
        "appointment"
      );
      setServices(servicesData);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
    } finally {
      setIsLoadingServices(false);
    }
  };

  // Fetch customers (simplified - in a real app, you'd fetch from an API)
  const fetchCustomers = async () => {
    try {
      // This is a placeholder - in a real app, you'd fetch from an API
      // For now, we'll use dummy data
      setCustomers([
        { _id: "customer1", name: "John Doe", email: "john@example.com" },
        { _id: "customer2", name: "Jane Smith", email: "jane@example.com" },
        // Add more as needed
      ]);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  // Fetch available time slots when date and service change
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDate || !watch("serviceId")) return;

      try {
        setIsLoadingTimeSlots(true);
        const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
        setValue("date", formattedDate);

        const response = await appointmentApi.getAvailableTimeSlots(
          watch("serviceId"),
          formattedDate
        );

        if (response.available) {
          setAvailableTimeSlots(response.timeSlots);
        } else {
          setAvailableTimeSlots([]);
          toast.error(
            response.message || "No available time slots on this date"
          );
        }
      } catch (error) {
        console.error("Error fetching time slots:", error);
        toast.error("Failed to load available time slots");
        setAvailableTimeSlots([]);
      } finally {
        setIsLoadingTimeSlots(false);
      }
    };

    if (selectedDate && watch("serviceId")) {
      fetchTimeSlots();
    }
  }, [selectedDate, watch, setValue]);

  const handleServiceChange = (serviceId: string) => {
    setValue("serviceId", serviceId);
    const service = services.find((s) => s._id === serviceId);
    setSelectedService(service);
  };

  const handleTimeSlotSelect = (timeSlot: any) => {
    setValue("startTime", timeSlot.startTime);
    setValue("endTime", timeSlot.endTime);
  };

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
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    } else {
      console.log("No image file selected or file selection canceled");
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      // Create FormData for image upload
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      // Add image if any
      const imageInput = document.getElementById(
        "appointment-image"
      ) as HTMLInputElement;
      if (imageInput && imageInput.files && imageInput.files.length > 0) {
        formData.append("images", imageInput.files[0]);
      }

      // Create appointment
      const appointment = await appointmentApi.createAppointment(data);

      onAppointmentAdded(appointment);
      toast.success("Appointment added successfully!");
      onClose();
    } catch (error) {
      console.error("Error adding appointment:", error);
      toast.error("Failed to add appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Disable past dates and days not available for the service
  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Disable past dates
    if (date < today) return true;

    // Disable days not available for the service
    if (selectedService?.availability?.days) {
      const dayName = dayjs(date).format("dddd").toLowerCase();
      return !selectedService.availability.days.includes(dayName);
    }

    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Add New Appointment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="service">Select Service</Label>
            <Select
              onValueChange={handleServiceChange}
              value={watch("serviceId")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingServices ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : services.length > 0 ? (
                  services.map((service) => (
                    <SelectItem key={service._id} value={service._id}>
                      {service.name} -{" "}
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "ETB",
                      }).format(service.price)}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-services" disabled>
                    No appointment services available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.serviceId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.serviceId.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="customer">Select Customer</Label>
            <Select
              onValueChange={(value) => setValue("customerId", value)}
              value={watch("customerId")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <SelectItem key={customer._id} value={customer._id}>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        {customer.name}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-customers" disabled>
                    No customers available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.customerId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.customerId.message}
              </p>
            )}
          </div>

          <div>
            <Label className="text-base font-medium">Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate
                    ? dayjs(selectedDate).format("MMMM D, YYYY")
                    : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    if (date) {
                      setValue("date", dayjs(date).format("YYYY-MM-DD"));
                    }
                  }}
                  disabled={disabledDays}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>

          <div>
            <Label className="text-base font-medium">Select Time</Label>
            {isLoadingTimeSlots ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              </div>
            ) : availableTimeSlots.length > 0 ? (
              <Select
                onValueChange={(value) => {
                  const timeSlot = availableTimeSlots.find(
                    (slot) => slot.startTime === value
                  );
                  if (timeSlot) {
                    handleTimeSlotSelect(timeSlot);
                  }
                }}
                value={watch("startTime")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimeSlots.map((slot, index) => (
                    <SelectItem key={index} value={slot.startTime}>
                      {slot.startTime} - {slot.endTime}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : selectedDate ? (
              <p className="text-orange-600 text-sm py-2">
                No available time slots on this date
              </p>
            ) : (
              <p className="text-gray-500 text-sm py-2">
                Please select a service and date first
              </p>
            )}
            {errors.startTime && (
              <p className="text-red-500 text-sm mt-1">
                {errors.startTime.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="appointment-image">
              Appointment Image (Optional)
            </Label>
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

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Any special requests or information..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !watch("startTime") ||
                !watch("serviceId") ||
                !watch("customerId")
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Appointment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
