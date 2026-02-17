"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-label transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page disabled:pointer-events-none disabled:opacity-55",
  {
    variants: {
      variant: {
        default: "border border-primary/70 bg-primary px-4 py-2.5 text-text-primary hover:bg-primary-hover",
        secondary: "border border-border-default bg-bg-surface px-4 py-2.5 text-text-secondary hover:bg-bg-surface/80 hover:text-text-primary",
        ghost: "px-3 py-2 text-text-secondary hover:bg-bg-surface/80 hover:text-text-primary",
        danger: "border border-state-error/50 bg-state-error/10 px-4 py-2.5 text-state-error hover:brightness-110",
      },
      size: {
        default: "h-10",
        sm: "h-9 px-3",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
