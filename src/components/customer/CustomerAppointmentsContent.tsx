"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  Filter,
  Loader2,
  MapPin,
  Search,
  X,
} from "lucide-react";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isTomorrow from "dayjs/plugin/isTomorrow";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";
import { appointmentApi } from "@/services/appointment";

// Extend dayjs with plugins
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(weekOfYear);

interface Appointment {
  _id: string;
  customerId: string;
  businessId: string;
  serviceId: {
    _id: string;
    name: string;
    description: string;
    price: number;
    businessId: string;
    businessName: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CustomerAppointmentsContent({ customerId }: { customerId: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch appointments
  const {
    data: appointments,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["customerAppointments", customerId, activeTab, selectedDate],
    queryFn: async () => {
      const params: any = {};

      if (activeTab !== "all") {
        params.status = activeTab;
      }

      if (selectedDate) {
        params.date = dayjs(selectedDate).format("YYYY-MM-DD");
      }

      return appointmentApi.getCustomerAppointments(customerId, params);
    },
  });

  // Filter appointments by search query
  const filteredAppointments = appointments?.filter((appointment: Appointment) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      appointment.serviceId.name.toLowerCase().includes(query) ||
      appointment.serviceId.businessName.toLowerCase().includes(query) ||
      appointment.status.toLowerCase().includes(query)
    );
  });

  const formatTime = (date: string) => {
    return dayjs(date).format("h:mm A");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getDateLabel = (dateString: string) => {
    const date = dayjs(dateString);
    if (date.isToday()) return "Today";
    if (date.isTomorrow()) return "Tomorrow";
    if (date.week() === dayjs().week()) return date.format("dddd"); // Day name
    return date.format("MMM D, YYYY");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is handled client-side, so no need to do anything here
  };

  const clearFilters = () => {
    setActiveTab("all");
    setSelectedDate(undefined);
  };

  return (
    <CustomerDashboardLayout customerId={customerId}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            Manage your scheduled services and bookings
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <form
            onSubmit={handleSearch}
            className="relative flex-grow"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </form>

          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`justify-start text-left font-normal ${
                    selectedDate ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? dayjs(selectedDate).format("MMM D, YYYY") : "Filter by date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Appointments</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Status</h3>
                    <Tabs
                      defaultValue={activeTab}
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="w-full"
                    >
                      <TabsList className="grid grid-cols-2 mb-2">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                      </TabsList>
                      <TabsList className="grid grid-cols-2 mb-2">
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                      </TabsList>
                      <TabsList className="grid grid-cols-1">
                        <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Date</h3>
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>

                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    Clear Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {(selectedDate || activeTab !== "all") && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFilters}
                className="px-2"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear filters</span>
              </Button>
            )}
          </div>
        </div>

        {/* Appointments List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredAppointments && filteredAppointments.length > 0 ? (
          <div className="space-y-6">
            {/* Group appointments by date */}
            {Object.entries(
              filteredAppointments.reduce((groups: any, appointment: Appointment) => {
                const date = appointment.date.split("T")[0];
                if (!groups[date]) {
                  groups[date] = [];
                }
                groups[date].push(appointment);
                return groups;
              }, {})
            )
              .sort(([dateA], [dateB]) => {
                return new Date(dateA).getTime() - new Date(dateB).getTime();
              })
              .map(([date, appointmentsForDate]: [string, any]) => {
                return (
                  <div key={date} className="space-y-4">
                    <h2 className="text-xl font-semibold sticky top-0 bg-background py-2 z-10">
                      {getDateLabel(date)}
                    </h2>
                    <div className="space-y-4">
                      {appointmentsForDate.map((appointment: Appointment) => {
                        const appointmentDate = dayjs(appointment.date);
                        const isPast = appointmentDate.isBefore(dayjs());

                        return (
                          <div
                            key={appointment._id}
                            className={`rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden ${
                              isPast ? "opacity-70" : ""
                            }`}
                          >
                            <div className="p-6">
                              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div className="space-y-1">
                                  <h3 className="text-lg font-semibold">
                                    {appointment.serviceId.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {appointment.serviceId.businessName}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge
                                      className={getStatusColor(
                                        appointment.status
                                      )}
                                      variant="outline"
                                    >
                                      {appointment.status.charAt(0).toUpperCase() +
                                        appointment.status.slice(1)}
                                    </Badge>
                                    {isPast && appointment.status !== "cancelled" && (
                                      <Badge variant="outline">Past</Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      {appointment.startTime} - {appointment.endTime}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span>Business Location</span>
                                  </div>
                                  <p className="font-medium text-lg mt-2">
                                    ${appointment.serviceId.price.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              {appointment.notes && (
                                <div className="mt-4 p-3 bg-muted rounded-md">
                                  <p className="text-sm">{appointment.notes}</p>
                                </div>
                              )}
                              <div className="flex justify-end gap-2 mt-4">
                                {!isPast && appointment.status !== "cancelled" && (
                                  <Button
                                    variant="outline"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    Cancel
                                  </Button>
                                )}
                                <Button className="bg-orange-600 hover:bg-orange-700">
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium mb-1">No appointments found</h3>
            <p className="text-muted-foreground mb-6">
              {selectedDate
                ? `No appointments for ${dayjs(selectedDate).format("MMMM D, YYYY")}`
                : activeTab !== "all"
                ? `No ${activeTab} appointments found`
                : "You don't have any appointments yet"}
            </p>
            <Button
              onClick={() => router.push(`/customer/${customerId}/services?type=appointment`)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Book an Appointment
            </Button>
          </div>
        )}
      </div>
    </CustomerDashboardLayout>
  );
}
