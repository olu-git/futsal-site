import assert from "node:assert/strict";
import test from "node:test";
import type { Session } from "@supabase/supabase-js";
import { resolveAdminAccess, safeAdminReturnPath } from "../src/lib/admin/auth";
import { CURRENT_SEASON_SELECT } from "../src/lib/admin/results-data";
import { SUPABASE_AUTH_OPTIONS } from "../src/lib/supabase/browser";

const session = { user: { id: "admin-user" } } as Session;

test("static authentication guard reports an unauthenticated session", () => {
  assert.equal(resolveAdminAccess(null, null), "unauthenticated");
});
test("administrator RPC false denies and signs out through the guard state", () => {
  assert.equal(resolveAdminAccess(session, false), "denied");
});
test("administrator RPC true authorises the session", () => {
  assert.equal(resolveAdminAccess(session, true), "authorised");
});
test("administrator RPC failure reports Supabase unavailable", () => {
  assert.equal(resolveAdminAccess(session, null, true), "unavailable");
});
test("session persistence is explicitly enabled in the browser client", () => {
  assert.deepEqual(SUPABASE_AUTH_OPTIONS, { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true });
});
test("login only returns to local admin routes", () => {
  assert.equal(safeAdminReturnPath("/admin/results/?round=4"), "/admin/results/?round=4");
  assert.equal(safeAdminReturnPath("//example.com/admin"), "/admin");
  assert.equal(safeAdminReturnPath("/monday-night"), "/admin");
});
test("results season selector uses the applied starts_on and ends_on schema", () => {
  assert.match(CURRENT_SEASON_SELECT, /starts_on/);
  assert.match(CURRENT_SEASON_SELECT, /ends_on/);
  assert.doesNotMatch(CURRENT_SEASON_SELECT, /start_date|end_date/);
});
