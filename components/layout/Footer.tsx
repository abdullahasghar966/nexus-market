import Link from "next/link";
import { SITE, FOOTER_NAV, SOCIAL_LINKS } from "@/lib/constants";

/** Inline brand SVGs (lucide v1 dropped social/brand icons). */
function SocialGlyph({ label }: { label: string }) {
  switch (label) {
    case "Instagram":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "LinkedIn":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21H9z" />
        </svg>
      );
    case "Twitter":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    default:
      return null;
  }
}

export function Footer() {
  return (
    <footer className="border-t border-outline-variant bg-surface-container-highest">
      <div className="container-page grid grid-cols-1 gap-gutter py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <Link href="/" className="text-headline-md font-bold text-primary">
            {SITE.name}
          </Link>
          <p className="mt-4 max-w-xs text-body-md text-on-surface-variant">
            Connecting global buyers with verified vendors for a seamless,
            trustworthy marketplace experience.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
              >
                <SocialGlyph label={s.label} />
              </a>
            ))}
          </div>
        </div>

        {FOOTER_NAV.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 text-label-md font-bold uppercase tracking-wider text-on-surface">
              {col.title}
            </h4>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={`${col.title}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="text-body-md text-on-surface-variant underline-offset-4 transition-colors hover:text-primary hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-outline-variant/60">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-label-sm normal-case tracking-normal text-on-surface-variant sm:flex-row">
          <span>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </span>
          <span className="uppercase tracking-wider">
            Built for modern commerce
          </span>
        </div>
      </div>
    </footer>
  );
}
