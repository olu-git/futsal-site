import type { CompetitionNight } from "@/lib/types";
import CompetitionContent from "./CompetitionContent";
import { jsonCompetitionData } from "@/lib/competition-repository";
import { competitionViews } from "@/lib/competition-views";

export default async function CompetitionPage({ night }: { night: CompetitionNight }) {
  const initial = await competitionViews(jsonCompetitionData);
  return <CompetitionContent night={night} initial={initial} />;
}
