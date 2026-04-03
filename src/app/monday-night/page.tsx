"use client";

import { Lock } from "lucide-react";
import { motion } from "framer-motion";
import LeagueTable from "@/components/LeagueTable";
import MatchCard from "@/components/MatchCard";
import SectionHeading from "@/components/SectionHeading";
import { calculateStandings } from "@/lib/standings";
import {
  getCompletedFixtures,
  getTeamsByNight,
  getAllRounds,
  getFixturesByRound,
} from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default function MondayNightPage() {
  const standings = calculateStandings("monday");
  const results = getCompletedFixtures("monday");
  const mondayTeams = getTeamsByNight("monday");
  const rounds = getAllRounds("monday");

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
            {/* Eyebrow badge */}
            <span className="inline-flex items-center rounded-full border border-red-500/40 bg-red-500/20 px-4 py-1.5 mb-8">
              <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-red-500 font-semibold">
                Every Monday Night
              </span>
            </span>

            {/* Main heading */}
            <h1 className="font-[family-name:var(--font-heading)] text-6xl sm:text-7xl lg:text-8xl uppercase tracking-wider text-white leading-none">
              Monday Night
            </h1>

            {/* Tagline */}
            <p className="mt-6 text-lg sm:text-xl text-white/50 max-w-xl font-[family-name:var(--font-sans)]">
              8 teams competing in Division A. Court 1 runs 3 games, Court 2 runs 1 game per night.
            </p>

            {/* Stats row */}
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-white/60 font-[family-name:var(--font-geist-mono)]">
                <span className="text-red-500 font-bold">{mondayTeams.length}</span> Teams
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-white/60 font-[family-name:var(--font-geist-mono)]">
                <span className="text-red-500 font-bold">14</span> Rounds
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-white/60 font-[family-name:var(--font-geist-mono)]">
                <span className="text-red-500 font-bold">4</span> Games / Night
              </div>
            </div>
          </motion.div>
        </div>

        {/* Red accent line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600" />
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
            subtitle={`${mondayTeams.length} teams in Division A`}
          />
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {mondayTeams.map((team, i) => (
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
      {results.length > 0 && (
        <section className="bg-[#0A0A0A] py-20 sm:py-[80px]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title="Results"
              subtitle={`${results.length} completed matches`}
            />
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((fixture, i) => (
                <MatchCard key={fixture.id} fixture={fixture} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Fixtures by Round */}
      <section className="bg-[#111111] py-20 sm:py-[80px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Fixtures"
            subtitle="Full season schedule by round"
          />
          <div className="mt-10 space-y-10">
            {rounds.map((round) => {
              const roundFixtures = getFixturesByRound("monday", round);
              const hasResults = roundFixtures.some((f) => f.status === "completed");
              if (hasResults) return null;

              return (
                <div key={round}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-[family-name:var(--font-heading)] text-lg uppercase tracking-wider text-white">
                      Round {round}
                    </span>
                    <div className="w-[30px] h-[2px] bg-red-600" />
                    <span className="text-xs text-white/40 font-[family-name:var(--font-geist-mono)]">
                      {formatDate(roundFixtures[0]?.date ?? "")}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roundFixtures.map((fixture, i) => (
                      <MatchCard key={fixture.id} fixture={fixture} index={i} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

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
