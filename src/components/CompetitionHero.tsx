import PageHero from "./PageHero";
import { site } from "@/lib/site-content";

export default function CompetitionHero({ nightName, teamCount, imageSrc = site.actionPhoto }: {
  nightName: string; teamCount: number; imageSrc?: string;
}) {
  return <PageHero title={nightName} image={imageSrc}>
    <div className="competition-stats"><span>{teamCount} TEAMS</span><span>FROM 7PM</span><span>{site.venue}</span></div>
  </PageHero>;
}
