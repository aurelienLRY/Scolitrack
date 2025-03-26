"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const checkboxVariants = cva(
  "peer shrink-0 rounded-sm border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-input data-[state=checked]:bg-gray-500  data-[state=checked]:text-text",
        primary:
          "border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        destructive:
          "border-destructive data-[state=checked]:bg-destructive data-[state=checked]:text-destructive-foreground",
        secondary:
          "border-secondary data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground",
        accent:
          "border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground",
        success:
          "border-success data-[state=checked]:bg-success data-[state=checked]:text-success-foreground",
        warning:
          "border-warning data-[state=checked]:bg-warning data-[state=checked]:text-warning-foreground",
        info: "border-info data-[state=checked]:bg-info data-[state=checked]:text-info-foreground",
      },
      styleVariant: {
        solid: "border-[1.5px]",
        outline: "border-2 bg-transparent data-[state=checked]:bg-transparent",
        soft: "border-transparent bg-opacity-20 data-[state=checked]:bg-opacity-30",
      },
      size: {
        sm: "h-4 w-4",
        default: "h-5 w-5",
        lg: "h-6 w-6",
      },
    },
    compoundVariants: [
      // Outline variants
      {
        variant: "default",
        styleVariant: "outline",
        className: "data-[state=checked]:text-foreground",
      },
      {
        variant: "primary",
        styleVariant: "outline",
        className: "data-[state=checked]:text-primary",
      },
      {
        variant: "destructive",
        styleVariant: "outline",
        className: "data-[state=checked]:text-destructive",
      },
      {
        variant: "secondary",
        styleVariant: "outline",
        className: "data-[state=checked]:text-secondary",
      },
      {
        variant: "accent",
        styleVariant: "outline",
        className: "data-[state=checked]:text-accent",
      },
      {
        variant: "success",
        styleVariant: "outline",
        className: "data-[state=checked]:text-success",
      },
      {
        variant: "warning",
        styleVariant: "outline",
        className: "data-[state=checked]:text-warning",
      },
      {
        variant: "info",
        styleVariant: "outline",
        className: "data-[state=checked]:text-info",
      },
    ],
    defaultVariants: {
      variant: "default",
      styleVariant: "solid",
      size: "default",
    },
  }
);

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  styleVariant?: "solid" | "outline" | "soft";
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant, styleVariant, size, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      checkboxVariants({
        variant,
        styleVariant,
        size,
        className,
      })
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-full w-full p-[3px]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
