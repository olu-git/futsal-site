import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync("src/app/globals.css", "utf8");
const teams = readFileSync("src/app/admin/teams/TeamsManager.tsx", "utf8");
const results = readFileSync("src/app/admin/results/ResultsManager.tsx", "utf8");
const form = readFileSync("src/components/EnquiryForm.tsx", "utf8");

test("disabled buttons do not imply loading unless explicitly busy", () => {
  assert.match(css, /button:disabled \{ cursor: not-allowed;/);
  assert.match(css, /button\[aria-busy="true"\]:disabled \{ cursor: progress;/);
  assert.doesNotMatch(css, /cursor:\s*wait/);
});

test("Save Team marks only a real pending save as busy", () => {
  assert.match(teams, /disabled=\{pending\|\|errors\.length>0\} aria-busy=\{pending\} onClick=\{save\}/);
  assert.match(results, /<button disabled aria-busy="true">Retry Snapshot Refresh<\/button>/);
  assert.match(form, /disabled=\{status === "sending"\} aria-busy=\{status === "sending"\}/);
});
