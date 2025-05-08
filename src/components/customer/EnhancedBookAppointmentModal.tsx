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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  CalendarIcon,
  Clock,
  User,
  Repeat,
  Info,
  AlertCircle,
} from "lucide-react";
import { appointmentBookingSchema } from "@/lib/validations/service";
import { appointmentApi } from "@/services/appointment";
import { staffApi } from "@/services/staff";
import { paymentApi } from "@/services/payment";
import { toast } from "@/components/ui/use-toast";
import dayjs from "dayjs";
// Replaced date-fns with dayjs
import { cn } from "@/lib/utils";
import { Staff } from "@/lib/types/staff";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EnhancedBookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: any;
  businessId: string;
}

export function EnhancedBookAppointmentModal({
  isOpen,
  onClose,
  service,
  businessId,
}: EnhancedBookAppointmentModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<any[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<
    "daily" | "weekly" | "biweekly" | "monthly"
  >("weekly");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>(
    undefined
  );
  const [recurrencePreview, setRecurrencePreview] = useState<Date[]>([]);
  const [activeTab, setActiveTab] = useState("appointment");

  const form = useForm({
    resolver: zodResolver(appointmentBookingSchema),
    defaultValues: {
      serviceId: service?._id,
      businessId: businessId,
      customerId: "",
      staffId: "",
      date: "",
      startTime: "",
      endTime: "",
      notes: "",
      isRecurring: false,
      recurrencePattern: "weekly" as
        | "daily"
        | "weekly"
        | "biweekly"
        | "monthly",
      recurrenceEndDate: "",
      recurrenceCount: 4,
    },
  });

  // Set customer ID from session
  useEffect(() => {
    if (session?.user?.id) {
      form.setValue("customerId", session.user.id);
    }
  }, [session, form]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      form.reset({
        serviceId: service?._id,
        businessId: businessId,
        customerId: session?.user?.id || "",
        staffId: "",
        date: "",
        startTime: "",
        endTime: "",
        notes: "",
        isRecurring: false,
        recurrencePattern: "weekly",
        recurrenceEndDate: "",
        recurrenceCount: 4,
      });
      setSelectedDate(undefined);
      setAvailableTimeSlots([]);
      setSelectedStaff(null);
      setIsRecurring(false);
      setRecurrencePattern("weekly");
      setRecurrenceEndDate(undefined);
      setRecurrencePreview([]);
      setActiveTab("appointment");

      // Fetch staff members
      fetchStaffMembers();
    }
  }, [isOpen, form, service, businessId, session]);

  // Fetch staff members
  const fetchStaffMembers = async () => {
    try {
      setIsLoadingStaff(true);
      const response = await staffApi.getBusinessStaff(businessId);
      setStaffMembers(response.staff || []);
    } catch (error) {
      console.error("Error fetching staff members:", error);
      toast({
        title: "Error",
        description: "Failed to load staff members",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStaff(false);
    }
  };

  // Fetch available time slots when date or staff changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDate || !service?._id) return;

      try {
        setIsLoadingTimeSlots(true);
        const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
        form.setValue("date", formattedDate);

        const response = await appointmentApi.getAvailableTimeSlots(
          service._id,
          formattedDate,
          selectedStaff?._id
        );

        if (response.available) {
          setAvailableTimeSlots(response.timeSlots);
        } else {
          setAvailableTimeSlots([]);
          toast({
            title: "No Available Slots",
            description:
              response.message || "No available time slots on this date",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching time slots:", error);
        toast({
          title: "Error",
          description: "Failed to load available time slots",
          variant: "destructive",
        });
        setAvailableTimeSlots([]);
      } finally {
        setIsLoadingTimeSlots(false);
      }
    };

    if (selectedDate) {
      fetchTimeSlots();
    }
  }, [selectedDate, selectedStaff, service, form]);

  // Update recurrence preview when pattern or date changes
  useEffect(() => {
    if (!selectedDate || !isRecurring) {
      setRecurrencePreview([]);
      return;
    }

    const dates: Date[] = [];
    let currentDate = new Date(selectedDate);

    // Generate preview dates based on pattern
    for (let i = 0; i < 4; i++) {
      if (i === 0) {
        dates.push(new Date(currentDate));
        continue;
      }

      switch (recurrencePattern) {
        case "daily":
          currentDate = dayjs(currentDate).add(1, "day").toDate();
          break;
        case "weekly":
          currentDate = dayjs(currentDate).add(7, "day").toDate();
          break;
        case "biweekly":
          currentDate = dayjs(currentDate).add(14, "day").toDate();
          break;
        case "monthly":
          currentDate = dayjs(currentDate).add(1, "month").toDate();
          break;
      }

      dates.push(new Date(currentDate));
    }

    setRecurrencePreview(dates);

    // Set recurrence end date if not already set
    if (!recurrenceEndDate) {
      const lastDate = dates[dates.length - 1];
      setRecurrenceEndDate(lastDate);
      form.setValue("recurrenceEndDate", dayjs(lastDate).format("YYYY-MM-DD"));
    }
  }, [selectedDate, isRecurring, recurrencePattern, recurrenceEndDate, form]);

  const handleTimeSlotSelect = (timeSlot: any) => {
    form.setValue("startTime", timeSlot.startTime);
    form.setValue("endTime", timeSlot.endTime);
  };

  const handleStaffSelect = (staffId: string) => {
    const staff = staffMembers.find((s) => s._id === staffId);
    setSelectedStaff(staff || null);
    form.setValue("staffId", staffId);
  };

  const handleRecurringToggle = (value: boolean) => {
    setIsRecurring(value);
    form.setValue("isRecurring", value);
  };

  const handleRecurrencePatternChange = (
    pattern: "daily" | "weekly" | "biweekly" | "monthly"
  ) => {
    setRecurrencePattern(pattern);
    form.setValue("recurrencePattern", pattern);
    setRecurrenceEndDate(undefined);
    form.setValue("recurrenceEndDate", "");
  };

  const handleRecurrenceEndDateChange = (date: Date | undefined) => {
    setRecurrenceEndDate(date);
    if (date) {
      form.setValue("recurrenceEndDate", dayjs(date).format("YYYY-MM-DD"));
    } else {
      form.setValue("recurrenceEndDate", "");
    }
  };

  const onSubmit = async (data: any) => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to book an appointment",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create appointment
      const appointment = await appointmentApi.createAppointment(data);

      // Initialize payment if service has a price
      if (service.price > 0) {
        const paymentResponse = await paymentApi.initializeAppointmentPayment(
          appointment._id
        );

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

      toast({
        title: "Success",
        description: isRecurring
          ? "Recurring appointments booked successfully!"
          : "Appointment booked successfully!",
      });
      onClose();
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Book Appointment
          </DialogTitle>
          <DialogDescription>
            Book an appointment for {service?.name} at{" "}
            {service?.businessName || "this business"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="appointment">Appointment Details</TabsTrigger>
            <TabsTrigger
              value="recurring"
              disabled={!selectedDate || !form.watch("startTime")}
            >
              Recurring Options
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointment" className="space-y-4 py-4">
            <Form {...form}>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Service Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Service
                        </Label>
                        <p className="font-medium">{service?.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Duration
                        </Label>
                        <p className="font-medium">
                          {service?.duration} minutes
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Price
                        </Label>
                        <p className="font-medium">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "ETB",
                          }).format(service?.price || 0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !selectedDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {selectedDate
                                    ? dayjs(selectedDate).format("PPP")
                                    : "Select a date"}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                  setSelectedDate(date);
                                  if (date) {
                                    field.onChange(
                                      dayjs(date).format("YYYY-MM-DD")
                                    );
                                  }
                                }}
                                disabled={disabledDays}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Time</FormLabel>
                          <FormControl>
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
                                  field.onChange(value);
                                }}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a time slot" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableTimeSlots.map((slot, index) => (
                                    <SelectItem
                                      key={index}
                                      value={slot.startTime}
                                    >
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {staffMembers.length > 0 && (
                  <FormField
                    control={form.control}
                    name="staffId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Staff (Optional)</FormLabel>
                        <FormControl>
                          {isLoadingStaff ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {staffMembers.map((staff) => (
                                <div
                                  key={staff._id}
                                  className={cn(
                                    "border rounded-lg p-3 cursor-pointer transition-colors",
                                    selectedStaff?._id === staff._id
                                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950"
                                      : "hover:border-orange-200 hover:bg-orange-50/50 dark:hover:bg-orange-950/50"
                                  )}
                                  onClick={() => handleStaffSelect(staff._id)}
                                >
                                  <div className="flex items-center gap-3">
                                    <Avatar>
                                      <AvatarImage src={staff.profilePicture} />
                                      <AvatarFallback>
                                        {staff.name
                                          .substring(0, 2)
                                          .toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">
                                        {staff.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {staff.position}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </FormControl>
                        <FormDescription>
                          Select a staff member or leave unselected for any
                          available staff
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any special requests or information..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Add any special requests or information for your
                        appointment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center space-x-2">
                  <Switch
                    id="recurring"
                    checked={isRecurring}
                    onCheckedChange={handleRecurringToggle}
                  />
                  <Label htmlFor="recurring" className="cursor-pointer">
                    Make this a recurring appointment
                  </Label>
                </div>

                {isRecurring && (
                  <div className="bg-muted p-3 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <Repeat className="h-4 w-4 text-orange-500" />
                      <p className="text-sm font-medium">
                        This will create multiple appointments
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Configure recurring options in the next tab
                    </p>
                  </div>
                )}
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="recurring" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                <p className="text-sm">
                  Configure how often this appointment should repeat
                </p>
              </div>

              <div className="space-y-3">
                <Label>Recurrence Pattern</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { value: "daily", label: "Daily" },
                    { value: "weekly", label: "Weekly" },
                    { value: "biweekly", label: "Bi-Weekly" },
                    { value: "monthly", label: "Monthly" },
                  ].map((pattern) => (
                    <Button
                      key={pattern.value}
                      type="button"
                      variant={
                        recurrencePattern === pattern.value
                          ? "default"
                          : "outline"
                      }
                      className={cn(
                        recurrencePattern === pattern.value &&
                          "bg-orange-600 hover:bg-orange-700"
                      )}
                      onClick={() =>
                        handleRecurrencePatternChange(pattern.value as any)
                      }
                    >
                      {pattern.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !recurrenceEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {recurrenceEndDate
                        ? dayjs(recurrenceEndDate).format("PPP")
                        : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={recurrenceEndDate}
                      onSelect={handleRecurrenceEndDateChange}
                      disabled={(date) => {
                        if (!selectedDate) return true;
                        return date < selectedDate;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Preview</Label>
                  <Badge variant="outline" className="font-normal">
                    {recurrencePreview.length} appointments
                  </Badge>
                </div>
                <Card>
                  <CardContent className="p-4">
                    {recurrencePreview.length > 0 ? (
                      <div className="space-y-2">
                        {recurrencePreview.map((date, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="bg-orange-100 dark:bg-orange-900 rounded-full p-1.5">
                              <CalendarIcon className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                            </div>
                            <span>
                              {dayjs(date).format("EEEE, MMMM d, yyyy")}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground text-center">
                          Select a date and time first to see the recurring
                          pattern
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || !form.watch("startTime") || !selectedDate}
            className="bg-orange-600 hover:bg-orange-700"
            onClick={form.handleSubmit(onSubmit)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : isRecurring ? (
              "Book Recurring Appointments"
            ) : (
              "Book Appointment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
