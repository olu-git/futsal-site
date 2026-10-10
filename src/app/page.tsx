import { competitionService } from "@/lib/competition-service";
import HomeContent from "@/components/HomeContent";
import { jsonCompetitionData } from "@/lib/competition-repository";
import { competitionViews } from "@/lib/competition-views";

export default async function HomePage() {
  const [initial, finals] = await Promise.all([competitionViews(jsonCompetitionData), competitionService.getFinals()]);
  return <HomeContent initial={initial} finals={finals} />;
}
