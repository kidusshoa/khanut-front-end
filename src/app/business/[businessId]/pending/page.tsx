"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function PendingApprovalPage({
  params: { businessId },
}: {
  params: { businessId: string };
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isChecking, setIsChecking] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Skip if still loading session
    if (status === "loading") {
      return;
    }

    const checkStatus = async () => {
      try {
        setIsChecking(true);

        // Use session token for authentication
        if (!session?.user) {
          console.error("No session available");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/business/status`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            // Unauthorized, redirect to login
            router.push("/login");
            return;
          }
          throw new Error("Failed to check status");
        }

        const data = await response.json();
        console.log("Business status:", data);
        setLastChecked(new Date());

        if (data.status === "approved" && data.approved === true) {
          // If approved, redirect to the business dashboard
          router.push(`/business/${businessId}/dashboard`);
        }
      } catch (error) {
        console.error("Error checking status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    // Check immediately on page load
    checkStatus();

    // Then check periodically
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [router, businessId, session, status]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Application Under Review
            </h2>
            <p className="text-gray-600 mb-6">
              Your business registration is pending approval. We'll notify you
              once it's approved.
            </p>

            {isChecking ? (
              <div className="flex justify-center items-center mt-4">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500 mr-2" />
                <span className="text-sm text-gray-500">
                  Checking status...
                </span>
              </div>
            ) : lastChecked ? (
              <div className="text-xs text-gray-500 mt-4">
                Last checked: {lastChecked.toLocaleTimeString()}
              </div>
            ) : null}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                This page will automatically refresh when your application is
                approved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
