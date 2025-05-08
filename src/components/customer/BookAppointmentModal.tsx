"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CalendarIcon } from "lucide-react";
import { appointmentBookingSchema } from "@/lib/validations/service";
import { appointmentApi } from "@/services/appointment";
import { paymentApi } from "@/services/payment";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
// Replaced date-fns with dayjs
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: any;
  businessId: string;
}

export function BookAppointmentModal({
  isOpen,
  onClose,
  service,
  businessId,
}: BookAppointmentModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<any[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);

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
      serviceId: service?._id,
      businessId: businessId,
      customerId: "",
      date: "",
      startTime: "",
      endTime: "",
      notes: "",
    },
  });

  // Set customer ID from session
  useEffect(() => {
    if (session?.user?.id) {
      setValue("customerId", session.user.id);
    }
  }, [session, setValue]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        serviceId: service?._id,
        businessId: businessId,
        customerId: session?.user?.id || "",
        date: "",
        startTime: "",
        endTime: "",
        notes: "",
      });
      setSelectedDate(undefined);
      setAvailableTimeSlots([]);
    }
  }, [isOpen, reset, service, businessId, session]);

  // Fetch available time slots when date changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDate || !service?._id) return;
      
      try {
        setIsLoadingTimeSlots(true);
        const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
        setValue("date", formattedDate);
        
        const response = await appointmentApi.getAvailableTimeSlots(service._id, formattedDate);
        
        if (response.available) {
          setAvailableTimeSlots(response.timeSlots);
        } else {
          setAvailableTimeSlots([]);
          toast.error(response.message || "No available time slots on this date");
        }
      } catch (error) {
        console.error("Error fetching time slots:", error);
        toast.error("Failed to load available time slots");
        setAvailableTimeSlots([]);
      } finally {
        setIsLoadingTimeSlots(false);
      }
    };

    if (selectedDate) {
      fetchTimeSlots();
    }
  }, [selectedDate, service, setValue]);

  const handleTimeSlotSelect = (timeSlot: any) => {
    setValue("startTime", timeSlot.startTime);
    setValue("endTime", timeSlot.endTime);
  };

  const onSubmit = async (data: any) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to book an appointment");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create appointment
      const appointment = await appointmentApi.createAppointment(data);
      
      // Initialize payment if service has a price
      if (service.price > 0) {
        const paymentResponse = await paymentApi.initializeAppointmentPayment(appointment._id);
        
        // Redirect to payment page
        if (paymentResponse.checkoutUrl) {
          window.location.href = paymentResponse.checkoutUrl;
        } else {
          // If no checkout URL, redirect to appointments page
          router.push(`/customer/${data.customerId}/appointments`);
        }
      } else {
        // If service is free, just redirect to appointments page
        router.push(`/customer/${data.customerId}/appointments`);
      }
      
      toast.success("Appointment booked successfully!");
      onClose();
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Failed to book appointment. Please try again.");
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
    if (service?.availability?.days) {
      const dayName = dayjs(date).format("dddd").toLowerCase();
      return !service.availability.days.includes(dayName);
    }
    
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Book Appointment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="text-base font-medium">Service</Label>
            <p className="text-gray-700">{service?.name}</p>
          </div>

          <div>
            <Label className="text-base font-medium">Price</Label>
            <p className="text-gray-700">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "ETB",
              }).format(service?.price || 0)}
            </p>
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
                  {selectedDate ? dayjs(selectedDate).format("PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
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
                Please select a date first
              </p>
            )}
            {errors.startTime && (
              <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>
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
              disabled={isSubmitting || !watch("startTime")}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                "Book Appointment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
