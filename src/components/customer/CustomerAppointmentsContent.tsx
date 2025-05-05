"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Calendar } from "lucide-react";
import { AppointmentList } from "@/components/customer/AppointmentList";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";

export default function CustomerAppointmentsContent({
  customerId,
}: {
  customerId: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Appointments</h1>
          <p className="text-muted-foreground">
            View and manage your appointments
          </p>
        </div>

        <AppointmentList customerId={customerId} />
      </div>
    </CustomerDashboardLayout>
  );
}
