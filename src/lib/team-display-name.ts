import teams from "@/data/teams.json";

const declansOfficialName = teams.find((team) => team.id === "mon-declans-team")?.name;

export function teamDisplayName(legacyId: string | null, publishedName: string): string {
  return legacyId === "mon-declans-team" ? declansOfficialName ?? publishedName : publishedName;
}
