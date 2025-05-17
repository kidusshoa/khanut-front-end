"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Building,
  User,
  CreditCard,
  MessageSquare,
  ExternalLink,
  Pencil,
} from "lucide-react";
import { ChapaPaymentButton } from "@/components/payment/ChapaPaymentButton";
import dayjs from "dayjs";
// Replaced date-fns with dayjs
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { Appointment, appointmentApi } from "@/services/appointment";
import { paymentApi } from "@/services/payment";

interface AppointmentDetailProps {
  appointment: Appointment;
  customerId: string;
  onAppointmentUpdate?: () => void;
}

export function AppointmentDetail({
  appointment,
  customerId,
  onAppointmentUpdate,
}: AppointmentDetailProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      const date = dayjs(dateString);
      return dayjs(date).format("MMMM D, YYYY");
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
  const getStatusBadge = (status: string) => {
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

  // Handle payment
  const handlePayment = async () => {
    try {
      setIsLoading(true);
      console.log("Initializing payment for appointment:", appointment._id);

      const response = await paymentApi.initializeAppointmentPayment(
        appointment._id
      );

      console.log("Payment initialization response:", response);

      // Check for checkout_url in different possible response formats
      const checkoutUrl = response.data?.checkout_url;

      if (checkoutUrl) {
        console.log("Redirecting to checkout URL:", checkoutUrl);
        // Redirect to Chapa checkout
        window.location.href = checkoutUrl;
      } else {
        console.error("No checkout URL found in response:", response);
        toast.error("Failed to initialize payment: No checkout URL provided");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(
        "Failed to process payment: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async () => {
    try {
      setIsLoading(true);
      console.log("Cancelling appointment:", appointment._id);

      // Make sure we have a valid appointment ID
      if (!appointment._id) {
        throw new Error("Invalid appointment ID");
      }

      // Add the reason if provided
      const payload = cancelReason ? { reason: cancelReason } : undefined;

      // First try to use the cancelAppointment method if it exists
      try {
        if (typeof appointmentApi.cancelAppointment === "function") {
          await appointmentApi.cancelAppointment(appointment._id, payload);
        } else {
          // Fall back to updateAppointmentStatus
          await appointmentApi.updateAppointmentStatus(
            appointment._id,
            "cancelled"
          );
        }
      } catch (innerError) {
        console.error(
          "First cancellation method failed, trying alternative:",
          innerError
        );
        // If the first method fails, try the alternative
        await appointmentApi.updateAppointmentStatus(
          appointment._id,
          "cancelled"
        );
      }

      toast.success("Appointment cancelled successfully");
      setShowCancelDialog(false);

      // Update the appointment status locally to avoid needing a refresh
      appointment.status = "cancelled";

      if (onAppointmentUpdate) onAppointmentUpdate();
    } catch (error) {
      console.error("Cancel appointment error:", error);
      toast.error(
        "Failed to cancel appointment: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Get service name
  const getServiceName = () => {
    if (typeof appointment.serviceId === "string") {
      return "Service";
    } else {
      return appointment.serviceId.name;
    }
  };

  // Get business name
  const getBusinessName = () => {
    if (typeof appointment.businessId === "string") {
      return "Business";
    } else {
      return appointment.businessId.name;
    }
  };

  // Get service price
  const getServicePrice = () => {
    if (typeof appointment.serviceId === "string") {
      return 0;
    } else {
      return appointment.serviceId.price;
    }
  };

  // Get service duration
  const getServiceDuration = () => {
    if (typeof appointment.serviceId === "string") {
      return 0;
    } else {
      return appointment.serviceId.duration;
    }
  };

  // Check if appointment can be cancelled
  const canCancel = ["pending", "confirmed"].includes(appointment.status);

  // Check if appointment is in the future
  const isUpcoming = () => {
    try {
      const appointmentDate = dayjs(appointment.date);
      const [hours, minutes] = appointment.startTime.split(":");
      const appointmentDateTime = appointmentDate
        .hour(parseInt(hours))
        .minute(parseInt(minutes))
        .toDate();

      return dayjs(appointmentDateTime).isAfter(dayjs());
    } catch (error) {
      return false;
    }
  };

  // Check if appointment needs payment
  const needsPayment =
    appointment.status === "pending" && getServicePrice() > 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <CardTitle className="text-xl">{getServiceName()}</CardTitle>
            <CardDescription>
              Booked for {formatDate(appointment.date)}
            </CardDescription>
          </div>
          {getStatusBadge(appointment.status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Appointment Time */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Appointment Time</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{formatDate(appointment.date)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="font-medium">
                {formatTime(appointment.startTime)} -{" "}
                {formatTime(appointment.endTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div>
          <h3 className="font-medium mb-3">Service Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Service</span>
              </div>
              <p className="text-sm">{getServiceName()}</p>
            </div>
            <div className="p-3 border rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Duration</span>
              </div>
              <p className="text-sm">{getServiceDuration()} minutes</p>
            </div>
            <div className="p-3 border rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Price</span>
              </div>
              <p className="text-sm">
                {getServicePrice() > 0
                  ? `${getServicePrice().toLocaleString()} ETB`
                  : "Free"}
              </p>
            </div>
            <div className="p-3 border rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Business</span>
              </div>
              <p className="text-sm">{getBusinessName()}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {appointment.notes && (
          <div>
            <h3 className="font-medium mb-3">Notes</h3>
            <div className="p-3 border rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Your Notes</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{appointment.notes}</p>
            </div>
          </div>
        )}

        {/* Business Information */}
        <div>
          <h3 className="font-medium mb-3">Business Information</h3>
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() =>
              router.push(
                `/customer/${customerId}/businesses/${
                  typeof appointment.businessId === "string"
                    ? appointment.businessId
                    : appointment.businessId._id
                }`
              )
            }
          >
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                <Building className="h-4 w-4 text-gray-500" />
              </div>
              <span>{getBusinessName()}</span>
            </div>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-3 pt-0">
        {needsPayment && (
          <ChapaPaymentButton
            appointmentId={appointment._id}
            amount={getServicePrice()}
            customerEmail={
              typeof appointment.customerId === "string"
                ? ""
                : appointment.customerId.email || ""
            }
            customerName={
              typeof appointment.customerId === "string"
                ? "Customer"
                : appointment.customerId.name || "Customer"
            }
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
            onSuccess={(txRef) => {
              toast.success("Payment initiated successfully!");
              console.log(
                "Payment initiated with transaction reference:",
                txRef
              );
            }}
            onError={(error) => {
              toast.error("Payment initialization failed. Please try again.");
              console.error("Payment error:", error);
            }}
          />
        )}

        {isUpcoming() && appointment.status === "confirmed" && (
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() =>
              router.push(
                `/customer/${customerId}/appointments/${appointment._id}/reschedule`
              )
            }
          >
            <Pencil className="mr-2 h-4 w-4" />
            Reschedule
          </Button>
        )}

        {canCancel && (
          <>
            <Button
              variant="outline"
              className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950"
              onClick={() => setShowCancelDialog(true)}
              disabled={isLoading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Appointment
            </Button>

            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Appointment</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel this appointment? This
                    action cannot be undone.
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <label className="text-sm font-medium mb-2 block">
                    Reason for cancellation (optional)
                  </label>
                  <Textarea
                    placeholder="Please provide a reason for cancellation"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelDialog(false)}
                    disabled={isLoading}
                  >
                    Keep Appointment
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancelAppointment}
                    disabled={isLoading}
                  >
                    {isLoading ? "Cancelling..." : "Cancel Appointment"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
