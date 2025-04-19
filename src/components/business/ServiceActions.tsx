"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Calendar,
  ShoppingBag,
  MapPin,
  Clock,
  Plus,
  Minus,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { format } from "date-fns";

interface ServiceActionsProps {
  service: {
    _id: string;
    name: string;
    description: string;
    price: number;
    businessId: string;
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

  // Generate available time slots based on service availability
  const getAvailableTimeSlots = () => {
    if (!service.availability) return [];

    const { startTime, endTime } = service.availability;
    const slots = [];

    const start = parseInt(startTime.split(":")[0]);
    const end = parseInt(endTime.split(":")[0]);

    for (let hour = start; hour < end; hour++) {
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }

    return slots;
  };

  const timeSlots = getAvailableTimeSlots();

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

    // Add to cart logic would go here
    toast.success(`Added ${quantity} ${service.name} to cart`);
    setIsCartModalOpen(false);
  };

  const handleBookAppointment = () => {
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

    // Book appointment logic would go here
    toast.success(
      `Appointment booked for ${format(selectedDate, "PPP")} at ${selectedTime}`
    );
    setIsBookModalOpen(false);
  };

  const renderActionButton = () => {
    switch (service.serviceType) {
      case "appointment":
        return (
          <Dialog open={isBookModalOpen} onOpenChange={setIsBookModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                <Calendar className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Book Appointment</DialogTitle>
                <DialogDescription>
                  Select a date and time for your appointment with{" "}
                  {service.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {selectedDate
                          ? format(selectedDate, "PPP")
                          : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        disabled={(date) => {
                          // Disable past dates
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        type="button"
                        variant={selectedTime === time ? "default" : "outline"}
                        className={
                          selectedTime === time
                            ? "bg-orange-600 hover:bg-orange-700"
                            : ""
                        }
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBookModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={handleBookAppointment}
                >
                  Book Now
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
                  Select quantity for {service.name}.
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
                >
                  Add to Cart
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

  return <div className="mt-4">{renderActionButton()}</div>;
}
