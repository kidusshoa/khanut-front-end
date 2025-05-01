"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PauseCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { recurringAppointmentApi } from "@/services/recurringAppointment";
import { RecurringAppointment } from "@/lib/types/staff";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RecurringAppointmentDetailsPage({
  params,
}: {
  params: { businessId: string; recurringId: string };
}) {
  const businessId = params.businessId;
  const recurringId = params.recurringId;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [recurringAppointment, setRecurringAppointment] =
    useState<RecurringAppointment | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteFutureOnly, setDeleteFutureOnly] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    // Check if user is authenticated and authorized
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    // Check if user owns this business
    const checkAuthorization = async () => {
      try {
        // In a real app, you would check if the user is authorized to access this business
        // For now, we'll just simulate this check
        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking authorization:", error);
        setIsAuthorized(false);
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [session, status, businessId, router]);

  // Fetch recurring appointment details
  const fetchRecurringAppointmentDetails = async () => {
    try {
      setIsLoading(true);
      const response =
        await recurringAppointmentApi.getRecurringAppointmentById(recurringId);
      setRecurringAppointment(response.recurringAppointment);
      setAppointments(response.appointments || []);
    } catch (error) {
      console.error("Error fetching recurring appointment details:", error);
      toast({
        title: "Error",
        description: "Failed to load recurring appointment details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch appointment details when authorized
  useEffect(() => {
    if (isAuthorized) {
      fetchRecurringAppointmentDetails();
    }
  }, [isAuthorized, recurringId]);

  // Update appointment status
  const handleUpdateStatus = async (
    status: "active" | "paused" | "completed" | "cancelled"
  ) => {
    try {
      await recurringAppointmentApi.updateRecurringAppointmentStatus(
        recurringId,
        status
      );
      toast({
        title: "Success",
        description: `Recurring appointment ${status}`,
      });
      fetchRecurringAppointmentDetails();
    } catch (error) {
      console.error("Error updating recurring appointment status:", error);
      toast({
        title: "Error",
        description: "Failed to update recurring appointment status",
        variant: "destructive",
      });
    }
  };

  // Delete recurring appointment
  const handleDeleteRecurringAppointment = async () => {
    try {
      await recurringAppointmentApi.deleteRecurringAppointment(
        recurringId,
        deleteFutureOnly
      );
      toast({
        title: "Success",
        description: "Recurring appointment deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      router.push(`/business/${businessId}/recurring-appointments`);
    } catch (error) {
      console.error("Error deleting recurring appointment:", error);
      toast({
        title: "Error",
        description: "Failed to delete recurring appointment",
        variant: "destructive",
      });
    }
  };

  // Format recurrence pattern
  const formatRecurrencePattern = (
    pattern: string,
    dayOfWeek?: number,
    dayOfMonth?: number
  ) => {
    switch (pattern) {
      case "daily":
        return "Daily";
      case "weekly":
        return `Weekly on ${
          dayOfWeek !== undefined
            ? format(new Date(2023, 0, 1 + dayOfWeek), "EEEE")
            : ""
        }`;
      case "biweekly":
        return `Every 2 weeks on ${
          dayOfWeek !== undefined
            ? format(new Date(2023, 0, 1 + dayOfWeek), "EEEE")
            : ""
        }`;
      case "monthly":
        return `Monthly on day ${dayOfMonth}`;
      default:
        return pattern;
    }
  };

  // Filter appointments based on tab
  const filteredAppointments = appointments.filter((appointment) => {
    if (activeTab === "all") return true;
    return appointment.status === activeTab;
  });

  if (isLoading && !recurringAppointment) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthorized) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <h1 className="text-2xl font-bold">Unauthorized</h1>
          <p className="text-muted-foreground">
            You do not have permission to access this page.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/business/${businessId}/recurring-appointments`)
            }
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recurring Appointments
          </Button>
        </div>

        {recurringAppointment ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {formatRecurrencePattern(
                      recurringAppointment.recurrencePattern,
                      recurringAppointment.dayOfWeek,
                      recurringAppointment.dayOfMonth
                    )}
                  </h2>
                  <Badge
                    className={cn(
                      "ml-2",
                      recurringAppointment.status === "active" &&
                        "bg-green-500",
                      recurringAppointment.status === "paused" &&
                        "bg-yellow-500",
                      recurringAppointment.status === "completed" &&
                        "bg-blue-500",
                      recurringAppointment.status === "cancelled" &&
                        "bg-red-500"
                    )}
                  >
                    {recurringAppointment.status.charAt(0).toUpperCase() +
                      recurringAppointment.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Created on{" "}
                  {format(
                    parseISO(recurringAppointment.createdAt),
                    "MMMM d, yyyy"
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {recurringAppointment.status === "active" && (
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus("paused")}
                  >
                    <PauseCircle className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                )}

                {recurringAppointment.status === "paused" && (
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus("active")}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Resume
                  </Button>
                )}

                {(recurringAppointment.status === "active" ||
                  recurringAppointment.status === "paused") && (
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus("completed")}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Complete
                  </Button>
                )}

                {(recurringAppointment.status === "active" ||
                  recurringAppointment.status === "paused") && (
                  <Button
                    variant="destructive"
                    onClick={() => handleUpdateStatus("cancelled")}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                )}

                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Recurrence Pattern
                    </h3>
                    <p>
                      {formatRecurrencePattern(
                        recurringAppointment.recurrencePattern,
                        recurringAppointment.dayOfWeek,
                        recurringAppointment.dayOfMonth
                      )}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Date Range
                    </h3>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        From:{" "}
                        {format(
                          parseISO(recurringAppointment.startDate),
                          "MMMM d, yyyy"
                        )}
                      </span>
                    </div>
                    {recurringAppointment.endDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          To:{" "}
                          {format(
                            parseISO(recurringAppointment.endDate),
                            "MMMM d, yyyy"
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Time
                    </h3>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {recurringAppointment.startTime} -{" "}
                        {recurringAppointment.endTime}
                      </span>
                    </div>
                  </div>

                  {recurringAppointment.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Notes
                      </h3>
                      <p className="text-sm">{recurringAppointment.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="md:col-span-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Appointments</CardTitle>
                    <CardDescription>
                      {appointments.length} appointments in this series
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="mb-4"
                    >
                      <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                        <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                      </TabsList>
                    </Tabs>

                    {filteredAppointments.length > 0 ? (
                      <div className="border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Time</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredAppointments.map((appointment) => (
                              <TableRow key={appointment._id}>
                                <TableCell>
                                  {format(
                                    parseISO(appointment.date),
                                    "MMM d, yyyy"
                                  )}
                                </TableCell>
                                <TableCell>
                                  {appointment.startTime} -{" "}
                                  {appointment.endTime}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={cn(
                                      appointment.status === "pending" &&
                                        "bg-yellow-500",
                                      appointment.status === "confirmed" &&
                                        "bg-green-500",
                                      appointment.status === "completed" &&
                                        "bg-blue-500",
                                      appointment.status === "cancelled" &&
                                        "bg-red-500"
                                    )}
                                  >
                                    {appointment.status
                                      .charAt(0)
                                      .toUpperCase() +
                                      appointment.status.slice(1)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      router.push(
                                        `/business/${businessId}/appointments/${appointment._id}`
                                      )
                                    }
                                  >
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Info className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          No appointments found
                        </h3>
                        <p className="text-muted-foreground text-center">
                          No appointments match the selected filter
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Info className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Recurring Appointment Not Found
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              The recurring appointment you're looking for could not be found.
            </p>
            <Button
              onClick={() =>
                router.push(`/business/${businessId}/recurring-appointments`)
              }
            >
              View All Recurring Appointments
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recurring Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this recurring appointment?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="future-only"
                checked={deleteFutureOnly}
                onChange={() => setDeleteFutureOnly(true)}
              />
              <label htmlFor="future-only">
                Delete only future appointments (keep past appointments)
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="all-appointments"
                checked={!deleteFutureOnly}
                onChange={() => setDeleteFutureOnly(false)}
              />
              <label htmlFor="all-appointments">
                Delete all appointments in this series
              </label>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-md border border-yellow-200 dark:border-yellow-900">
              <div className="flex gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-800 dark:text-yellow-400 font-medium">
                    Warning
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-1">
                    This action cannot be undone. Deleting a recurring
                    appointment will remove it from your schedule.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRecurringAppointment}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
