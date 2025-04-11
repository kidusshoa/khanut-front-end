"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";

export default function BusinessRegistration() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    businessAddress: "",
    businessType: "",
    acceptTerms: false,
  });

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.businessName) newErrors.businessName = "Business name is required";
    if (!formData.businessAddress) newErrors.businessAddress = "Business address is required";
    if (!formData.businessType) newErrors.businessType = "Business type is required";
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://khanut.onrender.com/api/auth/register",
        {
          name: formData.name,
          email: formData.email,
          role: "business",
          password: formData.password,
          businessName: formData.businessName,
          businessAddress: formData.businessAddress,
          businessType: formData.businessType,
        }
      );

      if (response.status === 201) {
        router.push("/verify");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({
        email: "This email may already be in use",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create Business Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign up as a business owner
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form fields here - similar to your existing form but with business fields */}
          </form>
        </div>
      </div>
    </div>
  );
}