"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export default function SignUpForm({ onClick }: any) {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    // if (!formData.acceptTerms) {
    //   newErrors.acceptTerms = "You must accept the terms and conditions"
    // }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    // Clear error when user types
    if (errors[name as keyof FormData]) {
      setErrors({
        ...errors,
        [name]: undefined,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    if (!validateForm()) return
  
    // Additional validation for merchants
    if (role === "merchant" && (!businessData.businessName || !businessData.businessAddress || !businessData.businessType)) {
      alert("Please fill all business details")
      return
    }
  
    setIsLoading(true)
  
    try {
      const userData = {
        ...formData,
        role,
        ...(role === "merchant" && { businessData })
      }
  
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
  
      // Here you would send userData to your API
      // const response = await fetch('/api/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(userData),
      // })
  
      router.push("/login")
    } catch (error) {
      console.error("Registration error:", error)
      setErrors({
        ...errors,
        email: "This email may already be in use",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }
  interface BusinessData {
    businessName: string
    businessAddress: string
    businessType: string
  }

  const [role, setRole] = useState<string>("user") // Default to "user"
  const [businessData, setBusinessData] = useState<BusinessData>({
    businessName: "",
    businessAddress: "",
    businessType: ""
  })

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
      <div className="px-6 py-8">
        <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">Sign Up</h2>
        <p className="mb-6 text-center text-sm text-gray-600">Create your account to get started</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full rounded-md border ${errors.name ? "border-red-500" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50`}
              disabled={isLoading}
              required
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-md border ${errors.email ? "border-red-500" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50`}
              disabled={isLoading}
              required
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-md border ${errors.password ? "border-red-500" : "border-gray-300"
                  } px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50`}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 8 characters and include uppercase, lowercase, and numbers
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full rounded-md border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  } px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50`}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="role" className="mb-2 block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
            >
              <option value="user">User</option>
              <option value="merchant">Business Owner</option>
            </select>
          </div>
          {role === "merchant" && (
  <div className="space-y-4">
    <div>
      <label htmlFor="businessName" className="mb-2 block text-sm font-medium text-gray-700">
        Business Name
      </label>
      <input
        id="businessName"
        name="businessName"
        type="text"
        placeholder="Your Business Name"
        value={businessData.businessName}
        onChange={(e) => setBusinessData({...businessData, businessName: e.target.value})}
        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
        required
      />
    </div>

    <div>
      <label htmlFor="businessAddress" className="mb-2 block text-sm font-medium text-gray-700">
        Business Address
      </label>
      <input
        id="businessAddress"
        name="businessAddress"
        type="text"
        placeholder="123 Business St, City"
        value={businessData.businessAddress}
        onChange={(e) => setBusinessData({...businessData, businessAddress: e.target.value})}
        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
        required
      />
    </div>

    <div>
      <label htmlFor="businessType" className="mb-2 block text-sm font-medium text-gray-700">
        Business Type
      </label>
      <select
        id="businessType"
        name="businessType"
        value={businessData.businessType}
        onChange={(e) => setBusinessData({...businessData, businessType: e.target.value})}
        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
        required
      >
        <option value="">Select Business Type</option>
        <option value="retail">Retail</option>
        <option value="restaurant">Restaurant</option>
        <option value="service">Service</option>
        <option value="manufacturing">Manufacturing</option>
        <option value="other">Other</option>
      </select>
    </div>
  </div>
)}

          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="acceptTerms" className="text-gray-700">
                I agree to the{" "}
                <Link href="/terms" className="text-orange-500 hover:text-orange-600">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-orange-500 hover:text-orange-600">
                  Privacy Policy
                </Link>
              </label>
              {errors.acceptTerms && <p className="mt-1 text-sm text-red-500">{errors.acceptTerms}</p>}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      </div>
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <button onClick={onClick} className="font-medium text-orange-500 hover:text-orange-600">
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}

