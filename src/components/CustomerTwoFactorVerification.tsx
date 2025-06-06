"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { TwoFactorInput, twoFactorSchema } from "@/lib/validations/auth";
import { Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import { authService } from "@/services/auth";

export function CustomerTwoFactorVerification() {
  const router = useRouter();
  const { tempEmail, tempRole, setUser, setAccessToken } = useAuthStore();

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
      router.push("/register/customer");
      return;
    }

    if (!tempEmail) {
      router.push("/register/customer");
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
    if (!tempEmail || tempRole !== "customer") {
      router.push("/register/customer");
      return;
    }

    try {
      // Use the authService instead of direct fetch
      const result = await authService.verify2FA(tempEmail, data.code);

      // Check if the response contains the expected data
      if (!result.user || !result.accessToken) {
        console.error("Incomplete verification response:", result);
        setError("code", {
          type: "manual",
          message: "Verification failed. Please try again.",
        });
        return;
      }

      // Update auth store with user data and token
      setUser(result.user);
      setAccessToken(result.accessToken);

      // Store tokens in cookies for persistence
      Cookies.set("client-token", result.accessToken);
      if (result.refreshToken) {
        Cookies.set("refresh-token", result.refreshToken);
      }

      // Redirect to login after successful verification
      router.push("/login");
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
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700"
          >
            Verification Code
          </label>
          <input
            {...register("code")}
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter 6-digit code"
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Verify"
          )}
        </button>
      </form>

      <div className="text-center mt-4">
        <button
          onClick={handleResend}
          disabled={resendDisabled || resendCount >= 3}
          className="text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
        >
          {resendDisabled
            ? `Resend code in ${countdown}s`
            : `Resend code (${3 - resendCount} attempts remaining)`}
        </button>
      </div>
    </div>
  );
}
