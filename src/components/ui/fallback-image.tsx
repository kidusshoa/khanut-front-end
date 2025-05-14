"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Building, User, Store } from "lucide-react";

interface FallbackImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallbackType?: "business" | "user" | "service";
  fallbackClassName?: string;
  fallbackSrc?: string; // Add fallbackSrc prop
  fill?: boolean;
}

export function FallbackImage({
  src,
  alt,
  className,
  width,
  height,
  fallbackType = "business",
  fallbackClassName,
  fallbackSrc,
  fill = false,
}: FallbackImageProps) {
  const [error, setError] = useState(false);

  // If no src or error loading image, show fallback
  if (!src || error) {
    // If fallbackSrc is provided, use it instead of the icon
    if (fallbackSrc) {
      return (
        <div className={cn("relative", className)} style={{ width, height }}>
          <img
            src={fallbackSrc}
            alt={alt}
            className="object-cover w-full h-full"
            width={width || 100}
            height={height || 100}
          />
        </div>
      );
    }

    // Otherwise use the icon fallback
    const FallbackIcon =
      fallbackType === "user"
        ? User
        : fallbackType === "service"
        ? Store
        : Building;

    return (
      <div
        className={cn("flex items-center justify-center bg-muted", className)}
        style={{ width, height }}
      >
        <FallbackIcon
          className={cn("text-muted-foreground", fallbackClassName)}
        />
      </div>
    );
  }

  // If src is provided and no error, show image
  return fill ? (
    <div className={cn("relative", className)} style={{ width, height }}>
      <img
        src={src}
        alt={alt}
        className="object-cover w-full h-full"
        onError={() => setError(true)}
      />
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width || 100}
      height={height || 100}
      onError={() => setError(true)}
    />
  );
}
