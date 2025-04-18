"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Building, 
  XCircle, 
  Loader2,
  CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { appointmentApi } from "@/services/appointment";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

export default function CustomerAppointmentsPage({
  params: { customerId },
}: {
  params: { customerId: string };
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Check if user is authorized to view this page
  if (session?.user?.id !== customerId) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized</h1>
        <p className="text-gray-600 mb-6">You don't have permission to view this page.</p>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        
        const params: any = {};
        if (activeTab !== "all") {
          params.status = activeTab;
        }
        
        const data = await appointmentApi.getCustomerAppointments(customerId, params.status);
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [customerId, activeTab]);

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await appointmentApi.updateAppointmentStatus(appointmentId, "cancelled");
      
      // Update local state
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status: "cancelled" }
            : appointment
        )
      );
      
      toast.success("Appointment cancelled");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Failed to cancel appointment");
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(price);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        
        <Button 
          onClick={() => router.push(`/customer/${customerId}`)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          Book New Appointment
        </Button>
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
                          <Building className="h-4 w-4 mr-2" />
                          <span>
                            {appointment.businessId?.name || "Business"}
                          </span>
                        </div>
                        
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
                        
                        <div className="flex items-center font-medium">
                          {formatPrice(appointment.serviceId?.price || 0)}
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="bg-gray-50 p-2 rounded-md text-sm text-gray-600 mb-4">
                          <p className="font-medium mb-1">Notes:</p>
                          <p>{appointment.notes}</p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {(appointment.status === "pending" || appointment.status === "confirmed") && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleCancelAppointment(appointment._id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/customer/${customerId}/appointments/${appointment._id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <CalendarDays className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No appointments found
              </h3>
              <p className="text-gray-500 mb-6">
                {activeTab === "all"
                  ? "You don't have any appointments yet."
                  : `You don't have any ${activeTab} appointments.`}
              </p>
              <Button 
                onClick={() => router.push(`/customer/${customerId}`)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Book Your First Appointment
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
