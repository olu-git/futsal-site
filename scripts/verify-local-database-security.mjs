// Real, synthetic PostgreSQL only. This creates its own temporary cluster and
// accepts a binaries directory, never a connection URL or an existing database.
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { createServer } from 'node:net';
import { randomUUID } from 'node:crypto';

assert.equal(process.argv.length, 3, 'Usage: node scripts/verify-local-database-security.mjs <PostgreSQL-bin-directory>');
const bin = resolve(process.argv[2]);
const root = mkdtempSync(join(tmpdir(), 'fis-security-'));
const cluster = join(root, 'cluster');
const extension = process.platform === 'win32' ? '.exe' : '';
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^PG/i.test(key)));
const server = createServer();
await new Promise((done, fail) => { server.once('error', fail); server.listen(0, '127.0.0.1', done); });
const port = server.address().port;
await new Promise(done => server.close(done));
Object.assign(env, { PGHOST: '127.0.0.1', PGPORT: String(port), PGDATABASE: 'postgres', PGUSER: 'postgres', PGSSLMODE: 'disable', PGCONNECT_TIMEOUT: '5' });
const checks = [];
let running = false;
let verificationError;
const file = name => readFileSync(name, 'utf8');
const migration1 = file('supabase/migrations/20261026065901_restrict_rls_auto_enable_execution.sql');
const migration2 = file('supabase/migrations/20261026065903_repair_publish_result_fixture_lock.sql');
function command(name, args, input) {
  const result = spawnSync(join(bin, name + extension), args, { env, input, encoding: 'utf8', timeout: 60000, windowsHide: true, maxBuffer: 8 * 1024 * 1024, stdio: name === 'pg_ctl' ? 'ignore' : 'pipe' });
  assert.ifError(result.error);
  return result;
}
const sql = source => command('psql', ['-X', '-qAt', '-v', 'ON_ERROR_STOP=1'], source);
function query(source) { const result = sql(source); assert.equal(result.status, 0, result.stderr); return result.stdout.trim(); }
function rejected(source, pattern) { const result = sql(source); assert.notEqual(result.status, 0, 'Expected rejection'); assert.match(result.stderr, pattern); }
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const actor = (source, user = 1, role = 'authenticated') => `begin; set local role ${role}; set local request.jwt.claims = '${JSON.stringify({ sub: id(user), role })}'; ${source}; commit;`;
const fixture = n => `select public.publish_result('${id(n)}')`;
const snapshot = () => query(`select jsonb_object_agg(name, rows order by name) from (
  ${['seasons','categories','locations','competitions','competition_seasons','teams','fixtures','result_versions','standing_adjustments','admin_audit_log','team_fixture_notes','team_kickoff_preferences','fixture_change_sets','fixture_change_items','fixture_change_history','season_drafts','season_draft_competitions','season_draft_teams'].map(name => `select '${name}' name, (select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) from public.${name} t) rows`).join(' union all ')}
) dataset;`);
const functionState = name => JSON.parse(query(`select json_build_object('oid',oid,'owner',proowner,'acl',proacl,'definer',prosecdef,'config',proconfig,'source',prosrc) from pg_proc where oid='${name}'::regprocedure;`));
function session(source, label) {
  const child = spawn(join(bin, 'psql' + extension), ['-X', '-qAt', '-v', 'ON_ERROR_STOP=1'], { env: { ...env, PGAPPNAME: label }, windowsHide: true });
  let stdout = '', stderr = '';
  const done = new Promise((complete, fail) => {
    child.on('error', fail); child.stdout.on('data', b => { stdout += b; }); child.stderr.on('data', b => { stderr += b; });
    child.on('close', status => complete({ status, stdout, stderr }));
  });
  child.stdin.end(source);
  return done;
}
async function waitFor(label, event) {
  for (let i = 0; i < 100; i++) {
    if (query(`select exists(select 1 from pg_stat_activity where application_name='${label}' and ${event});`) === 't') return;
    await new Promise(done => setTimeout(done, 25));
  }
  throw new Error('Expected observable database wait: ' + label);
}
try {
  const init = command('initdb', ['-D', cluster, '-U', 'postgres', '--auth=trust', '--encoding=UTF8', '--no-locale']);
  assert.equal(init.status, 0, init.stderr);
  const started = command('pg_ctl', ['-D', cluster, '-l', join(root, 'server.log'), '-o', `-h 127.0.0.1 -p ${port}`, '-w', 'start']);
  assert.equal(started.status, 0, started.stderr); running = true;
  query(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key, email text, email_confirmed_at timestamptz);
    create function auth.uid() returns uuid language sql stable as $$select (nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid$$;
    create function auth.role() returns text language sql stable as $$select nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'role'$$;
    grant usage on schema auth to anon,authenticated;
  `);
  for (const name of readdirSync('supabase/migrations').filter(n => n.endsWith('.sql') && n < '20261026000000').sort()) query(file('supabase/migrations/' + name));
  query(migration1); checks.push('optional event helper absent');
  // Reproduce the inspected Supabase event hook, without any production data.
  query(`create function public.rls_auto_enable() returns event_trigger language plpgsql security definer set search_path=pg_catalog as $$
    declare cmd record;
    begin
      for cmd in select * from pg_event_trigger_ddl_commands()
        where command_tag in ('CREATE TABLE','CREATE TABLE AS','SELECT INTO') and object_type in ('table','partitioned table') loop
        if cmd.schema_name='public' then execute format('alter table if exists %s enable row level security',cmd.object_identity); end if;
      end loop;
    end $$;
    create event trigger ensure_rls on ddl_command_end when tag in ('CREATE TABLE','CREATE TABLE AS','SELECT INTO') execute function public.rls_auto_enable();
    grant execute on function public.rls_auto_enable() to anon,authenticated;
    insert into auth.users values ('${id(1)}','contact@futsalindoorsoccer.com.au',now()),('${id(2)}','nonadmin@example.invalid',now());
    insert into private.admin_users(user_id) values('${id(1)}');
    insert into public.seasons(id,name,starts_on,ends_on) values('${id(10)}','Synthetic current','2026-01-01','2027-12-31'),('${id(11)}','Synthetic archive','2025-01-01','2025-12-31');
    insert into public.categories(id,code,name) values('${id(12)}','test','Synthetic');
    insert into public.locations(id,name) values('${id(13)}','Synthetic venue');
    insert into public.competitions(id,category_id,location_id,weekday,division,name) values('${id(14)}','${id(12)}','${id(13)}',1,'A','Synthetic Monday'),('${id(17)}','${id(12)}','${id(13)}',3,'A','Synthetic archive');
    insert into public.competition_seasons(id,competition_id,season_id,lifecycle,publication_state) values('${id(15)}','${id(14)}','${id(10)}','active','published'),('${id(16)}','${id(17)}','${id(11)}','active','published');
    insert into public.teams(id,competition_season_id,name) values('${id(20)}','${id(15)}','Home'),('${id(21)}','${id(15)}','Away'),('${id(22)}','${id(16)}','Old home'),('${id(23)}','${id(16)}','Old away');
    insert into public.fixtures(id,competition_season_id,round_number,match_date,kickoff_time,court,home_team_id,away_team_id,publication_state) values
      ('${id(30)}','${id(15)}',1,'2026-10-12','19:00',1,'${id(20)}','${id(21)}','published'),
      ('${id(31)}','${id(15)}',2,'2026-10-19','19:00',1,'${id(21)}','${id(20)}','published'),
      ('${id(32)}','${id(16)}',1,'2025-10-13','19:00',1,'${id(22)}','${id(23)}','published');
    insert into public.result_versions(id,fixture_id,revision,status,home_score,away_score) values('${id(40)}','${id(30)}',1,'pending_review',4,2),('${id(41)}','${id(31)}',1,'draft',1,0),('${id(42)}','${id(32)}',1,'published',5,3);
    update public.competition_seasons set lifecycle='archived' where id='${id(16)}';
  `);
  const before = snapshot(), publishBefore = functionState('public.publish_result(uuid)'), hookBefore = functionState('public.rls_auto_enable()');
  const triggerBefore = query("select row_to_json(e) from pg_event_trigger e where evtname='ensure_rls';");
  rejected(actor(fixture(40)), /permission denied for table fixtures/); checks.push('original permission bug reproduced');
  assert.equal(snapshot(), before);
  query(migration1); query(migration2);
  assert.equal(snapshot(), before); checks.push('migrations preserve every seeded row and audit record');
  const publishAfter = functionState('public.publish_result(uuid)');
  assert.deepEqual(publishAfter, { ...publishBefore, source: publishBefore.source.replace(/perform\s+1\s+from\s+public\.fixtures\s+where\s+id\s*=\s*candidate\.fixture_id\s+for\s+update\s*;/i, 'perform private.lock_fixture_for_result_publication(candidate.fixture_id);') });
  const hookAfter = functionState('public.rls_auto_enable()');
  assert.deepEqual({ ...hookAfter, acl: null }, { ...hookBefore, acl: null });
  assert.equal(query("select row_to_json(e) from pg_event_trigger e where evtname='ensure_rls';"), triggerBefore); checks.push('function identities, publication guards and event trigger preserved');
  for (const role of ['anon','authenticated']) assert.equal(query(`select has_function_privilege('${role}','public.rls_auto_enable()','execute');`), 'f');
  rejected(actor('select public.rls_auto_enable()', 2, 'anon'), /permission denied for function rls_auto_enable/);
  rejected(actor('select public.rls_auto_enable()', 2), /permission denied for function rls_auto_enable/);
  query('create table public.security_rls_probe(id integer); create table public.security_rls_ctas as select 1 id; select 1 id into public.security_rls_into;');
  assert.equal(query("select bool_and(relrowsecurity) from pg_class where oid in ('public.security_rls_probe'::regclass,'public.security_rls_ctas'::regclass,'public.security_rls_into'::regclass);"), 't');
  query('drop table public.security_rls_probe,public.security_rls_ctas,public.security_rls_into;'); checks.push('automatic RLS survives execution revocation');
  query(migration1); query(migration2); assert.equal(snapshot(), before); assert.deepEqual(functionState('public.publish_result(uuid)'), publishAfter); checks.push('safe migration repeat');
  const publisherDefinition = query("select pg_get_functiondef('public.publish_result(uuid)'::regprocedure);");
  rejected(`begin; ${publisherDefinition.replace('perform private.lock_fixture_for_result_publication(candidate.fixture_id);', 'perform 1;')}; ${migration2.replace(/^begin;|^commit;/gm, '')}`, /Expected exactly one legacy fixture lock/);
  assert.deepEqual(functionState('public.publish_result(uuid)'), publishAfter); assert.equal(snapshot(), before); checks.push('unexpected publisher fails closed and rolls back migration');
  rejected(actor(fixture(40), 2, 'anon'), /permission denied for function publish_result/);
  rejected(actor(fixture(40), 2), /Administrator access required/);
  rejected(actor(`select private.lock_fixture_for_result_publication('${id(30)}')`, 2), /Administrator access required/);
  rejected(actor(`select private.lock_fixture_for_result_publication('${id(30)}')`, 2, 'anon'), /permission denied for function lock_fixture/);
  assert.equal(query(actor('select public.is_fis_admin()', 2)), 'f'); assert.equal(query(actor('select public.is_fis_admin()')), 't');
  assert.equal(query("select has_any_column_privilege('authenticated','public.fixtures','update');"), 'f');
  rejected(actor(`update public.fixtures set court=2 where id='${id(30)}'`), /permission denied for table fixtures/); checks.push('anonymous/non-admin denied; admin fixture DML remains denied');
  const oldHistory = query(`select to_jsonb(r) from public.result_versions r where id='${id(42)}';`);
  const fixtureRows = query('select jsonb_agg(to_jsonb(f) order by id) from public.fixtures f;');
  query(actor(fixture(40)));
  assert.equal(query(`select status||':'||published_by from public.result_versions where id='${id(40)}';`), 'published:' + id(1));
  assert.equal(query(actor(`select points from public.standings where team_id='${id(20)}'`, 2, 'anon')), '3'); checks.push('admin publication and public standings');
  query(actor(`insert into public.result_versions(id,fixture_id,revision,home_score,away_score,supersedes_result_id,correction_reason) values('${id(43)}','${id(30)}',2,3,6,'${id(40)}','Synthetic correction')`));
  query(actor(fixture(43)));
  assert.equal(query(`select string_agg(status,',' order by revision) from public.result_versions where fixture_id='${id(30)}';`), 'superseded,published');
  assert.equal(query(actor(`select points from public.standings where team_id='${id(21)}'`, 2, 'anon')), '3'); checks.push('correction supersedes history and updates public standings');
  rejected(actor(`update public.result_versions set home_score=100 where id='${id(43)}'`), /Published scores cannot be edited/);
  query(actor(`insert into public.result_versions(id,fixture_id,revision,home_score,away_score,supersedes_result_id,correction_reason) values('${id(44)}','${id(30)}',3,0,1,'${id(40)}','Stale correction')`));
  rejected(actor(fixture(44)), /Correction must reference the current published result/); checks.push('immutable published values and stale corrections');
  query(actor(`insert into public.result_versions(id,fixture_id,revision,home_score,away_score,supersedes_result_id,correction_reason) values('${id(45)}','${id(30)}',4,null,1,'${id(43)}','Incomplete correction')`));
  const failureBefore = snapshot(); rejected(actor(fixture(45)), /complete regulation scores/); assert.equal(snapshot(), failureBefore); checks.push('mid-publication failure rolls back result and audit writes');
  rejected(actor(`insert into public.result_versions(fixture_id,revision,home_score,away_score,supersedes_result_id,correction_reason) values('${id(31)}',2,1,0,'${id(43)}','Wrong fixture')`), /same fixture/);
  rejected(actor(`insert into public.result_versions(fixture_id,revision,home_score,away_score,supersedes_result_id,correction_reason) values('${id(32)}',2,1,0,'${id(42)}','Archive edit')`), /Archived/); checks.push('cross-fixture and archived-history protection');
  query(actor(`insert into public.result_versions(id,fixture_id,revision,home_score,away_score) values('${id(47)}','${id(31)}',2,2,0)`));
  const label = 'fis-security-' + randomUUID();
  const first = session(actor(`${fixture(41)}; select pg_sleep(3)`), label);
  await waitFor(label, "wait_event='PgSleep'");
  const second = session(actor(fixture(47)), label + '-second');
  await waitFor(label + '-second', "wait_event_type='Lock'");
  const outcomes = await Promise.all([first, second]); assert.equal(outcomes[0].status, 0, outcomes[0].stderr);
  assert.notEqual(outcomes[1].status, 0); assert.match(outcomes[1].stderr, /Correction must reference the current published result/);
  assert.equal(query(`select count(*) from public.result_versions where fixture_id='${id(31)}' and status='published';`), '1'); checks.push('real concurrent publication serialises and rejects stale contender');
  assert.equal(query(`select to_jsonb(r) from public.result_versions r where id='${id(42)}';`), oldHistory);
  assert.equal(query('select jsonb_agg(to_jsonb(f) order by id) from public.fixtures f;'), fixtureRows);
  const auditBefore = JSON.parse(before).admin_audit_log;
  const auditAfter = JSON.parse(snapshot()).admin_audit_log;
  for (const row of auditBefore) assert.deepEqual(auditAfter.find(r => r.id === row.id), row);
  assert.equal(query(`select count(*) from public.admin_audit_log where table_name='result_versions' and actor_id='${id(1)}' and new_row->>'status'='published';`), '3'); checks.push('fixtures and archived scores unchanged; audit history retained and attributed');
  const repairedData = snapshot();
  const oldDefinition = file('supabase/migrations/202609250001_initial_fis_admin_schema.sql').match(/create function public\.publish_result[\s\S]*?\$\$;/)[0].replace('create function', 'create or replace function');
  // Rehearse rollback transactionally: no data rollback and no broad grants.
  query(`begin; ${oldDefinition} drop function private.lock_fixture_for_result_publication(uuid); rollback;`);
  assert.deepEqual(functionState('public.publish_result(uuid)'), publishAfter); assert.equal(snapshot(), repairedData); checks.push('rollback rehearsal preserves repaired code and data');
  query(`${oldDefinition} drop function private.lock_fixture_for_result_publication(uuid);`);
  rejected(actor(fixture(44)), /permission denied for table fixtures/);
  assert.equal(snapshot(), repairedData); query(migration2);
  assert.deepEqual(functionState('public.publish_result(uuid)'), publishAfter); assert.equal(snapshot(), repairedData); checks.push('committed code rollback reproduces old defect and can be repaired without data rollback');
  query('grant execute on function public.rls_auto_enable() to public,anon,authenticated;');
  assert.equal(query("select has_function_privilege('anon','public.rls_auto_enable()','execute');"), 't');
  assert.equal(query("select row_to_json(e) from pg_event_trigger e where evtname='ensure_rls';"), triggerBefore);
  query(migration1); assert.equal(snapshot(), repairedData); checks.push('event ACL rollback and reapplication preserve trigger and data');
  console.log(JSON.stringify({ postgres: query('show server_version;'), checks: checks.length, passed: checks.length, productionAccess: false, realConcurrentSessions: true, syntheticAuthClaims: true }));
} catch (error) {
  verificationError = error;
  throw error;
} finally {
  if (running || existsSync(join(cluster, 'postmaster.pid'))) {
    const stopped = command('pg_ctl', ['-D', cluster, '-m', 'immediate', '-w', 'stop']);
    assert.equal(stopped.status, 0, 'Disposable server did not stop; cluster retained at ' + root);
  }
  assert.ok(resolve(root).startsWith(resolve(tmpdir()) + sep + 'fis-security-'));
  try {
    rmSync(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 150 });
  } catch (error) {
    if (!verificationError) throw error;
    console.error('Stopped temporary cluster could not be removed: ' + root);
  }
}
