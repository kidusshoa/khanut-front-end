"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function PendingApprovalPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/business/status`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to check status");
        }

        const data = await response.json();
        if (data.status === "approved") {
          router.push("/business/dashboard");
        }
      } catch (error) {
        console.error("Error checking status:", error);
      }
    };

    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [router]);

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
