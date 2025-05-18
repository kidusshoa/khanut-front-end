"use client";

import { useEffect, useState } from "react";
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
  Plus,
  Mail,
  Phone,
  CalendarClock,
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
import { AddAppointmentModal } from "@/components/business/AddAppointmentModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const {
    data: appointments,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["appointments", businessId, activeTab, selectedDate],
    queryFn: async () => {
      console.log("Fetching appointments for business:", businessId);
      const params: any = {};
      if (activeTab !== "all") params.status = activeTab;
      if (selectedDate) params.date = dayjs(selectedDate).format("YYYY-MM-DD");

      try {
        const result = await appointmentApi.getBusinessAppointments(
          businessId,
          params
        );
        console.log("Appointments fetched successfully:", result);
        return result;
      } catch (err) {
        console.error("Error fetching appointments:", err);
        throw err;
      }
    },
    retry: 1,
  });

  // Log any errors
  useEffect(() => {
    if (error) {
      console.error("Query error:", error);
      toast.error("Failed to load appointments. Please try again.");
    }
  }, [error]);

  const handleStatusChange = async (
    appointmentId: string,
    newStatus: string
  ) => {
    try {
      console.log(
        `Updating appointment ${appointmentId} status to ${newStatus}`
      );
      const result = await appointmentApi.updateAppointmentStatus(
        appointmentId,
        newStatus
      );
      console.log("Status update result:", result);
      toast.success(`Appointment ${newStatus} successfully`);

      // Refresh the appointments list
      await refetch();
    } catch (error) {
      console.error("Error updating appointment status:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update appointment status: ${errorMessage}`);
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
              onClick={() => {
                setSelectedAppointment(appointment);
                setIsViewModalOpen(true);
              }}
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
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Appointment
            </Button>
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
                  onSelect={(date) => {
                    console.log(
                      "Date selected in BusinessAppointmentClient:",
                      date
                    );
                    setSelectedDate(date);
                  }}
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
            ) : error ? (
              <div className="text-center py-12 bg-red-50 rounded-lg">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-800 mb-2">
                  Error loading appointments
                </h3>
                <p className="text-red-600 mb-6">
                  {error instanceof Error
                    ? error.message
                    : "An unknown error occurred"}
                </p>
                <Button
                  onClick={() => refetch()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Try Again
                </Button>
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

      {/* Add Appointment Modal */}
      <AddAppointmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        businessId={businessId}
        onAppointmentAdded={() => {
          toast.success("Appointment added successfully!");
          refetch(); // Refresh the appointments list
          setIsAddModalOpen(false);
        }}
      />

      {/* View Appointment Modal */}
      {selectedAppointment && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                <span>Appointment Details</span>
                <Badge
                  className={getStatusColor(selectedAppointment.status)}
                  variant="outline"
                >
                  <div className="flex items-center">
                    {getStatusIcon(selectedAppointment.status)}
                    {selectedAppointment.status.charAt(0).toUpperCase() +
                      selectedAppointment.status.slice(1)}
                  </div>
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Appointment #{selectedAppointment._id.substring(0, 8)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Appointment Time */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">
                  Date & Time
                </h3>
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {dayjs(selectedAppointment.date).format(
                        "dddd, MMMM D, YYYY"
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(selectedAppointment.startTime)} -{" "}
                      {formatTime(selectedAppointment.endTime)}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Customer Information */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">
                  Customer
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedAppointment.customerId.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedAppointment.customerId.email}</span>
                  </div>
                  {selectedAppointment.customerId.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedAppointment.customerId.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Service Information */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">
                  Service
                </h3>
                <div className="flex items-center gap-2">
                  <div>
                    <div className="font-medium">
                      {selectedAppointment.serviceId.name}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-muted-foreground">
                        {formatTime(selectedAppointment.startTime)} -{" "}
                        {formatTime(selectedAppointment.endTime)}
                      </span>
                      <span className="font-medium">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "ETB",
                        }).format(selectedAppointment.serviceId.price)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedAppointment.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-muted-foreground">
                      Notes
                    </h3>
                    <p className="text-sm">{selectedAppointment.notes}</p>
                  </div>
                </>
              )}

              <Separator />

              {/* Booking Information */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">
                  Booking Information
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Booked on:</div>
                  <div>
                    {dayjs(selectedAppointment.createdAt).format("MMM D, YYYY")}
                  </div>

                  <div className="text-muted-foreground">Last updated:</div>
                  <div>
                    {dayjs(selectedAppointment.updatedAt).format("MMM D, YYYY")}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
              {selectedAppointment.status === "pending" && (
                <Button
                  className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                  variant="outline"
                  onClick={() => {
                    handleStatusChange(selectedAppointment._id, "confirmed");
                    setIsViewModalOpen(false);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirm
                </Button>
              )}

              {selectedAppointment.status === "confirmed" && (
                <Button
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  variant="outline"
                  onClick={() => {
                    handleStatusChange(selectedAppointment._id, "completed");
                    setIsViewModalOpen(false);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              )}

              {(selectedAppointment.status === "pending" ||
                selectedAppointment.status === "confirmed") && (
                <Button
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  variant="outline"
                  onClick={() => {
                    handleStatusChange(selectedAppointment._id, "cancelled");
                    setIsViewModalOpen(false);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}

              <Button variant="ghost" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
