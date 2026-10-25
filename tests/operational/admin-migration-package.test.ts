import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("production migration diagnostics are read-only and credential-free",()=>{
  for(const file of ["supabase/production/fixture_change_preflight.sql","supabase/production/fixture_change_postflight.sql"]){const sql=readFileSync(file,"utf8");assert.doesNotMatch(sql,/\b(insert|update|delete|truncate|create|alter|drop|grant|revoke)\b/i);assert.doesNotMatch(sql,/service_role|secret_key|password|token/i)}
});

test("transactional team profile migration covers validation, rollback, security and stale edits",()=>{
 const migration=readFileSync("supabase/migrations/202609280001_transactional_team_profile_save.sql","utf8");
 const verification=readFileSync("supabase/verification/verify_team_profile_save.sql","utf8");
 assert.match(migration,/for update/);assert.match(migration,/profile_version/);assert.match(migration,/private\.is_admin\(\)/);assert.match(migration,/set search_path = ''/);
 assert.match(migration,/Duplicate team name/);assert.match(migration,/Archived destination/);assert.match(migration,/Stale team profile/);assert.match(migration,/administrative reason/);
 assert.match(migration,/delete from public\.team_kickoff_preferences/);assert.doesNotMatch(migration,/on conflict\s*\(\s*team_id\s*\)/i);assert.match(migration,/on conflict on constraint team_fixture_notes_pkey\s+do update set notes = excluded\.notes/i);assert.match(migration,/delete from public\.team_fixture_notes/);
 assert.match(verification,/preferences replaced/);assert.match(verification,/preferences deleted/);assert.match(verification,/note intentionally removed/);assert.match(verification,/failed nested save rolled back all profile state/);assert.match(verification,/unauthorised caller rejected/);
 assert.match(verification,/^begin;/m);assert.match(verification,/rollback;\s*$/);assert.doesNotMatch(migration,/\b(team_id|profile_version|competition_season_id)\s*=\s*\1\b/);
});

test("migration is private, versioned, atomic and excludes match data",()=>{const sql=readFileSync("supabase/migrations/202609300001_season_draft_management.sql","utf8");assert.match(sql,/begin;[\s\S]*commit;/);assert.match(sql,/errcode='40001'/);assert.match(sql,/security definer set search_path=''/g);assert.match(sql,/private\.is_admin\(\)/);assert.match(sql,/revoke all[\s\S]*from public,anon/);assert.doesNotMatch(sql,/insert into public\.(fixtures|result_versions|standing_adjustments)/i);assert.doesNotMatch(sql,/service_role|insert\s+into\s+auth\.users/i)});

test("verification package is disposable guarded and rollback-only",()=>{const verify=readFileSync("supabase/verification/verify_season_drafts.sql","utf8"),zero=readFileSync("supabase/tests/disposable_season_draft_zero_check.sql","utf8");assert.match(verify,/fis_fixture_test\.assert_disposable/);assert.match(verify,/rollback;\s*$/);assert.match(verify,/season_draft_verification_passed/);assert.match(zero,/fis_fixture_test\.assert_disposable/);assert.doesNotMatch(`${verify}${zero}`,/service_role|secret_key/i)});

test("transactional migration enforces lifecycle, immutability, follow-ups and stale versions",()=>{const sql=readFileSync("supabase/migrations/202609290001_transactional_standing_adjustments.sql","utf8");assert.match(sql,/pending_review/);assert.match(sql,/protect_published_standing_adjustment/);assert.match(sql,/standing_adjustments_one_followup/);assert.match(sql,/errcode='40001'/);assert.match(sql,/security definer set search_path=''/g);assert.doesNotMatch(sql,/on conflict\s*\(\s*(id|team_id|version)\s*\)/i)});

test("disposable adjustment verification is guarded, isolated and rollback-only",()=>{const verify=readFileSync("supabase/verification/verify_standing_adjustments.sql","utf8"),cleanup=readFileSync("supabase/tests/standing_adjustment_concurrency_cleanup.sql","utf8");assert.match(verify,/fis_fixture_test\.assert_disposable/);assert.match(verify,/00000000-0000-4000-8000-00000000d901/);assert.match(verify,/rollback;\s*$/);assert.match(cleanup,/administrator_preserved/);assert.match(cleanup,/marker_preserved/)});
