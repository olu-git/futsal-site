import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const workflow = readFileSync(".github/workflows/refresh-public-snapshot.yml", "utf8");
const deploy = readFileSync(".github/workflows/deploy.yml", "utf8");
const refreshScript = readFileSync("scripts/refresh-public-snapshot.ts", "utf8");
const results = readFileSync("src/app/admin/results/ResultsManager.tsx", "utf8");
const runbook = readFileSync("docs/PUBLIC-SNAPSHOT-AUTOMATION.md", "utf8");

test("failed reads and invalid generated data preserve the previous snapshot", () => {
  const directory = mkdtempSync(join(tmpdir(), "fis-snapshot-failure-"));
  const dataDirectory = join(directory, "src", "data");
  mkdirSync(dataDirectory, { recursive: true });
  const snapshotPath = join(dataDirectory, "public-competition-snapshot.json");
  const previous = readFileSync("src/data/public-competition-snapshot.json", "utf8");
  writeFileSync(snapshotPath, previous);
  const mock = join(directory, "mock-fetch.mjs");
  try {
    for (const status of [400, 200]) {
      writeFileSync(mock, `globalThis.fetch = async () => new Response(${JSON.stringify(status === 400 ? '{"message":"Mock read failed"}' : '[]')}, {status:${status}, headers:{'content-type':'application/json'}});`);
      const result = spawnSync(process.execPath, ["--import", pathToFileURL(createRequire(import.meta.url).resolve("tsx")).href, "--import", pathToFileURL(mock).href,
        resolve("scripts/refresh-public-snapshot.ts"), "generate"], {
        cwd: directory,
        env: { ...process.env, TSX_TSCONFIG_PATH: resolve("tsconfig.json"), NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:1", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "audit-mock" },
        encoding: "utf8", timeout: 10000,
      });
      assert.equal(result.error, undefined);
      assert.equal(result.status, 1);
      assert.match(result.stderr, status === 400 ? /Mock read failed/ : /published Monday or Wednesday competition season is missing/);
      assert.equal(readFileSync(snapshotPath, "utf8"), previous);
      assert.deepEqual(readdirSync(dataDirectory), ["public-competition-snapshot.json"]);
    }
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

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

test("refresh step conditions only use outputs from completed earlier steps", () => {
  const completed = new Set<string>();
  for (const step of workflow.split(/(?=^      - name:)/m)) {
    for (const match of step.matchAll(/if:.*steps\.([a-z_]+)\.outputs\./g)) {
      assert.ok(completed.has(match[1]), `Condition reads ${match[1]} before that step runs`);
    }
    const id = step.match(/^        id: (\w+)/m)?.[1];
    if (id) completed.add(id);
  }
  assert.ok(workflow.indexOf("npm run snapshot:check") < workflow.indexOf("name: Transfer validated snapshot"));
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
