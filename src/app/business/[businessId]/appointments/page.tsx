"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { appointmentApi } from "@/services/appointment";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function BusinessAppointmentsPage({
  params: { businessId },
}: {
  params: { businessId: string };
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        
        const params: any = {};
        if (activeTab !== "all") {
          params.status = activeTab;
        }
        
        if (selectedDate) {
          params.date = format(selectedDate, "yyyy-MM-dd");
        }
        
        const data = await appointmentApi.getBusinessAppointments(businessId, params);
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [businessId, activeTab, selectedDate]);

  const handleStatusChange = async (appointmentId: string, status: string) => {
    try {
      await appointmentApi.updateAppointmentStatus(appointmentId, status);
      
      // Update local state
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status }
            : appointment
        )
      );
      
      toast.success(`Appointment ${status}`);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Failed to update appointment status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Manage Appointments</h1>
        
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
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
          ) : appointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.map((appointment) => (
                <Card key={appointment._id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">
                          {appointment.serviceId?.name || "Service"}
                        </h3>
                        {getStatusBadge(appointment.status)}
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-600">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          <span>{format(new Date(appointment.date), "PPP")}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>
                            {appointment.startTime} - {appointment.endTime}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span>
                            {appointment.customerId?.name || "Customer"}
                          </span>
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="bg-gray-50 p-2 rounded-md text-sm text-gray-600 mb-4">
                          <p className="font-medium mb-1">Notes:</p>
                          <p>{appointment.notes}</p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {appointment.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleStatusChange(appointment._id, "confirmed")}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleStatusChange(appointment._id, "cancelled")}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        
                        {appointment.status === "confirmed" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleStatusChange(appointment._id, "completed")}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleStatusChange(appointment._id, "cancelled")}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        
                        {(appointment.status === "cancelled" || appointment.status === "completed") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/business/${businessId}/appointments/${appointment._id}`)}
                          >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No appointments found
              </h3>
              <p className="text-gray-500 mb-6">
                {activeTab === "all"
                  ? "You don't have any appointments yet."
                  : `You don't have any ${activeTab} appointments.`}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
