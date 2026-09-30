import { createClient } from "@/lib/supabase/browser";
import { cleanFixtureNote, validateTeamDraft, type AdminTeam, type TeamDraft } from "./teams";

export type TeamMutationResult = { ok: true; profileVersion: number } | { ok: false; message: string };

function friendlyMessage(message: string) {
  if (/stale|changed since/i.test(message)) return "This team profile changed after you opened it. Refresh and review the latest values before saving again.";
  if (/administrator access|permission|row-level security|jwt/i.test(message)) return "Administrator access is required. Your session may have expired.";
  if (/duplicate team name/i.test(message)) return "A team with this name already exists in the selected competition season.";
  return message;
}

export async function saveTeamProfile(original: AdminTeam, draft: TeamDraft, administrativeReason: string): Promise<TeamMutationResult> {
  try {
    const errors = validateTeamDraft(original, draft, administrativeReason);
    if (errors.length) throw new Error(errors[0]);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Your administrator session has expired.");
    const { data: isAdmin, error: adminError } = await supabase.rpc("is_fis_admin");
    if (adminError || isAdmin !== true) throw new Error("Administrator access is required.");
    const { data, error } = await supabase.rpc("save_team_profile", {
      p_team_id: original.id,
      p_expected_profile_version: original.profileVersion,
      p_name: draft.name.trim(),
      p_status: draft.status,
      p_competition_season_id: draft.competitionSeasonId,
      p_kit_colour: draft.kitColour.trim() || null,
      p_preferences: draft.preferences.map((item) => ({ kickoff_time: item.kickoffTime, classification: item.classification })),
      p_fixture_note: cleanFixtureNote(draft.note),
      p_administrative_reason: administrativeReason.trim() || null,
    });
    if (error) throw new Error(friendlyMessage(error.message));
    const result = Array.isArray(data) ? data[0] : data;
    if (!result || typeof result.profile_version !== "number") throw new Error("The saved team profile response was incomplete.");
    return { ok: true, profileVersion: result.profile_version };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to save team profile." };
  }
}
