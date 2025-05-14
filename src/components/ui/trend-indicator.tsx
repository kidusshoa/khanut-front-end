"use client";

import React from "react";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendIndicatorProps {
  value: number;
  className?: string;
  showIcon?: boolean;
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  positiveColor?: string;
  negativeColor?: string;
  neutralColor?: string;
  threshold?: number;
  size?: "sm" | "md" | "lg";
}

/**
 * A component that displays a trend indicator (up/down arrow) based on a value
 */
export function TrendIndicator({
  value,
  className,
  showIcon = true,
  showValue = true,
  valuePrefix = "",
  valueSuffix = "%",
  positiveColor = "text-green-500",
  negativeColor = "text-red-500",
  neutralColor = "text-gray-500",
  threshold = 0,
  size = "md",
}: TrendIndicatorProps) {
  // Determine if the trend is positive, negative, or neutral
  const isPositive = value > threshold;
  const isNegative = value < threshold;
  const isNeutral = value === threshold;

  // Determine the color based on the trend
  const color = isPositive
    ? positiveColor
    : isNegative
    ? negativeColor
    : neutralColor;

  // Determine the icon size based on the size prop
  const iconSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  
  // Determine the text size based on the size prop
  const textSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";

  return (
    <div className={cn("flex items-center", className)}>
      {showIcon && (
        <span className={cn("mr-1", color)}>
          {isPositive ? (
            <ArrowUpIcon className={iconSize} />
          ) : isNegative ? (
            <ArrowDownIcon className={iconSize} />
          ) : (
            <MinusIcon className={iconSize} />
          )}
        </span>
      )}
      {showValue && (
        <span className={cn(textSize, "font-medium", color)}>
          {isPositive && value !== 0 && "+"}
          {valuePrefix}
          {Math.abs(value).toFixed(1)}
          {valueSuffix}
        </span>
      )}
    </div>
  );
}
