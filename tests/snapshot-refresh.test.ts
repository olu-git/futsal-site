import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { handleSnapshotRefresh, type RefreshDependencies } from "../supabase/functions/trigger-snapshot-refresh/logic";
import { refreshAfterPublication } from "../src/lib/admin/snapshot-refresh";

function dependencies(overrides: Partial<RefreshDependencies> = {}): RefreshDependencies {
  return {
    allowedOrigins: ["https://futsalindoorsoccer.com.au"],
    authenticate: async () => true,
    isAdmin: async () => true,
    githubConfig: () => ({ token: "test-only", owner: "fis", repository: "website", workflowFile: "refresh-public-snapshot.yml", ref: "master" }),
    dispatch: async () => true,
    ...overrides,
  };
}
const request = (method = "POST", token = "session") => new Request("https://example.test/trigger-snapshot-refresh", {
  method, headers: { origin: "https://futsalindoorsoccer.com.au", ...(token ? { authorization: `Bearer ${token}` } : {}) },
});

test("Edge handler queues only a verified administrator", async () => {
  let dispatched = 0;
  const response = await handleSnapshotRefresh(request(), dependencies({ dispatch: async () => { dispatched++; return true; } }));
  assert.equal(response.status, 202);
  assert.equal((await response.json()).code, "queued");
  assert.equal(dispatched, 1);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "https://futsalindoorsoccer.com.au");
});

test("Edge handler rejects unauthenticated, invalid, non-admin and wrong-origin callers", async () => {
  let dispatched = 0;
  const deps = dependencies({ dispatch: async () => { dispatched++; return true; } });
  assert.equal((await handleSnapshotRefresh(request("POST", ""), deps)).status, 401);
  assert.equal((await handleSnapshotRefresh(request(), dependencies({ ...deps, authenticate: async () => false }))).status, 401);
  assert.equal((await handleSnapshotRefresh(request(), dependencies({ ...deps, isAdmin: async () => false }))).status, 403);
  assert.equal((await handleSnapshotRefresh(new Request("https://example.test", { method: "POST", headers: { origin: "https://attacker.test", authorization: "Bearer session" } }), deps)).status, 403);
  assert.equal((await handleSnapshotRefresh(request("GET"), deps)).status, 405);
  assert.equal(dispatched, 0);
});

test("Edge handler distinguishes missing configuration and GitHub failure", async () => {
  assert.equal((await handleSnapshotRefresh(request(), dependencies({ githubConfig: () => null }))).status, 503);
  assert.equal((await handleSnapshotRefresh(request(), dependencies({ dispatch: async () => false }))).status, 502);
  assert.equal((await handleSnapshotRefresh(request(), dependencies({ dispatch: async () => { throw new Error("offline"); } }))).status, 502);
});

test("publication refresh is non-blocking and only follows actual publish actions", async () => {
  let calls = 0;
  const trigger = async () => { calls++; };
  assert.equal(await refreshAfterPublication("draft", { ok: true, status: "draft" }, trigger), "skipped");
  assert.equal(await refreshAfterPublication("pending_review", { ok: true, status: "pending_review" }, trigger), "skipped");
  assert.equal(await refreshAfterPublication("publish", { ok: false }, trigger), "skipped");
  assert.equal(calls, 0);
  assert.equal(await refreshAfterPublication("publish", { ok: true, status: "published" }, trigger), "queued");
  assert.equal(await refreshAfterPublication("publish", { ok: true, status: "published" }, trigger), "queued");
  assert.equal(calls, 2);
  assert.equal(await refreshAfterPublication("publish", { ok: true, status: "published" }, async () => { throw new Error("offline"); }), "failed");
});

test("workflow commits only the snapshot and production deploy follows successful refresh", () => {
  const workflow = readFileSync(".github/workflows/refresh-public-snapshot.yml", "utf8");
  const deploy = readFileSync(".github/workflows/deploy.yml", "utf8");
  const edge = readFileSync("supabase/functions/trigger-snapshot-refresh/index.ts", "utf8");
  const docs = readFileSync("docs/PUBLIC-SNAPSHOT-AUTOMATION.md", "utf8");
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /prepare:[\s\S]*?contents: read/);
  assert.match(workflow, /persist-credentials: false/);
  assert.match(workflow, /commit:[\s\S]*?contents: write/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.match(workflow, /actions\/download-artifact@v4/);
  assert.match(workflow, /path: src\/data/);
  assert.match(workflow, /contents: write/);
  assert.match(workflow, /git add -- src\/data\/public-competition-snapshot\.json/);
  assert.match(workflow, /git diff --cached --name-only/);
  assert.match(workflow, /git diff --quiet -- src\/data\/public-competition-snapshot\.json/);
  assert.match(workflow, /master\|feature\/new-website/);
  assert.match(edge, /config\.workflowFile !== "refresh-public-snapshot\.yml"/);
  assert.match(edge, /\["master", "feature\/new-website"\]\.includes\(config\.ref\)/);
  assert.match(deploy, /workflow_run:/);
  assert.match(deploy, /head_branch == 'master'/);
  assert.match(deploy, /head_sha != github\.sha/);
  assert.match(docs, /## Disable and rollback/);
});
