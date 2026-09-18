"use client";

import { Lock } from "lucide-react";
import CompetitionHero from "@/components/CompetitionHero";
import LeagueTable from "@/components/LeagueTable";
import KnockoutBracket from "@/components/KnockoutBracket";
import MatchCard from "@/components/MatchCard";
import RoundAccordion from "@/components/RoundAccordion";
import SectionHeading from "@/components/SectionHeading";
import { calculateStandings } from "@/lib/standings";
import {
  getTeamsByNight,
  getAllRounds,
  getFixturesByRound,
} from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default function MondayNightPage() {
  const standings = calculateStandings("monday");
  const mondayTeams = getTeamsByNight("monday");
  const rounds = getAllRounds("monday");

  // Group completed rounds descending (most recent first)
  const completedRounds = rounds
    .filter((r) => getFixturesByRound("monday", r).some((f) => f.status === "completed"))
    .reverse();

  // Upcoming rounds ascending, including partially completed rounds.
  const upcomingRounds = rounds.filter((r) =>
    getFixturesByRound("monday", r).some((f) => f.status === "scheduled")
  );
  const roundsRemaining = upcomingRounds.length;

  return (
    <div>
      <CompetitionHero nightName="Monday Night" teamCount={mondayTeams.length} />

      <KnockoutBracket night="monday" />

      {/* Division A Table */}
      <section className="bg-[var(--fis-cream)] py-20 sm:py-[80px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Division A Standings"
            subtitle="Automatically calculated from match results"
          />
          <div className="mt-10">
            <LeagueTable standings={standings} />
          </div>
        </div>
      </section>

      {/* Fixtures by Round */}
      {upcomingRounds.length > 0 && (
        <section className="bg-[var(--fis-cream-light)] py-20 sm:py-[80px]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title="Fixtures"
              subtitle={`${roundsRemaining} round${roundsRemaining !== 1 ? "s" : ""} remaining`}
            />
            <div className="mt-10 space-y-3">
              {upcomingRounds.map((round, i) => {
                const roundFixtures = getFixturesByRound("monday", round).filter(
                  (fixture) => fixture.status === "scheduled"
                );
                return (
                  <RoundAccordion
                    key={round}
                    round={round}
                    date={formatDate(roundFixtures[0]?.date ?? "")}
                    count={roundFixtures.length}
                    defaultOpen={i === 0}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {roundFixtures.map((fixture, j) => (
                        <MatchCard key={fixture.id} fixture={fixture} index={j} />
                      ))}
                    </div>
                  </RoundAccordion>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      {completedRounds.length > 0 && (
        <section className="bg-[var(--fis-cream)] py-20 sm:py-[80px]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title="Results"
              subtitle={`${completedRounds.length} round${completedRounds.length !== 1 ? "s" : ""} played`}
            />
            <div className="mt-10 space-y-3">
              {completedRounds.map((round, i) => {
                const roundFixtures = getFixturesByRound("monday", round).filter(
                  (f) => f.status === "completed"
                );
                return (
                  <RoundAccordion
                    key={round}
                    round={round}
                    date={formatDate(roundFixtures[0]?.date ?? "")}
                    count={roundFixtures.length}
                    defaultOpen={i === 0}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {roundFixtures.map((fixture, j) => (
                        <MatchCard key={fixture.id} fixture={fixture} index={j} />
                      ))}
                    </div>
                  </RoundAccordion>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Division B Coming Soon */}
      <section className="bg-[var(--fis-cream-light)] py-20 sm:py-[80px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-2 border-dashed border-[var(--fis-blue)]/30 bg-[var(--fis-cream)] p-8 text-center sm:p-12">
            <Lock className="mx-auto mb-4 h-8 w-8 text-[var(--fis-blue)]/35" />
            <h3 className="font-[family-name:var(--font-heading)] text-xl font-black uppercase tracking-[-0.02em] text-[var(--fis-blue)]/55">
              Division B
            </h3>
            <p className="mt-2 text-sm text-[var(--fis-blue)]/50">
              Coming Soon — Stay tuned for more teams and more action.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
