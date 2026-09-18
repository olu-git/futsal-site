"use client";

import { Fixture } from "@/lib/types";
import { getTeamName } from "@/lib/data";
import { formatDate, formatTime } from "@/lib/utils";

interface MatchCardProps {
  fixture: Fixture;
  index?: number;
}

export default function MatchCard({ fixture }: MatchCardProps) {
  const isCompleted = fixture.status === "completed";

  return (
    <article className="overflow-hidden border-2 border-white/30 bg-[var(--fis-cream-light)] text-[var(--fis-blue)] shadow-[4px_4px_0_var(--fis-red)]">
      {/* Top bar */}
      <div
        className={`flex items-center justify-between px-4 py-2 ${
          isCompleted ? "bg-[var(--fis-red)]" : "bg-[var(--fis-blue)]"
        }`}
      >
        <span className="font-[family-name:var(--font-mono)] text-[0.55rem] uppercase leading-4 tracking-wider text-white">
          Round {fixture.round}
        </span>
        <StatusBadge status={fixture.status} />
      </div>

      {/* Body - teams and score */}
      <div className="flex items-center justify-center gap-5 px-6 py-7">
        <span className="flex-1 text-right font-[family-name:var(--font-mono)] text-[0.62rem] leading-5 text-[var(--fis-blue)]">
          {getTeamName(fixture.homeTeam)}
        </span>

        {isCompleted ? (
          <div className="flex items-center gap-2">
            <span className="font-[family-name:var(--font-heading)] text-4xl font-black text-[var(--fis-blue)]">
              {fixture.homeScore}
            </span>
            <span className="font-[family-name:var(--font-heading)] text-4xl text-[var(--fis-blue)]/25">
              –
            </span>
            <span className="font-[family-name:var(--font-heading)] text-4xl font-black text-[var(--fis-blue)]">
              {fixture.awayScore}
            </span>
          </div>
        ) : (
          <div className="flex h-10 w-14 items-center justify-center bg-[var(--fis-red)]/10">
            <span className="font-[family-name:var(--font-heading)] text-lg font-black text-[var(--fis-red)]">
              VS
            </span>
          </div>
        )}

        <span className="flex-1 font-[family-name:var(--font-mono)] text-[0.62rem] leading-5 text-[var(--fis-blue)]">
          {getTeamName(fixture.awayTeam)}
        </span>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center justify-center border-t border-[var(--fis-blue)]/15 bg-[var(--fis-cream)] px-6 py-3">
        <span className="font-[family-name:var(--font-mono)] text-[0.52rem] leading-4 text-[var(--fis-blue)]/70 tracking-wide">
          {formatDate(fixture.date)} &middot; {formatTime(fixture.time)} &middot; Court{" "}
          {fixture.court}
        </span>
        {fixture.note && (
          <span className="mt-1 text-center font-[family-name:var(--font-sans)] text-[10px] leading-relaxed text-[var(--fis-blue)]/70">
            {fixture.note}
          </span>
        )}
      </div>
    </article>
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
