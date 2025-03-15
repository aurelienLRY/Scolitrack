"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  iconAlt?: React.ReactNode;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, icon, iconAlt, ...props }, ref) => {
    return (
      <div className="flex items-center gap-2">
        <div className="relative p-1">
          <input
            type="checkbox"
            className="absolute w-full h-full opacity-0 m-0 z-10 cursor-pointer"
            ref={ref}
            {...props}
          />
          <label
            className={cn(
              "block relative w-12 h-6 bg-accent rounded-full transition-all duration-300 ease-in-out",
              className
            )}
          >
            <span
              className={cn(
                "absolute top-0 left-0 w-6 h-6 bg-white rounded-full flex items-center justify-center transition-all duration-300 ease-spring",
                props.checked ? "translate-x-full scale-95" : "scale-95"
              )}
            >
              <span
                className={cn(
                  "absolute transition-all duration-500",
                  props.checked ? "rotate-0 scale-100" : "-rotate-90 scale-0"
                )}
              >
                {iconAlt}
              </span>
              <span
                className={cn(
                  "absolute transition-all duration-500",
                  props.checked ? "rotate-90 scale-0" : "rotate-0 scale-100"
                )}
              >
                {icon}
              </span>
            </span>
          </label>
        </div>
        {label && (
          <span className="text-sm font-medium transition-colors duration-300">
            {label}
          </span>
        )}
      </div>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
