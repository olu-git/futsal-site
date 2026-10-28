import assert from "node:assert/strict";
import test from "node:test";
import { createClient } from "@supabase/supabase-js";
import { beginPasswordRecovery, INVALID_RECOVERY, saveRecoveredPassword } from "../src/lib/admin/password-recovery";

function fixture() {
  const user = { id: "synthetic-admin", email: "admin@example.invalid", aud: "authenticated", role: "authenticated" };
  const token = [Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"),
    Buffer.from(JSON.stringify({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url"),
    Buffer.from("synthetic-signature").toString("base64url")].join(".");
  const session = { access_token: token, refresh_token: "synthetic-refresh", token_type: "bearer", expires_in: 3600, user };
  const state = { admin: true, invalidUser: false, invalidLink: false, rejectUpdate: false, checks: 0, writes: 0, verifications: 0 };
  const client = createClient("https://recovery-test.invalid", "sb_publishable_synthetic", {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: async (input, init) => {
      const url = new URL(String(input));
      const method = init?.method ?? "GET";
      if (url.pathname === "/auth/v1/verify") {
        state.verifications++;
        assert.equal(JSON.parse(String(init?.body)).type, "recovery");
        return Response.json(state.invalidLink ? { code: "otp_expired", msg: "Expired" } : session, { status: state.invalidLink ? 403 : 200 });
      }
      if (url.pathname === "/rest/v1/rpc/is_fis_admin") return Response.json(state.admin);
      if (url.pathname === "/auth/v1/user" && method === "GET") {
        state.checks++;
        return Response.json(state.invalidUser ? { code: "session_not_found", msg: "Expired" } : user, { status: state.invalidUser ? 401 : 200 });
      }
      if (url.pathname === "/auth/v1/user" && method === "PUT") {
        state.writes++;
        assert.equal(JSON.parse(String(init?.body)).password, "Synthetic-new-password-123!");
        return Response.json(state.rejectUpdate ? { code: "weak_password", error_code: "weak_password", msg: "Policy rejection", weak_password: { reasons: ["length"] } } : user, { status: state.rejectUpdate ? 422 : 200 });
      }
      assert.fail(`Unexpected recovery request: ${method} ${url.pathname}`);
    } },
  });
  const hashUrl = new URL("https://site.invalid/admin/reset-password/?token_hash=synthetic-hash&type=recovery");
  const implicitUrl = new URL(`https://site.invalid/admin/reset-password/#type=recovery&access_token=${token}&refresh_token=synthetic-refresh`);
  return { client, state, hashUrl, implicitUrl, session };
}

test("recovery token hashes and current implicit links establish verified admin sessions before updating", async () => {
  for (const kind of ["hashUrl", "implicitUrl"] as const) {
    const f = fixture();
    const id = await beginPasswordRecovery(f.client, f[kind]);
    assert.equal(id, "synthetic-admin");
    assert.equal(f.state.writes, 0);
    const checks = f.state.checks;
    await saveRecoveredPassword(f.client, id, "Synthetic-new-password-123!");
    assert.ok(f.state.checks > checks);
    assert.equal(f.state.writes, 1);
  }
});

test("direct visits, login tokens and URL errors cannot reuse an existing signed-in session", async () => {
  const f = fixture();
  await f.client.auth.setSession(f.session);
  for (const suffix of ["", "#type=signup&access_token=x&refresh_token=y", "?code=unrelated-code", "?type=email&token_hash=x", "#error=access_denied&error_code=otp_expired"]) {
    await assert.rejects(beginPasswordRecovery(f.client, new URL("https://site.invalid/admin/reset-password/" + suffix)), { message: INVALID_RECOVERY });
  }
  assert.equal(f.state.writes, 0);
  assert.equal(f.state.verifications, 0);
});

test("expired recovery links and non-admin sessions do not unlock password updates", async () => {
  const expired = fixture(); expired.state.invalidLink = true;
  await assert.rejects(beginPasswordRecovery(expired.client, expired.hashUrl), { message: INVALID_RECOVERY });
  const denied = fixture(); denied.state.admin = false;
  await assert.rejects(beginPasswordRecovery(denied.client, denied.implicitUrl), /does not have FIS administrator access/);
  assert.equal(expired.state.writes + denied.state.writes, 0);
});

test("revoked sessions, changed identities and removed admin access are rechecked before update", async () => {
  for (const failure of ["expired", "identity", "admin"]) {
    const f = fixture(); const id = await beginPasswordRecovery(f.client, f.hashUrl);
    if (failure === "expired") f.state.invalidUser = true;
    if (failure === "admin") f.state.admin = false;
    await assert.rejects(saveRecoveredPassword(f.client, failure === "identity" ? "different-user" : id, "Synthetic-new-password-123!"));
    assert.equal(f.state.writes, 0);
  }
});

test("password validation and server policy failures allow a safe retry", async () => {
  const f = fixture(); const id = await beginPasswordRecovery(f.client, f.hashUrl);
  for (const password of ["", "short", "        "]) await assert.rejects(saveRecoveredPassword(f.client, id, password), /at least 8/);
  assert.equal(f.state.writes, 0);
  f.state.rejectUpdate = true;
  await assert.rejects(saveRecoveredPassword(f.client, id, "Synthetic-new-password-123!"), /stronger password/);
  f.state.rejectUpdate = false;
  await saveRecoveredPassword(f.client, id, "Synthetic-new-password-123!");
  assert.equal(f.state.writes, 2);
});
