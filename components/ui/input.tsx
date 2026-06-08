import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 py-2 text-body-md text-on-surface shadow-sm transition-colors",
          "placeholder:text-on-surface-variant/70",
          "focus:outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-label-md file:font-medium",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
