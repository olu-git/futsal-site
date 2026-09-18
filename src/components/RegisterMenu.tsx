"use client";

import Link from "next/link";
import { ArrowRight, UserRound, UsersRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const choices = [
  {
    href: "/contact?registration=team",
    title: "Team",
    description: "Register a team for the Endeavour Hills competition.",
    icon: UsersRound,
  },
  {
    href: "/contact?registration=player",
    title: "Player",
    description: "Register as an individual player looking to join a team.",
    icon: UserRound,
  },
  {
    href: "/contact?registration=future",
    title: "Future Competitions",
    description: "Tell us where you would like FIS to run next.",
    icon: ArrowRight,
  },
];

export default function RegisterMenu() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fis-pixel-shadow inline-flex min-h-14 items-center justify-center border-2 border-[var(--fis-blue)] bg-[var(--fis-red)] px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition-transform hover:-translate-y-1"
      >
        Register
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-end bg-[#001846]/75 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="register-title"
            tabIndex={-1}
            className="w-full max-w-3xl border-t-4 border-[var(--fis-red)] bg-[var(--fis-cream)] p-6 text-[var(--fis-blue)] shadow-2xl sm:border-4 sm:border-[var(--fis-blue)] sm:p-8"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="fis-kicker text-[var(--fis-red)]">Choose a pathway</p>
                <h2 id="register-title" className="mt-2 text-3xl font-black uppercase tracking-[-0.03em] sm:text-4xl">
                  Register
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center border-2 border-[var(--fis-blue)] hover:bg-[var(--fis-blue)] hover:text-white"
                aria-label="Close registration menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-7 grid gap-3 md:grid-cols-3">
              {choices.map(({ href, title, description, icon: Icon }) => (
                <Link
                  key={title}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="group flex min-h-48 flex-col border-2 border-[var(--fis-blue)] bg-[var(--fis-cream-light)] p-5 transition-colors hover:bg-[var(--fis-blue)] hover:text-white"
                >
                  <Icon className="h-6 w-6 text-[var(--fis-red)]" aria-hidden="true" />
                  <h3 className="mt-auto text-base font-black uppercase leading-5">{title}</h3>
                  <p className="mt-2 text-xs font-light leading-5 opacity-75">{description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
