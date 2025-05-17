"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaffAvailabilityCalendar } from "@/components/business/StaffAvailabilityCalendar";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { staffApi } from "@/services/staff";
import { Staff } from "@/lib/types/staff";

export default function StaffAvailabilityPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.businessId as string;
  const staffId = params.staffId as string;
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [staff, setStaff] = useState<Staff | null>(null);

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
        // Fetch staff details to verify they belong to this business
        const staffData = await staffApi.getStaffById(staffId);

        if (staffData.businessId !== businessId) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        setStaff(staffData);
        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking authorization:", error);
        setIsAuthorized(false);
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [session, status, businessId, staffId, router]);

  if (isLoading) {
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
            onClick={() => router.push(`/business/${businessId}/staff`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Staff Management
          </Button>
        </div>

        <StaffAvailabilityCalendar businessId={businessId} staffId={staffId} />
      </div>
    </DashboardLayout>
  );
}
