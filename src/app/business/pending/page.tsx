"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";

export default function PendingApproval() {
  const router = useRouter();

  useEffect(() => {
    // Check approval status periodically
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/business/status");
        const data = await response.json();
        if (data.approved) {
          router.push("/business/dashboard");
        }
      } catch (error) {
        console.error("Failed to check status:", error);
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
            <Clock className="mx-auto h-12 w-12 text-orange-500" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Business Account Pending Approval
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your business account is currently under review. We'll notify you
              once it's approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
