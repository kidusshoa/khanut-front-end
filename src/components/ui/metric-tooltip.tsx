"use client";

import React from "react";
import { Info as InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MetricTooltipProps {
  title: string;
  description: string;
  className?: string;
  iconSize?: "sm" | "md" | "lg";
}

/**
 * A component that displays an info icon with a tooltip
 */
export function MetricTooltip({
  title,
  description,
  className,
  iconSize = "md",
}: MetricTooltipProps) {
  // Determine the icon size based on the size prop
  const size =
    iconSize === "sm" ? "h-3 w-3" : iconSize === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <InfoIcon
          className={cn(
            size,
            "text-muted-foreground cursor-help ml-1",
            className
          )}
        />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div>
          <h4 className="font-medium mb-1">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
