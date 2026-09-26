import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { buildImportArtifacts, OUTPUT_PATHS } from "./lib/current-season-import";

const validateOnly = process.argv.includes("--validate-only");
const artifacts = buildImportArtifacts();

if (validateOnly) {
  console.log("Current-season source data is valid.");
} else {
  for (const [path, content] of [
    [OUTPUT_PATHS.importSql, artifacts.importSql],
    [OUTPUT_PATHS.verificationSql, artifacts.verificationSql],
    [OUTPUT_PATHS.report, artifacts.report],
  ] as const) {
    const absolutePath = resolve(process.cwd(), path);
    mkdirSync(dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, content, "utf8");
    console.log(`Generated ${path}`);
  }
}

for (const night of ["monday", "wednesday"] as const) {
  const model = artifacts.model.nights[night];
  console.log(`${night}: ${model.teams.length} teams, ${model.fixtures.length} fixtures/results, ${model.adjustments.length} adjustments`);
}
