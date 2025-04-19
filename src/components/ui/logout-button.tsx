"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { handleLogout } from "@/lib/auth-utils";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoutButtonProps extends ButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  callbackUrl?: string;
  className?: string;
}

export function LogoutButton({
  variant = "ghost",
  size = "default",
  showIcon = true,
  callbackUrl = "/login",
  className,
  children,
  ...props
}: LogoutButtonProps) {
  const { data: session } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const onLogout = async () => {
    setIsLoggingOut(true);
    await handleLogout(session?.refreshToken, callbackUrl);
    // No need to set isLoggingOut to false as the page will redirect
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        showIcon && "flex items-center gap-2",
        variant === "destructive" && "bg-red-600 hover:bg-red-700",
        className
      )}
      onClick={onLogout}
      disabled={isLoggingOut}
      {...props}
    >
      {isLoggingOut ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        showIcon && <LogOut className="h-4 w-4" />
      )}
      {children || "Logout"}
    </Button>
  );
}
