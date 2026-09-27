import { competitionService } from "@/lib/competition-service";
import HomeContent from "@/components/HomeContent";

export default async function HomePage() {
  const [monday, wednesday, nextRound] = await Promise.all([
    competitionService.getNight("monday"), competitionService.getNight("wednesday"), competitionService.getNextRound(),
  ]);
  return <HomeContent initial={{ monday, wednesday, nextRound }} />;
}
