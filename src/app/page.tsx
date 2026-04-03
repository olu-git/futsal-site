"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import LeagueTable from "@/components/LeagueTable";
import MatchCard from "@/components/MatchCard";
import SectionHeading from "@/components/SectionHeading";
import NightCard from "@/components/NightCard";
import { calculateStandings } from "@/lib/standings";
import { getCompletedFixtures, getUpcomingFixtures } from "@/lib/data";

export default function HomePage() {
  const mondayStandings = calculateStandings("monday");

  const mondayResults = getCompletedFixtures("monday").slice(0, 3);
  const wednesdayResults = getCompletedFixtures("wednesday").slice(0, 3);
  const latestResults = [...mondayResults, ...wednesdayResults]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  const mondayUpcoming = getUpcomingFixtures("monday").slice(0, 3);
  const wednesdayUpcoming = getUpcomingFixtures("wednesday").slice(0, 3);
  const upcomingFixtures = [...mondayUpcoming, ...wednesdayUpcoming]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[600px] flex items-center justify-center">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />

        {/* Dark overlay gradient matching design */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0AEE] via-[#0A0A0A99] to-[#0A0A0ACC]" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            {/* Eyebrow badge */}
            <span className="inline-flex items-center rounded-full border border-red-500/40 bg-red-500/20 px-4 py-1.5 mb-8">
              <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-red-500">
                Monday & Wednesday Nights
              </span>
            </span>

            {/* Main heading */}
            <h1 className="font-[family-name:var(--font-heading)] text-7xl sm:text-8xl lg:text-[96px] uppercase tracking-wider text-white leading-none">
              Futsal League
            </h1>

            {/* Tagline */}
            <p className="mt-6 text-lg sm:text-xl text-white/50 max-w-xl font-[family-name:var(--font-sans)]">
              Your local futsal competition. League tables, fixtures,
              results, and standings.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/monday-night"
                className="inline-flex items-center rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Monday Night
              </Link>
              <Link
                href="/wednesday-night"
                className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Wednesday Night
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Red accent line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600" />
      </section>

      {/* Standings Section */}
      <section className="bg-[#0A0A0A] py-20 sm:py-[120px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Monday Night League"
            subtitle="Current Division A standings"
          />
          <div className="mt-10">
            <LeagueTable standings={mondayStandings} compact />
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/monday-night"
              className="inline-flex items-center text-sm text-red-500 hover:text-red-400 transition-colors font-[family-name:var(--font-geist-mono)] uppercase tracking-wider"
            >
              View Full Table &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Results */}
      {latestResults.length > 0 && (
        <section className="bg-[#111111] py-20 sm:py-[120px]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title="Latest Results"
              subtitle="Recent completed matches"
            />
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestResults.map((fixture, i) => (
                <MatchCard key={fixture.id} fixture={fixture} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Fixtures */}
      {upcomingFixtures.length > 0 && (
        <section className="bg-[#0A0A0A] py-20 sm:py-[120px]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title="Upcoming Fixtures"
              subtitle="Next matches on the schedule"
            />
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingFixtures.map((fixture, i) => (
                <MatchCard key={fixture.id} fixture={fixture} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="bg-[#111111] py-20 sm:py-[120px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left: Text content */}
            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-[40px] uppercase tracking-wider text-white leading-tight">
                About the Competition
              </h2>
              <div className="w-[60px] h-[3px] bg-red-600 mt-4" />
              <div className="mt-8 space-y-5 text-white/50 text-base leading-relaxed font-[family-name:var(--font-sans)]">
                <p>
                  Our futsal league brings together teams from across the community for
                  fast-paced, competitive indoor football. With matches running on both
                  Monday and Wednesday nights, there&apos;s always action on the court.
                </p>
                <p>
                  Division A is currently in full swing with 8 teams on Monday and 10 on
                  Wednesday. Division B is coming soon as we continue to grow. Whether
                  you&apos;re here to play, watch, or support — welcome to the league.
                </p>
                <p>
                  Tables are calculated automatically from match results using the standard
                  futsal points system: 3 for a win, 1 for a draw, 0 for a loss.
                </p>
              </div>
            </div>

            {/* Right: Night cards */}
            <div className="flex flex-col gap-4 justify-center">
              <NightCard
                title="Monday Night"
                href="/monday-night"
                description="8 teams battle it out every Monday. Division A in full swing."
                index={0}
              />
              <NightCard
                title="Wednesday Night"
                href="/wednesday-night"
                description="10 teams compete every Wednesday. Fast-paced action."
                index={1}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
