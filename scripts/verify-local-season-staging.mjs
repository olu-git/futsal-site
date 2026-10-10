// Local-only, fresh embedded PostgreSQL. No URLs, credentials or hosted access.
import assert from 'node:assert/strict';
import { readFileSync,readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
if(!process.argv[2])throw new Error('Pass temporary local PGlite module path.');
// Optional real local PostgreSQL mode; caller supplies a temporary installed module.
// No hosted URL is accepted. Bind loopback and use an ephemeral cluster/password.
const realPostgres=process.argv[3]==='--postgres';
let db,localServer;
if(realPostgres){
 const pgDriver=await import(pathToFileURL(resolve(process.argv[2],'../../../pg/lib/index.js')).href);pgDriver.default.types.setTypeParser(20,Number);pgDriver.default.types.setTypeParser(1082,value=>value);
 const {default:EmbeddedPostgres}=await import(pathToFileURL(resolve(process.argv[2])).href);
 const {tmpdir}=await import('node:os');const {join}=await import('node:path');
 localServer=new EmbeddedPostgres({databaseDir:join(tmpdir(),'fis-disposable-pg-'+randomUUID()),user:'postgres',password:randomUUID(),port:54329,persistent:false,createPostgresUser:false,postgresFlags:['-c','listen_addresses=127.0.0.1'],onLog:()=>{},onError:()=>{}});
 await localServer.initialise();await localServer.start();
 const client=localServer.getPgClient('postgres','127.0.0.1');await client.connect();
 db={query:(sql,args)=>client.query(sql,args),exec:async sql=>{const r=await client.query(sql);return Array.isArray(r)?r:[r]},close:async()=>{await client.end();await localServer.stop()},newSession:async()=>{const c=localServer.getPgClient('postgres','127.0.0.1');await c.connect();await c.query("set statement_timeout='10s';set lock_timeout='8s'");await c.query("select set_config('fis.local_actor',$1,false)",[adminId]);return c}};
}else{const {PGlite}=await import(pathToFileURL(resolve(process.argv[2])).href);db=new PGlite();}
const read=p=>readFileSync(p,'utf8'),adminId='ffffffff-1111-4000-8000-000000000001';
async function fail(sql,args,pattern){try{await db.query(sql,args);assert.fail('Expected rejection');}catch(e){assert.match(e.message,pattern);}}
async function history(){return (await db.query(`select jsonb_build_object('teams',(select jsonb_agg(to_jsonb(t) order by t.id) from public.teams t where t.competition_season_id in('8021a2bb-eb2b-55fe-9900-d3f50facf092','e1db4456-0663-55d2-95a1-681d17163b91')),'fixtures',(select jsonb_agg(to_jsonb(f) order by f.id) from public.fixtures f),'results',(select jsonb_agg(to_jsonb(r) order by r.id) from public.result_versions r),'adjustments',(select jsonb_agg(to_jsonb(a) order by a.id) from public.standing_adjustments a)) data`)).rows[0].data;}
try{
 await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('fis.local_actor',true),'')::uuid$$;create function auth.role() returns text language sql stable as $$select 'local-test'::text$$;`);
 for(const name of readdirSync('supabase/migrations').filter(n=>n.endsWith('.sql')).sort()){
  // Reproduce observed hosted default privileges before the proposed migration.
  if(name==='20261009224309_season_fixture_staging.sql')await db.exec('grant truncate,references,trigger on public.season_drafts,public.season_draft_competitions,public.season_draft_teams to authenticated;');
  await db.exec(read('supabase/migrations/'+name));
 }
 for(const table of ['season_drafts','season_draft_competitions','season_draft_teams'])for(const privilege of ['TRUNCATE','REFERENCES','TRIGGER'])for(const role of ['anon','authenticated'])assert.equal((await db.query('select has_table_privilege($1,$2,$3) allowed',[role,'public.'+table,privilege])).rows[0].allowed,false);
 await db.exec(read('supabase/imports/2026-s1/current-season-import.sql'));
 await db.query('insert into auth.users values($1,$2,now())',[adminId,'contact@futsalindoorsoccer.com.au']);
 await db.query('insert into private.admin_users(user_id) values($1)',[adminId]);
 await fail('select * from public.create_season_draft($1,$2,$3,null)',['LOCAL STAGING','2026-10-12','2027-05-26'],/Administrator/);
 await db.query("select set_config('fis.local_actor',$1,false)",[adminId]);
 // Verify the prepared read-only review with real local grants/RLS and no free-text export.
 const reviewSql=read('supabase/production/review-returning-availability.sql');
 const reviewTeam='fc2b2203-9a12-5a25-9b99-6370c00a5dc7';
 await db.query("insert into public.team_fixture_notes(team_id,notes) values($1,$2)",[reviewTeam,'Synthetic scheduling note with PRIVATE_PERSONAL_MARKER which must not be exported']);
 await db.query("insert into public.team_kickoff_preferences(team_id,kickoff_time,classification) values($1,'19:40','preferred')",[reviewTeam]);
 await db.exec('set role authenticated');
 const reviewed=(await db.exec(reviewSql)).find(r=>r.rows?.length===26).rows;
 assert.equal(reviewed.length,26);assert.deepEqual(Object.keys(reviewed[0]).sort(),['night','scheduling_preferences','team']);
 const rinnai=reviewed.find(t=>t.team==='Rinnai'&&t.night==='Wednesday');assert.deepEqual(rinnai.scheduling_preferences.kickoff_rules,[{time:'19:40',strength:'preferred'}]);assert.equal(rinnai.scheduling_preferences.private_note_review_required,true);assert(!JSON.stringify(reviewed).includes('PRIVATE_PERSONAL_MARKER'));
 await db.exec('reset role');await db.query("select set_config('fis.local_actor','',false)");await db.exec('set role authenticated');
 try{await db.exec(reviewSql);assert.fail('Non-admin review must fail');}catch(e){assert.match(e.message,/Authorised|permission denied/);await db.exec('rollback');}
 await db.exec('reset role');await db.query("select set_config('fis.local_actor',$1,false)",[adminId]);
 await db.query('delete from public.team_fixture_notes where team_id=$1',[reviewTeam]);await db.query('delete from public.team_kickoff_preferences where team_id=$1',[reviewTeam]);
 // Exact accidental preference correction and stale-copy protection, disposable only.
 const king='04ebec43-f537-52b4-bbae-ffe3449b7826';
 await db.query('update public.teams set profile_version=2 where id=$1',[king]);
 await db.query("insert into public.team_kickoff_preferences(id,team_id,kickoff_time,classification,created_at,updated_at) values('a04c3160-7c38-4dd9-b0d2-73bb4d73f649',$1,'19:00','preferred','2026-10-09T20:00:03.54453Z','2026-10-09T20:00:03.54453Z')",[king]);
 await fail('select public.create_season_draft($1,$2,$3,null)',['BLOCKED STALE COPY','2026-10-12','2027-05-26'],/accidental 19:00/);
 const correction=read('supabase/production/correct-king-adl-kickoff-preference.sql');
 await db.exec(correction.replace(/commit;\s*$/,'rollback;'));
 assert.equal((await db.query('select count(*)::integer n from public.team_kickoff_preferences where team_id=$1',[king])).rows[0].n,1);
 await db.query('update public.teams set profile_version=3 where id=$1',[king]);
 await assert.rejects(db.exec(correction),/Recorded profile changed/);await db.exec('rollback;');
 await db.query('update public.teams set profile_version=2 where id=$1',[king]);
 await db.exec(correction);await db.exec(correction);
 assert.equal((await db.query('select profile_version from public.teams where id=$1',[king])).rows[0].profile_version,3);
 assert.equal((await db.query('select count(*)::integer n from public.team_kickoff_preferences where team_id=$1',[king])).rows[0].n,0);
 const preflight=(await db.exec(read('supabase/production/new-season-release-preflight.sql'))).find(r=>r.rows?.[0]?.exact_accidental_row!==undefined);
 assert.equal(preflight.rows[0].preference_count,0);
 assert.equal(preflight.rows[0].exact_accidental_row,false);
 const correctedDraft=(await db.query('select * from public.create_season_draft($1,$2,$3,null)',['CORRECTED COPY','2026-10-12','2027-05-26'])).rows[0].draft_id;
 await db.query("update public.season_draft_teams set preferences='[{\"kickoff_time\":\"19:00\",\"classification\":\"preferred\"}]'::jsonb,availability_confirmed=false where season_draft_id=$1 and source_team_id=$2",[correctedDraft,king]);
 await fail("update public.season_draft_teams set source_preferences='[{\"kickoff_time\":\"19:00:00\",\"classification\":\"preferred\"}]'::jsonb where season_draft_id=$1 and source_team_id=$2",[correctedDraft,king],/accidental 19:00/);
 // Simulate a draft predating the guard; validation must reject its stale profile.
 await db.exec('alter table public.season_draft_teams disable trigger guard_king_adl_draft_preference;');
 await db.query("update public.season_draft_teams set source_preferences='[{\"kickoff_time\":\"19:00\",\"classification\":\"preferred\"}]'::jsonb where season_draft_id=$1 and source_team_id=$2",[correctedDraft,king]);
 await db.exec('alter table public.season_draft_teams enable trigger guard_king_adl_draft_preference;');
 await fail('select public.validate_season_draft($1,1)',[correctedDraft],/accidental 19:00/);
 await db.query('delete from public.season_drafts where id=$1',[correctedDraft]);
 // A distinct future source preference is legitimate, including the same kickoff time.
 const futurePreference=(await db.query("insert into public.team_kickoff_preferences(team_id,kickoff_time,classification) values($1,'19:00','preferred') returning id",[king])).rows[0].id;
 const futureDraft=(await db.query('select * from public.create_season_draft($1,$2,$3,null)',['FUTURE REVIEWED PREFERENCE','2026-10-12','2027-05-26'])).rows[0].draft_id;
 assert.deepEqual((await db.query('select source_preferences from public.season_draft_teams where season_draft_id=$1 and source_team_id=$2',[futureDraft,king])).rows[0].source_preferences,[{kickoff_time:'19:00',classification:'preferred'}]);
 await db.query('delete from public.season_drafts where id=$1',[futureDraft]);
 await db.query('delete from public.team_kickoff_preferences where id=$1',[futurePreference]);
 const raceEvidence=[];
 async function race(label,sql,args){
  const a=await db.newSession(),b=await db.newSession();try{
   await a.query('begin');const first=await a.query(sql,args);
   await b.query('begin');const pid=(await b.query('select pg_backend_pid() pid')).rows[0].pid;
   const loser=b.query(sql,args).then(()=>({ok:true}),e=>({ok:false,error:e}));
   let blocked=false;for(let i=0;i<60;i++){const row=(await db.query('select wait_event_type from pg_stat_activity where pid=$1',[pid])).rows[0];if(row?.wait_event_type==='Lock'){blocked=true;break}await new Promise(r=>setTimeout(r,30));}
   assert(blocked,label+' must demonstrably wait on a PostgreSQL lock');await a.query('commit');
   const result=await loser;assert.equal(result.ok,false,label+' stale writer must fail');assert.match(result.error.message,/Stale|changed|editable|activated|review/i);await b.query('rollback');raceEvidence.push(label);return first;
  }finally{await a.query('rollback');await b.query('rollback');await a.end();await b.end()}
 }
 if(realPostgres){
  const t=(await db.query('select * from public.teams where id=$1',[king])).rows[0];
  await race('two-session profile save','select * from public.save_team_profile($1,$2,$3,$4,$5,$6,$7,$8,$9)',[king,t.profile_version,t.name,t.status,t.competition_season_id,t.kit_colour,'[]',null,null]);
 }
 const original=await history();
 const d=(await db.query('select * from public.create_season_draft($1,$2,$3,null)',['LOCAL STAGING','2026-10-12','2027-05-26'])).rows[0],id=d.draft_id;
 const comps=(await db.query('select * from public.season_draft_competitions where season_draft_id=$1 order by weekday',[id])).rows;
 const oldTeams=(await db.query('select * from public.teams')).rows;
 const reservations=JSON.parse(read('docs/drafts/new-season-team-memberships.json')).entries;
 const schedules={monday:JSON.parse(read('docs/drafts/monday-rounds.json')),wednesday:JSON.parse(read('docs/drafts/wednesday-rounds.json'))};
 const teams=[];
 for(const c of comps){const night=c.weekday===1?'monday':'wednesday';for(const readable of schedules[night].constraints.roster){const src=oldTeams.find(t=>t.competition_season_id===c.source_competition_season_id&&t.legacy_id===readable),fresh=reservations.find(t=>t.readableId===readable);assert(src||fresh,readable);teams.push({id:fresh?.uuid??randomUUID(),draft_competition_id:c.id,source_team_id:src?.id??null,readable_id:readable,availability_confirmed:fresh?.availabilityConfirmed??false,selected:true,name:src?.name??fresh.name,status:'active',standings_eligible:true,kit_colour:src?.kit_colour??null,copy_private_profile:true,fixture_note:fresh?.fixtureNote??'Synthetic local availability checked',preferences:fresh?.preferences??(readable==='wed-kuq-e-zi'?['19:00','19:40','20:20'].map(time=>({kickoff_time:time,classification:'required'})):[]),source_fixture_note:null,source_preferences:[]});}}
 assert.equal(teams.filter(t=>t.availability_confirmed).length,4);assert.equal(teams.filter(t=>!t.availability_confirmed).length,26);
 const payload=comps.map(c=>({...c,venue_confirmed:false}));
 const save=(version,cs=payload,ts=teams)=>db.query('select public.save_season_draft($1,$2,$3,$4,$5,$6,$7) version',[id,version,'LOCAL STAGING','2026-10-12','2027-05-26',JSON.stringify(cs),JSON.stringify(ts)]);
 let version=(await save(1)).rows[0].version;
 let validation=(await db.query('select public.validate_season_draft($1,$2) report',[id,version])).rows[0].report;version=validation.version;
 await fail('select public.stage_season_draft($1,$2)',[id,version],/Confirm every/);
 assert.equal((await db.query('select count(*)::integer n from public.seasons')).rows[0].n,1);
 // Standing venue booking is sufficient without individual date or competition checkboxes.
 for(const t of teams)t.availability_confirmed=true;
 // Save from validated resets validation, even when only confirmations change.
 version=(await save(version)).rows[0].version;
 assert.equal((await db.query('select status from public.season_drafts where id=$1',[id])).rows[0].status,'draft');
 await fail('select public.stage_season_draft($1,$2)',[id,version],/unvalidated/);
 version=(await db.query('select public.validate_season_draft($1,$2) report',[id,version])).rows[0].report.version;
 await fail('select public.stage_season_draft($1,$2)',[id,version-1],/Stale/);
 if(realPostgres){await race('two-session draft save','select public.save_season_draft($1,$2,$3,$4,$5,$6,$7)',[id,version,'LOCAL STAGING','2026-10-12','2027-05-26',JSON.stringify(payload),JSON.stringify(teams)]);version++;version=(await db.query('select public.validate_season_draft($1,$2) report',[id,version])).rows[0].report.version;}
 const staged=(await db.query('select public.stage_season_draft($1,$2) season',[id,version])).rows[0].season;version++;
 assert.equal((await db.query("select count(*)::integer n from public.competition_seasons where season_id=$1 and lifecycle='planned' and publication_state='draft'",[staged])).rows[0].n,2);
 assert.equal((await db.query('select count(*)::integer n from public.teams where competition_season_id=any($1::uuid[])',[comps.map(c=>c.id)])).rows[0].n,30);
 await fail('select public.save_season_draft($1,$2,$3,$4,$5,$6,$7)',[id,version,'LOCAL STAGING','2026-10-12','2027-05-26',JSON.stringify(payload),JSON.stringify(teams)],/structure is frozen/);
 assert.deepEqual(await history(),original);
 await fail('update public.season_draft_teams set name=$1 where id=$2',['Changed after stage',teams[0].id],/structure is frozen/);
 await fail('select public.validate_season_draft($1,$2)',[id,version],/reviewed fixture plan/);
 await db.exec("select set_config('fis.local_actor','',false);set role anon;");
 assert.equal((await db.query('select count(*)::integer n from public.teams')).rows[0].n,oldTeams.length);
 await fail('select count(*) from public.season_drafts',[],/permission denied/);
 await db.exec('reset role');await db.query("select set_config('fis.local_actor',$1,false)",[adminId]);
 const plans=[];
 for(const c of comps){const night=c.weekday===1?'monday':'wednesday',schedule=schedules[night];
  const bad=structuredClone(schedule);bad.fixtures[0].date='2026-10-28';
  await fail('select public.import_season_schedule($1,$2,$3,$4)',[id,version,c.id,JSON.stringify(bad)],/Blocking/);
  assert.equal((await db.query('select count(*)::integer n from public.fixture_change_sets where competition_season_id=$1',[c.id])).rows[0].n,0);
  // Editing both rules and fixtures cannot remove standing-booking calendar exclusions.
  const forbidden=structuredClone(schedule);const blocked=night==='wednesday'?'2026-10-28':'2027-03-08';const firstDate=forbidden.fixtures[0].date;for(const f of forbidden.fixtures)if(f.date===firstDate)f.date=blocked;forbidden.constraints.dates[0]=blocked;
  await fail('select public.import_season_schedule($1,$2,$3,$4)',[id,version,c.id,JSON.stringify(forbidden)],/Blocking/);
  assert.equal((await db.query('select count(*)::integer n from public.fixture_change_sets where competition_season_id=$1',[c.id])).rows[0].n,0);
  if(night==='wednesday'){const late=structuredClone(schedule);late.fixtures.find(f=>[f.home,f.away].includes('wed-kuq-e-zi')&&![f.home,f.away].includes('wed-umoja-stars')).time='21:00';await fail('select public.import_season_schedule($1,$2,$3,$4)',[id,version,c.id,JSON.stringify(late)],/Blocking/);}
  const plan=(await db.query('select public.import_season_schedule($1,$2,$3,$4) plan',[id,version,c.id,JSON.stringify(schedule)])).rows[0].plan;version++;
  let set=(await db.query('select * from public.fixture_change_sets where id=$1',[plan])).rows[0];
  const report=(await db.query('select private.fixture_change_report($1) report',[plan])).rows[0].report;
  assert(!report.messages.some(m=>m.severity==='blocking'),JSON.stringify(report));
  await db.query("select public.transition_fixture_change_set($1,$2,'submit',true)",[plan,set.version]);
  set=(await db.query('select * from public.fixture_change_sets where id=$1',[plan])).rows[0];
  await fail('select public.publish_fixture_change_set($1,$2)',[plan,set.version],/Planned fixtures publish only/);
  assert.deepEqual(await history(),original);
  plans.push(set);
 }
 version=(await db.query('select public.validate_season_draft($1,$2) report',[id,version])).rows[0].report.version;
 await fail("select * from public.activate_season_draft($1,$2,'ACTIVATE')",[id,version-1],/Stale/);
 // Subsequent fixture review invalidates the earlier season-validation snapshot.
 let changing=(await db.query('select * from public.fixture_change_sets where id=$1',[plans[0].id])).rows[0];
 await db.query("select public.transition_fixture_change_set($1,$2,'return',false)",[changing.id,changing.version]);
 changing=(await db.query('select * from public.fixture_change_sets where id=$1',[changing.id])).rows[0];
 await db.query("select public.transition_fixture_change_set($1,$2,'submit',true)",[changing.id,changing.version]);
 await fail("select * from public.activate_season_draft($1,$2,'ACTIVATE')",[id,version],/Fixture review changed/);
 version=(await db.query('select public.validate_season_draft($1,$2) report',[id,version])).rows[0].report.version;
 // A returning profile changed after staging/review must block validation and activation.
 const changedSource=teams.find(t=>t.source_team_id).source_team_id;
 await db.query('insert into public.team_fixture_notes(team_id,notes) values($1,$2)',[changedSource,'Synthetic later availability change']);
 await fail('select public.validate_season_draft($1,$2)',[id,version],/Source availability profile changed/);
 await fail("select * from public.activate_season_draft($1,$2,'ACTIVATE')",[id,version],/Source availability profile changed/);
 assert.deepEqual(await history(),original);
 await db.query('delete from public.team_fixture_notes where team_id=$1',[changedSource]);
 if(realPostgres){
  const editor=await db.newSession(),activator=await db.newSession();try{
   await editor.query('begin');const current=(await editor.query('select * from public.fixture_change_sets where id=$1',[plans[0].id])).rows[0];
   await editor.query("select public.transition_fixture_change_set($1,$2,'return',false)",[current.id,current.version]);
   const pid=(await activator.query('select pg_backend_pid() pid')).rows[0].pid;
   const attempt=activator.query("select * from public.activate_season_draft($1,$2,'ACTIVATE')",[id,version]).then(()=>({ok:true}),error=>({ok:false,error}));
   let blocked=false;for(let i=0;i<60;i++){if((await db.query('select wait_event_type from pg_stat_activity where pid=$1',[pid])).rows[0]?.wait_event_type==='Lock'){blocked=true;break}await new Promise(r=>setTimeout(r,30));}assert(blocked);
   await editor.query('commit');const result=await attempt;assert.equal(result.ok,false);assert.match(result.error.message,/review|pending/i);assert.deepEqual(await history(),original);
   raceEvidence.push('activation waits for fixture edit and rejects stale review');
  }finally{await editor.query('rollback');await editor.end();await activator.end()}
  const changed=(await db.query('select * from public.fixture_change_sets where id=$1',[plans[0].id])).rows[0];await db.query("select public.transition_fixture_change_set($1,$2,'submit',true)",[changed.id,changed.version]);version=(await db.query('select public.validate_season_draft($1,$2) report',[id,version])).rows[0].report.version;
 }
 // Force a second-night insert failure to prove first-night writes roll back too.
 await db.exec(`begin;create function pg_temp.reject_second_night() returns trigger language plpgsql as $$begin if new.competition_season_id='${comps[1].id}' then raise exception 'Synthetic second-night failure';end if;return new;end$$;create trigger local_second_night_failure before insert on public.fixtures for each row execute function pg_temp.reject_second_night();savepoint local_failure;`);
 await fail("select * from public.activate_season_draft($1,$2,'ACTIVATE')",[id,version],/Synthetic second-night failure/);
 await db.exec('rollback to savepoint local_failure;');assert.deepEqual(await history(),original);
 assert.equal((await db.query("select count(*)::integer n from public.competition_seasons where lifecycle='active'")).rows[0].n,2);
 await db.exec('rollback;');
 // Synthetic atomic rollover ONLY in a rollback transaction, never a real season release.
 await db.exec('begin;');
 const activated=(await db.query("select * from public.activate_season_draft($1,$2,'ACTIVATE')",[id,version])).rows[0];
 assert.equal(activated.team_count,30);assert.equal(activated.competition_count,2);
 assert.equal((await db.query('select count(*)::integer n from public.fixtures where competition_season_id=any($1::uuid[])',[comps.map(c=>c.id)])).rows[0].n,422);
 const newHistory=await history();assert.deepEqual(newHistory.teams,original.teams);assert.deepEqual(newHistory.results,original.results);assert.deepEqual(newHistory.adjustments,original.adjustments);
 assert.deepEqual(newHistory.fixtures.filter(f=>original.fixtures.some(old=>old.id===f.id)),original.fixtures);
 const buckle=teams.find(t=>t.readable_id==='wed-buckle-city'),etihad=teams.find(t=>t.readable_id==='wed-etihad-fc');
 const played=(await db.query('select id from public.fixtures where home_team_id=$1 and away_team_id=$2',[buckle.id,etihad.id])).rows[0];
 await db.query("insert into public.result_versions(fixture_id,revision,status,home_score,away_score) values($1,1,'published',2,2)",[played.id]);
 assert.deepEqual((await db.query('select played,points,goals_for,goals_against from public.standings where team_id=$1',[buckle.id])).rows[0],{played:1,points:1,goals_for:2,goals_against:2});
 await db.exec('rollback;');
 assert.deepEqual(await history(),original);
 assert.equal((await db.query('select lifecycle from public.competition_seasons where id=$1',[comps[0].id])).rows[0].lifecycle,'planned');
 if(realPostgres){
  await race('two-session activation commits once','select * from public.activate_season_draft($1,$2,\'ACTIVATE\')',[id,version]);
  await fail("select * from public.activate_season_draft($1,$2,'ACTIVATE')",[id,version],/Stale|activated|validated/i);
  assert.equal((await db.query('select count(*)::integer n from public.fixtures where competition_season_id=any($1::uuid[])',[comps.map(c=>c.id)])).rows[0].n,422);
  assert.deepEqual((await history()).fixtures.filter(f=>original.fixtures.some(old=>old.id===f.id)),original.fixtures);
 }
 console.log(JSON.stringify({engine:realPostgres?'PostgreSQL 17 ephemeral loopback cluster':'PGlite in-memory PostgreSQL',raceEvidence,migrations:7,hostedConnections:0,newTeams:4,stagedMemberships:30,reviewedMatches:422,adminDenial:'passed',kingAdlCorrection:'passed: exact deletion, rollback, repeat, changed-profile refusal, stale copy/validation rejection; legitimate future preference permitted',availabilityGate:'passed: four organiser-confirmed, 26 returning remain gated',readOnlyProfileReview:'passed: 26 scoped rows, no free text, non-admin denied',sourceProfileFreshness:'passed: later source changes block validation/activation',saveResetsValidation:'passed',staleVersions:'passed',failedImportRollback:'passed',ordinaryPublicationBlocked:'passed',anonymousDraftInvisibility:'passed',historyPreserved:'passed',fixtureReviewVersionBinding:'passed',secondNightFailureRollback:'passed',buckleNormalStandings:'passed with synthetic draw',atomicSyntheticRollover:'passed then rolled back',limits:realPostgres?'Mock Auth helpers; real independent SQL sessions; no hosted Auth/PostgREST':'Mock Auth helpers; single connection; no hosted PostgREST or concurrency test'},null,2));
}catch(e){console.error(e.message,e.where??'',e.position??'');if(e.position)console.error(e.query?.slice(Number(e.position)-100,Number(e.position)+100));process.exitCode=1;}finally{await db.close();}
// The temporary PostgreSQL library's beforeExit hook otherwise replaces exitCode with zero.
if(process.exitCode)process.exit(process.exitCode);
