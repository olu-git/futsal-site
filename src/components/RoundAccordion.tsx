"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface RoundAccordionProps {
  round: number;
  date: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function RoundAccordion({
  round,
  date,
  count,
  defaultOpen = false,
  children,
}: RoundAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden border-2 border-[var(--fis-blue)] bg-[var(--fis-cream-light)]">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between bg-[var(--fis-blue)] px-5 py-4 text-left text-white transition-colors hover:bg-[var(--fis-blue-dark)]"
      >
        <div className="flex items-center gap-4">
          <span className="font-[family-name:var(--font-heading)] text-base font-black uppercase tracking-[-0.02em] text-white">
            Round {round}
          </span>
          <div className="hidden h-1 w-6 bg-[var(--fis-red)] sm:block" />
          <span className="hidden font-[family-name:var(--font-mono)] text-[0.53rem] leading-4 text-white/65 sm:block">
            {date}
          </span>
          <span className="font-[family-name:var(--font-mono)] text-[0.5rem] leading-4 text-white/65 sm:hidden">
            {date}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="border border-white/30 px-2.5 py-1 font-[family-name:var(--font-sans)] text-[0.62rem] font-semibold text-white/70">
            {count} {count === 1 ? "match" : "matches"}
          </span>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-white/70" />
          </motion.div>
        </div>
      </button>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="border-t-4 border-[var(--fis-red)] bg-[var(--fis-blue-dark)] p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
