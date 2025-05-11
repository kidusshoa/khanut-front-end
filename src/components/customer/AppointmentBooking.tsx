"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
dayjs.extend(isToday);
// Replaced date-fns with dayjs
import {
  Calendar as CalendarIcon,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { appointmentApi, TimeSlot } from "@/services/appointment";
import { paymentApi } from "@/services/payment";

interface AppointmentBookingProps {
  serviceId: string;
  businessId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AppointmentBooking({
  serviceId,
  businessId,
  serviceName,
  servicePrice,
  serviceDuration,
  onSuccess,
  onCancel,
}: AppointmentBookingProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null
  );
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available time slots when date changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!date) return;

      setIsLoadingTimeSlots(true);
      setError(null);
      setTimeSlots([]);
      setSelectedTimeSlot(null);

      try {
        const formattedDate = dayjs(date).format("YYYY-MM-DD");
        const response = await appointmentApi.getAvailableTimeSlots(
          serviceId,
          formattedDate
        );

        if (response.available) {
          setTimeSlots(response.timeSlots);
        } else {
          setError(response.message || "No available time slots for this date");
        }
      } catch (err) {
        console.error("Error fetching time slots:", err);
        setError("Failed to load available time slots");
      } finally {
        setIsLoadingTimeSlots(false);
      }
    };

    fetchTimeSlots();
  }, [date, serviceId]);

  // Handle booking submission
  const handleBookAppointment = async () => {
    if (!session?.user?.id) {
      toast.error("Please log in to book an appointment");
      return;
    }

    if (!date || !selectedTimeSlot) {
      toast.error("Please select a date and time");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formattedDate = dayjs(date).format("YYYY-MM-DD");

      // Create appointment
      const appointmentData = {
        serviceId,
        businessId,
        customerId: session.user.id,
        date: formattedDate,
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
        notes: notes.trim() || undefined,
        isRecurring: false, // Add the required isRecurring property
      };

      const appointment = await appointmentApi.createAppointment(
        appointmentData
      );

      // If service has a price, initialize payment
      if (servicePrice > 0) {
        try {
          const paymentResponse = await paymentApi.initializeAppointmentPayment(
            appointment._id
          );

          if (paymentResponse.data?.checkout_url) {
            // Redirect to payment page
            window.location.href = paymentResponse.data.checkout_url;
            return;
          }
        } catch (paymentError) {
          console.error("Payment initialization error:", paymentError);
          // Continue even if payment fails, as appointment is already created
        }
      }

      toast.success("Appointment booked successfully!");

      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to appointments page
        router.push(
          `/customer/${session.user.id}/appointments/${appointment._id}`
        );
      }
    } catch (err: any) {
      console.error("Error booking appointment:", err);
      setError(err.message || "Failed to book appointment");
      toast.error(err.message || "Failed to book appointment");
    } finally {
      setIsLoading(false);
    }
  };

  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${period}`;
  };

  // Disable past dates in calendar
  const disabledDates = (date: Date) => {
    return dayjs(date).isBefore(dayjs()) && !dayjs(date).isSame(dayjs(), "day");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-1">Book an Appointment</h3>
        <p className="text-sm text-muted-foreground">
          Select a date and time to book your appointment for {serviceName}
        </p>
      </div>

      {/* Date Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? dayjs(date).format("PPP") : "Select a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                console.log("Date selected in AppointmentBooking:", newDate);
                setDate(newDate);
              }}
              disabled={disabledDates}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Slot Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Time</label>

        {isLoadingTimeSlots ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
            {error}
          </div>
        ) : timeSlots.length === 0 ? (
          <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground text-center">
            No available time slots for this date. Please select another date.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {timeSlots.map((slot, index) => (
              <Button
                key={index}
                variant={selectedTimeSlot === slot ? "default" : "outline"}
                className={cn(
                  "justify-center",
                  selectedTimeSlot === slot &&
                    "bg-orange-600 hover:bg-orange-700"
                )}
                onClick={() => setSelectedTimeSlot(slot)}
              >
                <Clock className="mr-2 h-4 w-4" />
                {formatTime(slot.startTime)}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Notes (Optional)</label>
        <Textarea
          placeholder="Add any special requests or notes for your appointment"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="resize-none"
          rows={3}
        />
      </div>

      {/* Appointment Summary */}
      {selectedTimeSlot && (
        <div className="bg-muted p-4 rounded-md space-y-2">
          <h4 className="font-medium">Appointment Summary</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Service:</span>
            <span>{serviceName}</span>

            <span className="text-muted-foreground">Date:</span>
            <span>{date ? dayjs(date).format("PPP") : "Not selected"}</span>

            <span className="text-muted-foreground">Time:</span>
            <span>
              {formatTime(selectedTimeSlot.startTime)} -{" "}
              {formatTime(selectedTimeSlot.endTime)}
            </span>

            <span className="text-muted-foreground">Duration:</span>
            <span>{serviceDuration} minutes</span>

            <span className="text-muted-foreground">Price:</span>
            <span>
              {servicePrice > 0
                ? `${servicePrice.toLocaleString()} ETB`
                : "Free"}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          className="bg-orange-600 hover:bg-orange-700 sm:flex-1"
          disabled={!selectedTimeSlot || isLoading}
          onClick={handleBookAppointment}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking...
            </>
          ) : (
            "Book Appointment"
          )}
        </Button>

        <Button
          variant="outline"
          className="sm:flex-1"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
