import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

const directory = "supabase/tests";
const scripts = [
  "disposable_fixture_marker.sql",
  "disposable_fixture_admin_enrolment.sql",
  "disposable_fixture_change_patch.sql",
  "disposable_fixture_schema_preflight.sql",
  "disposable_fixture_verification_zero_check.sql",
  "fixture_concurrency_prepare.sql",
  "fixture_concurrency_session_a.sql",
  "fixture_concurrency_session_b.sql",
  "fixture_concurrency_verify.sql",
  "fixture_concurrency_cleanup.sql",
  "disposable_team_profile_schema_preflight.sql",
  "disposable_team_profile_zero_check.sql",
  "disposable_team_profile_rpc_patch.sql",
  "team_profile_concurrency_prepare.sql",
  "team_profile_concurrency_session_a.sql",
  "team_profile_concurrency_session_b.sql",
  "team_profile_concurrency_verify.sql",
  "team_profile_concurrency_cleanup.sql",
];

test("disposable SQL package has explicit guards and no Auth-user insertion", () => {
  assert.deepEqual(readdirSync(directory).sort(), [...scripts].sort());
  for (const filename of scripts) {
    const sql = readFileSync(`${directory}/${filename}`, "utf8");
    assert.match(sql, /^-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION/m);
    if (filename !== "disposable_fixture_marker.sql") assert.match(sql, /select fis_fixture_test\.assert_disposable\(\);/);
    assert.doesNotMatch(sql, /insert\s+into\s+auth\.users/i);
    assert.doesNotMatch(sql, /service_role|secret_key|db_password/i);
  }
});

test("migration order and rollback-only verification remain explicit", () => {
  assert.deepEqual(readdirSync("supabase/migrations").filter((file) => file.endsWith(".sql")).sort(), [
    "202609250001_initial_fis_admin_schema.sql",
    "202609260001_expose_fis_admin_check.sql",
    "202609270001_fixture_change_sets.sql",
    "202609280001_transactional_team_profile_save.sql",
  ]);
  const verification = readFileSync("supabase/verification/verify_fixture_change_sets.sql", "utf8");
  assert.match(verification, /^-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION/m);
  assert.match(verification, /select fis_fixture_test\.assert_disposable\(\);/);
  assert.match(verification, /^begin;/m);
  assert.match(verification, /rollback;\s*$/i);
  assert.doesNotMatch(verification, /^commit;/im);
  assert.doesNotMatch(verification, /insert\s+into\s+auth\.users/i);
});

test("team-profile verification owns its hierarchy and rolls it all back", () => {
  const verification = readFileSync("supabase/verification/verify_team_profile_save.sql", "utf8");
  const zero = readFileSync(`${directory}/disposable_team_profile_zero_check.sql`, "utf8");
  for (const table of ["seasons", "categories", "locations", "competitions", "competition_seasons", "teams", "team_kickoff_preferences", "team_fixture_notes"])
    assert.match(verification, new RegExp(`insert into public\\.${table}`));
  assert.match(verification, /00000000-0000-4000-8000-00000000b801/);
  assert.match(verification, /00000000-0000-4000-8000-00000000b812/);
  assert.doesNotMatch(verification, /from public\.competition_seasons cs where cs\.lifecycle <> 'archived' order by/);
  assert.equal((verification.match(/^begin;$/gim) ?? []).length, 1);
  assert.equal((verification.match(/^rollback;$/gim) ?? []).length, 1);
  assert.match(verification, /select true as team_profile_verification_passed;\s*rollback;\s*$/i);
  assert.doesNotMatch(verification, /on commit drop/i);
  assert.match(zero, /00000000-0000-4000-8000-00000000b801/);
  assert.match(zero, /00000000-0000-4000-8000-00000000b812/);
  for (const table of ["seasons", "categories", "locations", "competitions", "competition_seasons", "teams", "team_kickoff_preferences", "team_fixture_notes", "admin_audit_log"])
    assert.match(zero, new RegExp(`public\\.${table}`));
});

test("team-profile concurrency setup and cleanup are self-contained and preserve disposable identity", () => {
  const prepare = readFileSync(`${directory}/team_profile_concurrency_prepare.sql`, "utf8");
  const cleanup = readFileSync(`${directory}/team_profile_concurrency_cleanup.sql`, "utf8");
  for (const table of ["seasons", "categories", "locations", "competitions", "competition_seasons", "teams"])
    assert.match(prepare, new RegExp(`insert into public\\.${table}`));
  assert.match(prepare, /00000000-0000-4000-8000-00000000c801/);
  assert.match(prepare, /00000000-0000-4000-8000-00000000c806/);
  assert.doesNotMatch(prepare, /order by cs\.created_at limit 1/);
  assert.match(cleanup, /fis_fixture_test\.assert_disposable\(\)/);
  assert.match(cleanup, /administrator_membership_preserved/);
  assert.match(cleanup, /marker_admin_preserved/);
  assert.doesNotMatch(cleanup, /delete from private\.admin_users|delete from auth\.users|update fis_fixture_test\.project_marker/i);
});

