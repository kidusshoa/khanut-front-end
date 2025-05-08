"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  CalendarRange,
} from "lucide-react";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
dayjs.extend(isToday);
// Replaced date-fns with dayjs
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Appointment, appointmentApi } from "@/services/appointment";
import { toast } from "react-hot-toast";

interface AppointmentListProps {
  customerId: string;
}

export function AppointmentList({ customerId }: AppointmentListProps) {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await appointmentApi.getCustomerAppointments(customerId);
        setAppointments(data);
        setFilteredAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [customerId]);

  // Filter appointments when search term or status filter changes
  useEffect(() => {
    let filtered = appointments;

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(
        (appointment) => appointment.status === statusFilter
      );
    }

    // Apply search filter (search by service name or business name)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((appointment) => {
        const serviceName =
          typeof appointment.serviceId === "string"
            ? ""
            : appointment.serviceId.name.toLowerCase();

        const businessName =
          typeof appointment.businessId === "string"
            ? ""
            : appointment.businessId.name.toLowerCase();

        return serviceName.includes(term) || businessName.includes(term);
      });
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter]);

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      const date = dayjs(dateString);
      if (dayjs(date).isToday()) {
        return "Today";
      }
      return dayjs(date).format("PPP");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Format time helper
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours, 10);
      const period = hour >= 12 ? "PM" : "AM";
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${period}`;
    } catch (error) {
      return timeString;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string, date: string, startTime: string) => {
    const appointmentDate = dayjs(date);
    const [hours, minutes] = startTime.split(":");
    const appointmentDateTime = appointmentDate
      .hour(parseInt(hours))
      .minute(parseInt(minutes))
      .toDate();

    const isPastAppointment = dayjs(appointmentDateTime).isBefore(dayjs());

    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
          >
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "confirmed":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Confirmed
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
          >
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        );
    }
  };

  // Get service name
  const getServiceName = (appointment: Appointment) => {
    if (typeof appointment.serviceId === "string") {
      return "Service";
    } else {
      return appointment.serviceId.name;
    }
  };

  // Get business name
  const getBusinessName = (appointment: Appointment) => {
    if (typeof appointment.businessId === "string") {
      return "Business";
    } else {
      return appointment.businessId.name;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search appointments..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="All statuses" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Appointments list */}
      {filteredAppointments.length === 0 ? (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No appointments found</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {appointments.length === 0
                ? "You haven't booked any appointments yet."
                : "No appointments match your current filters. Try adjusting your search or filter criteria."}
            </p>
            {appointments.length === 0 && (
              <Button
                className="mt-4 bg-orange-600 hover:bg-orange-700"
                onClick={() => router.push(`/customer/${customerId}/search`)}
              >
                Browse Services
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card
              key={appointment._id}
              className="w-full hover:shadow-md transition-shadow cursor-pointer"
              onClick={() =>
                router.push(
                  `/customer/${customerId}/appointments/${appointment._id}`
                )
              }
            >
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <CardTitle className="text-base">
                      {getServiceName(appointment)}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <CalendarRange className="h-3 w-3" />
                      {formatDate(appointment.date)}
                    </CardDescription>
                  </div>
                  {getStatusBadge(
                    appointment.status,
                    appointment.date,
                    appointment.startTime
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                      <Calendar className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {getBusinessName(appointment)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(appointment.startTime)} -{" "}
                        {formatTime(appointment.endTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {typeof appointment.serviceId !== "string" &&
                      appointment.serviceId.price > 0
                        ? `${appointment.serviceId.price.toLocaleString()} ETB`
                        : "Free"}
                    </p>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
