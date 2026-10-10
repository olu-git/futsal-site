import teams from "@/data/teams.json";
import { canonicalTeamReadableId } from "./team-readable-id";

const declansOfficialName = teams.find((team) => team.id === "mon-declans-delinquents")?.name;

export function teamDisplayName(legacyId: string | null, publishedName: string): string {
  return legacyId && canonicalTeamReadableId(legacyId) === "mon-declans-delinquents" ? declansOfficialName ?? publishedName : publishedName;
}