test("team-profile RPC uses an unambiguous named conflict constraint and patch preserves security", () => {
  const migration = readFileSync("supabase/migrations/202609280001_transactional_team_profile_save.sql", "utf8");
  const patch = readFileSync(`${directory}/disposable_team_profile_rpc_patch.sql`, "utf8");
  const outputNames = [...migration.matchAll(/returns\s+table\(([^)]+)\)/gi)]
    .flatMap((match) => match[1].split(",").map((column) => column.trim().split(/\s+/)[0]));
  const conflictTargets = [...migration.matchAll(/on\s+conflict\s*\(([^)]+)\)/gi)]
    .flatMap((match) => match[1].split(",").map((column) => column.trim()));
  assert.deepEqual(outputNames, ["team_id", "profile_version", "updated_at"]);
  assert.equal(conflictTargets.some((column) => outputNames.includes(column)), false);
  assert.doesNotMatch(migration, /on\s+conflict\s*\(\s*team_id\s*\)/i);
  assert.match(migration, /on conflict on constraint team_fixture_notes_pkey do update set notes = excluded\.notes/i);
  assert.match(patch, /select fis_fixture_test\.assert_disposable\(\);/);
  assert.match(patch, /public\.save_team_profile\(uuid,bigint,text,text,uuid,text,jsonb,text,text\)/);
  assert.match(patch, /security_definer_preserved/);
  assert.match(patch, /safe_search_path_preserved/);
  assert.match(patch, /ownership_preserved/);
  assert.match(patch, /grants_preserved/);
  assert.match(patch, /authenticated_execute_preserved/);
  assert.match(patch, /anonymous_execute_denied/);
  assert.doesNotMatch(patch, /\b(insert|update|delete)\s+(into|from)?\s*public\.(teams|team_fixture_notes|team_kickoff_preferences)\b/i);
});

test("rollback verifier keeps its temporary assertion helper alive for one outer transaction", () => {
  const verification = readFileSync("supabase/verification/verify_fixture_change_sets.sql", "utf8");
  const bootstrap = verification.indexOf("create temporary table _fis_fixture_verification_bootstrap");
  const lastAssertion = verification.lastIndexOf("pg_temp.assert_true");
  const success = verification.indexOf("select true as fixture_change_verification_passed;");
  const rollback = verification.lastIndexOf("rollback;");

  assert.ok(bootstrap >= 0 && bootstrap < lastAssertion);
  assert.doesNotMatch(verification, /_fis_fixture_verification_bootstrap[^;]*on\s+commit\s+drop/i);
  assert.equal((verification.match(/^begin;$/gim) ?? []).length, 1);
  assert.equal((verification.match(/^rollback;$/gim) ?? []).length, 1);
  assert.doesNotMatch(verification, /^commit;$/gim);
  assert.ok(success > lastAssertion && success < rollback);
  assert.match(verification, /create function pg_temp\.assert_true/);
  assert.match(verification, /create function pg_temp\._verify_fixture_second_failure/);
  assert.doesNotMatch(verification, /create\s+schema/i);
  assert.doesNotMatch(verification, /alter\s+table/i);
  assert.doesNotMatch(verification, /create\s+table\s+public\./i);
  assert.doesNotMatch(verification, /drop\s+table\s+public\./i);
  assert.doesNotMatch(verification, /add\s+column/i);
  assert.match(verification, /rollback;\s*$/i);
});

test("fixture schema preflight is guarded, exact and read-only", () => {
  const preflight = readFileSync(`${directory}/disposable_fixture_schema_preflight.sql`, "utf8");
  assert.match(preflight, /^-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION/m);
  assert.match(preflight, /select fis_fixture_test\.assert_disposable\(\);/);
  assert.match(preflight, /schedule_status_column_matches/);
  assert.match(preflight, /schedule_status_constraint_matches/);
  assert.match(preflight, /schedule_version_column_matches/);
  assert.match(preflight, /fixture_change_tables_exist/);
  assert.match(preflight, /fixture_change_core_functions_exist/);
  assert.match(preflight, /fixture_change_workflow_functions_exist/);
  assert.match(preflight, /fixture_change_policies_exist/);
  assert.match(preflight, /all_fixture_change_schema_checks_passed/);
  assert.doesNotMatch(preflight, /\b(insert|update|delete|truncate|create|alter|drop)\b/i);
});

test("zero-record verification is disposable-guarded and read-only", () => {
  const check = readFileSync(`${directory}/disposable_fixture_verification_zero_check.sql`, "utf8");
  assert.match(check, /^-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION/m);
  assert.match(check, /select fis_fixture_test\.assert_disposable\(\);/);
  assert.match(check, /all_verification_counts_zero/);
  assert.match(check, /fixture_change_history/);
  assert.match(check, /admin_audit_log/);
  assert.doesNotMatch(check, /\b(insert|update|delete|truncate|create|alter|drop)\b/i);
});

