import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-label-sm font-semibold uppercase tracking-wider",
  {
    variants: {
      variant: {
        neutral: "bg-surface-container-high text-on-surface-variant",
        primary: "bg-primary-fixed text-on-primary-fixed-variant",
        secondary: "bg-secondary-fixed text-on-secondary-fixed-variant",
        success: "bg-success-container text-on-success-container",
        warning: "bg-accent-container text-on-accent-container",
        error: "bg-error-container text-on-error-container",
        solid: "bg-primary text-on-primary",
        accentSolid: "bg-accent text-on-accent",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
