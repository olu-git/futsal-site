import { normaliseResultInput, validateResultInput, type FixtureResultContext, type ResultInput, type ResultIntent } from "./results-rules";

export type StoredResult = ResultInput & { id: string; revision: number; status: string };

export interface ResultsStore {
  assertAdmin(): Promise<boolean>;
  getContext(fixtureId: string): Promise<FixtureResultContext & { nextRevision: number }>;
  insert(input: ResultInput & { revision: number; status: "draft" | "pending_review" }): Promise<StoredResult>;
  update(id: string, input: ResultInput & { status: "draft" | "pending_review" }): Promise<StoredResult>;
  publish(id: string): Promise<void>;
}

export async function submitResult(store: ResultsStore, rawInput: ResultInput, intent: ResultIntent) {
  if (!await store.assertAdmin()) throw new Error("Administrator access required.");
  const context = await store.getContext(rawInput.fixtureId);
  validateResultInput(rawInput, context, intent);
  const input = normaliseResultInput(rawInput);
  const status = intent === "pending_review" ? "pending_review" : "draft";
  const saved = input.resultId
    ? await store.update(input.resultId, { ...input, status })
    : await store.insert({ ...input, revision: context.nextRevision, status });
  if (intent === "publish") await store.publish(saved.id);
  return { id: saved.id, status: intent === "publish" ? "published" : status };
}
