"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function PendingApprovalPage({
  params: { businessId },
}: {
  params: { businessId: string };
}) {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/business/status`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
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

        if (data.status === "approved" && data.approved === true) {
          // If approved, redirect to the business dashboard
          router.push(`/business/${businessId}/dashboard`);
        }
      } catch (error) {
        console.error("Error checking status:", error);
      }
    };

    // Check immediately on page load
    checkStatus();

    // Then check periodically
    const interval = setInterval(checkStatus, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [router, businessId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Application Under Review
            </h2>
            <p className="text-gray-600">
              Your business registration is pending approval. We'll notify you
              once it's approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
