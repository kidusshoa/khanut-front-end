"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BusinessTwoFactorVerification } from "@/components/BusinessTwoFactorVerification";
import { useAuthStore } from "@/store/auth";

export default function BusinessVerifyPage() {
  const router = useRouter();
  const tempEmail = useAuthStore((state) => state.tempEmail);
  const tempRole = useAuthStore((state) => state.tempRole);

  useEffect(() => {
    // If no tempEmail or wrong role, redirect back to registration
    if (!tempEmail || tempRole !== "business") {
      router.push("/register/business-owner");
    }
  }, [tempEmail, tempRole, router]);

  if (!tempEmail || tempRole !== "business") {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a verification code to {tempEmail}
        </p>
        <BusinessTwoFactorVerification />
      </div>
    </div>
  );
}
