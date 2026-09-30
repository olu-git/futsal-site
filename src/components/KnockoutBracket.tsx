import Link from "next/link";
import SectionHeading from "./SectionHeading";
import FixtureTeam from "./FixtureTeam";
import {
  finalsDates,
  finalsMatches,
  isScheduledFinalsMatch,
  resolveFinalsSlot,
  winnerSide,
  type FinalsNightData,
  type FinalsSide,
  type FinalsSlot,
  type ResolvedFinalsTeam,
  type ScheduledFinalsMatch,
} from "@/lib/finals";
import type { CompetitionNight } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";

interface KnockoutBracketProps {
  night: CompetitionNight;
  data: FinalsNightData;
  kitColours: Record<string, string | undefined>;
  preview?: boolean;
}

const rounds = [
  { key: "R16", title: "Round of 16", week: 0 },
  { key: "QF", title: "Quarter Finals", week: 1 },
  { key: "SF", title: "Semi Finals", week: 2 },
  { key: "GF", title: "Grand Final", week: 2 },
] as const;

export default function KnockoutBracket({ night, data, kitColours, preview = false }: KnockoutBracketProps) {
  const matches = finalsMatches[night].filter(isScheduledFinalsMatch);

  return (
    <section id={preview ? undefined : "finals"} className={`bracket-section overflow-hidden ${preview ? "home-bracket" : "py-16 sm:py-20"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {!preview && <>
          <SectionHeading
            title="Road to the Final"
            subtitle="Straight knockout. 16 teams, 3 weeks, 1 trophy. Win and move on; lose and you're out."
            inverted
          />
          <p className="type-body-compact mx-auto mt-5 max-w-3xl text-center text-white/80">
            All players should read the competition{" "}
            <Link
              href="/rules"
              className="font-semibold text-white underline decoration-red-500 underline-offset-4"
            >
              rules
            </Link>{" "}
            before the knockout stages. The referee has the final say.
          </p>
        </>}

        <div
          className="mt-10 max-w-full overflow-x-auto overscroll-x-contain pb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          role="region"
          aria-label={`${night} knockout bracket`}
          tabIndex={0}
        >
          <div className={`grid gap-4 lg:gap-5 ${preview ? "min-w-[780px] grid-cols-3" : "min-w-[1040px] grid-cols-4"}`}>
            {rounds.filter((round) => !preview || round.key !== "R16").map((round) => (
              <FinalsRoundColumn
                key={round.key}
                title={round.title}
                date={finalsDates[night][round.week]}
                round={round.key}
                matches={matches.filter((match) => match.round === round.key)}
                night={night}
                data={data}
                kitColours={kitColours}
                compact={preview}
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
  matches: ScheduledFinalsMatch[];
  night: CompetitionNight;
  data: FinalsNightData;
  kitColours: Record<string, string | undefined>;
  compact?: boolean;
}

function FinalsRoundColumn({
  title,
  date,
  round,
  matches,
  night,
  data,
  kitColours,
  compact = false,
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
      <h3 className="type-card-title uppercase text-white">
        {title}
      </h3>
      <p className="mt-1 font-[family-name:var(--font-mono)] text-[9px] leading-5 text-white/80">
        {formatDate(date)}
      </p>
      <div className={`mt-4 ${compact ? "h-[600px]" : "h-[1200px]"} ${stackClass}`}>
        {[...matches].sort((a, b) => a.time.localeCompare(b.time) || a.court - b.court).map((match) => (
          <div key={match.id} className={round === "R16" ? "" : "self-center"}>
            <FinalsMatchCard match={match} night={night} data={data} kitColours={kitColours} />
          </div>
        ))}
      </div>
    </div>
  );
}

interface FinalsMatchCardProps {
  match: ScheduledFinalsMatch;
  night: CompetitionNight;
  data: FinalsNightData;
  kitColours: Record<string, string | undefined>;
}

export function FinalsMatchCard({ match, night, data, kitColours }: FinalsMatchCardProps) {
  const teamA = resolveFinalsSlot(match.a, night, data);
  const teamB = resolveFinalsSlot(match.b, night, data);
  const result = data.results[match.id];
  const winningSide = winnerSide(result);

  return (
    <div className={`bracket-match ${match.id === "gf" ? "bracket-match-final" : ""}`}>
      <div className="bracket-match-head">
        <span>{match.label}</span>
        <span>{formatTime(match.time)} &middot; Court {match.court}</span>
      </div>
      <FinalsTeamRow
        team={teamA}
        score={result?.scoreA}
        penaltyScore={result?.penaltyScoreA}
        side="A"
        winningSide={winningSide}
        kitColour={teamA ? kitColours[teamA.name] : undefined}
        placeholder={slotLabel(match.a, night)}
      />
      <FinalsTeamRow
        team={teamB}
        score={result?.scoreB}
        penaltyScore={result?.penaltyScoreB}
        side="B"
        winningSide={winningSide}
        kitColour={teamB ? kitColours[teamB.name] : undefined}
        placeholder={slotLabel(match.b, night)}
      />
      {result?.forfeitSide && <p className="bracket-match-note">
        {result.forfeitSide === "A" ? teamA?.name ?? "Team A" : teamB?.name ?? "Team B"} forfeited
      </p>}
    </div>
  );
}

interface FinalsTeamRowProps {
  team: ResolvedFinalsTeam | null;
  score?: number;
  penaltyScore?: number;
  side: FinalsSide;
  winningSide: FinalsSide | null;
  kitColour?: string;
  placeholder: string;
}

function slotLabel(slot: FinalsSlot, night: CompetitionNight) {
  if (slot.type === "seed") return "TBC";
  const feeder = finalsMatches[night].find((match) => match.id === slot.matchId);
  return `${slot.type === "winner" ? "Winner" : "Loser"} ${feeder?.label ?? slot.matchId}`;
}

function FinalsTeamRow({ team, score, penaltyScore, side, winningSide, kitColour, placeholder }: FinalsTeamRowProps) {
  const isWinner = winningSide === side;
  const isLoser = winningSide !== null && !isWinner;

  return (
    <div className={`bracket-team-row ${side === "B" ? "bracket-team-row-away" : ""} ${isWinner ? "is-winner" : ""} ${isLoser ? "is-loser" : ""}`}>
      <span className={`bracket-team-name ${!team ? "is-placeholder" : ""}`}>
        {team ? <FixtureTeam name={team.name} colour={kitColour} side="home" /> : placeholder}
      </span>
      <span className="bracket-team-score" aria-label={score === undefined ? undefined : `${score} goals${penaltyScore === undefined ? "" : `, ${penaltyScore} penalties`}`}>
        {score ?? ""}
        {penaltyScore !== undefined && (
          <span className="bracket-penalty">(P{penaltyScore})</span>
        )}
      </span>
    </div>
  );
}
