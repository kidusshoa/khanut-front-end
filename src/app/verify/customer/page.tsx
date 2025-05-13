"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CustomerTwoFactorVerification } from "../../../components/CustomerTwoFactorVerification";
import { useAuthStore } from "@/store/authStore";

export default function CustomerVerifyPage() {
  const router = useRouter();
  const tempEmail = useAuthStore((state) => state.tempEmail);
  const tempRole = useAuthStore((state) => state.tempRole);

  useEffect(() => {
    // If no tempEmail or wrong role, redirect back to registration
    if (!tempEmail || tempRole !== "customer") {
      router.push("/register/customer");
    }
  }, [tempEmail, tempRole, router]);

  if (!tempEmail || tempRole !== "customer") {
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
        <CustomerTwoFactorVerification />
      </div>
    </div>
  );
}
