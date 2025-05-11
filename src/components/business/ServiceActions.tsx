"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Calendar,
  ShoppingBag,
  MapPin,
  Plus,
  Minus,
  CalendarDays,
  Building,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import { useCartStore } from "@/store/cartStore";
import { useAppointmentMutations } from "@/hooks/useAppointment";

interface ServiceActionsProps {
  service: {
    _id: string;
    name: string;
    description: string;
    price: number;
    businessId: string;
    businessName?: string;
    serviceType: "appointment" | "product" | "in_person";
    duration?: number;
    availability?: {
      days: string[];
      startTime: string;
      endTime: string;
    };
    inventory?: number;
    customerId?: string;
  };
}

export function ServiceActions({ service }: ServiceActionsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined
  );

  // Reset selected date and time when modal is opened
  useEffect(() => {
    if (isBookModalOpen) {
      setSelectedDate(undefined);
      setSelectedTime(undefined);
    }
  }, [isBookModalOpen]);

  // Use cart store
  const { addToCart } = useCartStore();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Use appointment hooks
  const { bookAppointment, isBooking } = useAppointmentMutations();

  // Debug session
  useEffect(() => {
    if (session) {
      console.log("Session data:", session);
    }
  }, [session]);

  // Generate available time slots based on service availability
  const getAvailableTimeSlots = () => {
    if (!service.availability) {
      console.log("No service availability found, using default time slots");
      return [
        "09:00",
        "09:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
        "17:00",
      ];
    }

    if (!service.availability.startTime || !service.availability.endTime) {
      console.log(
        "Missing start or end time in service availability, using default time slots"
      );
      return [
        "09:00",
        "09:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
        "17:00",
      ];
    }

    const { startTime, endTime } = service.availability;
    const slots = [];

    const start = parseInt(startTime.split(":")?.[0] || "0");
    const end = parseInt(endTime.split(":")?.[0] || "0");

    console.log("Generating time slots from", startTime, "to", endTime);
    console.log("Parsed start hour:", start, "end hour:", end);

    if (isNaN(start) || isNaN(end) || end <= start) {
      console.log("Invalid time range, using default time slots");
      return [
        "09:00",
        "09:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
        "17:00",
      ];
    }

    for (let hour = start; hour < end; hour++) {
      // Format hours to ensure they're always 2 digits (e.g., "09:00" instead of "9:00")
      const formattedHour = hour.toString().padStart(2, "0");
      slots.push(`${formattedHour}:00`);
      slots.push(`${formattedHour}:30`);
    }

    console.log("Generated time slots:", slots);
    return slots;
  };

  const timeSlots = getAvailableTimeSlots();

  // Format time for display (e.g., "09:00" to "9:00 AM")
  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const handleAddToCart = () => {
    if (!session) {
      toast.error("Please log in to add items to cart");
      if (service.customerId) {
        router.push(`/customer/${service.customerId}/login`);
      } else {
        router.push("/login");
      }
      return;
    }

    // Add to cart using the cart store
    setIsAddingToCart(true);
    try {
      addToCart({
        serviceId: service._id,
        name: service.name,
        price: service.price,
        quantity: quantity,
        businessId: service.businessId,
        businessName: service.businessName,
        image: null,
      });
      toast.success(`Added ${quantity} ${service.name} to cart`);
    } finally {
      setIsAddingToCart(false);
      setIsCartModalOpen(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!session) {
      toast.error("Please log in to book appointments");
      if (service.customerId) {
        router.push(`/customer/${service.customerId}/login`);
      } else {
        router.push("/login");
      }
      return;
    }

    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    if (!selectedTime) {
      toast.error("Please select a time");
      return;
    }

    try {
      // Validate the date is a proper Date object
      if (!(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
        console.error("Invalid date object:", selectedDate);
        toast.error("Invalid date selected. Please try again.");
        return;
      }

      // Calculate end time based on service duration (or default to 1 hour)
      const startTime = selectedTime;
      const duration = service.duration || 60; // Default to 60 minutes if not specified

      // Parse the time string
      const [hours, minutes] = startTime.split(":").map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        console.error("Invalid time format:", startTime);
        toast.error("Invalid time selected. Please try again.");
        return;
      }

      // Create a new date object for end time calculation
      const endTimeDate = new Date();
      endTimeDate.setHours(hours, minutes + duration, 0);
      const endTime = `${endTimeDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${endTimeDate
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      console.log("Booking appointment with date:", selectedDate);
      console.log("Formatted date:", dayjs(selectedDate).format("YYYY-MM-DD"));
      console.log("Start time:", startTime);
      console.log("End time:", endTime);
      console.log(
        "Customer ID:",
        service.customerId || session?.user?.id || ""
      );

      // Get customer ID from session
      const customerId = session?.user?.id;
      if (!customerId) {
        toast.error("Customer ID not found. Please log in again.");
        return;
      }

      console.log("Booking with customer ID:", customerId);
      console.log("Service ID:", service._id);
      console.log("Business ID:", service.businessId);

      // Book appointment using the appointment hook
      try {
        bookAppointment({
          serviceId: service._id,
          businessId: service.businessId,
          customerId: customerId,
          date: dayjs(selectedDate).format("YYYY-MM-DD"),
          startTime: startTime,
          endTime: endTime,
          isRecurring: false,
          notes: `Appointment for ${service.name}`,
        });

        console.log("Appointment booking request sent successfully");
      } catch (bookingError) {
        console.error("Error in bookAppointment call:", bookingError);
        throw bookingError;
      }

      toast.success("Appointment booking initiated");
      setIsBookModalOpen(false);
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Failed to book appointment. Please try again.");
    }
  };

  const renderActionButton = () => {
    switch (service.serviceType) {
      case "appointment":
        return (
          <Dialog
            open={isBookModalOpen}
            onOpenChange={(open) => {
              setIsBookModalOpen(open);
              if (!open) {
                // Reset state when modal is closed
                setSelectedDate(undefined);
                setSelectedTime(undefined);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                <Calendar className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  Book Appointment
                </DialogTitle>
                <DialogDescription>
                  Select a date and time for your appointment with{" "}
                  <span className="font-medium">{service.name}</span>
                  {service.businessName ? ` at ${service.businessName}` : ""}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="date" className="text-base font-medium">
                    Select Date
                  </Label>
                  <div className="flex flex-col space-y-2">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        console.log("Date selected:", date);
                        try {
                          // Ensure we're working with a valid Date object
                          if (date instanceof Date && !isNaN(date.getTime())) {
                            setSelectedDate(date);
                            console.log("Valid date set:", date);
                          } else if (date) {
                            // If date is not a valid Date object but is truthy, try to convert it
                            const newDate = new Date(date);
                            if (!isNaN(newDate.getTime())) {
                              setSelectedDate(newDate);
                              console.log("Converted date set:", newDate);
                            } else {
                              console.error("Invalid date selected:", date);
                              toast.error(
                                "Invalid date selected. Please try again."
                              );
                            }
                          }
                        } catch (error) {
                          console.error("Error setting date:", error);
                          toast.error(
                            "Error selecting date. Please try again."
                          );
                        }
                      }}
                      className="rounded-md border shadow p-3"
                      classNames={{
                        day_selected:
                          "bg-orange-600 hover:bg-orange-700 focus:bg-orange-600",
                        day_today: "bg-orange-100 text-orange-900",
                        day_outside: "text-gray-300",
                        day_disabled: "text-gray-300 opacity-50",
                        day_range_middle: "bg-orange-50",
                        day_hidden: "invisible",
                        caption:
                          "flex justify-center py-2 mb-4 relative items-center",
                        caption_label: "text-sm font-medium",
                        nav: "flex items-center",
                        nav_button:
                          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        head_cell: "text-gray-500 font-normal text-center",
                      }}
                      disabled={(date) => {
                        // Disable past dates
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        // Check if date is valid
                        if (!(date instanceof Date) || isNaN(date.getTime())) {
                          console.error(
                            "Invalid date in disabled check:",
                            date
                          );
                          return true;
                        }

                        // Check if date is in the past
                        return date < today;
                      }}
                    />
                    {selectedDate && (
                      <div className="text-sm text-center font-medium text-orange-600">
                        Selected: {dayjs(selectedDate).format("MMM DD, YYYY")}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="time" className="text-base font-medium">
                    Select Time
                  </Label>
                  {selectedDate ? (
                    timeSlots && timeSlots.length > 0 ? (
                      <div className="flex flex-col space-y-3">
                        <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-1">
                          {timeSlots.map((time) => (
                            <Button
                              key={time}
                              type="button"
                              variant={
                                selectedTime === time ? "default" : "outline"
                              }
                              className={cn(
                                selectedTime === time
                                  ? "bg-orange-600 hover:bg-orange-700 ring-2 ring-orange-300"
                                  : "hover:bg-orange-50",
                                "transition-all duration-200"
                              )}
                              onClick={() => {
                                console.log("Time selected:", time);
                                setSelectedTime(time);
                              }}
                            >
                              {formatTimeDisplay(time)}
                            </Button>
                          ))}
                        </div>
                        {selectedTime && (
                          <div className="text-sm text-center font-medium text-orange-600">
                            Selected time: {formatTimeDisplay(selectedTime)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-orange-600 text-sm py-2 font-medium">
                        No available time slots for this date
                      </p>
                    )
                  ) : (
                    <div className="text-center py-3 border rounded-md bg-gray-50">
                      <CalendarDays className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-muted-foreground">
                        Please select a date first
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBookModalOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className={cn(
                    "w-full sm:w-auto",
                    selectedDate && selectedTime
                      ? "bg-orange-600 hover:bg-orange-700"
                      : "bg-gray-300 text-gray-600"
                  )}
                  onClick={handleBookAppointment}
                  disabled={isBooking || !selectedDate || !selectedTime}
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : !selectedDate ? (
                    "Select a date first"
                  ) : !selectedTime ? (
                    "Select a time first"
                  ) : (
                    "Book Appointment"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );

      case "product":
        return (
          <Dialog open={isCartModalOpen} onOpenChange={setIsCartModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add to Cart</DialogTitle>
                <DialogDescription>
                  Select quantity for {service.name}{" "}
                  {service.businessName ? `from ${service.businessName}` : ""}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="quantity">Quantity</Label>
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center">{quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={
                        service.inventory !== undefined &&
                        quantity >= service.inventory
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Price:</span>
                  <span className="font-medium">
                    ETB {(service.price * quantity).toFixed(2)}
                  </span>
                </div>

                {service.inventory !== undefined && (
                  <div className="text-sm text-muted-foreground">
                    {service.inventory} items available in stock
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCartModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add to Cart"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );

      case "in_person":
        return (
          <Button
            className="w-full bg-orange-600 hover:bg-orange-700"
            onClick={() => {
              if (service.customerId) {
                router.push(
                  `/customer/${service.customerId}/businesses/${service.businessId}`
                );
              } else {
                router.push(`/businesses/${service.businessId}`);
              }
            }}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Visit Business
          </Button>
        );

      default:
        return (
          <Button
            className="w-full bg-orange-600 hover:bg-orange-700"
            onClick={() => {
              if (service.customerId) {
                router.push(
                  `/customer/${service.customerId}/services/${service._id}`
                );
              } else {
                router.push(`/services/${service._id}`);
              }
            }}
          >
            View Details
          </Button>
        );
    }
  };

  return (
    <div className="mt-4 space-y-2">
      {renderActionButton()}

      {/* View Business Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          if (service.customerId) {
            router.push(
              `/customer/${service.customerId}/businesses/${service.businessId}`
            );
          } else {
            router.push(`/businesses/${service.businessId}`);
          }
        }}
      >
        <Building className="mr-2 h-4 w-4" />
        {service.businessName
          ? `View ${service.businessName}`
          : "View Business"}
      </Button>
    </div>
  );
}
