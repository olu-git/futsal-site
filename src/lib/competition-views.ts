import { competitionRepository, type CompetitionDataset } from "./competition-repository";
import { createCompetitionService } from "./competition-service";

export async function competitionViews(data: CompetitionDataset) {
  const service = createCompetitionService({ readCompetition: async () => data, readFinals: competitionRepository.readFinals });
  const [monday,wednesday,nextRound] = await Promise.all([service.getNight("monday"),service.getNight("wednesday"),service.getNextRound()]);
  const history = await Promise.all((data.archives ?? []).map(async s => {
    const archived = createCompetitionService({readCompetition:async()=>s.data,readFinals:competitionRepository.readFinals});
    return {id:s.id,name:s.name,monday:await archived.getNight("monday"),wednesday:await archived.getNight("wednesday")};
  }));
  return {monday,wednesday,nextRound,history};
}
