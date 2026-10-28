import Link from "next/link";
import NoGamesNotice from "./NoGamesNotice";
import FixtureList from "./FixtureList";
import { activeNoticeFor } from "@/lib/site-notices";
import { formatDate, nightLabel, nightPath } from "@/lib/utils";
import type { PublicCompetitionViews } from "@/lib/use-public-competition";

export default function HomeUpcomingFixtures({ competitions, today }: {
  competitions: PublicCompetitionViews["monday"][]; today: string;
}) {
  const noticeNights = competitions.filter(competition => activeNoticeFor(competition.night, today));
  const visible = noticeNights.length ? noticeNights : competitions;
  return <div className={`home-upcoming-nights${noticeNights.length ? " home-upcoming-notices" : ""}`}>
    {visible.map(competition => {
      const round = competition.upcoming.find(round => round.date >= today);
      const notice = activeNoticeFor(competition.night, today);
      return <article key={competition.night}>
        <div className="home-upcoming-heading"><h3 className="type-card-title">{nightLabel(competition.night)}</h3><Link className="text-link" href={`${nightPath(competition.night)}#fixtures`}>Full schedule</Link></div>
        {competition.seasonName && <p className="home-upcoming-season">{competition.seasonName}</p>}
        {notice ? <NoGamesNotice notice={notice} /> : round ? <><div className="round-heading"><span>Round {round.round}</span><span>{formatDate(round.date)}</span></div><FixtureList fixtures={round.fixtures} /></> : <p className="empty-state">No upcoming regular-season fixtures are scheduled.</p>}
      </article>;
    })}
  </div>;
}

