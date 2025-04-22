import { forwardRef } from "react";
import { FieldError } from "react-hook-form";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "block w-full rounded-lg border text-sm transition-colors focus:outline-none focus:ring-[0.2px] focus:ring-ring focus:ring-offset-1",
  {
    variants: {
      variant: {
        default: "border-input text-foreground focus:border-input",
        primary: "border-primary focus:border-primary",
        destructive: "border-destructive focus:border-destructive",
        secondary: "border-secondary focus:border-secondary",
        accent: "border-accent focus:border-accent",
        success: "border-success focus:border-success",
        warning: "border-warning focus:border-warning",
        info: "border-info focus:border-info",
      },
      styleVariant: {
        solid: "bg-background",
        outline: "bg-transparent",
        soft: "bg-opacity-20",
        glass: "bg-opacity-10 backdrop-blur-sm",
      },
      inputSize: {
        sm: "h-8 px-2 py-1 text-xs",
        default: "h-10 p-2.5",
        lg: "h-12 px-3 py-2 text-base",
        xl: "h-14 px-4 py-3 text-lg",
      },
    },
    compoundVariants: [
      // États focus pour chaque variante
      {
        variant: "default",
        className: "focus:ring-ring/30",
      },
      {
        variant: "primary",
        className: "focus:ring-primary/30",
      },
      {
        variant: "destructive",
        className: "focus:ring-destructive/30",
      },
      {
        variant: "secondary",
        className: "focus:ring-secondary/30",
      },
      {
        variant: "accent",
        className: "focus:ring-accent/30",
      },
      {
        variant: "success",
        className: "focus:ring-success/30",
      },
      {
        variant: "warning",
        className: "focus:ring-warning/30",
      },
      {
        variant: "info",
        className: "focus:ring-info/30",
      },
    ],
    defaultVariants: {
      variant: "default",
      styleVariant: "solid",
      inputSize: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: FieldError;
  helperText?: string;
  styleVariant?: "solid" | "outline" | "soft" | "glass";
  inputSize?: "sm" | "default" | "lg" | "xl";
}

/**
 * ErrorMessage Component for Inputs
 * @param errorMessage: string
 */
const ErrorMessage = ({ errorMessage }: { errorMessage: string }) => {
  if (!errorMessage) return null;
  return (
    <span role="alert" className="text-destructive text-sm min-h-3 mt-1">
      {errorMessage}
    </span>
  );
};

const HelperText = ({ helperText }: { helperText: string }) => {
  if (!helperText) return null;
  return (
    <p className="mt-1 text-sm text-muted-foreground italic">{helperText}</p>
  );
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      type = "text",
      defaultValue,
      variant,
      styleVariant,
      inputSize,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1 block text-sm font-medium">{label}</label>
        )}
        <input
          type={type}
          className={cn(
            inputVariants({
              variant,
              styleVariant,
              inputSize,
              className,
            }),
            error && "border-destructive focus:ring-destructive/30"
          )}
          ref={ref}
          {...props}
          aria-label={label || props.placeholder}
          aria-describedby={error ? "error" : helperText ? "helper" : undefined}
          aria-invalid={error ? "true" : "false"}
          defaultValue={defaultValue}
        />
        {/* Error Message and Helper Text */}
        {error && error.message && (
          <ErrorMessage errorMessage={error?.message || ""} />
        )}
        {helperText && !error && <HelperText helperText={helperText} />}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;

type SelectInputProps = {
  label: string;
  error: FieldError | undefined;
  className?: string;
  options: { id: string; name: string }[];
  helperText?: string;
  variant?: VariantProps<typeof inputVariants>["variant"];
  styleVariant?: "solid" | "outline" | "soft" | "glass";
  inputSize?: "sm" | "default" | "lg" | "xl";
};

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  (
    {
      label,
      error,
      className,
      options,
      helperText,
      variant,
      styleVariant,
      inputSize,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1 block text-sm font-medium">{label}</label>
        )}
        <select
          className={cn(
            inputVariants({
              variant,
              styleVariant,
              inputSize,
              className,
            }),
            error && "border-destructive focus:ring-destructive/30"
          )}
          ref={ref}
          {...props}
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        {error && error.message && (
          <ErrorMessage errorMessage={error?.message || ""} />
        )}
        {helperText && !error && <HelperText helperText={helperText} />}
      </div>
    );
  }
);

SelectInput.displayName = "SelectInput";
