"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  BusinessRegistrationInput,
  businessRegistrationSchema,
} from "@/lib/validations/auth";
import { useAuthStore } from "@/store/authStore";
import { businessService } from "@/services/business";

export default function BusinessRegistrationForm() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    setError,
  } = useForm<BusinessRegistrationInput>({
    resolver: zodResolver(businessRegistrationSchema),
    defaultValues: {
      email: user?.email,
      location: {
        coordinates: [0, 0],
      },
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("profilePicture", {
          type: "manual",
          message: "Image size should be less than 5MB",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setValue("profilePicture", file);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: BusinessRegistrationInput) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "location") {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined) {
          formData.append(key, value);
        }
      });

      await businessService.register(formData);
      router.push("/business/pending");
    } catch (error: any) {
      setError("root", {
        type: "manual",
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Business Name
        </label>
        <input
          {...register("name")}
          type="text"
          className={`mt-1 block w-full rounded-md border ${
            errors.name ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">
            {errors.name.message?.toString()}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Business Email
        </label>
        <input
          {...register("email")}
          type="email"
          disabled
          className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700"
        >
          Phone Number
        </label>
        <input
          {...register("phone")}
          type="tel"
          className={`mt-1 block w-full rounded-md border ${
            errors.phone ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">
            {errors.phone.message?.toString()}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Business Description
        </label>
        <textarea
          {...register("description")}
          rows={4}
          className={`mt-1 block w-full rounded-md border ${
            errors.description ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message?.toString()}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Profile Picture
        </label>
        <div className="mt-1 flex items-center">
          <label
            htmlFor="profile-picture"
            className="cursor-pointer flex items-center justify-center w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-500"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Upload className="h-8 w-8 text-gray-400" />
            )}
          </label>
          <input
            id="profile-picture"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
        {errors.profilePicture && (
          <p className="mt-1 text-sm text-red-600">
            {errors.profilePicture.message?.toString()}
          </p>
        )}
      </div>

      {errors.root && (
        <p className="text-sm text-red-600 text-center">
          {errors.root.message?.toString()}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
      >
        {isSubmitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          "Submit Registration"
        )}
      </button>
    </form>
  );
}
