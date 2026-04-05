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
    <div className="rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-[#1A1A1A] hover:bg-white/[0.04] transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <span className="font-[family-name:var(--font-heading)] text-base uppercase tracking-wider text-white">
            Round {round}
          </span>
          <div className="hidden sm:block w-6 h-px bg-red-600/60" />
          <span className="hidden sm:block text-xs text-white/40 font-[family-name:var(--font-geist-mono)]">
            {date}
          </span>
          <span className="sm:hidden text-xs text-white/40 font-[family-name:var(--font-geist-mono)]">
            {date}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white/[0.07] px-2.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[11px] text-white/50">
            {count} {count === 1 ? "match" : "matches"}
          </span>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-white/40" />
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
            <div className="p-4 bg-[#111111] border-t border-white/[0.06]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
