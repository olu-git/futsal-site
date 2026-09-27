import { createClient } from "@/lib/supabase/browser";
import type { FixtureChange } from "./fixture-changes";

export type FixtureMutationResult = { ok: true; id: string; version?: number } | { ok: false; message: string };
async function adminClient() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Your administrator session has expired.");
  const { data, error } = await supabase.rpc("is_fis_admin");
  if (error || data !== true) throw new Error("Administrator access is required.");
  return supabase;
}
const failure = (error: unknown): FixtureMutationResult => ({ ok: false, message: error instanceof Error ? error.message : "Unable to update fixtures." });
const dbError = (message: string) => /stale/i.test(message) ? "This change set is stale. Refresh and review it again." : message;

export async function createFixtureDraft(input: { competitionSeasonId: string; title: string; note: string; source: "manual"|"json_upload" }): Promise<FixtureMutationResult> {
  try { const supabase = await adminClient(); const { data, error } = await supabase.rpc("create_fixture_change_set", { p_competition_season_id: input.competitionSeasonId, p_title: input.title.trim(), p_source: input.source, p_overall_note: input.note.trim() || null });
    if (error) throw new Error(dbError(error.message)); return { ok: true, id: String(data) }; } catch (error) { return failure(error); }
}
export async function replaceFixtureDraft(id: string, version: number, changes: FixtureChange[]): Promise<FixtureMutationResult> {
  try { const supabase = await adminClient(); const items = changes.map((change) => ({ operation: change.operation, fixtureId: change.fixtureId, expectedFixtureVersion: change.expectedFixtureVersion,
    reason: change.reason, proposed: change.proposed, homeTeamName: change.homeTeamName, awayTeamName: change.awayTeamName }));
    const { data, error } = await supabase.rpc("replace_fixture_change_items", { p_change_set_id: id, p_expected_version: version, p_items: items });
    if (error) throw new Error(dbError(error.message)); return { ok: true, id, version: Number(data) }; } catch (error) { return failure(error); }
}
export async function transitionFixtureDraft(id: string, version: number, action: "submit"|"return"|"cancel", acknowledgeWarnings=false): Promise<FixtureMutationResult> {
  try { const supabase = await adminClient(); const { data, error } = await supabase.rpc("transition_fixture_change_set", { p_change_set_id:id, p_expected_version:version, p_action:action, p_acknowledge_warnings:acknowledgeWarnings });
    if (error) throw new Error(dbError(error.message)); return { ok:true,id,version:Number(data) }; } catch(error) { return failure(error); }
}
export async function publishFixtureDraft(id: string, version: number): Promise<FixtureMutationResult> {
  try { const supabase = await adminClient(); const { error } = await supabase.rpc("publish_fixture_change_set", { p_change_set_id:id, p_expected_version:version });
    if (error) throw new Error(dbError(error.message)); return { ok:true,id }; } catch(error) { return failure(error); }
}
