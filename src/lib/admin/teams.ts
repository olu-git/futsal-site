export type TeamStatus = "active" | "inactive" | "withdrawn" | "replaced";
export type PreferenceStrength = "required" | "preferred" | "avoid";

export interface TeamPreference {
  id?: string;
  kickoffTime: string;
  classification: PreferenceStrength;
}

export interface AdminTeam {
  id: string;
  competitionSeasonId: string;
  name: string;
  status: TeamStatus;
  standingsEligible: boolean;
  kitColour: string | null;
  note: string;
  preferences: TeamPreference[];
  hasHistory: boolean;
  profileVersion: number;
}

export interface TeamEdition {
  id: string;
  night: "monday" | "wednesday";
  division: string;
  label: string;
  season: string;
  lifecycle: "planned" | "active" | "archived";
}

export interface TeamDraft {
  name: string;
  status: TeamStatus;
  competitionSeasonId: string;
  kitColour: string;
  note: string;
  preferences: TeamPreference[];
}

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const colourPattern = /^#[0-9a-f]{6}$/i;

export function filterAdminTeams(teams: AdminTeam[], input: { editionId: string; search: string; status: TeamStatus | "all" }) {
  const search = input.search.trim().toLowerCase();
  return teams.filter((team) => team.competitionSeasonId === input.editionId &&
    (input.status === "all" || team.status === input.status) && (!search || team.name.toLowerCase().includes(search)))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function validateKitColour(value: string) {
  const colour = value.trim();
  return colour === "" || colourPattern.test(colour);
}

export function validateTeamPreferences(preferences: TeamPreference[]) {
  const errors: string[] = [];
  const times = new Map<string, PreferenceStrength>();
  preferences.forEach((preference, index) => {
    if (!timePattern.test(preference.kickoffTime)) errors.push(`Preference ${index + 1} has an invalid kick-off time.`);
    const existing = times.get(preference.kickoffTime);
    if (existing === preference.classification) errors.push(`Preference ${index + 1} duplicates ${preference.kickoffTime} ${preference.classification}.`);
    else if (existing) errors.push(`${preference.kickoffTime} cannot be both ${existing} and ${preference.classification}.`);
    times.set(preference.kickoffTime, preference.classification);
  });
  return errors;
}

export function validateTeamDraft(original: AdminTeam, draft: TeamDraft, administrativeReason = "") {
  const errors = validateTeamPreferences(draft.preferences);
  if (!draft.name.trim()) errors.unshift("Team name is required.");
  if (!validateKitColour(draft.kitColour)) errors.push("Kit colour must be a six-digit hex value such as #FFFFFF.");
  if (original.hasHistory && original.competitionSeasonId !== draft.competitionSeasonId)
    errors.push("Teams with fixture or standing history cannot be moved to another competition season.");
  if (consequentialTeamChanges(original, draft).length && !administrativeReason.trim())
    errors.push("An administrative reason is required for consequential changes.");
  return errors;
}

export function consequentialTeamChanges(original: AdminTeam, draft: TeamDraft) {
  const changes: string[] = [];
  if (original.competitionSeasonId !== draft.competitionSeasonId) changes.push("Move this team to another competition or division");
  if (original.status === "active" && draft.status !== "active") changes.push(`Change an active team to ${draft.status}`);
  if (original.status !== "active" && draft.status === "active") changes.push("Reactivate this team");
  if (original.name.trim() !== draft.name.trim() && original.hasHistory) changes.push("Rename a team that already has fixture or standings history");
  return changes;
}

export const cleanFixtureNote = (value: string) => value.trim() || null;
