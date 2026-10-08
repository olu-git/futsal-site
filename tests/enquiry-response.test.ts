import assert from "node:assert/strict";
import test from "node:test";
import { settleEnquiryResponse } from "../src/lib/enquiry-response";

test("a replaced form cannot deliver its delayed success to the current form", async () => {
  let finish!: (value: Response) => void;
  const request = new Promise<Response>(resolve => { finish = resolve; });
  let mounted = true;
  let successes = 0;
  let errors = 0;
  const pending = settleEnquiryResponse(() => request, () => mounted, () => successes++, () => errors++);
  mounted = false; // close dialog or switch registration tab
  finish(Response.json({ success: true }));
  await pending;
  assert.equal(successes, 0);
  assert.equal(errors, 0);
  await settleEnquiryResponse(() => Promise.resolve(Response.json({ success: true })), () => true, () => successes++, () => errors++);
  assert.equal(successes, 1); // the replacement's own response still works
});

test("closing a form while its response body is pending also suppresses callbacks", async () => {
  let finish!: (value: unknown) => void;
  const body = new Promise(resolve => { finish = resolve; });
  let mounted = true;
  let callbacks = 0;
  const response = { ok: true, json: () => body } as Response;
  const pending = settleEnquiryResponse(() => Promise.resolve(response), () => mounted, () => callbacks++, () => callbacks++);
  await Promise.resolve();
  mounted = false;
  finish({ success: true });
  await pending;
  assert.equal(callbacks, 0);
});

test("failures report only to the active form and never report success", async () => {
  for (const request of [
    () => { throw new Error("Request setup failed"); },
    () => Promise.reject(new Error("Timeout")),
    () => Promise.resolve(Response.json({ success: false })),
    () => Promise.resolve(Response.json({ success: true }, { status: 503 })),
    () => Promise.resolve(new Response("Unavailable", { status: 502 })),
  ]) {
    let successes = 0;
    let errors = 0;
    await settleEnquiryResponse(request, () => false, () => successes++, () => errors++);
    assert.equal(errors, 0);
    await settleEnquiryResponse(request, () => true, () => successes++, () => errors++);
    assert.equal(errors, 1);
    assert.equal(successes, 0);
  }
});
