'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { RegisterInput, registerSchema } from '@/lib/validations/auth'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/store/authStore'

export default function RegisterForm() {
  const router = useRouter()
  const setTempEmail = useAuthStore((state) => state.setTempEmail)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'customer',
    },
  })

  const onSubmit = async (data: RegisterInput) => {
    try {
      const response = await authService.register(data)
      setTempEmail(data.email)
      router.push('/verify')
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          {...register('name')}
          type="text"
          className={`mt-1 block w-full rounded-md border ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          className={`mt-1 block w-full rounded-md border ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            className={`mt-1 block w-full rounded-md border ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <div className="relative">
          <input
            {...register('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            className={`mt-1 block w-full rounded-md border ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
      >
        {isSubmitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  )
}