"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  Lock,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import {
  resetPasswordSchema,
  ResetPasswordInput,
} from "@/lib/validations/auth";
import { authService } from "@/services/auth";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [tokenError, setTokenError] = useState("");

  const token = searchParams?.get("token") || "";
  const userId = searchParams?.get("id") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!token || !userId) {
        setTokenError("Invalid reset link. Please request a new one.");
        setIsValidating(false);
        return;
      }

      try {
        const result = await authService.validateResetToken(token, userId);
        if (result.valid) {
          setIsValidToken(true);
        } else {
          setTokenError(
            "This reset link has expired. Please request a new one."
          );
        }
      } catch (error) {
        console.error("Token validation error:", error);
        setTokenError(
          "This reset link is invalid or has expired. Please request a new one."
        );
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, userId]);

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsSubmitting(true);
    try {
      await authService.resetPassword(token, userId, data.password);
      setIsSuccess(true);
    } catch (error: any) {
      console.error("Reset password error:", error);
      setError("password", {
        type: "manual",
        message: "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Validating your reset link
          </h2>
          <div className="mt-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken && !isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Invalid Reset Link
          </h2>
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Reset link error
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{tokenError}</p>
                  </div>
                  <div className="mt-5">
                    <Link
                      href="/forgot-password"
                      className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:text-sm"
                    >
                      Request a new reset link
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          {isSuccess ? "Password reset successful" : "Reset your password"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSuccess
            ? "Your password has been reset successfully"
            : "Create a new password for your account"}
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
                  Password reset successful
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Your password has been reset successfully. You can now log
                    in with your new password.
                  </p>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:text-sm"
                  >
                    Go to login
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("password")}
                    type="password"
                    autoComplete="new-password"
                    className={`appearance-none block w-full pl-10 px-3 py-2 border ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm`}
                  />
                  {errors.password && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("confirmPassword")}
                    type="password"
                    autoComplete="new-password"
                    className={`appearance-none block w-full pl-10 px-3 py-2 border ${
                      errors.confirmPassword
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm`}
                  />
                  {errors.confirmPassword && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword.message}
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
                    "Reset Password"
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Loading...
            </h2>
            <div className="mt-8 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
