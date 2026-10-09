// Deliberately uses only an in-memory embedded Postgres instance, never a URL.
// Install PGlite outside the repo; pass its absolute entrypoint as argument 2.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

if (!process.argv[2]) throw new Error("Pass the local PGlite module path; no hosted connection is supported.");
const { PGlite } = await import(pathToFileURL(resolve(process.argv[2])).href);
const db = new PGlite();
const read = (path) => readFileSync(path, "utf8");
const idPatch = read("supabase/production/team-readable-id-update.sql");
const newPatch = read("supabase/production/new-season-team-memberships.sql");
const reservations = JSON.parse(read("docs/drafts/new-season-team-memberships.json")).entries;
const mapping = [
  ["04ebec43-f537-52b4-bbae-ffe3449b7826", "mon-toss", "mon-king-adl"],
  ["402549b9-1e74-51ff-b058-9749e72ddd74", "wed-toss", "wed-king-adl"],
  ["5ab40935-7320-536b-a625-13661e1cdb8d", "mon-declans-team", "mon-declans-delinquents"],
  ["629727a3-27fb-59de-a790-c578aeffd38f", "wed-xaywan", "wed-kuq-e-zi"],
];
async function snapshot() {
  const tables = ["teams", "fixtures", "result_versions", "standing_adjustments", "team_kickoff_preferences", "team_fixture_notes"];
  return Object.fromEntries(await Promise.all(tables.map(async (table) => [table, (await db.query(`select to_jsonb(t) as row from public.${table} t order by to_jsonb(t)::text`)).rows.map(({ row }) => row)])));
}
async function fails(sql, expected) {
  try { await db.exec(sql); assert.fail("Expected SQL rejection"); }
  catch (error) { await db.exec("rollback;"); assert.match(error.message, expected); }
}
try {
  await db.exec(`create role anon; create role authenticated; create role service_role;
    create schema auth; create table auth.users(id uuid primary key, email text, email_confirmed_at timestamptz);
    create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
    create function auth.role() returns text language sql stable as $$ select 'local-verifier'::text $$;`);
  // Identity-only proposals are verified against the six installed production migrations.
  // The separate staging harness loads all migrations, including the new unreleased proposal.
  for (const name of readdirSync("supabase/migrations").filter((name) => name.endsWith(".sql") && name < "20261001").sort()) await db.exec(read(`supabase/migrations/${name}`));
  // Install the offline historical fixture hierarchy ONLY inside this local DB.
  await db.exec(read("supabase/imports/2026-s1/current-season-import.sql"));
  for (const [uuid, oldId] of mapping) await db.query("update public.teams set legacy_id=$2 where id=$1", [uuid, oldId]);
  await db.exec(`insert into public.team_fixture_notes(team_id,notes) values('${mapping[0][0]}','Local preservation sentinel');
    insert into public.team_kickoff_preferences(team_id,kickoff_time,classification) values('${mapping[0][0]}','20:20','preferred');`);
  const before = await snapshot();
  await db.exec(idPatch);
  const after = await snapshot();
  for (const table of Object.keys(before).filter((name) => name !== "teams")) assert.deepEqual(after[table], before[table]);
  const cleanTeams = (rows) => rows.map((row) => { const copy = { ...row }; delete copy.legacy_id; delete copy.updated_at; return copy; }).sort((a,b) => a.id.localeCompare(b.id));
  assert.deepEqual(cleanTeams(after.teams), cleanTeams(before.teams));
  for (const [uuid,, newId] of mapping) assert.equal(after.teams.find((team) => team.id === uuid).legacy_id, newId);
  const auditCount = (await db.query("select count(*)::integer as count from public.admin_audit_log")).rows[0].count;
  await db.exec(idPatch);
  assert.deepEqual(await snapshot(), after);
  assert.equal((await db.query("select count(*)::integer as count from public.admin_audit_log")).rows[0].count, auditCount);
  // A later target collision must roll back earlier ID updates in the same patch.
  for (const [uuid, oldId] of mapping) await db.query("update public.teams set legacy_id=$2 where id=$1", [uuid, oldId]);
  await db.exec(`insert into public.teams(id,competition_season_id,legacy_id,name) values('ffffffff-0000-4000-8000-000000000001','e1db4456-0663-55d2-95a1-681d17163b91','wed-king-adl','Local collision');`);
  const collisionBefore = await snapshot();
  await fails(idPatch, /already belongs/);
  assert.deepEqual(await snapshot(), collisionBefore);
  await db.exec("delete from public.teams where id='ffffffff-0000-4000-8000-000000000001';");
  await db.exec(idPatch);
  await fails(newPatch, /Explicit distinct draft edition IDs/);
  // Draft targets have explicitly synthetic dates, not a proposed season calendar.
  await db.exec(`insert into public.seasons(id,name,starts_on,ends_on) values('eeeeeeee-0000-4000-8000-000000000001','LOCAL MOCK ONLY','2030-01-01','2031-01-01');
    insert into public.competition_seasons(id,competition_id,season_id) select 'eeeeeeee-0000-4000-8000-000000000002',competition_id,'eeeeeeee-0000-4000-8000-000000000001' from public.competition_seasons where id='8021a2bb-eb2b-55fe-9900-d3f50facf092';
    insert into public.competition_seasons(id,competition_id,season_id) select 'eeeeeeee-0000-4000-8000-000000000003',competition_id,'eeeeeeee-0000-4000-8000-000000000001' from public.competition_seasons where id='e1db4456-0663-55d2-95a1-681d17163b91';
    select set_config('fis.preparation.monday_edition','eeeeeeee-0000-4000-8000-000000000002',false);
    select set_config('fis.preparation.wednesday_edition','eeeeeeee-0000-4000-8000-000000000003',false);`);

  const oldHistory = await snapshot();
  await db.exec(newPatch);
  const prepared = await snapshot();
  for (const table of Object.keys(oldHistory).filter((name) => name !== "teams")) assert.deepEqual(prepared[table], oldHistory[table]);
  for (const entry of reservations) {
    const team = prepared.teams.find((team) => team.id === entry.uuid);
    assert.equal(team.legacy_id, entry.readableId);
    assert.equal(team.name, entry.name);
    assert.equal(team.kit_colour, null);
    assert(!oldHistory.teams.some((old) => old.id === entry.uuid));
  }
  await db.exec(newPatch);
  assert.deepEqual(await snapshot(), prepared);
  await fails(`insert into public.teams(competition_season_id,name) values('ffffffff-0000-4000-8000-000000000099','Bad FK');`, /foreign key/);
  await fails(`insert into public.teams(competition_season_id,name,legacy_id) values('eeeeeeee-0000-4000-8000-000000000002','Duplicate ID','mon-xaywan');`, /unique/);
  await fails(`insert into public.teams(competition_season_id,name) values('eeeeeeee-0000-4000-8000-000000000002',' xaywan ');`, /unique/);
  // Delete only local drafts, then collide with the last new entrant to prove rollback.
  await db.exec("delete from public.teams where competition_season_id in ('eeeeeeee-0000-4000-8000-000000000002','eeeeeeee-0000-4000-8000-000000000003');");
  await db.exec(`insert into public.teams(competition_season_id,name,legacy_id) values('eeeeeeee-0000-4000-8000-000000000003','Buckle City','wed-buckle-city');`);
  const newCollision = await snapshot();
  await fails(newPatch, /unique/);
  assert.deepEqual(await snapshot(), newCollision);
  await db.exec("delete from public.teams where competition_season_id='eeeeeeee-0000-4000-8000-000000000003';");
  await db.exec(newPatch);
  const buckle = reservations.find((entry) => entry.name === "Buckle City");
  const etihad = reservations.find((entry) => entry.name === "Etihad FC");
  assert.equal((await db.query("select standings_eligible from public.teams where id=$1", [buckle.uuid])).rows[0].standings_eligible, true);
  // Local fake match only: the placeholder has an ordinary team FK and score.
  // Confirm ordinary eligible-team points and goals, never a bye/exhibition.
  await db.query("insert into public.fixtures(id,competition_season_id,round_number,match_date,kickoff_time,court,home_team_id,away_team_id,stage,publication_state) values('eeeeeeee-0000-4000-8000-000000000004','eeeeeeee-0000-4000-8000-000000000003',1,'2030-01-02','19:00',1,$1,$2,'regular_season','published')", [buckle.uuid, etihad.uuid]);
  await db.exec("insert into public.result_versions(fixture_id,revision,status,home_score,away_score) values('eeeeeeee-0000-4000-8000-000000000004',1,'published',2,2);");
  assert.deepEqual((await db.query("select played,points,goals_for,goals_against from public.standings where team_id=$1", [buckle.uuid])).rows[0], { played: 1, points: 1, goals_for: 2, goals_against: 2 });
  assert.equal((await db.query("select played from public.standings where team_id=$1", [etihad.uuid])).rows[0].played, 1);
  // Archived edition rejection, without disabling any protection trigger.
  await db.exec("update public.competition_seasons set lifecycle='archived' where id='8021a2bb-eb2b-55fe-9900-d3f50facf092';");
  await fails(idPatch, /active published edition/);
  await fails(`update public.teams set legacy_id='invalid-change' where id='${mapping[0][0]}';`, /Archived/);
  console.log(JSON.stringify({ engine: "PGlite in-memory PostgreSQL", hostedConnections: 0, installedMigrations: 6, historyFixtures: before.fixtures.length, resultVersions: before.result_versions.length, standingAdjustments: before.standing_adjustments.length, identityUpdate: "passed", uuidHistoryKitPreservation: "passed", newMemberships: "passed", foreignKeys: "passed", uniqueness: "passed", atomicRollback: "passed", safeRepeat: "passed", archivedGuards: "passed", confirmedBuckleEligibility: "passed", placeholderOrdinaryMatch: "passed: draw counts played, points and goals", authLimit: "Auth helpers mocked; no hosted Auth/PostgREST or concurrency test" }, null, 2));
} catch(error) { console.error(error.message, error.position, error.internalQuery); if(error.position) console.error(error.query?.slice(Number(error.position)-100,Number(error.position)+100)); process.exitCode=1; } finally { await db.close(); }
