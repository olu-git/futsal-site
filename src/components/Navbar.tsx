"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/monday-night", label: "Monday Night" },
  { href: "/wednesday-night", label: "Wednesday Night" },
  { href: "/rules", label: "Rules" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b-4 border-[var(--fis-red)] bg-[var(--fis-blue)] text-white">
      <nav className="fis-container flex min-h-20 items-center justify-between gap-6" aria-label="Primary navigation">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-3 py-4"
          aria-label="Futsal Indoor Soccer home"
        >
          <Image
            src="/logos/FIS-01-Primary-Black.svg"
            alt="Futsal Indoor Soccer"
            width={244}
            height={100}
            className="h-12 w-auto brightness-0 invert transition-transform group-hover:scale-[1.02]"
            priority
          />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative px-3 py-3 text-[0.72rem] font-bold uppercase tracking-[0.08em] transition-colors xl:px-4",
                  active
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                )}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-3 -bottom-0.5 h-1 bg-[var(--fis-red)] transition-transform",
                    active ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center border-2 border-white/70 text-white transition-colors hover:border-white hover:bg-white/10 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-[84px] bottom-0 overflow-y-auto bg-[var(--fis-blue)] lg:hidden"
        >
          <div className="fis-container flex flex-col py-7">
            {links.map((link, index) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between border-b border-white/20 py-5 text-lg font-bold uppercase tracking-[0.07em]",
                    active ? "text-white" : "text-white/70"
                  )}
                >
                  <span>{link.label}</span>
                  <span className="fis-kicker text-[var(--fis-red)]" aria-hidden="true">
                    0{index + 1}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
