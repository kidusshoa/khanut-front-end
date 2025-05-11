"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function BusinessDashboardRedirect({ params }: any) {
  const router = useRouter();
  const resolvedParams =
    params instanceof Promise ? params : Promise.resolve(params);

  useEffect(() => {
    const redirect = async () => {
      try {
        const resolvedData = await resolvedParams;
        const businessId = resolvedData.businessId;

        // Redirect to the main business page
        router.replace(`/business/${businessId}`);
      } catch (error) {
        console.error("Error redirecting:", error);
        // If there's an error, redirect to the login page
        router.replace("/login");
      }
    };

    redirect();
  }, [resolvedParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
