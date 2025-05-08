import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import dayjs from "dayjs";
// Replaced date-fns with dayjs
import {
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  CalendarClock,
} from "lucide-react";

interface Appointment {
  _id: string;
  appointmentNumber: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    profilePicture?: string;
  };
  businessId: string;
  serviceId: {
    _id: string;
    name: string;
    price: number;
    duration: number;
    images?: string[];
  };
  appointmentDate: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onStatusUpdate: (appointmentId: string, status: string) => Promise<void>;
}

export function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment,
  onStatusUpdate,
}: AppointmentDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(appointment.status);
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="mr-1 h-3 w-3" />
            Scheduled
          </Badge>
        );
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Calendar className="mr-1 h-3 w-3" />
            Confirmed
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      case "no_show":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <XCircle className="mr-1 h-3 w-3" />
            No Show
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };
  
  // Handle status update
  const handleStatusUpdate = async () => {
    if (selectedStatus === appointment.status) return;
    
    try {
      setIsUpdating(true);
      await onStatusUpdate(appointment._id, selectedStatus);
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Get available status options based on current status
  const getStatusOptions = () => {
    switch (appointment.status) {
      case "scheduled":
        return [
          { value: "scheduled", label: "Scheduled" },
          { value: "confirmed", label: "Confirmed" },
          { value: "cancelled", label: "Cancelled" },
        ];
      case "confirmed":
        return [
          { value: "confirmed", label: "Confirmed" },
          { value: "completed", label: "Completed" },
          { value: "no_show", label: "No Show" },
          { value: "cancelled", label: "Cancelled" },
        ];
      case "completed":
        return [{ value: "completed", label: "Completed" }];
      case "cancelled":
        return [{ value: "cancelled", label: "Cancelled" }];
      case "no_show":
        return [{ value: "no_show", label: "No Show" }];
      default:
        return [];
    }
  };
  
  const appointmentDate = dayjs(appointment.appointmentDate);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Appointment Details</span>
            {getStatusBadge(appointment.status)}
          </DialogTitle>
          <DialogDescription>
            Appointment #{appointment.appointmentNumber}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Appointment Time */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Date & Time</h3>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  {dayjs(appointmentDate).format("EEEE, MMMM d, yyyy")}
                </div>
                <div className="text-sm text-muted-foreground">
                  {dayjs(appointmentDate).format("h:mm A")}
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Customer Information */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Customer</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.customerId.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.customerId.email}</span>
              </div>
              {appointment.customerId.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{appointment.customerId.phone}</span>
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Service Information */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Service</h3>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                {appointment.serviceId.images && appointment.serviceId.images.length > 0 ? (
                  <img
                    src={appointment.serviceId.images[0]}
                    alt={appointment.serviceId.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium">{appointment.serviceId.name}</div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-muted-foreground">
                    {appointment.serviceId.duration} minutes
                  </span>
                  <span className="font-medium">${appointment.serviceId.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {appointment.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">Notes</h3>
                <p className="text-sm">{appointment.notes}</p>
              </div>
            </>
          )}
          
          <Separator />
          
          {/* Booking Information */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Booking Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Booked on:</div>
              <div>{dayjs(dayjs(appointment.createdAt)).format("MMM D, YYYY")}</div>
              
              <div className="text-muted-foreground">Last updated:</div>
              <div>{dayjs(dayjs(appointment.updatedAt)).format("MMM D, YYYY")}</div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
          <div className="flex-grow">
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              disabled={
                appointment.status === "completed" || 
                appointment.status === "cancelled" || 
                appointment.status === "no_show"
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                {getStatusOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={
                isUpdating ||
                selectedStatus === appointment.status ||
                appointment.status === "completed" ||
                appointment.status === "cancelled" ||
                appointment.status === "no_show"
              }
            >
              Update Status
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
