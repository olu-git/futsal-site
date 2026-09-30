import { competitionService } from "@/lib/competition-service";
import type { CompetitionNight } from "@/lib/types";
import CompetitionContent from "./CompetitionContent";

export default async function CompetitionPage({ night }: { night: CompetitionNight }) {
  const [monday, wednesday, nextRound, finals] = await Promise.all([
    competitionService.getNight("monday"), competitionService.getNight("wednesday"),
    competitionService.getNextRound(), competitionService.getFinals(),
  ]);
  return <CompetitionContent night={night} initial={{ monday, wednesday, nextRound }} finals={finals.finals[night]} />;
}
