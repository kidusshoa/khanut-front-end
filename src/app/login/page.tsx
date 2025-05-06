"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";
import axios from "axios";
import { loginSchema, LoginInput } from "@/lib/validations/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    try {
      // First, try direct API login to get the token
      const apiResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          email: data.email,
          password: data.password,
        }
      );

      // If API login is successful, store the token in cookies
      if (apiResponse.data && apiResponse.data.accessToken) {
        // Store tokens in cookies with expiration based on "Remember me"
        const expirationDays = rememberMe ? 30 : 1;
        Cookies.set("client-token", apiResponse.data.accessToken, {
          expires: expirationDays,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
        });
        Cookies.set("user-role", apiResponse.data.role, {
          expires: expirationDays,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
        });
        Cookies.set("user-id", apiResponse.data.userId, {
          expires: expirationDays,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
        });

        // Get user info from API response
        const role = apiResponse.data.role;
        const userId = apiResponse.data.userId;

        // Also perform NextAuth sign in for session management
        await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (!role || !userId) {
          router.push("/");
          return;
        }

        // Role-based redirect with business approval check
        switch (role) {
          case "admin":
            router.push(`/admin/${userId}/`);
            break;
          case "business":
            // Check business approval status
            try {
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/business/status`,
                {
                  headers: {
                    Authorization: `Bearer ${apiResponse.data.accessToken}`,
                  },
                }
              );

              if (!response.ok) {
                console.error("Business status check failed:", response.status);
                // Store token in localStorage for other components to use
                localStorage.setItem(
                  "accessToken",
                  apiResponse.data.accessToken
                );
                router.push(`/business/${userId}/pending`);
                return;
              }

              const data = await response.json();
              console.log("Business status response:", data);

              // Store token in localStorage for other components to use
              localStorage.setItem("accessToken", apiResponse.data.accessToken);

              if (data.status === "approved" && data.approved === true) {
                router.push(`/business/${userId}/dashboard`);
              } else {
                router.push(`/business/${userId}/pending`);
              }
            } catch (error) {
              console.error("Error checking business status:", error);
              // Store token in localStorage for other components to use
              localStorage.setItem("accessToken", apiResponse.data.accessToken);
              router.push(`/business/${userId}/pending`);
            }
            break;
          case "customer":
            router.push(`/customer/${userId}/`);
            break;
          default:
            router.push("/");
        }
      } else {
        // Handle API error
        setError("root", {
          type: "manual",
          message: "Invalid email or password",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("root", {
        type: "manual",
        message: axios.isAxiosError(error)
          ? error.response?.data?.message || "Invalid credentials"
          : "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            href="/register"
            className="font-medium text-orange-600 hover:text-orange-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
              <div className="flex justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-orange-600 hover:text-orange-500"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("password")}
                  type="password"
                  autoComplete="current-password"
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

            {errors.root && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {errors.root.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>
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
                  "Sign in"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
