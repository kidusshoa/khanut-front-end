"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentDetail } from "@/components/customer/AppointmentDetail";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";
import { appointmentApi } from "@/services/appointment";
import { toast } from "react-hot-toast";

export default function AppointmentDetailPage() {
  const router = useRouter();
  const { customerId, appointmentId } = useParams<{ customerId: string; appointmentId: string }>();
  const { data: session, status } = useSession();
  
  // Check if user is authorized to view this page
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id !== customerId) {
      toast.error("You don't have permission to view this page");
      router.push(`/customer/${session.user.id}/appointments`);
    }
  }, [session, status, customerId, router]);

  // Fetch appointment details
  const { 
    data: appointment, 
    isLoading, 
    isError,
    refetch 
  } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: () => appointmentApi.getAppointmentById(appointmentId),
    enabled: !!appointmentId && status === "authenticated",
  });

  const handleAppointmentUpdate = () => {
    refetch();
  };

  if (status === "loading" || isLoading) {
    return (
      <CustomerDashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </CustomerDashboardLayout>
    );
  }

  if (isError) {
    return (
      <CustomerDashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push(`/customer/${customerId}/appointments`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Appointment Details</h1>
          </div>
          
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <p>Failed to load appointment details. Please try again later.</p>
          </div>
          
          <Button 
            onClick={() => refetch()}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Retry
          </Button>
        </div>
      </CustomerDashboardLayout>
    );
  }

  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push(`/customer/${customerId}/appointments`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Appointment Details</h1>
        </div>
        
        {appointment && (
          <AppointmentDetail 
            appointment={appointment} 
            customerId={customerId}
            onAppointmentUpdate={handleAppointmentUpdate}
          />
        )}
      </div>
    </CustomerDashboardLayout>
  );
}
