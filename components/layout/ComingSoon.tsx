import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { MaterialIcon } from "@/lib/icons";

interface Action {
  label: string;
  href: string;
}

interface ComingSoonProps {
  icon?: MaterialIcon;
  eyebrow?: string;
  title: string;
  description: string;
  primaryAction?: Action;
  secondaryAction?: Action;
}

/** Polished placeholder for routes whose full build is a later milestone. */
export function ComingSoon({
  icon = "bolt",
  eyebrow = "Coming soon",
  title,
  description,
  primaryAction = { label: "Back to home", href: "/" },
  secondaryAction,
}: ComingSoonProps) {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-primary">
        <Icon name={icon} size={32} />
      </span>
      <span className="mt-6 text-label-sm font-semibold uppercase tracking-wider text-primary">
        {eyebrow}
      </span>
      <h1 className="mt-2 text-headline-lg-mobile text-on-surface md:text-headline-lg">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-body-md text-on-surface-variant">
        {description}
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        {primaryAction && (
          <Button asChild>
            <Link href={primaryAction.href}>{primaryAction.label}</Link>
          </Button>
        )}
        {secondaryAction && (
          <Button asChild variant="secondary">
            <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
          </Button>
        )}
      </div>
    </section>
  );
}
