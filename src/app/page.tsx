import Link from "next/link";
import PageHero from "@/components/PageHero";
import LeagueTable from "@/components/LeagueTable";
import FixtureList from "@/components/FixtureList";
import { RegisterButton } from "@/components/RegistrationProvider";
import { competitionService } from "@/lib/competition-service";
import { site } from "@/lib/site-content";
import { formatDate, nightLabel, nightPath } from "@/lib/utils";

export default async function HomePage() {
  const [monday, wednesday, nextRound] = await Promise.all([
    competitionService.getNight("monday"), competitionService.getNight("wednesday"), competitionService.getNextRound(),
  ]);
  return <>
    <div className="home-hero-wrap">
      <PageHero title="Futsal Indoor Soccer" image={site.actionPhoto} home>
        <div className="hero-actions"><Link href="/monday-night">Monday Night</Link><Link href="/wednesday-night">Wednesday Night</Link><a className="fill-ins" href={site.fillIns} target="_blank" rel="noopener noreferrer">Fill-ins</a></div>
      </PageHero>
      <div className="hero-register fis-container"><RegisterButton className="register-hero-button" /></div>
    </div>
    <section className="fis-section fis-container" id="standings">
      <p className="eyebrow">Current standings</p><h2 className="section-title">League Tables</h2>
      <div className="standings-previews">{[monday, wednesday].flatMap((competition) => competition.divisions.map(({ division, standings, teams }) => <article key={`${competition.night}-${division}`}>
        <Link className="league-head" href={`${nightPath(competition.night)}#standings`}>
          <h3>{nightLabel(competition.night)}{competition.divisions.length > 1 && ` / Division ${division}`}</h3><span>View Table</span>
        </Link>
        <LeagueTable standings={standings} teams={teams} compact label={`${nightLabel(competition.night)} Division ${division} top five`} />
      </article>))}</div>
    </section>
    <section className="fis-section fis-container" id="next-fixtures">
      <div className="section-head"><div><p className="eyebrow">Next scheduled night</p><h2 className="section-title">Upcoming Fixtures</h2></div>{nextRound && <Link className="text-link" href={`${nightPath(nextRound.night)}#fixtures`}>View {nextRound.night}</Link>}</div>
      {nextRound ? <div className="next-round"><div className="round-heading"><span>{nightLabel(nextRound.night)} / Round {nextRound.round}</span><span>{formatDate(nextRound.date)}</span></div><FixtureList fixtures={nextRound.fixtures} /></div> : <p className="empty-state">No upcoming regular-season fixtures are scheduled.</p>}
    </section>
  </>;
}
