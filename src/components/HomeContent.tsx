"use client";

import Link from "next/link";
import PageHero from "./PageHero";
import LeagueTable from "./LeagueTable";
import FixtureList from "./FixtureList";
import { RegisterButton } from "./RegistrationProvider";
import { usePublicCompetition, SnapshotNotice, type PublicCompetitionViews } from "@/lib/use-public-competition";
import { site } from "@/lib/site-content";
import { formatDate, nightLabel, nightPath } from "@/lib/utils";
import type { FinalsSeasonData } from "@/lib/finals";
import KnockoutPreview from "./KnockoutPreview";
import HomeTvFeature from "./HomeTvFeature";

export default function HomeContent({ initial, finals }: { initial: PublicCompetitionViews; finals: FinalsSeasonData }) {
  const { views, source } = usePublicCompetition(initial);
  const { monday, wednesday } = views;
  return <>
    <div className="home-hero-wrap">
      <PageHero title="Futsal Indoor Soccer" image={site.homeHeroPhoto} imageAlt="Six FIS players standing together in front of an indoor futsal goal" home>
        <div className="hero-actions"><Link href="/monday-night">Monday Night</Link><Link href="/wednesday-night">Wednesday Night</Link><a className="fill-ins" href={site.fillIns} target="_blank" rel="noopener noreferrer">Fill-ins</a></div>
      </PageHero>
      <div className="hero-register fis-container"><RegisterButton className="register-hero-button" /></div>
    </div>
    <SnapshotNotice source={source} />
    <section className="fis-section fis-container" id="next-fixtures">
      <h2 className="section-title">Upcoming Fixtures</h2>
      <div className="home-upcoming-nights">{[monday,wednesday].map(competition => {
        const round = competition.upcoming[0];
        return <article key={competition.night}>
          <div className="section-head"><div><h3 className="type-card-title">{nightLabel(competition.night)}</h3>{competition.seasonName && <p>{competition.seasonName}</p>}</div><Link className="text-link" href={`${nightPath(competition.night)}#fixtures`}>Full schedule</Link></div>
          {round ? <><div className="round-heading"><span>Round {round.round}</span><span>{formatDate(round.date)}</span></div><FixtureList fixtures={round.fixtures} /></> : <p className="empty-state">No upcoming regular-season fixtures are scheduled.</p>}
        </article>;
      })}</div>
    </section>
    <section className="fis-section fis-container" id="standings">
      <p className="eyebrow">Current standings</p><h2 className="section-title">League Tables</h2>
      {!monday.divisions.length && !wednesday.divisions.length && <p className="empty-state">No standings are available yet.</p>}
      <div className="standings-previews">{[monday, wednesday].flatMap((competition) => competition.divisions.map(({ division, standings, teams }) => <article key={`${competition.night}-${division}`}>
        <Link className="league-head" href={`${nightPath(competition.night)}#standings`}>
          <h3>{nightLabel(competition.night)}{competition.divisions.length > 1 && ` / Division ${division}`}</h3><span>View Table</span>
        </Link>
        <LeagueTable standings={standings} teams={teams} compact label={`${nightLabel(competition.night)} Division ${division} top five`} />
      </article>))}</div>
    </section>
    <HomeTvFeature />
    <KnockoutPreview finals={finals} competitions={{ monday, wednesday }} />
  </>;
}
