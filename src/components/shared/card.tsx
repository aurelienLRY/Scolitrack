"use client";

import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useMotionValue, useMotionTemplate, motion } from "framer-motion";

interface CardFluoProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export default function Card({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  props?: HTMLAttributes<HTMLDivElement>;
}) {
  return (
    <div
      className={cn("rounded-lg border border-gray-200 p-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export const CardFluo = ({ children, className, ...props }: CardFluoProps) => {
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

  return (
    <div
      className={cn(
        "relative group/card w-full h-full",
        "bg-transparent border border-primary/30",
        "shadow-[0_0_15px_rgba(14,165,233,0.2)]",
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
            className="absolute inset-0 rounded-xl bg-radial from-primary to-indigo-500 opacity-0 group-hover/card:opacity-15 transition-opacity duration-500"
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

export const SecondaryCardFluo = ({
  children,
  className,
  ...props
}: CardFluoProps) => {
  return (
    <div
      className={cn(
        "relative group/card ",
        "bg-indigo-950/20 border border-indigo-950/50",
        "shadow-[0_0_5px_rgba(14,165,233,0.2)]",
        "rounded-xl",
        "transition-all duration-300 ease-in-out",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
