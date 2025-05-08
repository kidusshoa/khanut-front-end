"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Calendar,
  Clock,
  ArrowLeft,
  Check,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import dayjs from "dayjs";
// Replaced date-fns with dayjs
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";

// Fetch service details
const fetchServiceDetails = async (serviceId: string) => {
  try {
    console.log("Fetching service details for ID:", serviceId);
    
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/services/${serviceId}`;
    console.log("Service URL:", url);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      console.error("Service endpoint failed:", response.status, response.statusText);
      throw new Error(`Failed to fetch service details: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Service data received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching service details:", error);
    throw error;
  }
};

// Fetch business details
const fetchBusinessDetails = async (businessId: string) => {
  try {
    console.log("Fetching business details for ID:", businessId);
    
    // Try the primary endpoint first
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/businesses/${businessId}`;
      console.log("Trying primary URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Business data received from primary endpoint:", data);
        return data;
      }
      
      console.error("Primary endpoint failed:", response.status, response.statusText);
      // If primary endpoint fails, we'll try the fallback
    } catch (primaryError) {
      console.error("Error with primary endpoint:", primaryError);
      // Continue to fallback
    }

    // Try fallback endpoint
    const fallbackUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/business/${businessId}`;
    console.log("Trying fallback URL:", fallbackUrl);

    const fallbackResponse = await fetch(fallbackUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!fallbackResponse.ok) {
      console.error("Both endpoints failed. Fallback response:", fallbackResponse.status, fallbackResponse.statusText);
      throw new Error(`Failed to fetch business details: ${fallbackResponse.status} ${fallbackResponse.statusText}`);
    }

    const fallbackData = await fallbackResponse.json();
    console.log("Business data received from fallback endpoint:", fallbackData);
    return fallbackData;
  } catch (error) {
    console.error("Error fetching business details:", error);
    throw error;
  }
};

