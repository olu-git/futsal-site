import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { filterAdminFixtures, fixtureDiff } from "../src/app/admin/fixtures/FixturesManager";
import { FixturesSetupInactiveError } from "../src/lib/admin/fixtures-data";
import { parseFixtureChangeUpload, validateFixtureChanges, type FixtureChangeContext } from "../src/lib/admin/fixture-changes";
import type { AdminFixtureData } from "../src/lib/admin/fixtures-data";

const fixtures: AdminFixtureData[] = [
  { id:"m2",competitionSeasonId:"m",roundNumber:2,date:"2026-10-05",kickoffTime:"20:20",court:2,homeTeamId:"a",awayTeamId:"b",stage:"regular_season",publicationState:"published",scheduleStatus:"scheduled",scheduleVersion:1,hasPublishedResult:false,homeName:"Alpha",awayName:"Beta",homeKit:"#ffffff",awayKit:"#000000" },
  { id:"m1",competitionSeasonId:"m",roundNumber:2,date:"2026-10-05",kickoffTime:"19:00",court:1,homeTeamId:"c",awayTeamId:"d",stage:"regular_season",publicationState:"published",scheduleStatus:"scheduled",scheduleVersion:1,hasPublishedResult:true,homeName:"City",awayName:"Dynamo",homeKit:"#ff0000",awayKit:"#0000ff" },
  { id:"w1",competitionSeasonId:"w",roundNumber:2,date:"2026-10-07",kickoffTime:"19:00",court:1,homeTeamId:"e",awayTeamId:"f",stage:"regular_season",publicationState:"published",scheduleStatus:"scheduled",scheduleVersion:1,hasPublishedResult:false,homeName:"Echo",awayName:"Foxtrot",homeKit:null,awayKit:null },
];

test("fixture filters keep nights separate and sort time then court",()=>{
  assert.deepEqual(filterAdminFixtures(fixtures,{editionId:"m",round:"all",date:"",search:""}).map(f=>f.id),["m1","m2"]);
  assert.deepEqual(filterAdminFixtures(fixtures,{editionId:"m",round:"2",date:"2026-10-05",search:"beta"}).map(f=>f.id),["m2"]);
});
test("original and proposed comparison retains cancellation and changed fields",()=>{
  const diff=fixtureDiff(fixtures[0],{operation:"cancel",fixtureId:"m2",expectedFixtureVersion:1,reason:"Team withdrew"});
  assert.equal(diff.operation,"cancel");assert.equal(diff.proposed,null);assert.equal(diff.original?.court,2);
});
test("JSON upload rejects malformed versions and flags competition mismatch",()=>{
  assert.throws(()=>parseFixtureChangeUpload('{'),/Malformed/);
  assert.throws(()=>parseFixtureChangeUpload({schemaVersion:2}),/Unsupported/);
  const upload=parseFixtureChangeUpload({schemaVersion:1,competition:{night:"monday",season:"S",competitionSeasonId:"11111111-1111-4111-8111-111111111111"},title:"Test",changes:[{operation:"cancel",fixtureId:"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",expectedFixtureVersion:1,reason:"Test"}]});
  const context={competitionSeasonId:"22222222-2222-4222-8222-222222222222",night:"wednesday",season:"S",lifecycle:"active",competitions:[],competitionSeasons:[],fixtures:[],teams:[],preferences:[],notes:[]} satisfies FixtureChangeContext;
  assert.ok(validateFixtureChanges(upload,context).some(m=>m.code==="competition_mismatch"));
});
test("migration inactive state has a clear administrator message",()=>assert.equal(new FixturesSetupInactiveError().message,"Fixtures setup is not active yet."));
test("fixture UI remains browser-only and does not load knockout JSON",()=>{
  const page=readFileSync("src/app/admin/fixtures/page.tsx","utf8"),manager=readFileSync("src/app/admin/fixtures/FixturesManager.tsx","utf8"),actions=readFileSync("src/lib/admin/fixtures-actions.ts","utf8"),data=readFileSync("src/lib/admin/fixtures-data.ts","utf8");
  assert.match(page,/AdminAuthGuard/);assert.match(data,/\.eq\("stage", "regular_season"\)/);assert.doesNotMatch(`${page}${manager}${actions}${data}`,/season-2026-s1|monday-fixtures\.json|wednesday-fixtures\.json/);
  assert.doesNotMatch(`${page}${manager}${actions}${data}`,/use server|service_role|SUPABASE_SERVICE/);
  assert.match(data,/locationEditionIds/);assert.match(data,/fixtures: occupancyFixtures/);
});
test("production migration diagnostics are read-only and credential-free",()=>{
  for(const file of ["supabase/production/fixture_change_preflight.sql","supabase/production/fixture_change_postflight.sql"]){const sql=readFileSync(file,"utf8");assert.doesNotMatch(sql,/\b(insert|update|delete|truncate|create|alter|drop|grant|revoke)\b/i);assert.doesNotMatch(sql,/service_role|secret_key|password|token/i)}
});
