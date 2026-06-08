import Link from "next/link";
import { SITE } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-surface">
        <div className="container-page flex h-16 items-center">
          <Link href="/" className="text-headline-md font-bold text-primary">
            {SITE.name}
          </Link>
        </div>
      </header>
      <main className="flex flex-grow items-center justify-center bg-surface-container-low">
        {children}
      </main>
    </div>
  );
}