// Book appointment
const bookAppointment = async (appointmentData: any) => {
  try {
    console.log("Booking appointment with data:", appointmentData);
    
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/appointments`;
    console.log("Appointment URL:", url);
    
    const token = Cookies.get("client-token");
    if (!token) {
      throw new Error("Authentication required. Please log in to book an appointment.");
    }
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(appointmentData),
    });
    
    if (!response.ok) {
      console.error("Appointment booking failed:", response.status, response.statusText);
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to book appointment: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Appointment booked successfully:", data);
    return data;
  } catch (error) {
    console.error("Error booking appointment:", error);
    throw error;
  }
};

// Check user authentication
const checkAuth = () => {
  const token = Cookies.get("client-token");
  return !!token;
};

// Interfaces
interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  businessId: string;
  serviceType: "appointment";
  images: string[];
  duration: number;
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
}

interface Business {
  _id: string;
  name: string;
  category: string;
  city: string;
  profilePicture?: string;
}

export default function BookAppointmentPage({
  params: { businessId, serviceId },
}: {
  params: { businessId: string; serviceId: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | undefined>(undefined);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());
  
  // Fetch service details
  const {
    data: service,
    isLoading: isServiceLoading,
    error: serviceError,
  } = useQuery({
    queryKey: ["serviceDetails", serviceId],
    queryFn: () => fetchServiceDetails(serviceId),
    retry: 1,
  });
  
  // Fetch business details
  const {
    data: business,
    isLoading: isBusinessLoading,
  } = useQuery({
    queryKey: ["businessDetails", businessId],
    queryFn: () => fetchBusinessDetails(businessId),
    retry: 1,
    enabled: !!service,
  });
  
  // Generate time slots based on service availability
  const generateTimeSlots = () => {
    if (!service?.availability) return [];
    
    const { startTime, endTime } = service.availability;
    const duration = service.duration || 30; // Default to 30 minutes if not specified
    
    const slots = [];
    
    // Parse start and end times
    const start = parse(startTime, "HH:mm", new Date());
    const end = parse(endTime, "HH:mm", new Date());
    
    let current = start;
    while (current <= end) {
      slots.push(dayjs(current).format("HH:mm"));
      // Add duration minutes to current time
      current = new Date(current.getTime() + duration * 60000);
    }
    
    return slots;
  };
  
  // Check if a day is available based on service availability
  const isDayAvailable = (day: Date) => {
    if (!service?.availability?.days || service.availability.days.length === 0) {
      return true; // If no days specified, all days are available
    }
    
    const dayName = dayjs(day).format("dddd"); // Get day name (Monday, Tuesday, etc.)
    return service.availability.days.includes(dayName);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book an appointment.",
        variant: "destructive",
      });
      
      // Redirect to login page
      router.push(`/auth/login?redirect=/business/${businessId}/service/${serviceId}/book`);
      return;
    }
    
    if (!date || !time) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time for your appointment.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Combine date and time
      const appointmentDateTime = new Date(date);
      const [hours, minutes] = time.split(":").map(Number);
      appointmentDateTime.setHours(hours, minutes);
      
      const appointmentData = {
        serviceId,
        businessId,
        appointmentDate: appointmentDateTime.toISOString(),
        customerName: name || undefined,
        customerEmail: email || undefined,
        customerPhone: phone || undefined,
        notes: notes || undefined,
      };
      
      await bookAppointment(appointmentData);
      
      toast({
        title: "Appointment Booked",
        description: "Your appointment has been successfully booked.",
      });
      
      // Redirect to appointments page
      router.push("/customer/appointments");
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Loading state
  if (isServiceLoading || isBusinessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-muted-foreground">Loading appointment booking...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (serviceError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-500">Error Loading Service</h2>
          <p className="text-muted-foreground">
            {serviceError instanceof Error
              ? serviceError.message
              : "Failed to load service details"}
          </p>
          <Button onClick={() => router.push(`/business/${businessId}/services/public`)} className="mt-4">
            Back to Services
          </Button>
        </div>
      </div>
    );
  }
  
  // If we have no service data but no error occurred, show a not found message
  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 max-w-md text-center">
          <h2 className="text-xl font-semibold">Service Not Found</h2>
          <p className="text-muted-foreground">
            The service you're looking for could not be found or may have been removed.
          </p>
          <Button onClick={() => router.push(`/business/${businessId}/services/public`)} className="mt-4">
            Back to Services
          </Button>
        </div>
      </div>
    );
  }
  
  // If service is not an appointment type, redirect to details page
  if (service.serviceType !== "appointment") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 max-w-md text-center">
          <h2 className="text-xl font-semibold">Invalid Service Type</h2>
          <p className="text-muted-foreground">
            This service is not available for appointment booking.
          </p>
          <Button onClick={() => router.push(`/business/${businessId}/service/${serviceId}/details`)} className="mt-4">
            View Service Details
          </Button>
        </div>
      </div>
    );
  }
  
  const timeSlots = generateTimeSlots();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Header with back button */}
        <div className="flex flex-col gap-4">
          <Button 
            variant="outline" 
            className="w-fit"
            onClick={() => router.push(`/business/${businessId}/service/${serviceId}/details`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Service Details
          </Button>
        </div>
        
        <h1 className="text-2xl font-bold">Book Appointment</h1>
        
        {!isAuthenticated && (
          <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You need to be logged in to book an appointment. Please{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto text-yellow-600 underline"
                onClick={() => router.push(`/auth/login?redirect=/business/${businessId}/service/${serviceId}/book`)}
              >
                log in
              </Button>{" "}
              or{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto text-yellow-600 underline"
                onClick={() => router.push(`/auth/register?redirect=/business/${businessId}/service/${serviceId}/book`)}
              >
                create an account
              </Button>.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Booking Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Date & Time</CardTitle>
                <CardDescription>
                  Choose a date and time for your appointment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="mb-2 block">Select Date</Label>
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => {
                          // Disable dates in the past
                          const today = startOfDay(new Date());
                          return date < today || !isDayAvailable(date);
                        }}
                        className="border rounded-md"
                      />
                      {service.availability?.days && service.availability.days.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Available on: {service.availability.days.join(", ")}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label className="mb-2 block">Select Time</Label>
                      {date ? (
                        timeSlots.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {timeSlots.map((slot) => (
                              <Button
                                key={slot}
                                type="button"
                                variant={time === slot ? "default" : "outline"}
                                className={`h-10 ${time === slot ? "bg-orange-600 hover:bg-orange-700" : ""}`}
                                onClick={() => setTime(slot)}
                              >
                                {slot}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No available time slots for this service.
                          </p>
                        )
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Please select a date first.
                        </p>
                      )}
                      
                      {service.availability && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Business hours: {service.availability.startTime} - {service.availability.endTime}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Your Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="Your phone number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any special requests or information"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={!date || !time || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Appointment
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Service Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Appointment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-md overflow-hidden bg-muted">
                    {service.images && service.images.length > 0 ? (
                      <img
                        src={service.images[0]}
                        alt={service.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {business?.name}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{service.duration} minutes</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">${service.price.toFixed(2)}</span>
                  </div>
                  
                  {date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{dayjs(date).format("MMMM D, YYYY")}</span>
                    </div>
                  )}
                  
                  {time && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{time}</span>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>${service.price.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
