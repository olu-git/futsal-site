import Link from "next/link";
import SectionHeading from "./SectionHeading";
import {
  finalsDates,
  finalsMatches,
  resolveFinalsSlot,
  winnerSide,
  type FinalsMatch,
  type FinalsNightData,
  type FinalsSide,
  type ResolvedFinalsTeam,
} from "@/lib/finals";
import type { CompetitionNight } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";

interface KnockoutBracketProps {
  night: CompetitionNight;
  data: FinalsNightData;
}

const rounds = [
  { key: "R16", title: "Round of 16", week: 0 },
  { key: "QF", title: "Quarter Finals", week: 1 },
  { key: "SF", title: "Semi Finals", week: 2 },
  { key: "GF", title: "Grand Final", week: 2 },
] as const;

export default function KnockoutBracket({ night, data }: KnockoutBracketProps) {
  const matches = finalsMatches[night];
  const gradingGames = matches.filter((match) => match.round === "Grading");

  return (
    <section id="finals" className="overflow-hidden bg-[#111111] py-20 sm:py-[80px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Road to the Final"
          subtitle="Straight knockout. 16 teams, 3 weeks, 1 trophy. Win and move on; lose and you're out."
        />
        <p className="mx-auto mt-5 max-w-3xl text-center text-sm leading-6 text-white/55">
          All players should read the competition{" "}
          <Link
            href="/rules"
            className="font-semibold text-red-500 underline decoration-red-500/50 underline-offset-4 transition-colors hover:text-red-400"
          >
            rules
          </Link>{" "}
          before the knockout stages. The referee has the final say.
        </p>

        <div className="mt-10 rounded-lg border border-white/10 bg-[#151515] p-4 sm:p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="font-[family-name:var(--font-heading)] text-2xl uppercase tracking-wider text-white">
                Grading Games
              </h3>
              <p className="mt-1 text-sm text-white/45">
                Round of 16 teams continuing in grading matches
              </p>
            </div>
            <p className="font-[family-name:var(--font-mono)] text-xs text-white/40">
              {formatDate(finalsDates[night][1])}
            </p>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {gradingGames.map((match) => (
              <FinalsMatchCard key={match.id} match={match} night={night} data={data} />
            ))}
          </div>
        </div>

        <div
          className="mt-10 max-w-full overflow-x-auto overscroll-x-contain pb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          role="region"
          aria-label={`${night} knockout bracket`}
          tabIndex={0}
        >
          <div className="grid min-w-[1040px] grid-cols-4 gap-4 lg:gap-5">
            {rounds.map((round) => (
              <FinalsRoundColumn
                key={round.key}
                title={round.title}
                date={finalsDates[night][round.week]}
                round={round.key}
                matches={matches.filter((match) => match.round === round.key)}
                night={night}
                data={data}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface FinalsRoundColumnProps {
  title: string;
  date: string;
  round: "R16" | "QF" | "SF" | "GF";
  matches: FinalsMatch[];
  night: CompetitionNight;
  data: FinalsNightData;
}

function FinalsRoundColumn({
  title,
  date,
  round,
  matches,
  night,
  data,
}: FinalsRoundColumnProps) {
  const stackClass =
    round === "R16"
      ? "grid grid-rows-8 gap-3"
      : round === "QF"
        ? "grid grid-rows-4"
        : round === "SF"
          ? "grid grid-rows-2"
          : "flex items-center";

  return (
    <div className="min-w-0">
      <h3 className="font-[family-name:var(--font-heading)] text-xl uppercase tracking-wider text-white">
        {title}
      </h3>
      <p className="mt-1 font-[family-name:var(--font-mono)] text-xs text-white/40">
        {formatDate(date)}
      </p>
      <div className={`mt-4 h-[960px] ${stackClass}`}>
        {matches.map((match) => (
          <div key={match.id} className={round === "R16" ? "" : "self-center"}>
            <FinalsMatchCard match={match} night={night} data={data} />
          </div>
        ))}
      </div>
    </div>
  );
}

interface FinalsMatchCardProps {
  match: FinalsMatch;
  night: CompetitionNight;
  data: FinalsNightData;
}

function FinalsMatchCard({ match, night, data }: FinalsMatchCardProps) {
  const teamA = resolveFinalsSlot(match.a, night, data);
  const teamB = resolveFinalsSlot(match.b, night, data);
  const result = data.results[match.id];
  const winningSide = winnerSide(result);

  return (
    <div
      className={`overflow-hidden rounded-lg bg-[#1A1A1A] ${
        match.id === "gf"
          ? "border border-red-600"
          : "border border-white/10 border-l-[3px] border-l-red-600"
      }`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-3 py-2 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-white/45">
        <span className="font-semibold text-white/85">{match.label}</span>
        <span className="whitespace-nowrap">
          {formatTime(match.time)} &middot; Ct {match.court}
        </span>
      </div>
      <FinalsTeamRow
        team={teamA}
        score={result?.scoreA}
        penaltyScore={result?.penaltyScoreA}
        side="A"
        winningSide={winningSide}
      />
      <FinalsTeamRow
        team={teamB}
        score={result?.scoreB}
        penaltyScore={result?.penaltyScoreB}
        side="B"
        winningSide={winningSide}
      />
    </div>
  );
}

interface FinalsTeamRowProps {
  team: ResolvedFinalsTeam | null;
  score?: number;
  penaltyScore?: number;
  side: FinalsSide;
  winningSide: FinalsSide | null;
}

function FinalsTeamRow({ team, score, penaltyScore, side, winningSide }: FinalsTeamRowProps) {
  const isWinner = winningSide === side;
  const isLoser = winningSide !== null && !isWinner;

  return (
    <div
      className={`flex min-h-10 items-center gap-2 px-3 py-2 text-sm ${
        side === "B" ? "border-t border-white/10" : ""
      } ${isWinner ? "bg-white/[0.04]" : ""}`}
    >
      <span
        className={`min-w-0 flex-1 truncate pl-1 font-semibold ${
          !team
            ? "font-[family-name:var(--font-mono)] text-xs font-normal uppercase tracking-wider text-white/35"
            : isWinner
              ? "text-red-500"
              : isLoser
                ? "text-white/40"
                : "text-white"
        }`}
      >
        {team?.name ?? "TBC"}
      </span>
      <span
        className={`w-12 shrink-0 text-right font-[family-name:var(--font-mono)] text-sm ${
          isWinner ? "font-semibold text-red-500" : "text-white/45"
        }`}
      >
        {score ?? ""}
        {penaltyScore !== undefined && (
          <span className="ml-1 text-[9px] uppercase text-white/40">(P{penaltyScore})</span>
        )}
      </span>
    </div>
  );
}
