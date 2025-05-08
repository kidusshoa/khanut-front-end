"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  CalendarIcon, 
  Clock, 
  Plus, 
  X,
  AlertCircle
} from "lucide-react";
import { staffApi } from "@/services/staff";
import { toast } from "@/components/ui/use-toast";
import { Staff, StaffAvailability } from "@/lib/types/staff";
import dayjs from "dayjs";
// Replaced date-fns with dayjs
import { cn } from "@/lib/utils";

// Unavailable dates form schema
const unavailableDatesSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  reason: z.string().optional(),
});

type UnavailableDatesFormValues = z.infer<typeof unavailableDatesSchema>;

interface StaffAvailabilityCalendarProps {
  businessId: string;
  staffId: string;
}

export function StaffAvailabilityCalendar({
  businessId,
  staffId,
}: StaffAvailabilityCalendarProps) {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availabilityData, setAvailabilityData] = useState<StaffAvailability | null>(null);
  const [unavailableDates, setUnavailableDates] = useState<{
    startDate: Date;
    endDate: Date;
    reason?: string;
  }[]>([]);
  const [isAddUnavailableDialogOpen, setIsAddUnavailableDialogOpen] = useState(false);

  // Unavailable dates form
  const form = useForm<UnavailableDatesFormValues>({
    resolver: zodResolver(unavailableDatesSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: addDays(new Date(), 1),
      reason: "",
    },
  });

  // Fetch staff details
  const fetchStaffDetails = async () => {
    try {
      setIsLoading(true);
      const response = await staffApi.getStaffById(staffId);
      setStaff(response);
      
      // Fetch unavailable dates (this would be a real API call in production)
      // For now, we'll use mock data
      setUnavailableDates([
        {
          startDate: addDays(new Date(), 5),
          endDate: addDays(new Date(), 7),
          reason: "Vacation",
        },
        {
          startDate: addDays(new Date(), 15),
          endDate: addDays(new Date(), 15),
          reason: "Personal day",
        },
      ]);
    } catch (error) {
      console.error("Error fetching staff details:", error);
      toast({
        title: "Error",
        description: "Failed to load staff details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch staff availability for selected date
  const fetchStaffAvailability = async (date: Date) => {
    try {
      setIsLoading(true);
      const formattedDate = dayjs(date).format("YYYY-MM-DD");
      const response = await staffApi.getStaffAvailability(staffId, formattedDate);
      setAvailabilityData(response);
    } catch (error) {
      console.error("Error fetching staff availability:", error);
      toast({
        title: "Error",
        description: "Failed to load staff availability",
        variant: "destructive",
      });
      setAvailabilityData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStaffDetails();
  }, [staffId]);

  // Fetch availability when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchStaffAvailability(selectedDate);
    }
  }, [selectedDate, staffId]);

  // Add unavailable dates
  const handleAddUnavailableDates = async (values: UnavailableDatesFormValues) => {
    try {
      await staffApi.setStaffUnavailableDates(staffId, {
        startDate: dayjs(values.startDate).format("YYYY-MM-DD"),
        endDate: dayjs(values.endDate).format("YYYY-MM-DD"),
        reason: values.reason,
      });
      
      toast({
        title: "Success",
        description: "Unavailable dates added successfully",
      });
      
      // Add to local state
      setUnavailableDates([
        ...unavailableDates,
        {
          startDate: values.startDate,
          endDate: values.endDate,
          reason: values.reason,
        },
      ]);
      
      setIsAddUnavailableDialogOpen(false);
    } catch (error) {
      console.error("Error adding unavailable dates:", error);
      toast({
        title: "Error",
        description: "Failed to add unavailable dates",
        variant: "destructive",
      });
    }
  };

  // Remove unavailable date
  const handleRemoveUnavailableDate = async (index: number) => {
    try {
      // In a real app, you would call an API to remove the unavailable date
      // For now, we'll just update the local state
      const newUnavailableDates = [...unavailableDates];
      newUnavailableDates.splice(index, 1);
      setUnavailableDates(newUnavailableDates);
      
      toast({
        title: "Success",
        description: "Unavailable date removed successfully",
      });
    } catch (error) {
      console.error("Error removing unavailable date:", error);
      toast({
        title: "Error",
        description: "Failed to remove unavailable date",
        variant: "destructive",
      });
    }
  };

  // Check if a date is unavailable
  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(
      (unavailable) =>
        date >= unavailable.startDate && date <= unavailable.endDate
    );
  };

  // Format time slots
  const formatTimeSlots = (timeSlots: { startTime: string; endTime: string; isAvailable: boolean }[]) => {
    return timeSlots.map((slot) => ({
      ...slot,
      formattedTime: `${slot.startTime} - ${slot.endTime}`,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Staff Availability</h2>
          <p className="text-muted-foreground">
            Manage availability and time off for {staff?.name || "this staff member"}
          </p>
        </div>
        
        <Button 
          onClick={() => setIsAddUnavailableDialogOpen(true)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Time Off
        </Button>
      </div>
      
      {isLoading && !staff ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : staff ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={staff.profilePicture} />
                    <AvatarFallback className="text-lg">
                      {staff.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{staff.name}</h3>
                    <p className="text-sm text-muted-foreground">{staff.position}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Regular Availability</h4>
                  {staff.availability ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {staff.availability.days
                            .map((day) => day.charAt(0).toUpperCase() + day.slice(1, 3))
                            .join(", ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {staff.availability.startTime} - {staff.availability.endTime}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No regular availability set</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Time Off</CardTitle>
                <CardDescription>
                  Scheduled time off and unavailable dates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {unavailableDates.length > 0 ? (
                  <div className="space-y-3">
                    {unavailableDates.map((unavailable, index) => (
                      <div key={index} className="flex items-start justify-between border-b pb-3 last:border-0">
                        <div>
                          <div className="font-medium">
                            {dayjs(unavailable.startDate).format("MMM D, YYYY")}
                            {!isSameDay(unavailable.startDate, unavailable.endDate) && (
                              <> - {dayjs(unavailable.endDate).format("MMM D, YYYY")}</>
                            )}
                          </div>
                          {unavailable.reason && (
                            <p className="text-sm text-muted-foreground">{unavailable.reason}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveUnavailableDate(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No time off scheduled</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsAddUnavailableDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Time Off
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Availability Calendar</CardTitle>
                <CardDescription>
                  Select a date to view or update availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                    modifiers={{
                      unavailable: (date) => isDateUnavailable(date),
                    }}
                    modifiersClassNames={{
                      unavailable: "bg-red-100 text-red-600 opacity-50",
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>
                  Availability for {dayjs(selectedDate).format("EEEE, MMMM d, yyyy")}
                </CardTitle>
                <CardDescription>
                  {isDateUnavailable(selectedDate) ? (
                    <Badge variant="destructive">Unavailable</Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-500">Available</Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                  </div>
                ) : isDateUnavailable(selectedDate) ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Not Available</h3>
                    <p className="text-muted-foreground max-w-md">
                      {staff.name} is not available on this date due to scheduled time off.
                    </p>
                  </div>
                ) : availabilityData?.timeSlots && availabilityData.timeSlots.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {formatTimeSlots(availabilityData.timeSlots).map((slot, index) => (
                      <div
                        key={index}
                        className={cn(
                          "border rounded-lg p-3 flex items-center justify-between",
                          slot.isAvailable
                            ? "border-green-200 bg-green-50 dark:bg-green-950/20"
                            : "border-red-200 bg-red-50 dark:bg-red-950/20"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className={cn(
                            "h-4 w-4",
                            slot.isAvailable ? "text-green-500" : "text-red-500"
                          )} />
                          <span>{slot.formattedTime}</span>
                        </div>
                        <Badge
                          variant={slot.isAvailable ? "default" : "destructive"}
                          className={cn(
                            "text-xs",
                            slot.isAvailable ? "bg-green-500" : "bg-red-500"
                          )}
                        >
                          {slot.isAvailable ? "Available" : "Booked"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Time Slots</h3>
                    <p className="text-muted-foreground max-w-md">
                      There are no time slots available for this date. This could be because it's outside of regular working hours.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Staff Not Found</h3>
          <p className="text-muted-foreground text-center max-w-md">
            The staff member you're looking for could not be found.
          </p>
        </div>
      )}
      
      {/* Add Unavailable Dates Dialog */}
      <Dialog open={isAddUnavailableDialogOpen} onOpenChange={setIsAddUnavailableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Time Off</DialogTitle>
            <DialogDescription>
              Schedule time off for {staff?.name || "this staff member"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddUnavailableDates)} className="space-y-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              dayjs(field.value).format("PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
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
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              dayjs(field.value).format("PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => 
                            date < new Date() || 
                            (form.getValues().startDate && date < form.getValues().startDate)
                          }
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
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Vacation, sick leave, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddUnavailableDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Time Off</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
