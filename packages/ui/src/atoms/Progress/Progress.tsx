import * as React from "react";
import { cn } from "../../utils/cn";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "gold" | "success" | "warning" | "error";
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, size = "md", variant = "default", ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const sizeClasses = {
      sm: "h-1",
      md: "h-2", 
      lg: "h-3",
    };

    const variantClasses = {
      default: "bg-primary",
      gold: "bg-gold-500",
      success: "bg-green-500",
      warning: "bg-yellow-500",
      error: "bg-red-500",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-muted",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full transition-all duration-300 ease-in-out",
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };