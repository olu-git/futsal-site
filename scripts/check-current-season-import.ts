import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildImportArtifacts, OUTPUT_PATHS } from "./lib/current-season-import";

const artifacts = buildImportArtifacts();
const expected = new Map<string, string>([
  [OUTPUT_PATHS.importSql, artifacts.importSql],
  [OUTPUT_PATHS.verificationSql, artifacts.verificationSql],
  [OUTPUT_PATHS.report, artifacts.report],
]);

for (const [path, content] of expected) {
  let saved: string;
  try {
    saved = readFileSync(resolve(process.cwd(), path), "utf8");
  } catch {
    throw new Error(`${path} is missing; run npm run season:import:generate`);
  }
  if (saved !== content) throw new Error(`${path} is stale; run npm run season:import:generate`);
}

const sql = artifacts.importSql.toLowerCase();
if (!sql.startsWith("-- generated") || !sql.includes("\nbegin;") || !sql.trimEnd().endsWith("commit;")) {
  throw new Error("Generated import is not wrapped in one transaction");
}
if (sql.includes("stage, 'knockout'") || sql.includes("stage, 'grading'") || sql.includes("delete from")) {
  throw new Error("Generated import contains a forbidden stage or delete statement");
}
if (!sql.includes("on conflict do nothing") || !sql.includes("published result conflicts")) {
  throw new Error("Generated import is missing idempotency or conflict guards");
}
if (!artifacts.verificationSql.trimEnd().endsWith("rollback;")) {
  throw new Error("Post-import verification must end in rollback");
}

console.log("Generated current-season import artifacts are current and pass static checks.");
