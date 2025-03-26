import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-input bg-background text-foreground",
        primary: "border-primary bg-primary text-primary-foreground",
        secondary: "border-secondary bg-secondary text-secondary-foreground",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground",
        accent: "border-accent bg-accent text-accent-foreground",
        success: "border-success bg-success text-success-foreground",
        warning: "border-warning bg-warning text-warning-foreground",
        info: "border-info bg-info text-info-foreground",
      },
      styleVariant: {
        solid: "",
        outline: "bg-transparent",
        soft: "bg-opacity-15 border-opacity-30",
        glass: "bg-opacity-10 backdrop-blur-sm",
      },
      size: {
        sm: "text-[10px] px-2 py-[0.5px]",
        default: "text-xs px-2.5 py-0.5",
        lg: "text-sm px-3 py-1",
      },
    },
    compoundVariants: [
      // Outline variants
      {
        variant: "default",
        styleVariant: "outline",
        className: "text-foreground",
      },
      {
        variant: "primary",
        styleVariant: "outline",
        className: "text-primary",
      },
      {
        variant: "secondary",
        styleVariant: "outline",
        className: "text-secondary",
      },
      {
        variant: "destructive",
        styleVariant: "outline",
        className: "text-destructive",
      },
      {
        variant: "accent",
        styleVariant: "outline",
        className: "text-accent",
      },
      {
        variant: "success",
        styleVariant: "outline",
        className: "text-success",
      },
      {
        variant: "warning",
        styleVariant: "outline",
        className: "text-warning",
      },
      {
        variant: "info",
        styleVariant: "outline",
        className: "text-info",
      },
      // Soft variants
      {
        variant: "primary",
        styleVariant: "soft",
        className: "text-primary border-primary/20 bg-primary/10",
      },
      {
        variant: "destructive",
        styleVariant: "soft",
        className: "text-destructive border-destructive/20 bg-destructive/10",
      },
      {
        variant: "secondary",
        styleVariant: "soft",
        className: "text-secondary border-secondary/20 bg-secondary/10",
      },
      {
        variant: "accent",
        styleVariant: "soft",
        className: "text-accent border-accent/20 bg-accent/10",
      },
      {
        variant: "success",
        styleVariant: "soft",
        className: "text-success border-success/20 bg-success/10",
      },
      {
        variant: "warning",
        styleVariant: "soft",
        className: "text-warning border-warning/20 bg-warning/10",
      },
      {
        variant: "info",
        styleVariant: "soft",
        className: "text-info border-info/20 bg-info/10",
      },
    ],
    defaultVariants: {
      variant: "default",
      styleVariant: "solid",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  styleVariant?: "solid" | "outline" | "soft" | "glass";
}

function Badge({
  className,
  variant,
  styleVariant,
  size,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({
          variant,
          styleVariant,
          size,
          className,
        })
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
