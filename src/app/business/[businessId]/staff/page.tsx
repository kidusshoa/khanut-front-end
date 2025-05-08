"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaffManagement } from "@/components/business/StaffManagement";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function BusinessStaffPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const [businessId, setBusinessId] = useState<string>("");

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setBusinessId(resolvedParams.businessId);
      } catch (error) {
        console.error("Error resolving params:", error);
      }
    };

    resolveParams();
  }, [params]);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

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
            onClick={() => router.push(`/business/${businessId}`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Business
          </Button>
        </div>

        <StaffManagement businessId={businessId} />
      </div>
    </DashboardLayout>
  );
}
