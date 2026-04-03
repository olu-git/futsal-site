"use client";

import { Fixture } from "@/lib/types";
import { getTeamName } from "@/lib/data";
import { formatDate, formatTime } from "@/lib/utils";
import { motion } from "framer-motion";

interface MatchCardProps {
  fixture: Fixture;
  index?: number;
}

export default function MatchCard({ fixture, index = 0 }: MatchCardProps) {
  const isCompleted = fixture.status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="overflow-hidden rounded-lg border border-white/10 bg-[#1A1A1A]"
    >
      {/* Top bar */}
      <div
        className={`flex items-center justify-between px-4 py-2 ${
          isCompleted ? "bg-red-600" : "bg-white/[0.03]"
        }`}
      >
        <span
          className={`font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-wider ${
            isCompleted ? "text-white" : "text-white/50"
          }`}
        >
          Round {fixture.round}
        </span>
        <StatusBadge status={fixture.status} />
      </div>

      {/* Body - teams and score */}
      <div className="flex items-center justify-center gap-5 px-6 py-7">
        <span className="flex-1 text-right font-[family-name:var(--font-sans)] text-base font-bold text-white">
          {getTeamName(fixture.homeTeam)}
        </span>

        {isCompleted ? (
          <div className="flex items-center gap-2">
            <span className="font-[family-name:var(--font-heading)] text-4xl text-white">
              {fixture.homeScore}
            </span>
            <span className="font-[family-name:var(--font-heading)] text-4xl text-white/25">
              –
            </span>
            <span className="font-[family-name:var(--font-heading)] text-4xl text-white">
              {fixture.awayScore}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center w-14 h-10 rounded-md bg-red-600/20">
            <span className="font-[family-name:var(--font-heading)] text-lg text-red-500">
              VS
            </span>
          </div>
        )}

        <span className="flex-1 font-[family-name:var(--font-sans)] text-base font-bold text-white">
          {getTeamName(fixture.awayTeam)}
        </span>
      </div>

      {/* Footer */}
      <div className="flex justify-center bg-white/[0.03] px-6 py-2.5">
        <span className="font-[family-name:var(--font-mono)] text-[11px] text-white/40 tracking-wide">
          {formatDate(fixture.date)} &middot; {formatTime(fixture.time)} &middot; Court{" "}
          {fixture.court}
        </span>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center rounded-full bg-white/[0.13] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-wider text-white">
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-white/[0.13] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-wider text-white/40">
      Scheduled
    </span>
  );
}
