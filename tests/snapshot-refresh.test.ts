import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const workflow = readFileSync(".github/workflows/refresh-public-snapshot.yml", "utf8");
const deploy = readFileSync(".github/workflows/deploy.yml", "utf8");
const refreshScript = readFileSync("scripts/refresh-public-snapshot.ts", "utf8");
const results = readFileSync("src/app/admin/results/ResultsManager.tsx", "utf8");
const runbook = readFileSync("docs/PUBLIC-SNAPSHOT-AUTOMATION.md", "utf8");

test("snapshot refresh runs twice hourly and remains manually dispatchable on master", () => {
  assert.match(workflow, /schedule:\s*\r?\n\s+- cron: "17,47 \* \* \* \*"/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /^\s+master\) ;;$/m);
  assert.match(workflow, /hostname !== "gaqevgjgolvndhcycxzt\.supabase\.co"/);
  assert.match(workflow, /Production Supabase Actions variables verified/);
});

test("unchanged snapshots skip expensive checks and commits; changed snapshots are guarded", () => {
  assert.match(workflow, /id: snapshot[\s\S]*?git diff --quiet -- src\/data\/public-competition-snapshot\.json/);
  assert.match(workflow, /if: steps\.snapshot\.outputs\.changed == 'true'[\s\S]*?npm test[\s\S]*?npm run finals:check/);
  assert.match(workflow, /commit:[\s\S]*?needs: prepare[\s\S]*?if: needs\.prepare\.outputs\.changed == 'true'[\s\S]*?contents: write/);
  assert.match(workflow, /git add -- src\/data\/public-competition-snapshot\.json/);
  assert.match(workflow, /test "\$\(git diff --cached --name-only\)" = 'src\/data\/public-competition-snapshot\.json'/);
  assert.match(deploy, /workflow_run:/);
  assert.match(deploy, /head_branch == 'master'/);
  assert.match(deploy, /hostname !== "gaqevgjgolvndhcycxzt\.supabase\.co"/);
  assert.match(deploy, /Production Supabase Actions variables verified/);
});

test("snapshot generation reads and serializes before atomic replacement", () => {
  const read = refreshScript.indexOf("loadPublishedCompetitionRows(supabase)");
  const serialize = refreshScript.lastIndexOf("serializePublicSnapshot(snapshot)");
  const write = refreshScript.indexOf("await writeFile(temporary, content");
  const rename = refreshScript.indexOf("await rename(temporary, path)");
  assert.ok(read >= 0 && serialize > read && write > serialize && rename > write);
  assert.match(refreshScript, /flag: "wx"/);
  assert.match(refreshScript, /finally\s*\{[\s\S]*?await unlink\(temporary\)/);
});

test("result publication does not claim or invoke a fallback refresh", () => {
  assert.doesNotMatch(results, /functions\.invoke|invokeSnapshotRefresh|queueSnapshotRefresh|refreshStatus === "queued"/);
  assert.match(results, /Result published to the database\./);
  assert.match(results, /fallback snapshot refreshes separately on its twice-hourly schedule/);
  assert.match(results, /GitHub Actions can delay or miss scheduled runs/);
});

test("runbook documents scheduled delays, failure recovery and deployed-fallback verification", () => {
  assert.match(runbook, /17 and 47/);
  assert.match(runbook, /start late[\s\S]*?dropped/i);
  assert.match(runbook, /Run workflow/);
  assert.match(runbook, /failed read or validation cannot push or deploy/i);
  assert.match(runbook, /Verify these outcomes in order/);
  assert.match(runbook, /deployed static fallback/);
  assert.doesNotMatch(runbook, /approved feature branch|RETRY SNAPSHOT REFRESH/);
});
