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
import KnockoutPreview, { hasCurrentFinals } from "./KnockoutPreview";

export default function HomeContent({ initial, finals }: { initial: PublicCompetitionViews; finals: FinalsSeasonData }) {
  const { views, source } = usePublicCompetition(initial);
  const { monday, wednesday, nextRound } = views;
  const showFinals = !nextRound && hasCurrentFinals(finals);
  return <>
    <div className="home-hero-wrap">
      <PageHero title="Futsal Indoor Soccer" image={site.homeHeroPhoto} imageAlt="Six FIS players standing together in front of an indoor futsal goal" home>
        <div className="hero-actions"><Link href="/monday-night">Monday Night</Link><Link href="/wednesday-night">Wednesday Night</Link><a className="fill-ins" href={site.fillIns} target="_blank" rel="noopener noreferrer">Fill-ins</a></div>
      </PageHero>
      <div className="hero-register fis-container"><RegisterButton className="register-hero-button" /></div>
    </div>
    <SnapshotNotice source={source} />
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
    {showFinals ? <KnockoutPreview finals={finals} competitions={{ monday, wednesday }} /> : <section className="fis-section fis-container" id="next-fixtures">
      <div className="section-head"><div><p className="eyebrow">Next scheduled night</p><h2 className="section-title">Upcoming Fixtures</h2></div>{nextRound && <Link className="text-link" href={`${nightPath(nextRound.night)}#fixtures`}>View {nextRound.night}</Link>}</div>
      {nextRound ? <div className="next-round"><div className="round-heading"><span>{nightLabel(nextRound.night)} / Round {nextRound.round}</span><span>{formatDate(nextRound.date)}</span></div><FixtureList fixtures={nextRound.fixtures} /></div> : <p className="empty-state">No upcoming regular-season fixtures are scheduled.</p>}
    </section>}
    <section className="fis-container home-tv-entry" aria-labelledby="watch-the-action">
      <div><p className="eyebrow">FIS TV</p><h2 id="watch-the-action" className="type-section-title">WATCH THE ACTION</h2><p>Catch the latest match replays, highlights and moments from FIS.</p></div>
      <Link className="text-link" href="/fis-tv">EXPLORE FIS TV <span aria-hidden="true">→</span></Link>
    </section>
  </>;
}
