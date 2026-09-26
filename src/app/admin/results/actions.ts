import { createClient } from "@/lib/supabase/browser";
import { submitResult, type ResultsStore, type StoredResult } from "@/lib/admin/results-service";
import type { ResultInput, ResultIntent } from "@/lib/admin/results-rules";

export type ResultActionResponse = { ok: true; message: string; id: string; status: string } | { ok: false; message: string };

const clean = (value: string | null | undefined) => value?.trim() || null;
const score = (value: unknown) => value === "" || value == null ? null : Number(value);

function sanitise(input: ResultInput): ResultInput {
  return {
    fixtureId: String(input.fixtureId), resultId: clean(input.resultId), supersedesResultId: clean(input.supersedesResultId),
    correctionReason: clean(input.correctionReason), homeScore: score(input.homeScore), awayScore: score(input.awayScore),
    forfeitSide: input.forfeitSide === "home" || input.forfeitSide === "away" ? input.forfeitSide : null,
    forfeitExceptionReason: clean(input.forfeitExceptionReason), penaltyHomeScore: score(input.penaltyHomeScore),
    penaltyAwayScore: score(input.penaltyAwayScore), penaltyWinner: input.penaltyWinner === "home" || input.penaltyWinner === "away" ? input.penaltyWinner : null,
  };
}

export async function mutateResult(input: ResultInput, intent: ResultIntent): Promise<ResultActionResponse> {
  try {
    const supabase = createClient();
    const store: ResultsStore = {
      async assertAdmin() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;
        const { data, error } = await supabase.rpc("is_fis_admin");
        return !error && data === true;
      },
      async getContext(fixtureId) {
        const { data: fixture, error: fixtureError } = await supabase.from("fixtures").select("id, stage").eq("id", fixtureId).single();
        if (fixtureError || !fixture) throw new Error("The selected fixture no longer exists.");
        if (fixture.stage !== "regular_season") throw new Error("Current finals remain managed through the existing JSON workflow.");
        const { data: versions, error } = await supabase.from("result_versions").select("id, revision, status").eq("fixture_id", fixtureId).order("revision", { ascending: false });
        if (error) throw new Error(error.message);
        const published = versions?.find((item) => item.status === "published");
        const editable = versions?.find((item) => item.status === "draft" || item.status === "pending_review");
        return { stage: fixture.stage, publishedResultId: published?.id ?? null, editableResultId: editable?.id ?? null,
          editableStatus: editable?.status as "draft" | "pending_review" | null ?? null, nextRevision: (versions?.[0]?.revision ?? 0) + 1 };
      },
      async insert(value) {
        const { data, error } = await supabase.from("result_versions").insert(toDatabase(value)).select("id, revision, status").single();
        if (error) throw databaseError(error.message);
        return { ...value, ...data } as StoredResult;
      },
      async update(id, value) {
        const { data, error } = await supabase.from("result_versions").update(toDatabase(value)).eq("id", id).in("status", ["draft", "pending_review"]).select("id, revision, status").single();
        if (error) throw databaseError(error.message);
        return { ...value, ...data } as StoredResult;
      },
      async publish(id) {
        const { error } = await supabase.rpc("publish_result", { p_result_id: id });
        if (error) throw databaseError(error.message);
      },
    };
    const result = await submitResult(store, sanitise(input), intent);
    return { ok: true, id: result.id, status: result.status, message: intent === "publish" ? "Result published." : intent === "pending_review" ? "Result is ready for review." : "Draft saved." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to save the result." };
  }
}

function toDatabase(input: ResultInput & { status: string; revision?: number }) {
  return { fixture_id: input.fixtureId, revision: input.revision, status: input.status, home_score: input.homeScore,
    away_score: input.awayScore, forfeit_side: input.forfeitSide, forfeit_exception_reason: input.forfeitExceptionReason,
    penalty_home_score: input.penaltyHomeScore, penalty_away_score: input.penaltyAwayScore, penalty_winner: input.penaltyWinner,
    supersedes_result_id: input.supersedesResultId, correction_reason: input.correctionReason };
}

function databaseError(message: string) {
  if (message.includes("result_versions_fixture_id_revision_key")) return new Error("Another revision was created first. Refresh and try again.");
  if (message.toLowerCase().includes("correction must reference")) return new Error("This correction is stale. Refresh before continuing.");
  return new Error(message);
}
