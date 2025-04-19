"use client";

import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingState({
  message = "Loading...",
  size = "md",
  className = "",
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
      <div className="text-center">
        <Loader2 
          className={`${sizeClasses[size]} animate-spin text-orange-500 mx-auto mb-4`} 
        />
        <h3 className="text-lg font-medium">{message}</h3>
      </div>
    </div>
  );
}
