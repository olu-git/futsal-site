import Image from "next/image";
import Link from "next/link";
import LeagueTable from "@/components/LeagueTable";
import MatchCard from "@/components/MatchCard";
import RegisterMenu from "@/components/RegisterMenu";
import { calculateStandings } from "@/lib/standings";
import { getUpcomingFixtures } from "@/lib/data";
import { formatDate } from "@/lib/utils";

const fillInsUrl = "https://www.facebook.com/groups/976002735537968/";

export default function HomePage() {
  const mondayStandings = calculateStandings("monday");
  const wednesdayStandings = calculateStandings("wednesday");

  const scheduledFixtures = [
    ...getUpcomingFixtures("monday"),
    ...getUpcomingFixtures("wednesday"),
  ].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.time.localeCompare(b.time) ||
      a.court - b.court
  );

  const nextFixture = scheduledFixtures[0];
  const upcomingFixtures = nextFixture
    ? scheduledFixtures.filter(
        (fixture) =>
          fixture.night === nextFixture.night &&
          fixture.round === nextFixture.round
      )
    : [];

  const nextNightLabel =
    nextFixture?.night === "wednesday" ? "Wednesday Night" : "Monday Night";

  return (
    <div>
      <section className="relative isolate min-h-[calc(100svh-5.25rem)] overflow-hidden border-b-4 border-[var(--fis-red)] font-[family-name:var(--font-mono)] text-white">
        <Image
          src="/hero-bg.png"
          alt="Competitive futsal match"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(0,23,68,0.94)_0%,rgba(0,36,105,0.74)_55%,rgba(0,23,68,0.58)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,17,50,0.58)_100%)]" />

        <div className="fis-container relative flex min-h-[calc(100svh-5.25rem)] flex-col justify-between py-8 sm:py-12">
          <div className="absolute right-4 top-5 sm:right-8 sm:top-8">
            <RegisterMenu />
          </div>

          <div className="max-w-5xl py-24 sm:py-20">
            <h1 className="max-w-5xl text-[clamp(2.75rem,10vw,8.75rem)] font-black uppercase leading-[0.9] tracking-[-0.06em] text-white">
              Futsal Indoor Soccer
            </h1>
            <p className="mt-7 max-w-xl text-[0.68rem] leading-6 text-white/80 sm:text-sm">
              Competitive and social futsal
            </p>
            <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <HeroLink href="/monday-night">Monday Night</HeroLink>
              <HeroLink href="/wednesday-night">Wednesday Night</HeroLink>
              <a
                href={fillInsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 inline-flex min-h-13 items-center justify-center border-2 border-[var(--fis-red)] bg-[var(--fis-red)] px-5 text-xs font-black uppercase tracking-[0.07em] text-white transition-colors hover:bg-[var(--fis-red-dark)] sm:col-span-1"
              >
                Fill-ins
              </a>
            </div>
          </div>

        </div>
      </section>

      <section className="bg-[var(--fis-cream)] py-20 sm:py-28">
        <div className="fis-container">
          <SectionIntro
            kicker="Standings"
            title="League Tables"
            description="A quick look at both Endeavour Hills competitions."
          />

          <div className="mt-12 grid gap-10 xl:grid-cols-2">
            <StandingsPreview
              title="Monday Night"
              href="/monday-night"
              standings={mondayStandings}
            />
            <StandingsPreview
              title="Wednesday Night"
              href="/wednesday-night"
              standings={wednesdayStandings}
            />
          </div>
        </div>
      </section>

      {nextFixture && upcomingFixtures.length > 0 && (
        <section className="border-y-4 border-[var(--fis-red)] bg-[var(--fis-blue)] py-20 text-white sm:py-24">
          <div className="fis-container">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <SectionIntro
                inverted
                kicker="Next Fixtures"
                title={nextNightLabel}
                description={`Round ${nextFixture.round} · ${formatDate(nextFixture.date)}`}
              />
              <Link
                href={`/${nextFixture.night}-night`}
                className="inline-flex min-h-12 w-fit items-center border-2 border-white px-5 text-xs font-black uppercase tracking-[0.07em] text-white transition-colors hover:bg-white hover:text-[var(--fis-blue)]"
              >
                View Competition
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingFixtures.map((fixture, index) => (
                <MatchCard key={fixture.id} fixture={fixture} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function HeroLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-13 items-center border-2 border-white/70 bg-[var(--fis-blue)]/65 px-5 text-xs font-black uppercase tracking-[0.07em] text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-[var(--fis-blue)]"
    >
      {children}
    </Link>
  );
}

function StandingsPreview({
  title,
  href,
  standings,
}: {
  title: string;
  href: string;
  standings: ReturnType<typeof calculateStandings>;
}) {
  return (
    <article>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="fis-kicker text-[var(--fis-red)]">Division A</p>
          <h3 className="mt-2 text-2xl font-black uppercase tracking-[-0.03em] text-[var(--fis-blue)]">
            {title}
          </h3>
        </div>
        <Link
          href={href}
          className="text-xs font-black uppercase tracking-[0.06em] text-[var(--fis-blue)] underline decoration-[var(--fis-red)] decoration-2 underline-offset-4"
        >
          View full table
        </Link>
      </div>
      <LeagueTable standings={standings} compact />
    </article>
  );
}

function SectionIntro({
  kicker,
  title,
  description,
  inverted = false,
}: {
  kicker: string;
  title: string;
  description: string;
  inverted?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <p className={`fis-kicker ${inverted ? "text-white/65" : "text-[var(--fis-red)]"}`}>
        {kicker}
      </p>
      <h2
        className={`mt-3 text-4xl font-black uppercase tracking-[-0.04em] sm:text-6xl ${
          inverted ? "text-white" : "text-[var(--fis-blue)]"
        }`}
      >
        {title}
      </h2>
      <p className={`mt-4 text-sm font-light leading-7 ${inverted ? "text-white/65" : "text-[var(--fis-ink)]/75"}`}>
        {description}
      </p>
    </div>
  );
}
