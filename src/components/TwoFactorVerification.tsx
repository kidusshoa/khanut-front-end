"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { TwoFactorInput, twoFactorSchema } from "@/lib/validations/auth";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function TwoFactorVerification() {
  const router = useRouter();
  const tempEmail = useAuthStore((state) => state.tempEmail);
  const userRole = useAuthStore((state) => state.tempRole);
  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const [resendCount, setResendCount] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<TwoFactorInput>({
    resolver: zodResolver(twoFactorSchema),
  });

  const handleResend = async () => {
    if (resendCount >= 3) {
      router.push("/register");
      return;
    }

    if (!tempEmail) {
      router.push("/register");
      return;
    }

    try {
      await authService.resendCode(tempEmail);
      setResendCount((prev) => prev + 1);
      setResendDisabled(true);

      let count = 30;
      const timer = setInterval(() => {
        count--;
        setCountdown(count);
        if (count === 0) {
          setResendDisabled(false);
          clearInterval(timer);
        }
      }, 1000);
    } catch (error) {
      console.error("Failed to resend code:", error);
    }
  };

  const onSubmit = async (data: TwoFactorInput) => {
    if (!tempEmail) {
      router.push("/register");
      return;
    }

    try {
      const response = await authService.verify2FA(tempEmail, data.code);

      // Check if the response contains the expected data
      if (!response.user || !response.accessToken) {
        console.error("Incomplete verification response:", response);
        setError("code", {
          type: "manual",
          message: "Verification failed. Please try again.",
        });
        return;
      }

      // Update auth store with user data and token
      setUser(response.user);
      setAccessToken(response.accessToken);

      // Store tokens in cookies for persistence
      Cookies.set("client-token", response.accessToken);
      if (response.refreshToken) {
        Cookies.set("refresh-token", response.refreshToken);
      }

      // Store user role in cookie for easier access
      Cookies.set("user-role", response.user.role);
      Cookies.set("user-id", response.user.id);

      // Route based on role
      if (response.user.role === "business") {
        router.push(`/business/register/${response.user.id}`);
      } else if (response.user.role === "customer") {
        router.push("/login"); // Redirect customers to login page
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Verification error:", error);

      // Provide more specific error messages based on the error
      if (error.response?.status === 400) {
        setError("code", {
          type: "manual",
          message: error.response.data?.message || "Invalid or expired code",
        });
      } else {
        setError("code", {
          type: "manual",
          message: "Verification failed. Please try again.",
        });
      }
    }
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a 6-digit code to {tempEmail}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div>
          <input
            {...register("code")}
            type="text"
            maxLength={6}
            className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
              errors.code ? "border-red-500" : "border-gray-300"
            } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
            placeholder="Enter 6-digit code"
          />
          {errors.code && (
            <p className="mt-2 text-sm text-red-600">{errors.code.message}</p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              "Verify Code"
            )}
          </button>
        </div>
      </form>

      <div className="text-center mt-4">
        <button
          onClick={handleResend}
          disabled={resendDisabled || resendCount >= 3}
          className="text-orange-600 hover:text-orange-500 disabled:opacity-50"
        >
          {resendDisabled
            ? `Resend code in ${countdown}s`
            : `Resend code (${3 - resendCount} attempts remaining)`}
        </button>
      </div>
    </div>
  );
}
