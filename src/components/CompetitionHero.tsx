import PageHero from "./PageHero";
import { site } from "@/lib/site-content";
import type { CompetitionNight } from "@/lib/types";

const photos = {
  monday: { src: "/images/monday-night-action.jpg", alt: "FIS player in a white shirt dribbling a futsal ball on the indoor court" },
  wednesday: { src: "/images/wednesday-night-handshake.jpg", alt: "FIS players smiling and sharing a handshake beside the court" },
};

export default function CompetitionHero({ night, nightName, teamCount }: {
  night: CompetitionNight; nightName: string; teamCount: number;
}) {
  const photo = photos[night];
  return <PageHero title={nightName} image={photo.src} imageAlt={photo.alt} className={`competition-photo-hero competition-hero-${night}`}>
    <div className="competition-stats"><span>{teamCount} TEAMS</span><span>FROM 7PM</span><span>{site.venue}</span></div>
  </PageHero>;
}
