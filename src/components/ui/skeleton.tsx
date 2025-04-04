import { cn } from "@/lib/utils";

function Skeleton({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-400 dark:bg-gray-700 border border-gray-500",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Skeleton };
