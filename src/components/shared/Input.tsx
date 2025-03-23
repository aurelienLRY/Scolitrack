import { forwardRef } from "react";
import { FieldError } from "react-hook-form";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
  helperText?: string;
}

/**
 * ErrorMessage Component for Inputs
 * @param errorMessage: string
 */
const ErrorMessage = ({ errorMessage }: { errorMessage: string }) => {
  if (!errorMessage) return null;
  return (
    <span role="alert" className="text-red-400 text-sm min-h-3 text-center">
      {errorMessage}
    </span>
  );
};

const HelperText = ({ helperText }: { helperText: string }) => {
  if (!helperText) return null;
  return (
    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 italic">
      {helperText}
    </p>
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
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && !props.placeholder && (
          <label className="mb-1 block text-sm font-light ">{label}</label>
        )}
        <input
          type={type}
          className={cn(
            "block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm ",
            "dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400",
            error && "border-red-500 dark:border-red-500",
            className && className
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
  className: string;
  options: { id: string; name: string }[];
  helperText?: string;
};

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ label, error, className, options, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1 block text-sm font-light ">{label}</label>
        )}
        <select
          className={cn(
            "block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm ",
            "dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400",
            error && "border-red-500 dark:border-red-500",
            className && className
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
