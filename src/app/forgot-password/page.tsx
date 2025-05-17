"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Mail,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import {
  forgotPasswordSchema,
  ForgotPasswordInput,
} from "@/lib/validations/auth";
import { authService } from "@/services/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [resendAttempted, setResendAttempted] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(data.email);
      setEmail(data.email);
      setIsSuccess(true);
    } catch (error: any) {
      console.error("Forgot password error:", error);
      setError("email", {
        type: "manual",
        message: "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;

    setIsSubmitting(true);
    setResendAttempted(true);

    try {
      await authService.forgotPassword(email);
      // Start a 60-second countdown for the resend button
      setResendCountdown(60);
      const countdownInterval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      console.error("Resend reset link error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href="/login"
          className="flex items-center text-sm text-gray-600 mb-8 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Link>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isSuccess ? "Check your email" : "Reset your password"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSuccess
            ? `We've sent a password reset link to ${email}`
            : "Enter your email address and we'll send you a link to reset your password"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isSuccess ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Email sent successfully
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Please check your email for instructions on how to reset
                    your password. If you don't see it in your inbox, please
                    check your spam folder.
                  </p>
                </div>
                <div className="mt-5 space-y-3">
                  {/* Resend button */}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isSubmitting || resendCountdown > 0}
                    className="inline-flex justify-center w-full rounded-md border border-orange-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-orange-600 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : resendCountdown > 0 ? (
                      `Resend link (${resendCountdown}s)`
                    ) : (
                      "Didn't receive the email? Resend"
                    )}
                  </button>

                  {/* Return to login button */}
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:text-sm"
                  >
                    Return to login
                  </button>

                  {/* Resend success message */}
                  {resendAttempted && resendCountdown > 0 && (
                    <p className="text-sm text-green-600 text-center mt-2">
                      Reset link has been resent to your email.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`appearance-none block w-full pl-10 px-3 py-2 border ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm`}
                  />
                  {errors.email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Send reset link"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
