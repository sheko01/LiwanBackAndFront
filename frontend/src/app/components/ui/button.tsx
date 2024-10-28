"use client";

import * as React from "react";

import { cn } from "@/app/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "destructive";
  size?: "default" | "sm" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "flex h-10 items-center justify-center rounded-md text-sm font-semibold whitespace-nowrap",
          // Variants
          {
            "bg-Secondary text-white hover:bg-neutral-800":
              variant === "default",
            "border border-neutral-300 bg-transparent text-black hover:bg-neutral-100":
              variant === "outline",
            "bg-red-600 text-white hover:bg-red-700":
              variant === "destructive",
          },
          // Sizes
          {
            "px-3 py-2": size === "default",
            "px-2 py-1.5 text-xs": size === "sm",
            "px-4 py-2.5 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";