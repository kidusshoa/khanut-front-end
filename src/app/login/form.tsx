"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import SignUpForm from "./sign_up"
import axios from "axios"

interface FormData {
  email: string
  password: string
  rememberMe: boolean
  role: string
}

export default function LoginForm({ onClick }: any) {
   

  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
    role: "user",
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>| React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value, type, } = e.target
    setFormData({
      ...formData,
      [name]:value,
    })

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

    setIsLoading(true)

    try {
      const { data } = await axios.post('/api/login', {
        email: formData.email,
        password: formData.password
        
      })

      
      switch (data.user?.role) {
        case 'admin':
          router.push('/admin/dashboard')
          break
        case 'merchant':
          router.push('/merchant/dashboard')
          break
        default:
          router.push('/dashboard')
      }

    } catch (error) {
      console.error("Login error:", error)
      
      if (axios.isAxiosError(error)) {
        setErrors({
          password: error.response?.data?.message || "Invalid email or password",
        })
      } else {
        setErrors({
          password: "An unexpected error occurred",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }
 

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
      <div className="px-6 py-8">
        <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">Sign In</h2>
        <p className="mb-6 text-center text-sm text-gray-600">Enter your credentials to access your account</p>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              className={`w-full rounded-md border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50`}
              disabled={isLoading}
              required
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link href="/forgot-password" className="text-sm text-orange-500 hover:text-orange-600">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-md border ${
                  errors.password ? "border-red-500" : "border-gray-300"
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
          </div>
          <div className="mb-4">
            <label htmlFor="role" className="mb-2 block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
              required
            >
              <option value="user">User</option>
              <option value="merchant">Business Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              id="remember"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
              Remember me for 30 days
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <button onClick={onClick} className="font-medium text-orange-500 hover:text-orange-600">
            Sign up
          </button>
        </p>
      </div>
     
    </div>
  )
}

