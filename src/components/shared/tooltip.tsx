"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900",
  error: "bg-red-500 text-white",
  success: "bg-green-500 text-white",
  warning: "bg-yellow-500 text-white",
  info: "bg-blue-500 text-white",
};

const positions = {
  top: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
    className: "-top-2 left-1/2 -translate-x-1/2 -translate-y-full",
  },
  bottom: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    className: "-bottom-2 left-1/2 -translate-x-1/2 translate-y-full",
  },
  left: {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
    className: "left-0 top-1/2 -translate-x-full -translate-y-1/2",
  },
  right: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
    className: "right-0 top-1/2 translate-x-full -translate-y-1/2",
  },
};

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  variant?: keyof typeof variants;
  position?: keyof typeof positions;
  delay?: number;
  className?: string;
  showArrow?: boolean;
}
/**
 * Tooltip component
 * @param content - Content of the tooltip
 * @param children - Children of the tooltip
 * @param variant - Variant of the tooltip
 * @param position - Position of the tooltip
 * @param delay - Delay of the tooltip
 * @param className - Class name of the tooltip
 * @param showArrow - Show arrow of the tooltip
 * @returns Tooltip component
 */
export function Tooltip({
  content,
  children,
  variant = "default",
  position = "top",
  delay = 0.2,
  className,
  showArrow = true,
}: TooltipProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setIsMounted(true);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsMounted(false);
    };
  }, []);

  const handleMouseEnter = React.useCallback(() => {
    timeoutRef.current = window.setTimeout(() => {
      setIsHovered(true);
    }, delay * 1000);
  }, [delay]);

  const handleMouseLeave = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsHovered(false);
  }, []);

  if (!isMounted) return null;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className={cn(
              "absolute z-50 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium shadow-md",
              variants[variant],
              positions[position].className,
              className
            )}
            initial={positions[position].initial}
            animate={positions[position].animate}
            exit={positions[position].exit}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {content}
            {showArrow && (
              <div
                className={cn(
                  "absolute h-2 w-2 rotate-45",
                  variants[variant],
                  position === "top" &&
                    "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
                  position === "bottom" &&
                    "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
                  position === "left" &&
                    "right-0 top-1/2 -translate-y-1/2 translate-x-1/2",
                  position === "right" &&
                    "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2"
                )}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
