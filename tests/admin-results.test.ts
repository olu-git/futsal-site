import assert from "node:assert/strict";
import test from "node:test";
import { submitResult, type ResultsStore, type StoredResult } from "../src/lib/admin/results-service";
import type { FixtureResultContext, ResultInput } from "../src/lib/admin/results-rules";

class MemoryStore implements ResultsStore {
  admin = true;
  context: FixtureResultContext & { nextRevision: number } = { stage: "regular_season", nextRevision: 1 };
  rows: StoredResult[] = [];
  published: string[] = [];
  async assertAdmin() { return this.admin; }
  async getContext() { return this.context; }
  async insert(input: ResultInput & { revision: number; status: "draft" | "pending_review" }) {
    const row = { ...input, id: `r${input.revision}`, revision: input.revision, status: input.status };
    this.rows.push(row); return row;
  }
  async update(id: string, input: ResultInput & { status: "draft" | "pending_review" }) {
    const row = this.rows.find((item) => item.id === id);
    if (!row) throw new Error("Missing draft");
    Object.assign(row, input); return row;
  }
  async publish(id: string) { this.published.push(id); }
}
const score = (extra: Partial<ResultInput> = {}): ResultInput => ({ fixtureId: "fixture-1", homeScore: 4, awayScore: 2, ...extra });

test("saving a draft permits incomplete scores", async () => {
  const store = new MemoryStore(); const result = await submitResult(store, score({ awayScore: null }), "draft");
  assert.equal(result.status, "draft"); assert.equal(store.rows[0].awayScore, null);
});
test("marking a result pending review", async () => {
  const store = new MemoryStore(); const result = await submitResult(store, score(), "pending_review");
  assert.equal(result.status, "pending_review"); assert.equal(store.rows[0].status, "pending_review");
});
test("publishing a new result invokes the publish operation", async () => {
  const store = new MemoryStore(); const result = await submitResult(store, score(), "publish");
  assert.equal(result.status, "published"); assert.deepEqual(store.published, ["r1"]);
});
test("standard home forfeit is accepted", async () => {
  const store = new MemoryStore(); await submitResult(store, score({ homeScore: 0, awayScore: 5, forfeitSide: "home" }), "publish");
  assert.equal(store.rows[0].forfeitSide, "home");
});
test("standard away forfeit is accepted", async () => {
  const store = new MemoryStore(); await submitResult(store, score({ homeScore: 5, awayScore: 0, forfeitSide: "away" }), "publish");
  assert.equal(store.rows[0].forfeitSide, "away");
});
test("non-standard forfeit requires an exception reason", async () => {
  const store = new MemoryStore(); await assert.rejects(() => submitResult(store, score({ forfeitSide: "home" }), "publish"), /Explain why/);
});
test("published results cannot be edited directly", async () => {
  const store = new MemoryStore(); store.context.publishedResultId = "published-1";
  await assert.rejects(() => submitResult(store, score(), "draft"), /cannot be edited directly/);
});
test("creating a correction draft requires and stores its reason", async () => {
  const store = new MemoryStore(); store.context.publishedResultId = "published-1";
  await submitResult(store, score({ supersedesResultId: "published-1", correctionReason: "Score sheet correction" }), "draft");
  assert.equal(store.rows[0].supersedesResultId, "published-1");
});
test("publishing a correction invokes atomic publication", async () => {
  const store = new MemoryStore(); store.context.publishedResultId = "published-1";
  await submitResult(store, score({ supersedesResultId: "published-1", correctionReason: "Verified correction" }), "publish");
  assert.deepEqual(store.published, ["r1"]);
});
test("invalid scores are rejected", async () => {
  const store = new MemoryStore(); await assert.rejects(() => submitResult(store, score({ homeScore: -1 }), "draft"), /whole numbers/);
});
test("unauthorised mutations are rejected", async () => {
  const store = new MemoryStore(); store.admin = false;
  await assert.rejects(() => submitResult(store, score(), "draft"), /Administrator access required/);
});
