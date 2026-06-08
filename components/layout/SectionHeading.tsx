import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        {eyebrow && (
          <span className="mb-2 block text-label-sm font-semibold uppercase tracking-wider text-primary">
            {eyebrow}
          </span>
        )}
        <h2 className="text-headline-lg-mobile text-on-surface md:text-headline-lg">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-1 text-label-md font-medium text-primary transition-all hover:gap-2"
        >
          {action.label}
          <Icon
            name="arrow_forward"
            size={18}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      )}
    </div>
  );
}
