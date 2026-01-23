// import { cn } from "../../lib/utils";
// Actually, standard Setup for 'cn' utility is common but not scaffolded yet.
// I will keep it simple for now and inline the classes or check if I need to create a utility.

// Simple version without 'cn' dependency for now
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-800 ${className}`}
      {...props}
    />
  );
}
