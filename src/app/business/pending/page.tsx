"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/auth";

export default function BusinessPendingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no user is logged in, redirect to login
    if (!user) {
      router.push("/login");
      return;
    }

    const checkStatus = async () => {
      try {
        setIsChecking(true);
        setError(null);

        // Get the business status
        const data = await authService.getBusinessStatus();
        console.log("Business status:", data);
        setLastChecked(new Date());

        // If business is approved, redirect to the business dashboard
        if (data.status === "approved") {
          router.push(`/business/${data.businessId}/dashboard`);
        } else if (data.status === "rejected") {
          setError("Your business registration has been rejected. Please contact support for more information.");
        }
      } catch (error: any) {
        console.error("Error checking business status:", error);
        setError("Failed to check business status. Please try again later.");
      } finally {
        setIsChecking(false);
      }
    };

    // Check immediately on page load
    checkStatus();

    // Then check periodically
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [router, user]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-orange-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Application Under Review
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Your business registration is pending approval. We'll notify you once it's approved.
            </p>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md p-4">
                {error}
              </div>
            )}

            {isChecking ? (
              <div className="flex justify-center items-center mt-4">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500 mr-2" />
                <span className="text-sm text-gray-500">Checking status...</span>
              </div>
            ) : lastChecked ? (
              <div className="text-xs text-gray-500 mt-4">
                Last checked: {lastChecked.toLocaleTimeString()}
              </div>
            ) : null}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                This page will automatically refresh when your application is approved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
