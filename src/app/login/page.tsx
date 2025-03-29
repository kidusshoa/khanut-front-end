'use client'
import LoginForm from "./form"
import type { Metadata } from "next"
import React from "react"
import SignUpForm from "./sign_up"

// export const metadata: Metadata = {
//   title: "Login | Your App Name",
//   description: "Login to your account",
// }

export default function LoginPage() {
    const [isSignIn,setIsSignIn]=React.useState(false)
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-600">Please sign in to your account</p>
        </div>
        {isSignIn? <SignUpForm onClick={()=>setIsSignIn(false)}/>:
        <LoginForm onClick={()=>setIsSignIn(true)}/>}
        
      </div>
    </div>
  )
}

