import React, { useState, useRef, useEffect } from "react";
import { FieldError } from "react-hook-form";
import { cn } from "@/lib/utils";

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  label?: string;
  error?: FieldError;
  helperText?: string;
}

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const SelectContext = React.createContext<SelectContextType | undefined>(
  undefined
);

export const Select = ({
  value,
  onValueChange,
  children,
  className,
  label,
  error,
  helperText,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </label>
      )}
      <SelectContext.Provider
        value={{ value, onValueChange, isOpen, setIsOpen }}
      >
        <div className={cn("relative", className)}>{children}</div>
      </SelectContext.Provider>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-500">
          {error.message}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 italic">
          {helperText}
        </p>
      )}
    </div>
  );
};

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export const SelectTrigger = ({ children, className }: SelectTriggerProps) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectTrigger must be used within Select");

  return (
    <button
      type="button"
      onClick={() => context.setIsOpen(!context.isOpen)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900",
        "focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white",
        "dark:focus:border-primary-500 dark:focus:ring-primary-500",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 opacity-50"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
};

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SelectContent = ({ children, className }: SelectContentProps) => {
  const context = React.useContext(SelectContext);
  const ref = useRef<HTMLDivElement>(null);
  if (!context) throw new Error("SelectContent must be used within Select");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        context.setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [context]);

  if (!context.isOpen) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-lg border bg-white shadow-md mt-1 py-1",
        "dark:bg-gray-700 dark:border-gray-600",
        className
      )}
    >
      {children}
    </div>
  );
};

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const SelectItem = ({ value, children, className }: SelectItemProps) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectItem must be used within Select");

  const isSelected = context.value === value;

  return (
    <button
      type="button"
      onClick={() => {
        context.onValueChange(value);
        context.setIsOpen(false);
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center px-2 py-1.5 text-sm outline-none",
        "hover:bg-gray-100 dark:hover:bg-gray-600",
        isSelected && "bg-gray-100 dark:bg-gray-600",
        className
      )}
    >
      {children}
    </button>
  );
};

interface SelectValueProps {
  placeholder?: string;
}

export const SelectValue = ({
  placeholder = "Sélectionner...",
}: SelectValueProps) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectValue must be used within Select");

  return <span className="truncate">{context.value || placeholder}</span>;
};
