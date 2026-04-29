"use client";

import { Lock } from "lucide-react";
import { motion } from "framer-motion";
import LeagueTable from "@/components/LeagueTable";
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

export default function WednesdayNightPage() {
  const standings = calculateStandings("wednesday");
  const wednesdayTeams = getTeamsByNight("wednesday");
  const rounds = getAllRounds("wednesday");
  const maxGamesPerRound = Math.max(
    0,
    ...rounds.map((round) => getFixturesByRound("wednesday", round).length)
  );

  // Group completed rounds descending (most recent first)
  const completedRounds = rounds
    .filter((r) => getFixturesByRound("wednesday", r).some((f) => f.status === "completed"))
    .reverse();

  // Upcoming rounds ascending (no completed fixtures)
  const upcomingRounds = rounds.filter((r) =>
    getFixturesByRound("wednesday", r).every((f) => f.status === "scheduled")
  );

  return (
    <div>
      {/* Hero Section — full-bleed image style */}
      <section className="relative overflow-hidden min-h-[480px] flex items-center justify-center">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />

        {/* Dark overlay gradient matching design */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0AEE] via-[#0A0A0A99] to-[#0A0A0ACC]" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            {/* Main heading */}
            <h1 className="font-[family-name:var(--font-heading)] text-6xl sm:text-7xl lg:text-8xl uppercase tracking-wider text-white leading-none">
              Wednesday Night
            </h1>

            {/* Stats row */}
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-white/60 font-[family-name:var(--font-geist-mono)]">
                <span className="text-red-500 font-bold">{wednesdayTeams.length}</span> Teams
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-white/60 font-[family-name:var(--font-geist-mono)]">
                <span className="text-red-500 font-bold">{rounds.length}</span> Rounds
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-white/60 font-[family-name:var(--font-geist-mono)]">
                <span className="text-red-500 font-bold">{maxGamesPerRound}</span> Games / Night
              </div>
            </div>
          </motion.div>
        </div>

        {/* Red accent line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600" />
      </section>

      <section className="bg-[#111111] border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-white/60 leading-relaxed">
            Note: Moza Mama and Hazara United joined the Wednesday competition after Round 3. <br></br>
            Their 3 unplayed entry-round matches are handled as administrative
            standings adjustments: One 3-3 draw between the two new teams and two
            3-0 losses each.
          </p>
        </div>
      </section>

      {/* Division A Table */}
      <section className="bg-[#0A0A0A] py-20 sm:py-[80px]">
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

      {/* Teams */}
      <section className="bg-[#111111] py-20 sm:py-[80px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Teams"
            subtitle={`${wednesdayTeams.length} teams in Division A`}
          />
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {wednesdayTeams.map((team, i) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-lg border border-white/10 bg-[#1A1A1A] p-5 text-center hover:border-red-500/30 transition-colors"
              >
                <div className="text-sm font-semibold text-white">{team.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      {completedRounds.length > 0 && (
        <section className="bg-[#0A0A0A] py-20 sm:py-[80px]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title="Results"
              subtitle={`${completedRounds.length} round${completedRounds.length !== 1 ? "s" : ""} played`}
            />
            <div className="mt-10 space-y-3">
              {completedRounds.map((round, i) => {
                const roundFixtures = getFixturesByRound("wednesday", round).filter(
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

      {/* Fixtures by Round */}
      {upcomingRounds.length > 0 && (
        <section className="bg-[#111111] py-20 sm:py-[80px]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title="Fixtures"
              subtitle={`${upcomingRounds.length} round${upcomingRounds.length !== 1 ? "s" : ""} remaining`}
            />
            <div className="mt-10 space-y-3">
              {upcomingRounds.map((round, i) => {
                const roundFixtures = getFixturesByRound("wednesday", round);
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
      <section className="bg-[#0A0A0A] py-20 sm:py-[80px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-dashed border-white/10 bg-[#111111] p-8 sm:p-12 text-center">
            <Lock className="h-8 w-8 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-[family-name:var(--font-heading)] uppercase tracking-wider text-white/40">
              Division B
            </h3>
            <p className="mt-2 text-sm text-white/25">
              Coming Soon — Stay tuned for more teams and more action.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
