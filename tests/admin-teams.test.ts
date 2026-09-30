import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { cleanFixtureNote, consequentialTeamChanges, filterAdminTeams, validateKitColour, validateTeamDraft, validateTeamPreferences, type AdminTeam, type TeamDraft } from "../src/lib/admin/teams";
import { TeamsSetupUnavailableError } from "../src/lib/admin/teams-data";

const monday:AdminTeam={id:"m1",competitionSeasonId:"m",name:"Zulu United",status:"active",standingsEligible:true,kitColour:"#FFFFFF",note:"No late games",preferences:[{id:"p1",kickoffTime:"19:00",classification:"required"}],hasHistory:true,profileVersion:4};
const teams:AdminTeam[]=[monday,{...monday,id:"m2",name:"Alpha FC",status:"inactive",hasHistory:false},{...monday,id:"w1",competitionSeasonId:"w",name:"Wednesday FC"}];
const draft=(overrides:Partial<TeamDraft>={}):TeamDraft=>({name:monday.name,status:monday.status,competitionSeasonId:monday.competitionSeasonId,kitColour:monday.kitColour??"",note:monday.note,preferences:monday.preferences.map(value=>({...value})),...overrides});

test("team filters keep nights separate and sort by name",()=>{
 assert.deepEqual(filterAdminTeams(teams,{editionId:"m",search:"",status:"all"}).map(team=>team.name),["Alpha FC","Zulu United"]);
 assert.deepEqual(filterAdminTeams(teams,{editionId:"m",search:"alpha",status:"inactive"}).map(team=>team.id),["m2"]);
 assert.deepEqual(filterAdminTeams(teams,{editionId:"w",search:"",status:"all"}).map(team=>team.id),["w1"]);
});
test("team status, rename and competition changes are identified as consequential",()=>{
 assert.deepEqual(consequentialTeamChanges(monday,draft({name:"Renamed",status:"inactive",competitionSeasonId:"w"})),[
  "Move this team to another competition or division","Change an active team to inactive","Rename a team that already has fixture or standings history",
 ]);
 assert.deepEqual(consequentialTeamChanges({...monday,status:"inactive"},draft({status:"active"})),["Reactivate this team"]);
});
test("kit colours require a six-digit hex value",()=>{assert.equal(validateKitColour("#ffffff"),true);assert.equal(validateKitColour(""),true);assert.equal(validateKitColour("white"),false);assert.equal(validateKitColour("#fff"),false)});
test("preferences support creation and editing while rejecting duplicates and conflicts",()=>{
 assert.deepEqual(validateTeamPreferences([{kickoffTime:"19:00",classification:"required"},{kickoffTime:"20:20",classification:"avoid"}]),[]);
 assert.match(validateTeamPreferences([{kickoffTime:"19:00",classification:"required"},{kickoffTime:"19:00",classification:"required"}])[0],/duplicates/);
 assert.match(validateTeamPreferences([{kickoffTime:"19:00",classification:"required"},{kickoffTime:"19:00",classification:"avoid"}])[0],/cannot be both/);
 assert.match(validateTeamPreferences([{kickoffTime:"25:00",classification:"preferred"}])[0],/invalid/);
});
test("historical competition reassignment is rejected but history-free assignment is allowed",()=>{
 assert.match(validateTeamDraft(monday,draft({competitionSeasonId:"w"}))[0],/cannot be moved/);
 assert.deepEqual(validateTeamDraft({...monday,hasHistory:false},draft({competitionSeasonId:"w"}),"Move approved by league admin"),[]);
 assert.match(validateTeamDraft({...monday,hasHistory:false},draft({competitionSeasonId:"w"}))[0],/administrative reason/);
});
test("empty fixture notes are converted to deletion rather than meaningless records",()=>{assert.equal(cleanFixtureNote("   "),null);assert.equal(cleanFixtureNote("  avoid late games "),"avoid late games")});
test("schema-unavailable state is explicit",()=>assert.equal(new TeamsSetupUnavailableError().message,"Team management tables are not available."));
test("team management remains static, browser-side and admin-reconfirmed",()=>{
 const page=readFileSync("src/app/admin/teams/page.tsx","utf8"),manager=readFileSync("src/app/admin/teams/TeamsManager.tsx","utf8"),actions=readFileSync("src/lib/admin/teams-actions.ts","utf8"),data=readFileSync("src/lib/admin/teams-data.ts","utf8");
 assert.match(page,/AdminAuthGuard/);assert.match(actions,/getUser\(\)/);assert.match(actions,/rpc\("is_fis_admin"\)/);assert.match(actions,/rpc\("save_team_profile"/);assert.match(data,/team_kickoff_preferences/);assert.match(data,/team_fixture_notes/);assert.match(data,/profile_version/);
 assert.doesNotMatch(actions,/\.from\("teams"\)|\.from\("team_kickoff_preferences"\)|\.from\("team_fixture_notes"\)/);
 assert.doesNotMatch(`${page}${manager}${actions}${data}`,/use server|service_role|SUPABASE_SERVICE|season-2026-s1|fixtures\.json/);
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