test("both concurrent sessions publish different plans and one holds the venue lock", () => {
  const a = readFileSync(`${directory}/fixture_concurrency_session_a.sql`, "utf8");
  const b = readFileSync(`${directory}/fixture_concurrency_session_b.sql`, "utf8");
  const migration = readFileSync("supabase/migrations/202609270001_fixture_change_sets.sql", "utf8");
  assert.match(a, /publish_fixture_change_set\('00000000-0000-4000-8000-0000000f7001', 3\)/);
  assert.match(b, /publish_fixture_change_set\('00000000-0000-4000-8000-0000000f7002', 3\)/);
  assert.match(a, /pg_sleep\(15\)/);
  assert.match(migration, /for update of l;/i);
  assert.match(migration, /occupied_c\.location_id = v_location_id/);
});

test("ordinary concurrency cleanup preserves disposable administrator identity", () => {
  const cleanup = readFileSync(`${directory}/fixture_concurrency_cleanup.sql`, "utf8");
  assert.match(cleanup, /select fis_fixture_test\.assert_disposable\(\);/);
  assert.match(cleanup, /delete from public\.fixture_change_history/);
  assert.match(cleanup, /delete from public\.fixture_change_sets/);
  assert.doesNotMatch(cleanup, /delete\s+from\s+private\.admin_users/i);
  assert.doesNotMatch(cleanup, /update\s+fis_fixture_test\.project_marker/i);
  assert.doesNotMatch(cleanup, /delete\s+from\s+auth\.users/i);
  assert.doesNotMatch(cleanup, /disposable_admin_user_id\s*=\s*null/i);
});

test("fixture migration and disposable repair contain no ambiguous team identifier", () => {
  const migration = readFileSync("supabase/migrations/202609270001_fixture_change_sets.sql", "utf8");
  const patch = readFileSync(`${directory}/disposable_fixture_change_patch.sql`, "utf8");
  for (const sql of [migration, patch]) {
    assert.doesNotMatch(sql, /\bn\.team_id\s*=\s*team_id\b/i);
    assert.doesNotMatch(sql, /\btkp\.team_id\s*=\s*team_id\b/i);
    assert.match(sql, /n\.team_id\s*=\s*v_team_id/);
    assert.match(sql, /tkp\.team_id\s*=\s*v_team_id/);
  }
  const reportStart = migration.indexOf("create function private.fixture_change_report");
  const reportEnd = migration.indexOf("create function private.fixture_report_has", reportStart);
  const report = migration.slice(reportStart, reportEnd);
  assert.ok(reportStart >= 0 && reportEnd > reportStart);
  for (const variable of ["team_id", "fixture_id", "change_set_id", "competition_season_id", "competition_id",
    "location_id", "status", "operation", "publication_state", "round_number", "court", "match_date", "kickoff_time"]) {
    assert.doesNotMatch(report, new RegExp(`\\n\\s*${variable}\\s+[^;]+;`, "i"));
  }
  assert.match(patch, /^-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION/m);
  assert.match(patch, /select fis_fixture_test\.assert_disposable\(\);/);
  assert.match(patch, /create or replace function private\.fixture_change_report/);
  assert.match(patch, /known_ambiguous_expression_removed/);
});

test("fixture-change PL/pgSQL locals and parameters use explicit prefixes", () => {
  const migration = readFileSync("supabase/migrations/202609270001_fixture_change_sets.sql", "utf8");
  const functionBlocks = migration.matchAll(
    /create function\s+([\w.]+)\s*\(([^)]*)\)[\s\S]*?language plpgsql[\s\S]*?as \$\$([\s\S]*?)\$\$;/gi,
  );

  let inspected = 0;
  for (const match of functionBlocks) {
    inspected += 1;
    const [, functionName, parameters, body] = match;
    const parameterNames = [...parameters.matchAll(/\b([a-z_][a-z0-9_]*)\s+(?:uuid|text|bigint|boolean|jsonb)/gi)]
      .map((parameter) => parameter[1]);
    for (const parameterName of parameterNames) {
      assert.match(parameterName, /^p_/, `${functionName} parameter ${parameterName} must use p_*`);
    }

    const declaration = body.match(/\bdeclare\b([\s\S]*?)\bbegin\b/i)?.[1] ?? "";
    const localNames = [...declaration.matchAll(/^\s*([a-z_][a-z0-9_]*)\s+(?:public\.[\w]+%rowtype|uuid|text|bigint|integer|boolean|jsonb)/gim)]
      .map((local) => local[1]);
    for (const localName of localNames) {
      assert.match(localName, /^v_/, `${functionName} local ${localName} must use v_*`);
    }
  }

  assert.ok(inspected >= 7, "expected every fixture-change PL/pgSQL function to be inspected");
  assert.doesNotMatch(migration, /returns\s+table\s*\(/i);
});
