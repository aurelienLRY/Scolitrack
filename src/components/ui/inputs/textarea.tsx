import { forwardRef } from "react";
import { FieldError } from "react-hook-form";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
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
        sm: "min-h-[80px] px-2 py-1 text-xs",
        default: "min-h-[100px] p-2.5",
        lg: "min-h-[120px] px-3 py-2 text-base",
        xl: "min-h-[150px] px-4 py-3 text-lg",
      },
    },
    compoundVariants: [
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

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: FieldError;
  helperText?: string;
  styleVariant?: "solid" | "outline" | "soft" | "glass";
  inputSize?: "sm" | "default" | "lg" | "xl";
  rows?: number;
  maxRows?: number;
}

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

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      defaultValue,
      variant,
      styleVariant,
      inputSize,
      rows,
      maxRows,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && !props.placeholder && (
          <label className="mb-1 block text-sm font-medium">{label}</label>
        )}
        <textarea
          className={cn(
            textareaVariants({
              variant,
              styleVariant,
              inputSize,
              className,
            }),
            error && "border-destructive focus:ring-destructive/30",
            maxRows && `max-h-[${maxRows * 1.5}rem]`
          )}
          ref={ref}
          rows={rows}
          style={maxRows ? { resize: "vertical" } : undefined}
          {...props}
          aria-label={label || props.placeholder}
          aria-describedby={error ? "error" : helperText ? "helper" : undefined}
          aria-invalid={error ? "true" : "false"}
          defaultValue={defaultValue}
        />
        {error && error.message && (
          <ErrorMessage errorMessage={error?.message || ""} />
        )}
        {helperText && !error && <HelperText helperText={helperText} />}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
