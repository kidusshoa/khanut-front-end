"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Loader2, Mail, Lock, AlertCircle, Store } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Cookies from "js-cookie";
import axios from "axios";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function BusinessLoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // First, try direct API login to get the token
      const apiResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          email: data.email,
          password: data.password,
        }
      );

      const { accessToken, refreshToken, userId, role } = apiResponse.data;

      // If not a business account, show error
      if (role !== "business") {
        setError(
          "This is not a business account. Please use a business account to log in."
        );
        setIsSubmitting(false);
        return;
      }

      // Store tokens in cookies - always use 30 days to prevent logout on refresh
      const expirationDays = 30;

      console.log(
        "Setting business auth cookies with expiration:",
        expirationDays,
        "days"
      );

      // Set cookies with consistent options
      const cookieOptions = {
        expires: expirationDays,
        sameSite: "lax", // Changed from strict to lax to allow cross-site navigation
        secure: process.env.NODE_ENV === "production",
        path: "/", // Ensure cookies are available across the site
      };

      // Set all required cookies
      Cookies.set("client-token", accessToken, cookieOptions);
      Cookies.set("refresh-token", refreshToken, cookieOptions);
      Cookies.set("user-role", role, cookieOptions);
      Cookies.set("user-id", userId, cookieOptions);

      // Also store in localStorage as backup
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userId", userId);

      // Now use NextAuth to establish a session
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      // Check business approval status
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/business/status`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          console.error("Business status check failed:", response.status);
          // Store token in localStorage for other components to use
          localStorage.setItem("accessToken", accessToken);
          router.push(`/business/${userId}/pending`);
          return;
        }

        const statusData = await response.json();

        // Store token in localStorage for other components to use
        localStorage.setItem("accessToken", accessToken);

        if (statusData.status === "approved" && statusData.approved === true) {
          router.push(`/business/${userId}/dashboard`);
        } else {
          router.push(`/business/${userId}/pending`);
        }
      } catch (error) {
        console.error("Error checking business status:", error);
        // Store token in localStorage for other components to use
        localStorage.setItem("accessToken", accessToken);
        router.push(`/business/${userId}/pending`);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.message || "Login failed. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Khanut Logo"
              width={80}
              height={80}
              className="h-20 w-auto"
            />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Business Login
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to your business account
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-orange-600 hover:text-orange-500"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t px-6 py-4">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have a business account?{" "}
              <Link
                href="/register/business-owner"
                className="font-medium text-orange-600 hover:text-orange-500"
              >
                Register now
              </Link>
            </p>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              <Link
                href="/login"
                className="font-medium text-orange-600 hover:text-orange-500"
              >
                Customer login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
