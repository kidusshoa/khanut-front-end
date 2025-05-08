"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { appointmentApi } from "@/services/appointment";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isTomorrow from "dayjs/plugin/isTomorrow";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Extend dayjs plugins
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(weekOfYear);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

interface Appointment {
  _id: string;
  serviceId: {
    _id: string;
    name: string;
    price: number;
  };
  customerId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  businessId: string;
}

export default function BusinessAppointmentsClient({ businessId }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const {
    data: appointments,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["appointments", businessId, activeTab, selectedDate],
    queryFn: () => {
      const params: any = {};
      if (activeTab !== "all") params.status = activeTab;
      if (selectedDate) params.date = dayjs(selectedDate).format("YYYY-MM-DD");
      return appointmentApi.getBusinessAppointments(businessId, params);
    },
  });

  const handleStatusChange = async (
    appointmentId: string,
    newStatus: string
  ) => {
    try {
      await appointmentApi.updateAppointmentStatus(appointmentId, newStatus);
      toast.success(`Appointment ${newStatus} successfully`);
      refetch();
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Failed to update appointment status");
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 mr-1" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const getDateLabel = (dateString: string) => {
    const date = dayjs(dateString);
    if (date.isToday()) return "Today";
    if (date.isTomorrow()) return "Tomorrow";
    if (date.week() === dayjs().week() && date.year() === dayjs().year())
      return date.format("dddd");
    return date.format("MMM D, YYYY");
  };

  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: "date",
      header: "Date & Time",
      cell: ({ row }) => {
        const appointment = row.original;
        return (
          <div className="flex flex-col">
            <div className="font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
              {getDateLabel(appointment.date)}
            </div>
            <div className="text-sm text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(appointment.startTime)} -{" "}
              {formatTime(appointment.endTime)}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const appointment = row.original;
        return (
          <div className="flex flex-col">
            <div className="font-medium flex items-center">
              <User className="h-4 w-4 mr-1 text-muted-foreground" />
              {appointment.customerId.name}
            </div>
            <div className="text-sm text-muted-foreground">
              {appointment.customerId.email}
            </div>
            {appointment.customerId.phone && (
              <div className="text-sm text-muted-foreground">
                {appointment.customerId.phone}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "service",
      header: "Service",
      cell: ({ row }) => {
        const appointment = row.original;
        return (
          <div className="flex flex-col">
            <div className="font-medium">{appointment.serviceId.name}</div>
            <div className="text-sm text-muted-foreground">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "ETB",
              }).format(appointment.serviceId.price)}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const appointment = row.original;
        return (
          <Badge
            className={getStatusColor(appointment.status)}
            variant="outline"
          >
            <div className="flex items-center">
              {getStatusIcon(appointment.status)}
              {appointment.status.charAt(0).toUpperCase() +
                appointment.status.slice(1)}
            </div>
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const appointment = row.original;
        const isPending = appointment.status === "pending";
        const isConfirmed = appointment.status === "confirmed";
        const isCancelled = appointment.status === "cancelled";
        const isCompleted = appointment.status === "completed";
        const appointmentDate = dayjs(appointment.date);
        const isPast = !appointmentDate.isAfter(dayjs());

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/appointments/${appointment._id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>

            {isPending && (
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                onClick={() => handleStatusChange(appointment._id, "confirmed")}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Confirm
              </Button>
            )}

            {isConfirmed && !isPast && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                onClick={() => handleStatusChange(appointment._id, "completed")}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete
              </Button>
            )}

            {(isPending || isConfirmed) && !isCompleted && !isCancelled && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                onClick={() => handleStatusChange(appointment._id, "cancelled")}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const adaptAppointment = (appointment: any): Appointment => ({
    _id: appointment._id,
    serviceId:
      typeof appointment.serviceId === "string"
        ? { _id: appointment.serviceId, name: "Unknown Service", price: 0 }
        : appointment.serviceId,
    customerId:
      typeof appointment.customerId === "string"
        ? { _id: appointment.customerId, name: "Unknown Customer", email: "" }
        : appointment.customerId,
    date: appointment.date,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    status: appointment.status,
    notes: appointment.notes,
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt,
  });

  const filteredAppointments = (appointments || []).map(adaptAppointment);

  return (
    <DashboardLayout businessId={businessId}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground">
              Manage your customer appointments and bookings.
            </p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {selectedDate
                  ? dayjs(selectedDate).format("MMM D, YYYY")
                  : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
              {selectedDate && (
                <div className="p-3 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDate(undefined)}
                    className="w-full"
                  >
                    Clear date filter
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : filteredAppointments.length > 0 ? (
              <DataTable
                columns={columns}
                data={filteredAppointments}
                searchColumn="customer"
                searchPlaceholder="Search appointments..."
              />
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No appointments found
                </h3>
                <p className="text-muted-foreground mb-6">
                  {selectedDate
                    ? `No appointments for ${dayjs(selectedDate).format(
                        "MMMM D, YYYY"
                      )}`
                    : activeTab === "all"
                    ? "You don't have any appointments yet."
                    : `You don't have any ${activeTab} appointments.`}
                </p>
                {selectedDate && (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDate(undefined)}
                  >
                    Clear date filter
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
