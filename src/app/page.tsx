"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Cookies from "js-cookie";

export default function LandingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!session?.user) return;

      const role = session.user.role;
      const userId = session.user.id;

      if (!role || !userId) return;

      switch (role) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "business":
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/business/status`,
              {
                headers: {
                  Authorization: `Bearer ${session.accessToken}`,
                },
              }
            );

            if (!response.ok) {
              throw new Error("Failed to check business status");
            }

            const { status } = await response.json();
            if (status === "approved") {
              router.push("/business/dashboard");
            } else {
              router.push("/business/pending");
            }
          } catch (error) {
            console.error("Error checking business status:", error);
            router.push("/business/pending");
          }
          break;
        case "customer":
          router.push("/customer/dashboard");
          break;
      }
    };

    checkUserStatus();
  }, [session, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-gray-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Welcome to </span>
                  <span className="block text-orange-600 xl:inline">
                    Khanut
                  </span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Discover and connect with local businesses in your area
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      href="/login"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 md:py-4 md:text-lg md:px-10"
                    >
                      Login
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      href="/register"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 md:py-4 md:text-lg md:px-10"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-orange-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to find local businesses
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {/* Add feature items here */}
              {[
                {
                  title: "Discover Local Businesses",
                  description:
                    "Find and explore businesses in your local area with ease.",
                },
                {
                  title: "Real Reviews",
                  description:
                    "Read authentic reviews from verified customers.",
                },
                {
                  title: "Easy Connection",
                  description:
                    "Connect directly with business owners through our platform.",
                },
                {
                  title: "Business Management",
                  description:
                    "Powerful tools for business owners to manage their presence.",
                },
              ].map((feature, index) => (
                <div key={index} className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                      {/* You can add icons here */}
                      {index + 1}
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                      {feature.title}
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
