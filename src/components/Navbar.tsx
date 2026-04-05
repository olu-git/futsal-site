"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/monday-night", label: "Monday Night" },
  { href: "/wednesday-night", label: "Wednesday Night" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0A]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-1.5 h-6 bg-red-600 rounded-sm" />
          <span
            className="text-xl uppercase tracking-wider leading-none text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Endeavour Hills{" "}
            <span className="text-red-500" style={{ fontFamily: "var(--font-heading)", fontSize: "inherit" }}>Futsal</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 rounded-lg text-sm transition-colors font-[family-name:var(--font-geist-mono)] uppercase tracking-wider",
                pathname === link.href
                  ? "bg-red-600 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white/50 hover:text-white p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0A0A0A]/95 backdrop-blur-md">
          <div className="px-4 py-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-4 py-2.5 rounded-lg text-sm transition-colors font-[family-name:var(--font-geist-mono)] uppercase tracking-wider",
                  pathname === link.href
                    ? "bg-red-600 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
