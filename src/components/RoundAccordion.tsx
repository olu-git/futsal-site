import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export default function RoundAccordion({ round, date, count, defaultOpen = false, children }: {
  round: number; date: string; count: number; defaultOpen?: boolean; children: ReactNode;
}) {
  return <details className="round-accordion" open={defaultOpen}>
    <summary><span>Round {round}</span><span className="round-date">{date}</span><span className="round-count">{count} {count === 1 ? "match" : "matches"}</span><ChevronDown size={18} aria-hidden="true" /></summary>
    {children}
  </details>;
}
