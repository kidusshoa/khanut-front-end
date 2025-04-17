"use client";

import { useRouter } from "next/navigation";
import { User, Briefcase } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Create an Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Choose your account type
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <button
              onClick={() => router.push("/register/customer")}
              className="w-full flex items-center justify-center px-4 py-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <User className="mr-3 h-6 w-6" />
              Create Customer Account
            </button>

            <button
              onClick={() => router.push("/register/business-owner")}
              className="w-full flex items-center justify-center px-4 py-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Briefcase className="mr-3 h-6 w-6" />
              Create Business Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
