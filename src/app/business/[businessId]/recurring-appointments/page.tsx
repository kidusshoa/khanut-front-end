"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { recurringAppointmentApi } from "@/services/recurringAppointment";
import { RecurringAppointment } from "@/lib/types/staff";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

export default function RecurringAppointmentsPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.businessId as string;
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [recurringAppointments, setRecurringAppointments] = useState<
    RecurringAppointment[]
  >([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Fetch recurring appointments
  const fetchRecurringAppointments = async () => {
    try {
      setIsLoading(true);
      const response =
        await recurringAppointmentApi.getBusinessRecurringAppointments(
          businessId,
          activeTab !== "all" ? { status: activeTab } : undefined
        );
      setRecurringAppointments(response.recurringAppointments || []);
    } catch (error) {
      console.error("Error fetching recurring appointments:", error);
      toast({
        title: "Error",
        description: "Failed to load recurring appointments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch appointments when tab changes
  useEffect(() => {
    if (isAuthorized) {
      fetchRecurringAppointments();
    }
  }, [activeTab, isAuthorized, businessId]);

  // Filter appointments based on search query
  const filteredAppointments = recurringAppointments.filter((appointment) => {
    // This is a simplified search - in a real app, you would search through customer name, service name, etc.
    return (
      appointment._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.recurrencePattern
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  });

  // Update appointment status
  const handleUpdateStatus = async (
    recurringId: string,
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
      fetchRecurringAppointments();
    } catch (error) {
      console.error("Error updating recurring appointment status:", error);
      toast({
        title: "Error",
        description: "Failed to update recurring appointment status",
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
            ? dayjs(new Date(2023, 0, 1 + dayOfWeek)).format("dddd")
            : ""
        }`;
      case "biweekly":
        return `Every 2 weeks on ${
          dayOfWeek !== undefined
            ? dayjs(new Date(2023, 0, 1 + dayOfWeek)).format("dddd")
            : ""
        }`;
      case "monthly":
        return `Monthly on day ${dayOfMonth}`;
      default:
        return pattern;
    }
  };

  if (isLoading && !isAuthorized) {
    return (
      <DashboardLayout businessId={businessId}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthorized) {
    return (
      <DashboardLayout businessId={businessId}>
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
    <DashboardLayout businessId={businessId}>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/business/${businessId}`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Business
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Recurring Appointments
            </h2>
            <p className="text-muted-foreground">
              Manage recurring appointments for your business
            </p>
          </div>

          <Button
            onClick={() =>
              router.push(
                `/business/${businessId}/appointments/create?recurring=true`
              )
            }
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Recurring Appointment
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full md:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="paused">Paused</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : filteredAppointments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {filteredAppointments.map((appointment) => (
                  <Card key={appointment._id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {formatRecurrencePattern(
                            appointment.recurrencePattern,
                            appointment.dayOfWeek,
                            appointment.dayOfMonth
                          )}
                        </CardTitle>
                        <Badge
                          className={cn(
                            appointment.status === "active" && "bg-green-500",
                            appointment.status === "paused" && "bg-yellow-500",
                            appointment.status === "completed" && "bg-blue-500",
                            appointment.status === "cancelled" && "bg-red-500"
                          )}
                        >
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription>
                        ID: {appointment._id.substring(0, 8)}...
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            From:{" "}
                            {dayjs(appointment.startDate).format("MMM D, YYYY")}
                          </span>
                        </div>
                        {appointment.endDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              To:{" "}
                              {dayjs(appointment.endDate).format("MMM D, YYYY")}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {appointment.startTime} - {appointment.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {appointment.appointmentIds.length} appointments
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <div className="p-4 pt-0 flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/business/${businessId}/recurring-appointments/${appointment._id}`
                          )
                        }
                      >
                        View Details
                      </Button>

                      {appointment.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(appointment._id, "paused")
                          }
                        >
                          Pause
                        </Button>
                      )}

                      {appointment.status === "paused" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(appointment._id, "active")
                          }
                        >
                          Resume
                        </Button>
                      )}

                      {(appointment.status === "active" ||
                        appointment.status === "paused") && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(appointment._id, "cancelled")
                          }
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No recurring appointments found
                </h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  {searchQuery
                    ? "No recurring appointments match your search criteria"
                    : "You haven't created any recurring appointments yet"}
                </p>
                <Button
                  onClick={() =>
                    router.push(
                      `/business/${businessId}/appointments/create?recurring=true`
                    )
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Recurring Appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
