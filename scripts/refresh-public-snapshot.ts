import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "../src/lib/supabase/config";
import { loadPublishedCompetitionRows } from "../src/lib/public-competition";
import { buildPublicSnapshot, serializePublicSnapshot, validatePublicSnapshot } from "../src/lib/public-snapshot";

const path = resolve(process.cwd(), "src/data/public-competition-snapshot.json");
const mode = process.argv[2] ?? "generate";
if (!["generate", "validate", "check"].includes(mode)) throw new Error(`Unsupported snapshot command: ${mode}`);

async function main() {
  if (mode === "validate") {
    const content = await readFile(path, "utf8");
    const snapshot: unknown = JSON.parse(content);
    validatePublicSnapshot(snapshot);
    if (serializePublicSnapshot(snapshot) !== content) throw new Error("Snapshot is not in canonical format.");
    console.log("Published regular-season snapshot is valid.");
    return;
  }

  loadEnvConfig(process.cwd());
  const { url, publishableKey } = getSupabaseConfig();
  const supabase = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const snapshot = buildPublicSnapshot(await loadPublishedCompetitionRows(supabase));
  const content = serializePublicSnapshot(snapshot);
  const existing = await readFile(path, "utf8").catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return null;
    throw error;
  });
  if (mode === "check") {
    if (content !== existing) throw new Error("Published snapshot differs from Supabase. Run snapshot:generate.");
    console.log("Published snapshot matches anonymous Supabase data.");
    return;
  }
  if (content !== existing) {
    const temporary = `${path}.${process.pid}.tmp`;
    try {
      await writeFile(temporary, content, { encoding: "utf8", flag: "wx" });
      await rename(temporary, path);
    } finally {
      await unlink(temporary).catch((error: NodeJS.ErrnoException) => { if (error.code !== "ENOENT") throw error; });
    }
    console.log("Published snapshot updated.");
  } else {
    console.log("Published snapshot unchanged.");
  }
  for (const night of ["monday", "wednesday"] as const) {
    console.log(`${night}: ${snapshot.data.teams.filter((team) => team.night === night).length} teams, ` +
      `${snapshot.data.fixtures.filter((fixture) => fixture.night === night).length} fixtures, ` +
      `${snapshot.data.standingsAdjustments.filter((adjustment) => adjustment.night === night).length} adjustments`);
  }
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Snapshot refresh failed."); process.exitCode = 1; });
