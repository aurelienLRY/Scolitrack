"use client";

import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useMotionValue, useMotionTemplate, motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";

// Définition des variantes de Card
const cardVariants = cva("rounded-lg border transition-all duration-200", {
  variants: {
    variant: {
      default: "border-input bg-background",
      primary: "border-primary bg-background",
      destructive: "border-destructive bg-background",
      secondary: "border-secondary bg-background",
      accent: "border-accent bg-background",
      success: "border-success bg-background",
      warning: "border-warning bg-background",
      info: "border-info bg-background",
    },
    styleVariant: {
      solid: "shadow-sm",
      outline: "bg-transparent border-2",
      soft: "bg-opacity-50 border-opacity-25",
      glass: "backdrop-blur-sm bg-opacity-10 border-opacity-20",
    },
    size: {
      sm: "p-2",
      default: "p-4",
      lg: "p-6",
      xl: "p-8",
    },
  },
  compoundVariants: [
    {
      variant: "primary",
      styleVariant: "solid",
      className: "shadow-primary/10",
    },
    {
      variant: "destructive",
      styleVariant: "solid",
      className: "shadow-destructive/10",
    },
  ],
  defaultVariants: {
    variant: "default",
    styleVariant: "solid",
    size: "default",
  },
});

// Interface pour le composant Card
export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: React.ReactNode;
  className?: string;
}

// Composant Card
export default function Card({
  children,
  className,
  variant,
  styleVariant,
  size,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        cardVariants({
          variant,
          styleVariant,
          size,
          className,
        })
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Interface pour le composant CardFluo
export interface CardFluoProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?:
    | "default"
    | "primary"
    | "destructive"
    | "secondary"
    | "accent"
    | "success"
    | "warning"
    | "info";
}

// Fonction d'aide pour obtenir les classes CSS de couleur en fonction de la variante
const getVariantClasses = (variant: CardFluoProps["variant"] = "primary") => {
  switch (variant) {
    case "default":
      return {
        border: "border-input/30",
        shadow: "shadow-[0_0_15px_rgba(0,0,0,0.1)]",
        gradient: "from-gray-400 to-gray-600",
      };
    case "primary":
      return {
        border: "border-primary/30",
        shadow: "shadow-[0_0_15px_rgba(14,165,233,0.2)]",
        gradient: "from-primary to-indigo-500",
      };
    case "destructive":
      return {
        border: "border-destructive/30",
        shadow: "shadow-[0_0_15px_rgba(239,68,68,0.2)]",
        gradient: "from-destructive to-red-700",
      };
    case "secondary":
      return {
        border: "border-secondary/30",
        shadow: "shadow-[0_0_15px_rgba(107,114,128,0.2)]",
        gradient: "from-secondary to-gray-600",
      };
    case "accent":
      return {
        border: "border-accent/30",
        shadow: "shadow-[0_0_15px_rgba(250,204,21,0.2)]",
        gradient: "from-accent to-yellow-600",
      };
    case "success":
      return {
        border: "border-green-500/30",
        shadow: "shadow-[0_0_15px_rgba(34,197,94,0.2)]",
        gradient: "from-green-500 to-green-700",
      };
    case "warning":
      return {
        border: "border-yellow-500/30",
        shadow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]",
        gradient: "from-yellow-500 to-amber-600",
      };
    case "info":
      return {
        border: "border-blue-500/30",
        shadow: "shadow-[0_0_15px_rgba(59,130,246,0.2)]",
        gradient: "from-blue-500 to-blue-700",
      };
    default:
      return {
        border: "border-primary/30",
        shadow: "shadow-[0_0_15px_rgba(14,165,233,0.2)]",
        gradient: "from-primary to-indigo-500",
      };
  }
};

export const CardFluo = ({
  children,
  className,
  variant = "primary",
  ...props
}: CardFluoProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function onMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }
  const variantClasses = getVariantClasses(variant);

  return (
    <div
      className={cn(
        "relative group/card w-full h-full",
        "bg-transparent border",
        variantClasses.border,
        variantClasses.shadow,
        "rounded-xl",
        "transition-all duration-300 ease-in-out"
      )}
      {...props}
    >
      <div
        onMouseMove={onMouseMove}
        className="relative w-full h-full rounded-xl overflow-hidden bg-transparent backdrop-blur-sm"
      >
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className={cn(
              "absolute inset-0 rounded-xl bg-radial",
              variantClasses.gradient,
              "opacity-0 group-hover/card:opacity-15 transition-opacity duration-500"
            )}
            style={{
              maskImage: useMotionTemplate`radial-gradient(250px at ${mouseX}px ${mouseY}px, white, transparent)`,
              WebkitMaskImage: useMotionTemplate`radial-gradient(250px at ${mouseX}px ${mouseY}px, white, transparent)`,
            }}
          />
        </div>

        <div className={cn("p-1 h-full w-full", className)}>{children}</div>
      </div>
    </div>
  );
};
