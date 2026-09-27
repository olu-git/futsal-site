import { createClient } from "@/lib/supabase/browser";
import type { ResultIntent } from "./results-rules";

export type RefreshOutcome = "skipped" | "queued" | "failed";

export async function refreshAfterPublication(
  intent: ResultIntent,
  result: { ok: boolean; status?: string },
  trigger: () => Promise<void>,
): Promise<RefreshOutcome> {
  if (intent !== "publish" || !result.ok || result.status !== "published") return "skipped";
  try { await trigger(); return "queued"; }
  catch { return "failed"; }
}

export async function invokeSnapshotRefresh(): Promise<void> {
  const { data, error } = await createClient().functions.invoke("trigger-snapshot-refresh", { body: {} });
  if (error || data?.code !== "queued") throw new Error("Snapshot refresh could not be queued.");
}
